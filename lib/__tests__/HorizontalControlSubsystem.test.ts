import { HorizontalControlSubsystem, MotionRequest } from '../subsystems/HorizontalControlSubsystem';

describe('HorizontalControlSubsystem', () => {
    let osc: HorizontalControlSubsystem;

    beforeEach(() => {
        osc = new HorizontalControlSubsystem({
            minPosition: -10,
            maxPosition: 10,
            reinforcementPosition: 0,
            frameRate: 10, // 10fps for simple math
            maxVelocity: 5,
            maxAcceleration: 2
        });
    });

    it('should initialize at minPosition', () => {
        expect(osc.sensePosition()).toBe(-10);
    });

    it('should oscillate when RELEASED', () => {
        osc.setMotion(MotionRequest.RELEASE);
        // Should target max (10)

        // Step a bit
        for (let i = 0; i < 10; i++) osc.act();

        const pos = osc.sensePosition();
        console.log('Oscillate Pos after 10 steps:', pos);
        expect(pos).toBeGreaterThan(-10);
        expect(pos).toBeLessThanOrEqual(10);
    });

    it('should return to reinforcement on STOP', () => {
        // Move away from reinforcement first
        osc.setMotion(MotionRequest.RELEASE);
        for (let i = 0; i < 5; i++) osc.act(); // Move a bit

        const currentPos = osc.sensePosition();
        console.log('Pos before STOP:', currentPos);

        // Now STOP
        osc.setMotion(MotionRequest.STOP);
        // Should target 0.

        for (let i = 0; i < 100; i++) osc.act(); // Give plenty of time

        console.log('Pos after STOP:', osc.sensePosition());
        expect(osc.stopTargetReached).toBe(true);
        expect(osc.sensePosition()).toBeCloseTo(0, 0); // Precision 0 (integer)
    });
});
