'use client'

import { useState } from 'react'
import FileDrop from './(components)/FileDrop'
import ResultNotes from './(components)/ResultNotes'
import ResultQuiz from './(components)/ResultQuiz'

interface SectionNotes {
  title: string
  bullets: string[]
}

interface QuizItem {
  question: string
  choices: string[]
  answer_index: number
  explanation: string
}

interface MetaInfo {
  tokens_input: number
  tokens_output: number
  model: string
}

interface GenerateResponse {
  notes: SectionNotes[]
  quiz: QuizItem[]
  meta: MetaInfo
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateResponse | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
    setResult(null)
  }

  const handleGenerate = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
      const response = await fetch(`${apiBase}/generate`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de la génération')
      }

      const data: GenerateResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            StudyAI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transformez vos PDFs de cours en notes de révision structurées et quiz interactifs
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {!result ? (
            <>
              {/* File Upload Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  📄 Sélectionnez votre PDF
                </h2>
                <FileDrop
                  onFileSelect={handleFileSelect}
                  disabled={isLoading}
                />
                
                {selectedFile && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Fichier sélectionné :</span> {selectedFile.name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Taille : {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerate}
                  disabled={!selectedFile || isLoading}
                  className={`
                    px-8 py-3 rounded-lg font-semibold text-lg transition-colors
                    ${selectedFile && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Génération en cours...</span>
                    </div>
                  ) : (
                    'Générer mes révisions'
                  )}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    <span className="font-medium">Erreur :</span> {error}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Results Section */
            <div className="space-y-8">
              {/* Meta Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">ℹ️ Informations</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Modèle utilisé : {result.meta.model}</p>
                  <p>Tokens d'entrée : {result.meta.tokens_input.toLocaleString()}</p>
                  <p>Tokens de sortie : {result.meta.tokens_output.toLocaleString()}</p>
                </div>
              </div>

              {/* Notes */}
              <ResultNotes notes={result.notes} />

              {/* Quiz */}
              <ResultQuiz quiz={result.quiz} />

              {/* Reset Button */}
              <div className="text-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setResult(null)
                    setSelectedFile(null)
                    setError(null)
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Nouveau PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
