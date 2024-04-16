import { BufferGeometry, Camera, Color, Group, InstancedMesh, Object3D, PlaneGeometry, Vector3 } from "three";
import { CloudPart } from "./sky/CloudPart";
import { CircleMat } from "./sky/CircleMat";
import { Rand } from "../utils/Rand";
import { BirdPalette } from "./BirdPalette";
import { CUtils } from "../utils/CUtils";
import { CuteBirds } from "./CuteBirds";
import FastSimplexNoise from "@webvoxel/fast-simplex-noise";

export class BirdSky extends Group
{
    cloudParts:CloudPart[] = [];
    cloudLightMesh:InstancedMesh;
    cloudDarkMesh:InstancedMesh;
    windSpeedSpace:FastSimplexNoise = new FastSimplexNoise({
        frequency:0.01,
        min:1,
        max:5,
        octaves:2,
        random:Rand.rand
    });
    constructor(palette:BirdPalette)
    {
        super();
        this.renderOrder = -1000;
        const cloudParts:CloudPart[] = [];
        const nbClouds:number = 200;
        let index:number = 0 ;
        let cloudIndex:number = 0 ;
        const slope:number = Rand.fRange(.5,1) * (Rand.bool(.5)?1:-1);
        const verticalNoiseAmp:number = Rand.fRange(.2, .5);
        for( let i = 0; i < nbClouds; i++)
        {
            const bigsubparts:number = Rand.iRange(8, 50);
            const maxScale:number = 3 + bigsubparts / 5;
            const cloudLength:number = bigsubparts * .8;
            const cloudLayer:number = (i%10);
            const cloudY:number = Rand.fRange(-20, 60) - cloudLayer * 20;
            const cloudX:number = Rand.fRange(-150, 150);
            
            const frontFac:number = Rand.fRange(0.5, 1.5);
            const backFac:number = Rand.fRange(0.5, 1.5);
            for( let j:number = 0 ; j< bigsubparts; j++)
            {
                const dj:number = j / (bigsubparts - 1);
                
                const cloudPart:CloudPart = new CloudPart();
                cloudPart.index = index++;
                cloudPart.cloudIndex = cloudIndex;
                const scale:number = Rand.fRange(maxScale * .75, maxScale) * ( 0.3 + CUtils.pcurve(dj, frontFac, backFac) * 0.7 );
                cloudPart.scale.setScalar(scale);
                cloudPart.position.set(
                    cloudX + dj * cloudLength - cloudLength / 2 ,
                    cloudY + Rand.fRange(-verticalNoiseAmp, verticalNoiseAmp) + 0.5 * scale + dj * slope * cloudLength * 0.2,
                    -cloudLayer * 20,
                );
                cloudParts.push(cloudPart);
            }
            cloudIndex++;
        }
        //const nbCloudParts:number = 1000;
        /*
        for(let i = 0; i < nbCloudParts; i++)
        {
            const cloudPart:CloudPart = new CloudPart();
            cloudPart.index = i;
            cloudPart.position.set(
                Rand.fRange(-30, 30),
                Rand.fRange(-20, 20),
                Rand.iRange(0, 5) * 2,
            );

            const scale:number = 0.1 + Math.random() * 4.0;
            cloudPart.scale.setScalar(scale);
            cloudParts.push(cloudPart);
        }
        */
        const cloudPartGeom:BufferGeometry = new PlaneGeometry(1, 1);
        /*
        const cloudLightMat:CircleMat = new CircleMat({color:0xffffff});
        const cloudDarkMat:CircleMat = new CircleMat({color:palette.background});
        */
        const bgCol:Color = palette.background.clone().offsetHSL(0,0,.05);
        const bgCol2:Color = palette.background.clone().offsetHSL(0,0,-.05);
        //const bgCol2:Color = new Color().setHSL(hsl.h, hsl.s, .2);
        
        
        const cloudLightMat:CircleMat = new CircleMat({color:bgCol2});
        const cloudDarkMat:CircleMat = new CircleMat({color:bgCol});

        const cloudLightMesh:InstancedMesh = new InstancedMesh(cloudPartGeom, cloudLightMat, cloudParts.length);
        const cloudDarkMesh:InstancedMesh = new InstancedMesh(cloudPartGeom, cloudDarkMat, cloudParts.length);

        const fakeNormal:Vector3 = new Vector3(1,-1,0).normalize();
        const dummy:Object3D = new Object3D();
        for( const cloudPart of cloudParts)
        {
            dummy.position.copy(cloudPart.position);
            dummy.scale.copy(cloudPart.scale);
            dummy.updateMatrix();
            cloudLightMesh.setMatrixAt(cloudPart.index, dummy.matrix);
            dummy.scale.multiplyScalar(0.9 - ( 1/cloudPart.scale.x ) * 0.1);
            dummy.position.z += 0.5;
            //dummy.position.addScaledVector(fakeNormal, Rand.fRange(cloudPart.scale.x * 0.01,cloudPart.scale.x * .15) );
            dummy.updateMatrix();
            cloudDarkMesh.setMatrixAt(cloudPart.index, dummy.matrix);
        }
        cloudLightMesh.instanceMatrix.needsUpdate = true;
        cloudDarkMesh.instanceMatrix.needsUpdate = true;

        this.add(cloudLightMesh);
        this.add(cloudDarkMesh);

        this.rotation.z = Rand.fRange(-Math.PI * .1, Math.PI * .1);
        this.rotation.x = Math.PI * 0.1;

        this.cloudParts = cloudParts;
        this.cloudLightMesh = cloudLightMesh;
        this.cloudDarkMesh = cloudDarkMesh;
    }

    

    update(dt:number, elapsed:number)
    {
        
        this.updateCloudMeshes(dt, elapsed);
    }

    dummy:Object3D = new Object3D();
    tempV3:Vector3 = new Vector3();
    updateCloudMeshes(dt:number, elapsed:number)
    {
        for( const cloudPart of this.cloudParts)
        {
            this.localToWorld(this.tempV3.copy(cloudPart.position));
            const speed:number = this.windSpeedSpace.scaled([this.tempV3.x, this.tempV3.y, this.tempV3.z * 10]);
            cloudPart.position.x += dt * speed;
            if( cloudPart.position.x > 150)
            {
                cloudPart.position.x = -150;
            }

            this.dummy.position.copy(cloudPart.position);
            this.dummy.scale.copy(cloudPart.scale);
            this.dummy.updateMatrix();
            this.cloudLightMesh.setMatrixAt(cloudPart.index, this.dummy.matrix);

            this.dummy.scale.multiplyScalar(0.9 - ( 1/cloudPart.scale.x ) * 0.1);
            this.dummy.position.z += 0.5;
            this.dummy.updateMatrix();
            this.cloudDarkMesh.setMatrixAt(cloudPart.index, this.dummy.matrix);
        }

        this.cloudLightMesh.instanceMatrix.needsUpdate = true;
        this.cloudDarkMesh.instanceMatrix.needsUpdate = true;

    }
}