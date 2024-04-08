import { BufferGeometry, CircleGeometry, Shape, ShapeGeometry, Vector2 } from "three";
import { BirdParams } from "./Bird";


export class BirdGeoms
{
    head:BufferGeometry|undefined;
    eye:BufferGeometry|undefined;;
    pupil:BufferGeometry|undefined;;
    beakTop:BufferGeometry|undefined;;
    beakBottom:BufferGeometry|undefined;;
    neck:BufferGeometry|undefined;;
    body:BufferGeometry|undefined;;
    leftWing:BufferGeometry|undefined;;
    rightWing:BufferGeometry|undefined;;
    upLeg:BufferGeometry|undefined;;
    lowLeg:BufferGeometry|undefined;;
    foot:BufferGeometry|undefined;;
}

export class BirdGeometry 
{
    
    static getGeometry(params:BirdParams):BirdGeoms
    {
        const geoms:BirdGeoms = new BirdGeoms();
        geoms.head = BirdGeometry.createHead(params);
        geoms.eye = BirdGeometry.createEye(params);
        geoms.pupil = BirdGeometry.createPupil(params);
        geoms.beakTop = BirdGeometry.createBeakTop(params);
        geoms.beakBottom = BirdGeometry.createBeakTop(params);
        geoms.neck = BirdGeometry.createNeck(params);
        geoms.body = BirdGeometry.createBody(params);
        geoms.leftWing = BirdGeometry.createLeftWing(params);
        geoms.rightWing = BirdGeometry.createRightWing(params);
        geoms.upLeg = BirdGeometry.createUpLeg(params);
        geoms.lowLeg = BirdGeometry.createLowLeg(params);
        geoms.foot = BirdGeometry.createFoot(params);
        return geoms;
    }

    private static createHead(params:BirdParams):BufferGeometry
    {
        return new CircleGeometry(params.headRadius, 32);
    }

    private static createEye(params:BirdParams):BufferGeometry
    {
        return new CircleGeometry(params.eyeRadius, 32);
    }

    private static createPupil(params:BirdParams):BufferGeometry
    {
        return new CircleGeometry(params.pupilRadius, 16);
    }

    private static createBeakTop(params:BirdParams):BufferGeometry
    {
        
        const p:BirdParams = params;
        const endRad:number = p.beakRadius * .25;
        const shape:Shape = new Shape();
        shape.absarc(0, 0, p.beakRadius, Math.PI / 2, 3*Math.PI/2, false);
        shape.bezierCurveTo(p.beakRadius * .5, -p.beakRadius, p.beakLength - p.beakRadius*.5, -endRad, p.beakLength, -endRad);
        shape.absarc(p.beakLength, 0, endRad, 3*Math.PI/2, Math.PI/2, false);
        shape.bezierCurveTo(p.beakLength - p.beakRadius*.5, endRad, p.beakRadius*.5, p.beakRadius, 0, p.beakRadius);
        shape.closePath();
        return new ShapeGeometry(shape, 8);
    }

