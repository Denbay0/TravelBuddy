import { jsPDF } from 'jspdf'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ArrowRight, BookOpen, Camera, Car, Compass, FileText, Footprints, Heart, Plane, Route, Train, Trophy, Users, Waves, X, type LucideIcon } from 'lucide-react'
import { useRef, useState, type RefObject } from 'react'
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

function Hero({ onDemo }: { onDemo: () => void }) {
  const navigate = useNavigate()
  return <section className="bg-hero-gradient px-6 pb-20 pt-16"><div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr]"><div><p className="mb-5 inline-flex rounded-full border border-amber/30 bg-white/70 px-4 py-2 text-sm text-amber">Лучший сайт для путешественников</p><h1 className="text-5xl font-semibold leading-tight md:text-6xl">Планируйте маршруты, проживайте поездки и делитесь ими красиво.</h1><p className="mt-6 max-w-xl text-lg text-ink/70">TravelBuddy объединяет маршруты, истории, статистику и личный travel-профиль в одном современном веб-продукте.</p><div className="mt-10 flex flex-wrap gap-4"><button onClick={() => navigate('/routes')} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-white">Начать путешествие <ArrowRight size={16} /></button><button onClick={onDemo} className="rounded-full border border-ink/20 bg-white/70 px-6 py-3 font-medium">Смотреть демо</button></div></div><div className="relative grid gap-4">{heroCards.map(({ title, subtitle, icon: Icon }, index) => <motion.article key={title as string} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * index }} className="card-surface p-6"><div className="mb-4 inline-flex rounded-2xl bg-ink/5 p-3"><Icon size={20} /></div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm text-ink/65">{subtitle}</p></motion.article>)}</div></div></section>
}
const storyScenes=[{id:'route',badge:'Сцена 01',title:'Маршрут без хаоса',description:'Собирайте этапы, даты и заметки в один аккуратный маршрут.'},{id:'transport',badge:'Сцена 02',title:'Категории транспорта',description:'Разделяйте каждый этап поездки по типу передвижения.'},{id:'community',badge:'Сцена 03',title:'Истории сообщества',description:'Публикуйте моменты поездки и сохраняйте находки друзей.'},{id:'stats',badge:'Сцена 04',title:'Личная статистика',description:'Видите прогресс, любимый формат и свой travel-ритм.'},{id:'reports',badge:'Сцена 05',title:'Итоги и отчёты',description:'Превращайте поездки в красивый digest, к которому хочется возвращаться.'},]
const transportChips=[{label:'Автомобиль',icon:Car},{label:'Самолёт',icon:Plane},{label:'Поезд',icon:Train},{label:'Пешком',icon:Footprints},]
function SceneContent({ id }: { id: string }) { if(id==='transport'){return <div className="grid h-full gap-4"><article className="rounded-3xl border border-ink/10 bg-white p-7 dark:bg-white/5"><p className="text-sm text-ink/55">Категории поездки</p><h3 className="mt-2 text-2xl font-semibold">Один маршрут, четыре типа передвижения</h3><div className="mt-6 grid gap-3 sm:grid-cols-2">{transportChips.map(({label,icon:Icon})=><div key={label} className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3"><span className="rounded-lg bg-ink/5 p-2"><Icon size={16}/></span><span className="text-sm font-medium">{label}</span></div>)}</div></article></div>} return <article className="h-full rounded-3xl border border-ink/10 bg-white p-7 dark:bg-white/5"><p className="text-sm text-ink/55">{id === 'reports' ? 'Travel Digest' : 'История продукта'}</p><h3 className="mt-2 text-2xl font-semibold">{storyScenes.find((s) => s.id === id)?.title}</h3><p className="mt-4 text-sm text-ink/70">{storyScenes.find((s) => s.id === id)?.description}</p></article> }

function StickyShowcase({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) { const ref = useRef<HTMLDivElement>(null);const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });const [activeIndex, setActiveIndex] = useState(0);useMotionValueEvent(scrollYProgress, 'change', (value) => setActiveIndex(Math.min(storyScenes.length - 1, Math.floor(value * storyScenes.length))));const scene = storyScenes[activeIndex]; return <section ref={sectionRef} className="relative mx-auto min-h-[320vh] max-w-6xl px-6 py-24"><div ref={ref} className="sticky top-20"><div className="mb-8 text-center"><p className="text-sm uppercase tracking-[0.16em] text-ink/45">История продукта</p><h2 className="mt-3 text-4xl font-semibold md:text-5xl">TravelBuddy в одном фиксированном кадре</h2></div><div className="rounded-[2rem] border border-ink/10 bg-[#f7f3eb] p-4 dark:bg-white/5 md:p-6"><div className="mb-4 flex items-start justify-between gap-6 rounded-2xl border border-ink/10 bg-white px-5 py-4 dark:bg-white/5"><div><p className="text-xs uppercase tracking-[0.14em] text-ink/45">{scene.badge}</p><p className="mt-1 text-lg font-semibold">{scene.title}</p></div><p className="max-w-md text-sm text-ink/65">{scene.description}</p></div><div className="relative h-[50vh] min-h-[330px] overflow-hidden rounded-2xl border border-ink/10 bg-sand p-4 md:p-6"><AnimatePresence mode="wait"><motion.div key={scene.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }} className="h-full"><SceneContent id={scene.id} /></motion.div></AnimatePresence></div></div></div></section> }

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const demoRef = useRef<HTMLDivElement>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const downloadPdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('TravelBuddy Demo Report', 20, 20)
    doc.setFontSize(12)
    doc.text('Маршрут: Санкт-Петербург → Таллин → Рига', 20, 35)
    doc.text('Длительность: 7 дней', 20, 45)
    doc.text('Транспорт: Поезд + Пешком', 20, 55)
    doc.text('Итог: 3 города, 640 км, 18 сохранённых мест.', 20, 65)
    doc.save('travelbuddy-demo-report.pdf')
  }

  return <main><Hero onDemo={() => demoRef.current?.scrollIntoView({ behavior: 'smooth' })} /><StickyShowcase sectionRef={demoRef} /><section className="mx-auto max-w-6xl px-6 py-20"><h2 className="text-4xl font-semibold">Возможности, которые помогают путешествовать осмысленно</h2><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{features.map(([title, desc, Icon]) => <article key={title} className="card-surface p-6"><Icon className="text-amber" /><h3 className="mt-4 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm text-ink/65">{desc}</p></article>)}</div></section><section className="mx-auto max-w-6xl px-6 py-20"><article className="card-surface grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]"><div><h2 className="text-3xl font-semibold">Отчеты, которые хочется пересматривать</h2><p className="mt-4 text-ink/70">TravelBuddy превращает поездки в аккуратные отчеты.</p><button onClick={() => setIsReportOpen(true)} className="mt-8 rounded-full bg-ink px-6 py-3 text-white">Сгенерировать пример отчёта</button></div><div className="rounded-3xl bg-gradient-to-br from-ink to-pine p-6 text-white"><Waves /><p className="mt-4 text-sm text-white/75">Travel Digest</p><p className="mt-2 text-2xl font-semibold">Весна 2026</p></div></article></section><section className="px-6 pb-20"><div className="mx-auto max-w-6xl rounded-[2rem] bg-ink px-8 py-16 text-center text-white"><h2 className="text-4xl font-semibold">TravelBuddy помогает не просто планировать поездки, а красиво проживать их</h2><button onClick={() => navigate(user ? '/profile' : '/register')} className="mt-8 rounded-full bg-white px-6 py-3 font-medium text-ink">Начать бесплатно</button></div></section>
  {isReportOpen ? <div className="fixed inset-0 z-[60] bg-ink/50 p-4" onClick={() => setIsReportOpen(false)}><div className="mx-auto mt-20 max-w-xl rounded-3xl bg-white p-6 dark:bg-[#1c2230]" onClick={(e) => e.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-semibold">Пример travel-отчёта</h3><button onClick={() => setIsReportOpen(false)}><X size={18} /></button></div><p className="text-sm text-ink/70">Краткая выжимка маршрута и статистики. Можно скачать в PDF.</p><button onClick={downloadPdf} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm text-white">Скачать PDF</button></div></div> : null}</main>
}
