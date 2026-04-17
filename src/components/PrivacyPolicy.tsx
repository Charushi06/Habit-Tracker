export default function PrivacyPolicy() {
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
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Habit Tracker</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: <span className="font-medium text-gray-700 dark:text-gray-300">January 1, 2025</span>
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">1</span>
                Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Welcome to Habit Tracker. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application. Please read this policy carefully. If you disagree with its terms, please discontinue use of the app.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">2</span>
                Information We Collect
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We collect information that you provide directly to us when you use Habit Tracker, including:
              </p>
              <ul className="space-y-2">
                {[
                  'Account information such as your name and email address',
                  'Habit data including names, descriptions, schedules, and completion records',
                  'Usage data such as features used and interaction patterns',
                  'Device information including browser type, operating system, and timezone',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">3</span>
                How We Use Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We use the information we collect to operate and improve Habit Tracker, including to:
              </p>
              <ul className="space-y-2">
                {[
                  'Provide, maintain, and improve our services',
                  'Personalize your experience and deliver relevant features',
                  'Send you reminders and notifications you have opted into',
                  'Respond to your comments, questions, and support requests',
                  'Monitor and analyze usage trends to improve the app',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">4</span>
                Data Security
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted in transit using TLS and at rest using AES-256 encryption. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">5</span>
                Third-Party Services
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Habit Tracker may use third-party services such as authentication providers and analytics platforms. These services have access to your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose. We encourage you to review the privacy policies of any third-party services we use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">6</span>
                User Rights
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="space-y-2">
                {[
                  'The right to access the personal data we hold about you',
                  'The right to request correction of inaccurate data',
                  'The right to request deletion of your personal data',
                  'The right to withdraw consent at any time',
                  'The right to data portability',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">7</span>
                Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Email:</span>{' '}
                  <a href="mailto:privacy@habittracker.app" className="text-blue-600 dark:text-blue-400 hover:underline">
                    privacy@habittracker.app
                  </a>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Website:</span>{' '}
                  <a href="https://habittracker.app" className="text-blue-600 dark:text-blue-400 hover:underline">
                    habittracker.app
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}