/**
 * Simple test script for SceneGraphLoader v2
 */

import { SceneGraphLoader } from './lib/SceneGraphLoader';
import * as path from 'path';

async function testLoader() {
    console.log('Testing SceneGraphLoader with config_v2.json...\n');

    const configPath = path.resolve(__dirname, 'apps/SimulationConfigurationFiles/config_v2.json');
    console.log(`Config path: ${configPath}\n`);

    try {
        const environment = await SceneGraphLoader.loadFromFile(configPath);

        console.log(`✅ Successfully loaded config!`);
        console.log(`\nMobiles created: ${environment.mobiles.length}`);

        environment.mobiles.forEach((mobile, i) => {
            console.log(`\n${i + 1}. ${mobile.name}`);
            console.log(`   - Horizontal Control: ${mobile.horizontalControlSubsystem ? '✓' : '✗'}`);
            console.log(`   - Vertical Control: ${mobile.verticalControlSubsystem ? '✓' : '✗'}`);
            console.log(`   - Sensors: ${mobile.sensors.length}`);
            console.log(`   - Actuators: ${mobile.actuators.length}`);
        });

        console.log(`\n✅ All tests passed!`);
    } catch (error) {
        console.error(`❌ Error loading config:`, error);
        process.exit(1);
    }
}

testLoader();
