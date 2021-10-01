import { MutableRefObject } from 'react';
import { Field, FieldElement, IField } from 'types/field';
declare const useForm: () => {
    formContext: {
        fields: MutableRefObject<{
            [key: string]: Field;
        }>;
        getFieldValue: (field: Field) => string | undefined;
        register: (field: IField) => {
            ref: (ref: MutableRefObject<FieldElement>) => void;
            id: string;
            name: string;
            rules: object;
            type?: string | undefined;
            defaultValue?: string | number | undefined;
        };
    };
    register: (field: IField) => {
        ref: (ref: MutableRefObject<FieldElement>) => void;
        id: string;
        name: string;
        rules: object;
        type?: string | undefined;
        defaultValue?: string | number | undefined;
    };
};
export default useForm;
