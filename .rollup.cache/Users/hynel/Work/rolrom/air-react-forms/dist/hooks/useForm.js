import { __assign } from "tslib";
import { useCallback, useRef, useState } from 'react';
import { Field } from 'types/field';
/**
 * @name useForm
 * @returns
 */
var useForm = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.validateOnChange, validateOnChange = _c === void 0 ? false : _c;
    var fields = useRef({});
    var formErrorsRef = useRef({});
    var _d = useState({
        errors: {},
    }), formState = _d[0], setFormState = _d[1];
    /**
     * @function
     * @name updateFormState
     * @description Updates the formState field with the latest data.
     *
     * @author Timothée Simon-Franza
     */
    var updateFormState = useCallback(function () {
        setFormState({ errors: formErrorsRef.current });
    }, []);
    /**
     * @function
     * @name validateField
     * @description Performs validation checks on the provided field.
     *
     * @author Timothée Simon-Franza
     *
     * @param {bool}	shouldUpdateFormState	If set to true, the state will be updated after the validation process.
     * @param {Field}	field					The field to perform the validation check on.
     */
    var validateField = useCallback(function (shouldUpdateFormState) {
        if (shouldUpdateFormState === void 0) { shouldUpdateFormState = false; }
        return function (field) {
            var _a;
            if (!((_a = fields === null || fields === void 0 ? void 0 : fields.current) === null || _a === void 0 ? void 0 : _a[field.name])) {
                return;
            }
            field.validate();
            formErrorsRef.current[field.name] = field.errors;
            if (shouldUpdateFormState) {
                updateFormState();
            }
        };
    }, [updateFormState]);
    /**
     * @function
     * @name registerField
     * @description Registers a field's reference.
     *
     * @author Timothée Simon-Franza
     *
     * @param {Field}			field	The field to update the reference of.
     * @param {FieldElement}	ref		The element to update the field's reference with.
     */
    var registerField = useCallback(function (field, ref) {
        if (field.name) {
            fields.current[field.name] = field;
            fields.current[field.name].ref.current = ref;
            validateField(false)(field);
        }
    }, [fields, validateField]);
    /**
     * @function
     * @name unregisterField
     * @description Removes the provided field from the list of controlled fields.
     *
     * @author Timothée Simon-Franza
     *
     * @param {Field} field The field to remove.
     */
    var unregisterField = useCallback(function (field) {
        var _a;
        if ((_a = fields === null || fields === void 0 ? void 0 : fields.current) === null || _a === void 0 ? void 0 : _a[field.name]) {
            delete fields.current[field.name];
        }
    }, [fields]);
    /**
     * @function
     * @name register
     * @description The method to pass down to a React JSX input to register it in the controlled form.
     *
     * @author Timothée Simon-Franza
     *
     * @param {IField} fieldData The data to use in order to register the field.
     *
     * @returns {FieldProps}
     */
    var register = useCallback(function (fieldData) {
        var _a, _b, _c;
        var field = (_b = (_a = fields === null || fields === void 0 ? void 0 : fields.current) === null || _a === void 0 ? void 0 : _a[fieldData.name]) !== null && _b !== void 0 ? _b : new Field(fieldData);
        if (!((_c = fields === null || fields === void 0 ? void 0 : fields.current) === null || _c === void 0 ? void 0 : _c[field.name])) {
            fields.current[field.name] = field;
        }
        var returnedProps = __assign(__assign({}, field), { ref: function (ref) { return (ref ? registerField(field, ref) : unregisterField(field)); } });
        if (validateOnChange) {
            returnedProps.onChange = function () { return validateField(true)(field); };
        }
        return returnedProps;
    }, [registerField, unregisterField, validateField, validateOnChange]);
    /**
     * @function
     * @name getFormValues
     * @description Returns the values of all registered fields as an object.
     *
     * @author Timothée Simon-Franza
     *
     * @returns {FormData}
     */
    var getFormValues = useCallback(function () { return (Object.values(fields.current)
        .filter(function (ref) { return ref; })
        .reduce(function (values, field) {
        var _a;
        return (__assign(__assign({}, values), (_a = {}, _a[field.name] = field.value, _a)));
    }, {})); }, []);
    /**
     * @function
     * @name validateForm
     * @description Triggers a validation check on each registered element of the form.
     *
     * @author Timothée Simon-Franza
     */
    var validateForm = useCallback(function () {
        Object.values(fields.current).forEach(function (field) {
            validateField(false)(field);
        });
    }, [validateField]);
    /**
     * @function
     * @name isFormValid
     * @description Returns whether or not the form is valid.
     *
     * @author Timothée Simon-Franza
     *
     * @returns {bool} False if one or more fields are invalid. True otherwise.
     */
    var isFormValid = useCallback(function () {
        var invalidFields = Object.values(fields.current)
            .reduce(function (acc, field) { return (field.isValid() ? acc : acc + 1); }, 0);
        return invalidFields === 0;
    }, []);
    /**
     * @function
     * @name handleSubmit
     * @description A handled method which triggers validation checks on the registered fields and calls the provided callback method if the form is valid.
     *
     * @author Timothée Simon-Franza
     *
     * @param {Function} callback The method to call if the form is valid.
     */
    var handleSubmit = useCallback(function (callback) { return function (event) {
        event === null || event === void 0 ? void 0 : event.preventDefault();
        validateForm();
        if (isFormValid()) {
            callback(getFormValues());
        }
    }; }, [getFormValues, isFormValid, validateForm]);
    return {
        formContext: {
            fields: fields.current,
            formState: formState,
            register: register,
            getFormValues: getFormValues,
            isFormValid: isFormValid,
        },
        register: register,
        handleSubmit: handleSubmit,
    };
};
export default useForm;
//# sourceMappingURL=useForm.js.map