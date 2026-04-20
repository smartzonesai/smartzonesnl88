export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Smart Zones',
    applicationCategory: 'BusinessApplication',
    url: 'https://smartzones.nl',
    description:
      'Smart Zones is een AI-gestuurd platform waarmee winkeliers via een video-upload hun winkelindeling, productplaatsing en klantenstroom kunnen optimaliseren. Ontvang binnen 1 uur een compleet verbeterplan.',
    email: 'info@smartzones.nl',
    offers: {
      '@type': 'Offer',
      price: '199',
      priceCurrency: 'EUR',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
