import type { Metadata } from 'next';
import UploadPage from '@/components/dashboard/UploadPage';

export const metadata: Metadata = { title: 'Nieuwe Analyse' };

export default function Upload() {
  return <UploadPage />;
}
