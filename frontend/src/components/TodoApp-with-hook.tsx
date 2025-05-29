"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { SortAsc, Clock, AlignLeft } from "lucide-react"
import { useTodos } from "../hooks/useTodos"

type SortOption = "newest" | "oldest" | "alphabetical" | "status"

const sortOptions = [
  { value: "newest", label: "Newest First", icon: Clock },
  { value: "oldest", label: "Oldest First", icon: Clock },
  { value: "alphabetical", label: "A-Z", icon: AlignLeft },
  { value: "status", label: "By Status", icon: SortAsc },
] as const

// Alternative implementation using the custom hook
// To use this version, rename this file to TodoApp.tsx
export default function TodoApp() {
  const { tasks, isLoading, error, setError, addTodo, toggleTodoStatus, removeTodo } = useTodos()

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [deletingTaskIds, setDeletingTaskIds] = useState<number[]>([])
  const [taskToDelete, setTaskToDelete] = useState<{ id: number; title: string } | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>("newest")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      setIsSubmitting(true)
      const success = await addTodo(newTaskTitle, newTaskDescription)
      if (success) {
        setNewTaskTitle("")
        setNewTaskDescription("")
      }
      setIsSubmitting(false)
    }
  }

  const handleTaskAction = async (taskId: number, action: string, taskTitle?: string) => {
    if (action === "toggle") {
      await toggleTodoStatus(taskId)
    } else if (action === "delete" && taskTitle) {
      setTaskToDelete({ id: taskId, title: taskTitle })
    }
  }

  const confirmDelete = async () => {
    if (taskToDelete) {
      // Add task to deleting list to trigger animation
      setDeletingTaskIds((prev) => [...prev, taskToDelete.id])

      const success = await removeTodo(taskToDelete.id)

      if (!success) {
        // Remove from deleting list if failed
        setDeletingTaskIds((prev) => prev.filter((id) => id !== taskToDelete.id))
      } else {
        // Remove task after animation completes
        setTimeout(() => {
          setDeletingTaskIds((prev) => prev.filter((id) => id !== taskToDelete.id))
        }, 300) // Match this with the CSS transition duration
      }
    }
  }

  const toggleTaskExpand = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  const completedCount = tasks.filter((t) => t.done).length
  const pendingCount = tasks.filter((t) => !t.done).length

  // Sort tasks based on the selected option
  const sortedTasks = useMemo(() => {
    const sorted = [...tasks]

    switch (sortOption) {
      case "newest":
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      case "oldest":
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      case "alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case "status":
        return sorted.sort((a, b) => {
          if (a.done === b.done) return 0
          return a.done ? 1 : -1
        })
      default:
        return sorted
    }
  }, [tasks, sortOption])

  const handleSortChange = (option: SortOption) => {
    setSortOption(option)
  }

  const getCurrentYear = () => {
    return new Date().getFullYear()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Rest of the component remains the same as TodoApp.tsx */}
      {/* Just replace the data handling with the hook methods */}
    </div>
  )
}
