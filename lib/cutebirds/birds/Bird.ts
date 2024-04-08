import { Box2, Box3, BufferGeometry, CircleGeometry, Group, Mesh, Vector2, Vector3 } from "three";
import { BlackMaterial } from "./materials/BlackMaterial";
import { BirdGeometry, BirdGeoms } from "./BirdGeometry";
import { WhiteMaterial } from "./materials/WhiteMaterial";
import { Rand } from "@/lib/utils/Rand";
import { Easing } from "@/lib/utils/Easing";


export enum BeakState {
    OPEN,
    TRANSITION_TO_OPEN,
    CLOSED,
    TRANSITION_TO_CLOSED,
}

export enum LegsState {
    UP,
    TRANSITION_TO_UP,
    DOWN,
    TRANSITION_TO_DOWN,
}

export enum WingsState {
    UP,
    TRANSITION_TO_UP,
    DOWN,
    TRANSITION_TO_DOWN,
}

const ElementRO = [
    "upLeg",
    "lowLeg",
    "foot",
    "neck",
    "body",
    "leftWing",
    "rightWing",
    "head",
    "beakTop",
    "beakBottom",
    "eye",
    "pupil",
];

export class BirdParams
{
    seed:number = 0 ;
    headRadius:number = .25;
    eyeRadius:number = .1;
    pupilRadius:number = .05;
    beakRadius:number = .1;
    beakLength:number = .2;
    neckLengh:number = .2;
    neckRadius:number = .025;
    bodyTopRadius:number = .25;
    bodyBottomRadius:number = .4;
    bodyLength:number = .5;
    wingBaseRadius:number = .25;
    wingEndRadius:number = .1;
    wingsOffset:Vector2 = new Vector2(0.1, -0.1);
    wingLength:number = .8;
    upLegLength:number = .2;
    upLegRadius:number = .025;
    lowLegLength:number = .15;
    lowLegRadius:number = .0225;
    footLength:number = .15;
    footRadius:number = .025;
    kneeRadius:number = .035;
    leftlegAngle:number = Math.PI * 1.5 - Math.PI * .1;
    rightlegAngle:number = Math.PI * 1.5 + Math.PI * .1;
    legInset:number = this.bodyBottomRadius - this.bodyBottomRadius * .15;
    crouchingAmp:number = Math.PI * .25;
    headBobSpeed:number = 2;

    beakTransitionDuration:number = 0.25;
    legsTransitionDuration:number = 0.25;
    wingsTransitionDuration:number = 0.25;

    randomize():BirdParams
    {
        this.seed = Rand.rand();
        this.headRadius = Rand.fRange(.2, .4);
        this.eyeRadius = Rand.fRange(.08, this.headRadius * .75);
        this.pupilRadius = Rand.fRange(.03, this.eyeRadius * .75);
        this.beakRadius = Rand.fRange(.08, this.headRadius * .5);
        this.beakLength = Rand.fRange(.15, .5);
        this.neckLengh = Rand.fRange(.15, .5);
        
        this.bodyTopRadius = Rand.fRange(.2, .3);
        this.bodyBottomRadius = Rand.fRange(.3, .5);
        this.bodyLength = Rand.fRange(.3, .6);

        this.wingBaseRadius = Rand.fRange(.2, this.bodyBottomRadius);
        //this.wingEndRadius = Rand.fRange(.1, .2);
        this.wingLength = Rand.fRange(.6, 1.5);
        this.wingsOffset.set(Rand.fRange(.05, .15), Rand.fRange(0, -.1));

        this.upLegLength = Rand.fRange(.15, .5);
        //this.upLegRadius = Rand.fRange(.02, .03);
        this.lowLegLength = Rand.fRange(this.upLegLength * .75, this.upLegLength * 1.5);
        //this.lowLegRadius = Rand.fRange(.02, .03);
        this.footLength = Rand.fRange(.1, .2);
        //this.footRadius = Rand.fRange(.02, .03);
        //this.kneeRadius = Rand.fRange(.03, .04);
        //this.leftlegAngle = Math.PI * 1.5 - Rand.fRange(.05, .15);
        this.legInset = this.bodyBottomRadius - this.bodyBottomRadius * .15;

        this.crouchingAmp = Rand.fRange(Math.PI * .1, Math.PI * .3);
        this.headBobSpeed = Rand.fRange(1, 10);
        this.beakTransitionDuration = Rand.fRange(.15, .75);
        this.legsTransitionDuration = Rand.fRange(.15, .75);
        this.wingsTransitionDuration = Rand.fRange(.15, .75);
        return this;
    }
}

