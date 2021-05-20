import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useFieldArray } from 'air-react-forms';

/**
 * @name FieldArray
 * @description An example of re-usable field array component
 *
 * @author Yann Hodiesne
 *
 * @param {object} fieldDefinition The definition of the field array to render
 */
const FieldArray = ({ fieldDefinition }) => {
	// The link between useFieldArray and the parent useForm is done via the FormProvider component
	// As this component is located anywhere inside the FormProvider children, it will auto-detect the form to interact with
	const { fields, register, remove, errors } = useFieldArray(fieldDefinition);

	return (
		<>
			{fields.map((field) => (
				<Fragment key={field.id}>
					<label htmlFor={field.id}>{field.name}</label>
					<div style={{ display: 'flex' }}>
						<input {...register(field)} />
						<button type="button" onClick={() => remove(field)}>remove</button>
					</div>
					{errors[field.name]?.required && <span>{errors[field.name]?.required}</span>}
				</Fragment>
			))}

			<div>
				<button type="button" onClick={register}>Add field</button>
				<button type="submit">Submit</button>
			</div>
		</>
	);
};

FieldArray.propTypes = {
	fieldDefinition: PropTypes.object.isRequired,
};

export default FieldArray;
