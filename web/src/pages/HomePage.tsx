import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Camera,
  Compass,
  FileText,
  Heart,
  Plane,
  Route,
  Trophy,
  Users,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const features = [
  ['Планирование маршрутов', 'Создавайте гибкие маршруты с этапами, заметками и совместным редактированием.', Route],
  ['Категории по транспорту', 'Сортируйте поездки по самолетам, колесным маршрутам и пешим прогулкам.', Plane],
  ['Истории и публикации', 'Собирайте визуальные истории поездок и делитесь ими в ленте.', Camera],
  ['Профиль путешественника', 'Личный travel-паспорт с динамикой, подборками и любимыми направлениями.', Trophy],
  ['Избранные маршруты', 'Сохраняйте лучшие маршруты друзей и возвращайтесь к ним перед новой поездкой.', Heart],
  ['Отчеты и дайджесты', 'Генерируйте стильные итоги поездок в PDF и web-формате.', FileText],
] as const

const heroCards: Array<{ title: string; subtitle: string; icon: LucideIcon }> = [
  { title: 'Маршрут “Скандинавская осень”', subtitle: '8 городов · 12 дней', icon: Compass },
  { title: 'Лента друзей', subtitle: '24 новых travel-истории', icon: Users },
  { title: 'Сезонный обзор', subtitle: '17 поездок · 46 мест', icon: BookOpen },
]

function downloadSamplePdf() {
  const lines = [
    'TravelBuddy Demo Report',
    'Маршрут: Санкт-Петербург -> Таллин -> Рига',
    'Длительность: 7 дней',
    'Транспорт: Поезд + Пешком',
    'Итог: 3 города, 640 км, 18 сохраненных мест',
  ]

  const stream = lines
    .map((line, index) => `BT /F1 12 Tf 50 ${760 - index * 18} Td (${line}) Tj ET`)
    .join('\n')

  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length ${stream.length} >> stream
${stream}
endstream endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000122 00000 n 
0000000248 00000 n 
0000000318 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
${390 + stream.length}
%%EOF`

  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'travelbuddy-demo-report.pdf'
  link.click()
  URL.revokeObjectURL(url)
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const demoRef = useRef<HTMLElement | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  return (
    <main>
      <section className="bg-hero-gradient px-6 pb-20 pt-16">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-amber/30 bg-white/70 px-4 py-2 text-sm text-amber">
              Лучший сайт для путешественников
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Планируйте маршруты, проживайте поездки и делитесь ими красиво.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink/70">
              TravelBuddy объединяет маршруты, истории, статистику и личный travel-профиль в одном современном веб-продукте.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button onClick={() => navigate('/routes')} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-white">
                Начать путешествие <ArrowRight size={16} />
              </button>
              <button onClick={() => demoRef.current?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full border border-ink/20 bg-white/70 px-6 py-3 font-medium">
                Смотреть демо
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {heroCards.map(({ title, subtitle, icon: Icon }) => (
              <article key={title} className="card-surface p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-ink/5 p-3">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-ink/65">{subtitle}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={demoRef} className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-semibold">Демо-витрина TravelBuddy</h2>
        <p className="mt-3 max-w-3xl text-ink/70">Ключевые сценарии в одном блоке: маршрут, профиль, лента и отчёты.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, desc, Icon]) => (
            <article key={title} className="card-surface p-6">
              <Icon className="text-amber" />
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-ink/65">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <article className="card-surface grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-3xl font-semibold">Отчеты, которые хочется пересматривать</h2>
            <p className="mt-4 text-ink/70">TravelBuddy превращает поездки в аккуратные отчеты: маршрут, статистика и ключевые выводы.</p>
            <button onClick={() => setIsReportOpen(true)} className="mt-8 rounded-full bg-ink px-6 py-3 text-white">
              Сгенерировать пример отчёта
            </button>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-ink to-pine p-6 text-white">
            <Waves />
            <p className="mt-4 text-sm text-white/75">Travel Digest</p>
            <p className="mt-2 text-2xl font-semibold">Весна 2026</p>
            <p className="mt-4 text-sm text-white/80">7 поездок · 12 городов · 4 новых маршрута с друзьями</p>
          </div>
        </article>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-ink px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-semibold md:text-4xl">TravelBuddy помогает не просто планировать поездки, а красиво проживать их</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/75">Один аккаунт для маршрутов, историй, статистики и любимых мест.</p>
          <button onClick={() => navigate(user ? '/profile' : '/register')} className="mt-8 rounded-full bg-white px-6 py-3 font-medium text-ink">
            Начать бесплатно
          </button>
        </div>
      </section>

      <AnimatePresence>
        {isReportOpen ? (
          <motion.div className="fixed inset-0 z-[60] bg-ink/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReportOpen(false)}>
            <motion.div
              className="mx-auto mt-20 max-w-xl rounded-3xl bg-white p-6 dark:bg-[#1c2230]"
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Пример travel-отчёта</h3>
                <button onClick={() => setIsReportOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-ink/70">Краткая выжимка маршрута и статистики. Можно скачать PDF прямо из фронтенда.</p>
              <button onClick={downloadSamplePdf} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm text-white">
                Скачать PDF
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  )
}
