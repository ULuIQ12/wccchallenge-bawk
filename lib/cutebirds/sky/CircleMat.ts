import { MeshBasicMaterial, MeshBasicMaterialParameters, WebGLProgramParametersWithUniforms, WebGLRenderer } from "three";

export class CircleMat extends MeshBasicMaterial
{
    uniforms:any;
    onBeforeCompile:any;

    constructor(params:MeshBasicMaterialParameters)
    {
        super(params);

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

                float sdCircle( vec2 p, float r )
                {
                    return length(p) - r;
                }
            `);
            
            
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `#include <color_fragment>

                diffuseColor.a = 1.0 - smoothstep(0.0, 0.01, abs(sdCircle(vUv - 0.5, 0.5)));
            `);

        }
    }
}