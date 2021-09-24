import {Injectable} from '@angular/core';
import * as Color from 'color';

export const ACTION_COLLECTION = 'actions';

export enum COLOR {
    BRIX = '#800080',
    TEMP = '#F08080',
    PERCIP = '#ADD8E6',
    GDD = '#90EE90'
}

@Injectable({
    providedIn: 'root'
})
export class ColorService {

    constructor() {
    }

    /**
     * Create a lighter version of a color
     * @param color - Color to lighten
     * @param multiplier - How many times the color should be lightened
     */
    public lighten(color: COLOR, multiplier: number): string {
        let c = Color(color).hsl();
        new Array(multiplier).fill(1).forEach(() => {
            c =  c.lighten(0.5);
        });
        return c.hex();
    }

    /**
     * Create a darker version of a color
     * @param color - Color to make darker
     * @param multiplier - How many times the color should be darkened
     */
    public darken(color: COLOR, multiplier: number): string {
        let c = Color(color).hsl();
        new Array(multiplier).fill(1).forEach(() => {
            c =  c.darken(0.5);
        });
        return c.hex();
    }

}
