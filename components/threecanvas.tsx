"use client"
import { CuteBirds } from "@/lib/cutebirds/CuteBirds";
import { useEffect, useRef } from "react";
import { WebGLRenderer, WebGLRendererParameters } from "three";

const baseRendererParams: WebGLRendererParameters = {
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
};

export default function ThreeCanvas() {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // add a hook to instanciate the three.js renderer
    useEffect(() => {
        const canvas = canvasRef.current;
        if( canvas == null)
        {
            throw new Error('Canvas not found');
        }
        const rendererParams:WebGLRendererParameters = {...baseRendererParams, canvas: canvasRef.current as HTMLCanvasElement}
        const renderer = new WebGLRenderer(rendererParams);

        // instanciate the CuteBirds class once we have the renderer
        if( CuteBirds.instance == null)
        {
            const birds:CuteBirds = new CuteBirds(canvas, renderer);
            (async () => {
                await birds.init();
            })(); 
        }
    }, []);

    // add a hook to listen to resize events and update the canvas size
    useEffect(() => {
        const canvas: HTMLCanvasElement | null = canvasRef.current;

        const resizeCanvas = () => {
            if( canvas == null)
            {
                throw new Error('Canvas not found');
            }

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
        }
        window.addEventListener('resize', resizeCanvas);

        resizeCanvas();
        return () => {

            window.removeEventListener('resize', resizeCanvas);
        }
    }, []);


    return (
        <canvas ref={canvasRef} id="threecanvas"></canvas>
    );
}