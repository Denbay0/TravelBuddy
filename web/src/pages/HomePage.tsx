import { motion } from 'framer-motion'
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
import { useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { reportService } from '../services/reportService'

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

const homepageHighlights: Array<{ title: string; description: string; icon: LucideIcon; preview: string[] }> = [
  {
    title: 'Маршруты',
    description: 'Собирайте этапы поездки, даты и заметки в аккуратный план, который легко обновлять.',
    icon: Route,
    preview: ['Париж', 'Лион', 'Женева'],
  },
  {
    title: 'Категории транспорта',
    description: 'Делите поездку по типам передвижения и быстро находите нужный сегмент маршрута.',
    icon: Plane,
    preview: ['Самолёт', 'Поезд', 'Пешком'],
  },
  {
    title: 'Сообщество',
    description: 'Публикуйте впечатления, сохраняйте идеи друзей и собирайте свои travel-находки.',
    icon: Users,
    preview: ['Лента друзей', 'Подборки', 'Комментарии'],
  },
  {
    title: 'Профиль путешественника',
    description: 'Следите за личной динамикой поездок и любимыми направлениями в одном профиле.',
    icon: Trophy,
    preview: ['17 поездок', '46 мест', 'Top-формат'],
  },
  {
    title: 'Отчёты',
    description: 'Получайте красивые итоги поездок и экспортируйте их в PDF для архива или команды.',
    icon: FileText,
    preview: ['Travel Digest', 'PDF export', 'Статистика'],
  },
]

function Hero({ onDemo }: { onDemo: () => void }) {
  const navigate = useNavigate()

  return (
    <section className="bg-hero-gradient px-6 pb-20 pt-16">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-amber/30 bg-white/70 px-4 py-2 text-sm text-amber">
            Лучший сайт для путешественников
          </p>
          <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
            Планируйте маршруты, проживайте поездки и делитесь ими красиво.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70">
            TravelBuddy объединяет маршруты, истории, статистику и личный travel-профиль в одном современном
            веб-продукте.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/routes')}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-white"
            >
              Начать путешествие <ArrowRight size={16} />
            </button>
            <button onClick={onDemo} className="rounded-full border border-ink/20 bg-white/70 px-6 py-3 font-medium">
              Смотреть демо
            </button>
          </div>
        </div>
        <div className="relative grid gap-4">
          {heroCards.map(({ title, subtitle, icon: Icon }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * index }}
              className="card-surface p-6"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-ink/5 p-3">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-ink/65">{subtitle}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function HomepageHighlights({ sectionRef }: { sectionRef: RefObject<HTMLDivElement | null> }) {
  return (
    <section ref={sectionRef} className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.16em] text-ink/45">Продукт в деталях</p>
        <h2 className="mt-3 text-4xl font-semibold md:text-5xl">Всё нужное для путешествий — в спокойном ритме</h2>
        <p className="mt-5 text-base text-ink/70 md:text-lg">
          TravelBuddy помогает планировать поездки, делиться опытом и видеть личный прогресс без сложных сценариев и
          перегруженных экранов.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {homepageHighlights.map(({ title, description, icon: Icon, preview }) => (
          <article
            key={title}
            className="card-surface rounded-3xl border border-ink/10 p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="inline-flex rounded-2xl bg-ink/5 p-3">
              <Icon size={20} className="text-amber" />
            </div>
            <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">{description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {preview.map((item) => (
                <span key={item} className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs text-ink/70">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const demoRef = useRef<HTMLDivElement>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const downloadPdf = async () => {
    await reportService.downloadExamplePdf()
  }

  return (
    <main>
      <Hero onDemo={() => demoRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      <HomepageHighlights sectionRef={demoRef} />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-semibold">Возможности, которые помогают путешествовать осмысленно</h2>
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
            <p className="mt-4 text-ink/70">TravelBuddy превращает поездки в аккуратные отчеты.</p>
            <button onClick={() => setIsReportOpen(true)} className="mt-8 rounded-full bg-ink px-6 py-3 text-white">
              Сгенерировать пример отчёта
            </button>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-ink to-pine p-6 text-white">
            <Waves />
            <p className="mt-4 text-sm text-white/75">Travel Digest</p>
            <p className="mt-2 text-2xl font-semibold">Весна 2026</p>
          </div>
        </article>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-ink px-8 py-16 text-center text-white">
          <h2 className="text-4xl font-semibold">
            TravelBuddy помогает не просто планировать поездки, а красиво проживать их
          </h2>
          <button
            onClick={() => navigate(user ? '/profile' : '/register')}
            className="mt-8 rounded-full bg-white px-6 py-3 font-medium text-ink"
          >
            Начать бесплатно
          </button>
        </div>
      </section>

      {isReportOpen ? (
        <div className="fixed inset-0 z-[60] bg-ink/50 p-4" onClick={() => setIsReportOpen(false)}>
          <div
            className="mx-auto mt-20 max-w-xl rounded-3xl bg-white p-6 dark:bg-[#1c2230]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Пример travel-отчёта</h3>
              <button onClick={() => setIsReportOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-ink/70">Краткая выжимка маршрута и статистики. Можно скачать в PDF.</p>
            <button onClick={downloadPdf} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm text-white">
              Скачать PDF
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}
