import { FC } from 'react';
import { FormProviderProps } from 'types/formProviderProps';
import FormContext from '../FormContext';

/**
 * @name FormProvider
 * @description A provider enabling communication between several hooks inside a single form
 *
 * @author Yann Hodiesne
 *
 * @param {FormProviderProps}	props			The props to pass to this component.
 * @param {IFormContext}		props.context	The form context given by useForm
 * @param {*}					props.children	The component's children.
 */
const FormProvider: FC<FormProviderProps> = ({ context, children }: FormProviderProps) => (
	<FormContext.Provider value={context}>
		{children}
	</FormContext.Provider>
);

export default FormProvider;