export class Bird extends Group
{

    params:BirdParams; 
    head:Mesh;
    neck:Mesh;
    eye:Mesh;
    pupil:Mesh;
    beakTop:Mesh;
    beakBottom:Mesh;
    body:Mesh;
    leftWing:Mesh;
    rightWing:Mesh;
    leftUpLeg:Mesh;
    rightUpLeg:Mesh;
    leftLowLeg:Mesh;
    rightLowLeg:Mesh;
    leftFoot:Mesh;
    rightFoot:Mesh;

    beakState:BeakState = BeakState.CLOSED;
    beakTransition:number = 0;
    beakTransitionDuration:number = 0.25;
    beakTransitionStart:number = 0;

    legsState:LegsState = LegsState.UP;
    legsTransition:number = 0;
    legsTransitionDuration:number = 0.25;
    legsTransitionStart:number = 0;

    wingsState:WingsState = WingsState.UP;
    wingsTransition:number = 0;
    wingsTransitionDuration:number = 0.25;
    wingsTransitionStart:number = 0;

    constructor()
    {
        super();

        const blackMat:BlackMaterial = new BlackMaterial();
        const whiteMat:WhiteMaterial = new WhiteMaterial();
        const p:BirdParams =new BirdParams().randomize();
        this.params = p;
        const geoms:BirdGeoms = BirdGeometry.getGeometry(p);

        this.beakTransitionDuration = p.beakTransitionDuration;
        this.legsTransitionDuration = p.legsTransitionDuration;
        this.wingsTransitionDuration = p.wingsTransitionDuration;

        const body:Mesh = new Mesh(geoms.body, blackMat);
        body.position.set(0, 0, 0);
        body.renderOrder = ElementRO.indexOf("body");
        this.add(body);

        const leftWing:Mesh = new Mesh(geoms.leftWing, blackMat);
        leftWing.position.set(-p.wingsOffset.x, p.bodyLength + p.wingsOffset.y, 0);
        leftWing.renderOrder = ElementRO.indexOf("leftWing");
        body.add(leftWing);

        const rightWing:Mesh = new Mesh(geoms.rightWing, blackMat);
        rightWing.position.set(p.wingsOffset.x, p.bodyLength + p.wingsOffset.y, 0);
        rightWing.renderOrder = ElementRO.indexOf("rightWing");
        body.add(rightWing);

        const head:Mesh = new Mesh(geoms.head, blackMat);
        head.position.set(0, p.bodyLength + p.bodyTopRadius + p.headRadius + p.neckLengh , 0);
        head.renderOrder = ElementRO.indexOf("head");
        body.add(head);

        const neck:Mesh = new Mesh(geoms.neck, blackMat);
        neck.position.set(0, p.bodyLength + p.bodyTopRadius, 0);
        neck.renderOrder = ElementRO.indexOf("neck");
        body.add(neck);

        const eye:Mesh = new Mesh(geoms.eye, whiteMat);
        eye.position.set(0, 0, 0);
        eye.renderOrder = ElementRO.indexOf("eye");
        head.add(eye);

        const pupil:Mesh = new Mesh(geoms.pupil, blackMat);
        pupil.position.set(0, 0, 0);
        pupil.renderOrder = ElementRO.indexOf("pupil");
        head.add(pupil);

        const beakTop:Mesh = new Mesh(geoms.beakTop, blackMat);
        //beakTop.rotation.z = Math.PI * .15;
        beakTop.position.set(p.headRadius - p.beakRadius, 0, 0);
        beakTop.renderOrder = ElementRO.indexOf("beakTop");
        head.add(beakTop);

        const beakBottom:Mesh = new Mesh(geoms.beakBottom, blackMat);
        //beakBottom.rotation.z = -Math.PI * .25;
        beakBottom.position.set(p.headRadius - p.beakRadius, 0, 0);
        beakBottom.renderOrder = ElementRO.indexOf("beakBottom");
        head.add(beakBottom);


        
        const leftUpLeg:Mesh = new Mesh(geoms.upLeg, blackMat);
        leftUpLeg.renderOrder = ElementRO.indexOf("upLeg");
        leftUpLeg.position.set(
            Math.cos(p.leftlegAngle) * p.legInset,
            Math.sin(p.leftlegAngle) * p.legInset,
            0
        )
        body.add(leftUpLeg);

        const rightUpLeg:Mesh = new Mesh(geoms.upLeg, blackMat);
        rightUpLeg.renderOrder = ElementRO.indexOf("upLeg");
        rightUpLeg.position.set(
            Math.cos(p.rightlegAngle) * p.legInset,
            Math.sin(p.rightlegAngle) * p.legInset,
            0
        )
        body.add(rightUpLeg);

        const leftLowLeg:Mesh = new Mesh(geoms.lowLeg, blackMat);
        leftLowLeg.renderOrder = ElementRO.indexOf("lowLeg");
        leftLowLeg.position.set(0, -p.upLegLength, 0);
        leftUpLeg.add(leftLowLeg);

        const rightLowLeg:Mesh = new Mesh(geoms.lowLeg, blackMat);
        rightLowLeg.renderOrder = ElementRO.indexOf("lowLeg");
        rightLowLeg.position.set(0, -p.upLegLength, 0);
        rightUpLeg.add(rightLowLeg);

        const footGeom:BufferGeometry = geoms.foot as BufferGeometry;
        const leftFoot:Mesh = new Mesh(footGeom.clone(), blackMat);
        leftFoot.geometry.translate(-p.footLength + p.footLength*.25,0,0);
        leftFoot.renderOrder = ElementRO.indexOf("foot");
        leftFoot.position.set(0, -p.lowLegLength, 0);
        leftLowLeg.add(leftFoot);

        const rightFoot:Mesh = new Mesh(footGeom.clone(), blackMat);
        rightFoot.geometry.translate(-p.footLength * 0.25 ,0,0);
        rightFoot.renderOrder = ElementRO.indexOf("foot");
        rightFoot.position.set(0, -p.lowLegLength, 0);
        rightLowLeg.add(rightFoot);
        
        this.head = head;
        this.neck = neck;
        this.eye = eye;
        this.pupil = pupil;
        this.beakTop = beakTop;
        this.beakBottom = beakBottom;
        this.body = body;
        this.leftWing = leftWing;
        this.rightWing = rightWing;

        this.leftUpLeg = leftUpLeg;
        this.rightUpLeg = rightUpLeg;
        this.leftLowLeg = leftLowLeg;
        this.rightLowLeg = rightLowLeg;
        this.leftFoot = leftFoot;
        this.rightFoot = rightFoot;

        /**debug */
        /*
        const origin:Mesh = new Mesh(
            new CircleGeometry(0.05, 8),
            new WhiteMaterial()
        )
        this.add(origin);
        */
    }

