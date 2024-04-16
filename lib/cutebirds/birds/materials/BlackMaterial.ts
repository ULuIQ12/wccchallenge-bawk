import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three";

export class BlackMaterial extends MeshBasicMaterial
{
    constructor()
    {
        const params:MeshBasicMaterialParameters = {
            transparent: true,
            depthWrite: false,
            color: 0x000000
        };
        super(params);
        
    }
}