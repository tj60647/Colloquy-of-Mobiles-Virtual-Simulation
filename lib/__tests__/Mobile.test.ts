import { Mobile, MobileConfig } from '../Mobile';
import { Vector3 } from '../types/math';
import { MotionRequest } from '../subsystems/HorizontalControlSubsystem';

describe('Mobile', () => {
    let mobile: Mobile;
    let config: MobileConfig;

    beforeEach(() => {
        config = {
            name: 'TestMobile',
            initialPosition: { x: 0, y: 0, z: 0 },
            initialRotation: { x: 0, y: 0, z: 0 },
            drives: {
                O: { initialValue: 50, floor: 0, lowerLimit: 20, upperLimit: 80, max: 100, increment: 1, decrement: 10 },
                P: { initialValue: 50, floor: 0, lowerLimit: 20, upperLimit: 80, max: 100, increment: 1, decrement: 10 },
                interval: 1000,
                maxHistorySamples: 10
            },
            horizontalControl: {
                minPosition: -45,
                maxPosition: 45,
                reinforcementPosition: 0,
                frameRate: 10,
                maxVelocity: 5,
                maxAcceleration: 2
            }
        };

        mobile = new Mobile(config);
        // Stop timer for deterministic testing
        mobile.driveSubsystem.stopTimer();
    });

    afterEach(() => {
        mobile.driveSubsystem.stopTimer();
    });

    it('should initialize with correct name and position', () => {
        expect(mobile.name).toBe('TestMobile');
        expect(mobile.x).toBe(0); // Transform property
        expect(mobile.driveSubsystem.ODrive.currentValue).toBe(50);
    });

    it('should update orientation based on horizontal control (Oscillator)', () => {
        // Initial HCS position is min (-45).
        // Initial Rotation Y (Yaw) is 0.
        // Update calls HCS.act().
        // HCS starts at min (-45).
        // updateOrientation adds HCS.position to initialRotation.y.

        // Before update:
        // HCS.sensePosition() -> -45.
        // Rotation should reflect this?
        // Wait, updateOrientation is called in update().
        // Does constructor call updateOrientation? No.

        mobile.update(); // First update

        // HCS.sensePosition() is -45.
        // Rotation.yaw should be 0 + (-45) = -45.
        expect(mobile.yaw).toBe(-45);

        // Start moving HCS
        mobile.horizontalControlSubsystem.setMotion(MotionRequest.RELEASE);
        // Step forward
        mobile.update(); // Calls act(), moves HCS.

        // Should have moved towards +45.
        const newAngle = mobile.yaw;
        expect(newAngle).toBeGreaterThan(-45);
    });

    it('should add sensors and actuators as scene graph children', () => {
        const { LightSensor } = require('../components/LightSensor');
        const { SoundActuator } = require('../components/SoundActuator');

        const sensor = new LightSensor(null, { x: 0, y: 0, z: 0 }, { pitch: 0, yaw: 0, roll: 0 });
        const actuator = new SoundActuator(null, { x: 0, y: 0, z: 0 }, { pitch: 0, yaw: 0, roll: 0 });

        mobile.addSensor(sensor);
        mobile.addActuator(actuator);

        // Verify arrays
        expect(mobile.sensors.length).toBe(1);
        expect(mobile.actuators.length).toBe(1);

        // Verify scene graph hierarchy
        expect(mobile.children.length).toBe(2);
        expect(sensor.parent).toBe(mobile);
        expect(actuator.parent).toBe(mobile);

        // Verify removal
        mobile.removeSensor(sensor);
        expect(mobile.sensors.length).toBe(0);
        expect(mobile.children.length).toBe(1);
        expect(sensor.parent).toBeNull();
    });
});