    get span():number
    {
        return (this.params.wingLength + this.params.wingsOffset.x + this.params.wingEndRadius) * 2 ;
    }

    dispose()
    {
        //this.parent.remove(this);

    }

    /**
     * Animation loop
     */
    lastUpdate:number = 0;
    tempV30:Vector3 = new Vector3();
    tempV31:Vector3 = new Vector3();
    update(dt:number, elapsed:number )
    {
        /*
        this.testBeak();
        this.testLegs();
        this.testWings();
        */
        
        this.handleLegsState(dt, elapsed);
        this.handleBeakState(dt, elapsed);
        this.handleWingsState(dt, elapsed);
        this.handleBreathing(dt, elapsed);
        this.handleHeadBob(dt, elapsed);
        this.handleBodyHeight();
        this.lastUpdate = elapsed;
    }
    
    handleBreathing(dt:number, elapsed:number)
    {
        const breath:number =  0.5 + Math.sin(elapsed * 20) * 0.5;
        //console.log("Breath = ", breath);
        if( this.body.morphTargetInfluences != undefined)
            this.body.morphTargetInfluences[0] = breath;


        
    }

    handleHeadBob(dt:number, elapsed:number)
    {
        const p:BirdParams = this.params;
        const timeFactor:number = Math.sin(elapsed * p.headBobSpeed +  p.seed * Math.PI * 2);
        const angle:number = Math.PI/2 - timeFactor * Math.PI * .2;
        if( this.neck.morphTargetInfluences != undefined)
            this.neck.morphTargetInfluences[0] = 0.5 + timeFactor * 0.5;
        this.head.position.x = Math.cos(angle) * p.neckLengh;
        this.head.position.y = p.bodyLength + p.bodyTopRadius * 0.75 + p.headRadius + Math.sin(angle) * p.neckLengh;
        this.head.rotation.z = -Math.PI/2 + angle * 1.25;
        
    }

