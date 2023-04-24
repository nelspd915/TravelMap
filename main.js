// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoibmVsc2RhbmllbHNvbiIsImEiOiJjbGd1NG15dTMwNDJvM2ptb2NvcTZhcWlkIn0.p35o8vmnn-ahQHhJGQPrrA";

// Initialize the map
const map = new mapboxgl.Map({
  container: "map", // The container ID
  style: "mapbox://styles/mapbox/streets-v11", // The map style
  center: [-96, 37.8], // Initial map center [longitude, latitude]
  zoom: 4 // Initial zoom level
});

const travelData = [
  {
    location: "Duluth, MN",
    coordinates: [-92.1005, 46.7867],
    stayDuration: "long",
    year: 2020
  },
  {
    location: "Lake Elsinore, CA",
    coordinates: [-117.3273, 33.6681],
    stayDuration: "long",
    year: 2020
  },
  {
    location: "Quartzsite, AZ",
    coordinates: [-114.222, 33.6634],
    stayDuration: "long",
    year: 2021
  },
  {
    location: "Weatherford, OK",
    coordinates: [-98.7028, 35.5262],
    stayDuration: "short",
    year: 2021
  },
  {
    location: "Duluth, MN",
    coordinates: [-92.1005, 46.7867],
    stayDuration: "long",
    year: 2021
  },
  {
    location: "Yankton, SD",
    coordinates: [-97.3923, 42.871],
    stayDuration: "long",
    year: 2021
  },
  {
    location: "Prosper, TX",
    coordinates: [-96.8018, 33.2367],
    stayDuration: "long",
    year: 2021
  },
  {
    location: "Galveston, TX",
    coordinates: [-94.7977, 29.3013],
    stayDuration: "long",
    year: 2021
  },
  {
    location: "Hot Springs, AR",
    coordinates: [-93.0552, 34.5037],
    stayDuration: "long",
    year: 2022
  },
  {
    location: "Abilene, TX",
    coordinates: [-99.7331, 32.4487],
    stayDuration: "long",
    year: 2022
  },
  {
    location: "Alamogordo, NM",
    coordinates: [-105.9603, 32.8995],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Payson, AZ",
    coordinates: [-111.3251, 34.2304],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Grand Canyon Village, AZ",
    coordinates: [-112.1155, 36.0544],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Virgin, UT",
    coordinates: [-113.191, 37.2006],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Moab, UT",
    coordinates: [-109.7333, 38.5733],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Provo, UT",
    coordinates: [-111.6585, 40.2338],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Eagle, ID",
    coordinates: [-116.3545, 43.6958],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Carson, WA",
    coordinates: [-121.814, 45.7323],
    stayDuration: "long",
    year: 2022
  },
  {
    location: "Chinook, WA",
    coordinates: [-123.9454, 46.2729],
    stayDuration: "long",
    year: 2022
  },
  {
    location: "Rock Springs, WY",
    coordinates: [-109.1985, 41.5875],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "New Underwood, SD",
    coordinates: [-102.7996, 44.1152],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Black Hawk, SD",
    coordinates: [-103.275, 44.1604],
    stayDuration: "long",
    year: 2022
  },
  {
    location: "Duluth, MN",
    coordinates: [-92.1005, 46.7867],
    stayDuration: "long",
    year: 2022
  },
  {
    location: "Aurora, IL",
    coordinates: [-88.3201, 41.7606],
    stayDuration: "long",
    year: 2022
  },
  {
    location: "Cape Girardeau, MO",
    coordinates: [-89.5182, 37.3059],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Marion, AR",
    coordinates: [-90.1994, 35.214],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Bay St. Louis, MS",
    coordinates: [-89.2973, 30.3089],
    stayDuration: "short",
    year: 2022
  },
  {
    location: "Von Ormy, TX",
    coordinates: [-98.6298, 29.2667],
    stayDuration: "long",
    year: 2023
  },
  {
    location: "Fort Stockton, TX",
    coordinates: [-101.8781, 30.8949],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "El Paso, TX",
    coordinates: [-106.4425, 31.7619],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Tucson, AZ",
    coordinates: [-110.9265, 32.2217],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Desert Edge, CA",
    coordinates: [-116.3009, 33.744],
    stayDuration: "long",
    year: 2023
  },
  {
    location: "Aptos, CA",
    coordinates: [-121.8806, 36.9772],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Shasta Lake, CA",
    coordinates: [-122.3708, 40.6807],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Salem, OR",
    coordinates: [-123.0351, 44.9429],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Ephrata, WA",
    coordinates: [-119.5537, 47.3126],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Missoula, MT",
    coordinates: [-113.9883, 46.8721],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Havre, MT",
    coordinates: [-109.6772, 48.549],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Glendive, MT",
    coordinates: [-104.7104, 47.1053],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Grand Forks, ND",
    coordinates: [-97.0329, 47.9253],
    stayDuration: "short",
    year: 2023
  },
  {
    location: "Duluth, MN",
    coordinates: [-92.1005, 46.7867],
    stayDuration: "long",
    year: 2023
  },
  {
    location: "Rochester, MN",
    coordinates: [-92.4802, 44.0216],
    stayDuration: "long",
    year: 2023
  }
];

function addTravelDataToMap(map, travelData) {
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

    // Create a new Mapbox GL JS marker and add it to the map
    new mapboxgl.Marker(markerElement)
      .setLngLat(destination.coordinates)
      .addTo(map);

    // Add a line between the current destination and the previous one
    if (i > 0) {
      // Get the coordinates of the current and previous destinations
      const coordinates = [
        travelData[i - 1].coordinates,
        destination.coordinates
      ];

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
              coordinates: coordinates
            }
          }
        },
        paint: {
          "line-color": destination.year === 2023 ? "#007cbf" : "#f47e00",
          "line-width": 4
        }
      });
    }
  }
}

// Call the addTravelDataToMap function after the map is loaded
map.on("load", () => {
  addTravelDataToMap(map, travelData);
});
