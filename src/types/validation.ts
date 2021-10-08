import { FieldValue } from './formElement';

/**
 * @type
 * @name ValidationValue
 * @description The value returned by a validation method.
 * @author Timothée Simon-Franza
 */
export type ValidationValue = string | undefined;

/**
 * @type
 * @name ValidationRules
 * @description Type used to define validation rules form a form element.
 * @author Timothée Simon-Franza
 */
export type ValidationRules = { [key: string]: (value: FieldValue) => ValidationValue }

export type FieldErrors = { [key: string]: ValidationValue }
