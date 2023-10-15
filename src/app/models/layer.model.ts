export interface Layer {
  id: string;
  label: string;
  enabled: boolean;
  url: string;
  click?: (data: any) => string;
}
