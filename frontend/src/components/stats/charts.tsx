'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { enumLabel } from '@/lib/formatters';
import type { StatsSummary } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const COLORS = ['#168c86', '#2f75d6', '#2fb66d', '#8aa23a', '#d09a2d', '#5d8bc4'];

function normalize<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.map((item) => ({
    name: enumLabel(String(item[key])),
    total: Number(item.total ?? 0),
  }));
}

export function StatsCharts({ summary }: { summary: StatsSummary }) {
  const workModeData = normalize(summary.jobsByWorkMode, 'workMode');
  const seniorityData = normalize(summary.jobsBySeniority, 'seniorityLevel');
  const technologyData = summary.topTechnologies.map((item) => ({
    name: item.technology?.name ?? 'Não informado',
    total: item.total,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Vagas por modalidade</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={workModeData} dataKey="total" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {workModeData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vagas por senioridade</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seniorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#2f75d6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tecnologias mais pedidas</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={technologyData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#168c86" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
