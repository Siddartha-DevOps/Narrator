import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { TextInputForm } from '../components/TextInputForm';
import { VideoPreview } from '../components/VideoPreview';
import { JobList } from '../components/JobList';
import { listVideoJobs, VideoJob } from '../api/videos';

export function Dashboard() {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const refreshJobs = useCallback(async () => {
    const data = await listVideoJobs();
    setJobs(data);
    if (!selectedJobId && data.length > 0) {
      setSelectedJobId(data[0].id);
    }
  }, [selectedJobId]);

  useEffect(() => {
    refreshJobs();
    // Poll for status updates while any job is still rendering.
    const interval = setInterval(refreshJobs, 5000);
    return () => clearInterval(interval);
  }, [refreshJobs]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;

  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-main">
        <section className="dashboard-column">
          <TextInputForm onJobCreated={refreshJobs} />
          <h3>Your videos</h3>
          <JobList jobs={jobs} selectedJobId={selectedJobId} onSelect={(j) => setSelectedJobId(j.id)} />
        </section>
        <section className="dashboard-column">
          <VideoPreview job={selectedJob} />
        </section>
      </main>
    </div>
  );
}
