import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getSurveys, deleteSurvey } from '../utils/storage'
import { buildAdminUrl, buildSurveyUrl, decode } from '../utils/encoding'
import EmptyState from '../components/EmptyState'
import { useToast } from '../hooks/useToast'

export default function MySurveys() {
  const [surveys, setSurveys] = useState([])
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    setSurveys(getSurveys())
  }, [])

  const handleDelete = (id, title) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteSurvey(id)
      setSurveys(getSurveys())
      toast.success('Survey deleted')
    }
  }

  if (surveys.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">My Surveys</h1>
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          title="No surveys yet"
          description="Create your first survey to get started. It's quick and free!"
          action={
            <Link to="/create" className="btn-primary">
              Create a Survey
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Surveys</h1>
        <Link to="/create" className="btn-primary text-sm">
          + New Survey
        </Link>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {surveys.map((survey, idx) => {
            const adminData = decode(survey.adminKey)
            return (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="card p-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{survey.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {adminData?.questions?.length || 0} questions ·{' '}
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin#${survey.adminKey}`)}
                    className="btn-ghost text-sm"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => handleDelete(survey.id, survey.title)}
                    className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete survey"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
