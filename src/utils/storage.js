const SURVEYS_KEY = 'pulse_surveys'
const RESPONSES_PREFIX = 'pulse_responses_'
const SUBMITTED_PREFIX = 'pulse_submitted_'

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
