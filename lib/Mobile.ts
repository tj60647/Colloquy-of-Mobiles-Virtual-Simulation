/**
 * Mobile.ts
 * 
 * Represents an autonomous moving entity (Male/Female) or structural component (Bar/Beam) in the simulation.
 * Extends Transform to participate in the scene hierarchy (e.g., Males attached to Bar).
 * 
 * Composes DriveSubsystem (Behavior), ControlSubsystems (Movement), and Components (Sensors/Actuators).
 * 
 * @see docs/reference/mcleish/system-design/
 */

import { HorizontalControlSubsystem, OscillatorConfig } from './subsystems/HorizontalControlSubsystem';
import { VerticalControlSubsystem } from './subsystems/VerticalControlSubsystem';
import { DriveSubsystem } from './subsystems/DriveSubsystem';
import { DriveSystemConfig } from './types/drives';
import { Transform, Euler } from './Transform';
import { Vector3 } from './math/Vector3';
import { SensorBase } from './components/SensorBase';
import { ActuatorBase } from './components/ActuatorBase';

export interface MobileConfig {
    name: string;
    parent?: Transform | null;
    initialPosition: { x: number, y: number, z: number };    // Local position
    initialRotation: { x: number, y: number, z: number };    // Local rotation (Euler)
    drives?: DriveSystemConfig;  // Optional: Defaults applied if missing
    horizontalControl?: OscillatorConfig; // Optional
    verticalControl?: OscillatorConfig;   // Optional (Females only)
}

export class Mobile extends Transform {
    // Subsystems
    public driveSubsystem: DriveSubsystem;
    public horizontalControlSubsystem: HorizontalControlSubsystem;
    public verticalControlSubsystem?: VerticalControlSubsystem; // Females only

    // Components (Scene Graph Children)
    public sensors: SensorBase[] = [];
    public actuators: ActuatorBase[] = [];

    // Configuration
    private _config: MobileConfig;

    constructor(config: MobileConfig) {
        // Map config to Transform constructor (yaw/pitch/roll vs x/y/z)
        // Assuming config.initialRotation is {x: pitch, y: yaw, z: roll}?
        // Or {x, y, z} representing Euler angles directly?
        // Let's assume standard Euler: x=pitch, y=yaw, z=roll? 
        // Legacy Agent.js used P5 rotate(x), rotate(y), rotate(z).
        // Standard convention: x=pitch, y=yaw, z=roll.

        super(
            config.parent ?? null,
            config.initialPosition,
            {
                pitch: config.initialRotation.x,
                yaw: config.initialRotation.y,
                roll: config.initialRotation.z
            },
            config.name
        );

        this._config = config;

        // Initialize Drive Subsystem with defaults if needed
        const driveConfig = config.drives ?? {
            O: { initialValue: 50, floor: 0, lowerLimit: 20, upperLimit: 80, max: 100, increment: 1, decrement: 10 },
            P: { initialValue: 50, floor: 0, lowerLimit: 20, upperLimit: 80, max: 100, increment: 1, decrement: 10 },
            interval: 100,
            maxHistorySamples: 100
        };
        this.driveSubsystem = new DriveSubsystem(driveConfig);

        // Initialize Horizontal Control (Oscillator)
        const oscConfig = config.horizontalControl ?? {
            minPosition: -60,
            maxPosition: 60,
            reinforcementPosition: 0,
            frameRate: 60,
            maxVelocity: 5,
            maxAcceleration: 2
        };
        this.horizontalControlSubsystem = new HorizontalControlSubsystem(oscConfig);
    }

    /**
     * Update the Mobile state (Simulation Tick).
     */
    update(): void {
        // Update horizontal control
        this.horizontalControlSubsystem.act();

        // Update vertical control if present (Females)
        if (this.verticalControlSubsystem) {
            this.verticalControlSubsystem.act();
        }

        // Update orientation based on subsystems
        this.updateOrientation();
    }

