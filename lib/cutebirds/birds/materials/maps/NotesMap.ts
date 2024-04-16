import { LinearFilter, Material, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, PlaneGeometry, RGBAFormat, Scene, Shape, ShapeGeometry, Texture, WebGLRenderer, WebGLRenderTarget } from "three";

export class NotesMap
{
    static tex:Texture;
    static SIZE:number = 256;
    static getTexture():Texture
    {
        if( this.tex == null)
        {
            throw new Error("Must call generateTexture first with the renderer");
        }
        return this.tex;
    }

    static generateTexture(renderer:WebGLRenderer)
    {

        const size = this.SIZE;
        const scene:Scene = new Scene();
        const cam:OrthographicCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 2);
        

        const s0:Shape = new Shape();
        s0.absellipse(.4, .2, .2, .1, 0, Math.PI * 2, false, Math.PI * .1);

        const lw:number = 0.05;
        const s1:Shape = new Shape();
        s1.moveTo(.55, .25);
        s1.lineTo(.55  + lw, .25);
        s1.lineTo(.55  + lw, .9);
        s1.lineTo(.55 , .9);
        s1.closePath();

        const s2:Shape = new Shape();
        s2.moveTo(.55, .9);
        s2.lineTo(.55, .7);
        s2.bezierCurveTo(.75, .7, .7, .6, .9, .6);
        s2.bezierCurveTo(.8, .65, .7, .9, .55, .9);
        s2.closePath();


        const geom:ShapeGeometry = new ShapeGeometry([s0, s1, s2]);
        //const mesh:Mesh = new Mesh(geom, new MeshBasicMaterial({color:0x000000}));
        const mesh:Mesh = new Mesh(geom, new MeshBasicMaterial({color:0xffffff}));
        scene.add(mesh);
        //const geom = new PlaneGeometry(2, 2);
        //const mat:Material = new ScratchMat({});
        //const mesh = new Mesh(geom, mat);
        //mesh.position.set(0, 0, -2);
        //scene.add(mesh);

        const rtTexture:WebGLRenderTarget = new WebGLRenderTarget( size, size, { minFilter: LinearFilter, magFilter: NearestFilter, format: RGBAFormat } );
        renderer.setClearAlpha(0);
        renderer.setRenderTarget( rtTexture );
        renderer.clear();
        renderer.render( scene, cam );
        renderer.setRenderTarget( null );
        renderer.clear();
        rtTexture.texture.needsUpdate = true;
        this.tex = rtTexture.texture;

    }
}