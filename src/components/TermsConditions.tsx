export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12">

          {/* Header */}
          <div className="mb-10 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HT</span>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Habit Tracker
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Terms & Conditions
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated:{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                January 1, 2025
              </span>
            </p>
          </div>

          {/* Intro */}
          <div className="mb-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              Please read these Terms & Conditions carefully before using Habit Tracker.
              By using the app, you agree to these terms.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">

            {/* 1 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                Acceptance of Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                By using Habit Tracker, you agree to these Terms & Conditions.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Use of the App
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You may use the app for personal productivity purposes.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                User Responsibilities
              </h2>
              <ul className="space-y-2">
                <li className="text-gray-600 dark:text-gray-400">Provide accurate information</li>
                <li className="text-gray-600 dark:text-gray-400">Keep account secure</li>
                <li className="text-gray-600 dark:text-gray-400">Use app legally</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                  4
                </span>
                Intellectual Property
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                All content belongs to Habit Tracker.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                  5
                </span>
                Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We are not liable for damages from using the app.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                  6
                </span>
                Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Terms may change over time.
              </p>
            </section>

            {/* FIXED CONTACT SECTION */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Questions about our Terms?{' '}
                <a
                  href="mailto:legal@habittracker.app"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  Contact us
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}