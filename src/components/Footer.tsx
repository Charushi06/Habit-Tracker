import { Heart, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Brand Section */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HT</span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Habit Tracker</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Build better habits, track your progress, and achieve your goals one day at a time.
            </p>
          </div>

          {/* Empty column for spacing */}
          <div className="flex-1 hidden md:block"></div>

          {/* Quick Links */}
          <div className="space-y-3 flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/Charushi06/Habit-Tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:font-semibold transition-all duration-200 ease-in-out transform hover:translate-x-1"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Charushi06/Habit-Tracker/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:font-semibold transition-all duration-200 ease-in-out transform hover:translate-x-1"
                >
                  Report an Issue
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Charushi06/Habit-Tracker/blob/master/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:font-semibold transition-all duration-200 ease-in-out transform hover:translate-x-1"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3 flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:font-semibold transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:font-semibold transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Charushi06"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:font-semibold transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div className="space-y-3 flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://github.com/Charushi06/Habit-Tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-transform duration-200 ease-in-out transform hover:scale-110 hover:-translate-y-1"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-transform duration-200 ease-in-out transform hover:scale-110 hover:-translate-y-1"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </a>
              <a
                href="mailto:support@habittracker.com"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-transform duration-200 ease-in-out transform hover:scale-110 hover:-translate-y-1"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Habit Tracker. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> by the open-source community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}