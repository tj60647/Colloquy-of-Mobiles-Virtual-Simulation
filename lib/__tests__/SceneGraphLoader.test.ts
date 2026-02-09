/**
 * Test for SceneGraphLoader with config v2
 */

import { SceneGraphLoader } from '../SceneGraphLoader';
import * as path from 'path';

describe('SceneGraphLoader v2', () => {
    it('should load config_v2.json and create all 6 Mobiles', async () => {
        const configPath = path.resolve(__dirname, '../../apps/SimulationConfigurationFiles/config_v2.json');

        const environment = await SceneGraphLoader.loadFromFile(configPath);

        // Verify 6 Mobiles created
        expect(environment.mobiles.length).toBe(6);

        // Verify Mobile names
        const mobileNames = environment.mobiles.map(m => m.name).sort();
        expect(mobileNames).toEqual([
            'Beam',
            'Female 1',
            'Female 2',
            'Female 3',
            'Male 1',
            'Male 2'
        ]);

        // Verify Females have vertical control
        const females = environment.mobiles.filter(m => m.name.startsWith('Female'));
        expect(females.length).toBe(3);
        females.forEach(female => {
            expect(female.horizontalControlSubsystem).toBeDefined();
            expect(female.verticalControlSubsystem).toBeDefined();
        });

        // Verify Males and Beam have only horizontal control
        const malesAndBeam = environment.mobiles.filter(m =>
            m.name.startsWith('Male') || m.name === 'Beam'
        );
        expect(malesAndBeam.length).toBe(3);
        malesAndBeam.forEach(mobile => {
            expect(mobile.horizontalControlSubsystem).toBeDefined();
            expect(mobile.verticalControlSubsystem).toBeUndefined();
        });

        // Verify components
        const female1 = environment.mobiles.find(m => m.name === 'Female 1');
        expect(female1).toBeDefined();
        if (female1) {
            expect(female1.sensors.length).toBe(2); // Microphone + Light Sensor
            expect(female1.actuators.length).toBe(1); // Speaker
        }
    });
});
