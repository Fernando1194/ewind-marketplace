// Guest list spreadsheet: the downloadable template and the import parser.
// The libraries are loaded on demand, so they stay out of the main bundle.

export type Cell = string | number | boolean | Date | null | undefined

export interface ParsedGuest {
  name: string
  status: 'pending' | 'confirmed' | 'declined'
  category: 'adult' | 'child' | 'baby'
  billing: 'full' | 'half' | 'exempt'
  phone: string | null
  email: string | null
}

const TEMPLATE_FILE = 'modelo-lista-convidados-ewind.xlsx'

// Builds the standard template (list + instructions sheet) and triggers the download.
export async function downloadGuestTemplate(): Promise<void> {
  const { default: writeExcelFile } = await import('write-excel-file/browser')

  // Header + example rows
  const headers = ['Nome', 'Status', 'Categoria', 'Cobrança', 'Telefone', 'Email']
  const examples = [
    ['Maria Silva', 'confirmado', 'adulto', 'inteira', '(41) 99999-0001', 'maria@email.com'],
    ['João Pedro', 'pendente', 'criança', 'meia', '(41) 99999-0002', 'joao@email.com'],
    ['Bebê Ana', 'confirmado', 'bebê', 'isento', null, null],
    ['Carlos Souza', 'recusado', 'adulto', 'inteira', null, null],
  ]

  // Sheet 2: instructions / legend
  const guide = [
    ['COMO PREENCHER A LISTA DE CONVIDADOS — EWIND'],
    [null],
    ['Preencha a aba "Convidados". Apenas a coluna NOME é obrigatória.'],
    ['As demais colunas são opcionais — se deixar em branco, usamos um padrão inteligente.'],
    [null],
    ['COLUNA', 'VALORES ACEITOS', 'OBSERVAÇÃO'],
    ['Nome', 'texto livre', 'Obrigatório'],
    ['Status', 'confirmado / pendente / recusado', 'Em branco = pendente. Aceita também: sim, não'],
    ['Categoria', 'adulto / criança / bebê', 'Em branco = adulto'],
    ['Cobrança', 'inteira / meia / isento', 'Em branco: bebê vira isento, criança vira meia, adulto inteira'],
    ['Telefone', 'texto livre', 'Opcional'],
    ['Email', 'texto livre', 'Opcional'],
    [null],
    ['DICA: não renomeie nem reordene as colunas da aba "Convidados".'],
    ['O cálculo de custo soma inteiras (100%) + meias (50%) e ignora isentos — só dos confirmados.'],
  ]

  await writeExcelFile([
    {
      data: [headers, ...examples],
      sheet: 'Convidados',
      columns: [{ width: 26 }, { width: 14 }, { width: 16 }, { width: 12 }, { width: 20 }, { width: 28 }],
    },
    {
      data: guide,
      sheet: 'Instruções',
      columns: [{ width: 16 }, { width: 38 }, { width: 50 }],
    },
  ]).toFile(TEMPLATE_FILE)
}

// Reads the first sheet of an .xlsx file as rows of cells.
export async function readGuestRows(file: Blob): Promise<Cell[][]> {
  const { readSheet } = await import('read-excel-file/browser')
  return (await readSheet(file)) as Cell[][]
}

// Maps spreadsheet rows to guests, filling in category/billing defaults.
export function parseGuestRows(rows: Cell[][]): ParsedGuest[] {
  let startRow = 0
  const firstRow = (rows[0] || []).map(x => String(x).toLowerCase())
  const hasHeader = firstRow.some(c => c.includes('nome') || c.includes('name') || c.includes('convidado'))
  if (hasHeader) startRow = 1

  const parsed: ParsedGuest[] = []
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i]
    if (!row || !row[0]) continue
    const name = String(row[0]).trim()
    if (!name) continue

    // col 1: status
    let status: ParsedGuest['status'] = 'pending'
    const rawStatus = String(row[1] || '').toLowerCase().trim()
    if (rawStatus.includes('confirm') || rawStatus === 'sim' || rawStatus === 'yes') status = 'confirmed'
    else if (rawStatus.includes('recus') || rawStatus.includes('declin') || rawStatus === 'não' || rawStatus === 'nao' || rawStatus === 'no') status = 'declined'

    // col 2: category
    let category: ParsedGuest['category'] = 'adult'
    const rawCat = String(row[2] || '').toLowerCase().trim()
    if (rawCat.includes('crian') || rawCat.includes('child')) category = 'child'
    else if (rawCat.includes('beb') || rawCat.includes('baby')) category = 'baby'

    // col 3: billing
    let billing: ParsedGuest['billing'] = 'full'
    const rawBill = String(row[3] || '').toLowerCase().trim()
    if (rawBill.includes('meia') || rawBill.includes('half')) billing = 'half'
    else if (rawBill.includes('isent') || rawBill.includes('exempt') || rawBill.includes('não paga') || rawBill.includes('nao paga')) billing = 'exempt'
    // auto: babies exempt, children half (when not specified)
    else if (rawBill === '') {
      if (category === 'baby') billing = 'exempt'
      else if (category === 'child') billing = 'half'
    }

    // col 4: phone, col 5: email
    const phone = row[4] ? String(row[4]).trim() : null
    const email = row[5] ? String(row[5]).trim() : null

    parsed.push({ name, status, category, billing, phone, email })
  }
  return parsed
}
