import { enumLabel } from '@/lib/formatters';
import type { JobStatus } from '@/types/api';
import { Badge } from '../ui/badge';

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const tone = status === 'PUBLISHED' ? 'success' : status === 'CLOSED' || status === 'EXPIRED' ? 'muted' : 'blue';

  return <Badge tone={tone}>{enumLabel(status)}</Badge>;
}