    private updateOrientation(): void {
        const angleOffset = this.horizontalControlSubsystem.sensePosition();
        this.yaw = this._config.initialRotation.y + angleOffset;

        // Update roll if vertical control is present (Females)
        if (this.verticalControlSubsystem) {
            const rollOffset = this.verticalControlSubsystem.sensePosition();
            this.roll = this._config.initialRotation.z + rollOffset;
        }
    }

    /**
     * Add a sensor component to this Mobile.
     * The sensor becomes a child in the scene graph.
     */
    addSensor(sensor: SensorBase): void {
        this.sensors.push(sensor);
        this.addChild(sensor);
    }

    /**
     * Add an actuator component to this Mobile.
     * The actuator becomes a child in the scene graph.
     */
    addActuator(actuator: ActuatorBase): void {
        this.actuators.push(actuator);
        this.addChild(actuator);
    }

    /**
     * Remove a sensor component from this Mobile.
     */
    removeSensor(sensor: SensorBase): void {
        const index = this.sensors.indexOf(sensor);
        if (index > -1) {
            this.sensors.splice(index, 1);
            this.removeChild(sensor);
        }
    }

    /**
     * Remove an actuator component from this Mobile.
     */
    removeActuator(actuator: ActuatorBase): void {
        const index = this.actuators.indexOf(actuator);
        if (index > -1) {
            this.actuators.splice(index, 1);
            this.removeChild(actuator);
        }
    }

    // Helper for visualization compatibility
    getOrientationVector(): { x: number, y: number } {
        // 2D projection of yaw
        const rad = Vector3.toRadians(this.yaw);
        return {
            x: Math.cos(rad),
            y: Math.sin(rad)
        };
    }

    // Serialization override
    toJSON() {
        const json: any = {
            ...super.toJSON(), // Includes id, name, localPos, localOri, parentId
            drives: this.driveSubsystem.toJSON(),
            horizontalControl: this.horizontalControlSubsystem.toJSON(),
            sensors: this.sensors.map(s => s.toJSON()),
            actuators: this.actuators.map(a => a.toJSON())
        };

        // Include vertical control if present (Females)
        if (this.verticalControlSubsystem) {
            json.verticalControl = this.verticalControlSubsystem.toJSON();
        }

        return json;
    }

    /**
     * Deserialize a Mobile from JSON.
     * Note: Parent must be set separately via scene graph reconstruction.
     */
    static fromJSON(json: any, parent: Transform | null = null): Mobile {
        // Reconstruct config from JSON
        const config: MobileConfig = {
            name: json.name,
            initialPosition: json.localPosition,
            initialRotation: {
                x: json.localOrientation.pitch,
                y: json.localOrientation.yaw,
                z: json.localOrientation.roll
            },
            drives: json.drives.config,
            horizontalControl: json.horizontalControl.config,
            parent: parent
        };

        // Add vertical control config if present in JSON
        if (json.verticalControl) {
            config.verticalControl = json.verticalControl.config;
        }

        const mobile = new Mobile(config);

        // Restore subsystem states
        mobile.driveSubsystem = DriveSubsystem.fromJSON(json.drives);
        mobile.horizontalControlSubsystem = HorizontalControlSubsystem.fromJSON(json.horizontalControl);

        // Restore vertical control if present (Females)
        if (json.verticalControl) {
            mobile.verticalControlSubsystem = VerticalControlSubsystem.fromJSON(json.verticalControl);
        }

        // Restore sensors
        if (json.sensors) {
            for (const sensorJson of json.sensors) {
                // TODO: Need type discriminator to instantiate correct sensor subclass
                // For now, use SensorBase
                const sensor = SensorBase.fromJSON(sensorJson, mobile);
                mobile.addSensor(sensor);
            }
        }

        // Restore actuators
        if (json.actuators) {
            for (const actuatorJson of json.actuators) {
                // TODO: Need type discriminator to instantiate correct actuator subclass
                // For now, use ActuatorBase
                const actuator = ActuatorBase.fromJSON(actuatorJson, mobile);
                mobile.addActuator(actuator);
            }
        }

        return mobile;
    }
}
