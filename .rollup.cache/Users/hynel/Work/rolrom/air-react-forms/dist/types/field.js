import { __assign } from "tslib";
import { createRef } from 'react';
import { isEmpty } from 'lodash';
var Field = /** @class */ (function () {
    /**
     *
     */
    function Field(field) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        /**
         * @function
         * @name validate
         * @description Performs a validation check on the field, using its rules field's validators.
         *
         * @author Timothée Simon-Franza
         */
        this.validate = function () {
            var _a, _b;
            if (isEmpty(_this.rules) || ((_b = (_a = _this.ref) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.value) === undefined) {
                return;
            }
            Object.entries(_this.rules).forEach(function (_a) {
                var _b, _c;
                var rule = _a[0], validator = _a[1];
                _this.errors[rule] = validator((_c = (_b = _this.ref) === null || _b === void 0 ? void 0 : _b.current) === null || _c === void 0 ? void 0 : _c.value) || undefined;
            });
        };
        /**
         * @function
         * @name isValid
         * @description Indicates if the field is valid based on its last validation check.
         *
         * @author Timothée Simon-Franza
         *
         * @returns {boolean} True if no validation error is present, false otherwise.
         */
        this.isValid = function () {
            var foundErrors = Object.values(_this.errors).reduce(function (acc, value) { return (value !== undefined ? acc + 1 : acc); }, 0);
            return foundErrors === 0;
        };
        this.name = field.name;
        this.id = field.id;
        this.ref = (_a = field.ref) !== null && _a !== void 0 ? _a : createRef();
        this.type = (_b = field.type) !== null && _b !== void 0 ? _b : 'string';
        this.rules = (_c = field.rules) !== null && _c !== void 0 ? _c : {};
        this.errors = (_d = field.errors) !== null && _d !== void 0 ? _d : Object.keys(field.rules).reduce(function (obj, key) {
            var _a;
            return (__assign(__assign({}, obj), (_a = {}, _a[key] = undefined, _a)));
        }, {});
        this.defaultValue = (_e = field.defaultValue) !== null && _e !== void 0 ? _e : '';
    }
    Object.defineProperty(Field.prototype, "value", {
        /**
         * @property
         * @name value
         * @description The value of the field's linked reference.
         *
         * @author Timothée Simon-Franza
         *
         * @returns {FieldValue | undefined}
         */
        get: function () {
            var _a, _b, _c;
            return (_c = (_b = (_a = this.ref) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : undefined;
        },
        enumerable: false,
        configurable: true
    });
    return Field;
}());
export { Field };
//# sourceMappingURL=field.js.map