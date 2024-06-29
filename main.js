// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoibmVsc2RhbmllbHNvbiIsImEiOiJjbG1yeWVwbHcwYTF6Mmtxa3gyM3A5ODVlIn0.e46YsOUg6wrY80FkhHATDw";

// Initialize the map
const map = new mapboxgl.Map({
  container: "map", // The container ID
  style: "mapbox://styles/mapbox/streets-v11", // The map style
  center: [-96, 37.8], // Initial map center [longitude, latitude]
  zoom: 4 // Initial zoom level
});

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
      return "#ff911c";
    case 7:
      return "#00dec8";
    default:
      return "#555";
  }
}

async function addTravelDataToMap(map, travelData, routes) {
  const allRoutes = [];

  // Iterate through the travel data
  let destNumber = 0;
  for (let i = 0; i < travelData.length; i++) {
    const destination = travelData[i];

    if (destination.location !== "ROUTE_PIN") {
      // Choose the marker symbol based on the stay duration
      const markerSymbol =
        destination.stayDuration === "short" ? "circle" : "square";

      // Create a new HTML element for the marker
      const markerElement = document.createElement("div");
      markerElement.className = `marker ${markerSymbol}`;

      // Add the point number as text inside the marker element
      markerElement.innerText = destNumber + 1;
      markerElement.style.setProperty(
        "--color",
        getColorByRouteNumber(destination.route)
      );
      markerElement.style.setProperty(
        "--outlineColor",
        destination.past ? "#000" : "#fff"
      );

      // Create a new Mapbox GL JS marker and add it to the map
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(destination.customMarkerCoords ?? destination.coordinates)
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: false
          }).setHTML(
            `
              <h3 class="popup-text">${destination.location}</h3>
              <p class="popup-text">Arrive: ${destination.arrive}</p>
              <p class="popup-text">Depart: ${destination.depart}</p>
            `
          )
        )
        .addTo(map);

      markerElement.addEventListener("mouseenter", () => marker.togglePopup());
      markerElement.addEventListener("mouseleave", () => marker.togglePopup());

      destNumber += 1;
    }

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

  const routeNumbers = [7, 6, 5, 4, 3, 2, 1]; // Add more routes as needed

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
        yearRange = "2023";
        break;
      case 5:
        yearRange = "2024";
        break;
      case 6:
        yearRange = "2024";
        break;
      case 7:
        yearRange = "2024-25";
        break;
    }

    label.innerText = `Route ${routeNumber} (${yearRange})`;

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
