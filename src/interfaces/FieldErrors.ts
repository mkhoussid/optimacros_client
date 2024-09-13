export interface ElementError {
	_id: string;
	fieldErrors: string;
}

export type FieldErrors = string[] | ElementError[];
