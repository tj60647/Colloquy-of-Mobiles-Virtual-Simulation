// Minimal test to diagnose serialization issue
import { Mobile } from './lib/Mobile';
import { Environment } from './lib/Environment';

console.log('=== Creating Mobile 1 ===');
const mobile1 = new Mobile({
  name: 'Parent Mobile',
  initialPosition: { x: 0, y: 0, z: 0 },
  initialRotation: { x: 0, y: 0, z: 0 },
});

console.log(`mobile1.id: ${mobile1.id}`);
console.log(`mobile1.name: ${mobile1.name}`);

console.log('\n=== Creating Mobile 2 with mobile1 as parent ===');
const mobile2 = new Mobile({
  name: 'Child Mobile',
  initialPosition: { x: 10, y: 0, z: 0 },
  initialRotation: { x: 0, y: 45, z: 0 },
  parent: mobile1,
});

console.log(`mobile2.id: ${mobile2.id}`);
console.log(`mobile2.name: ${mobile2.name}`);
console.log(`mobile2.parent?.id: ${mobile2.parent?.id}`);
console.log(`mobile2.parent?.name: ${mobile2.parent?.name}`);
console.log(`Are IDs different? ${mobile1.id !== mobile2.id}`);

const env = new Environment();
env.addMobile(mobile1);
env.addMobile(mobile2);

console.log('\n=== Serializing to JSON ===');
const json = env.toJSON();
const jsonStr = JSON.stringify(json, null, 2);
console.log(jsonStr.substring(0, 1000) + '...');

console.log('\n=== Deserializing from JSON ===');
const restored = Environment.fromJSON(json);

console.log(`\nRestored ${restored.mobiles.length} mobiles`);
for (const m of restored.mobiles) {
  console.log(`  ${m.name} (id: ${m.id}, parent: ${m.parent?.name || 'none'})`);
}

const restoredParent = restored.mobiles.find((m) => m.name === 'Parent Mobile');
const restoredChild = restored.mobiles.find((m) => m.name === 'Child Mobile');

console.log('\n=== Verification ===');
console.log(`Parent exists: ${!!restoredParent}`);
console.log(`Child exists: ${!!restoredChild}`);
console.log(`Child's parent: ${restoredChild?.parent?.name || 'NONE'}`);
console.log(`Parent's children count: ${restoredParent?.children.length || 0}`);
console.log(
  `SUCCESS: ${restoredChild?.parent === restoredParent && restoredParent?.children.includes(restoredChild!)}`
);
