import axios, { AxiosError } from 'axios';

export const httpClient = async <T>({
	onFail,
	onSuccess,
	onPending,
	onFinally,
	...args
}: {
	url: string;
	method: string;
	data?: Record<string, any>;
	params?: Record<string, any>;
	onFinally?: () => void;
	onPending?: () => void;
	onFail?: (err: AxiosError) => void;
	onSuccess?: () => void;
}): Promise<T> => {
	try {
		onPending?.();

		const result = (
			await axios({
				...args,
				baseURL: import.meta.env.VITE_BE_URL,
			})
		).data as Promise<T>;

		onSuccess?.();

		return result;
	} catch (err) {
		console.log('err in httpClient', err);
		onFail?.(err as AxiosError);

		throw err;
	} finally {
		onFinally?.();
	}
};
