type Props = {
  theme?: 'light' | 'dark'
}

export default function PaymentInstructions({ theme = 'light' }: Props) {
  const bankName = process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME ?? '——'
  const bankAccount = process.env.NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT ?? '——'

  if (theme === 'dark') {
    return (
      <div className="bg-white/10 border border-white/20 rounded-2xl p-4 space-y-2 text-sm">
        <p className="text-white/50 text-xs font-semibold tracking-wide uppercase">匯款資訊</p>
        <div className="flex justify-between items-center text-white">
          <span className="text-white/60">銀行</span>
          <span className="font-bold">{bankName}</span>
        </div>
        <div className="flex justify-between items-center text-white">
          <span className="text-white/60">帳號</span>
          <span className="font-bold tracking-wide">{bankAccount}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 space-y-2 text-sm">
      <p className="text-brand-400 text-xs font-semibold tracking-wide">匯款資訊</p>
      <div className="flex justify-between items-center">
        <span className="text-gray-500">銀行</span>
        <span className="font-bold text-brand-700">{bankName}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-500">帳號</span>
        <span className="font-bold text-brand-700 tracking-wide">{bankAccount}</span>
      </div>
      <p className="text-xs text-gray-400 pt-1">匯款時請備註你的姓名</p>
    </div>
  )
}
