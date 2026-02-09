// Diagnostic script for black page issues
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing ERP Black Page Issues...\n');

// Check critical files exist
const criticalFiles = [
  'src/main.tsx',
  'src/App.tsx', 
  'src/index.css',
  'src/pages/auth/Login.tsx',
  'src/contexts/AuthContext.tsx',
  'vite.config.ts',
  'package.json'
];

console.log('📁 Checking critical files:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = pkg.scripts || {};
  ['dev', 'build', 'preview'].forEach(script => {
    console.log(`${scripts[script] ? '✅' : '❌'} ${script}: ${scripts[script] || 'MISSING'}`);
  });
} catch (e) {
  console.log('❌ Cannot read package.json');
}

// Check for TypeScript errors
console.log('\n🔧 Checking TypeScript config:');
const tsConfigs = ['tsconfig.json', 'tsconfig.app.json'];
tsConfigs.forEach(config => {
  const exists = fs.existsSync(config);
  console.log(`${exists ? '✅' : '❌'} ${config}`);
});

// Check environment files
console.log('\n🌐 Checking environment files:');
const envFiles = ['.env', '.env.local', '.env.example'];
envFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Quick syntax check of App.tsx
console.log('\n📄 Quick App.tsx syntax check:');
try {
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  const issues = [];
  
  if (!appContent.includes('BrowserRouter')) issues.push('Missing BrowserRouter');
  if (!appContent.includes('AuthProvider')) issues.push('Missing AuthProvider');
  if (!appContent.includes('Login')) issues.push('Missing Login component');
  
  if (issues.length === 0) {
    console.log('✅ App.tsx structure looks good');
  } else {
    console.log(`❌ Issues: ${issues.join(', ')}`);
  }
} catch (e) {
  console.log('❌ Cannot read App.tsx');
}

console.log('\n💡 Diagnosis complete.');
console.log('\nNext steps:');
console.log('1. Run: npm run build (check for build errors)');
console.log('2. Check browser console for runtime errors');
console.log('3. Verify localhost:5176 is accessible');