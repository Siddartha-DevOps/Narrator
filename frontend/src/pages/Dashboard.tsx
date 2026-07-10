import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { VideoPreview } from '../components/VideoPreview';
import { JobList } from '../components/JobList';
import { listVideoJobs, VideoJob } from '../api/videos';
import { getCreditBalance } from '../api/credits';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  const refreshJobs = useCallback(async () => {
    const data = await listVideoJobs();
    setJobs(data);
    setSelectedJobId((current) => current ?? data[0]?.id ?? null);
  }, []);

  useEffect(() => {
    refreshJobs();
    getCreditBalance().then(setCreditBalance).catch(() => setCreditBalance(null));
    const interval = setInterval(refreshJobs, 5000);
    return () => clearInterval(interval);
  }, [refreshJobs]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const processingCount = jobs.filter((j) => j.status === 'processing' || j.status === 'queued').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.fullName ? `, ${user.fullName}` : ''}</h1>
            <p className="text-gray-500">Here's what's happening with your videos.</p>
          </div>
          <Link to="/editor" className="btn-primary">
            + New video
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card">
            <p className="text-sm text-gray-500">Credit balance</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{creditBalance ?? '—'}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Videos completed</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{completedCount}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">In progress</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{processingCount}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Your videos</h2>
            <JobList jobs={jobs} selectedJobId={selectedJobId} onSelect={(j) => setSelectedJobId(j.id)} />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Preview</h2>
            <VideoPreview job={selectedJob} />
          </div>
        </div>
      </main>
    </div>
  );
}
