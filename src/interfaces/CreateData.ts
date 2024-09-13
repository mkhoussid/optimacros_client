import { FieldName } from 'src/enums/FieldName';

export interface CreateData {
	[FieldName.Brand]: string;
	[FieldName.Model]: string;
	[FieldName.Year]: string;
	[FieldName.Price]: string;
}
