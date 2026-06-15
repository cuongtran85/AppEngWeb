import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Học theo ngữ cảnh",
    description: "Mỗi từ đi kèm câu chuyện, hành động, cảm xúc và địa điểm giúp bạn ghi nhớ sâu hơn.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    title: "Lưu & xem lại",
    description: "Lưu từ yêu thích, tạo bộ sưu tập cá nhân và xem lại bất cứ lúc nào.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Spaced Repetition",
    description: "Hệ thống nhắc học tự động theo thuật toán giúp bạn không bao giờ quên từ đã học.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Thống kê tiến độ",
    description: "Theo dõi số từ đã học, streak học tập và biểu đồ tiến độ chi tiết.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200 rounded-full opacity-20 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Học từ vựng thông minh hơn mỗi ngày
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-blue-950 leading-tight mb-6">
              Ghi nhớ từ vựng
              <br />
              <span className="text-blue-600">không bao giờ quên</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              VocabMaster sử dụng phương pháp spaced repetition giúp bạn ghi nhớ từ vựng hiệu quả hơn 80% so với học truyền thống. Học theo ngữ cảnh, lưu từ yêu thích, theo dõi tiến độ.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 transition-all"
              >
                Bắt đầu học ngay
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-2xl font-semibold text-lg shadow-md hover:shadow-lg transition-all border border-blue-100"
              >
                Đăng nhập
              </Link>
            </div>
          </div>

          {/* Floating cards */}
          <div className="hidden lg:block absolute right-0 top-20 space-y-4">
            <div className="bg-white rounded-2xl shadow-card p-4 w-64 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-lg">✨</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Serendipity</p>
                  <p className="text-xs text-gray-500">noun · sự may mắn</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-4 w-64 animate-float" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📊</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">15 từ học hôm nay</p>
                  <p className="text-xs text-green-600">+3 streak 🔥</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-4 w-64 animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">🎯</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Đến hạn ôn tập</p>
                  <p className="text-xs text-orange-500">8 từ cần ôn hôm nay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-4">
              Tại sao chọn VocabMaster?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Công nghệ spaced repetition kết hợp học theo ngữ cảnh giúp bạn ghi nhớ từ vựng lâu hơn
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-card-hover hover:bg-white transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-4">Cách hoạt động</h2>
            <p className="text-gray-600 text-lg">Ba bước đơn giản để ghi nhớ mọi từ vựng</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Thêm từ mới", desc: "Nhập từ vựng kèm ngữ cảnh: câu chuyện, hành động, cảm xúc, địa điểm" },
              { step: "02", title: "Học & ôn tập", desc: "Hệ thống nhắc nhở tự động theo lịch spaced repetition phù hợp với bạn" },
              { step: "03", title: "Ghi nhớ lâu dài", desc: "Từ được ôn tập đúng lúc, đúng khoảng cách giúp nhớ mãi mãi" },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="text-7xl font-extrabold text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu hành trình học từ vựng?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Đăng ký miễn phí và bắt đầu học ngay hôm nay
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-50 transition-all"
          >
            Tạo tài khoản miễn phí
          </Link>
        </div>
      </section>
    </div>
  );
}
