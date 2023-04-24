// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoibmVsc2RhbmllbHNvbiIsImEiOiJjbGd1OG51YWIyM2lxM2RwOWRhOG1kYzM1In0._jwqytLACO-3fKkTlrfzVg";

// Initialize the map
const map = new mapboxgl.Map({
  container: "map", // The container ID
  style: "mapbox://styles/mapbox/streets-v11", // The map style
  center: [-96, 37.8], // Initial map center [longitude, latitude]
  zoom: 4 // Initial zoom level
});

function getColorByYear(year) {
  switch (year) {
    case 2021:
      return "#4287f5";
    case 2022:
      return "#f54242";
    case 2023:
      return "#00D100";
    default:
      return "#555";
  }
}

async function addTravelDataToMap(map, travelData, routes) {
  const allRoutes = [];

  // Iterate through the travel data
  for (let i = 0; i < travelData.length; i++) {
    const destination = travelData[i];

    // Choose the marker symbol based on the stay duration
    const markerSymbol =
      destination.stayDuration === "short" ? "circle" : "square";

    // Create a new HTML element for the marker
    const markerElement = document.createElement("div");
    markerElement.className = `marker ${markerSymbol}`;

    // Add the point number as text inside the marker element
    markerElement.innerText = i + 1;
    markerElement.style.setProperty(
      "--color",
      getColorByYear(destination.year)
    );
    markerElement.style.setProperty(
      "--outlineColor",
      destination.past ? "#000" : "#fff"
    );

    // Create a new Mapbox GL JS marker and add it to the map
    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat(destination.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25, closeButton: false }).setText(
          destination.location
        )
      )
      .addTo(map);

    markerElement.addEventListener("mouseenter", () => marker.togglePopup());
    markerElement.addEventListener("mouseleave", () => marker.togglePopup());

    // Add a line between the current destination and the previous one
    if (i > 0) {
      const previousDestination = travelData[i - 1];

      const route =
        routes[i - 1] ??
        (await getDrivingRoute(
          previousDestination.coordinates,
          destination.coordinates
        ));

      allRoutes.push(route);

      // Create a line between the current destination and the previous one
      map.addLayer({
        id: `route-${i}`,
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: route
            }
          }
        },
        paint: {
          "line-color": getColorByYear(destination.year),
          "line-width": 4,
          "line-dasharray": destination.past ? [] : [2, 1]
        }
      });
    }
  }

  console.log("Routes: ", JSON.stringify(allRoutes));
}

async function getDrivingRoute(origin, destination) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

  const response = await fetch(url);
  const data = await response.json();
  const route = data.routes[0].geometry.coordinates;

  console.log(`API route request from ${origin} to ${destination}`);
  return route;
}

function createLegend() {
  const legend = document.getElementById("legend");

  const years = [2023, 2022, 2021, 2020]; // Add more years as needed

  years.forEach((year) => {
    const item = document.createElement("div");
    item.className = "legend-item";

    const color = document.createElement("div");
    color.className = "legend-color";
    color.style.backgroundColor = getColorByYear(year);

    const label = document.createElement("span");
    label.innerText = year;

    item.appendChild(color);
    item.appendChild(label);
    legend.prepend(item);
  });
}

map.on("load", async () => {
  const travelData = await (await fetch("./travel-data.json")).json();
  const routes = await (await fetch("./routes.json")).json();

  createLegend();
  addTravelDataToMap(map, travelData, routes);
});
