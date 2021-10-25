import { ReactNode } from 'react';
import { FormContext } from './formContext';

export type FormProviderProps = {
    context: FormContext,
    children?: ReactNode,
};
