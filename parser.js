// parser.js - Parse the simple DSL
function parseTest(text) {
  const lines = text.split('\n').filter(l => l.trim())

  const test = {
    dimensions: [],
    questions: [],
    interpretations: [],
    characters: []
  }

  let currentSection = null
  let currentQuestion = null
  let currentInterpretation = null
  let currentCharacter = null

  function resetCursors() {
    currentSection = null
    currentQuestion = null
    currentInterpretation = null
    currentCharacter = null
  }

  for (const line of lines) {
    const indent = line.search(/\S/)
    const content = line.trim()

    // Dimension definition
    if (content.startsWith('dimension ')) {
      resetCursors()
      const name = content.slice(10).trim()
      currentSection = { name, range: [-10, 10] }
      test.dimensions.push(currentSection)
    }

    // Range for dimension
    else if (content.startsWith('range ') && currentSection) {
      const match = content.match(/range (-?\d+) to (-?\d+)/)
      if (match) {
        currentSection.range = [parseInt(match[1]), parseInt(match[2])]
      }
    }

    // Question definition
    else if (content === 'question') {
      resetCursors()
      currentQuestion = { text: '', scale: 5, scoring: {} }
      test.questions.push(currentQuestion)
    }

    // Question text
    else if (content.startsWith('text ') && currentQuestion) {
      currentQuestion.text = content.slice(5).replace(/^["']|["']$/g, '')
    }

    // Scale
    else if (content.startsWith('scale ') && currentQuestion) {
      const match = content.match(/scale (\d+) to (\d+)/)
      if (match) {
        currentQuestion.scale = parseInt(match[2])
      }
    }

    // Scoring
    else if (content.startsWith('scoring') && currentQuestion) {
      // Next lines will be dimension scores
    }

    // Dimension scoring (indented under scoring)
    else if (indent > 0 && currentQuestion && content.includes(' ')) {
      const parts = content.split(' ')
      const dimension = parts[0]
      const weight = parseFloat(parts[1]) || 1
      currentQuestion.scoring[dimension] = weight
    }

    // Character definition
    else if (content.startsWith('character ')) {
      resetCursors()
      const name = content.slice(10).replace(/^["']|["']$/g, '')
      currentCharacter = { name, scores: {} }
      test.characters.push(currentCharacter)
    }

    // Character dimension scores (indented under character)
    else if (indent > 0 && currentCharacter && content.includes(' ') && !content.startsWith('if')) {
      const parts = content.split(' ')
      const dimension = parts[0]
      const score = parseFloat(parts[1]) || 0
      currentCharacter.scores[dimension] = score
    }

    // Interpretation
    else if (content.startsWith('interpretation')) {
      resetCursors()
      currentInterpretation = { conditions: {}, text: '' }
      test.interpretations.push(currentInterpretation)
    }

    // Interpretation condition
    else if (content.startsWith('if ') && currentInterpretation) {
      const match = content.match(/if (\w+) ([><]=?) (-?\d+)/)
      if (match) {
        currentInterpretation.conditions[match[1]] = {
          operator: match[2],
          value: parseInt(match[3])
        }
      }
    }

    // Interpretation text (indented)
    else if (indent > 0 && currentInterpretation && !content.startsWith('if')) {
      currentInterpretation.text += content + ' '
    }
  }

  return test
}

// URL encoding/decoding
function encodeTest(test) {
  const json = JSON.stringify(test)
  return btoa(encodeURIComponent(json))
}

function decodeTest(encoded) {
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

// Scoring engine
function scoreTest(test, answers) {
  const scores = {}

  test.dimensions.forEach(d => {
    scores[d.name] = 0
  })

  answers.forEach((answer, i) => {
    const question = test.questions[i]
    Object.entries(question.scoring).forEach(([dim, weight]) => {
      scores[dim] += answer * weight
    })
  })

  let interpretation = "Your personality profile is unique!"

  for (const interp of test.interpretations) {
    let matches = true

    for (const [dim, condition] of Object.entries(interp.conditions)) {
      const score = scores[dim]
      const { operator, value } = condition

      if (operator === '>' && !(score > value)) matches = false
      if (operator === '<' && !(score < value)) matches = false
      if (operator === '>=' && !(score >= value)) matches = false
      if (operator === '<=' && !(score <= value)) matches = false
    }

    if (matches) {
      interpretation = interp.text.trim()
      break
    }
  }

  return { scores, interpretation }
}

// Character matching engine
function findBestMatches(test, userScores) {
  if (test.characters.length === 0) {
    return null
  }

  const distances = test.characters.map(char => {
    let sumSquares = 0
    let maxSumSquares = 0

    for (const dim in char.scores) {
      if (userScores[dim] !== undefined) {
        const diff = userScores[dim] - char.scores[dim]
        sumSquares += diff * diff
        const dimDef = test.dimensions.find(d => d.name === dim)
        const range = dimDef ? (dimDef.range[1] - dimDef.range[0]) : 100
        maxSumSquares += range * range
      }
    }

    const distance = Math.sqrt(sumSquares)
    const maxDistance = Math.sqrt(maxSumSquares)
    const similarity = maxDistance > 0 ? Math.max(0, 100 - (distance / maxDistance * 100)) : 100

    return {
      name: char.name,
      distance: distance,
      similarity: Math.round(similarity)
    }
  })

  return distances.sort((a, b) => a.distance - b.distance)
}
