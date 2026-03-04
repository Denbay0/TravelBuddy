import type { ReactNode } from 'react'
import AdminHeader from '../../features/admin/components/AdminHeader'

type AdminPageTemplateProps = {
  title: string
  description: string
  action?: ReactNode
  children?: ReactNode
}

export default function AdminPageTemplate({ title, description, action, children }: AdminPageTemplateProps) {
  return (
    <section className="rounded-2xl bg-sand/30 p-3 sm:p-4">
      <AdminHeader title={title} subtitle={description} action={action} />
      {children ? <div>{children}</div> : null}
    </section>
  )
}
