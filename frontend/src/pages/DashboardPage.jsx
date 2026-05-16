import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, AlertTriangle, FolderKanban, ListTodo, Loader2 } from 'lucide-react'
import { tasksApi } from '../api/services'
import useAuthStore from '../store/authStore'
import { format } from 'date-fns'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white font-mono">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  return <span className={`badge-${status.toLowerCase().replace('_', '_')}`}>{status.replace('_', ' ')}</span>
}

function PriorityBadge({ priority }) {
  return <span className={`badge-${priority.toLowerCase()}`}>{priority}</span>
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    tasksApi.getDashboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-green-500" size={32} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-neutral-500 mt-1">Here's what's happening across your projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FolderKanban} label="Projects" value={data?.totalProjects ?? 0} color="bg-purple-500/10 text-purple-400" />
        <StatCard icon={ListTodo} label="Todo" value={data?.todoTasks ?? 0} color="bg-neutral-500/20 text-neutral-400" />
        <StatCard icon={Clock} label="In Progress" value={data?.inProgressTasks ?? 0} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={AlertTriangle} label="Overdue" value={data?.overdueTasks ?? 0} color="bg-red-500/10 text-red-400" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            My Tasks
          </h2>
          {data?.myTasks?.length === 0 ? (
            <p className="text-neutral-500 text-sm py-4 text-center">No tasks assigned to you 🎉</p>
          ) : (
            <div className="space-y-3">
              {data?.myTasks?.slice(0, 6).map(task => (
                <Link
                  key={task.id}
                  to={`/projects/${task.projectId}`}
                  className="block p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-medium text-white line-clamp-1">{task.title}</p>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">{task.projectName}</span>
                    {task.dueDate && (
                      <span className={`text-xs ${task.overdue ? 'text-red-400' : 'text-neutral-500'}`}>
                        {task.overdue ? '⚠ ' : ''}Due {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    <PriorityBadge priority={task.priority} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            Recent Tasks
          </h2>
          {data?.recentTasks?.length === 0 ? (
            <p className="text-neutral-500 text-sm py-4 text-center">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {data?.recentTasks?.slice(0, 6).map(task => (
                <Link
                  key={task.id}
                  to={`/projects/${task.projectId}`}
                  className="block p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-white line-clamp-1">{task.title}</p>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{task.projectName}</span>
                    {task.assignee && (
                      <span className="text-xs text-neutral-500">→ {task.assignee.name}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
