import { Color, Scene, Vector2, Vector3 } from "three";
import { Rand } from "../utils/Rand";
import { BeakState, Bird, LegsState, WingsState } from "./birds/Bird";
import { BirdsLine } from "./BirdsLine";
import { BirdPalette } from "./BirdPalette";
import FastSimplexNoise from "@webvoxel/fast-simplex-noise";



export class BirdScene extends Scene
{    
    palette:BirdPalette = new BirdPalette();
    //birds:Bird[] = [];
    lines:BirdsLine[] = [];

    flexDrive:FastSimplexNoise = new FastSimplexNoise({
        frequency:0.05,
        min:0,
        max:1,
        octaves:1,
        random:Rand.rand
    });

    wingsDrive:FastSimplexNoise = new FastSimplexNoise({
        frequency:0.01,
        min:0,
        max:1,
        octaves:1,
        random:Rand.rand
    });

    beakDrive:FastSimplexNoise = new FastSimplexNoise({
        frequency:0.5,
        min:0,
        max:1,
        octaves:1,
        random:Rand.rand
    });

    constructor()
    {
        super();
    }

    async init()
    {
        this.background = this.palette.background;
        const nblines:number = 4 ;
        for (let i = 0; i < nblines; i++)
        {
            const line:BirdsLine = new BirdsLine(new Vector3(-50, 0), new Vector3(50, 0));
            line.position.y = -(nblines * 5 )/2 +  i * 5;
            line.position.z = i * 2;
            this.add(line);
            this.lines.push(line);
        }

    }

    tempV30:Vector3 = new Vector3();
    update( dt:number, elapsed:number)
    {

        this.lines.forEach(line => {
            //line.update(dt, elapsedTime);
            for (let i = 0; i < line.birds.length; i++)
            {
                const bird = line.birds[i];
                bird.localToWorld(this.tempV30.set(0, 0, 0));
                this.tempV30.x += elapsed * 50.0 ;
                const flexVal:number = this.flexDrive.scaled3D(this.tempV30.x, this.tempV30.y, this.tempV30.z);
                const beakVal:number = this.beakDrive.scaled3D(this.tempV30.x, this.tempV30.y, this.tempV30.z);
                const wingVal:number = this.wingsDrive.scaled3D(this.tempV30.x, this.tempV30.y, this.tempV30.z);
                
                if( bird.legsState == LegsState.UP && flexVal<.35)
                    bird.Crouch();
                else if( bird.legsState == LegsState.DOWN && flexVal>.65)
                    bird.Stand();

                if( bird.wingsState == WingsState.UP && wingVal<.35)
                    bird.CloseWings();
                else if( bird.wingsState == WingsState.DOWN && wingVal>.65)
                    bird.OpenWings();

                if( bird.beakState == BeakState.OPEN && beakVal<.35)
                    bird.CloseBeak();
                else if( bird.beakState == BeakState.CLOSED && beakVal>.65)
                    bird.OpenBeak();
                
                bird.update(dt, elapsed);
            }
        });
    }
}