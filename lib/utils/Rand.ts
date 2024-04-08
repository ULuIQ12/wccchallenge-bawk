import { DataTexture, RGBAFormat, RedFormat, RepeatWrapping, Texture, UVMapping, UnsignedByteType } from "three";

export type RandFunction = () => number

export interface ResettableRandFunction extends RandFunction {
    reset?: () => void
}

export class Rand {
    static prngFunction: ResettableRandFunction | Function | null = null;

    static setPRNG(f: ResettableRandFunction | Function) {
        this.prngFunction = f;
    }

    static reset() {
        if (this.prngFunction != null && this.isResettable(this.prngFunction) && this.prngFunction.reset != undefined)
            this.prngFunction.reset();
    }

    static isResettable(obj: any): obj is ResettableRandFunction {
        return obj.reset != undefined;
    }

    static rand(): number {
        if (this.prngFunction != null)
            return this.prngFunction();
        else
            return Math.random();
    }

    static fRange(min: number, max: number) {
        if (min <= max) {
            return min + this.rand() * (max - min);
        }
        else {
            return max + this.rand() * (min - max);
        }
    }

    static iRange(min: number, max: number) {
        if (min <= max) {
            return min + Math.floor(this.rand() * (max - min));
        }
        else {
            return max + Math.floor(this.rand() * (min - max));
        }
    }

    static bool(prob: number = .5): boolean {
        return this.rand() < prob;
    }

    static option(options: any[]): any {
        return options[Math.floor(this.rand() * options.length)]
    }

    static texture1D: Texture;
    static texture3D: Texture;
    static T1D_SIZE: number = 512;
    static T3D_SIZE: number = 512;
    static t1D(): Texture {
        if (this.texture1D == null)
            this.initTexture1D();
        return this.texture1D;
    }

    static initTexture1D() {
        const size = this.T1D_SIZE * this.T1D_SIZE;
        const data = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            data[i] = Rand.iRange(0, 256);
        }
        this.texture1D = new DataTexture(
            data,
            this.T1D_SIZE,
            this.T1D_SIZE,
            RedFormat,
            UnsignedByteType,
            UVMapping,
            RepeatWrapping,
            RepeatWrapping,
        );
        this.texture1D.needsUpdate = true;
    }

    static t3D(): Texture {
        if (this.texture3D == null)
            this.initTexture3D();
        return this.texture3D;
    }

    static initTexture3D() {
        const size = this.T3D_SIZE * this.T3D_SIZE;
        const data = new Uint8Array(4 * size);

        for (let i = 0; i < size; i++) {
            const stride = i * 4;
            data[stride] = Rand.iRange(0, 256);
            data[stride + 1] = Rand.iRange(0, 256);
            data[stride + 2] = Rand.iRange(0, 256);
            data[stride + 3] = Rand.iRange(0, 256);
        }
        this.texture3D = new DataTexture(
            data,
            this.T3D_SIZE,
            this.T3D_SIZE,
            RGBAFormat,
            UnsignedByteType,
            UVMapping,
            RepeatWrapping,
            RepeatWrapping,
        );
        this.texture3D.needsUpdate = true;
    }
}