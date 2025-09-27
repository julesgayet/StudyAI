'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileDropProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export default function FileDrop({ onFileSelect, disabled = false }: FileDropProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
        ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-sm text-gray-600">
          {isDragActive ? (
            isDragReject ? (
              <p className="text-red-600">Seuls les fichiers PDF sont acceptés</p>
            ) : (
              <p className="text-blue-600">Déposez votre PDF ici...</p>
            )
          ) : (
            <>
              <p className="font-medium">Glissez-déposez votre PDF ici</p>
              <p className="text-gray-500">ou cliquez pour sélectionner</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
