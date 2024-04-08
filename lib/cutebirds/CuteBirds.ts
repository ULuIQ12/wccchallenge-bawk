import { ACESFilmicToneMapping, Camera, Clock, Color, ColorManagement, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { Rand } from "../utils/Rand";
import { cameraConfig } from "../config/CameraConfig";
import { EffectComposer, OrbitControls, OutputPass, RenderPass, SMAAPass } from "three/examples/jsm/Addons.js";
import { BirdScene } from "./BirdScene";

export class CuteBirds {
    static instance: CuteBirds;


    canvas: HTMLCanvasElement;
    renderer: WebGLRenderer;
    camera: OrthographicCamera | PerspectiveCamera | null = null;
    controls: OrbitControls | null = null;
    scene: Scene | null = null;
    composer: EffectComposer | null = null;
    clock: Clock = new Clock(false);
    constructor(canvas: HTMLCanvasElement, renderer: WebGLRenderer) {

        this.canvas = canvas;
        this.renderer = renderer;

        if (CuteBirds.instance != null) {
            console.warn('CuteBirds instance already exists');
            return;
        }
        CuteBirds.instance = this;

    }

    async init() {
        
        Rand.setPRNG(() => Math.random());
        await this.SetupDOM();
        await this.SetupRenderer();
        await this.SetupCameraAndControls();
        await this.SetupScene();
        await this.SetupComposer();
        this.onResize();
        await this.StartRendering();
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    SetupDOM() {
        window.addEventListener('resize', this.onResize.bind(this));
        
        const reactDiv = document.getElementById('react-div');
        
        if( reactDiv == null)
            return;

        reactDiv.onclick = (e:MouseEvent) => {
            e.preventDefault();
        }
        
        //console.log("React=" , reactDiv);

        //window.addEventListener("keydown", this.onKeyDown.bind(this)); 
        //window.addEventListener("mousedown", this.onPointerDown.bind(this));
        //window.addEventListener("mouseup", this.onPointerUp.bind(this));
    }

    SetupRenderer() {
        const r: WebGLRenderer = this.renderer;
        r.setPixelRatio(1);
        this.renderer.toneMapping = ACESFilmicToneMapping;
        ColorManagement.enabled = true;
    }

    SetupCameraAndControls() {
        const camConfig = cameraConfig;
        this.camera = new PerspectiveCamera(camConfig.fov, camConfig.aspect, camConfig.near, camConfig.far);
        this.camera.position.copy(camConfig.startPosition);
        this.camera.lookAt(camConfig.target);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.target.copy(camConfig.target);

        // offset the cam a bit
        this.camera.position.x += Rand.fRange(-10, 10);
    }

    async SetupScene() {
        this.scene = new BirdScene();
        await (this.scene as BirdScene).init();
    }

    SetupComposer() {
        if (this.scene == null || this.camera == null) {
            throw new Error('Scene or camera not initialized');
        }

        const renderPass: RenderPass = new RenderPass(this.scene, this.camera);
        const smaa:SMAAPass = new SMAAPass(window.innerWidth, window.innerHeight);
        const output: OutputPass = new OutputPass();

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        this.composer.addPass(output);
        this.composer.addPass(smaa);
    }

    onResize() {
        if (this.camera == null) {
            throw new Error('Camera not initialized');
        }
        console.log('resize')
        const width = window.innerWidth;
        const height = window.innerHeight;
        if ((this.camera as PerspectiveCamera).aspect != undefined)
            (this.camera as PerspectiveCamera).aspect = width / height;

        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer?.setSize(width, height);
    }

    StartRendering() {
        this.clock.start();
        const renderloop = () => {
            this.animate();
            requestAnimationFrame(renderloop);
        }
        renderloop();
    }

    animate() {
        const dt: number = this.clock.getDelta();
        const elapsed: number = this.clock.getElapsedTime();
        this.controls?.update();
        (this.scene as BirdScene).update(dt,elapsed);
        this.render();
    }

    render() {
        this.composer?.render();
    }
}