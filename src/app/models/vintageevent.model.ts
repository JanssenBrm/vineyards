
export enum VintageEvent {
   'FIRST_FERMENTATION' = 'First Fermentation',
   'PRESSING' = 'Pressed',
   'RACKING' = 'Racked',
   'RESTING' = 'Rest',
   'TESTING' = 'Test',
   'BOTTLING' = 'Bottled',
   'TASTING' = 'Tasted'
}

export const SINGLE_DATES = [VintageEvent.PRESSING, VintageEvent.RACKING, VintageEvent.BOTTLING, VintageEvent.TASTING, VintageEvent.TESTING];
