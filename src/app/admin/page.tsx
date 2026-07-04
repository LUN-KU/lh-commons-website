import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminLogin from './AdminLogin'
import { isAdminCookie } from '@/lib/adminAuth'

export default function AdminPage() {
  if (isAdminCookie(cookies().get('lh_admin')?.value)) {
    redirect('/admin/dashboard')
  }
  return <AdminLogin />
}
