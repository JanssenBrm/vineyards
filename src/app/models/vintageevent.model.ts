export enum VintageEvent {
  'FIRST_FERMENTATION' = 'First Fermentation',
  'PRESSING' = 'Pressed',
  'RACKING' = 'Racked',
  'RESTING' = 'Rest',
  'TESTING' = 'Test',
  'BOTTLING' = 'Bottled',
  'TASTING' = 'Tasted',
}

export const SINGLE_DATES = [
  VintageEvent.PRESSING,
  VintageEvent.RACKING,
  VintageEvent.BOTTLING,
  VintageEvent.TASTING,
  VintageEvent.TESTING,
];

export const VINTAGEEVENT_COLORS = [
  'rgb(255, 205, 86)',
  'rgb(255, 159, 64)',
  'rgb(255, 99, 132)',
  'rgb(75, 192, 192)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(56,128,255)',
];
