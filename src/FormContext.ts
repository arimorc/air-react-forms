import { createContext } from 'react';
import { IFormContext } from 'types/form';

const FormContext = createContext<IFormContext>(null);

export default FormContext;