    /**
    * Handle the body height based on the legs position
    */
    bodyOffset:number = 0;
    handleBodyHeight()
    {
        if( this.bodyOffset == 0)
        {
            //this.bodyOffset = Math.abs(Math.sin(this.params.leftlegAngle))*this.params.legInset;
            this.bodyOffset = Math.abs(Math.sin(this.params.leftlegAngle))*this.params.legInset - this.params.footRadius;
        }
        const bbleft:Box3 = new Box3().setFromObject(this.leftUpLeg, true);
        bbleft.getSize(this.tempV30);
        const bbright:Box3 = new Box3().setFromObject(this.rightUpLeg, true);
        bbright.getSize(this.tempV31);
        this.body.position.y = Math.max(this.tempV30.y, this.tempV31.y) + this.bodyOffset;
    }

    /**
     * Beak
     */
    OpenBeak()
    {
        this.beakState = BeakState.TRANSITION_TO_OPEN;
        this.beakTransitionStart = this.lastUpdate;
    }

    CloseBeak()
    {
        this.beakState = BeakState.TRANSITION_TO_CLOSED;
        this.beakTransitionStart = this.lastUpdate;
    }

    handleBeakState(dt:number, elapsed:number)
    {
        if(this.beakState == BeakState.TRANSITION_TO_OPEN)
        {
            this.beakTransition = Math.min(1, (elapsed - this.beakTransitionStart) / this.beakTransitionDuration);
            const t:number = Easing.easeInOutCirc(this.beakTransition);
            this.beakTop.rotation.z = Math.PI * .15 * t;
            this.beakBottom.rotation.z = -Math.PI * .25 * t;
            
            if(this.beakTransition == 1)
            {
                this.beakState = BeakState.OPEN;
            }
        }
        else if(this.beakState == BeakState.TRANSITION_TO_CLOSED)
        {
            this.beakTransition = Math.min(1, (elapsed - this.beakTransitionStart) / this.beakTransitionDuration);
            const t:number = Easing.easeInCirc(1.0 - this.beakTransition);
            this.beakTop.rotation.z = Math.PI * .15 * (t);
            this.beakBottom.rotation.z = -Math.PI * .25 * (t);
            
            if(this.beakTransition == 1)
            {
                this.beakState = BeakState.CLOSED;
            }
        }
    }

    testBeak()
    {
        if(this.beakState == BeakState.CLOSED && Rand.bool(0.1))
        {
            this.OpenBeak();
        }
        else if(this.beakState == BeakState.OPEN )
        {
            this.CloseBeak();
        }
    }

    /**
     * Legs
     */
    Crouch()
    {
        this.legsState = LegsState.TRANSITION_TO_DOWN;
        this.legsTransitionStart = this.lastUpdate;
    }

    Stand()
    {
        this.legsState = LegsState.TRANSITION_TO_UP;
        this.legsTransitionStart = this.lastUpdate;
    }

