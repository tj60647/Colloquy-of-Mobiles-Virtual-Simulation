import { Mobile } from './Mobile';

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

        // First pass: Create all mobiles without parents
        const mobileMap = new Map<number, Mobile>();
        for (const mobileJson of json.mobiles) {
            const mobile = Mobile.fromJSON(mobileJson, null);
            mobileMap.set(mobileJson.id, mobile);
            env.addMobile(mobile);
        }

        // Second pass: Restore parent relationships
        for (const mobileJson of json.mobiles) {
            if (mobileJson.parentId) {
                const mobile = mobileMap.get(mobileJson.id);
                const parent = mobileMap.get(mobileJson.parentId);
                if (mobile && parent) {
                    parent.addChild(mobile);
                }
            }
        }

        return env;
    }
}
