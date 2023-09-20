require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/PopupTemplate",
  "esri/geometry/Polyline",
  "esri/symbols/SimpleLineSymbol"
], function (
  Map,
  MapView,
  Graphic,
  Point,
  SimpleMarkerSymbol,
  PopupTemplate,
  Polyline,
  SimpleLineSymbol
) {
  // Set your Mapbox access token
  const mapBoxToken = "";

  // Initialize the Esri map
  const map = new Map({
    basemap: "topo-vector"
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-96, 37.8],
    zoom: 4
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
      default:
        return "#555";
    }
  }

  // 1. Logic to add markers using Esri graphics
  function addMarkers(travelData) {
    let destNumber = 1;
    travelData.forEach((destination) => {
      if (destination.location !== "ROUTE_PIN") {
        // Create a point geometry
        const point = new Point({
          longitude: destination.coordinates[0],
          latitude: destination.coordinates[1]
        });

        // Define a symbol for the marker
        const markerSymbol = new SimpleMarkerSymbol({
          color: getColorByRouteNumber(destination.route),
          outline: {
            color: destination.past ? "#000" : "#fff",
            width: 1
          },
          size: "25px",
          style: destination.stayDuration === "short" ? "circle" : "square"
        });

        // Create a popup template
        const popupTemplate = new PopupTemplate({
          title: destination.location
        });

        // Create a graphic and add it to the map view
        const markerGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol,
          popupTemplate: popupTemplate
        });

        // Add number label to the marker
        const textSymbol = {
          type: "text",
          color: "#fff",
          text: destNumber,
          xoffset: 0,
          yoffset: -4, // Adjusted y-offset for better vertical centering
          font: {
            size: 10,
            weight: "bold"
          }
        };

        const labelGraphic = new Graphic({
          geometry: point,
          symbol: textSymbol
        });

        destNumber += 1;

        view.graphics.add(markerGraphic);
        view.graphics.add(labelGraphic);
      }
    });
  }

  async function addRoutes(travelData, routes) {
    const allRoutes = [];

    for (let i = 1; i < travelData.length; i++) {
      const previousDestination = travelData[i - 1];
      const currentDestination = travelData[i];
      let routeCoordinates;

      // Check if route exists in the provided routes.json
      if (routes[i - 1]) {
        routeCoordinates = routes[i - 1];
      } else {
        // If not, fetch route from Mapbox API
        routeCoordinates = await getDrivingRoute(
          previousDestination.coordinates,
          currentDestination.coordinates
        );
      }

      // Create a polyline geometry for the route
      const polyline = new Polyline({
        paths: routeCoordinates,
        spatialReference: { wkid: 4326 }
      });

      // Define a symbol for the route
      const routeSymbol = new SimpleLineSymbol({
        color: getColorByRouteNumber(currentDestination.route),
        width: 3,
        style: currentDestination.past ? "solid" : "dash"
      });

      // Create a graphic for the route and add it to the map view
      const routeGraphic = new Graphic({
        geometry: polyline,
        symbol: routeSymbol
      });

      allRoutes.push(routeCoordinates);

      view.graphics.add(routeGraphic);
    }

    console.log("Routes: ", JSON.stringify(allRoutes));
  }

  async function getDrivingRoute(origin, destination) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${mapBoxToken}`;

    const response = await fetch(url);
    const data = await response.json();

    console.warn(`API route request from ${origin} to ${destination}`);
    return data.routes[0].geometry.coordinates;
  }

  function createLegend() {
    const legend = document.getElementById("legend");

    const routeNumbers = [5, 4, 3, 2, 1]; // Add more years as needed

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
      }

      label.innerText = `Route ${routeNumber} (${yearRange})`;

      item.appendChild(color);
      item.appendChild(label);
      legend.prepend(item);
    });
  }

  // Logic to add markers and routes
  function addTravelDataToMap(travelData, routes) {
    addRoutes(travelData, routes);
    addMarkers(travelData);
  }

  // Fetch the travel data and routes, then add them to the map
  view.when(async () => {
    const travelData = await (await fetch("./travel-data.json")).json();
    const routes = await (await fetch("./routes.json")).json();

    createLegend();
    addTravelDataToMap(travelData, routes);
  });
});
