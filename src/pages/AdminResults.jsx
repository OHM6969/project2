import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { decode, decodeResponse } from '../utils/encoding'
import { getResponses, saveResponse, deleteResponse } from '../utils/storage'
import EmptyState from '../components/EmptyState'
import { useToast } from '../hooks/useToast'

const COLORS = ['#6366f1', '#8098f9', '#a4b8fc', '#c7d6fe', '#e0e9ff', '#f0f4ff']

function ChartCard({ question, responses }) {
  const [chartType, setChartType] = useState('bar')

  const data = useMemo(() => {
    const counts = {}
    question.options.forEach(opt => { counts[opt] = 0 })
    responses.forEach(r => {
      const answer = r.answers?.find(a => a.questionId === question.id)
      if (answer) {
        answer.selected.forEach(s => {
          if (counts[s] !== undefined) counts[s]++
        })
      }
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [question, responses])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">{question.text}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {total} response{total !== 1 ? 's' : ''} · {question.multiple ? 'Multiple select' : 'Single select'}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition-colors ${chartType === 'bar' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M4 20h16M8 16V8M12 16V4M16 16v-4" />
            </svg>
          </button>
          <button
            onClick={() => setChartType('donut')}
            className={`p-1.5 rounded-md transition-colors ${chartType === 'donut' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </button>
        </div>
      </div>

      {total === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
          No responses yet
        </div>
      ) : chartType === 'bar' ? (
        <ResponsiveContainer width="100%" height={Math.max(120, data.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              formatter={(value) => [`${value} (${total > 0 ? Math.round(value / total * 100) : 0}%)`, 'Responses']}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={data.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {data.filter(d => d.value > 0).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                formatter={(value) => [`${value} (${total > 0 ? Math.round(value / total * 100) : 0}%)`, 'Responses']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="ml-4 space-y-1.5">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{d.name}</span>
                <span className="font-medium ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [survey, setSurvey] = useState(null)
  const [adminKey, setAdminKey] = useState('')
  const [responses, setResponses] = useState([])
  const [pasteCode, setPasteCode] = useState('')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('charts') // 'charts' | 'table'
  const [error, setError] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) {
      setError(true)
      return
    }
    setAdminKey(hash)
    const data = decode(hash)
    if (!data || !data.title || !data.questions) {
      setError(true)
      return
    }
    setSurvey(data)
    setResponses(getResponses(hash))
  }, [location.hash])

  const handlePaste = () => {
    const rawTokens = pasteCode.trim().split(/[\r\n]+/)
    let added = 0
    let failed = 0
    const existing = getResponses(adminKey)

    rawTokens.forEach(rawLine => {
      const line = rawLine.trim()
      if (!line) return

      // Attempt 1: direct decode
      let resp = decodeResponse(line)

      // Attempt 2: extract base64url substring if pasted with surrounding text
      if (!resp || !resp.name) {
        const matches = line.match(/[A-Za-z0-9_-]{20,}/g)
        if (matches) {
          for (const m of matches) {
            const candidate = decodeResponse(m)
            if (candidate && candidate.name && candidate.answers) {
              resp = candidate
              break
            }
          }
        }
      }

      if (resp && resp.name && resp.answers) {
        const isDuplicate = existing.some(e =>
          e.name === resp.name &&
          e.phone === resp.phone &&
          e.submittedAt === resp.submittedAt
        )
        if (!isDuplicate) {
          saveResponse(adminKey, resp)
          existing.push(resp)
          added++
        }
      } else {
        if (line.length > 15 && !line.toLowerCase().includes('response for')) {
          failed++
        }
      }
    })

    if (added > 0) {
      setResponses(getResponses(adminKey))
      toast.success(`Added ${added} new response${added > 1 ? 's' : ''}`)
    } else if (failed === 0 && rawTokens.length > 0) {
      toast.info('Response already added or not found')
    }
    if (failed > 0) {
      toast.error(`${failed} code${failed > 1 ? 's' : ''} could not be decoded`)
    }
    setPasteCode('')
  }

  const handleDeleteResponse = (idx) => {
    if (confirm('Delete this response?')) {
      deleteResponse(adminKey, idx)
      setResponses(getResponses(adminKey))
      toast.success('Response deleted')
    }
  }

  const exportCSV = () => {
    if (!survey || responses.length === 0) return

    const headers = ['Name', 'Age', 'Phone', ...survey.questions.map(q => q.text)]
    const rows = responses.map(r => [
      r.name || '',
      r.age || '',
      r.phone || '',
      ...survey.questions.map(q => {
        const answer = r.answers?.find(a => a.questionId === q.id)
        return answer ? answer.selected.join('; ') : ''
      })
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${survey.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported!')
  }

  const filteredResponses = useMemo(() => {
    if (!search.trim()) return responses
    const q = search.toLowerCase()
    return responses.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      String(r.age).includes(q)
    )
  }, [responses, search])

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Invalid Admin Link</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This admin link is invalid or corrupted.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-300 border-t-accent-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{survey.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {survey.description || 'Admin Dashboard'} · {responses.length} response{responses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Paste Box */}
      <div className="card p-5 sm:p-6 mb-8">
        <label className="text-sm font-semibold mb-2 block">Paste Response Codes</label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Paste one or more response codes (one per line) to add responses.
        </p>
        <textarea
          value={pasteCode}
          onChange={(e) => setPasteCode(e.target.value)}
          placeholder="Paste response codes here…"
          rows={3}
          className="input-field text-sm font-mono resize-none mb-3"
        />
        <button
          onClick={handlePaste}
          disabled={!pasteCode.trim()}
          className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add Responses
        </button>
      </div>

      {responses.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
          title="No responses yet"
          description="Share your survey link and paste response codes here to see results."
        />
      ) : (
        <>
          {/* View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setView('charts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === 'charts'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-charcoal dark:text-gray-200'
                    : 'text-gray-500 dark:text-gray-400 hover:text-charcoal dark:hover:text-gray-200'
                }`}
              >
                Charts
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === 'table'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-charcoal dark:text-gray-200'
                    : 'text-gray-500 dark:text-gray-400 hover:text-charcoal dark:hover:text-gray-200'
                }`}
              >
                Responses
              </button>
            </div>

            <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>

          <AnimatePresence mode="wait">
            {view === 'charts' ? (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {survey.questions.map(q => (
                  <ChartCard key={q.id} question={q} responses={responses} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, age, or phone…"
                    className="input-field text-sm"
                  />
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left px-4 py-3 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                          <th className="text-left px-4 py-3 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</th>
                          <th className="text-left px-4 py-3 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                          {survey.questions.map(q => (
                            <th key={q.id} className="text-left px-4 py-3 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider max-w-[150px] truncate">
                              {q.text}
                            </th>
                          ))}
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {filteredResponses.map((r, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{r.name}</td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.age}</td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{r.phone || '—'}</td>
                            {survey.questions.map(q => {
                              const answer = r.answers?.find(a => a.questionId === q.id)
                              return (
                                <td key={q.id} className="px-4 py-3">
                                  {answer ? (
                                    <div className="flex flex-wrap gap-1">
                                      {answer.selected.map((s, i) => (
                                        <span key={i} className="inline-block px-2 py-0.5 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-md text-xs">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-300 dark:text-gray-600">—</span>
                                  )}
                                </td>
                              )
                            })}
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDeleteResponse(idx)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-300 hover:text-red-500 transition-colors"
                                title="Delete response"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {filteredResponses.length === 0 && search && (
                  <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
                    No results match "{search}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
