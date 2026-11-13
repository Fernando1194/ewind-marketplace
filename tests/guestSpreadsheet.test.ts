// Run with `npm test` (Node's built-in test runner, no extra dependencies; needs Node 22.18+).
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseGuestRows } from '../src/lib/guestSpreadsheet.ts'

describe('parseGuestRows', () => {
  it('skips the header row and blank rows', () => {
    const guests = parseGuestRows([
      ['Nome', 'Status', 'Categoria', 'Cobrança', 'Telefone', 'Email'],
      ['Maria Silva', 'confirmado', 'adulto', 'inteira', '(41) 99999-0001', 'maria@email.com'],
      [null],
      ['   '],
    ])
    assert.deepEqual(guests, [
      { name: 'Maria Silva', status: 'confirmed', category: 'adult', billing: 'full', phone: '(41) 99999-0001', email: 'maria@email.com' },
    ])
  })

  it('reads a sheet without a header from the first row', () => {
    assert.equal(parseGuestRows([['Carlos Souza']]).length, 1)
  })

  it('defaults to pending, adult and full price when only the name is given', () => {
    assert.deepEqual(parseGuestRows([['Carlos Souza']])[0], {
      name: 'Carlos Souza', status: 'pending', category: 'adult', billing: 'full', phone: null, email: null,
    })
  })

  const statuses: [string, string][] = [
    ['confirmado', 'confirmed'], ['Confirmed', 'confirmed'], ['sim', 'confirmed'],
    ['recusado', 'declined'], ['não', 'declined'], ['nao', 'declined'], ['declined', 'declined'],
    ['pendente', 'pending'], ['', 'pending'], ['talvez', 'pending'],
    // contain "confirm" but mean the opposite
    ['não confirmado', 'pending'], ['nao confirmou', 'pending'], ['not confirmed', 'pending'],
  ]
  for (const [raw, status] of statuses) {
    it(`maps status "${raw}" to ${status}`, () => {
      assert.equal(parseGuestRows([['Ana', raw]])[0].status, status)
    })
  }

  it('applies the billing default of each category when billing is blank', () => {
    const [baby, child, adult] = parseGuestRows([
      ['Bebê Ana', '', 'bebê'], ['João', '', 'criança'], ['Rita', '', 'adulto'],
    ])
    assert.deepEqual([baby.billing, child.billing, adult.billing], ['exempt', 'half', 'full'])
  })

  it('keeps an explicit billing value over the category default', () => {
    assert.equal(parseGuestRows([['João', '', 'criança', 'inteira']])[0].billing, 'full')
    assert.equal(parseGuestRows([['Rita', '', 'adulto', 'isento']])[0].billing, 'exempt')
  })

  it('accepts numeric cells, such as a phone typed as a number', () => {
    assert.equal(parseGuestRows([['Ana', '', '', '', 41999990001]])[0].phone, '41999990001')
  })
})
