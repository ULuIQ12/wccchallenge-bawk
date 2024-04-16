import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three";

export class WhiteMaterial extends MeshBasicMaterial
{
    constructor()
    {
        const params:MeshBasicMaterialParameters = {
            transparent: true,
            depthWrite: false,
            color: 0xffffff
        };
        super(params);
    }
}