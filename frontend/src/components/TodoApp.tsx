"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import {
  Trash2,
  Check,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Home,
  SortAsc,
  Clock,
  AlignLeft,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { DeleteConfirmationModal } from "./DeleteConfirmationModal"
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../services/api"
import { ErrorAlert } from "./ErrorAlert"

interface Task {
  id: number
  title: string
  description: string
  done: boolean
  createdAt: Date
}

type SortOption = "newest" | "oldest" | "alphabetical" | "status"

const sortOptions = [
  { value: "newest", label: "Newest First", icon: Clock },
  { value: "oldest", label: "Oldest First", icon: Clock },
  { value: "alphabetical", label: "A-Z", icon: AlignLeft },
  { value: "status", label: "By Status", icon: SortAsc },
] as const

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [deletingTaskIds, setDeletingTaskIds] = useState<number[]>([])
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>("newest")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch todos on component mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true)
        const todosData = await fetchTodos()

        // Convert API data to our Task format
        const formattedTasks: Task[] = todosData.map((todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description || "",
          done: todo.done,
          createdAt: new Date(todo.created_at),
        }))

        setTasks(formattedTasks)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch todos:", err)
        setError("Failed to load tasks. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTodos()
  }, [])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      try {
        setIsSubmitting(true)

        // Create new todo via API
        const newTodoData = await createTodo({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim(),
          done: false,
        })

        // Add the new task to state
        const newTask: Task = {
          id: newTodoData.id,
          title: newTodoData.title,
          description: newTodoData.description || "",
          done: newTodoData.done,
          createdAt: new Date(newTodoData.created_at),
        }

        setTasks((prevTasks) => [...prevTasks, newTask])
        setNewTaskTitle("")
        setNewTaskDescription("")
        setError(null)
      } catch (err) {
        console.error("Failed to create todo:", err)
        setError("Failed to create task. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleTaskAction = async (taskId: number, action: string) => {
    if (action === "toggle") {
      // Find the task to toggle
      const taskToToggle = tasks.find((task) => task.id === taskId)
      if (!taskToToggle) return

      try {
        // Optimistically update UI
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)))

        // Update via API
        await updateTodo(taskId, { done: !taskToToggle.done })
        setError(null)
      } catch (err) {
        console.error("Failed to update todo:", err)
        setError("Failed to update task status. Please try again.")

        // Revert optimistic update on error
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? { ...task, done: taskToToggle.done } : task)),
        )
      }
    } else if (action === "delete") {
      // Find the task to delete and show confirmation modal
      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        setTaskToDelete(task)
      }
    }
  }

  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        // Add task to deleting list to trigger animation
        setDeletingTaskIds((prev) => [...prev, taskToDelete.id])

        // Delete via API
        await deleteTodo(taskToDelete.id)

        // Remove task after animation completes
        setTimeout(() => {
          setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToDelete.id))
          setDeletingTaskIds((prev) => prev.filter((id) => id !== taskToDelete.id))
        }, 300) // Match this with the CSS transition duration

        setError(null)
      } catch (err) {
        console.error("Failed to delete todo:", err)
        setError("Failed to delete task. Please try again.")
        setDeletingTaskIds((prev) => prev.filter((id) => id !== taskToDelete.id))
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
      <nav className="sticky top-0 z-40 backdrop-blur-sm bg-white/95 border-b border-amber-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block ml-4">
                <h1 className="text-xl sm:text-2xl font-bold text-amber-900 font-serif">TaskNest</h1>
                <p className="text-xs sm:text-sm text-amber-700">Your cozy productivity home</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-orange-100 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-orange-300">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-orange-800">{pendingCount} pending</span>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-100 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-emerald-300">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-emerald-800">{completedCount} completed</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-2 font-serif">Create New Task</h2>
            <p className="text-amber-700">Add tasks to your nest and stay organized</p>
          </div>

          <Card className="border border-amber-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <form onSubmit={handleAddTask} className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    name="title"
                    placeholder="Enter task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="h-10 sm:h-12 text-sm sm:text-base border-amber-300 hover:border-amber-400 focus:border-amber-500 bg-white rounded-lg px-3 sm:px-4"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    name="description"
                    placeholder="Enter task description (optional)..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="h-10 sm:h-12 text-sm sm:text-base border-amber-300 hover:border-amber-400 focus:border-amber-500 bg-white rounded-lg px-3 sm:px-4"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-amber-200 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-amber-900 font-serif">My Nest</CardTitle>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="text-sm bg-amber-100 text-amber-800 px-3 py-1 border border-amber-300"
                >
                  {tasks.length} total
                </Badge>

                {/* Desktop Sort Buttons */}
                <div className="hidden md:flex flex-wrap gap-1">
                  {sortOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <Button
                        key={option.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSortChange(option.value)}
                        className={`h-8 px-2 rounded-md text-xs ${
                          sortOption === option.value
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "text-amber-700 hover:bg-amber-50"
                        }`}
                      >
                        <IconComponent className="w-3 h-3 mr-1" />
                        {option.label}
                      </Button>
                    )
                  })}
                </div>

                {/* Mobile Sort Dropdown */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 rounded-md text-xs text-amber-700 hover:bg-amber-50 border border-amber-300"
                      >
                        <MoreHorizontal className="w-4 h-4 mr-1" />
                        Sort
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border-amber-200 shadow-lg z-50">
                      {sortOptions.map((option) => {
                        const IconComponent = option.icon
                        return (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`cursor-pointer ${
                              sortOption === option.value
                                ? "bg-amber-50 text-amber-900"
                                : "text-amber-700 hover:bg-amber-50"
                            }`}
                          >
                            <IconComponent className="w-4 h-4 mr-2" />
                            {option.label}
                            {sortOption === option.value && <Check className="w-4 h-4 ml-auto" />}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-amber-600 animate-spin mb-4" />
                <p className="text-amber-700">Loading your tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="text-lg font-semibold text-amber-900 mb-2 font-serif">Your nest is empty</h4>
                <p className="text-amber-700">Create your first task to start building your productive nest.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`border transition-all duration-200 hover:shadow-md backdrop-blur-sm ${
                      task.done
                        ? "bg-emerald-50/80 border-emerald-300"
                        : "bg-white/80 border-amber-200 hover:border-amber-300"
                    } ${deletingTaskIds.includes(task.id) ? "task-delete-exit" : "task-delete-enter"}`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                          <button
                            onClick={() => handleTaskAction(task.id, "toggle")}
                            className={`mt-1 sm:mt-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              task.done
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-amber-400 hover:border-amber-600 bg-white"
                            }`}
                          >
                            {task.done && <Check className="w-3 h-3 text-white" />}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center">
                              <span
                                className={`text-sm sm:text-base font-medium transition-all duration-200 ${
                                  task.done ? "line-through text-emerald-700" : "text-amber-900"
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.description && (
                                <button
                                  onClick={() => toggleTaskExpand(task.id)}
                                  className="ml-2 p-1 rounded hover:bg-amber-100 transition-colors"
                                >
                                  {expandedTaskId === task.id ? (
                                    <ChevronUp className="w-4 h-4 text-amber-600" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-amber-600" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                variant={task.done ? "default" : "secondary"}
                                className={`text-xs font-medium px-2 py-0.5 ${
                                  task.done
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                    : "bg-orange-100 text-orange-700 border border-orange-300"
                                }`}
                              >
                                {task.done ? "Completed" : "Pending"}
                              </Badge>
                              <span className="text-xs text-amber-600">{task.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4 sm:mt-0 sm:ml-4">
                          <Button
                            type="button"
                            onClick={() => handleTaskAction(task.id, "toggle")}
                            variant="ghost"
                            size="sm"
                            className={`h-9 px-2 sm:px-3 rounded font-medium transition-colors ${
                              task.done
                                ? "text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                                : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            {task.done ? (
                              <>
                                <Circle className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Undo</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Complete</span>
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            onClick={() => handleTaskAction(task.id, "delete")}
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2 sm:px-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>

                      {expandedTaskId === task.id && task.description && (
                        <div
                          className={`mt-4 ml-0 sm:ml-9 p-3 rounded-lg ${
                            task.done ? "bg-emerald-100/50" : "bg-amber-50"
                          }`}
                        >
                          <p className={`text-sm ${task.done ? "text-emerald-700" : "text-amber-800"}`}>
                            {task.description}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="mt-12 sm:mt-16 py-6 sm:py-8 border-t border-amber-200">
          <div className="text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-base font-semibold text-amber-900 mb-2 font-serif">TaskNest</h4>
            <p className="text-sm text-amber-700 mb-4 max-w-md mx-auto">
              Built with React, TypeScript, and Tailwind CSS for cozy task management.
            </p>
            <div className="flex items-center justify-center text-xs sm:text-sm text-amber-600">
              <span>© {getCurrentYear()} TaskNest. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={taskToDelete !== null}
        taskTitle={taskToDelete?.title || ""}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
