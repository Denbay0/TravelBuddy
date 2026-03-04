import { env } from '../config/env'

function joinUrl(base: string, path: string): string {
  if (!base || base === '/') return path
  return `${base.replace(/\/$/, '')}${path}`
}

export const reportService = {
  async downloadExamplePdf(): Promise<void> {
    const response = await fetch(joinUrl(env.apiBaseUrl, '/reports/example/pdf'), {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Не удалось скачать PDF отчёт.')
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'travelbuddy-example-report.pdf'
    link.click()
    URL.revokeObjectURL(link.href)
  },
}
