import type { ReactNode } from 'react'

type Column<TData> = {
  key: string
  header: string
  render: (row: TData) => ReactNode
}

type AdminTableProps<TData> = {
  columns: Column<TData>[]
  rows: TData[]
  rowKey: (row: TData) => string | number
  isLoading?: boolean
  emptyMessage?: string
}

export default function AdminTable<TData>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  emptyMessage = 'No data found.',
}: AdminTableProps<TData>) {
  if (isLoading) {
    return <div className="rounded-xl border border-ink/10 bg-white/60 p-5 text-sm text-ink/65">Loading data...</div>
  }

  if (!rows.length) {
    return <div className="rounded-xl border border-dashed border-ink/20 bg-white/60 p-8 text-center text-sm text-ink/65">{emptyMessage}</div>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/65 shadow-sm dark:bg-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink/[0.03] text-xs uppercase tracking-[0.1em] text-ink/55">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-t border-ink/10">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top text-ink/80">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
