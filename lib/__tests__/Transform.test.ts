import { Transform, Euler } from '../Transform';
import { Vector3 } from '../math/Vector3';

describe('Transform', () => {
    it('should initialize with default values', () => {
        const t = new Transform();
        expect(t.x).toBe(0);
        expect(t.y).toBe(0);
        expect(t.z).toBe(0);
        expect(t.yaw).toBe(0);
        expect(t.parent).toBeNull();
    });

    it('should handle hierarchy and caching', () => {
        const root = new Transform(null, { x: 0, y: 0, z: 0 }, { yaw: 0, pitch: 0, roll: 0 });
        const child = new Transform(root, { x: 10, y: 0, z: 0 }, { yaw: 0, pitch: 0, roll: 0 });

        // Root global
        expect(root.getGlobalPosition().x).toBe(0);

        // Child global
        expect(child.getGlobalPosition().x).toBe(10);

        // Move root
        root.x = 5;
        // Child should move
        expect(child.getGlobalPosition().x).toBe(15);
    });

    it('should calculate global forward vector from orientation', () => {
        const t = new Transform();

        // Default forward is (0, 1, 0)
        let fwd = t.getGlobalForwardVector();
        expect(fwd.x).toBeCloseTo(0);
        expect(fwd.y).toBeCloseTo(1);
        expect(fwd.z).toBeCloseTo(0);

        // Rotate 90 degrees around Z (Roll) - should point LEFT (-1, 0, 0)?
        // Wait, rotations:
        // Roll (Z): (x, y) -> (x cos - y sin, x sin + y cos).
        // If start (0, 1). Roll 90 deg.
        // x' = 0 - 1*1 = -1.
        // y' = 0 + 0 = 0.
        // So (-1, 0, 0).

        t.roll = 90;
        fwd = t.getGlobalForwardVector();
        expect(fwd.x).toBeCloseTo(-1);
        expect(fwd.y).toBeCloseTo(0);
        expect(fwd.z).toBeCloseTo(0);
    });
});
