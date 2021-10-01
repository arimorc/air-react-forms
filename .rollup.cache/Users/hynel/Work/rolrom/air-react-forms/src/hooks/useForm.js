import { useCallback, useRef } from 'react';
import { Field } from 'types/field';
const useForm = () => {
    const fields = useRef({});
    const getFieldValue = (field) => (field.value);
    const registerField = useCallback((field, ref) => {
        if (field.name) {
            fields.current[field.name].ref.current = ref.current;
        }
    }, [fields]);
    const unregisterField = useCallback((field) => {
        if (fields.current[field.name]) {
            delete fields.current[field.name];
        }
    }, [fields]);
    const register = useCallback((field) => {
        const isInitialRegister = !fields.current[field.name];
        if (isInitialRegister) {
            fields.current[field.name] = new Field(field);
        }
        return {
            ...field,
            ref: (ref) => (ref ? registerField(field, ref) : unregisterField(field))
        };
    }, [registerField, unregisterField]);
    return {
        formContext: {
            fields,
            getFieldValue,
            register,
        },
        register,
    };
};
export default useForm;
//# sourceMappingURL=useForm.js.map