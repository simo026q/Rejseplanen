<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rejseplanen</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css' rel='stylesheet' />
</head>

<body class="bg-light">

    <main class="my-5" id="app">
        <div class="container">
            <div class="row">
                <div class="col">
                    <label class="text-muted form-label" for="dropdownOrigin">Click on the field to change origin</label>
                    <div class="dropdown">
                        <input class="form-control form-control-lg dropdown-toggle" :value="origin.name" readonly role="button" id="dropdownOrigin" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                        <ul class="dropdown-menu p-2 w-100" aria-labelledby="dropdownOrigin">
                            <input type="text" class="form-control form-control-sm" id="from" v-model="originSearch" @change="updateOriginSearch()" placeholder="Search...">
                            <ul class="list-group mt-2 border-1" style="max-height:200px;overflow-x:hidden;overflow-y:scroll" v-if="originSearchResults.length > 0">
                                <li class="list-group-item list-group-item-action" style="cursor:pointer" v-for="stop in originSearchResults" @click="origin = stop">{{ stop.name }}</li>
                            </ul>
                        </ul>
                    </div>
                </div>
                <div class="col">
                    <label class="text-muted form-label" for="dropdownDest">Click on the field to change destination</label>
                    <div class="dropdown">
                        <input class="form-control form-control-lg dropdown-toggle" :value="dest.name" readonly role="button" id="dropdownDest" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                        <ul class="dropdown-menu p-2 w-100" aria-labelledby="dropdownDest">
                            <input type="text" class="form-control form-control-sm" id="from" v-model="destSearch" @change="updateDestSearch()" placeholder="Search...">
                            <ul class="list-group mt-2 border-1" style="max-height:200px;overflow-x:hidden;overflow-y:scroll" v-if="destSearchResults.length > 0">
                                <li class="list-group-item list-group-item-action" style="cursor:pointer" v-for="stop in destSearchResults" @click="dest = stop">{{ stop.name }}</li>
                            </ul>
                        </ul>
                    </div>
                </div>
                <div class="col-auto">
                    <label class="text-muted form-label d-block" for="searchTrip">Click to search for routes</label>
                    <button class="btn btn-lg btn-primary d-block w-100" @click="searchRoutes" id="searchTrip">Search</button>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div class="card mt-3" v-for="route in routes">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-auto">
                                    <h2 class="m-0">{{ route.Leg[0].Origin.time }}</h2>
                                    <small class="text-muted">{{ route.Leg[0].Origin.name }}</small>
                                </div>
                                <div class="col">
                                    <div class="row">
                                        <div class="col text-center" v-for="leg in route.Leg">
                                            <span class="badge" :class="'bg-' + lineTypes[leg.type].color">{{ leg.line }}</span>
                                            <h6>{{ leg.Origin.time }} <span class="text-muted">{{ leg.Origin.name }}</span></h6>
                                            <h6>{{ leg.Destination.time }} <span class="text-muted">{{ leg.Destination.name }}</span></h6>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-auto text-end">
                                    <h2 class="m-0">{{ route.Leg[route.Leg.length-1].Destination.time }}</h2>
                                    <small class="text-muted">{{ route.Leg[route.Leg.length-1].Destination.name }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <div class="container">
        <div id="map" style="height: 300px;" class="w-100"></div>
    </div>

    <footer class="container bg-white mt-5 text-center">
        <p class="text-muted py-4">Developed by <a class="btn-link" href="https://simon-christensen.com/" target="_blank">Simon Christensen</a></p>
    </footer>


    <script src='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/vue@next"></script>
    <script src="./js/app.js"></script>

</body>

</html>