
export enum VintageEvent {
   'FIRST_FERMENTATION' = 'First Fermentation',
   'PRESSING' = 'Pressed',
   'RACKING' = 'Racked',
   'RESTING' = 'Resting',
   'BOTTLING' = 'Bottling',
   'TASTING' = 'Tasting'
}

export const SINGLE_DATES = [VintageEvent.PRESSING, VintageEvent.RACKING, VintageEvent.BOTTLING, VintageEvent.TASTING];
