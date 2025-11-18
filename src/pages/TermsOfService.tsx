import {
  ArrowLeft,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  Lock,
  Edit,
  XCircle,
  DollarSign,
  Scale,
  Globe,
  Mail,
} from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Terms of Service
            </h1>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using our service. By using
            Habit Tracker, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 lg:p-12 space-y-12">
            {/* Section 1 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">
                          Agreement Required
                        </p>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                          By using Habit Tracker, you agree to be bound by these
                          terms. If you do not agree, please discontinue use.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p>
                    By accessing and using Habit Tracker, you accept and agree
                    to be bound by the terms and provision of this agreement. If
                    you do not agree to abide by the above, please do not use
                    this service.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. Use License
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Permission is granted to temporarily use Habit Tracker for
                    personal, non-commercial transitory viewing only. This is
                    the grant of a license, not a transfer of title, and under
                    this license you may not:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Modify or copy the materials</li>
                    <li>
                      Use the materials for any commercial purpose or public
                      display
                    </li>
                    <li>Attempt to decompile or reverse engineer any software</li>
                    <li>
                      Remove any copyright or proprietary notations from the
                      materials
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. Disclaimer
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    The materials on Habit Tracker are provided on an 'as is'
                    basis. We make no warranties, expressed or implied, and
                    hereby disclaim and negate all other warranties including,
                    without limitation, implied warranties or conditions of
                    merchantability, fitness for a particular purpose, or
                    non-infringement of intellectual property or other violation
                    of rights.
                  </p>
                  <p>
                    Further, we do not warrant or make any representations
                    concerning the accuracy, likely results, or reliability of
                    the use of the materials or otherwise relating to such
                    materials or on any sites linked to this site.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  4. Limitations
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  In no event shall Habit Tracker or its suppliers be liable for
                  any damages (including, without limitation, damages for loss
                  of data or profit, or due to business interruption) arising
                  out of the use or inability to use the materials on Habit
                  Tracker, even if we or an authorized representative has been
                  notified orally or in writing of the possibility of such
                  damage.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  5. Privacy Policy
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Your use of Habit Tracker is also governed by our Privacy
                  Policy. Please review our Privacy Policy, which also governs
                  the site and informs users of our data collection practices.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Revisions and Errata
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  The materials appearing on Habit Tracker could include
                  technical, typographical, or photographic errors. We do not
                  warrant that any of the materials on its website are accurate,
                  complete or current. We may make changes to the materials
                  contained on its website at any time without notice.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Links
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We have not reviewed all of the sites linked to its website
                  and are not responsible for the contents of any such linked
                  site. The inclusion of any link does not imply endorsement by
                  us of the site. Use of any such linked website is at the
                  user's own risk.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Scale className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  8. Governing Law
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  These terms and conditions are governed by and construed in
                  accordance with the applicable laws, and you irrevocably
                  submit to the exclusive jurisdiction of the courts in that
                  location.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. User Conduct
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  You agree to use Habit Tracker only for lawful purposes and in
                  a way that does not infringe the rights of others or restrict
                  or inhibit anyone else's use and enjoyment of the service.
                  Prohibited behavior includes harassing or causing distress,
                  transmitting offensive content, or disrupting normal dialogue
                  flow.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-lime-100 dark:bg-lime-900/30 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-lime-600 dark:text-lime-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  10. Termination
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We may terminate or suspend your access to our service
                  immediately, without prior notice or liability, for any reason
                  whatsoever, including without limitation if you breach the
                  Terms. All provisions which by their nature should survive
                  termination shall survive.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  11. Service Modifications
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We reserve the right to modify or discontinue, temporarily or
                  permanently, the service (or any part thereof) with or without
                  notice. You agree that we shall not be liable to you or any
                  third party for any modification, suspension or
                  discontinuance.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  12. Contact Information
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  If you have any questions about these Terms of Service, please
                  contact us at:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email: legal@habittracker.com</li>
                  <li>
                    GitHub:{" "}
                    <a
                      href="https://github.com/Charushi06/Habit-Tracker"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Charushi06/Habit-Tracker
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
