
// Chart dimensions 
var margin = {top: 19.5, right: 25, bottom: 35, left: 40},
    width = 1000 - margin.right,
    height = 600 - margin.top - margin.bottom;

var projection = d3.geo.robinson()
    .scale(170)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection)

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return projection([d.lon, d.lat])[0]; })
    .y(function(d) { return projection([d.lon, d.lat])[1]; });

function lineStyle(type) {
    if (type == "dashed") {
	return "2, 1.5";
    } else if (type == "dotted") {
	return "0.4, 0.5";
    }
}

var svg = d3.select("#map-u5").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Globals 
var ctyPolygons, ctyBoundaries, ctyCoast, cty, bubble; 

//Additional globals to store user selections
var displayType = "choropleth", displayVar = "u5mr";


//Read data and initialize map with U5MR and U5 deaths
queue()
    .defer(d3.json, "geo-data/world.json") 
    .await(initMap); 


function initMap(error, world) {

    // Store data in globals 
    ctyPolygons = topojson.feature(world, world.objects.polygons).features;
    
    //Initialize map with U5MR as choropleth 
    drawMap(displayType, displayVar);

    //Add title
    addTitle(displayVar);

    //Add legend
    addLegend(displayType, displayVar); 
};

//Update map given a user selection from the Variable dropdown
$('#map-var a').click(function() {
    displayVar = $(this).attr('id');
    drawMap(displayType, displayVar);
    addTitle(displayVar);
});

//Update map given a user selection from the Display dropdown
$('#map-display a').click(function() {
    displayType = $(this).attr('id');
    drawMap(displayType, displayVar);  
});


//Draw map
function drawMap(displayType, displayVar) {
    
    //Display choropleth
    displayChoropleth(displayType, displayVar);

    //Display bubbles (if selected)
    displayBubbles(displayType, displayVar);

    //Add legend
    addLegend(displayType, displayVar); 
}


function displayChoropleth(displayType, displayVar) {
    
    //Set color mapping
    if (displayType == "choropleth") {
	var color = d3.scale.threshold()
	    .domain(domainCutoffs(displayVar))
	    .range(colorSelect(displayVar));
    } else if (displayType == "bubble") {
	var color = d3.scale.threshold()
	    .domain([0])
	    .range(["#d9d9d9", "#d9d9d9"]);	  
    }
    
    //General update pattern
    var cty = svg.selectAll("path")
	.data(ctyPolygons);

    //Update
    cty.attr("class", "update")
        .attr("class", "country") 
        .attr("opacity", 1)
	.transition()
	.style("fill", function(d) {
	    //Get data value
	    var value = d.properties[displayVar];    
	    if (value) {
		return color(value);
	    } else {
		return "#fff";
	    }
	});

    //Enter
    cty.enter().append("path")
	.attr("d", path)
        .attr("class", "country") 
	.style("fill", function(d) {
	    //Get data value
	    var value = d.properties[displayVar];	      
	    if (value) {
		return color(value);
	    } else {
		return "#fff";
	    }
	});
    
    //Exit
    cty.exit()
	.remove();
    
    cty
	.on("mouseover", mouseover)
	.on("mouseout", mouseout)
    
    function mouseover(d) {	  
	var country = d.properties.country;
	var opacity = (displayType == "choropleth") ? 0.85 : 0.925;
	cty
	    .filter(function(d) { return d.properties.country == country; })
	    .attr("opacity", opacity);      
    };
    
    function mouseout(d) {
	var country = d.properties.country;
	cty
	    .filter(function(d) { return d.properties.country == country; })
	    .transition()
	    .duration(5)
	    .attr("opacity", 1);
    }
}

function displayBubbles(displayType, displayVar) {
    
    //Set mapping of bubble radii
    var maxOutR = 0;
    if (displayType == "bubble" && displayVar == "u5mr") {
	maxOutR = 25;
    } else if (displayType == "bubble" && displayVar == "u5deaths") {
	maxOutR = 30;
    }
    
    var minOutR = (displayType == "bubble") ? 2 : 0, 
	minInR = d3.min(ctyPolygons, function(d){ return d.properties[displayVar] }),
	maxInR = d3.max(ctyPolygons, function(d){ return d.properties[displayVar] }),
	radius = radiusMap(displayVar, minOutR, maxOutR, minInR, maxInR);
    
    //Set opacity of bubbles depending on display type
    var opacity = (displayType == "bubble") ? 0.5 : 0;
    
    var bubble = svg.selectAll("circle").data(ctyPolygons);
    
    bubble.attr("class", "update")
	.attr("class", "bubble")
	.attr("opacity", opacity)
	.transition()
	.attr("r", function(d) { return radius(d.properties[displayVar]) })
	.attr("transform", function(d) {
	    var lon = projection([d.properties.lon, d.properties.lat])[0]
	    var lat = projection([d.properties.lon, d.properties.lat])[1]
	    return "translate(" + [lon, lat] + ")";
	});
    
    bubble.enter().append("circle")
	.attr("class", "bubble")
	.attr("transform", function(d) {
	    var lon = projection([d.properties.lon, d.properties.lat])[0]
	    var lat = projection([d.properties.lon, d.properties.lat])[1]
	    return "translate(" + [lon, lat] + ")";
	})
	.attr("r", 0)
	.attr("opacity", opacity);
    
    bubble.exit()
	.remove();
    
    bubble
	.on("mouseover", mouseover)
	.on("mouseout", mouseout)
    
    
    function mouseover(d) {
	var country = d.properties.country;
	bubble
	    .filter(function(d) { return d.properties.country == country; })
	    .attr("opacity", 0.6)
	    .transition()
	    .duration(500)
	    .attr("r", function(d) { return radius(d.properties[displayVar]) * 1.25});  
    };
    
    function mouseout(d) {
	var country = d.properties.country;
	bubble
	    .filter(function(d) { return d.properties.country == country; })
	    .transition()  
	    .duration(1000)
	    .attr("r", function(d) { return radius(d.properties[displayVar])})
	    .attr("opacity", 0.5);
    };   
};


