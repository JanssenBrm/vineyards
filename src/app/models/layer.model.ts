export interface Layer {
    id: string;
    label: string;
    enabled: boolean;
    url: string;
    params: any;
    click?: (data: any) => string;
}
