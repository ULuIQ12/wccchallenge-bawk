import { BaseEvent, Box2, Box3, BufferGeometry, CircleGeometry, Group, MathUtils, Mesh, Object3DEventMap, Quaternion, Vector2, Vector3 } from "three";
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

export enum HeadOrientation {
    LEFT, 
    RIGHT
}

// render order
const ElementRO = [
    "tail",
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

/**
 * Bird generation parameters
 */
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
    wingsOffset:Vector2 = new Vector2(.1, -.1);
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

    beakTransitionDuration:number = .25;
    legsTransitionDuration:number = .25;
    wingsTransitionDuration:number = .25;

    randomize():BirdParams
    {
        this.seed = Rand.rand();
        this.headRadius = Rand.fRange(.2, .6);
        this.eyeRadius = Rand.fRange(.08, this.headRadius * .75);
        this.pupilRadius = Rand.fRange(.03, this.eyeRadius * .75);
        this.beakRadius = Rand.fRange(.08, this.headRadius * .5);
        this.beakLength = Rand.fRange(.15, .5);
        this.neckLengh = Rand.fRange(.15, .5);
        
        this.bodyTopRadius = Rand.fRange(.1, .3);
        this.bodyBottomRadius = Rand.fRange(.2, .5);
        this.bodyLength = Rand.fRange(.3, .6);

        this.wingBaseRadius = Rand.fRange(.2, this.bodyBottomRadius);
        this.wingEndRadius = Rand.fRange(.04, .15);
        this.wingLength = Rand.fRange(.6, 1.5);
        this.wingsOffset.set(Rand.fRange(.05, .15), Rand.fRange(0, -.1));

        this.upLegLength = Rand.fRange(.15, .75);
        //this.upLegRadius = Rand.fRange(.02, .03);
        this.lowLegLength = Rand.fRange(this.upLegLength * .75, this.upLegLength * 1.5);
        //this.lowLegRadius = Rand.fRange(.02, .03);
        this.footLength = Rand.fRange(.1, .2);

        const angVal:number = Rand.fRange(.05, .3) * Math.PI;
        this.leftlegAngle = Math.PI * 1.5 - angVal;
        this.rightlegAngle = Math.PI * 1.5 + angVal;
        //this.footRadius = Rand.fRange(.02, .03);
        this.kneeRadius = Rand.fRange(.035, .06);
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
    beakContainer:Group;
    body:Mesh;
    leftWing:Mesh;
    rightWing:Mesh;
    legContainer:Group;
    leftUpLeg:Mesh;
    rightUpLeg:Mesh;
    leftLowLeg:Mesh;
    rightLowLeg:Mesh;
    leftFoot:Mesh;
    rightFoot:Mesh;
    tail:Mesh;

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

    headOrientation:HeadOrientation = HeadOrientation.RIGHT;

    
    constructor(params?:BirdParams)
    {
        super();

        const blackMat:BlackMaterial = new BlackMaterial();
        const whiteMat:WhiteMaterial = new WhiteMaterial();
        const p:BirdParams = (params)?params:new BirdParams().randomize();
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
        //pupil.position.set( (p.eyeRadius - p.pupilRadius) * .9, 0, 0);
        pupil.renderOrder = ElementRO.indexOf("pupil");
        head.add(pupil);

        const beakContainer:Group = new Group();
        head.add(beakContainer);
        const beakTop:Mesh = new Mesh(geoms.beakTop, blackMat);
        beakTop.position.set(p.headRadius - p.beakRadius, 0, 0);
        beakTop.renderOrder = ElementRO.indexOf("beakTop");
        beakContainer.add(beakTop);

        const beakBottom:Mesh = new Mesh(geoms.beakBottom, blackMat);
        beakBottom.position.set(p.headRadius - p.beakRadius, 0, 0);
        beakBottom.renderOrder = ElementRO.indexOf("beakBottom");
        beakContainer.add(beakBottom);

        //beakContainer.rotation.z = Math.PI * .9;
        const legContainer:Group = new Group();
        legContainer.position.y = p.upLegLength + p.lowLegLength + p.bodyBottomRadius;
        this.add(legContainer);
        const leftUpLeg:Mesh = new Mesh(geoms.upLeg, blackMat);
        leftUpLeg.renderOrder = ElementRO.indexOf("upLeg");
        leftUpLeg.position.set(
            Math.cos(p.leftlegAngle) * p.legInset,
            Math.sin(p.leftlegAngle) * p.legInset,
            0
        )
        legContainer.add(leftUpLeg);

        const rightUpLeg:Mesh = new Mesh(geoms.upLeg, blackMat);
        rightUpLeg.renderOrder = ElementRO.indexOf("upLeg");
        rightUpLeg.position.set(
            Math.cos(p.rightlegAngle) * p.legInset,
            Math.sin(p.rightlegAngle) * p.legInset,
            0
        )
        legContainer.add(rightUpLeg);

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
        //leftFoot.geometry.translate(-p.footLength + p.footLength*.25,0,0); // for foot v1
        leftFoot.renderOrder = ElementRO.indexOf("foot");
        leftFoot.position.set(0, -p.lowLegLength, 0);
        leftLowLeg.add(leftFoot);

        const rightFoot:Mesh = new Mesh(footGeom.clone(), blackMat);
        //rightFoot.geometry.translate(-p.footLength * 0.25 ,0,0); // for foot v1
        rightFoot.renderOrder = ElementRO.indexOf("foot");
        rightFoot.position.set(0, -p.lowLegLength, 0);
        rightLowLeg.add(rightFoot);

        const tail:Mesh = new Mesh(geoms.tail, blackMat);
        tail.renderOrder = ElementRO.indexOf("tail");
        tail.rotation.z = Math.PI * .4;
        body.add(tail);
        
        this.head = head;
        this.neck = neck;
        this.eye = eye;
        this.pupil = pupil;
        this.beakTop = beakTop;
        this.beakBottom = beakBottom;
        this.beakContainer = beakContainer;
        this.body = body;
        this.leftWing = leftWing;
        this.rightWing = rightWing;

        this.legContainer = legContainer;
        this.leftUpLeg = leftUpLeg;
        this.rightUpLeg = rightUpLeg;
        this.leftLowLeg = leftLowLeg;
        this.rightLowLeg = rightLowLeg;
        this.leftFoot = leftFoot;
        this.rightFoot = rightFoot;
        this.tail = tail;

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
        this.testHeadOrientation()
        
        this.handleLegsState(dt, elapsed);
        this.handleBeakState(dt, elapsed);
        this.handleWingsState(dt, elapsed);
        this.handleBreathing(dt, elapsed);
        this.handleHeadBob(dt, elapsed);
        this.HandleHeadOrientation(dt, elapsed);
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
    targetBodyRotation:number = 0 ;
    targetTailRotation:number = Math.PI * .4;
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
        this.body.position.y = Math.max(this.tempV30.y, this.tempV31.y) + this.bodyOffset + this.params.footRadius;
        this.legContainer.position.y = this.body.position.y ;
        /** quick adds */
        if( Rand.bool(0.01))
        {
            this.targetBodyRotation = Rand.fRange(-Math.PI * .1, Math.PI * .1);   
        }
        this.body.rotation.z = MathUtils.lerp(this.body.rotation.z, this.targetBodyRotation, 0.05);
        if( Rand.bool(0.01))
        {
            this.targetTailRotation = Rand.bool(.5)?Math.PI * .4: -Math.PI * .4;   
        }
        this.tail.rotation.z = MathUtils.lerp(this.tail.rotation.z, this.targetTailRotation, 0.05);
    }

    /**
     * Beak
     */
    
    OpenBeak()
    {
        this.beakState = BeakState.TRANSITION_TO_OPEN;
        this.beakTransitionStart = this.lastUpdate;
        this.tweetDone = false;
    }

    onTweetCallback:Function = (tweet:{position:Vector3, direction:Vector3}) => {};
    tweetDone:boolean = false;
    beakTweet()
    {
        
        const beakPos:Vector3 = new Vector3();
        this.beakTop.getWorldPosition(beakPos);
        const Q:Quaternion = new Quaternion();
        //const randDir:Quaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Rand.fRange(-Math.PI * .15, Math.PI * .15));
        
        this.head.getWorldQuaternion(Q);
        const v3:Vector3 = new Vector3(1, 0, 0).applyQuaternion(Q);
        if( this.headOrientation == HeadOrientation.LEFT)
        {
            v3.x = -v3.x;
        }
        beakPos.addScaledVector(v3, this.params.beakLength * .5);
        
        this.onTweetCallback({position:beakPos, direction:v3});
        this.tweetDone = true;
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
            
            if( this.beakTransition > 0.75 && this.beakTransition < .8 && !this.tweetDone)
            {
                this.beakTweet();
            }
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

    /**
     * Head orientation
     */

    LookLeft()
    {
        this.headOrientation = HeadOrientation.LEFT;
        
    }

    LookRight()
    {
        this.headOrientation = HeadOrientation.RIGHT;
    }

    HandleHeadOrientation(dt:number, elapsed:number)
    {
        if( this.headOrientation == HeadOrientation.LEFT)
        {
            this.beakContainer.rotation.z = MathUtils.lerp(this.beakContainer.rotation.z, Math.PI * .9, 0.1);
        }
        else if( this.headOrientation == HeadOrientation.RIGHT)
        {
            this.beakContainer.rotation.z = MathUtils.lerp(this.beakContainer.rotation.z, 0, 0.1);
        }
    }

    testHeadOrientation()
    {
        if(this.headOrientation == HeadOrientation.RIGHT && Rand.bool(0.01))
        {
            this.LookLeft();
        }
        else if(this.headOrientation == HeadOrientation.LEFT && Rand.bool(0.01))
        {
            this.LookRight();
        }
    }
}