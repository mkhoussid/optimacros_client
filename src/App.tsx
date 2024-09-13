import * as React from 'react';
import './styles.css';
import { FieldName } from './enums/FieldName';
import { CreateData } from './interfaces/CreateData';
import { Vehicle } from './interfaces/Vehicle';
import { httpClient } from './services/httpClient';
import { ElementError, FieldErrors } from './interfaces/FieldErrors';

const getDefaultEditData = ({ brand, model, year, price }: Vehicle) => ({
	[FieldName.Brand]: brand,
	[FieldName.Model]: model,
	[FieldName.Year]: year,
	[FieldName.Price]: price,
});
const VehicleElement = React.memo<{
	vehicle: Vehicle;
	setVehicles: (vehicles: Vehicle[]) => void;
	errors: FieldErrors;
	setErrors: (errors: FieldErrors) => void;
}>(({ vehicle, setVehicles, errors, setErrors }) => {
	const vehicleId = vehicle._id;

	const [isEditMode, setIsEditMode] = React.useState(false);
	const [isUpdateLoading, setIsUpdateLoading] = React.useState(false);

	const [editData, setEditData] = React.useState<CreateData>({
		[FieldName.Brand]: '',
		[FieldName.Model]: '',
		[FieldName.Year]: '',
		[FieldName.Price]: '',
	});

	React.useEffect(() => {
		setEditData(getDefaultEditData(vehicle));
	}, [vehicle]);

	const elementError = React.useMemo(
		(): ElementError =>
			errors.find((entry) => typeof entry !== 'string' && entry._id === vehicleId) as ElementError,
		[errors],
	);

	const getFieldClassName = React.useCallback(
		(field: FieldName) => {
			if (elementError?._id === vehicleId && elementError.fieldErrors.includes(field)) {
				return 'errorField';
			}
		},
		[elementError],
	);

	const handleChange = React.useCallback(
		({ target: { value, name } }: React.ChangeEvent<HTMLInputElement>) =>
			setEditData((editData) => ({ ...editData, [name]: value })),
		[],
	);

	const handleToggleIsEditMode = React.useCallback(
		(isEditMode: boolean) => () => {
			setIsEditMode(isEditMode);
		},
		[],
	);

	const handleUpdate = React.useCallback(async () => {
		const { vehicles } = await httpClient<{ vehicles: Vehicle[] }>({
			url: '/api/vehicles/update',
			method: 'put',
			data: { vehicleId, ...editData },
			onPending: () => {
				setIsUpdateLoading(true);
			},
			onFail: (error) => {
				setErrors((error.response?.data as { errors?: string[] })?.errors ?? []);
			},
			onFinally: () => {
				setIsUpdateLoading(false);
			},
			onSuccess: () => {
				setIsEditMode(false);
			},
		});

		setVehicles(vehicles);
		setIsUpdateLoading(false);
	}, [editData]);

	const handleDelete = React.useCallback(async () => {
		setIsUpdateLoading(true);

		const { vehicles } = await httpClient<{ vehicles: Vehicle[] }>({
			url: '/api/vehicles/delete',
			method: 'delete',
			params: { vehicleId },
		});

		setVehicles(vehicles);
		setIsUpdateLoading(false);
	}, []);

	if (isEditMode) {
		return (
			<div className='editContainer'>
				{Object.values(FieldName).map((field) => {
					return (
						<input
							defaultValue={vehicle[field]}
							placeholder={field}
							name={field}
							onChange={handleChange}
							className={getFieldClassName(field)}
						/>
					);
				})}
				<div>
					<button disabled={isUpdateLoading} onClick={handleToggleIsEditMode(false)}>
						cancel
					</button>
					<button disabled={isUpdateLoading} onClick={handleUpdate}>
						save
					</button>
				</div>
			</div>
		);
	}

	const { model, brand, year, price } = vehicle;
	return (
		<div>
			<div>brand: {brand}</div>
			<div>model: {model}</div>
			<div>price: {price}</div>
			<div>year: {year}</div>
			<div>
				<button disabled={isUpdateLoading} onClick={handleDelete}>
					delete
				</button>
				<button disabled={isUpdateLoading} onClick={handleToggleIsEditMode(true)}>
					edit
				</button>
			</div>
		</div>
	);
});

const getDefaultCreateData = (): CreateData => ({
	[FieldName.Brand]: '',
	[FieldName.Model]: '',
	[FieldName.Year]: '',
	[FieldName.Price]: '',
});
const App = React.memo(() => {
	const [isCreateLoading, setIsCreateLoading] = React.useState(false);
	const [errors, setErrors] = React.useState<FieldErrors>([]);
	const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);

	const [createData, setCreateData] = React.useState<CreateData>(getDefaultCreateData());

	const handleChange = React.useCallback(
		(field: FieldName) =>
			({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
				setCreateData((createData) => ({ ...createData, [field]: value })),
		[],
	);

	const handleCreate = React.useCallback(async () => {
		// TODO add frontend validation as well to get rid of lag

		if (!isCreateLoading) {
			const { vehicles } = await httpClient<{ vehicles: Vehicle[] }>({
				url: '/api/vehicles/create',
				method: 'post',
				data: createData,
				onPending: () => {
					setIsCreateLoading(true);
				},
				onFinally: () => {
					setIsCreateLoading(false);
				},
				onSuccess: () => {
					setCreateData(getDefaultCreateData());
					setErrors([]);
				},
				onFail: (error) => {
					setErrors((error.response?.data as { errors?: string[] })?.errors ?? []);
				},
			});

			setVehicles(vehicles);
		}
	}, [createData, isCreateLoading]);

	const init = React.useCallback(async () => {
		const { vehicles } = await httpClient<{ vehicles: Vehicle[] }>({
			url: '/api/vehicles/all',
			method: 'get',
		});

		setVehicles(vehicles);
	}, []);

	React.useEffect(() => {
		init();
	}, []);

	const getClassName = React.useCallback(
		(fieldName: string) => {
			if ((errors as string[]).includes(fieldName)) {
				return 'errorField';
			}
		},
		[errors],
	);

	return (
		<div>
			<div className='createContainer'>
				{Object.entries(createData).map(([fieldName, value]) => (
					<input
						key={fieldName}
						value={value}
						placeholder={fieldName}
						onChange={handleChange(fieldName as FieldName)}
						className={getClassName(fieldName)}
					/>
				))}
				<div className='submitButton' onClick={handleCreate}>
					{isCreateLoading ? 'Loading...' : 'Submit'}
				</div>
				{vehicles.map((vehicle) => (
					<VehicleElement
						key={vehicle._id}
						setVehicles={setVehicles}
						vehicle={vehicle}
						errors={errors}
						setErrors={setErrors}
					/>
				))}
			</div>
		</div>
	);
});

export default App;
