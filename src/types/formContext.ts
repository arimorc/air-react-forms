import { Ref } from 'react';

export type FormContext = {
    validateOnChange?: Function,
    refreshFormState?: Function,
    formErrorsRef: Ref<unknown>,
    fields: unknown,
};
