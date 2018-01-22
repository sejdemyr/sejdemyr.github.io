
/*
---------------------------------------------------------------------- 
   This script defines a few globals, loads three datasets, and 
   specifies a function that calls a set of visualizations given 
   a neighborhood selection
----------------------------------------------------------------------
*/


// Define globals
var neighborhoods,             // neighborhood boundaries 
    neighN,                    // number of neighborhoods 
    neighPoly = [],            // to construct google maps polygons 
    neighResponse,             // service response data by neighborhood
    nhbytype,                  // service response data by type, neighborhood, year
    requesttypes = [],         // unique request types
    neighName = "Astoria",     // currently selected neighborhood (start with random)
    uniqueNeighborhoods = [];  // list of neighborhoods


// Load neighborhood polygon data 
d3.json("data/neighborbound.topo.json", function(error, dta) {
    if (error) return console.warn(error);

    neighborhoods = topojson.feature(dta, dta.objects.neighborbound); 

    if (typeof google !== "undefined") {
	initAutocomplete();
    }

    // Draw choropleth (hidden initially) 
    choroplethMap(neighName); 
    
}); 

// Load service request data (neighborhood level, three time periods) 
d3.csv("data/nyc311-byneightime.csv", function(error, dta) {
    if (error) return console.warn(error);

    neighResponse = dta.map(function(d) {
	return {
	    neighborhood: d.neighborhood,
	    time: d.time, 
	    rankrt: +d.rankrt,
	    pcsolved: d3.round(+d.pcsolved, 0), 
	    pcsolvedin5: d3.round(+d.pcsolvedin5, 0), 
	    avgresptime: d3.round(+d.avgresptime, 0),
	    nrequests: +d.nrequests,
	    nsolved: +d.nsolved	   
	};	
    });

    // Number of neighborhoods 
    neighN = neighResponse.filter(function(d) { return d.time == "All time"; }).length;
    
});

// Load service request data (neighborhood level and city level, by year and type)
d3.csv("data/nyc311-byneighyeartype.csv", function(error, dta) {
    if (error) return console.warn(error);

    nhbytype = dta.map(function(d) {
	return {
	    neighborhood: d.neighborhood,
	    nid: +d.nid, 
	    year: +d.year, 
	    requesttype: d.requesttype, 
	    rankrt: +d.rankrt,
	    pcsolvedin5: d3.round(+d.pcsolvedin5, 0),	  	   
	    avgresptime: d3.round(+d.avgresptime, 0)	   
	};
    });

    // Get unique request types
    nhbytype.filter(function(d) {
	return d.year == 2004 && d.neighborhood == "City-wide"; 
    }).forEach(function(d) {	
	requesttypes.push(d.requesttype);
    }); 

    // Get unique neighborhoods
    nhbytype.filter(function(d) {
	return d.year == 2015 && d.requesttype == "All"; 
    }).forEach(function(d) {	
	uniqueNeighborhoods.push(d.neighborhood);
    }); 
    
    // Draw line graph and add check-boxes 
    lineGraph(neighName, ["All"]);
    checkboxes(); 

}); 


// Function that filters the response data given a neighborhood
// selection and displays (1) key facts, (2) the line graph, and (3)
// the choropleth map.
// @para name: name of the selected neighborhood
// @para time: time dimension; this version has only one ("All time")

function visualizeData(name, time) {  
    
    // Filter response data given neighborhood name and time dimension
    var responseFiltered = neighResponse.filter(function(d) {
	return d.neighborhood == name && d.time == time; 
    });

    // Display neighborhood name and remove hidden classes
    if ($(window).width() >= 500) {
	$("#neighborhood-div").empty().append("<h1 id='neighborhood-name'> </h1>"); 
	$("#content").css("opacity", 0); 
	
	// Populate neighborhood name (using typed.js) 
	$(function(){
	    $("#neighborhood-name").typed({
		strings: ["Neighborhood: " + neighName],
		typeSpeed: 0,
		showCursor: false,
		callback: function() {
		    // When function is done, remove hidden content: 
		    $("#content").removeClass("hidden").css("opacity", 1);
	            $("footer").removeClass("hidden"); 
		}
	    });
	});
    } else {
	$("#content").removeClass("hidden");
	$("footer").removeClass("hidden"); 
    }
    
    // Display stats associated with selected neighborhood
    displayNeighborhoodStats(responseFiltered);

    // Display line graph
    lineGraph(name, ["All"]);
    clearCheckList();

    // Display neighborhood map
    choroplethMap(name);
}






