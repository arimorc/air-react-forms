import PropTypes from 'prop-types';
import { forwardRef, useImperativeHandle } from 'react';
import { FormProvider, useForm, useRadioButtonGroup } from '../../src';

/**
 * @name RadioButtonGroupTestForm
 * @description A component used to test the useRadioButtonGroup hook.
 *
 * @author Timothée Simon-Franza
 *
 * @param {*} param0
 */
const RadioButtonGroupTestForm = forwardRef(({ defaultValue, radioButtonGroupName, validationRules }, ref) => {
	const useFormResults = useForm({ validateOnChange: true });
	const { formContext, unitTestingExports: { getRadioButtonGroupValue } } = useFormResults;
	const { register } = useRadioButtonGroup({
		name: radioButtonGroupName,
		rules: validationRules,
		defaultValue,
	}, formContext);

	useImperativeHandle(ref, () => ({
		// eslint-disable-next-line require-jsdoc
		getUseFormResults() {
			return useFormResults;
		},

		// eslint-disable-next-line require-jsdoc
		getContext() {
			return formContext;
		},

		// eslint-disable-next-line require-jsdoc
		getRadioButtonGroupValue(radioButtonGroup) {
			return getRadioButtonGroupValue(radioButtonGroup);
		},
	}));

	return (
		<FormProvider context={formContext}>
			<div>
				<input data-testid={`${radioButtonGroupName}-one`} {...register({ value: 'one' })} />
				<label htmlFor={`${radioButtonGroupName}-one`}>One</label>
			</div>
			<div>
				<input data-testid={`${radioButtonGroupName}-two`} {...register({ value: 'two' })} />
				<label htmlFor={`${radioButtonGroupName}-two`}>Two</label>
			</div>
			<div>
				<input data-testid={`${radioButtonGroupName}-three`} {...register({ value: 'three' })} />
				<label htmlFor={`${radioButtonGroupName}-three`}>Three</label>
			</div>
		</FormProvider>
	);
});

RadioButtonGroupTestForm.propTypes = {
	defaultValue: PropTypes.string,
	radioButtonGroupName: PropTypes.string.isRequired,
	validationRules: PropTypes.object,
};

RadioButtonGroupTestForm.defaultProps = {
	defaultValue: '',
	validationRules: {},
};

export default RadioButtonGroupTestForm;
