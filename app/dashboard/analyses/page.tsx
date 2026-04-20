import type { Metadata } from 'next';
import AnalysesList from '@/components/dashboard/AnalysesList';

export const metadata: Metadata = { title: 'Mijn Analyses' };

export default function AnalysesPage() {
  return <AnalysesList />;
}
