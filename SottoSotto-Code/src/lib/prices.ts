/** "£12.95", "£12.00". Prices in the data are pounds with at most 2 decimals. */
export function formatPrice(pounds: number): string {
  return `£${pounds.toFixed(2)}`;
}

/** Google Maps directions link; documented URL scheme, no API key (D42). */
export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
