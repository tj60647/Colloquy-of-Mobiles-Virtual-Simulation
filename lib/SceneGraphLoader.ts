/**
 * SceneGraphLoader.ts
 *
 * Loads and parses simulation configuration files (v2 format) to instantiate
 * the complete scene graph hierarchy of Mobiles, subsystems, and components.
 *
 * Config v2 features:
 * - Flat coordinate systems array with ID references
 * - Mobile-centric structure with inline subsystems/components
 * - Clear type discriminators (mobileType, subsystemType, componentType)
 * - Complete metadata (drives, motion profiles, FOV, etc.)
 */

import { Mobile, MobileConfig } from './Mobile';
import { Environment } from './Environment';
import { Transform } from './Transform';
import { DriveSystemConfig } from './types/drives';
import { OscillatorConfig } from './subsystems/Oscillator';
import { HorizontalControlSubsystem } from './subsystems/HorizontalControlSubsystem';
import { VerticalControlSubsystem } from './subsystems/VerticalControlSubsystem';
import { SoundSensor } from './components/SoundSensor';
import { LightSensor } from './components/LightSensor';
import { SoundActuator } from './components/SoundActuator';

/**
 * Configuration file structure (v2 format)
 */
interface ConfigFileV2 {
  version: string;
  metadata?: {
    name: string;
    date: string;
    description: string;
  };
  world?: {
    gravity: { x: number; y: number; z: number };
    ambientLight: number;
  };
  coordinateSystems: CoordinateSystemV2[];
  mobiles: MobileConfigV2[];
}

interface CoordinateSystemV2 {
  id: string;
  name: string;
  parent: string | null;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

interface MobileConfigV2 {
  id: string;
  name: string;
  mobileType: 'female' | 'male' | 'beam';
  coordinateSystem: string;
  drives: {
    orange: DriveParams;
    puce: DriveParams;
  };
  subsystems: SubsystemConfigV2[];
  components: ComponentConfigV2[];
}

interface DriveParams {
  initialValue: number;
  lowerLimit: number;
  upperLimit: number;
  maximum: number;
  incrementRate: number;
  decrementRate: number;
}

interface SubsystemConfigV2 {
  type: 'horizontal_control' | 'vertical_control';
  coordinateSystem: string;
  rangeOfMotion: {
    axis: 'yaw' | 'pitch' | 'roll';
    min: number;
    max: number;
  };
  motionProfile: {
    maxVelocity: number;
    maxAcceleration: number;
    maxJerk?: number;
  };
  reinforcementPosition: number;
  tolerance: number;
}

interface ComponentConfigV2 {
  type: 'sound_actuator' | 'sound_sensor' | 'light_sensor' | 'light_actuator';
  name: string;
  localPosition: { x: number; y: number; z: number };
  localRotation: { x: number; y: number; z: number };
  fieldOfView: number;
  maxIntensity?: number;
  sensitivity?: number;
  frequencyRange?: { min: number; max: number };
}

/**
 * Scene Graph Loader (v2)
 *
 * Parses config v2 files and instantiates the scene graph.
 */
export class SceneGraphLoader {
  private coordinateSystemMap: Map<string, Transform> = new Map();
  private mobileMap: Map<string, Mobile> = new Map();

  /**
   * Load a configuration file and create the scene graph.
   *
   * @param configPath - Absolute path to the configuration JSON file
   * @returns Environment containing all loaded Mobiles
   */
  static async loadFromFile(configPath: string): Promise<Environment> {
    const loader = new SceneGraphLoader();
    return loader.load(configPath);
  }

  /**
   * Load configuration and build scene graph.
   */
  private async load(configPath: string): Promise<Environment> {
    // Read config file (browser: fetch, Node: fs)
    let configData: string;
    if (typeof window !== 'undefined') {
      // Browser environment
      const response = await fetch(configPath);
      configData = await response.text();
    } else {
      // Node environment (tests)
      const fs = await import('fs/promises');
      configData = await fs.readFile(configPath, 'utf-8');
    }
    const config: ConfigFileV2 = JSON.parse(configData);

    // Validate version
    if (config.version !== '2.0') {
      throw new Error(`Unsupported config version: ${config.version}. Expected 2.0`);
    }

    // Create environment
    const environment = new Environment();

    // Phase 1: Create coordinate system hierarchy
    this.createCoordinateSystems(config.coordinateSystems);

    // Phase 2: Create Mobiles
    for (const mobileConfig of config.mobiles) {
      const mobile = this.createMobile(mobileConfig);
      environment.addMobile(mobile);
      this.mobileMap.set(mobileConfig.id, mobile);
    }

    return environment;
  }

  /**
   * Phase 1: Create all coordinate systems as Transform nodes.
   * This establishes the spatial hierarchy.
   */
  private createCoordinateSystems(systems: CoordinateSystemV2[]): void {
    for (const cs of systems) {
      const parent = cs.parent ? this.coordinateSystemMap.get(cs.parent) : null;

      if (cs.parent && !parent) {
        throw new Error(`Parent coordinate system not found: ${cs.parent} for ${cs.id}`);
      }

      const transform = new Transform(
        parent,
        cs.position,
        {
          yaw: cs.rotation.y,
          pitch: cs.rotation.x,
          roll: cs.rotation.z,
        },
        cs.name
      );

      this.coordinateSystemMap.set(cs.id, transform);
    }
  }

