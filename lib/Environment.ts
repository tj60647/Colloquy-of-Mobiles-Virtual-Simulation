import { Mobile } from './Mobile';
import * as fs from 'fs';
import * as path from 'path';

export class Environment {
    private _mobiles: Mobile[] = [];

    constructor() {
        this._mobiles = [];
    }

    addMobile(mobile: Mobile): void {
        this._mobiles.push(mobile);
    }

    update(): void {
        this._mobiles.forEach(mobile => mobile.update());
    }

    get mobiles(): Mobile[] {
        return this._mobiles;
    }

    /**
     * Serialize the entire environment state.
     */
    toJSON() {
        return {
            mobiles: this._mobiles.map(m => m.toJSON())
        };
    }

    /**
     * Deserialize environment from JSON.
     * Reconstructs all mobiles and their scene graph hierarchy.
     */
    static fromJSON(json: any): Environment {
        const env = new Environment();
        const debugLog: string[] = [];

        // First pass: Create all mobiles without parents
        // Map from JSON id to Mobile (in case ID changes during construction)
        const mobileMap = new Map<number, Mobile>();
        for (const mobileJson of json.mobiles) {
            const mobile = Mobile.fromJSON(mobileJson, null);
            debugLog.push(`Created ${mobile.name}, JSON id=${mobileJson.id}, mobile.id=${mobile.id}`);
            mobileMap.set(mobileJson.id, mobile); // Key by JSON id for lookup consistency
            env.addMobile(mobile);
        }
        debugLog.push(`Map has keys: ${Array.from(mobileMap.keys())}`);

        // Second pass: Restore parent relationships
        for (const mobileJson of json.mobiles) {
            if (mobileJson.parentId && mobileJson.parentId !== mobileJson.id) {
                debugLog.push(`Looking up ${mobileJson.name} (id=${mobileJson.id}) and parent (id=${mobileJson.parentId})`);
                const mobile = mobileMap.get(mobileJson.id);
                const parent = mobileMap.get(mobileJson.parentId);
                debugLog.push(`mobile=${mobile?.name}, parent=${parent?.name}, same?=${mobile === parent}`);
                if (mobile && parent && mobile !== parent) {
                    parent.addChild(mobile);
                }
            }
        }

        // Write debug log
        try {
            fs.writeFileSync('c:/Users/tj/repos/Colloquy-of-Mobiles-Virtual-Simulation/debug-fromJSON.log', debugLog.join('\n'));
        } catch (e) {
            console.error('Failed to write debug log:', e);
        }

        return env;
    }
}
