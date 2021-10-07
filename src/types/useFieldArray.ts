import { Field, FieldProps } from './field';
import { FieldRegistrationData } from './useForm';

export interface UseFieldArrayReturnType {
	append: () => FieldProps,
	fields: { [key: string]: Field };
	register: (field: FieldRegistrationData) => FieldProps,
}
