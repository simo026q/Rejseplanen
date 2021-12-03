// Vue app
const App = {
    data() {
        return {
            // Origin search string
            originSearch: "",
            // Origin search results
            originSearchResults: [],
            // Selected origin
            origin: {
                id: "000053463",
                name: "Lillevangsvej (Slangerupvej)",
                x: "12338747",
                y: "55821062"
            },

            // Destination search string
            destSearch: "",
            // Destination search results
            destSearchResults: [],
            // Selected destinaiton
            dest: {
                id: "000053563",
                name: "Ballerup St. (Banegårdspladsen)",
                x: "12358936",
                y: "55730486"
            },

            // Displayed routes
            routes: [],
            // All types of lines with bootstrap color and all names
            lineTypes: {
                IC: {
                    short: "IC",
                    name: "InterCity",
                    color: "warning"
                },
                LYN: {
                    short: "ICL",
                    name: "Lyntog",
                    color: "warning"
                },
                REG: {
                    short: "RE",
                    name: "Regionaltog",
                    color: "warning"
                },
                S: {
                    short: "S",
                    name: "S-Tog",
                    color: "danger"
                },
                TOG: {
                    short: "Tog",
                    name: "Tog",
                    color: "warning"
                },
                BUS: {
                    short: "Bus",
                    name: "Bus",
                    color: "warning"
                },
                EXB: {
                    short: "Bus",
                    name: "Express Bus",
                    color: "primary"
                },
                NB: {
                    short: "Bus",
                    name: "Natbus",
                    color: "dark"
                },
                TB: {
                    short: "Bus",
                    name: "Telebus",
                    color: "dark"
                },
                F: {
                    short: "F",
                    name: "Ferry",
                    color: "dark"
                },
                M: {
                    short: "M",
                    name: "Metro",
                    color: "dark"
                },
                LET: {
                    short: "LET",
                    name: "Letbane",
                    color: "dark"
                },
                WALK: {
                    short: "Gå",
                    name: "Gå",
                    color: "dark"
                },
                BIKE: {
                    short: "Cykel",
                    name: "Cykel",
                    color: "dark"
                },
                CAR: {
                    short: "Bil",
                    name: "Bil",
                    color: "dark"
                },
            }
        }
    },
    computed: {
        // If none selected show placeholder
        displayOrigin() {
            return (origin.name == undefined) ? "Choose" : origin.name;
        }
    },
    methods: {
        // Fetch function
        async fetchApi(url) {
            let returnVal;
            await fetch(url)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        console.error("API: Server returned " + response.status + " (" + response.statusText + ")");
                    }
                })
                .then(response => {
                    returnVal = response;
                })
                .catch(e => {
                    console.error(e);
                });
            console.log(returnVal);
            return returnVal;
        },
        // Fetch for rejsenplanen api
        async apiRejseplanen(arg) {
            let baseurl = "http://xmlopen.rejseplanen.dk/bin/rest.exe/";
            let options = "&format=json";
            return await this.fetchApi(baseurl + arg + options);
        },
        // Fetch location from rejseplanen api
        async apiLocation(input) {
            let response = await this.apiRejseplanen("location?input=" + input);
            let returnVal = [];
            returnVal = returnVal.concat(response["LocationList"]["StopLocation"]);
            returnVal = returnVal.concat(response["LocationList"]["CoordLocation"]);
            return returnVal;
        },
        // Fetch origin search results
        async updateOriginSearch() {
            this.originSearchResults = await this.apiLocation(this.originSearch);
        },
        // Fetch destination search results
        async updateDestSearch() {
            this.destSearchResults = await this.apiLocation(this.destSearch);
        },
        // Get a trip and generate map
        async searchRoutes() {
            if (this.origin.name != undefined && this.dest.name != undefined) {
                setCenter([+this.origin.x, +this.origin.y], [+this.dest.x, +this.dest.y]);
                let routes = await this.apiRejseplanen("trip?originId=" + this.origin.id + "&destId=" + this.dest.id);
                this.routes.push(routes["TripList"]["Trip"][0]);

                const route = this.routes[0];
                var allStops = [];

                for (let legIdx = 0; legIdx < route["Leg"].length; legIdx++) {
                    const leg = route["Leg"][legIdx];

                    const originStopIdx = +leg["Origin"]["routeIdx"];
                    const destStopIdx = +leg["Destination"]["routeIdx"];

                    if (leg["JourneyDetailRef"] != undefined) {
                        let journeyDetails = await this.fetchApi(leg["JourneyDetailRef"]["ref"]);

                        let lineStops = journeyDetails["JourneyDetail"]["Stop"];
                        let stop = [];
                        for (let stopIdx = 0; stopIdx < lineStops.length; stopIdx++) {
                            const routeStopIdx = +lineStops[stopIdx]["routeIdx"];
                            if (originStopIdx <= routeStopIdx && destStopIdx >= routeStopIdx) {
                                stop.push(lineStops[stopIdx]);
                            }
                        }
                        generateRoute(stop, cssColor(this.lineTypes[leg["type"]].color) );
                    }
                    else if (leg["type"] == "WALK" || leg["type"] == "BIKE" || leg["type"] == "CAR") {
                        var from = await this.apiLocation(leg["Origin"]["name"]);
                        from = from[0];
                        var to = await this.apiLocation(leg["Destination"]["name"]);
                        to = to[0];

                        let type;
                        switch (leg["type"]) {
                            case "WALK":
                                type = "walking";
                                break;
                            case "BIKE":
                                type = "cycling";
                                break;
                            default:
                                type = "driving";
                                break;
                        }
                        console.log(from);
                        console.log(to);

                        generateRoute([from, to], cssColor(this.lineTypes[leg["type"]].color), type);
                    }
                }
            }
        }
    },
    created() {
        // Setup mapbox
        setup();
    }
}

