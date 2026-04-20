import type { Metadata } from 'next';
import AnalysisView from '@/components/dashboard/AnalysisView';

export const metadata: Metadata = { title: 'Analyse Resultaten' };

export default function AnalysisPage() {
  return <AnalysisView />;
}
