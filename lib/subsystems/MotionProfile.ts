/**
 * MotionProfile.ts
 * 
 * Generates a trapezoidal motion profile (Acceleration -> Cruise -> Deceleration).
 * Used for smooth movement of Mobiles.
 * 
 * Logic derived from 2018 reconstruction.
 */

export interface MotionPoint {
    position: number;
    velocity: number;
    acceleration: number;
    jerk: number;
}

export interface MotionProfileConfig {
    totalDistance: number;
    maxVelocity: number;
    maxAcceleration: number;
    maxJerk?: number;
    timestep?: number;
    initialVelocity?: number;
}

export class MotionProfile {
    totalDistance: number;
    maxVelocity: number;
    maxAcceleration: number;
    maxJerk: number;
    timestep: number;
    initialVelocity: number;
    profile: MotionPoint[] = [];

    // Statistics
    private _profile_minPosition = Infinity;
    private _profile_maxPosition = -Infinity;
    private _profile_minVelocity = Infinity;
    private _profile_maxVelocity = -Infinity;
    private _profile_minAcceleration = Infinity;
    private _profile_maxAcceleration = -Infinity;

    /**
     * Create a MotionProfile.
     */
    constructor(
        totalDistance: number,
        maxVelocity: number,
        maxAcceleration: number,
        maxJerk: number = 0.0,
        timestep: number = 0.1,
        initialVelocity: number = 0.0
    ) {
        if (totalDistance <= 0) throw new Error('totalDistance must be a positive number.');
        if (maxVelocity <= 0) throw new Error('maxVelocity must be a positive number.');
        if (maxAcceleration <= 0) throw new Error('maxAcceleration must be a positive number.');
        if (timestep <= 0) throw new Error('timestep must be a positive number.');
        if (initialVelocity < 0) throw new Error('initialVelocity cannot be negative.');

        this.totalDistance = totalDistance;
        this.maxVelocity = maxVelocity;
        this.maxAcceleration = maxAcceleration;
        this.maxJerk = maxJerk;
        this.timestep = timestep;
        this.initialVelocity = initialVelocity;

        this.generateMotionProfile();
    }

    /**
     * Generates the motion profile points.
     */
    private generateMotionProfile(): void {
        let currentPosition = 0;
        let currentVelocity = this.initialVelocity;

        // Calculate phases
        let accelerationTime = (this.maxVelocity - this.initialVelocity) / this.maxAcceleration;

        // d = v*t + 0.5*a*t^2
        let accelerationDistance =
            this.initialVelocity * accelerationTime +
            0.5 * this.maxAcceleration * Math.pow(accelerationTime, 2);

        if (isNaN(accelerationTime) || isNaN(accelerationDistance)) {
            throw new Error('Failed to calculate acceleration time or distance.');
        }

        // Adjust if distance is too short to reach max velocity (Triangle profile)
        if (accelerationDistance > this.totalDistance / 2) {
            // vf^2 = vi^2 + 2*a*d
            this.maxVelocity = Math.sqrt(
                this.initialVelocity * this.initialVelocity +
                this.maxAcceleration * this.totalDistance // (2 * a * (total/2))
            );

            accelerationTime = (this.maxVelocity - this.initialVelocity) / this.maxAcceleration;
            accelerationDistance =
                this.initialVelocity * accelerationTime +
                0.5 * this.maxAcceleration * Math.pow(accelerationTime, 2);
        }

        const decelerationDistance = accelerationDistance; // Symmetric deceleration
        const cruisingDistance = this.totalDistance - accelerationDistance - decelerationDistance;
        const cruisingTime = cruisingDistance / this.maxVelocity;

        if (cruisingDistance < -0.0001) { // Floating point tolerance
            // Should rely on earlier check but keeping safety
            throw new Error(`Invalid cruising distance: ${cruisingDistance}`);
        }

        // 1. Acceleration Phase
        const accelerationSteps = Math.ceil(accelerationTime / this.timestep);
        for (let i = 0; i <= accelerationSteps; i++) {
            const currentAcceleration = this.maxAcceleration;
            currentVelocity += currentAcceleration * this.timestep;
            currentPosition += currentVelocity * this.timestep;

            this.addPoint(currentPosition, currentVelocity, currentAcceleration);
        }

        // 2. Cruising Phase
        if (cruisingTime > 0) {
            const cruisingSteps = Math.ceil(cruisingTime / this.timestep);
            for (let i = 0; i <= cruisingSteps; i++) {
                currentPosition += this.maxVelocity * this.timestep;
                this.addPoint(currentPosition, this.maxVelocity, 0);
            }
        }

        // 3. Deceleration Phase
        // Assuming symmetric deceleration for now (same time as acceleration)
        for (let i = 0; i <= accelerationSteps; i++) {
            const currentAcceleration = -this.maxAcceleration;
            currentVelocity += currentAcceleration * this.timestep;
            currentPosition += currentVelocity * this.timestep;

            this.addPoint(currentPosition, currentVelocity, currentAcceleration);
        }
    }

    private addPoint(p: number, v: number, a: number) {
        this._profile_minPosition = Math.min(this._profile_minPosition, p);
        this._profile_maxPosition = Math.max(this._profile_maxPosition, p);
        this._profile_minVelocity = Math.min(this._profile_minVelocity, v);
        this._profile_maxVelocity = Math.max(this._profile_maxVelocity, v);
        this._profile_minAcceleration = Math.min(this._profile_minAcceleration, a);
        this._profile_maxAcceleration = Math.max(this._profile_maxAcceleration, a);

        this.profile.push({
            position: p,
            velocity: v,
            acceleration: a,
            jerk: (a !== 0) ? (a > 0 ? this.maxJerk : -this.maxJerk) : 0 // Simplified jerk
        });
    }

    // Getters
    get profile_minPosition() { return this._profile_minPosition; }
    get profile_maxPosition() { return this._profile_maxPosition; }
    get profile_minVelocity() { return this._profile_minVelocity; }
    get profile_maxVelocity() { return this._profile_maxVelocity; }
    get profile_minAcceleration() { return this._profile_minAcceleration; }
    get profile_maxAcceleration() { return this._profile_maxAcceleration; }

    get profile_duration(): number {
        return this.profile.length * this.timestep;
    }

    toString(): string {
        return `Motion Profile Summary:
      Points: ${this.profile.length}
      Duration: ${this.profile_duration.toFixed(2)}s
      Pos: [${this.profile_minPosition.toFixed(2)}, ${this.profile_maxPosition.toFixed(2)}]
      Vel: [${this.profile_minVelocity.toFixed(2)}, ${this.profile_maxVelocity.toFixed(2)}]`;
    }

    toJSON(): MotionProfileConfig {
        return {
            totalDistance: this.totalDistance,
            maxVelocity: this.maxVelocity,
            maxAcceleration: this.maxAcceleration,
            maxJerk: this.maxJerk,
            timestep: this.timestep,
            initialVelocity: this.initialVelocity,
        };
    }

    static fromJSON(json: MotionProfileConfig): MotionProfile {
        return new MotionProfile(
            json.totalDistance,
            json.maxVelocity,
            json.maxAcceleration,
            json.maxJerk,
            json.timestep,
            json.initialVelocity
        );
    }
}
