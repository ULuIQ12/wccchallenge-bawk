import { Vector3 } from "three";

export const cameraConfig = {
    fov: 75,
    near: 0.01,
    far: 100,
    aspect: 1,
    startPosition: new Vector3(0, -5, 30),
    target: new Vector3(0, 0, 0),
}