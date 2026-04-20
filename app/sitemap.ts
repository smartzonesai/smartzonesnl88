export default function sitemap() {
  return [
    { url: 'https://smartzones.nl', lastModified: new Date(), priority: 1 },
    { url: 'https://smartzones.nl/privacy', lastModified: new Date(), priority: 0.3 },
    { url: 'https://smartzones.nl/cookies', lastModified: new Date(), priority: 0.3 },
  ];
}
