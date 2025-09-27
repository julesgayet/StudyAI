'use client'

interface SectionNotes {
  title: string
  bullets: string[]
}

interface ResultNotesProps {
  notes: SectionNotes[]
}

export default function ResultNotes({ notes }: ResultNotesProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Notes de Révision</h2>
      <div className="space-y-6">
        {notes.map((section, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-gray-700 text-sm leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
