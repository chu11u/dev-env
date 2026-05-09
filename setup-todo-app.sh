#!/bin/bash
# ============================================================
# Setup Todo App Project
# Run on server: ./setup-todo-app.sh
# ============================================================

set -e

PROJECT_DIR="/home/elkayam/dev-env/projects/todo"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo "========================================"
echo "  Setting up Todo App"
echo "========================================"

# Create directory structure
mkdir -p "$PROJECT_DIR/src/components"
mkdir -p "$PROJECT_DIR/public"

# --- package.json ---
cat > "$PROJECT_DIR/package.json" << 'PKGJSON'
{
  "name": "todo-app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 3000",
    "start": "vite preview --host 0.0.0.0 --port 3000"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.4.1"
  }
}
PKGJSON

# --- vite.config.js ---
cat > "$PROJECT_DIR/vite.config.js" << 'VITECONFIG'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
})
VITECONFIG

# --- tailwind.config.js ---
cat > "$PROJECT_DIR/tailwind.config.js" << 'TAILWIND'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
TAILWIND

# --- postcss.config.js ---
cat > "$PROJECT_DIR/postcss.config.js" << 'POSTCSS'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS

# --- index.html ---
cat > "$PROJECT_DIR/index.html" << 'INDEXHTML'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo App</title>
  </head>
  <body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
INDEXHTML

# --- src/index.css ---
cat > "$PROJECT_DIR/src/index.css" << 'INDEXCSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 3px;
}
.todo-item {
  transition: all 0.2s ease-in-out;
}
.todo-item:hover {
  transform: translateX(4px);
}
INDEXCSS

# --- src/main.jsx ---
cat > "$PROJECT_DIR/src/main.jsx" << 'MAINJSX'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
MAINJSX

# --- src/App.jsx ---
cat > "$PROJECT_DIR/src/App.jsx" << 'APPJSX'
import { useState, useEffect } from 'react'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'
import TodoFilter from './components/TodoFilter'
import TodoStats from './components/TodoStats'

const FILTERS = {
  all: (todos) => todos,
  active: (todos) => todos.filter(t => !t.completed),
  completed: (todos) => todos.filter(t => t.completed),
}

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todos')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = (text) => {
    if (!text.trim()) return
    setTodos(prev => [{
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }, ...prev])
  }

  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const editTodo = (id, newText) => {
    if (!newText.trim()) return
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      )
    )
  }

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed))
  }

  const filteredTodos = FILTERS[filter](todos)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-2">
            📝 Todo App
          </h1>
          <p className="text-purple-300">Stay organized, stay productive</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <TodoInput onAdd={addTodo} />
          </div>

          <div className="px-6 py-3 bg-white/5 border-b border-white/10">
            <TodoFilter current={filter} onFilter={setFilter} />
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            <TodoList
              todos={filteredTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
            {filteredTodos.length === 0 && (
              <div className="text-center py-8 text-purple-300">
                {filter === 'all' ? 'No todos yet. Add one above!' :
                 filter === 'active' ? 'No active todos. Nice work!' :
                 'No completed todos yet. Get to work!'}
              </div>
            )}
          </div>

          <TodoStats
            total={todos.length}
            active={todos.filter(t => !t.completed).length}
            completed={todos.filter(t => t.completed).length}
            onClearCompleted={clearCompleted}
          />
        </div>

        <p className="text-center text-purple-400/50 text-sm mt-4">
          Built with React + Vite + Tailwind • Data saved locally
        </p>
      </div>
    </div>
  )
}

export default App
APPJSX

# --- src/components/TodoInput.jsx ---
cat > "$PROJECT_DIR/src/components/TodoInput.jsx" << 'TODOINPUT'
import { useState } from 'react'

function TodoInput({ onAdd }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      onAdd(text)
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                   text-white placeholder-purple-300 focus:outline-none
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   transition-all duration-200"
        autoFocus
      />
      <button
        type="submit"
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white
                   font-semibold rounded-xl transition-all duration-200
                   hover:scale-105 active:scale-95"
      >
        Add
      </button>
    </form>
  )
}

export default TodoInput
TODOINPUT

# --- src/components/TodoList.jsx ---
cat > "$PROJECT_DIR/src/components/TodoList.jsx" << 'TODOLIST'
import TodoItem from './TodoItem'