    handleLegsState(dt:number, elapsed:number)
    {
        const p:BirdParams = this.params;
        if(this.legsState == LegsState.TRANSITION_TO_DOWN)
        {
            this.legsTransition = Math.min(1, (elapsed - this.legsTransitionStart) / this.legsTransitionDuration);
            const t:number = Easing.easeInOutCirc(this.legsTransition);
            this.leftUpLeg.rotation.z = -p.crouchingAmp * t;
            this.rightUpLeg.rotation.z = p.crouchingAmp * t;
            this.leftLowLeg.rotation.z = p.crouchingAmp * t * 2;
            this.rightLowLeg.rotation.z = -p.crouchingAmp * t * 2;
            this.leftFoot.rotation.z = -p.crouchingAmp * t ;
            this.rightFoot.rotation.z = p.crouchingAmp * t ;
            
            if(this.legsTransition == 1)
            {
                this.legsState = LegsState.DOWN;
            }
        }
        else if(this.legsState == LegsState.TRANSITION_TO_UP)
        {

            this.legsTransition = Math.min(1, (elapsed - this.legsTransitionStart) / this.legsTransitionDuration);
            const t:number = Easing.easeInOutCirc(1.0 - this.legsTransition);
            this.leftUpLeg.rotation.z = -p.crouchingAmp * t;
            this.rightUpLeg.rotation.z = p.crouchingAmp * t;
            this.leftLowLeg.rotation.z = p.crouchingAmp * t * 2;
            this.rightLowLeg.rotation.z = -p.crouchingAmp * t * 2;
            this.leftFoot.rotation.z = -p.crouchingAmp * t ;
            this.rightFoot.rotation.z = p.crouchingAmp * t ;
                        
            if(this.legsTransition == 1)
            {
                this.legsState = LegsState.UP;
            }
        }
    }

    testLegs()
    {
        if(this.legsState == LegsState.UP && Rand.bool(0.1))
        {
            this.Crouch();
        }
        else if(this.legsState == LegsState.DOWN && Rand.bool(0.2))
        {
            this.Stand();
        }
    }

    /**
     * Wings
     */
    OpenWings()
    {
        this.wingsState = WingsState.TRANSITION_TO_UP;
        this.wingsTransitionStart = this.lastUpdate;
    }

    CloseWings()
    {
        this.wingsState = WingsState.TRANSITION_TO_DOWN;
        this.wingsTransitionStart = this.lastUpdate;
    }

    wingsOpenedAngle:number = -Math.PI * 0.15;
    wingsClosedAngle:number = Math.PI * 0.25;
    handleWingsState(dt:number, elapsed:number)
    {
        const p:BirdParams = this.params;
        if(this.wingsState == WingsState.TRANSITION_TO_UP)
        {
            this.wingsTransition = Math.min(1, (elapsed - this.wingsTransitionStart) / this.wingsTransitionDuration);
            const t:number = Easing.easeInOutCirc(this.wingsTransition);
            this.leftWing.rotation.z = this.wingsClosedAngle + (this.wingsOpenedAngle - this.wingsClosedAngle) * t;
            this.rightWing.rotation.z = -this.wingsClosedAngle + (-this.wingsOpenedAngle + this.wingsClosedAngle) * t;
            
            if(this.wingsTransition == 1)
            {
                this.wingsState = WingsState.UP;
            }
        }
        else if(this.wingsState == WingsState.TRANSITION_TO_DOWN)
        {

            this.wingsTransition = Math.min(1, (elapsed - this.wingsTransitionStart) / this.wingsTransitionDuration);
            const t:number = Easing.easeInOutCirc(1.0 - this.wingsTransition);
            this.leftWing.rotation.z = this.wingsClosedAngle + (this.wingsOpenedAngle - this.wingsClosedAngle) * t;
            this.rightWing.rotation.z = -this.wingsClosedAngle + (-this.wingsOpenedAngle + this.wingsClosedAngle) * t;
                        
            if(this.wingsTransition == 1)
            {
                this.wingsState = WingsState.DOWN;
            }
        }
    }

    testWings()
    {
        if(this.wingsState == WingsState.DOWN && Rand.bool(0.1))
        {
            this.OpenWings();
        }
        else if(this.wingsState == WingsState.UP && Rand.bool(0.2))
        {
            this.CloseWings();
        }
    }
}