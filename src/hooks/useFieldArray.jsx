import { useCallback, useRef, useState } from 'react';

/**
 * @name useFieldArray
 * @description
 *
 * @author Timothée Simon-Franza
 */
const useFieldArray = ({ formRef, name }) => {
	const {
		fieldsRef,
	} = formRef;
	const [fields, setFields] = useState([]);
	const indexRef = useRef(0);

	/**
	 *
	 * @returns
	 */
	const getFieldsValues = () => ([]);

	/**
	 *
	 * @param {*} values
	 * @param {*} index
	 * @param {*} parentName
	 */
	const registerFieldArray = useCallback((values, parentName = '', focus = false) => {
		values.forEach((value) => {
			const inputName = `${parentName || name}.${indexRef.current}`;
			indexRef.current++;

			const field = {
				...fieldsRef[inputName],
				name: inputName,
				id: inputName,
				value,
			};

			fieldsRef[inputName] = { ...field, ref: { name: inputName } };
			setFields([...fields, field]);

			if (focus) {
				// @TODO: implement this.
				// fieldsRef[inputName].ref.focus();
			}
		});
	}, [name, fieldsRef, fields]);

	/**
	 *
	 * @param {*} value
	 */
	const append = useCallback((value) => {
		const appendValue = Array.isArray(value) ? value : [value];

		registerFieldArray(appendValue, undefined, true);
	}, [registerFieldArray]);

	const remove = useCallback((toRemove) => {
		const updatedFieldsState = fields.filter((field) => field !== toRemove);
		setFields(updatedFieldsState);
	}, [fields]);

	return {
		fields,
		getFieldsValues,
		append,
		remove,
	};
};

export default useFieldArray;
