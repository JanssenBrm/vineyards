export interface VineyardBaseNote {
  id: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
}

export interface VineyardNote extends VineyardBaseNote {
  html: string;
}
