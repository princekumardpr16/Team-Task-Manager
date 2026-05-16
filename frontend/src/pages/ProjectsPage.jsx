import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderKanban, Users, CheckSquare, Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { projectsApi } from '../api/services'
import useAuthStore from '../store/authStore'

function ProjectCard({ project, onDelete }) {
  const { user } = useAuthStore()
  const isOwner = project.owner?.id === user?.id

  return (
    <div className="card p-6 hover:border-neutral-700 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <FolderKanban size={20} className="text-green-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${
            project.myRole === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-neutral-800 text-neutral-400'
          }`}>{project.myRole}</span>
          {isOwner && (
            <button
              onClick={(e) => { e.preventDefault(); onDelete(project.id) }}
              className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
      <Link to={`/projects/${project.id}`}>
        <h3 className="font-semibold text-white hover:text-green-400 transition-colors mb-1">{project.name}</h3>
        <p className="text-sm text-neutral-500 line-clamp-2 mb-4">{project.description || 'No description'}</p>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1"><Users size={13} />{project.memberCount} members</span>
          <span className="flex items-center gap-1"><CheckSquare size={13} />{project.taskCount} tasks</span>
        </div>
      </Link>
    </div>
  )
}

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await projectsApi.create(form)
      onCreate(data)
      toast.success('Project created!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-white mb-5">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider block mb-1.5">Name</label>
            <input className="input" placeholder="Project name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider block mb-1.5">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What's this project about?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    projectsApi.getAll()
      .then(r => setProjects(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    try {
      await projectsApi.delete(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete project')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-green-500" size={32} />
    </div>
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-neutral-500 mt-1">{projects.length} projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={18} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban size={48} className="text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-400 font-medium">No projects yet</p>
          <p className="text-neutral-600 text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={(p) => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  )
}
