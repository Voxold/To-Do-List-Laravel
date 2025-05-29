"use client"

import { AlertCircle, X } from "lucide-react"

interface ErrorAlertProps {
  message: string
  onClose: () => void
}

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 flex items-start justify-between">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
        <p className="text-red-700">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-red-500 hover:text-red-700 ml-4 p-1 rounded-full hover:bg-red-100 transition-colors"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
