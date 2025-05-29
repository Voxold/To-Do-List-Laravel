"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../services/api"

interface Task {
  id: number
  title: string
  description: string
  done: boolean
  createdAt: Date
}

export function useTodos() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all todos
  const loadTodos = useCallback(async () => {
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
  }, [])

  // Load todos on mount
  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  // Add a new todo
  const addTodo = async (title: string, description: string) => {
    try {
      const newTodoData = await createTodo({
        title: title.trim(),
        description: description.trim(),
        done: false,
      })

      const newTask: Task = {
        id: newTodoData.id,
        title: newTodoData.title,
        description: newTodoData.description || "",
        done: newTodoData.done,
        createdAt: new Date(newTodoData.created_at),
      }

      setTasks((prevTasks) => [...prevTasks, newTask])
      setError(null)
      return true
    } catch (err) {
      console.error("Failed to create todo:", err)
      setError("Failed to create task. Please try again.")
      return false
    }
  }

  // Toggle todo completion status
  const toggleTodoStatus = async (taskId: number) => {
    const taskToToggle = tasks.find((task) => task.id === taskId)
    if (!taskToToggle) return false

    try {
      // Optimistically update UI
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)))

      // Update via API
      await updateTodo(taskId, { done: !taskToToggle.done })
      setError(null)
      return true
    } catch (err) {
      console.error("Failed to update todo:", err)
      setError("Failed to update task status. Please try again.")

      // Revert optimistic update on error
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, done: taskToToggle.done } : task)),
      )
      return false
    }
  }

  // Delete a todo
  const removeTodo = async (taskId: number) => {
    try {
      await deleteTodo(taskId)
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
      setError(null)
      return true
    } catch (err) {
      console.error("Failed to delete todo:", err)
      setError("Failed to delete task. Please try again.")
      return false
    }
  }

  return {
    tasks,
    isLoading,
    error,
    setError,
    addTodo,
    toggleTodoStatus,
    removeTodo,
    refreshTodos: loadTodos,
  }
}
