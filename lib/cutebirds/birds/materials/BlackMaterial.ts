import { MeshBasicMaterial } from "three";

export class BlackMaterial extends MeshBasicMaterial
{
    constructor()
    {
        
        super({color: 0x000000});
        this.depthWrite = false;
    }
}