export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-warm-800 mb-2">關於領航里</h1>
      <p className="text-warm-400 mb-10">深度交流 × 有效社交 × 打造理想生活圈</p>

      <div className="prose prose-warm max-w-none space-y-6 text-warm-700 leading-relaxed">
        <p className="text-lg">
          領航里是一個以「真實連結」為核心的溫暖社群。我們相信，每個人都值得擁有一群志同道合的朋友，在這裡可以放鬆做自己，可以深度交流，也可以一起冒險探索。
        </p>

        <div className="bg-warm-100 rounded-2xl p-6 my-8">
          <h2 className="text-xl font-bold text-warm-800 mb-4">我們的數字</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-warm-600">700+</p>
              <p className="text-sm text-warm-500 mt-1">里民人數</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-warm-600">10-15</p>
              <p className="text-sm text-warm-500 mt-1">每月活動場數</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-warm-600">∞</p>
              <p className="text-sm text-warm-500 mt-1">可能的連結</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-warm-800">我們舉辦的活動類型</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['主題式交流', '密室逃脫', '讀書會', '一日遊', '運動揪團', '手作體驗', '桌遊', '派對', '專業講座'].map(tag => (
            <div key={tag} className="bg-white border border-warm-200 rounded-full px-4 py-2 text-sm text-warm-600 text-center">
              {tag}
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-warm-800 mt-8">加入我們</h2>
        <p>
          想成為領航里的一分子？歡迎追蹤我們的 Instagram，或直接私訊詢問加入方式。我們等你來！
        </p>

        <a
          href="https://www.instagram.com/l.h_commons"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-warm-600 text-white font-bold px-8 py-3 rounded-full hover:bg-warm-700 transition-colors mt-2"
        >
          前往 Instagram @l.h_commons
        </a>
      </div>
    </div>
  )
}
