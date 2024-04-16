import { MeshBasicMaterial, MeshBasicMaterialParameters, WebGLProgramParametersWithUniforms, WebGLRenderer } from "three";

export class TweetMaterial extends MeshBasicMaterial
{
    uniforms:any;
    onBeforeCompile:any;

    constructor(params:MeshBasicMaterialParameters)
    {
        params.transparent = true;
        params.alphaTest = 0.01;
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

                // just a rectangle
                
                vec2 boxuv = vUv - 0.5;
                vec2 boxSize = vec2(0.15, 0.5);
                vec4 boxRadius = vec4(0.1);
                float box = sdRoundedBox(boxuv, boxSize, boxRadius);
                diffuseColor.a = (1.0 - step(0.0, box) )* diffuseColor.r;
                diffuseColor.rgb = vec3( 0.0 );
                

            `);

            console.log(shader.fragmentShader);

        }
    }
}