function TodoList({ todos, onToggle, onDelete, onEdit }) {
  return (
    <div className="space-y-2">
      {todos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          index={index}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

export default TodoList
TODOLIST

# --- src/components/TodoItem.jsx ---
cat > "$PROJECT_DIR/src/components/TodoItem.jsx" << 'TODOITEM'
import { useState } from 'react'

function TodoItem({ todo, index, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)

  const handleEdit = () => {
    if (editText.trim() && editText.trim() !== todo.text) {
      onEdit(todo.id, editText)
    } else {
      setEditText(todo.text)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEdit()
    if (e.key === 'Escape') {
      setEditText(todo.text)
      setIsEditing(false)
    }
  }

  return (
    <div
      className="todo-item flex items-center gap-3 p-3 bg-white/5 rounded-xl
                 border border-white/10 hover:bg-white/10 animate-slide-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                   transition-all duration-200 ${
                     todo.completed
                       ? 'bg-green-500 border-green-500'
                       : 'border-purple-400 hover:border-purple-300'
                   }`}
      >
        {todo.completed && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 bg-white/10 border border-purple-500 rounded
                     text-white focus:outline-none"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={() => { setIsEditing(true); setEditText(todo.text) }}
          className={`flex-1 text-white cursor-pointer select-none ${
            todo.completed ? 'line-through opacity-50' : ''
          }`}
        >
          {todo.text}
        </span>
      )}

      <button
        onClick={() => onDelete(todo.id)}
        className="flex-shrink-0 p-2 text-purple-400 hover:text-red-400
                   transition-colors duration-200 opacity-30 hover:opacity-100
                   hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v4m4-4v4m1-8V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

export default TodoItem
TODOITEM

# --- src/components/TodoFilter.jsx ---
cat > "$PROJECT_DIR/src/components/TodoFilter.jsx" << 'TODOFILTER'
function TodoFilter({ current, onFilter }) {
  const filters = ['all', 'active', 'completed']

  return (
    <div className="flex gap-2">
      {filters.map(f => (
        <button
          key={f}
          onClick={() => onFilter(f)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
            current === f
              ? 'bg-purple-600 text-white'
              : 'text-purple-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}

export default TodoFilter
TODOFILTER

# --- src/components/TodoStats.jsx ---
cat > "$PROJECT_DIR/src/components/TodoStats.jsx" << 'TODOSTATS'
function TodoStats({ total, active, completed, onClearCompleted }) {
  return (
    <div className="px-6 py-3 bg-white/5 border-t border-white/10 flex justify-between items-center">
      <div className="flex gap-4 text-sm text-purple-300">
        <span>{active} item{active !== 1 ? 's' : ''} left</span>
        <span>{completed} completed</span>
      </div>
      {completed > 0 && (
        <button
          onClick={onClearCompleted}
          className="text-sm text-purple-400 hover:text-red-400 transition-colors duration-200"
        >
          Clear completed
        </button>
      )}
    </div>
  )
}

export default TodoStats
TODOSTATS

# --- Dockerfile ---
cat > "$PROJECT_DIR/Dockerfile" << 'DOCKERFILE'
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
DOCKERFILE

# --- docker-compose.yml ---
cat > "$PROJECT_DIR/docker-compose.yml" << 'DOCKERCOMPOSE'
version: '3.8'

services:
  app:
    build: .
    container_name: todo
    restart: unless-stopped
    ports:
      - "127.0.0.1:3001:3000"
    environment:
      - NODE_ENV=production
DOCKERCOMPOSE

# --- .gitignore ---
cat > "$PROJECT_DIR/.gitignore" << 'GITIGNORE'
node_modules/
dist/
.env
.DS_Store
GITIGNORE

# --- Set up nginx config ---
echo ""
echo "Setting up nginx for todo.apps.elkayam.me ..."
cp /home/elkayam/dev-env/nginx-project-template.conf "$NGINX_AVAILABLE/todo.apps.elkayam.me.conf"
sed -i "s/{{PROJECT_NAME}}/todo/g; s/{{PROJECT_PORT}}/3001/g" "$NGINX_AVAILABLE/todo.apps.elkayam.me.conf"
ln -sf "$NGINX_AVAILABLE/todo.apps.elkayam.me.conf" "$NGINX_ENABLED/"
nginx -t && systemctl reload nginx 2>/dev/null || true

# --- Init git ---
cd "$PROJECT_DIR"
git init
git add .
git commit -m "Initial: Todo App (React + Vite + Tailwind)"

# --- Link to GitHub ---
echo ""
echo "========================================"
echo "  Todo App Created!"
echo "========================================"
echo ""
echo "Location: $PROJECT_DIR"
echo "Subdomain: https://todo.apps.elkayam.me"
echo ""
echo "Next steps:"
echo "  1. Link GitHub:"
echo "     cd $PROJECT_DIR"
echo "     git remote add origin https://github.com/chu11u/todo.git"
echo "     git push -u origin main"
echo ""
echo "  2. Build & deploy:"
echo "     cd $PROJECT_DIR"
echo "     docker compose up -d --build"
echo ""
echo "  3. Visit: https://todo.apps.elkayam.me"
echo ""
