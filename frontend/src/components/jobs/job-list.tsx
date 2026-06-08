import type { Job } from '@/types/api';
import { EmptyState } from '../shared/empty-state';
import { JobCard } from './job-card';

export function JobList({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) {
    return <EmptyState clearHref="/vagas" />;
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
