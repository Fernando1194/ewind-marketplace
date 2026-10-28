// Gate de tipos por "catraca" (ratchet).
//
// O projeto tem erros de tipo antigos (ver scripts/typecheck-baseline.json). Reprovar tudo
// de uma vez travaria qualquer PR, então este script só reprova erros NOVOS: qualquer erro
// cuja impressão digital (arquivo + código + mensagem, sem número de linha) apareça mais
// vezes do que no baseline. Quando erros antigos são corrigidos, o script avisa para
// reduzir o baseline (rode com --update), e a catraca só anda num sentido.
//
// Uso:
//   node scripts/typecheck-ratchet.mjs            # verifica (usado no CI)
//   node scripts/typecheck-ratchet.mjs --update   # regrava o baseline com o estado atual

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const baselinePath = join(here, 'typecheck-baseline.json')
const update = process.argv.includes('--update')

const run = spawnSync('npx', ['tsc', '-b'], { encoding: 'utf8', shell: process.platform === 'win32' })
const output = `${run.stdout || ''}\n${run.stderr || ''}`

// Linha de erro: src/x.tsx(12,3): error TS1234: mensagem
const errorRe = /^(.+?)\(\d+,\d+\): error (TS\d+): (.+)$/
const current = {}
let total = 0
for (const line of output.split('\n')) {
  const m = errorRe.exec(line.trim())
  if (!m) continue
  const key = `${m[1].replace(/\\/g, '/')}|${m[2]}|${m[3].trim()}`
  current[key] = (current[key] || 0) + 1
  total++
}

// Falha de execução sem nenhum erro parseável (tsc quebrou, config inválida, etc.)
if (run.status !== 0 && total === 0) {
  console.error('tsc falhou sem produzir erros de tipo reconhecíveis. Saída:\n' + output)
  process.exit(2)
}

if (update) {
  writeFileSync(baselinePath, JSON.stringify({ total, errors: current }, null, 2) + '\n')
  console.log(`Baseline atualizado: ${total} erro(s) conhecido(s).`)
  process.exit(0)
}

if (!existsSync(baselinePath)) {
  console.error('Baseline ausente. Rode: node scripts/typecheck-ratchet.mjs --update')
  process.exit(2)
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')).errors || {}
const novos = []
for (const [key, n] of Object.entries(current)) {
  const antes = baseline[key] || 0
  if (n > antes) novos.push({ key, extra: n - antes })
}

let corrigidos = 0
for (const [key, n] of Object.entries(baseline)) {
  corrigidos += Math.max(0, n - (current[key] || 0))
}

if (novos.length) {
  console.error(`\n${novos.length} erro(s) de tipo NOVO(S) em relação ao baseline:\n`)
  for (const { key, extra } of novos) {
    const [file, code, msg] = key.split('|')
    console.error(`  ${file}  ${code}  ${msg}${extra > 1 ? `  (+${extra})` : ''}`)
  }
  console.error('\nCorrija os erros acima. Não atualize o baseline para esconder erro novo.')
  process.exit(1)
}

console.log(`OK: nenhum erro de tipo novo (${total} antigos no baseline).`)
if (corrigidos > 0) {
  console.log(`${corrigidos} erro(s) antigo(s) foram corrigidos. Rode "node scripts/typecheck-ratchet.mjs --update" e commite o baseline menor.`)
}
