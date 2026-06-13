import JoinForm from '@/components/JoinForm'

export default function JoinPage({ searchParams }: { searchParams: { type?: string } }) {
  const defaultType = searchParams.type === 'senior' ? 'senior' : 'regular'
  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">加入領航里</h1>
        <p className="text-white/50">填寫資料，成為里民大家庭的一員</p>
      </div>
      <JoinForm defaultType={defaultType} />
    </div>
  )
}