    private static createBody(params:BirdParams):BufferGeometry
    {
        const p:BirdParams = params;
        const shape:Shape = new Shape();
        shape.absarc(0, p.bodyLength, p.bodyTopRadius, 0, Math.PI, false);
        shape.bezierCurveTo(-p.bodyTopRadius, p.bodyLength -p.bodyLength * .25, -p.bodyBottomRadius, p.bodyLength * .25, -p.bodyBottomRadius, 0);
        shape.absarc(0, 0, p.bodyBottomRadius, Math.PI, 0, false);
        shape.bezierCurveTo(p.bodyBottomRadius, p.bodyLength * .25, p.bodyTopRadius, p.bodyLength - p.bodyLength * .25, p.bodyTopRadius, p.bodyLength);
        shape.closePath();
        const sg1:ShapeGeometry = new ShapeGeometry(shape, 8);
        //console.log( "SG1 = ", sg1.attributes.position.count);

        const shape2:Shape = new Shape();
        const breathAmp:number = 1.1;
        const dy:number = p.bodyLength - ( p.bodyTopRadius*breathAmp - p.bodyTopRadius);
        shape2.absarc(0, dy, p.bodyTopRadius * breathAmp, 0, Math.PI, false);
        shape2.bezierCurveTo(-p.bodyTopRadius * breathAmp, dy -p.bodyLength * .25, -p.bodyBottomRadius, p.bodyLength * .25, -p.bodyBottomRadius, 0);
        shape2.absarc(0, 0, p.bodyBottomRadius, Math.PI, 0, false);
        shape2.bezierCurveTo(p.bodyBottomRadius, p.bodyLength * .25, p.bodyTopRadius * breathAmp, p.bodyLength - p.bodyLength * .25, p.bodyTopRadius * breathAmp, dy);
        shape2.closePath();
        const sg2:ShapeGeometry = new ShapeGeometry(shape2, 8);
        //console.log( "SG2 = ", sg1.attributes.position.count);
        sg1.morphAttributes.position = [];
        sg1.morphAttributes.position[0] = sg2.attributes.position;

        return sg1;
    }

    private static createNeck(params:BirdParams):BufferGeometry
    {
        
        const bend:number = Math.PI / 2  + Math.PI * 0.15;
        const cb:number = Math.cos(bend);
        const sb:number = Math.sin(bend);
        const bendv2:Vector2 = new Vector2(cb, sb).multiplyScalar(params.neckLengh);
        const p:BirdParams = params;

        const p0:Vector2 = new Vector2(-p.neckRadius, 0);
        const p1:Vector2 = new Vector2(p.neckRadius, 0);
        const p2:Vector2 = new Vector2(bendv2.x + sb * p.neckRadius , bendv2.y - cb * p.neckRadius);
        const p3:Vector2 = new Vector2(bendv2.x - sb * p.neckRadius , bendv2.y + cb * p.neckRadius);        

        const shape:Shape = new Shape();

        shape.absarc(0, 0, p.neckRadius, Math.PI , 0, false);
        shape.bezierCurveTo(p1.x, p1.y + p.neckLengh * .25, p2.x + p.neckLengh * .25, p2.y, p2.x, p2.y);
        shape.lineTo(p3.x, p3.y);
        shape.bezierCurveTo(p3.x + p.neckLengh * .25, p3.y, p0.x, p0.y + p.neckLengh * .25, p0.x, p0.y);        
        shape.closePath();

        const shape2:Shape = new Shape();
        const bend2:number = Math.PI / 2  - Math.PI * 0.15;
        const cb2:number = Math.cos(bend2);
        const sb2:number = Math.sin(bend2);
        bendv2.set(cb2, sb2).multiplyScalar(params.neckLengh);

        p2.set(bendv2.x + sb2 * p.neckRadius , bendv2.y - cb2 * p.neckRadius);
        p3.set(bendv2.x - sb2 * p.neckRadius , bendv2.y + cb2 * p.neckRadius);


        shape2.absarc(0, 0, p.neckRadius, Math.PI , 0, false);
        shape2.bezierCurveTo(p1.x, p1.y + p.neckLengh * .25, p2.x - p.neckLengh * .25, p2.y, p2.x, p2.y);
        shape2.lineTo(p3.x, p3.y);
        shape2.bezierCurveTo(p3.x - p.neckLengh * .25, p3.y, p0.x, p0.y + p.neckLengh * .25, p0.x, p0.y);
        shape2.closePath();
        /*

        shape2.absarc(0, 0, p.neckRadius, Math.PI, 0, false);
        shape2.bezierCurveTo(p.neckRadius, p.neckLengh * .5, bendv2.x + sb2 * p.neckRadius - p.neckRadius *1.5 , bendv2.y - cb2 * p.neckRadius, bendv2.x + sb2 * p.neckRadius, bendv2.y - cb2 * p.neckRadius);
        shape2.lineTo(bendv2.x - sb2 * p.neckRadius, bendv2.y + cb2 * p.neckRadius)
        shape2.bezierCurveTo(bendv2.x - sb2 * p.neckRadius + p.neckRadius * 1.5, bendv2.y + cb2 * p.neckRadius, -p.neckRadius, p.neckLengh * .5, -p.neckRadius, 0);
        shape2.closePath();
        */
        /*
        shape.absarc(bendv2.x, bendv2.y, p.neckRadius, 0 + bendAngle, Math.PI + bendAngle, false);
        shape.bezierCurveTo(bendv2.x - p.neckRadius - cb * .5, bendv2.y , -p.neckRadius, p.neckLengh * .5, -p.neckRadius, 0);
        shape.absarc(0, 0, p.neckRadius, Math.PI, 0, false);
        shape.bezierCurveTo(p.neckRadius, p.neckLengh * .5, bendv2.x + sb * p.neckRadius * 3 , bendv2.y - cb * p.neckRadius, bendv2.x + sb * p.neckRadius, bendv2.y - cb * p.neckRadius);
        */
        

        const sg1:ShapeGeometry = new ShapeGeometry(shape, 8);
        const sg2:ShapeGeometry = new ShapeGeometry(shape2, 8);

        sg1.morphAttributes.position = [];
        sg1.morphAttributes.position[0] = sg2.attributes.position;

        return sg1;
    }

