import PropTypes from 'prop-types';
import { forwardRef, useImperativeHandle } from 'react';
import { FormProvider, useCheckboxGroup, useForm } from '../../src';

/**
 * @name CheckboxGroupTestForm
 * @description A component used to test the useCheckboxGroup hook.
 *
 * @author Timothée Simon-Franza
 *
 * @param {*} param0
 */
const CheckboxGroupTestForm = forwardRef(({ defaultValues, checkboxGroupName, validationRules }, ref) => {
	const useFormResults = useForm({ validateOnChange: true });
	const { formContext, unitTestingExports: { getCheckboxGroupValues } } = useFormResults;
	const { register } = useCheckboxGroup({
		name: checkboxGroupName,
		rules: validationRules,
		defaultValues,
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
		getCheckboxGroupValues(checkboxGroup) {
			return getCheckboxGroupValues(checkboxGroup);
		},
	}));

	return (
		<FormProvider context={formContext}>
			<div>
				<input data-testid={`${checkboxGroupName}-one`} {...register({ value: 'one' })} />
				<label htmlFor={`${checkboxGroupName}-one`}>One</label>
			</div>
			<div>
				<input data-testid={`${checkboxGroupName}-two`} {...register({ value: 'two' })} />
				<label htmlFor={`${checkboxGroupName}-two`}>Two</label>
			</div>
			<div>
				<input data-testid={`${checkboxGroupName}-three`} {...register({ value: 'three' })} />
				<label htmlFor={`${checkboxGroupName}-three`}>Three</label>
			</div>
		</FormProvider>
	);
});

CheckboxGroupTestForm.propTypes = {
	defaultValues: PropTypes.object,
	checkboxGroupName: PropTypes.string.isRequired,
	validationRules: PropTypes.object,
};

CheckboxGroupTestForm.defaultProps = {
	defaultValues: undefined,
	validationRules: {},
};

export default CheckboxGroupTestForm;
