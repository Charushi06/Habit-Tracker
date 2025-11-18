import { ArrowLeft, Shield, Eye, Lock, Users, Server, Database, Cookie, Bell, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Habit Tracker</span>
          </button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 lg:p-12 space-y-12">

            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  1. Information We Collect
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    We collect information you provide directly to us, such as when you create an account,
                    use our services, or contact us for support.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <ul className="space-y-3">
                      {[
                        { label: 'Account Information', value: 'Email address, username, and profile information' },
                        { label: 'Habit Data', value: 'Your habits, completion records, and progress tracking' },
                        { label: 'Usage Data', value: 'How you interact with our application' },
                        { label: 'Device Information', value: 'Browser type, operating system, and device identifiers' },
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <strong className="text-gray-900 dark:text-white">{item.label}:</strong>
                            <span className="text-gray-600 dark:text-gray-400 ml-1">{item.value}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>We use the information we collect to:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { title: 'Service Delivery', text: 'Provide, maintain, and improve our services' },
                      { title: 'Data Processing', text: 'Process and track your habit data' },
                      { title: 'Communication', text: 'Send you important updates and notifications' },
                      { title: 'Support', text: 'Respond to your comments, questions, and requests' },
                      { title: 'Analytics', text: 'Analyze usage patterns to improve user experience' },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 ${item.title === 'Analytics' ? 'md:col-span-2' : ''}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. Information Sharing
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-200">Important:</p>
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          We do not sell, trade, or otherwise transfer your personal information to third parties
                          without your consent, except as described in this policy.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p>We may share your information in the following circumstances:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>With service providers who assist in operating our platform</li>
                    <li>When required by law or to protect rights and safety</li>
                    <li>In connection with a merger, sale, or acquisition</li>
                    <li>With your explicit consent</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  4. Data Security
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our security measures include:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Encryption of data in transit and at rest',
                      'Regular security audits and updates',
                      'Access controls and authentication',
                      'Secure data storage practices',
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  5. Data Retention
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.
                  </p>
                  <p>
                    When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.
                  </p>
                </div>
              </div>
            </section>

            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Your Rights
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>You have the following rights regarding your personal information:</p>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <ul className="space-y-3">
                      {[
                        { title: 'Access', desc: 'Request a copy of your personal data' },
                        { title: 'Correction', desc: 'Update or correct inaccurate information' },
                        { title: 'Deletion', desc: 'Request deletion of your personal data' },
                        { title: 'Portability', desc: 'Receive your data in a portable format' },
                        { title: 'Opt-out', desc: 'Opt out of certain data processing activities' },
                        { title: 'Withdraw Consent', desc: 'Withdraw consent for data processing' },
                      ].map((right, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <strong className="text-gray-900 dark:text-white">{right.title}:</strong>
                            <span className="text-gray-600 dark:text-gray-400 ml-1">{right.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    To exercise any of these rights, please contact us at privacy@habittracker.com.
                  </p>
                </div>
              </div>
            </section>

            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Cookies and Tracking Technologies
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist in our marketing efforts. Types of cookies we use:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { type: 'Essential Cookies', desc: 'Required for basic site functionality' },
                      { type: 'Analytics Cookies', desc: 'Help us understand how you use our service' },
                      { type: 'Preference Cookies', desc: 'Remember your settings and choices' },
                      { type: 'Marketing Cookies', desc: 'Used to deliver relevant advertisements' },
                    ].map((cookie, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="font-medium text-gray-900 dark:text-white">{cookie.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{cookie.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p>
                    You can control cookie settings through your browser preferences. Note that disabling cookies may affect the functionality of our service.
                  </p>
                </div>
              </div>
            </section>

            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  8. Changes to This Policy
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">Stay Informed</p>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                          We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. Contact Us
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please do not hesitate to contact us:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <a href="mailto:privacy@habittracker.com" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            privacy@habittracker.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">GitHub Repository</p>
                          <a
                            href="https://github.com/Charushi06/Habit-Tracker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Charushi06/Habit-Tracker
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
