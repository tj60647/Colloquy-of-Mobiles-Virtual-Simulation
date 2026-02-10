/**
 * Build all TypeScript demos for deployment
 *
 * This script:
 * 1. Finds all demo-TS-* directories
 * 2. Runs npm install and npm run build for each
 * 3. Copies built files to deployment directory
 * 4. Creates gallery landing page
 */

import { readdirSync, existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const APPS_DIR = resolve('apps');
const DIST_DIR = resolve('dist');
const PUBLIC_DIR = resolve('apps/public');

console.log('🏗️  Building all demos for deployment\n');

// Clean dist directory
if (existsSync(DIST_DIR)) {
  console.log('🧹 Cleaning dist directory...');
  rmSync(DIST_DIR, { recursive: true, force: true });
}
mkdirSync(DIST_DIR, { recursive: true });

// Copy gallery files (landing page)
console.log('\n📄 Copying gallery landing page...');
if (existsSync(join(PUBLIC_DIR, 'index.html'))) {
  cpSync(join(PUBLIC_DIR, 'index.html'), join(DIST_DIR, 'index.html'));
}
if (existsSync(join(PUBLIC_DIR, 'gallery.css'))) {
  cpSync(join(PUBLIC_DIR, 'gallery.css'), join(DIST_DIR, 'gallery.css'));
}
console.log('✅ Gallery copied');

// Find all demo directories
const demos = readdirSync(APPS_DIR)
  .filter((name) => name.startsWith('demo-TS-'))
  .filter((name) => {
    const demoPath = join(APPS_DIR, name);
    return existsSync(join(demoPath, 'package.json'));
  });

console.log(`\n📦 Found ${demos.length} demos to build:\n`);
demos.forEach((demo) => console.log(`   - ${demo}`));

// Build each demo
let successCount = 0;
let failureCount = 0;

for (const demo of demos) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔨 Building ${demo}...`);
  console.log('='.repeat(60));

  const demoPath = join(APPS_DIR, demo);

  try {
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', {
      cwd: demoPath,
      stdio: 'inherit',
    });

    // Build
    console.log('🔨 Building...');
    execSync('npm run build', {
      cwd: demoPath,
      stdio: 'inherit',
    });

    // Copy build output
    const demoDist = join(demoPath, 'dist');
    const targetDist = join(DIST_DIR, demo);

    if (existsSync(demoDist)) {
      console.log(`📋 Copying to ${demo}/`);
      cpSync(demoDist, targetDist, { recursive: true });
      console.log(`✅ ${demo} built successfully`);
      successCount++;
    } else {
      console.error(`❌ Build output not found for ${demo}`);
      failureCount++;
    }
  } catch (error) {
    console.error(`❌ Failed to build ${demo}:`, error.message);
    failureCount++;
  }
}

// Summary
console.log(`\n${'='.repeat(60)}`);
console.log('📊 Build Summary');
console.log('='.repeat(60));
console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Failed: ${failureCount}`);
console.log(`📁 Output directory: ${DIST_DIR}`);

if (failureCount === 0) {
  console.log('\n🎉 All demos built successfully!');
  console.log('\n📤 Ready to deploy:');
  console.log('   vercel deploy --prod');
  process.exit(0);
} else {
  console.log('\n⚠️  Some demos failed to build');
  process.exit(1);
}
