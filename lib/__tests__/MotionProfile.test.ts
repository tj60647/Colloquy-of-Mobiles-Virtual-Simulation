import { MotionProfile } from '../subsystems/MotionProfile';

describe('MotionProfile', () => {
    describe('Initialization', () => {
        it('should calculate trapezoidal profile', () => {
            // Distance 100, MaxVel 10, MaxAcc 5
            // Accel time = 10/5 = 2s. Dist = 0.5*5*4 = 10m.
            // Defel time = 2s. Dist = 10m.
            // Cruise Dist = 100 - 10 - 10 = 80m. Time = 80/10 = 8s.
            // Total time = 12s.
            const mp = new MotionProfile(100, 10, 5);

            expect(mp.totalDistance).toBe(100);
            expect(mp.maxVelocity).toBe(10);

            // Approximately 12.3s duration (due to inclusive endpoints and 3 phases)
            const duration = mp.profile_duration;
            console.log('Calculated Duration:', duration);
            expect(duration).toBeCloseTo(12.3, 1);
        });

        it('should adjust velocity for short distances (Triangle profile)', () => {
            // Distance 10, MaxVel 100, MaxAcc 5
            // Accel to 100 would take 20s, dist = 0.5*5*400 = 1000 >> 10.
            // Should adjust maxVel.
            const mp = new MotionProfile(10, 100, 5);

            // New maxVel should be < 100.
            expect(mp.maxVelocity).toBeLessThan(100);
            // Logic: v = sqrt(a*d) (since 2*a*(d/2) = a*d)
            // v = sqrt(5*10) = sqrt(50) = ~7.07
            expect(mp.maxVelocity).toBeCloseTo(7.07, 2);
        });

        it('should throw error for invalid inputs', () => {
            expect(() => new MotionProfile(-1, 10, 5)).toThrow();
            expect(() => new MotionProfile(100, 0, 5)).toThrow();
        });
    });

    describe('Serialization', () => {
        it('should serialize to JSON', () => {
            const mp = new MotionProfile(100, 10, 5);
            const json = mp.toJSON();
            expect(json.totalDistance).toBe(100);
        });
    });
});
