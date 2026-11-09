import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { encode, generateId, generate6DigitCode, buildSurveyUrl, buildAdminUrl } from '../utils/encoding'
import { saveSurvey, saveSurveyByCode } from '../utils/storage'
import { useToast } from '../hooks/useToast'

function QuestionEditor({ question, index, onChange, onDelete, onDuplicate, totalQuestions, onMoveUp, onMoveDown }) {
  const [expanded, setExpanded] = useState(true)

  const updateField = (field, value) => {
    onChange({ ...question, [field]: value })
  }

  const updateOption = (optIdx, value) => {
    const options = [...question.options]
    options[optIdx] = value
    updateField('options', options)
  }

  const addOption = () => {
    if (question.options.length < 6) {
      updateField('options', [...question.options, ''])
    }
  }

  const removeOption = (optIdx) => {
    if (question.options.length > 2) {
      updateField('options', question.options.filter((_, i) => i !== optIdx))
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-charcoal dark:hover:text-white transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Question {index + 1}
        </button>

        <div className="flex items-center gap-1">
          {/* Reorder buttons */}
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-25 transition-colors"
            title="Move question up"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalQuestions - 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-25 transition-colors"
            title="Move question down"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {totalQuestions > 1 && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Question Text */}
            <input
              type="text"
              value={question.text}
              onChange={(e) => updateField('text', e.target.value)}
              placeholder="Type your question here…"
              className="input-field text-base font-medium mb-4"
            />

            {/* Options */}
            <div className="space-y-2 mb-4">
              {question.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-400 flex-shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(optIdx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                    className="input-field text-sm flex-1"
                  />
                  {question.options.length > 2 && (
                    <button
                      onClick={() => removeOption(optIdx)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add option + Multiple toggle */}
            <div className="flex items-center justify-between">
              {question.options.length < 6 && (
                <button onClick={addOption} className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium transition-colors">
                  + Add option
                </button>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer ml-auto">
                <span>Allow multiple</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={question.multiple}
                  onClick={() => updateField('multiple', !question.multiple)}
                  className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                    question.multiple ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    question.multiple ? 'translate-x-4' : ''
                  }`} />
                </button>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function LivePreview({ title, description, questions }) {
  const [currentQ, setCurrentQ] = useState(0)

  const validQuestions = questions.filter(q => q.text.trim() && q.options.some(o => o.trim()))

  if (validQuestions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
        Add a question to see the preview
      </div>
    )
  }

  const q = validQuestions[Math.min(currentQ, validQuestions.length - 1)]

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-semibold text-lg">{title || 'Untitled Survey'}</h3>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-accent-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / validQuestions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
        >
          <p className="font-medium mb-4">{q.text}</p>
          <div className="space-y-2">
            {q.options.filter(o => o.trim()).map((opt, i) => (
              <div key={i} className="option-card p-3 flex items-center gap-3">
                <div className={`w-4 h-4 rounded-${q.multiple ? 'md' : 'full'} border-2 border-gray-300 dark:border-gray-600`} />
                <span className="text-sm">{opt}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="btn-ghost text-sm disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          onClick={() => setCurrentQ(Math.min(validQuestions.length - 1, currentQ + 1))}
          disabled={currentQ >= validQuestions.length - 1}
          className="btn-ghost text-sm disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default function Create() {
  const navigate = useNavigate()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([
    { id: generateId(), text: '', options: ['', ''], multiple: false }
  ])
  const [showPreview, setShowPreview] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const addQuestion = () => {
    setQuestions([...questions, { id: generateId(), text: '', options: ['', ''], multiple: false }])
  }

  const updateQuestion = (idx, updated) => {
    const newQuestions = [...questions]
    newQuestions[idx] = updated
    setQuestions(newQuestions)
  }

  const deleteQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const duplicateQuestion = (idx) => {
    const dupe = { ...questions[idx], id: generateId() }
    const newQuestions = [...questions]
    newQuestions.splice(idx + 1, 0, dupe)
    setQuestions(newQuestions)
  }

  const moveQuestion = (idx, dir) => {
    const targetIdx = idx + dir
    if (targetIdx < 0 || targetIdx >= questions.length) return
    const newQuestions = [...questions]
    const temp = newQuestions[idx]
    newQuestions[idx] = newQuestions[targetIdx]
    newQuestions[targetIdx] = temp
    setQuestions(newQuestions)
  }

  const validate = () => {
    if (!title.trim()) {
      toast.error('Please add a survey title')
      return false
    }
    const validQ = questions.filter(q => q.text.trim())
    if (validQ.length === 0) {
      toast.error('Add at least one question')
      return false
    }
    for (const q of validQ) {
      const validOpts = q.options.filter(o => o.trim())
      if (validOpts.length < 2) {
        toast.error(`"${q.text}" needs at least 2 options`)
        return false
      }
    }
    return true
  }

  const handlePublish = () => {
    if (!validate()) return
    setPublishing(true)

    // Generate 6-digit survey code
    const code = generate6DigitCode()

    // Clean up the data
    const surveyData = {
      code,
      title: title.trim(),
      description: description.trim(),
      questions: questions
        .filter(q => q.text.trim())
        .map(q => ({
          id: q.id,
          text: q.text.trim(),
          options: q.options.filter(o => o.trim()),
          multiple: q.multiple
        }))
    }

    const surveyUrl = buildSurveyUrl(surveyData, code)
    const adminKey = encode({
      ...surveyData,
      _created: Date.now(),
      _secret: generateId(12)
    })
    const adminUrl = buildAdminUrl(adminKey)

    // Save to localStorage
    const surveyRecord = {
      id: code,
      code,
      title: surveyData.title,
      adminKey,
      surveyData,
      createdAt: Date.now()
    }
    saveSurvey(surveyRecord)
    saveSurveyByCode(code, surveyData)

    // Navigate to published page
    setTimeout(() => {
      navigate('/published', {
        state: {
          surveyUrl,
          adminUrl,
          adminKey,
          code,
          title: surveyData.title,
          questionCount: surveyData.questions.length
        }
      })
    }, 400)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Create Survey</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          Build your survey, publish it, and share the link.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Builder */}
        <div className="flex-1 min-w-0">
          {/* Title & Description */}
          <div className="card p-5 sm:p-6 mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Survey title"
              className="input-field text-xl font-semibold mb-3 border-0 px-0 focus:ring-0"
              style={{ background: 'transparent' }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description (optional)"
              rows={2}
              className="input-field text-sm resize-none border-0 px-0 focus:ring-0"
              style={{ background: 'transparent' }}
            />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {questions.map((q, idx) => (
                <QuestionEditor
                  key={q.id}
                  question={q}
                  index={idx}
                  onChange={(updated) => updateQuestion(idx, updated)}
                  onDelete={() => deleteQuestion(idx)}
                  onDuplicate={() => duplicateQuestion(idx)}
                  onMoveUp={() => moveQuestion(idx, -1)}
                  onMoveDown={() => moveQuestion(idx, 1)}
                  totalQuestions={questions.length}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Add Question */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={addQuestion}
            className="w-full mt-4 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl
                       text-gray-400 dark:text-gray-500 hover:border-accent-300 dark:hover:border-accent-600
                       hover:text-accent-500 transition-all duration-200 text-sm font-medium"
          >
            + Add Question
          </motion.button>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary flex-1 sm:flex-none disabled:opacity-50"
            >
              {publishing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Publishing…
                </span>
              ) : 'Publish Survey'}
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary lg:hidden"
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Live Preview (desktop: always visible, mobile: toggle) */}
        <div className={`lg:w-80 xl:w-96 flex-shrink-0 ${showPreview ? '' : 'hidden lg:block'}`}>
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Live Preview
              </span>
            </div>
            <div className="card p-5 sm:p-6">
              <LivePreview title={title} description={description} questions={questions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
