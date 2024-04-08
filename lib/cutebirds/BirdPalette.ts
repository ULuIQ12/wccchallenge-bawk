import { Color } from "three";
import { Rand } from "../utils/Rand";

export class BirdPalette
{
    static colors:Color[] = [
        new Color(0x448aff),
        new Color(0x1565c0),
        new Color(0x009688),
        new Color(0x8bc34a),
        new Color(0xffc107),
        new Color(0xff9800),
        new Color(0xf44336),
        new Color(0xad1457),
    ];

    background:Color;

    constructor()
    {
        this.background = Rand.option(BirdPalette.colors);
    }
}