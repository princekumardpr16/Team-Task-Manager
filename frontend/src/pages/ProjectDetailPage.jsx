import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Users, ChevronLeft, Loader2, Trash2, UserPlus, X, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { projectsApi, tasksApi } from '../api/services'
import useAuthStore from '../store/authStore'

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done' }
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

function TaskCard({ task, onUpdate, onDelete, members, isAdmin }) {
  const [editing, setEditing] = useState(false)

  const handleStatusChange = async (status) => {
    try {
      const { data } = await tasksApi.update(task.id, { status })
      onUpdate(data)
    } catch { toast.error('Failed to update status') }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 group hover:border-neutral-600 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-white leading-snug">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditing(true)} className="text-neutral-500 hover:text-white">
            <Edit2 size={13} />
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(task.id)} className="text-neutral-500 hover:text-red-400">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {task.description && <p className="text-xs text-neutral-500 mb-2 line-clamp-2">{task.description}</p>}

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
        {task.dueDate && (
          <span className={`text-xs font-mono ${task.overdue ? 'text-red-400' : 'text-neutral-500'}`}>
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
        {task.assignee && (
          <span className="text-xs text-neutral-500 ml-auto">→ {task.assignee.name.split(' ')[0]}</span>
        )}
      </div>

      <select
        value={task.status}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="mt-2 w-full text-xs bg-[#111] border border-[#2a2a2a] text-neutral-400 rounded px-2 py-1 focus:outline-none focus:border-green-500"
      >
        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
      </select>

      {editing && (
        <EditTaskModal task={task} members={members} onClose={() => setEditing(false)} onUpdate={(t) => { onUpdate(t); setEditing(false) }} />
      )}
    </div>
  )
}

function EditTaskModal({ task, members, onClose, onUpdate }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate || '',
    assigneeId: task.assignee?.id || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await tasksApi.update(task.id, {
        ...form,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      })
      onUpdate(data)
      toast.success('Task updated')
    } catch { toast.error('Failed to update task') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Edit Task</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
          <textarea className="input resize-none" rows={2} value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <select className="input" value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
            <option value="">Unassigned</option>
            {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
          </select>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateTaskModal({ projectId, members, onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await tasksApi.create(projectId, {
        ...form,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      })
      onCreate(data)
      toast.success('Task created!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">New Task</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" placeholder="Task title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input resize-none" rows={2} placeholder="Description (optional)"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <select className="input" value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
            <option value="">Unassigned</option>
            {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
          </select>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddMemberModal({ projectId, onClose, onAdd }) {
  const [form, setForm] = useState({ email: '', role: 'MEMBER' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await projectsApi.addMember(projectId, form)
      onAdd(data)
      toast.success('Member added!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Add Member</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" className="input" placeholder="Email address" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('board')
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)

  useEffect(() => {
    Promise.all([
      projectsApi.get(id),
      tasksApi.getByProject(id),
      projectsApi.getMembers(id),
    ]).then(([p, t, m]) => {
      setProject(p.data)
      setTasks(t.data)
      setMembers(m.data)
    }).catch(() => navigate('/projects'))
     .finally(() => setLoading(false))
  }, [id])

  const isAdmin = project?.myRole === 'ADMIN'

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await tasksApi.delete(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      toast.success('Task deleted')
    } catch { toast.error('Failed') }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await projectsApi.removeMember(id, userId)
      setMembers(prev => prev.filter(m => m.user.id !== userId))
      toast.success('Member removed')
    } catch { toast.error('Failed') }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-green-500" size={32} />
    </div>
  )

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] px-8 py-5">
        <button onClick={() => navigate('/projects')} className="text-neutral-500 hover:text-white text-sm flex items-center gap-1 mb-3 transition-colors">
          <ChevronLeft size={16} /> Projects
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
            {project?.description && <p className="text-neutral-500 text-sm mt-0.5">{project.description}</p>}
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <button onClick={() => setShowAddMember(true)} className="btn-ghost text-sm">
                <UserPlus size={16} /> Add Member
              </button>
            )}
            <button onClick={() => setShowCreateTask(true)} className="btn-primary text-sm">
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5">
          {['board', 'members'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              {tab === 'members' ? <span className="flex items-center gap-1.5"><Users size={14} />{tab} ({members.length})</span> : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      {activeTab === 'board' && (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {STATUSES.map(status => (
              <div key={status} className="w-72 shrink-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`badge-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>
                    <span className="text-xs text-neutral-600 font-mono">{tasksByStatus[status].length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {tasksByStatus[status].map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      isAdmin={isAdmin}
                      onUpdate={(updated) => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                  {tasksByStatus[status].length === 0 && (
                    <div className="h-20 border border-dashed border-[#2a2a2a] rounded-lg flex items-center justify-center">
                      <span className="text-xs text-neutral-700">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      {activeTab === 'members' && (
        <div className="p-8 max-w-2xl">
          <div className="space-y-2">
            {members.map(member => (
              <div key={member.id} className="card px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold">
                    {member.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{member.user.name}</p>
                    <p className="text-xs text-neutral-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    member.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-neutral-800 text-neutral-400'
                  }`}>{member.role}</span>
                  {isAdmin && member.user.id !== user?.id && (
                    <button onClick={() => handleRemoveMember(member.user.id)} className="text-neutral-600 hover:text-red-400 transition-colors">
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreateTask && (
        <CreateTaskModal
          projectId={id}
          members={members}
          onClose={() => setShowCreateTask(false)}
          onCreate={(t) => setTasks(prev => [t, ...prev])}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowAddMember(false)}
          onAdd={(m) => setMembers(prev => [...prev, m])}
        />
      )}
    </div>
  )
}
