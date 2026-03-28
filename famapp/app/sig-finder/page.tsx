'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

// ── SIG data ──────────────────────────────────────────────────────────────────
const SIGS: Record<string, { name: string; icon: string; desc: string }> = {
  sigint:    { name: 'SIGINT',        icon: '🔒', desc: 'The Cybersecurity Society of UoE. Dive into CTFs, ethical hacking, penetration testing, and all things security.' },
  gamedev:   { name: 'GameDevSig',    icon: '🎮', desc: 'Bi-weekly workshops, game club, a platformer project, and game jams — for coders, artists, and composers alike.' },
  zinesig:   { name: 'ZINESIG',       icon: '📰', desc: 'A creative newspaper environment for writing, design, and storytelling within the CompSoc community.' },
  sigweb:    { name: 'SIGWeb',        icon: '🌐', desc: 'The web app development group — build real projects, learn modern web tech, and ship things to the world.' },
  typesig:   { name: 'TypeSig',       icon: '📐', desc: 'An inclusive, welcoming space for type theory, functional programming, and the mathematics behind PLs.' },
  quantsoc:  { name: 'QuantSoc',      icon: '📈', desc: 'Discuss quantitative finance, algorithmic trading, and ML applied to markets — from theory to practice.' },
  cloudsig:  { name: 'CloudSIG',      icon: '☁️', desc: 'For cloud enthusiasts — share and discuss everything from AWS and GCP to DevOps and infrastructure.' },
  ai:        { name: 'Edinburgh AI',  icon: '🤖', desc: 'Anything and everything AI — machine learning research, applied AI projects, and community discussion.' },
  cssig:     { name: 'CSSIG',         icon: '⚡', desc: 'Competitive Programming SIG — a welcoming space to tackle algorithms, solve problems, and compete.' },
  neurotech: { name: 'Neurotech SIG', icon: '🧬', desc: 'Exploring neurotechnology — brain-computer interfaces, neural engineering, and the intersection of neuroscience and tech.' },
}

const DISCORD: Record<string, string | null> = {
  sigint:    'https://discord.gg/6aTwybA2Wj',
  gamedev:   'https://discord.gg/DXd6sXNCGz',
  zinesig:   null,
  sigweb:    null,
  typesig:   'https://discord.gg/ZS5ctYQjzX',
  quantsoc:  'https://discord.com/channels/315277951597936640/1160622341026488461',
  cloudsig:  'https://discord.com/channels/315277951597936640/1160622362614579300',
  ai:        'https://discord.com/channels/315277951597936640/1183134687548407929',
  cssig:     null,
  neurotech: null,
}

const WHATSAPP: Record<string, string | null> = {
  neurotech: null,
}

const SLIDER_LABELS = [
  '', 'Just getting started — all paths are open', "Beginner — I've written some code",
  'Intermediate — I know my way around', 'Advanced — I tackle complex projects', 'Expert — I dream in code',
]

