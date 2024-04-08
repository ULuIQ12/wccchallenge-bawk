import { MeshBasicMaterial } from "three";

export class WhiteMaterial extends MeshBasicMaterial
{
    constructor()
    {
        super({color: 0xffffff});
        this.depthWrite = false;
    }
}