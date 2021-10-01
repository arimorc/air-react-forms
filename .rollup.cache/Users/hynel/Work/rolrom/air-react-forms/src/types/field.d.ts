import { MutableRefObject } from 'react';
export declare type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
interface FieldErrors {
    [key: string]: string | undefined;
}
interface ValidationResults {
    [key: string]: FieldErrors;
}
export interface IField {
    id: string;
    name: string;
    rules: object;
    ref: MutableRefObject<FieldElement | undefined>;
    type?: string;
    defaultValue?: string | number;
    [key: string]: any;
}
export declare class Field implements IField {
    id: string;
    name: string;
    ref: MutableRefObject<FieldElement | undefined>;
    rules: object;
    type?: string;
    defaultValue?: string | number;
    constructor(field: IField);
    validate: () => ValidationResults;
    get value(): string | undefined;
}
export {};
