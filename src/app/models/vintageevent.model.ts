export enum VintageEvent {
  'ALCOHOLIC_FERMENTATION' = 'ALCOHOLIC_FERMENTATION',
  'MALO_FERMENTATION' = 'MALOLACTIC_FERMENTATION',
  'PRESSING' = 'PRESSING',
  'RACKING' = 'RACKING',
  'RESTING' = 'RESTING',
  'TESTING' = 'TESTING',
  'FINING' = 'FINING',
  'BOTTLING' = 'BOTTLING',
  'TASTING' = 'TASTING',
}

export const SINGLE_DATES = [
  VintageEvent.PRESSING,
  VintageEvent.RACKING,
  VintageEvent.BOTTLING,
  VintageEvent.TASTING,
  VintageEvent.TESTING,
  VintageEvent.FINING,
];

export const VINTAGEEVENT_COLORS = [
  'rgb(255, 205, 86)',
  'rgb(255, 159, 64)',
  'rgb(255, 99, 132)',
  'rgb(75, 192, 192)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(56,128,255)',
  'rgb(140,220,50)',
  'rgb(90,43,185)',
];
