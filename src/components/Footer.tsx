export default function Footer() {
  return (
    <footer className="bg-white border-t border-blue-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-semibold text-blue-900">VocabMaster</span>
          </div>
          <p className="text-sm text-gray-500">
            Học từ vựng thông minh với spaced repetition
          </p>
        </div>
      </div>
    </footer>
  );
}
