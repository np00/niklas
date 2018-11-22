


// Linked Geo Data Query Execution 
function executeLgdQuery() 
{
  // read query from HTML Text area
  lgd_query = lgd_editor.getValue()

  // construct http get request 
  full_query = lgd_graph_uri + encodeURIComponent(lgd_query) + lgd_result_format 
  
  // execute request 
  httpGetAsync(full_query, processData)
}


// Linked Geo Data Query Execution
function executeDbPediaQuery() 
{
  // read query from HTML Text area
  dbpedia_query = dbpedia_editor.getValue()

  // construct http get request 
  full_query = dbpedia_graph_uri + encodeURIComponent(dbpedia_query) + dbpedia_result_format 
  
  // execute request 
  httpGetAsync(full_query, processData)
}


function processData(results)
{
   // console.log(results)

   // parse eto JSON 
    var jsonResult = JSON.parse(results, null, 2);
    
    // get results array  
    instanceList = jsonResult.results.bindings

    console.log(instanceList)

    // draw each result item to the map 
    for (let instance of instanceList)
    {
      //console.log(instance.name.value)

      drawToMap(instance.name.value, instance.geo.value)
    }

}



function drawToMap(instanceName, instanceGeo) {

  // console.log(instanceGeo)

  // "POINT(7.1830067 50.8969143)"
  var regex_result = instanceGeo.match("\\s.*");

  delimiter = regex_result.index

  lat = instanceGeo.substring(6, delimiter)
  long = instanceGeo.substring(delimiter+1)
  long = long.slice(0, long.length-1)


  new_marker = L.marker([long, lat], {icon:markerIconRed}).addTo(map)
    .bindPopup(instanceName)
    .openPopup();

  // add marker
   markers.addLayer(new_marker);
}



function httpGetAsync(requestUrl, processData)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { 
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            processData(xhr.responseText);
        }
    }

    xhr.open("GET", requestUrl, true); // true for asynchronous 
    xhr.send(null);
}




// Definition of Markers on the map 

var markerIcon = L.icon({
    iconUrl: 'img/marker-icon.png',
    iconSize: [20, 20], 
});


var markerIconRed = L.icon({
    iconUrl: 'img/marker-icon-red.png',
    iconSize: [20, 20], 
});

var markerIconViolet = L.icon({
    iconUrl: 'img/marker-icon-violet.png',
    iconSize: [20, 20], 
});

var busIcon = L.icon({
    iconUrl: 'img/bus.png',
    iconSize: [20, 20], 
});



// DO NOT CHANGE ------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
var popup = L.popup();

function onMapClick(e) {
    popup
  .setLatLng(e.latlng)
  .setContent("You clicked the map at " + e.latlng.toString())
  .openOn(map);
}

map = L.map('map').setView([50.7318, 7.1009], 15);
var markers = L.featureGroup();
map.addLayer(markers)

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'klang.ng9i3eh6',
    accessToken: 'pk.eyJ1Ijoia2xhbmciLCJhIjoiY2llc2d1ZzBjMDAwMDlqa3N5amM0emxmeCJ9.-IYjn89ohocerNpQDPbpMw'
}).addTo(map);


// LinkedGeoData global variables ------------------
lgd_graph_uri = "http://linkedgeodata.org/sparql?default-graph-uri=http%3A%2F%2Flinkedgeodata.org&query="
lgd_default_query = 
`PREFIX lgd: <http://linkedgeodata.org/ontology/>
PREFIX geom: <http://geovocab.org/geometry#>
PREFIX ogc: <http://www.opengis.net/ont/geosparql#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?name, ?geo 
{
    ?bonn owl:sameAs <http://dbpedia.org/resource/Bonn> .
    ?bonn geom:geometry [ ogc:asWKT ?bonnGeo] .

    ?bar a lgd:Bar .
    ?bar rdfs:label ?name .    
    ?bar geom:geometry [ ogc:asWKT ?geo] .

    FILTER(bif:st_intersects (?bonnGeo, ?geo, 5)) .

} LIMIT 10`
lgd_result_format = "&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on"

// DBPedia global variables ----------------------
dbpedia_graph_uri = "http://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query="
dbpedia_default_query = `PREFIX geom: <http://geovocab.org/geometry#>
PREFIX ogc:  <http://www.opengis.net/ont/geosparql#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX dbo:  <http://dbpedia.org/ontology/>
PREFIX dbr:  <http://dbpedia.org/resource/> 

SELECT *
{
    ?location dbo:location dbr:London .
    ?location rdfs:label ?name .
    OPTIONAL {?location geo:geometry ?geo . }

} LIMIT 10`
dbpedia_result_format = "&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+"

var lgd_editor
var dbpedia_editor 
var map

map.on('click', onMapClick);


function init() {
    lgd_query = document.getElementById("lgd_query")
    lgd_query.innerHTML = lgd_default_query

    dbpedia_query = document.getElementById("dbpedia_query")
    dbpedia_query.innerHTML = dbpedia_default_query


   require([
      "lib/codemirror", "mode/sparql/sparql", "mode/turtle/turtle"
    ], function(CodeMirror) {
      dbpedia_editor = CodeMirror.fromTextArea(dbpedia_query, {
        lineNumbers: true,
      mode:        "turtle",
      autofocus:   false,
      lineNumbers: true,
      gutters:     ["CodeMirror-linenumbers", "breakpoints"],
      extraKeys: { "Ctrl-Space": "autocomplete" }
      });
    });

              require([
      "lib/codemirror", "mode/sparql/sparql", "mode/turtle/turtle"
    ], function(CodeMirror) {
      lgd_editor = CodeMirror.fromTextArea(lgd_query, {
        lineNumbers: true,
      mode:        "turtle",
      autofocus:   false,
      lineNumbers: true,
      gutters:     ["CodeMirror-linenumbers", "breakpoints"],
      extraKeys: { "Ctrl-Space": "autocomplete" }
      });
    });


}

function clearMap() {
    markers.clearLayers();
}

     
