'use client'

import { useEffect, useState } from 'react'
import { client } from '@/lib/sanity'

type HistoryEntry = {
  actor: string
  action: string
  timestamp: string
  notes: string
}

type Haunting = {
  _id: string
  title: string
  reportedBy: string
  entityType?: string
  threatLevel?: number
  rootCause?: string
  exorcismRitual?: string
  category?: string
  status?: string
  workflowStage?: string
  workflowHistory?: HistoryEntry[]
  _createdAt: string
}

export default function Home() {
  const [hauntings, setHauntings] = useState<Haunting[]>([])
  const [form, setForm] = useState({
    title: '',
    errorSnippet: '',
    codeSnippet: '',
    reportedBy: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const query = `*[_type == "haunting"] | order(_createdAt desc) {
      _id,
      title,
      reportedBy,
      entityType,
      threatLevel,
      rootCause,
      exorcismRitual,
      category,
      status,
      _createdAt,
      "workflowStage": workflow->currentStage,
      "workflowHistory": workflow->history
    }`

    client.fetch(query).then(setHauntings)

    const subscription = client.listen(query).subscribe((update) => {
      if (update.result) {
        setHauntings((prev) => {
          const exists = prev.find((h) => h._id === update.result!._id)
          if (exists) {
            return prev.map((h) =>
              h._id === update.result!._id
                ? (update.result as unknown as Haunting)
                : h
            )
          }
          return [update.result as unknown as Haunting, ...prev]
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const playSound = () => {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.4)
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4)
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.4)
    } catch (e) {
      // audio not supported, ignore
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    playSound()

    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setSubmitted(true)
      setForm({ title: '', errorSnippet: '', codeSnippet: '', reportedBy: '' })
      setTimeout(() => setSubmitted(false), 3000)
    }

    setLoading(false)
  }

  const getStageInfo = (stage?: string) => {
    switch (stage) {
      case 'uncontained':
        return { label: '👻 Uncontained — Danger!', color: 'text-red-400' }
      case 'pending_human_review':
        return { label: '🔮 Awaiting Human Approval', color: 'text-yellow-400' }
      case 'banished':
        return { label: '✅ Successfully Banished', color: 'text-green-400' }
      default:
        return { label: '❓ Status Unknown', color: 'text-gray-500' }
    }
  }

  const total = hauntings.length
  const banished = hauntings.filter((h) => h.workflowStage === 'banished').length
  const active = total - banished

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-4 md:p-8 relative overflow-hidden">
      {/* CRT Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.15]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,255,0,0.3) 0px, rgba(0,255,0,0.3) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-center mb-1 text-red-500">
          ☠️ THE CODE EXORCIST
        </h1>
        <p className="text-center text-green-600 mb-6 text-sm">
          Your codebase is haunted. Submit your cursed bugs.
          <br />
          The AI Exorcist will diagnose. The Grand Inquisitor will banish.
        </p>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border border-green-800 rounded p-3 text-center bg-gray-950">
            <div className="text-2xl font-bold text-green-300">{total}</div>
            <div className="text-xs text-green-700">Total Hauntings</div>
          </div>
          <div className="border border-red-800 rounded p-3 text-center bg-gray-950">
            <div className="text-2xl font-bold text-red-400">{active}</div>
            <div className="text-xs text-green-700">Active</div>
          </div>
          <div className="border border-green-800 rounded p-3 text-center bg-gray-950">
            <div className="text-2xl font-bold text-green-400">{banished}</div>
            <div className="text-xs text-green-700">Banished</div>
          </div>
        </div>

        <div className="border border-green-800 rounded p-4 mb-8 bg-gray-950">
          <h2 className="text-lg mb-4 text-green-300">📋 Report a New Haunting</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="w-full bg-black border border-green-700 rounded px-3 py-2 text-green-300 placeholder-green-800 focus:outline-none focus:border-green-400"
              placeholder="Incident Title (e.g., CSS Centering Demon)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="w-full bg-black border border-green-700 rounded px-3 py-2 text-green-300 placeholder-green-800 focus:outline-none focus:border-green-400"
              placeholder="Paste the cursed error / stack trace here..."
              rows={4}
              value={form.errorSnippet}
              onChange={(e) => setForm({ ...form, errorSnippet: e.target.value })}
              required
            />
            <textarea
              className="w-full bg-black border border-green-700 rounded px-3 py-2 text-green-300 placeholder-green-800 focus:outline-none focus:border-green-400"
              placeholder="Paste the actual buggy code snippet here..."
              rows={6}
              value={form.codeSnippet}
              onChange={(e) => setForm({ ...form, codeSnippet: e.target.value })}
              required
            />
            <input
              className="w-full bg-black border border-green-700 rounded px-3 py-2 text-green-300 placeholder-green-800 focus:outline-none focus:border-green-400"
              placeholder="Your name (or leave blank for Anonymous)"
              value={form.reportedBy}
              onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-900 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Contacting the Spirit World...' : '🔴 SUMMON THE EXORCIST'}
            </button>
            {submitted && (
              <p className="text-green-400 text-center text-sm">
                ✅ Haunting reported! AI Exorcist has been summoned.
              </p>
            )}
          </form>
        </div>

        <div>
          <h2 className="text-lg mb-4 text-green-300">
            📡 Live Haunting Radar
            <span className="ml-2 text-xs text-green-700 animate-pulse">● LIVE</span>
          </h2>
          {hauntings.length === 0 ? (
            <p className="text-green-800 text-center py-8">
              No active hauntings detected. The codebase is... temporarily at peace.
            </p>
          ) : (
            <div className="space-y-3">
              {hauntings.map((h) => {
                const stage = getStageInfo(h.workflowStage)
                const isExpanded = expandedId === h._id
                return (
                  <div
                    key={h._id}
                    className="border border-green-900 rounded p-3 bg-gray-950 hover:border-green-600 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : h._id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-green-300 font-bold">{h.title}</span>
                      <span className={`text-xs ${stage.color}`}>{stage.label}</span>
                    </div>
                    <p className="text-green-700 text-xs mb-2">
                      Reported by: {h.reportedBy} · {new Date(h._createdAt).toLocaleString()}
                    </p>
                    {h.entityType && (
                      <p className="text-yellow-500 text-xs">
                        👹 Entity: {h.entityType}
                        {h.threatLevel && ` · Threat Level: ${h.threatLevel}/10`}
                        {h.category && ` · ${h.category}`}
                      </p>
                    )}
                    {h.rootCause && (
                      <p className="text-red-300 text-xs mt-1">
                        🔍 Root Cause: {h.rootCause}
                      </p>
                    )}
                    {h.exorcismRitual && (
                      <pre className="text-purple-400 text-xs mt-1 whitespace-pre-wrap bg-black/50 p-2 rounded border border-purple-900">
                        🕯️ Fix: {h.exorcismRitual}
                      </pre>
                    )}

                    <p className="text-green-800 text-[10px] mt-2 underline">
                      {isExpanded ? '▲ Hide Case Timeline' : '▼ View Case Timeline'}
                    </p>

                    {isExpanded && h.workflowHistory && (
                      <div className="mt-2 border-t border-green-900 pt-2 space-y-2">
                        {h.workflowHistory.map((entry, i) => (
                          <div key={i} className="text-xs">
                            <span className="text-cyan-400 font-bold">{entry.actor}</span>
                            <span className="text-green-700"> — {entry.action}</span>
                            <div className="text-green-800 text-[10px]">
                              {new Date(entry.timestamp).toLocaleString()}
                            </div>
                            {entry.notes && (
                              <div className="text-green-600 text-[11px] italic">
                                {entry.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}