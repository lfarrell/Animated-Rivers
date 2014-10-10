(function() {
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var map = L.map('map').setView([35.105, -79.89], 8);

    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        maxZoom: 18
    }).addTo(map);

    omnivore.topojson('NHDArea.json').on('ready', function() { // wrap d3 code in omnivore's ready function
        var svg = d3.select("svg"),
            g = svg.append("g").attr("class", "leaflet-zoom-hide");

        d3.tsv('nc_sites.tsv', function(d) {
            var points = d;

            d3.tsv('current1.tsv', function(f) {
                var flow = f;

                // Add in flow rate from current file for each station
                for(var i= 0, j=points.length; i<j; i++) {
                    points[i].flow = flow[i].result_va;
                    points[i].LatLng = new L.LatLng(points[i].dec_lat, points[i].dec_long);
                }

                var feature = g.selectAll("circle")
                    .data(points)
                    .enter().append("circle")
                    .attr("r", 5)
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);

                        div.html("The flow rate is " + d.flow + " ft3/s as measured at<br /> station: " + d.station_nm)
                            .style("left", (d3.event.pageX - 8) + "px")
                            .style("top", (d3.event.pageY - 8) + "px")
                    }).on("mouseout", function() {
                         div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                map.on("viewreset", update);
                update();

                function update() {
                    feature.attr("transform", function(d) {
                        return "translate("+
                            map.latLngToLayerPoint(d.LatLng).x +","+
                            map.latLngToLayerPoint(d.LatLng).y +")";
                    });
                }
            });
        });
    }).addTo(map);
})();