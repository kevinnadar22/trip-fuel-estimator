const response = await fetch(
  "https://routes.googleapis.com/directions/v2:computeRoutes",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": "AIzaSyBzYBolpbV0ZUCQqhh4KTENk3l984l5dsE",
      "X-Goog-FieldMask":
        "routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify({
      origin: {
        address: "87, Grand Southern Trunk Rd, RV Garden, Tambaram, Chennai, Tamil Nadu 600043, India"
      },
      destination: {
        address: "Sakthi Nagar, Chennai, Tamil Nadu 600117, India"
      },
      travelMode: "DRIVE"
    })
  }
);

const data = await response.json();

console.log("HTTP Status:", response.status);
console.log("API Response:", JSON.stringify(data, null, 2));
console.log(data)
if (data && data.routes && data.routes[0]) {
  console.log("Distance (km):", data.routes[0].distanceMeters / 1000);
} else {
  console.log("No routes found or error occurred.");
}