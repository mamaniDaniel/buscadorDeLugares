//CONFIGURANDO MI MAPA
var mymap = L.map('mapa').setView([-34.604273, -58.406315], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicGljeGlzIiwiYSI6ImNqdm15ZHVwcjE2aTgzenBoZHk2aWw5MHkifQ.m2E53E6wQk1DXr9FhJB9Eg'
}).addTo(mymap);
let popup = L.popup();
popup
    .setLatLng([-34.604273, -58.406315])
    .setContent("Buscar cerca de esta ubicacion")
    .openOn(mymap);
//////////////

/*******VARIABLES GLOBALES*******/
var coordenadas = {
    lat: -34.604273,
    lon: -58.406315
};

var marcadoresMapa = L.layerGroup();
/**********************/

/**
	Envia una peticion Fetch a la api de HERE places 
	@param palabraAbuscar {string} la palabra que queres buscar en el mapa
	@param coordenadas {int} las coordenadas desde donde estas parado para darte resultados cercanos
	@return {string} el texto encriptado
*/
function cargarApi(palabraAbuscar, coordenadas) {
    let url = `https://places.cit.api.here.com/places/v1/autosuggest?at=${coordenadas.lat},${coordenadas.lon}&q=${palabraAbuscar}&app_id=WEUZlZ3EqqJLGS8LB9PB&app_code=ShAf7SoMgwDacbTdsk9YGw`;
    fetch(url)
        .then(function(res) {
            return res.json();
        })
        .then(function(direcciones) {
            let direccionesValidas = filtrarDirecciones(direcciones.results);
            crearMarcadores(direccionesValidas);
        })
        .catch(function(e) {
            console.log(e);
        });
}

/**
	recibe un array de informacion de lugares y la filtra dejando aquellas que tienen coordenadas de longitud y latitud 
	@param direcciones {array} array con la informacion de lugares
	@return {array} un array de lugares con lat y lon
*/
function filtrarDirecciones(direcciones) {
    //muestro los primeros cinco resultados que tienen direccion
    let mostrados = 0;
    let direccionesValidas = new Array();
    let i = 0;
    while (mostrados != 10 && i < direcciones.length) {
        if (typeof(direcciones[i].position) !== "undefined") {
            direccionesValidas.push(direcciones[i]);
            mostrados++;
            console.log("Econtre uno !");
        }
        i++;
    }
    return direccionesValidas;
}
/**
	actualiza las coordenas con cada click en nuestro mapa 
	@param e {object} objeto de leaflet js con informacion del click sobre el mapa
*/
function onMapClick(e) {
    var popup = L.popup();
    popup
        .setLatLng(e.latlng)
        .setContent("Buscar cerca de esta ubicacion")
        .openOn(mymap);
    coordenadas.lat = e.latlng.lat;
    coordenadas.lon = e.latlng.lng;

}

/**
	crea y pega, marcadores en nuestro mapa
	@param direcciones {array} array de infor de lugares	
*/
function crearMarcadores(direcciones) {
    var marker;
    marcadoresMapa.eachLayer(function(layer) { mymap.removeLayer(layer); });

    for (let index = 0; index < direcciones.length; index++) {
        marker = L.marker([direcciones[index].position[0], direcciones[index].position[1]]).addTo(mymap);
        //guardo el marker en una lista de markers para luego poder borrarlos
        marcadoresMapa.addLayer(marker);
        marker.bindPopup(`<h3>${direcciones[index].title}</h1> <p>${direcciones[index].vicinity}</p>`);
    }
    mymap.panTo([coordenadas.lat, coordenadas.lon]);
}


//LLAMADA  A FUNCION Y EVENT LISTENER
document.getElementById('lugarAbuscar').addEventListener('click', function(e) {
    e.preventDefault();
    let palabraIngresada = document.getElementById('palabraIngresada').value;
    cargarApi(palabraIngresada, coordenadas);
});

mymap.on('click', onMapClick);
/****************************** */