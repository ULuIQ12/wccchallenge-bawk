import { BufferGeometry, Camera, Color, Group, InstancedMesh, MathUtils, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, Vector3 } from "three";
import { BlackMaterial } from "./materials/BlackMaterial";
import { TweetMaterial } from "./materials/TweetMaterial";
import { CuteBirds } from "../CuteBirds";
import { Rand } from "@/lib/utils/Rand";
import { Easing } from "@/lib/utils/Easing";
import { CUtils } from "@/lib/utils/CUtils";
import { TweetMaterialNote } from "./materials/TweetMaterialNote";

export class Tweets extends Group
{
    maxTweets:number = 5000;
    mesh:InstancedMesh;
    tweets:TweetPart[] = [];
    tweetIndex:number = 0;
    initPosition:Vector3 = new Vector3(-1000,0,0);
    constructor()
    {
        super();

        //const mat:MeshBasicMaterial = new TweetMaterial({color:0xffffff});
        const mat:MeshBasicMaterial = new TweetMaterialNote({color:0xffffff}, CuteBirds.instance.renderer);
        const geom:BufferGeometry = new PlaneGeometry(1, 1);
        this.mesh = new InstancedMesh(geom, mat, this.maxTweets);
        this.mesh.frustumCulled = false;
        this.add(this.mesh);
        const dummy:Object3D = new Object3D();
        const col:Color = new Color(0xff0000);
        for( let i = 0; i < this.maxTweets; i++)
        {
            dummy.position.set(this.initPosition.x, this.initPosition.y, this.initPosition.z);
            dummy.updateMatrix();



            this.mesh.setMatrixAt(i, dummy.matrix);

            this.mesh.setColorAt(i, col);

            const tp:TweetPart = new TweetPart();
            tp.index = i;
            this.tweets.push(tp);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
        
        if( this.mesh.instanceColor)
            this.mesh.instanceColor.needsUpdate = true;
        
    }

    dummy:Object3D = new Object3D();
    tweetDuration:number = 0.5;
    Q90:Quaternion = new Quaternion().setFromAxisAngle(new Vector3(0,0,1), Math.PI * .5);
    tweet( position:Vector3, direction:Vector3)
    {
        const Q:Quaternion = new Quaternion();
        const nb:number = Rand.iRange(1, 4);
        for( let i:number = 0 ;i < 3;i ++)
        {

            const tweet:TweetPart = this.tweets[this.tweetIndex];
            tweet.basePosition.copy(position);
            tweet.position.copy(position);
            tweet.direction.copy(direction);
            //Q.setFromAxisAngle(new Vector3(0,0,1), Rand.fRange(-Math.PI*.1, Math.PI*.1));
            Q.setFromAxisAngle(new Vector3(0,0,1), -Math.PI*.1 + i*Math.PI*.1);
            tweet.direction.applyQuaternion(Q);
            //tweet.rotation.setFromUnitVectors(new Vector3(0,1,0), tweet.direction).multiply(this.Q90);
            tweet.rotation.setFromAxisAngle(new Vector3(0,0,1), Rand.fRange(-.25,.25));
            
            //tweet.scale.set(.1, Rand.fRange( .1, .3), .1);
            tweet.scale.setScalar(Rand.fRange( .25, .75));
            tweet.speed = Rand.fRange(0.3, 0.5);
            tweet.life = 1;

            this.tweetIndex = (this.tweetIndex + 1) % this.maxTweets;
        }
        
    }

    tempCol:Color = new Color();
    update(dt:number, elapsed:number)
    {
        for( const tweet of this.tweets)
        {
            if( tweet.life >= 0)
            {
                tweet.life -= dt / this.tweetDuration;

                const t:number = MathUtils.clamp(1 - tweet.life, 0, 1);
                const modt:number = Easing.easeOutSine(t);

                tweet.position.copy(tweet.basePosition).addScaledVector(tweet.direction , modt * 2 * tweet.speed);
                this.dummy.position.copy(tweet.position);
                this.dummy.quaternion.copy(tweet.rotation);
                //this.dummy.rotateZ()
                this.dummy.scale.copy(tweet.scale ).multiplyScalar( modt * 2);

                this.dummy.updateMatrix();
                this.mesh.setMatrixAt(tweet.index, this.dummy.matrix);
                //const colT:number = Easing.easeInExpo(t);
                const colT:number = CUtils.pcurve(t, 0.8, 1.5);
                this.tempCol.setRGB(colT,colT,colT);

                this.mesh.setColorAt(tweet.index, this.tempCol);
                
            }
            else 
            {
                this.dummy.position.set(this.initPosition.x, this.initPosition.y, this.initPosition.z);
                this.dummy.updateMatrix();
                this.mesh.setMatrixAt(tweet.index, this.dummy.matrix);
            }
        }
        this.mesh.instanceMatrix.needsUpdate = true;
        
        if( this.mesh.instanceColor)
            this.mesh.instanceColor.needsUpdate = true;
        
    }
}

class TweetPart 
{
    index:number = 0;
    basePosition:Vector3 = new Vector3();
    position:Vector3 = new Vector3();
    scale:Vector3 = new Vector3();
    speed:number = 1;
    direction:Vector3 = new Vector3();
    rotation:Quaternion = new Quaternion();
    life:number = 0;
}