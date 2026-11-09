const SURVEYS_KEY = 'pulse_surveys'
const RESPONSES_PREFIX = 'pulse_responses_'
const SUBMITTED_PREFIX = 'pulse_submitted_'

// ─── Demo Surveys for 6-digit code instant testing ──────────

export const DEMO_SURVEYS = {
  '101010': {
    code: '101010',
    title: 'Work & Lifestyle Vibe Check',
    description: 'A quick 3-question survey about your personal preferences. No right or wrong answers!',
    questions: [
      {
        id: 'q1',
        text: 'What time of day do you feel most focused and creative?',
        options: [
          'Early morning (6 AM – 9 AM)',
          'Late morning (9 AM – 12 PM)',
          'Mid afternoon (1 PM – 5 PM)',
          'Late night owl (9 PM+)'
        ],
        multiple: false
      },
      {
        id: 'q2',
        text: 'What environment helps you do your best thinking?',
        options: [
          'Total quiet library atmosphere',
          'Ambient coffee shop buzz',
          'Upbeat music on headphones',
          'Collaborative open studio space'
        ],
        multiple: false
      },
      {
        id: 'q3',
        text: 'Pick your favorite ways to recharge on weekends (select all that apply):',
        options: [
          'Solo relaxation, reading or gaming',
          'Outdoor adventure, hiking or sports',
          'Social hangouts & dinner with friends',
          'Creative projects or cooking'
        ],
        multiple: true
      }
    ]
  },
  '202020': {
    code: '202020',
    title: 'Team Dynamics & Collaboration',
    description: 'Share your perspective on how you love collaborating and learning.',
    questions: [
      {
        id: 'q1',
        text: 'When starting a new project, what phase excites you most?',
        options: [
          'Brainstorming big-picture ideas',
          'Architecting the clean structure',
          'Rapid prototyping & seeing it live',
          'Polishing details and user experience'
        ],
        multiple: false
      },
      {
        id: 'q2',
        text: 'Your preferred way to pick up a new skill:',
        options: [
          'Hands-on building & trial-and-error',
          'Watching video tutorials & deep dives',
          'Reading official documentation',
          'Pairing with a colleague or mentor'
        ],
        multiple: false
      }
    ]
  }
}

// ─── Survey Management ──────────────────────────────────────

export function saveSurvey(survey) {
  const surveys = getSurveys()
  const existing = surveys.findIndex(s => s.id === survey.id)
  if (existing >= 0) {
    surveys[existing] = survey
  } else {
    surveys.unshift(survey)
  }
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys))
  if (survey.code && survey.surveyData) {
    saveSurveyByCode(survey.code, survey.surveyData)
  }
}

export function getSurveys() {
  try {
    return JSON.parse(localStorage.getItem(SURVEYS_KEY) || '[]')
  } catch {
    return []
  }
}

export function getSurvey(id) {
  return getSurveys().find(s => s.id === id)
}

export function deleteSurvey(id) {
  const surveys = getSurveys().filter(s => s.id !== id)
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys))
  localStorage.removeItem(RESPONSES_PREFIX + id)
}

// ─── 6-Digit Code Helpers ───────────────────────────────────

export function getSurveyByCode(code) {
  if (!code) return null
  const cleanCode = String(code).trim()

  // 1. Check built-in demo surveys
  if (DEMO_SURVEYS[cleanCode]) {
    return DEMO_SURVEYS[cleanCode]
  }

  // 2. Check localStorage direct by code
  try {
    const direct = localStorage.getItem(`pulse_survey_${cleanCode}`)
    if (direct) {
      const parsed = JSON.parse(direct)
      if (parsed && parsed.questions) return parsed
    }
  } catch {}

  // 3. Search surveys list in localStorage
  const surveys = getSurveys()
  const found = surveys.find(s => s.code === cleanCode || s.id === cleanCode)
  if (found) {
    if (found.surveyData) return found.surveyData
  }

  return null
}

export function saveSurveyByCode(code, surveyData) {
  if (!code || !surveyData) return
  const cleanCode = String(code).trim()
  try {
    localStorage.setItem(`pulse_survey_${cleanCode}`, JSON.stringify(surveyData))
  } catch (e) {
    console.error('Failed to save survey by code:', e)
  }
}

// ─── Response Management ────────────────────────────────────

export function saveResponse(adminKey, response) {
  const responses = getResponses(adminKey)
  responses.push({ ...response, _addedAt: Date.now() })
  localStorage.setItem(RESPONSES_PREFIX + adminKey, JSON.stringify(responses))
}

export function getResponses(adminKey) {
  try {
    return JSON.parse(localStorage.getItem(RESPONSES_PREFIX + adminKey) || '[]')
  } catch {
    return []
  }
}

export function deleteResponse(adminKey, index) {
  const responses = getResponses(adminKey)
  responses.splice(index, 1)
  localStorage.setItem(RESPONSES_PREFIX + adminKey, JSON.stringify(responses))
}

export function clearResponses(adminKey) {
  localStorage.removeItem(RESPONSES_PREFIX + adminKey)
}

// ─── Submission Tracking ────────────────────────────────────

export function markSubmitted(surveyHash) {
  localStorage.setItem(SUBMITTED_PREFIX + surveyHash, 'true')
}

export function hasSubmitted(surveyHash) {
  return localStorage.getItem(SUBMITTED_PREFIX + surveyHash) === 'true'
}

// ─── Simple hash for survey identification ──────────────────

export function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}