function addLegend(displayType, displayVar) {

    if(displayType == "choropleth") {
	
	choroplethLegend(); 
	$('.choro-legend').show();
	
    } else {

	bubbleLegend(displayVar);
	$('.choro-legend').hide(); 

    }    
}

function choroplethLegend() {

    var legendLabels = (displayVar == "u5mr") ?
	["<25", "25-50", "50-75", "75-100", ">100"] :
	["<5000", "5000 - 50 000", "50 000 - 100 000", "100 000 - 400 000", ">400 000"];

    // Add colored squares 
    var color = d3.scale.ordinal()
	.domain(legendLabels)
	.range(colorSelect(displayVar));
    
    var legend = svg.selectAll(".choro-legend")
	.data(legendLabels)
	.enter().append("g")
	.attr("class", "choro-legend")
	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("y", 290)
	.attr("x", 95)
	.attr("width", 15)
	.attr("height", 15)
	.style("fill", color);

    //Use general update pattern to update legend text 
    var legendText = svg.selectAll("text")
	.data(legendLabels, function(d) { return d; });

    legendText.attr("class", "update choro-legend text");

    legendText.enter().append("text")
	.attr("class", "enter choro-legend text")
	.attr("y", 298)
	.attr("x", 115)
	.attr("dy", ".35em")
	.style("text-anchor", "start")
	.text(function(d) { return d; })
    	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legendText.exit().remove();
}

function bubbleLegend(displayVar) {

    //Set mapping of radii    
    var minInR = d3.min(ctyPolygons, function(d){ return d.properties[displayVar] }),
	maxInR = d3.max(ctyPolygons, function(d){ return d.properties[displayVar] }),
	minOutR = 2, 
	maxOutR = 25,
	radius = d3.scale.linear(),
	data = [50, 100, 150];

    if (displayVar == "u5deaths") {
	maxOutR = 30;
	radius = d3.scale.sqrt();
	data = [2e5, 5e5, 1e6];
    }

    console.log(radius); 
    radius.domain([minInR, maxInR]).range([minOutR, maxOutR]);

    //Build legend; start with circles 
    var circle = svg.selectAll(".bubble-legend").data(data);

    circle.attr("class", "update bubble-legend");

    circle.enter().append("circle")
	.attr("class", "enter bubble-legend")
	.attr("transform", "translate(" + (115) + "," + (380) + ")")
	.attr("cy", function(d) { return -radius(d); })
	.attr("r", radius);

    circle.exit().remove();

    //Add text
    var legendText = svg.selectAll(".bubble-legend-text")
	.data(data, function(d) { return d; });
    
    legendText.attr("class", "update bubble-legend-text");

    legendText.enter().append("text")
        .attr("class", "enter bubble-legend-text")
        .attr("transform", "translate(" + (115) + "," + (380) + ")")
	.attr("y", function(d) { return -2 * radius(d); })
	.attr("dy", "1.3em")
	.text(function(d) { return d; });

    if (displayVar == "u5deaths") legendText.text(d3.format(".1s"));

    legendText.exit().remove();
    
}


//Get input domain cutoffs given variable to be graphed
function domainCutoffs(displayVar) {
    if (displayVar == "u5mr") {
	return [25, 50, 75, 100];
    } else if (displayVar == "u5deaths") {
	return [5000, 50000, 100000, 400000];
    } 
}

//Select color categories for the choropleth 
function colorSelect(displayVar) {
    var vars = ["u5mr", "u5deaths", "u5mrproj", "u5dproj"];
    if ($.inArray(displayVar, vars) != -1) {
	return ["rgb(222,235,247)", "#fee08b", "#fdae61", "#e31a1c", "#b30000"];
    } else if (displayVar == "arr9015") {
	return ["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"];
    } else {
	return ["#d9d9d9", "#d9d9d9"];
    }
}

//Set transform of radii
function radiusMap(displayVar, minOutR, maxOutR, minInR, maxInR) {
    if (displayVar == "u5mr") {
	return d3.scale.linear().domain([minInR, maxInR]).range([minOutR, maxOutR]);
    } else if (displayVar == "u5deaths") {
	return d3.scale.sqrt().domain([minInR, maxInR]).range([minOutR, maxOutR]);
    }
}


function addTitle(displayVar) {

    var title = (displayVar == "u5mr") ?
	"Under-five mortality rate in 2015" :
	"Under-five deaths in 2015"

    var subtitle = (displayVar == "u5mr") ?
	"(Number of deaths among children under age 5 per 1000 live births)" :
	"(Total number of deaths among children under age 5)"

    $('#variable-title').html(title);
    $('#variable-subtitle').html(subtitle); 

}

