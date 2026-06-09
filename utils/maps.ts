async function fetchDistanceMeters(origin: string, destination: string, apiKey: string): Promise<number | null> {
  const parseWaypoint = (address: string) => {
    const isLatLng = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(address.trim());
    if (isLatLng) {
      const [lat, lng] = address.split(',').map(Number);
      return { location: { latLng: { latitude: lat, longitude: lng } } };
    }
    return { address };
  };

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.distanceMeters",
    },
    body: JSON.stringify({
      origin: parseWaypoint(origin),
      destination: parseWaypoint(destination),
      travelMode: "DRIVE",
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data?.routes?.[0]?.distanceMeters ?? null;
}

export async function getDrivingDistance(origin: string, destination: string): Promise<number | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const meters = await fetchDistanceMeters(origin, destination, apiKey);
    return meters !== null ? meters / 1000 : null;
  } catch (error) {
    console.error("Google Routes API failure:", error);
    return null;
  }
}