Vue.createApp(App).mount('#app');

var map;

// Setup mapbox
function setup() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2ltbzAyNnEiLCJhIjoiY2t3YWY2bW80MDR0ZDJwcWtwMzZuanhrcyJ9.WkkKODeCWt0h0ISI6ZFqqw';
    map = new mapboxgl.Map({
        container: "map",
        style: 'mapbox://styles/mapbox/light-v10',
        center: [12.550343, 55.665957],
        zoom: 8
    });
}

function generateRoute(stops, color = "#1565c0", type = "driving") {
    console.log(stops);
    let stopsString = "";
    for (let i = 0; i < stops.length; i++) {
        let val = coordVal([stops[i].x, stops[i].y]);
        stopMarker(val, color);
        stopsString += `${val[0]},${val[1]}`;
        if (i != stops.length - 1) stopsString += ";";
    }

    getRoute(stopsString, type, color);
}

// Busstop marker
function stopMarker(coords, color = "#1565c0") {
    const id = 'point' + coords[0] + coords[1];
    const hasLayer = (map.getLayer(id) != undefined);
    if (!hasLayer) {
        map.addLayer({
            id: id,
            type: 'circle',
            source: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'Point',
                      coordinates: coords
                    }
                  }
                ]
              }
            },
            paint: {
              'circle-radius': 6,
                'circle-color': color
            }
        });
    }
}

function setCenter(from, to) {
    var newCenter = coordVal([(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]);
    map.setCenter(newCenter);
}

// create a function to make a directions request
async function getRoute(coords, type = "driving", color = "#1565c0") {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${type}/${coords}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route'+coords)) {
        map.getSource('route'+coords).setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
        map.addLayer({
            id: 'route'+ coords,
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': color,
                'line-width': 5,
                'line-opacity': 0.5
            }
        });
    }
}

// Get bootstrap color
function cssColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue('--bs-' + name);
}

// Get real coord values (decimals instead of integers)
function coordVal(array) {
    return [(array[0] / 1000000), (array[1] / 1000000)];
}