/**
 * Vector3.ts
 * 
 * Basic 3D Vector implementation to remove dependency on p5.js/Three.js
 * for core simulation logic.
 */

export class Vector3 {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) { }

    static get zero(): Vector3 { return new Vector3(0, 0, 0); }
    static get forward(): Vector3 { return new Vector3(0, 0, 1); }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v: Vector3): this {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    add(v: Vector3): this {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    static add(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    sub(v: Vector3): this {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    static sub(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    multiplyScalar(s: number): this {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    lengthSq(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    length(): number {
        return Math.sqrt(this.lengthSq());
    }

    normalize(): this {
        const l = this.length();
        if (l > 0) this.multiplyScalar(1 / l);
        return this;
    }

    static toRadians(deg: number): number {
        return deg * (Math.PI / 180);
    }

    static toDegrees(rad: number): number {
        return rad * (180 / Math.PI);
    }
}