// ── Scoring ───────────────────────────────────────────────────────────────────
function computeScores(state: { course: string | null; exp: number; interests: Set<string>; project: string | null; vibe: string | null }) {
  const s: Record<string, number> = {}
  Object.keys(SIGS).forEach(k => (s[k] = 0))

  const courseMap: Record<string, Record<string, number>> = {
    cs:     { cssig:2, typesig:2, sigweb:1, sigint:1 },
    ai:     { ai:3, quantsoc:2, cssig:1, neurotech:2 },
    se:     { sigweb:3, cloudsig:2, sigint:1 },
    cogsci: { ai:2, typesig:2, zinesig:1, neurotech:3 },
    maths:  { quantsoc:3, typesig:2, cssig:1 },
    other:  { zinesig:2, gamedev:1, sigweb:1 },
  }
  if (state.course) Object.entries(courseMap[state.course] || {}).forEach(([k, v]) => (s[k] += v))

  const exp = state.exp
  if (exp <= 2) { s.gamedev += 1; s.zinesig += 1; s.cloudsig += 1 }
  else if (exp === 3) { s.sigweb += 1; s.ai += 1; s.neurotech += 1 }
  else { s.sigint += 1; s.typesig += 1; s.quantsoc += 1; s.cssig += 1 }

  const interestMap: Record<string, Record<string, number>> = {
    security: { sigint:3 }, gamedev: { gamedev:3, zinesig:1 }, creative: { zinesig:3, gamedev:1 },
    web: { sigweb:3, cloudsig:1 }, logic: { typesig:3, cssig:2, quantsoc:1 }, finance: { quantsoc:3 },
    cloud: { cloudsig:3, sigweb:1 }, aiml: { ai:3, quantsoc:1, neurotech:1 }, compete: { cssig:3, sigint:1 },
    art: { gamedev:2, zinesig:2 }, neuro: { neurotech:3, ai:1 },
  }
  state.interests.forEach(i => { Object.entries(interestMap[i] || {}).forEach(([k, v]) => (s[k] += v)) })

  const projectMap: Record<string, Record<string, number>> = {
    sigint: { sigint:5 }, gamedev: { gamedev:5 }, zinesig: { zinesig:5 }, sigweb: { sigweb:5 },
    typesig: { typesig:5 }, quantsoc: { quantsoc:5 }, cloudsig: { cloudsig:5 }, ai: { ai:5 },
    cssig: { cssig:5 }, neurotech: { neurotech:5 },
  }
  if (state.project) Object.entries(projectMap[state.project] || {}).forEach(([k, v]) => (s[k] += v))

  const vibeMap: Record<string, Record<string, number>> = {
    competitive: { cssig:2, sigint:2 }, creative: { gamedev:2, zinesig:2 }, builders: { sigweb:2, cloudsig:2 },
    research: { typesig:2, ai:2, quantsoc:2, neurotech:2 }, casual: { gamedev:1, zinesig:1, cloudsig:1, sigweb:1 },
  }
  if (state.vibe) Object.entries(vibeMap[state.vibe] || {}).forEach(([k, v]) => (s[k] += v))

  return s
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SigFinderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [course, setCourse] = useState<string | null>(null)
  const [exp, setExp] = useState(3)
  const [interests, setInterests] = useState<Set<string>>(new Set())
  const [project, setProject] = useState<string | null>(null)
  const [vibe, setVibe] = useState<string | null>(null)
  const [results, setResults] = useState<{ key: string; pct: number }[]>([])
  const [animBars, setAnimBars] = useState(false)

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])

  function goTo(n: number) {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function showResults() {
    const scores = computeScores({ course, exp, interests, project, vibe })
    const max = Math.max(...Object.values(scores))
    const top3 = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, score]) => ({ key, pct: max > 0 ? Math.round((score / max) * 100) : 0 }))
    setResults(top3)
    setAnimBars(false)
    goTo(6)
    setTimeout(() => setAnimBars(true), 120)
  }

  function restart() {
    setCourse(null); setExp(3); setInterests(new Set()); setProject(null); setVibe(null)
    setResults([]); setAnimBars(false); goTo(0)
  }

  function toggleInterest(v: string) {
    setInterests(prev => {
      const next = new Set(prev)
      next.has(v) ? next.delete(v) : next.add(v)
      return next
    })
  }

  const progressPct = step === 0 ? 0 : step >= 6 ? 100 : Math.round((step / 5) * 100)

  const badges = [
    { cls: 'border-yellow-400 bg-yellow-400/10 text-yellow-300', label: '🥇 Best match' },
    { cls: 'border-slate-400 bg-slate-400/10 text-slate-300',    label: '🥈 Great fit' },
    { cls: 'border-orange-400 bg-orange-400/10 text-orange-300', label: '🥉 Good match' },
  ]

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />

      {/* Progress bar */}
      <div className="fixed top-14 left-0 h-0.5 bg-red-500 z-40 transition-all duration-500 shadow-[0_0_14px_rgba(239,68,68,0.4)]"
        style={{ width: `${progressPct}%` }} />

      <div className="max-w-2xl mx-auto px-4 py-10 pb-20">

        {/* ── Welcome ── */}
        {step === 0 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="font-mono text-2xl font-black tracking-[4px] text-red-500 mb-8">
              COMP<span className="text-white">SOC</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-white mb-4">
              Find Your<br />Perfect SIG
            </h1>
            <p className="text-indigo-300 text-lg max-w-md mx-auto mb-8 leading-relaxed">
              5 quick questions — no typing needed — and we'll match you with the CompSoc groups built for you.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {['🔒 SIGINT','🎮 GameDevSig','📰 ZINESIG','🌐 SIGWeb','📐 TypeSig','📈 QuantSoc','☁️ CloudSIG','🤖 Edinburgh AI','⚡ CSSIG','🧠 Neurotech SIG'].map(p => (
                <span key={p} className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-indigo-300">{p}</span>
              ))}
            </div>
            <button onClick={() => goTo(1)}
              className="px-10 py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(239,68,68,0.4)]">
              Let's go →
            </button>
          </div>
        )}

        {/* ── Step 1: Course ── */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-500/10 text-red-400">Your Background</span>
              <span className="text-xs text-indigo-400 ml-auto">1 / 5</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">What's your course?</h2>
            <p className="text-indigo-400 text-sm mb-6">Tap the one closest to what you study.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
              {[
                { v:'cs', icon:'💻', label:'Computer Science' }, { v:'ai', icon:'🤖', label:'Artificial Intelligence' },
                { v:'se', icon:'🔧', label:'Software Engineering' }, { v:'cogsci', icon:'🧠', label:'Cognitive Science' },
                { v:'maths', icon:'📐', label:'Maths / Statistics' }, { v:'other', icon:'🌟', label:'Other / Not sure' },
              ].map(c => (
                <button key={c.v} onClick={() => setCourse(c.v)}
                  className={`flex flex-col items-center py-5 px-3 rounded-2xl border-2 transition-all active:scale-95 ${course === c.v ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                  <span className="text-3xl mb-2">{c.icon}</span>
                  <span className="text-sm font-semibold text-white text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => goTo(0)} className="px-6 py-3 rounded-full bg-white/10 text-indigo-300 font-bold hover:bg-white/15 transition-colors">← Back</button>
              <button onClick={() => goTo(2)} disabled={!course}
                className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-all hover:-translate-y-0.5">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Experience ── */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-500/10 text-red-400">Your Experience</span>
              <span className="text-xs text-indigo-400 ml-auto">2 / 5</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">How much coding experience do you have?</h2>
            <p className="text-indigo-400 text-sm mb-8">Drag the slider to match your level.</p>
            <div className="mb-8">
              <div className="flex justify-between text-xs text-indigo-400 mb-4">
                <span>🐣 Just starting out</span>
                <span>I dream in code 🚀</span>
              </div>
              <input type="range" min={1} max={5} value={exp}
                onChange={e => setExp(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/20 accent-red-500" />
              <p className="text-center mt-4 text-red-400 font-semibold text-sm min-h-5">{SLIDER_LABELS[exp]}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => goTo(1)} className="px-6 py-3 rounded-full bg-white/10 text-indigo-300 font-bold hover:bg-white/15 transition-colors">← Back</button>
              <button onClick={() => goTo(3)} className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-400 text-white font-bold transition-all hover:-translate-y-0.5">Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Interests ── */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-500/10 text-red-400">Your Interests</span>
              <span className="text-xs text-indigo-400 ml-auto">3 / 5</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">What gets you excited?</h2>
            <p className="text-indigo-400 text-sm mb-6">Tap everything that sparks your interest — pick as many as you like.</p>
            <div className="flex flex-wrap gap-2 mb-7">
              {[
                { v:'security', label:'🔒 Hacking & Security' }, { v:'gamedev', label:'🎮 Game Design' },
                { v:'creative', label:'✏️ Writing & Creative' }, { v:'web', label:'🌐 Web & Apps' },
                { v:'logic', label:'🧮 Logic & Maths' }, { v:'finance', label:'📈 Finance & Trading' },
                { v:'cloud', label:'☁️ Cloud & DevOps' }, { v:'aiml', label:'🤖 AI & Machine Learning' },
                { v:'compete', label:'⚡ Competitive Challenges' }, { v:'art', label:'🎨 Art & Design' },
                { v:'neuro', label:'🧬 Neuro & BioTech' },
              ].map(c => (
                <button key={c.v} onClick={() => toggleInterest(c.v)}
                  className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all active:scale-95 ${interests.has(c.v) ? 'border-red-500 bg-red-500/12 text-red-300' : 'border-white/10 bg-white/5 text-indigo-300 hover:border-white/30'}`}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => goTo(2)} className="px-6 py-3 rounded-full bg-white/10 text-indigo-300 font-bold hover:bg-white/15 transition-colors">← Back</button>
              <button onClick={() => goTo(4)} disabled={interests.size === 0}
                className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-all hover:-translate-y-0.5">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Dream project ── */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-500/10 text-red-400">Your Ambitions</span>
              <span className="text-xs text-indigo-400 ml-auto">4 / 5</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">What's your dream project?</h2>
            <p className="text-indigo-400 text-sm mb-6">If you could start one today, which would you pick?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
              {[
                { v:'sigint', icon:'🔍', label:'Hack a system (ethically)' }, { v:'gamedev', icon:'🕹️', label:'Build a video game' },
                { v:'zinesig', icon:'📰', label:'Write a zine or article' }, { v:'sigweb', icon:'🌍', label:'Launch a web app' },
                { v:'typesig', icon:'📐', label:'Prove a theorem' }, { v:'quantsoc', icon:'📊', label:'Build a trading bot' },
                { v:'cloudsig', icon:'☁️', label:'Deploy cloud infrastructure' }, { v:'ai', icon:'🧠', label:'Train an AI model' },
                { v:'cssig', icon:'🏆', label:'Win a coding contest' }, { v:'neurotech', icon:'🧬', label:'Build a brain-computer interface' },
              ].map(c => (
                <button key={c.v} onClick={() => setProject(c.v)}
                  className={`flex flex-col items-center py-5 px-3 rounded-2xl border-2 transition-all active:scale-95 ${project === c.v ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                  <span className="text-3xl mb-2">{c.icon}</span>
                  <span className="text-sm font-semibold text-white text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => goTo(3)} className="px-6 py-3 rounded-full bg-white/10 text-indigo-300 font-bold hover:bg-white/15 transition-colors">← Back</button>
              <button onClick={() => goTo(5)} disabled={!project}
                className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-all hover:-translate-y-0.5">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Vibe ── */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-500/10 text-red-400">Your Vibe</span>
              <span className="text-xs text-indigo-400 ml-auto">5 / 5</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">What community vibe do you want?</h2>
            <p className="text-indigo-400 text-sm mb-6">Pick the atmosphere that feels most like home.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
              {[
                { v:'competitive', icon:'⚔️', label:'Competitive & challenging' }, { v:'creative', icon:'🎨', label:'Creative & expressive' },
                { v:'builders', icon:'🔧', label:'Builders & makers' }, { v:'research', icon:'🔬', label:'Research & theory' },
                { v:'casual', icon:'🌟', label:'Chill & welcoming' },
              ].map(c => (
                <button key={c.v} onClick={() => setVibe(c.v)}
                  className={`flex flex-col items-center py-5 px-3 rounded-2xl border-2 transition-all active:scale-95 ${vibe === c.v ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                  <span className="text-3xl mb-2">{c.icon}</span>
                  <span className="text-sm font-semibold text-white text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => goTo(4)} className="px-6 py-3 rounded-full bg-white/10 text-indigo-300 font-bold hover:bg-white/15 transition-colors">← Back</button>
              <button onClick={showResults} disabled={!vibe}
                className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-all hover:-translate-y-0.5">
                See my matches 🎯
              </button>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🎯</div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Your SIG Matches</h1>
              <p className="text-indigo-400">Here's where you belong in CompSoc</p>
            </div>
            <div className="space-y-4 mb-8">
              {results.map(({ key, pct }, i) => {
                const sig = SIGS[key]
                const badge = badges[i]
                const discordUrl = DISCORD[key]
                const waUrl = WHATSAPP[key] !== undefined ? WHATSAPP[key] : undefined
                return (
                  <div key={key}
                    className={`bg-white/10 rounded-2xl p-5 border-2 transition-all hover:-translate-y-0.5 ${i === 0 ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                    style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl leading-none">{sig.icon}</span>
                      <span className="text-white font-bold text-lg">{sig.name}</span>
                      <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <p className="text-indigo-300 text-sm leading-relaxed mb-4">{sig.desc}</p>
                    <div className="flex justify-between text-xs text-indigo-400 mb-1">
                      <span>Match score</span>
                      <span className="text-red-400 font-bold">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: animBars ? `${pct}%` : '0%' }} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {discordUrl ? (
                        <a href={discordUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-bold transition-all hover:-translate-y-0.5">
                          <svg width="14" height="11" viewBox="0 0 127.14 96.36" fill="white"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
                          Join on Discord
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-dashed border-white/20 text-indigo-400 text-sm italic">
                          💬 Discord link coming soon
                        </span>
                      )}
                      {waUrl !== undefined && (
                        waUrl ? (
                          <a href={waUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold transition-all hover:-translate-y-0.5">
                            Join WhatsApp
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-dashed border-white/20 text-indigo-400 text-sm italic">
                            📱 WhatsApp link coming soon
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="text-center">
              <button onClick={restart}
                className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/15 text-indigo-300 font-bold transition-colors">
                ↺ Retake the quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
