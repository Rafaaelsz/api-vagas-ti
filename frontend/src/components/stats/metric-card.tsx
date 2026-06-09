import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';

export function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return (
    <Card className="bg-card/95 backdrop-blur">
      <CardContent className="flex min-h-24 items-center gap-4 p-5">
        <div className="grid size-11 place-items-center rounded-md bg-primary/12 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
