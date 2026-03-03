import { Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import JobsList from "./pages/JobsList";
import JobDetail from "./pages/JobDetail";
import AddJob from "./pages/AddJob";
import ResumesList from "./pages/ResumesList";
import ResumeDetail from "./pages/ResumeDetail";
import AddResume from "./pages/AddResume";

function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  function navClass(path: string) {
    const active = pathname === path || pathname.startsWith(path + "/");
    return active
      ? "neon-text font-semibold"
      : "text-base-200 hover:text-base-50 transition-colors duration-200";
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-base-600/50 bg-base-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-neon/10 border border-neon/20 group-hover:border-neon/40 transition-all duration-300">
              <svg
                className="h-4 w-4 text-neon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-base-50">
              ResumeMatch
              <span className="text-neon">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-6 ml-auto font-body text-sm tracking-wide">
            <Link to="/jobs" className={navClass("/jobs")}>
              Jobs
            </Link>
            <Link to="/resumes" className={navClass("/resumes")}>
              Resumes
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/new" element={<AddJob />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/resumes" element={<ResumesList />} />
        <Route path="/resumes/new" element={<AddResume />} />
        <Route path="/resumes/:id" element={<ResumeDetail />} />
      </Routes>
    </Layout>
  );
}
