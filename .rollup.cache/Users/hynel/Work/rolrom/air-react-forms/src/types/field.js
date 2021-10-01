import { useRef } from 'react';
import { isEmpty } from 'lodash';
;
export class Field {
    constructor(field) {
        this.ref = useRef();
        this.validate = () => {
            if (isEmpty(this.rules) || this.ref?.current?.value === undefined) {
                return { [this.name]: {} };
            }
            const fieldErrors = {};
            Object.entries(this.rules).forEach(([rule, validator]) => {
                fieldErrors[rule] = validator(this.ref?.current?.value) || undefined;
            });
            return {
                [this.name]: Object.fromEntries(Object.entries(fieldErrors))
            };
        };
        this.name = field.name;
        this.id = field.id;
        this.ref = field.ref;
        this.type = field.type ?? 'string';
        this.rules = field.rules ?? {};
        this.defaultValue = field.defaultValue ?? '';
    }
    get value() {
        return this.ref?.current?.value ?? undefined;
    }
    ;
}
//# sourceMappingURL=field.js.map