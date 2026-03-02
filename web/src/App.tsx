import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Camera,
  Compass,
  FileText,
  Heart,
  Plane,
  Route,
  Train,
  Trophy,
  Users,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import { useRef } from 'react'

type StoryStep = {
  id: string
  title: string
  description: string
  badge: string
}

const navItems = ['Возможности', 'Маршруты', 'Сообщество', 'Статистика']

const storySteps: StoryStep[] = [
  { id: 'route', title: 'Соберите маршрут за минуты', description: 'Комбинируйте города, заметки и места в единой дорожной ленте.', badge: 'Планирование' },
  { id: 'transport', title: 'Разложите поездки по типам', description: 'Самолёты, авто и пешие участки хранятся как отдельные категории.', badge: 'Транспорт' },
  { id: 'social', title: 'Публикуйте живые истории', description: 'Делитесь короткими travel-постами и отмечайте лучшие моменты.', badge: 'Сообщество' },
  { id: 'stats', title: 'Следите за личным прогрессом', description: 'Сезонные срезы, любимые форматы поездок и travel-ритм в профиле.', badge: 'Статистика' },
]

const features = [
  ['Планирование маршрутов', 'Создавайте гибкие маршруты с этапами, заметками и совместным редактированием.', Route],
  ['Категории по транспорту', 'Сортируйте поездки по самолетам, колесным маршрутам и пешим прогулкам.', Plane],
  ['Истории и публикации', 'Собирайте визуальные истории поездок и делитесь ими в ленте.', Camera],
  ['Профиль путешественника', 'Личный travel-паспорт с динамикой, подборками и любимыми направлениями.', Trophy],
  ['Избранные маршруты', 'Сохраняйте лучшие маршруты друзей и возвращайтесь к ним перед новой поездкой.', Heart],
  ['Отчеты и дайджесты', 'Генерируйте стильные итоги поездок в PDF и web-формате.', FileText],
] as const

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-sand/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="text-xl font-bold tracking-tight">TravelBuddy</div>
        <nav className="hidden gap-8 text-sm text-ink/70 md:flex">
          {navItems.map((item) => (
            <a key={item} href="#" className="transition hover:text-ink">
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <button className="rounded-full px-4 py-2 font-medium text-ink/80 hover:text-ink">Войти</button>
          <button className="rounded-full bg-ink px-5 py-2.5 font-medium text-white transition hover:bg-ink/90">Начать бесплатно</button>
        </div>
      </div>
    </header>
  )
}

const heroCards: Array<{ title: string; subtitle: string; icon: LucideIcon }> = [
  { title: 'Маршрут “Скандинавская осень”', subtitle: '8 городов · 12 дней', icon: Compass },
  { title: 'Лента друзей', subtitle: '24 новых travel-истории', icon: Users },
  { title: 'Сезонный обзор', subtitle: '17 поездок · 46 мест', icon: BookOpen },
]

function Hero() {
  return (
    <section className="bg-hero-gradient px-6 pb-20 pt-16">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-amber/30 bg-white/70 px-4 py-2 text-sm text-amber">Лучший сайт для путешественников</p>
          <h1 className="text-5xl font-semibold leading-tight md:text-6xl">Планируйте маршруты, проживайте поездки и делитесь ими красиво.</h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70">TravelBuddy объединяет маршруты, истории, статистику и личный travel-профиль в одном современном веб-продукте.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-white">Начать путешествие <ArrowRight size={16} /></button>
            <button className="rounded-full border border-ink/20 bg-white/70 px-6 py-3 font-medium">Смотреть демо</button>
          </div>
        </div>
        <div className="relative grid gap-4">
          {heroCards.map(({ title, subtitle, icon: Icon }, index) => (
            <motion.article
              key={title as string}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * index }}
              className="card-surface p-6"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-ink/5 p-3"><Icon size={20} /></div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-ink/65">{subtitle}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function StickyShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const stage = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 3])

  return (
    <section ref={ref} className="relative mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2">
      <div className="space-y-20 py-4">
        {storySteps.map((step, idx) => (
          <article key={step.id} className="min-h-[260px] rounded-3xl border border-ink/10 bg-white/50 p-8">
            <p className="text-sm text-amber">{step.badge}</p>
            <h3 className="mt-2 text-3xl font-semibold">{step.title}</h3>
            <p className="mt-4 text-ink/70">{step.description}</p>
            <p className="mt-6 text-sm text-ink/50">Шаг {idx + 1} из {storySteps.length}</p>
          </article>
        ))}
      </div>
      <div className="lg:sticky lg:top-24 lg:h-[70vh]">
        <div className="card-surface relative h-full overflow-hidden p-6">
          <motion.div className="absolute inset-0 bg-gradient-to-br from-amber/20 via-transparent to-pine/20" style={{ opacity: useTransform(stage, [0, 3], [0.2, 0.9]) }} />
          <div className="relative grid h-full gap-4">
            <motion.div style={{ opacity: useTransform(stage, [0, 0.9, 1.1], [1, 1, 0.2]) }} className="rounded-2xl bg-white p-5">
              <p className="text-sm text-ink/60">Маршрут</p><p className="mt-2 font-semibold">Москва → Тбилиси → Батуми</p>
            </motion.div>
            <motion.div style={{ opacity: useTransform(stage, [0.8, 1.6, 2], [0.15, 1, 0.3]) }} className="rounded-2xl bg-ink p-5 text-white">
              <p className="text-sm text-white/70">Категории</p><div className="mt-3 flex gap-2 text-xs"><span className="rounded-full bg-white/20 px-3 py-1">✈ Самолёт</span><span className="rounded-full bg-white/20 px-3 py-1">🚗 Колёса</span><span className="rounded-full bg-white/20 px-3 py-1">🥾 Пешком</span></div>
            </motion.div>
            <motion.div style={{ opacity: useTransform(stage, [1.6, 2.4, 3], [0.2, 1, 1]) }} className="grid flex-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-5"><p className="text-sm text-ink/60">Пост в ленте</p><p className="mt-2 text-sm">«Закат в Батуми — лучший финал маршрута.»</p><div className="mt-4 flex gap-4 text-xs text-ink/50"><span>❤ 142</span><span>💬 18</span></div></div>
              <div className="rounded-2xl bg-white p-5"><p className="text-sm text-ink/60">Статистика</p><p className="mt-2 text-3xl font-semibold">29</p><p className="text-sm text-ink/60">поездок за год</p><div className="mt-3 flex items-center gap-2 text-xs"><Train size={14} /> 43% наземных маршрутов</div></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <StickyShowcase />
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
        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 lg:grid-cols-2">
          <article className="card-surface p-8">
            <h2 className="text-3xl font-semibold">Сообщество путешественников</h2>
            <p className="mt-4 text-ink/70">Публикуйте истории, собирайте реакции друзей и сохраняйте вдохновение из чужих поездок.</p>
            <div className="mt-6 space-y-3 text-sm">
              <p>• Лента travel-историй с подборками по настроению</p>
              <p>• Сохранение понравившихся маршрутов в избранное</p>
              <p>• Комментарии и совместное планирование новых поездок</p>
            </div>
          </article>
          <article className="card-surface p-8">
            <h2 className="text-3xl font-semibold">Профиль и статистика</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-4"><p className="text-sm text-ink/60">Поездок</p><p className="text-3xl font-semibold">64</p></div>
              <div className="rounded-2xl bg-white p-4"><p className="text-sm text-ink/60">Стран</p><p className="text-3xl font-semibold">19</p></div>
              <div className="rounded-2xl bg-white p-4"><p className="text-sm text-ink/60">Любимый формат</p><p className="font-semibold">Road trip</p></div>
              <div className="rounded-2xl bg-white p-4"><p className="text-sm text-ink/60">Серия</p><p className="font-semibold">14 недель</p></div>
            </div>
          </article>
        </section>
        <section className="mx-auto max-w-6xl px-6 py-20">
          <article className="card-surface grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-3xl font-semibold">Отчеты, которые хочется пересматривать</h2>
              <p className="mt-4 text-ink/70">TravelBuddy превращает поездки в аккуратные отчеты: маршрут, лучшие фото, впечатления, статистика и рекомендации на следующий сезон.</p>
              <button className="mt-8 rounded-full bg-ink px-6 py-3 text-white">Сгенерировать пример отчёта</button>
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
            <h2 className="text-4xl font-semibold">TravelBuddy помогает не просто планировать поездки, а красиво проживать их</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/75">Один аккаунт для маршрутов, историй, статистики и любимых мест. Начните бесплатно и соберите свой личный travel-архив.</p>
            <button className="mt-8 rounded-full bg-white px-6 py-3 font-medium text-ink">Начать бесплатно</button>
          </div>
        </section>
      </main>
      <footer className="border-t border-ink/10 px-6 py-10 text-sm text-ink/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p>© 2026 TravelBuddy</p>
          <div className="flex gap-5">
            <a href="#">О продукте</a><a href="#">Блог</a><a href="#">Политика</a><a href="#">Условия</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
