'use client'

import { useState } from 'react'

interface QuizItem {
  question: string
  choices: string[]
  answer_index: number
  explanation: string
}

interface ResultQuizProps {
  quiz: QuizItem[]
}

export default function ResultQuiz({ quiz }: ResultQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | null }>({})
  const [showAnswers, setShowAnswers] = useState(false)

  const handleAnswerSelect = (questionIndex: number, choiceIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: choiceIndex
    }))
  }

  const getChoiceStyle = (questionIndex: number, choiceIndex: number) => {
    const isSelected = selectedAnswers[questionIndex] === choiceIndex
    const isCorrect = choiceIndex === quiz[questionIndex].answer_index
    const isWrong = isSelected && !isCorrect && showAnswers

    if (showAnswers) {
      if (isCorrect) {
        return 'bg-green-100 border-green-500 text-green-800'
      } else if (isWrong) {
        return 'bg-red-100 border-red-500 text-red-800'
      } else {
        return 'bg-gray-50 border-gray-300 text-gray-600'
      }
    }

    return isSelected
      ? 'bg-blue-100 border-blue-500 text-blue-800'
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🧠 Quiz de Révision</h2>
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAnswers ? 'Masquer les réponses' : 'Voir les réponses'}
        </button>
      </div>
      
      <div className="space-y-6">
        {quiz.map((item, questionIndex) => (
          <div key={questionIndex} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {questionIndex + 1}. {item.question}
            </h3>
            
            <div className="space-y-2">
              {item.choices.map((choice, choiceIndex) => (
                <label
                  key={choiceIndex}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${getChoiceStyle(questionIndex, choiceIndex)}
                  `}
                >
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    checked={selectedAnswers[questionIndex] === choiceIndex}
                    onChange={() => handleAnswerSelect(questionIndex, choiceIndex)}
                    className="sr-only"
                  />
                  <span className="font-medium">
                    {String.fromCharCode(65 + choiceIndex)}.
                  </span>
                  <span className="flex-1">{choice}</span>
                  {showAnswers && choiceIndex === item.answer_index && (
                    <span className="text-green-600 font-bold">✓</span>
                  )}
                </label>
              ))}
            </div>
            
            {showAnswers && selectedAnswers[questionIndex] !== null && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Explication :</span> {item.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