  /**
   * Phase 2: Create a Mobile from config.
   */
  private createMobile(config: MobileConfigV2): Mobile {
    // Get coordinate system Transform
    const coordinateSystem = this.coordinateSystemMap.get(config.coordinateSystem);
    if (!coordinateSystem) {
      throw new Error(
        `Coordinate system not found: ${config.coordinateSystem} for Mobile ${config.id}`
      );
    }

    // Create Mobile configuration
    const globalOrientation = coordinateSystem.getGlobalOrientation();
    const mobileConfig: MobileConfig = {
      name: config.name,
      parent: coordinateSystem,
      initialPosition: coordinateSystem.localPosition,
      initialRotation: {
        x: globalOrientation.pitch,
        y: globalOrientation.yaw,
        z: globalOrientation.roll,
      },
      drives: this.createDriveConfig(config.drives),
    };

    // Create Mobile
    const mobile = new Mobile(mobileConfig);

    // Attach subsystems
    for (const subsystemConfig of config.subsystems) {
      this.attachSubsystem(mobile, subsystemConfig);
    }

    // Attach components
    for (const componentConfig of config.components) {
      this.attachComponent(mobile, componentConfig);
    }

    return mobile;
  }

  /**
   * Create drive configuration from config.
   */
  private createDriveConfig(drives: { orange: DriveParams; puce: DriveParams }): DriveSystemConfig {
    return {
      O: {
        initialValue: drives.orange.initialValue,
        floor: 0,
        lowerLimit: drives.orange.lowerLimit,
        upperLimit: drives.orange.upperLimit,
        max: drives.orange.maximum,
        increment: drives.orange.incrementRate,
        decrement: drives.orange.decrementRate,
      },
      P: {
        initialValue: drives.puce.initialValue,
        floor: 0,
        lowerLimit: drives.puce.lowerLimit,
        upperLimit: drives.puce.upperLimit,
        max: drives.puce.maximum,
        increment: drives.puce.incrementRate,
        decrement: drives.puce.decrementRate,
      },
      interval: 100,
      maxHistorySamples: 100,
    };
  }

  /**
   * Attach a subsystem to a Mobile.
   */
  private attachSubsystem(mobile: Mobile, config: SubsystemConfigV2): void {
    // Get coordinate system for this subsystem
    const coordinateSystem = this.coordinateSystemMap.get(config.coordinateSystem);
    if (!coordinateSystem) {
      throw new Error(
        `Coordinate system not found: ${config.coordinateSystem} for subsystem ${config.type}`
      );
    }

    // Create oscillator config
    const oscillatorConfig: OscillatorConfig = {
      minPosition: config.rangeOfMotion.min,
      maxPosition: config.rangeOfMotion.max,
      reinforcementPosition: config.reinforcementPosition,
      tolerance: config.tolerance,
      maxVelocity: config.motionProfile.maxVelocity,
      maxAcceleration: config.motionProfile.maxAcceleration,
      maxJerk: config.motionProfile.maxJerk,
    };

    // Create and attach subsystem
    if (config.type === 'horizontal_control') {
      mobile.horizontalControlSubsystem = new HorizontalControlSubsystem(oscillatorConfig);
      // Store reference to Transform for updates
      (mobile as any).horizontalTransform = coordinateSystem;
    } else if (config.type === 'vertical_control') {
      mobile.verticalControlSubsystem = new VerticalControlSubsystem(oscillatorConfig);
      // Store reference to Transform for updates
      (mobile as any).verticalTransform = coordinateSystem;
    }
  }

  /**
   * Attach a component to a Mobile.
   */
  private attachComponent(mobile: Mobile, config: ComponentConfigV2): void {
    switch (config.type) {
      case 'sound_sensor': {
        const soundSensor = new SoundSensor(
          mobile,
          config.localPosition,
          {
            yaw: config.localRotation.y,
            pitch: config.localRotation.x,
            roll: config.localRotation.z,
          },
          config.fieldOfView
        );
        mobile.addSensor(soundSensor);
        break;
      }

      case 'light_sensor': {
        const lightSensor = new LightSensor(
          mobile,
          config.localPosition,
          {
            yaw: config.localRotation.y,
            pitch: config.localRotation.x,
            roll: config.localRotation.z,
          },
          config.fieldOfView
        );
        mobile.addSensor(lightSensor);
        break;
      }

      case 'sound_actuator': {
        const soundActuator = new SoundActuator(
          mobile,
          config.localPosition,
          {
            yaw: config.localRotation.y,
            pitch: config.localRotation.x,
            roll: config.localRotation.z,
          },
          config.fieldOfView
        );
        mobile.addActuator(soundActuator);
        break;
      }

      case 'light_actuator':
        // TODO: Implement LightActuator
        console.warn(`Light actuator not yet implemented: ${config.name}`);
        break;

      default:
        throw new Error(`Unknown component type: ${(config as any).type}`);
    }
  }
}
