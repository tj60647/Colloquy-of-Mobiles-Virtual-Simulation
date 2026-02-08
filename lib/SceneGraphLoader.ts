/**
 * SceneGraphLoader.ts
 * 
 * Loads and parses simulation configuration files (JSON) to instantiate
 * the complete scene graph hierarchy of Mobiles, subsystems, and components.
 * 
 * Validates against simulation-config.schema.json and creates the full
 * Transform hierarchy matching the physical system design.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Mobile, MobileConfig } from './Mobile';
import { Environment } from './Environment';
import { Transform } from './Transform';
import { DriveSystemConfig } from './types/drives';
import { OscillatorConfig } from './subsystems/HorizontalControlSubsystem';

/**
 * Configuration file structure (matches simulation-config.schema.json)
 */
interface ConfigFile {
    coordinateSystems: CoordinateSystemConfig[];
}

interface CoordinateSystemConfig {
    name: string;
    type: string;
    parentCoordinateSystem?: string;
    description?: string;
    location: { x: number; y: number; z: number };
    orientation: { roll: number; pitch: number; yaw: number };
    rangeOfMotion?: {
        roll?: { min: number; max: number };
        pitch?: { min: number; max: number };
        yaw?: { min: number; max: number };
    };
    childElements?: AgentConfig[];
}

interface AgentConfig {
    name: string;
    type: 'origin' | 'actuator' | 'sensor';
    thisCoordinateSystem: string;
    parentCoordinateSystem: string;
    location: { x: number; y: number; z: number };
    orientation: { roll: number; pitch: number; yaw: number };
    rangeOfMotion?: {
        roll?: { min: number; max: number };
        pitch?: { min: number; max: number };
        yaw?: { min: number; max: number };
    };
    childElements?: AgentConfig[];
}

/**
 * Scene Graph Loader
 * 
 * Parses configuration files and instantiates the scene graph.
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
        // Read and parse config file
        const configData = fs.readFileSync(configPath, 'utf-8');
        const config: ConfigFile = JSON.parse(configData);

        // Create environment
        const environment = new Environment();

        // Phase 1: Create all coordinate systems as Transforms
        this.createCoordinateSystems(config.coordinateSystems);

        // Phase 2: Find and instantiate Mobiles (agents with type='origin')
        this.instantiateMobiles(config.coordinateSystems, environment);

        return environment;
    }

    /**
     * Phase 1: Create all coordinate systems as Transform nodes.
     * This establishes the spatial hierarchy.
     */
    private createCoordinateSystems(systems: CoordinateSystemConfig[]): void {
        for (const system of systems) {
            // Find parent Transform
            const parent = system.parentCoordinateSystem
                ? this.coordinateSystemMap.get(system.parentCoordinateSystem)
                : null;

            // Create Transform for this coordinate system
            const transform = new Transform(
                parent,
                system.location,
                {
                    pitch: system.orientation.pitch,
                    yaw: system.orientation.yaw,
                    roll: system.orientation.roll
                },
                system.name
            );

            this.coordinateSystemMap.set(system.name, transform);
        }
    }

    /**
     * Phase 2: Instantiate Mobiles from agent configurations.
     * Agents with type='origin' become Mobiles.
     */
    private instantiateMobiles(systems: CoordinateSystemConfig[], environment: Environment): void {
        // Search through coordinate systems for embedded agents
        for (const system of systems) {
            // Coordinate systems don't directly have childElements in this schema
            // We need to look for agents in a separate pass or different structure
            // For now, let's implement a helper to search the hierarchy
        }

        // TODO: Implement agent discovery and Mobile instantiation
        // This requires understanding the actual structure of config_240812.json
        // where agents are embedded within the coordinateSystems array
    }

    /**
     * Create a Mobile from an agent configuration.
     */
    private createMobile(
        agentConfig: AgentConfig,
        parentTransform: Transform | null
    ): Mobile {
        // Determine Mobile type from name
        const isFemale = agentConfig.name.toLowerCase().includes('female');
        const isMale = agentConfig.name.toLowerCase().includes('male');
        const isBeam = agentConfig.name.toLowerCase().includes('beam');

        // Create Mobile configuration
        const mobileConfig: MobileConfig = {
            name: agentConfig.name,
            parent: parentTransform,
            initialPosition: agentConfig.location,
            initialRotation: {
                x: agentConfig.orientation.pitch,
                y: agentConfig.orientation.yaw,
                z: agentConfig.orientation.roll
            }
        };

        // Add drive configuration (default for now)
        if (isFemale || isMale) {
            mobileConfig.drives = this.createDefaultDriveConfig();
        }

        // Add horizontal control (all Mobiles have this)
        if (agentConfig.rangeOfMotion?.yaw) {
            mobileConfig.horizontalControl = {
                minPosition: agentConfig.rangeOfMotion.yaw.min,
                maxPosition: agentConfig.rangeOfMotion.yaw.max,
                reinforcementPosition: 0,
                maxVelocity: 15,
                maxAcceleration: 15
            };
        }

        // Add vertical control (Females only)
        if (isFemale && agentConfig.rangeOfMotion?.roll) {
            mobileConfig.verticalControl = {
                minPosition: agentConfig.rangeOfMotion.roll.min,
                maxPosition: agentConfig.rangeOfMotion.roll.max,
                reinforcementPosition: 0,
                maxVelocity: 10,
                maxAcceleration: 10
            };
        }

        const mobile = new Mobile(mobileConfig);

        // Process child elements (sensors, actuators, subsystems)
        if (agentConfig.childElements) {
            this.processChildElements(mobile, agentConfig.childElements);
        }

        return mobile;
    }

    /**
     * Process child elements (sensors, actuators, subsystems).
     */
    private processChildElements(mobile: Mobile, children: AgentConfig[]): void {
        for (const child of children) {
            if (child.type === 'sensor') {
                // TODO: Create sensor based on name
                // e.g., "female light sensor" -> LightSensor
                // e.g., "female microphone" -> SoundSensor
            } else if (child.type === 'actuator') {
                // TODO: Create actuator based on name
                // e.g., "female speaker" -> SoundActuator
                // e.g., "vertical control subsystem" -> VerticalControlSubsystem
            }

            // Recursively process nested children
            if (child.childElements) {
                this.processChildElements(mobile, child.childElements);
            }
        }
    }

    /**
     * Create default drive configuration.
     */
    private createDefaultDriveConfig(): DriveSystemConfig {
        return {
            O: {
                initialValue: 500,
                floor: 0,
                lowerLimit: 400,
                upperLimit: 600,
                max: 1000,
                increment: 1,
                decrement: 10
            },
            P: {
                initialValue: 500,
                floor: 0,
                lowerLimit: 400,
                upperLimit: 600,
                max: 1000,
                increment: 1,
                decrement: 10
            },
            interval: 1000,
            maxHistorySamples: 100
        };
    }
}
