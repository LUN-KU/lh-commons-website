import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getMemberPointsByEmail } from '@/lib/members'
import PointsCard from '@/components/PointsCard'

export const dynamic = 'force-dynamic'

export default async function MemberPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return (
      <main className="max-w-lg mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-black text-white mb-3">我的點數</h1>
        <p className="text-white/60 text-sm">
          請先從右上角「里民登入」，登入後即可查看點數與輸入活動密碼集點。
        </p>
      </main>
    )
  }

  const points = await getMemberPointsByEmail(session.user.email)

  return (
    <main className="max-w-lg mx-auto px-6 py-12">
      <PointsCard
        name={session.user.name ?? '里民'}
        balance={points?.balance ?? 0}
        total={points?.total ?? 0}
      />
    </main>
  )
}
