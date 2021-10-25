import { FC } from 'react';
import PropTypes from 'prop-types';
import { FormProviderProps } from 'types/formProviderProps';
import FormContext from '../FormContext';

/**
 * @name FormProvider
 * @description A provider enabling communication between several hooks inside a single form
 *
 * @author Yann Hodiesne
 *
 * @param {object} context The form context given by useForm
 */
const FormProvider: FC<FormProviderProps> = ({ context, children }) => (
	<FormContext.Provider value={context}>
		{children}
	</FormContext.Provider>
);

FormProvider.propTypes = {
	context: PropTypes.object.isRequired,
	children: PropTypes.node,
};

FormProvider.defaultProps = {
	children: <></>,
};

export default FormProvider;
