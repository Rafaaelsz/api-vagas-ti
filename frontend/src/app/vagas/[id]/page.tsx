import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JobDetails } from '@/components/jobs/job-details';
import { ErrorState } from '@/components/shared/error-state';
import { getJobById } from '@/services/jobs-service';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const job = await getJobById(id);
    return {
      title: job.title,
      description: `Detalhes da vaga ${job.title} em ${job.company?.name ?? 'empresa de tecnologia'}.`,
    };
  } catch {
    return {
      title: 'Vaga não encontrada',
    };
  }
}

export default async function JobDetailsPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const job = await getJobById(id);
    if (!job) notFound();

    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <JobDetails job={job} />
      </section>
    );
  } catch (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState title="Não foi possível carregar a vaga." message={error instanceof Error ? error.message : undefined} />
      </section>
    );
  }
}
