import { MeshBasicMaterial, MeshBasicMaterialParameters, WebGLProgramParametersWithUniforms, WebGLRenderer } from "three";
import { NotesMap } from "./maps/NotesMap";

export class TweetMaterialNote extends MeshBasicMaterial
{
    uniforms:any;
    onBeforeCompile:any;

    constructor(params:MeshBasicMaterialParameters, renderer:WebGLRenderer)
    {
        params.transparent = true;
        params.alphaTest = 0.01;
        NotesMap.generateTexture(renderer);
        params.map = NotesMap.getTexture();

        //params.vertexColors = true;
        super(params);

        this.uniforms = {
            
        }

        this.onBeforeCompile = (shader:any, renderer:WebGLRenderer) => {
            
            for (const uniformName of Object.keys(this.uniforms)) {
                shader.uniforms[uniformName] = this.uniforms[uniformName];
            }

            shader.vertexShader = shader.vertexShader.replace(
                `#include <common>`,
                `#include <common>

                varying vec2 vUv;
            `);
            shader.vertexShader = shader.vertexShader.replace(
                `#include <uv_vertex>`,
                `#include <uv_vertex>
               
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            `);
            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <common>`,
                `#include <common>

                varying vec2 vUv;

                float sdCircle( vec2 p, float r )
                {
                    return length(p) - r;
                }

                float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r )
                {
                    r.xy = (p.x>0.0)?r.xy : r.zw;
                    r.x  = (p.y>0.0)?r.x  : r.y;
                    vec2 q = abs(p)-b+r.x;
                    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
                }
            `);
            
            
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `#include <color_fragment>

                diffuseColor.a = diffuseColor.r;
                diffuseColor.rgb = vec3(0.0);

            `);

        }
    }
}