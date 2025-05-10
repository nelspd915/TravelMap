// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoibmVsc2RhbmllbHNvbiIsImEiOiJjbG1yeWVwbHcwYTF6Mmtxa3gyM3A5ODVlIn0.e46YsOUg6wrY80FkhHATDw";

// Initialize the map
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-96, 37.8],
  zoom: 4
});

const markers = [];

function getColorByRouteNumber(routeNumber) {
  switch (routeNumber) {
    case 1:
      return "#555";
    case 2:
      return "#f54242";
    case 3:
      return "#4287f5";
    case 4:
      return "#00D100";
    case 5:
      return "#c14ede";
    case 6:
      return "#00dec8";
    case 7:
      return "#ff911c";
    default:
      return "#555";
  }
}

async function addTravelDataToMap(map, travelData, routes) {
  const allRoutes = [];
  let destNumber = 0;
  for (let i = 0; i < travelData.length; i++) {
    const destination = travelData[i];

    if (destination.location !== "ROUTE_PIN") {
      const markerSymbol = destination.stayDuration === "short" ? "circle" : "square";
      const markerElement = document.createElement("div");
      markerElement.className = `marker ${markerSymbol}`;
      markerElement.innerText = destNumber + 1;
      markerElement.style.setProperty("--color", getColorByRouteNumber(destination.route));
      markerElement.style.setProperty("--outlineColor", destination.past ? "#000" : "#fff");

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(destination.customMarkerCoords ?? destination.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
            `<h3 class="popup-text">${destination.location}</h3>
             <p class="popup-text">Arrive: ${destination.arrive}</p>
             <p class="popup-text">Depart: ${destination.depart}</p>`
          )
        )
        .addTo(map);

      markerElement.addEventListener("mouseenter", () => marker.togglePopup());
      markerElement.addEventListener("mouseleave", () => marker.togglePopup());

      markers.push({ marker, destination });
      destNumber += 1;
    }

    if (i > 0) {
      const previousDestination = travelData[i - 1];
      const route = routes[i - 1] ?? (await getDrivingRoute(previousDestination.coordinates, destination.coordinates));
      allRoutes.push(route);

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
          "line-color": getColorByRouteNumber(destination.route),
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
  const routeNumbers = [7, 6, 5, 4, 3, 2, 1];

  routeNumbers.forEach((routeNumber) => {
    const item = document.createElement("div");
    item.className = "legend-item";

    const color = document.createElement("div");
    color.className = "legend-color";
    color.style.backgroundColor = getColorByRouteNumber(routeNumber);

    const label = document.createElement("span");
    let yearRange = "";

    switch (routeNumber) {
      case 1:
        yearRange = "2020-21";
        break;
      case 2:
        yearRange = "2021-22";
        break;
      case 3:
        yearRange = "2022-23";
        break;
      case 4:
        yearRange = "2023-24";
        break;
      case 5:
        yearRange = "2024-25";
        break;
      case 6:
        yearRange = "2025";
        break;
      case 7:
        yearRange = "2025";
        break;
    }

    label.innerText = `Route ${routeNumber} (${yearRange})`;

    item.appendChild(color);
    item.appendChild(label);
    legend.prepend(item);
  });
}

function preprocessDuplicateCoordinates() {
  const coordMap = new Map();

  for (const { destination } of markers) {
    const key = destination.coordinates.join(",");
    if (!coordMap.has(key)) coordMap.set(key, []);
    coordMap.get(key).push(destination);
  }

  for (const destinations of coordMap.values()) {
    if (destinations.length > 1) {
      const center = destinations[0].coordinates;
      const radius = 0.0005;
      const angleStep = (2 * Math.PI) / destinations.length;

      destinations.forEach((destination, index) => {
        const angle = Math.PI - index * angleStep; // Start at 9 o'clock and go clockwise
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        destination.customMarkerCoords = [center[0] + dx, center[1] + dy];
      });
    }
  }
}

function spreadMarkers() {
  const screenPositions = markers.map(({ marker, destination }) => {
    const pos = map.project(destination.customMarkerCoords ?? destination.coordinates);
    return { marker, destination, pos, vx: 0, vy: 0 };
  });

  const minDistance = 30;
  const tetherStrength = 0.1;

  for (let iter = 0; iter < 10; iter++) {
    for (let i = 0; i < screenPositions.length; i++) {
      const a = screenPositions[i];
      for (let j = i + 1; j < screenPositions.length; j++) {
        const b = screenPositions[j];
        const dx = b.pos.x - a.pos.x;
        const dy = b.pos.y - a.pos.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistance * minDistance && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const overlap = (minDistance - dist) / 2;
          const offsetX = (dx / dist) * overlap;
          const offsetY = (dy / dist) * overlap;

          a.pos.x -= offsetX;
          a.pos.y -= offsetY;
          b.pos.x += offsetX;
          b.pos.y += offsetY;
        }
      }
    }

    for (const p of screenPositions) {
      const origin = map.project(p.destination.customMarkerCoords ?? p.destination.coordinates);
      p.pos.x += (origin.x - p.pos.x) * tetherStrength;
      p.pos.y += (origin.y - p.pos.y) * tetherStrength;
    }
  }

  for (const p of screenPositions) {
    const newLngLat = map.unproject([p.pos.x, p.pos.y]);
    p.marker.setLngLat(newLngLat);
  }
}

map.on("load", async () => {
  const travelData = await (await fetch("./travel-data.json")).json();
  const routes = await (await fetch("./routes.json")).json();

  createLegend();
  await addTravelDataToMap(map, travelData, routes);
  preprocessDuplicateCoordinates();
  spreadMarkers();
});

map.on("move", () => {
  spreadMarkers();
});
