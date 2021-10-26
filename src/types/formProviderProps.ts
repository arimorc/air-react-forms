import { ReactNode } from 'react';
import { IFormContext } from './form';

export type FormProviderProps = {
    context: IFormContext,
    children?: ReactNode,
};
