// Build entry used by `npm run build` (and by Vercel).
// The `demo` branch builds the demo version (vite --mode demo, see .env.demo and
// src/demo/); every other branch builds the real site. This keeps the demo branch
// identical to main: publishing the demo is just pushing main to demo.
import { execSync } from 'node:child_process'

const branch = process.env.VERCEL_GIT_COMMIT_REF || ''
const mode = branch === 'demo' || process.argv.includes('--demo') ? 'demo' : 'production'

console.log(`[build] mode: ${mode}${branch ? ` (branch ${branch})` : ''}`)
execSync('tsc -p tsconfig.json', { stdio: 'inherit' })
execSync(`vite build --mode ${mode}`, { stdio: 'inherit' })
