import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminLogin from './AdminLogin'

export default function AdminPage() {
  const token = cookies().get('lh_admin')?.value
  if (token && token === process.env.ADMIN_SECRET) {
    redirect('/admin/dashboard')
  }
  return <AdminLogin />
}