    private static createLeftWing(params:BirdParams):BufferGeometry
    {
        const p:BirdParams = params;
        const shape:Shape = new Shape();
        shape.absarc(0, 0, p.wingBaseRadius, 3*Math.PI/2, Math.PI/2, false);
        shape.absarc(-p.wingLength, 0, p.wingEndRadius, Math.PI/2, 3*Math.PI/2, false);
        shape.bezierCurveTo(-p.wingLength,-p.wingEndRadius*3, -p.wingBaseRadius, -p.wingBaseRadius, 0, -p.wingBaseRadius);
        shape.closePath();
        return new ShapeGeometry(shape, 16);
    }

    private static createRightWing(params:BirdParams):BufferGeometry
    {
        const p:BirdParams = params;
        const shape:Shape = new Shape();
        shape.absarc(0, 0, p.wingBaseRadius,  3*Math.PI/2, Math.PI/2,true);
        shape.absarc(p.wingLength, 0, p.wingEndRadius,  Math.PI/2, 3*Math.PI/2, true);
        shape.bezierCurveTo(p.wingLength,-p.wingEndRadius*3, p.wingBaseRadius, -p.wingBaseRadius, 0, -p.wingBaseRadius);        
        shape.closePath();
        return new ShapeGeometry(shape, 16);
    }

    private static createUpLeg(params:BirdParams):BufferGeometry
    {
        const p:BirdParams = params;
        const shape:Shape = new Shape();        
        shape.absarc(0, 0, p.upLegRadius, 0, Math.PI, false);
        shape.absarc(0, -p.upLegLength, p.upLegRadius, Math.PI, 0, false);
        shape.closePath();

        const shape2:Shape = new Shape();
        shape2.absarc(0, -p.upLegLength, p.kneeRadius, 0, Math.PI * 2, false);

        return new ShapeGeometry( [shape, shape2], 8); 
    }

    private static createLowLeg(params:BirdParams):BufferGeometry
    {
        const p:BirdParams = params;
        const shape:Shape = new Shape();
        shape.absarc(0, 0, p.lowLegRadius, 0, Math.PI, false);
        shape.absarc(0, -p.lowLegLength, p.lowLegRadius, Math.PI, 0, false);
        shape.closePath();
        return new ShapeGeometry(shape, 8);
    }

    private static createFoot(params:BirdParams):BufferGeometry
    {
        const p:BirdParams = params;
        const shape:Shape = new Shape();
        shape.absarc(0, 0, p.footRadius, Math.PI / 2, 3*Math.PI / 2, false);
        shape.absarc(p.footLength, 0, p.footRadius, 3*Math.PI / 2, Math.PI / 2, false);
        shape.closePath();
        return new ShapeGeometry(shape, 8);
    }
}