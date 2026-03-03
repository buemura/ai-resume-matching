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
      ? "text-indigo-600 font-medium"
      : "text-gray-600 hover:text-gray-900";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold text-gray-900">
            Resume Matching
          </Link>
          <Link to="/jobs" className={navClass("/jobs")}>
            Jobs
          </Link>
          <Link to="/resumes" className={navClass("/resumes")}>
            Resumes
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
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
