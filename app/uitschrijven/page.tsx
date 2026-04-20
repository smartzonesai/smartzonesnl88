import type { Metadata } from 'next';
import UnsubscribePage from '@/components/UnsubscribePage';

export const metadata: Metadata = { title: 'Afmelden — Smart Zones' };

export default function Uitschrijven() {
  return <UnsubscribePage />;
}
