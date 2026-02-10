/**
 * Diagnostic script to test ID preservation
 */

import { Mobile } from './lib/Mobile';
import { Environment } from './lib/Environment';

// Create parent and child
const parent = new Mobile({
  name: 'Parent',
  initialPosition: { x: 0, y: 0, z: 0 },
  initialRotation: { x: 0, y: 0, z: 0 },
});

const child = new Mobile({
  name: 'Child',
  initialPosition: { x: 10, y: 0, z: 0 },
  initialRotation: { x: 0, y: 45, z: 0 },
  parent: parent,
});

console.log(`\n=== BEFORE SERIALIZATION ===`);
console.log(`Parent ID: ${parent.id}`);
console.log(`Child ID: ${child.id}`);
console.log(`Child's parent ID: ${child.parent?.id}`);

// Create environment and serialize
const env = new Environment();
env.addMobile(parent);
env.addMobile(child);

const json = env.toJSON();

console.log(`\n=== JSON ===`);
console.log(JSON.stringify(json, null, 2));

console.log(`\n=== IDs IN JSON ===`);
for (const m of json.mobiles) {
  console.log(`${m.name}: id=${m.id}, parentId=${m.parentId}`);
}

// Deserialize
console.log(`\n=== DESERIALIZING ===`);
const restored = Environment.fromJSON(json);

console.log(`\n=== AFTER DESERIALIZATION ===`);
for (const m of restored.mobiles) {
  console.log(`${m.name}: id=${m.id}, parent=${m.parent?.name} (parent.id=${m.parent?.id})`);
}

const restoredParent = restored.mobiles.find((m) => m.name === 'Parent');
const restoredChild = restored.mobiles.find((m) => m.name === 'Child');

console.log(`\n=== HIERARCHY CHECK ===`);
console.log(`Child's parent === Parent? ${restoredChild?.parent === restoredParent}`);
console.log(
  `Parent's children include Child? ${restoredParent?.children.includes(restoredChild!)}`
);
