// API service for handling all backend requests

interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface TodoItem {
  id: number
  title: string
  description: string
  done: boolean
  created_at: string // ISO date string from backend
}

const API_URL = "http://127.0.0.1:8000"

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    data,
    status: response.status,
    message: "Success",
  }
}

// Get all todos
export async function fetchTodos(): Promise<TodoItem[]> {
  const response = await fetch(`${API_URL}/todos`)
  const result = await handleResponse<TodoItem[]>(response)
  return result.data
}

// Get a specific todo
export async function fetchTodo(id: number): Promise<TodoItem> {
  const response = await fetch(`${API_URL}/todos/${id}`)
  const result = await handleResponse<TodoItem>(response)
  return result.data
}

// Create a new todo
export async function createTodo(todo: Omit<TodoItem, "id" | "created_at">): Promise<TodoItem> {
  const response = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })

  const result = await handleResponse<TodoItem>(response)
  return result.data
}

// Update a todo
export async function updateTodo(id: number, todo: Partial<TodoItem>): Promise<TodoItem> {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })

  const result = await handleResponse<TodoItem>(response)
  return result.data
}

// Delete a todo
export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: "DELETE",
  })

  await handleResponse<void>(response)
}
