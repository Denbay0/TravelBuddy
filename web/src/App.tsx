import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
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
  Car,
  Footprints,
  type LucideIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import AppHeader from './components/AppHeader'


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

type StoryScene = {
  id: string
  badge: string
  title: string
  description: string
}

const storyScenes: StoryScene[] = [
  { id: 'route', badge: 'Сцена 01', title: 'Маршрут без хаоса', description: 'Собирайте этапы, даты и заметки в один аккуратный маршрут.' },
  { id: 'transport', badge: 'Сцена 02', title: 'Категории транспорта', description: 'Разделяйте каждый этап поездки по типу передвижения.' },
  { id: 'community', badge: 'Сцена 03', title: 'Истории сообщества', description: 'Публикуйте моменты поездки и сохраняйте находки друзей.' },
  { id: 'stats', badge: 'Сцена 04', title: 'Личная статистика', description: 'Видите прогресс, любимый формат и свой travel-ритм.' },
  { id: 'reports', badge: 'Сцена 05', title: 'Итоги и отчёты', description: 'Превращайте поездки в красивый digest, к которому хочется возвращаться.' },
]

const transportChips: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Автомобиль', icon: Car },
  { label: 'Самолёт', icon: Plane },
  { label: 'Поезд', icon: Train },
  { label: 'Пешком', icon: Footprints },
]

function SceneContent({ id }: { id: string }) {
  if (id === 'route') {
    return (
      <div className="grid h-full gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-ink/10 bg-white p-7">
          <p className="text-sm text-ink/55">Маршрут «Балтийская неделя»</p>
          <h3 className="mt-2 text-2xl font-semibold">Санкт-Петербург → Таллин → Рига</h3>
          <p className="mt-3 text-sm text-ink/70">14–20 мая · 7 дней · 3 города</p>
          <ul className="mt-6 space-y-3 text-sm text-ink/75">
            <li>14 мая — вылет и вечерний маршрут по центру</li>
            <li>16 мая — день заметок и мест от друзей</li>
            <li>19 мая — финальный чеклист перед выездом</li>
          </ul>
        </article>
        <aside className="rounded-3xl border border-ink/10 bg-ink p-6 text-white">
          <p className="text-sm text-white/75">Готовность плана</p>
          <p className="mt-2 text-4xl font-semibold">92%</p>
          <p className="mt-3 text-sm text-white/75">Осталось подтвердить один трансфер</p>
        </aside>
      </div>
    )
  }

  if (id === 'transport') {
    return (
      <div className="grid h-full gap-4">
        <article className="rounded-3xl border border-ink/10 bg-white p-7">
          <p className="text-sm text-ink/55">Категории поездки</p>
          <h3 className="mt-2 text-2xl font-semibold">Один маршрут, четыре типа передвижения</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {transportChips.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3">
                <span className="rounded-lg bg-ink/5 p-2"><Icon size={16} /></span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    )
  }

  if (id === 'community') {
    return (
      <div className="grid h-full gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-ink/10 bg-white p-7">
          <p className="text-sm text-ink/55">История из поездки</p>
          <p className="mt-3 text-xl font-semibold">«Утренний трамвай в Риге — самый тёплый момент маршрута»</p>
          <p className="mt-4 text-sm text-ink/70">@maria.travel добавила остановку в общий план и поделилась короткой заметкой для друзей.</p>
          <div className="mt-6 flex gap-5 text-xs text-ink/60"><span>Нравится 212</span><span>Комментарии 27</span></div>
        </article>
        <aside className="rounded-3xl border border-ink/10 bg-white p-6">
          <p className="text-sm text-ink/55">Сохранено в избранное</p>
          <p className="mt-2 text-4xl font-semibold">16</p>
          <p className="mt-3 text-sm text-ink/70">идей рядом с вашим маршрутом</p>
        </aside>
      </div>
    )
  }

  if (id === 'stats') {
    return (
      <div className="grid h-full gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-ink/10 bg-white p-7">
          <p className="text-sm text-ink/55">Профиль путешественника</p>
          <h3 className="mt-2 text-2xl font-semibold">Личная статистика сезона</h3>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <p className="rounded-xl bg-sand px-3 py-2">Поездок: <b>31</b></p>
            <p className="rounded-xl bg-sand px-3 py-2">Городов: <b>52</b></p>
            <p className="rounded-xl bg-sand px-3 py-2">Сохранённых маршрутов: <b>74</b></p>
            <p className="rounded-xl bg-sand px-3 py-2">Любимый транспорт: <b>Поезд</b></p>
          </div>
        </article>
      </div>
    )
  }

  return (
    <div className="grid h-full gap-4">
      <article className="rounded-3xl border border-ink/10 bg-white p-7">
        <p className="text-sm text-ink/55">Travel Digest</p>
        <h3 className="mt-2 text-2xl font-semibold">Итог поездки «Балтийская неделя»</h3>
        <p className="mt-4 text-sm text-ink/70">Маршрут, лучшие моменты, статистика и заметки друзей — в одном аккуратном отчёте.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-ink/80">
          <p>7 дней</p><p>3 города</p><p>18 сохранённых мест</p><p>PDF + web-версия</p>
        </div>
      </article>
    </div>
  )
}

function StickyShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [activeIndex, setActiveIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const nextIndex = Math.min(storyScenes.length - 1, Math.floor(value * storyScenes.length))
    setActiveIndex(nextIndex)
  })

  const scene = storyScenes[activeIndex]

  return (
    <section ref={ref} className="relative mx-auto min-h-[360vh] max-w-6xl px-6 py-24">
      <div className="sticky top-20">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.16em] text-ink/45">История продукта</p>
          <h2 className="mt-3 text-4xl font-semibold md:text-5xl">TravelBuddy в одном фиксированном кадре</h2>
        </div>

        <div className="rounded-[2rem] border border-ink/10 bg-[#f7f3eb] p-4 md:p-6">
          <div className="mb-4 flex items-start justify-between gap-6 rounded-2xl border border-ink/10 bg-white px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/45">{scene.badge}</p>
              <p className="mt-1 text-lg font-semibold">{scene.title}</p>
            </div>
            <p className="max-w-md text-sm text-ink/65">{scene.description}</p>
          </div>

          <div className="relative h-[54vh] min-h-[430px] overflow-hidden rounded-2xl border border-ink/10 bg-sand p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 18, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.995 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <SceneContent id={scene.id} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div>
      <AppHeader />
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
