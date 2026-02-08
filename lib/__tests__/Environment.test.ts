import { Environment } from '../Environment';
import { Mobile } from '../Mobile';

describe('Environment Serialization', () => {
    let env: Environment;
    let mobile1: Mobile;
    let mobile2: Mobile;

    beforeEach(() => {
        env = new Environment();

        // Create a simple hierarchy: mobile1 (parent) -> mobile2 (child)
        mobile1 = new Mobile({
            name: 'Parent Mobile',
            initialPosition: { x: 0, y: 0, z: 0 },
            initialRotation: { x: 0, y: 0, z: 0 }
        });

        mobile2 = new Mobile({
            name: 'Child Mobile',
            initialPosition: { x: 10, y: 0, z: 0 },
            initialRotation: { x: 0, y: 45, z: 0 },
            parent: mobile1
        });

        env.addMobile(mobile1);
        env.addMobile(mobile2);
    });

    it('should serialize environment to JSON', () => {
        const json = env.toJSON();

        expect(json.mobiles).toBeDefined();
        expect(json.mobiles.length).toBe(2);
        expect(json.mobiles[0].name).toBe('Parent Mobile');
        expect(json.mobiles[1].name).toBe('Child Mobile');
        expect(json.mobiles[1].parentId).toBe(mobile1.id);
    });

    it('should deserialize environment from JSON', () => {
        const json = env.toJSON();
        const restored = Environment.fromJSON(json);

        expect(restored.mobiles.length).toBe(2);

        const restoredParent = restored.mobiles.find(m => m.name === 'Parent Mobile');
        const restoredChild = restored.mobiles.find(m => m.name === 'Child Mobile');

        expect(restoredParent).toBeDefined();
        expect(restoredChild).toBeDefined();

        // Verify hierarchy
        expect(restoredChild!.parent).toBe(restoredParent);
        expect(restoredParent!.children).toContain(restoredChild);
    });

    it('should preserve drive states through serialization', () => {
        // Modify drive state
        mobile1.driveSubsystem.ODrive.increment(100);
        mobile1.driveSubsystem.PDrive.increment(200);

        const json = env.toJSON();
        const restored = Environment.fromJSON(json);

        const restoredMobile = restored.mobiles.find(m => m.name === 'Parent Mobile');
        expect(restoredMobile!.driveSubsystem.ODrive.currentValue).toBe(
            mobile1.driveSubsystem.ODrive.currentValue
        );
        expect(restoredMobile!.driveSubsystem.PDrive.currentValue).toBe(
            mobile1.driveSubsystem.PDrive.currentValue
        );
    });
});
