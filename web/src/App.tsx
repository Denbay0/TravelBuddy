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
  Car,
  Footprints,
  type LucideIcon,
} from 'lucide-react'
import { useRef, type ReactNode } from 'react'

type SceneMeta = {
  id: string
  badge: string
  title: string
  description: string
}

const navItems = ['Возможности', 'Маршруты', 'Сообщество', 'Статистика']

const sceneMeta: SceneMeta[] = [
  { id: 'route', badge: 'Сцена 01', title: 'Планируйте маршрут как цельную историю', description: 'Даты, этапы и заметки друзей складываются в единый travel-сценарий без хаоса.' },
  { id: 'transport', badge: 'Сцена 02', title: 'Структурируйте поездку по типам транспорта', description: 'Автомобиль, самолёт, поезд и пешком — всё разложено по понятным категориям.' },
  { id: 'community', badge: 'Сцена 03', title: 'Делитесь моментами в travel-сообществе', description: 'Публикуйте яркие эпизоды, сохраняйте идеи друзей и планируйте вместе.' },
  { id: 'stats', badge: 'Сцена 04', title: 'Развивайте личную travel-идентичность', description: 'Профиль показывает ритм поездок, любимые форматы и географию впечатлений.' },
  { id: 'reports', badge: 'Сцена 05', title: 'Собирайте поездки в красивые отчёты', description: 'Финальный digest превращает маршруты и эмоции в аккуратную историю сезона.' },
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

type LayerVisibility = {
  opacity: number
  y: number
  x: number
  scale: number
  blur: string
}

const transportChips: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Автомобиль', icon: Car },
  { label: 'Самолёт', icon: Plane },
  { label: 'Поезд', icon: Train },
  { label: 'Пешком', icon: Footprints },
]

function getLayerVisibility(progress: number, center: number): LayerVisibility {
  const distance = Math.abs(progress - center)
  const blend = Math.max(0, 1 - distance / 0.24)

  return {
    opacity: 0.04 + blend * 0.96,
    y: (center - progress) * 85,
    x: (center - progress) * 24,
    scale: 0.95 + blend * 0.05,
    blur: `blur(${(1 - blend) * 8}px)`,
  }
}

function SceneShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`absolute inset-0 ${className}`}>{children}</div>
}


function SceneCaption({ scene, center, progress }: { scene: SceneMeta; center: number; progress: import('framer-motion').MotionValue<number> }) {
  const opacity = useTransform(progress, (v) => getLayerVisibility(v, center).opacity)
  const y = useTransform(progress, (v) => (center - v) * 16)

  return (
    <motion.article className="rounded-2xl border border-white/50 bg-white/70 p-4" style={{ opacity, y }}>
      <p className="text-xs uppercase tracking-wider text-ink/45">{scene.badge}</p>
      <h3 className="mt-1 text-sm font-semibold">{scene.title}</h3>
      <p className="mt-2 text-xs text-ink/65">{scene.description}</p>
    </motion.article>
  )
}

function StickyShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const route = {
    opacity: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.1).opacity),
    y: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.1).y),
    x: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.1).x),
    scale: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.1).scale),
    filter: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.1).blur),
  }
  const transport = {
    opacity: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.3).opacity),
    y: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.3).y),
    x: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.3).x),
    scale: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.3).scale),
    filter: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.3).blur),
  }
  const community = {
    opacity: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.5).opacity),
    y: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.5).y),
    x: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.5).x),
    scale: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.5).scale),
    filter: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.5).blur),
  }
  const stats = {
    opacity: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.7).opacity),
    y: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.7).y),
    x: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.7).x),
    scale: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.7).scale),
    filter: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.7).blur),
  }
  const reports = {
    opacity: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.9).opacity),
    y: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.9).y),
    x: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.9).x),
    scale: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.9).scale),
    filter: useTransform(scrollYProgress, (v) => getLayerVisibility(v, 0.9).blur),
  }

  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 0.55, 0.78])

  return (
    <section ref={ref} className="relative mx-auto min-h-[420vh] max-w-6xl px-6 py-24">
      <div className="sticky top-20">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-ink/45">Кинематографичная история продукта</p>
          <h2 className="mt-3 text-4xl font-semibold md:text-5xl">Один живой кадр TravelBuddy</h2>
        </div>

        <div className="relative mx-auto h-[68vh] max-h-[760px] min-h-[520px] w-full overflow-hidden rounded-[2.2rem] border border-white/55 bg-white/65 p-4 shadow-glow backdrop-blur-xl md:p-6">
          <motion.div className="absolute inset-0 bg-gradient-to-br from-amber/25 via-transparent to-pine/25" style={{ opacity: glow }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.8),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(216,135,82,0.12),transparent_38%)]" />

          <motion.div className="absolute inset-0" style={route}>
            <SceneShell className="p-4 md:p-8">
              <div className="grid h-full gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-3xl bg-white/90 p-6">
                  <p className="text-sm text-ink/55">Маршрут «Балтийская неделя»</p>
                  <h3 className="mt-2 text-2xl font-semibold">Санкт-Петербург → Таллин → Рига</h3>
                  <p className="mt-3 text-sm text-ink/65">7 дней · 3 страны · 9 ключевых точек</p>
                  <div className="mt-6 space-y-3 text-sm text-ink/75">
                    <p>14 мая — вылет и первый вечерний маршрут</p>
                    <p>16 мая — день городских заметок и кафе-спотов</p>
                    <p>19 мая — финальный чеклист и подборка лучших мест</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-3xl bg-white/90 p-5">
                    <p className="text-sm text-ink/55">Участники</p>
                    <p className="mt-2 text-3xl font-semibold">5 друзей</p>
                    <p className="text-sm text-ink/60">в совместном планировании</p>
                  </div>
                  <div className="rounded-3xl bg-ink p-5 text-white">
                    <p className="text-sm text-white/70">Статус</p>
                    <p className="mt-2 text-xl font-semibold">Маршрут собран на 92%</p>
                    <p className="mt-2 text-sm text-white/75">Остались бронь поезда и финальные заметки</p>
                  </div>
                </div>
              </div>
            </SceneShell>
          </motion.div>

          <motion.div className="absolute inset-0" style={transport}>
            <SceneShell className="p-4 md:p-8">
              <div className="grid h-full gap-5">
                <div className="rounded-3xl bg-white/90 p-6">
                  <p className="text-sm text-ink/55">Категории транспорта</p>
                  <p className="mt-2 text-2xl font-semibold">Разложите каждую часть маршрута по формату движения</p>
                </div>
                <div className="grid flex-1 content-center gap-4 md:grid-cols-4">
                  {transportChips.map(({ label, icon: Icon }) => (
                    <div key={label} className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-4 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-ink/5"><Icon size={18} /></div>
                      <p className="text-sm font-medium">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-3xl bg-ink p-6 text-white">
                  <p className="text-sm text-white/70">Баланс маршрута</p>
                  <p className="mt-3 text-sm text-white/85">Автомобиль 30% · Самолёт 26% · Поезд 24% · Пешком 20%</p>
                </div>
              </div>
            </SceneShell>
          </motion.div>

          <motion.div className="absolute inset-0" style={community}>
            <SceneShell className="p-4 md:p-8">
              <div className="grid h-full gap-4 md:grid-cols-[1fr_1fr]">
                <article className="rounded-3xl bg-white/90 p-6">
                  <p className="text-sm text-ink/55">История дня</p>
                  <p className="mt-3 text-lg font-semibold">«Утренний трамвай в Риге — лучший кадр поездки»</p>
                  <p className="mt-4 text-sm text-ink/70">@maria.travel сохранила остановку и добавила её в общий маршрут.</p>
                  <div className="mt-6 flex gap-5 text-xs text-ink/55"><span>Нравится 212</span><span>Комментарии 27</span><span>Сохранения 49</span></div>
                </article>
                <div className="grid gap-4">
                  <article className="rounded-3xl bg-ink p-6 text-white">
                    <p className="text-sm text-white/75">Подборка друзей</p>
                    <p className="mt-2 text-2xl font-semibold">16 идей рядом с вашим маршрутом</p>
                  </article>
                  <article className="rounded-3xl bg-white/90 p-6">
                    <p className="text-sm text-ink/55">Сохранённые моменты</p>
                    <p className="mt-2 text-lg font-semibold">8 новых stories за неделю</p>
                    <p className="mt-2 text-sm text-ink/65">Собраны в один travel-альбом команды</p>
                  </article>
                </div>
              </div>
            </SceneShell>
          </motion.div>

          <motion.div className="absolute inset-0" style={stats}>
            <SceneShell className="p-4 md:p-8">
              <div className="grid h-full gap-4">
                <div className="rounded-3xl bg-white/90 p-6">
                  <p className="text-sm text-ink/55">Профиль путешественника</p>
                  <p className="mt-2 text-2xl font-semibold">Личный travel-паспорт и динамика сезона</p>
                </div>
                <div className="grid flex-1 gap-4 md:grid-cols-4">
                  <div className="rounded-3xl bg-white/90 p-5"><p className="text-sm text-ink/55">Поездок</p><p className="mt-2 text-3xl font-semibold">31</p></div>
                  <div className="rounded-3xl bg-white/90 p-5"><p className="text-sm text-ink/55">Городов</p><p className="mt-2 text-3xl font-semibold">52</p></div>
                  <div className="rounded-3xl bg-white/90 p-5"><p className="text-sm text-ink/55">Сохранённых маршрутов</p><p className="mt-2 text-3xl font-semibold">74</p></div>
                  <div className="rounded-3xl bg-ink p-5 text-white"><p className="text-sm text-white/70">Любимый формат</p><p className="mt-2 text-xl font-semibold">Поезд</p></div>
                </div>
              </div>
            </SceneShell>
          </motion.div>

          <motion.div className="absolute inset-0" style={reports}>
            <SceneShell className="p-4 md:p-8">
              <div className="grid h-full gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-3xl bg-white/90 p-6">
                  <p className="text-sm text-ink/55">Travel Digest</p>
                  <p className="mt-2 text-2xl font-semibold">Итог поездки «Балтийская неделя»</p>
                  <p className="mt-4 text-sm text-ink/70">Маршрут, лучшие моменты, статистика, заметки и рекомендации на следующий сезон.</p>
                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-ink/75">
                    <p>7 дней</p><p>3 страны</p><p>18 сохранённых мест</p><p>1 красивый PDF + web-версия</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-ink to-pine p-6 text-white">
                  <p className="text-sm text-white/75">Отчёт готов</p>
                  <p className="mt-2 text-3xl font-semibold">Весна 2026</p>
                  <p className="mt-4 text-sm text-white/85">Личная хроника поездок, которой хочется делиться и возвращаться к ней позже.</p>
                </div>
              </div>
            </SceneShell>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-5">
          {sceneMeta.map((scene, index) => (
            <SceneCaption key={scene.id} scene={scene} center={[0.1, 0.3, 0.5, 0.7, 0.9][index]} progress={scrollYProgress} />
          ))}
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
