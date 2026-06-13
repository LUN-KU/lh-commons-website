'use client'
import { useState } from 'react'
import PaymentInstructions from './PaymentInstructions'

const INTERESTS = ['讀書會', '一日遊', '桌遊', '派對', '運動', '專業講座', '興趣培養', '活動揪團', '包團出國']

type MemberType = 'regular' | 'senior'
type FormState = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error'

export default function JoinForm({ defaultType = 'regular' }: { defaultType?: MemberType }) {
  const [memberType, setMemberType] = useState<MemberType>(defaultType)
  const [formState, setFormState] = useState<FormState>('idle')

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('')
  const [birthday, setBirthday] = useState('')
  const [ig, setIg] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [otherInterest, setOtherInterest] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [note, setNote] = useState('')

  const toggleInterest = (item: string) => {
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  const allInterests = otherInterest.trim()
    ? [...interests, `其他：${otherInterest.trim()}`]
    : interests

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: memberType === 'senior' ? 'senior' : 'regular',
          name, nickname, gender, birthday, ig, email, phone,
          interests: allInterests,
          bankCode,
          note,
        }),
      })
      const data = await res.json()
      if (!res.ok) setFormState('error')
      else if (data.duplicate) setFormState('duplicate')
      else setFormState('success')
    } catch {
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-white rounded-3xl p-8 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-black text-brand-700">申請已送出！</h2>
        <p className="text-sm text-gray-500">
          感謝你加入領航里 ✨<br />
          里長審核後會通知你，請稍待 1-3 個工作天。
        </p>
      </div>
    )
  }

  if (formState === 'duplicate') {
    return (
      <div className="bg-white rounded-3xl p-8 text-center space-y-4">
        <div className="text-4xl">👋</div>
        <h2 className="text-lg font-black text-brand-700">此 Email 已申請過</h2>
        <p className="text-sm text-gray-500">如有問題請私訊 IG @l.h_commons</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 類型切換 */}
      <div className="flex rounded-2xl overflow-hidden border border-white/20">
        <button type="button"
          onClick={() => setMemberType('regular')}
          className={`flex-1 py-3 font-bold text-sm transition-colors ${memberType === 'regular' ? 'bg-white text-brand-700' : 'text-white/60 hover:text-white'}`}
        >
          一般里民
        </button>
        <button type="button"
          onClick={() => setMemberType('senior')}
          className={`flex-1 py-3 font-bold text-sm transition-colors ${memberType === 'senior' ? 'bg-white text-brand-700' : 'text-white/60 hover:text-white'}`}
        >
          ⭐ 資深里民
        </button>
      </div>

      {/* 說明 */}
      {memberType === 'senior' && (
        <div className="bg-amber-500/20 border border-amber-400/30 rounded-2xl p-4 text-sm text-amber-100 space-y-1">
          <p className="font-bold">資深里民四大福利 ✨</p>
          <p>• 里民專屬活動優惠價</p>
          <p>• 合作店家、老師專屬折扣</p>
          <p>• 私密線下聚會（非資深不得參加）</p>
          <p>• 不定期驚喜好禮</p>
          <p className="pt-1 font-semibold">費用：匯款 $588 至領航里（後5碼填於下方）</p>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 space-y-5">

        {/* 基本資料 */}
        <Field label="真實姓名" required>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required
            placeholder="請輸入真實姓名" className={inputCls} />
        </Field>

        <Field label="綽號" required>
          <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} required
            placeholder="你的綽號" className={inputCls} />
        </Field>

        <Field label="性別" required>
          <div className="flex gap-3">
            {['男', '女', '其他'].map(g => (
              <button key={g} type="button"
                onClick={() => setGender(g)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${gender === g ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-500 hover:border-brand-300'}`}
              >
                {g}
              </button>
            ))}
          </div>
          <input type="hidden" value={gender} required />
        </Field>

        {memberType === 'senior' && (
          <Field label="生日" required>
            <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} required
              className={inputCls} />
          </Field>
        )}

        <Field label="IG 帳號" hint="活動照標記用，如無請填「無」" required>
          <input type="text" value={ig} onChange={e => setIg(e.target.value)} required
            placeholder="@yourinstagram" className={inputCls} />
        </Field>

        <Field label="E-MAIL" required>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="your@email.com" className={inputCls} />
        </Field>

        <Field label="電話" required>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
            placeholder="09xxxxxxxx" className={inputCls} />
        </Field>

        {/* 感興趣活動 */}
        <Field label="你感興趣的活動？" hint="可複選，每月有相關活動時會提醒你" required>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(item => (
              <button key={item} type="button"
                onClick={() => toggleInterest(item)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${interests.includes(item) ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-500 hover:border-brand-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <input type="text" value={otherInterest} onChange={e => setOtherInterest(e.target.value)}
            placeholder="其他（選填）" className={`${inputCls} mt-2`} />
          <input type="hidden" value={allInterests.join(',')} required={allInterests.length === 0 ? true : undefined} />
        </Field>

        {/* 資深里民專屬 */}
        {memberType === 'senior' && (
          <PaymentInstructions theme="light" />
        )}
        {memberType === 'senior' && (
          <Field label="匯款後五碼" hint="匯款 $588 後填入帳號後5碼" required>
            <input type="text" value={bankCode} onChange={e => setBankCode(e.target.value)} required
              maxLength={5} placeholder="12345" className={inputCls} />
          </Field>
        )}

        <Field label={memberType === 'senior' ? '想對領航里說什麼' : '想對領航里說什麼（選填）'}
               required={memberType === 'senior'}>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            required={memberType === 'senior'}
            placeholder="歡迎趁亂告白或是許願活動 👍"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </Field>

        {formState === 'error' && (
          <p className="text-xs text-red-500 text-center">送出失敗，請稍後再試或私訊 IG</p>
        )}

        <button type="submit" disabled={formState === 'submitting' || allInterests.length === 0 || !gender}
          className="w-full bg-brand-600 text-white font-bold py-4 rounded-2xl hover:bg-brand-700 transition-colors disabled:opacity-50 text-base"
        >
          {formState === 'submitting' ? '送出中...' : memberType === 'senior' ? '申請成為資深里民' : '申請成為一般里民'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          ⚠️ 所有資料均依個資法保護，僅供活動聯絡使用
        </p>
      </div>
    </form>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:border-brand-400 placeholder:text-gray-300'

function Field({ label, hint, required, children }: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  )
}
