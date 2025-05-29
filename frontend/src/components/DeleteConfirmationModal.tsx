"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  taskTitle: string
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmationModal({ isOpen, taskTitle, onClose, onConfirm }: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-4 sm:p-6 mx-4 sm:mx-auto border-amber-200 bg-white/90 backdrop-blur-sm">
        <DialogHeader className="flex flex-col items-center sm:items-start gap-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-lg sm:text-xl text-amber-900 font-serif">Remove from Nest</DialogTitle>
          <DialogDescription className="text-center sm:text-left text-sm text-amber-700">
            Are you sure you want to remove <span className="font-medium text-amber-900">"{taskTitle}"</span> from your
            nest? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 sm:mt-6 gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-900"
          >
            Keep in Nest
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white mt-2 sm:mt-0"
          >
            Remove Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
