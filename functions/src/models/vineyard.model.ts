export interface Vineyard {
  id: string;
  name: string;
  address: string;
  location: any;
}

export interface SharedVineyard extends Vineyard {
  owner: string;
}
