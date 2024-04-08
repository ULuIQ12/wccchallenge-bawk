import { Box3, BufferGeometry, Camera, Group, Mesh, MeshBasicMaterial, Path, Shape, ShapeGeometry, Vector2, Vector3 } from "three";
import { Bird } from "./birds/Bird";
import { Rand } from "../utils/Rand";
import { CuteBirds } from "./CuteBirds";

export class BirdsLine extends Group
{
    static BlackMat:MeshBasicMaterial = new MeshBasicMaterial({color:0x000000});
    lineShape:Shape|undefined;
    lineMesh:Mesh|undefined;
    lineWidth:number = 0.1;
    birds:Bird[] = [];
    //flexDrive:N
    constructor(start:Vector3, end:Vector3)
    {
        super();

        this.lineShape = new Shape();
        const ls:Shape = this.lineShape;
        const dx:number = end.x - start.x;
        const curveFactor:number = Rand.fRange(0.05, 0.15);
        ls.moveTo(start.x, start.y);
        ls.quadraticCurveTo(start.x + dx * 0.5, start.y - dx * curveFactor, end.x, end.y);
        ls.moveTo(end.x, end.y + this.lineWidth);
        ls.quadraticCurveTo(start.x + dx * 0.5, start.y - dx * curveFactor + this.lineWidth, start.x, start.y + this.lineWidth);
        ls.closePath();

        const lineCurve:Path = new Path();
        lineCurve.moveTo(start.x, start.y);
        lineCurve.quadraticCurveTo(start.x + dx * 0.5, start.y - dx * curveFactor, end.x, end.y);
        

        let px:number = 0 ;
        let relSize:number = 0 ;
        let birdSpan:number =0;
        const v2pos:Vector2 = new Vector2();

        while( px < 1 )
        {
            if( Rand.bool(.9))
            {
                const bird:Bird = new Bird();
                birdSpan = bird.span;
                
                relSize = (birdSpan) / dx;
                px += relSize * .5;
                if( px > 1)
                    break;

                this.add(bird);
                lineCurve.getPointAt(px , v2pos);
                bird.position.set(
                    v2pos.x, 
                    v2pos.y,
                    0
                )
                this.birds.push(bird);
                px += relSize * .5;
            }
            else 
            {
                px += Rand.fRange(.05, .1);
            }
        }

        const sg:BufferGeometry = new ShapeGeometry(ls, 32);
        this.lineMesh = new Mesh(sg, BirdsLine.BlackMat);
        this.add(this.lineMesh);
    }

    update(dt:number, elapsedTime:number)
    {
        /*
        const cam:Camera = CuteBirds.instance.camera as Camera;
        this.birds.forEach(bird => {
            bird.update(dt, elapsedTime);
            //bird.lookAt(cam.position);
        });
        */
    }
}