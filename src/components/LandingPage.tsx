type LandingPageProps = {
  onGetStarted: () => void;
};

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Track Habits",
    description: "Add and manage your daily habits with a clean, intuitive interface designed for focus.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Stay Consistent",
    description: "Build momentum with daily streaks and visual cues that keep your routine on track.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "See Progress",
    description: "Visualize your growth over time and celebrate the small wins that add up to big change.",
  },
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* ── Navbar ── */}
      <header className="w-full border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </span>
            <span className="font-semibold text-base tracking-tight">HabitTracker</span>
          </div>
          <button
            onClick={onGetStarted}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 px-4 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 mb-8 tracking-wide uppercase">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Free to get started
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1] max-w-3xl">
          Build habits that{" "}
          <span className="text-blue-600 dark:text-blue-400">actually stick</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
          Track your daily habits, stay consistent, and watch your progress grow — one day at a time.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 dark:shadow-blue-950 transition-all duration-150"
          >
            Get Started — it's free
          </button>
          <p className="text-sm text-gray-400 dark:text-gray-500">No account required</p>
        
        </div>

        {/* Social proof */}
        <div className="mt-10 flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <div className="flex -space-x-2">
            {["bg-violet-400", "bg-sky-400", "bg-emerald-400"].map((color, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full ${color} border-2 border-white dark:border-gray-950`}
              />
            ))}
          </div>
          <span><span>Start building better habits today</span></span>
        </div>
      </main>

      {/* ── Features ── */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything you need to stay on track
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-lg mx-auto">
              Simple tools designed to help you build lasting routines without the overwhelm.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map(({ icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-base">{title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 py-16 text-center bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to build better habits?
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Start today. No setup, no friction.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-8 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 dark:shadow-blue-950 transition-all duration-150"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400 dark:text-gray-500">
          <span>© {new Date().getFullYear()} HabitTracker. All rights reserved.</span>
          <span>Built with React + Tailwind CSS</span>
        </div>
      </footer>

    </div>
  );
}