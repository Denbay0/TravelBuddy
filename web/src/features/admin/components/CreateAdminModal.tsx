import { useState } from 'react'
import type { AccountStatus, AdminRole } from '../types'

type CreateAdminInput = {
  name: string
  email: string
  role: AdminRole
  status: AccountStatus
}

type CreateAdminModalProps = {
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onCreate: (payload: CreateAdminInput) => void
}

const initialForm: CreateAdminInput = {
  name: '',
  email: '',
  role: 'moderator',
  status: 'active',
}

export default function CreateAdminModal({ isOpen, isSubmitting = false, onClose, onCreate }: CreateAdminModalProps) {
  const [form, setForm] = useState<CreateAdminInput>(initialForm)

  if (!isOpen) {
    return null
  }

  const handleChange = (field: keyof CreateAdminInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      return
    }

    onCreate({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
    })
    setForm(initialForm)
  }

  return (
    <div className="fixed inset-0 z-[70] bg-ink/40 px-4 py-10 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto max-w-lg rounded-2xl border border-white/80 bg-[#faf7f2] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-ink">Create admin</h3>
        <p className="mt-1 text-sm text-ink/70">Add a new team member and grant initial access.</p>

        <div className="mt-4 grid gap-3">
          <input
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="Full name"
            className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
          />
          <input
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            placeholder="name@travelbuddy.dev"
            className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.role}
              onChange={(event) => handleChange('role', event.target.value)}
              className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
            >
              <option value="super_admin">Super admin</option>
              <option value="moderator">Moderator</option>
              <option value="support">Support</option>
            </select>
            <select
              value={form.status}
              onChange={(event) => handleChange('status', event.target.value)}
              className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm" disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg border border-amber/30 bg-amber/20 px-3 py-1.5 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create admin'}
          </button>
        </div>
      </div>
    </div>
  )
}
