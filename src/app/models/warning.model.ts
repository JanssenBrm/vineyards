export interface Warning {
    date: string;
    type: WARNING_TYPE;
    description: string;
}

export enum WARNING_TYPE {
    FROST
};
