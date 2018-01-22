

var margin = {linegraph: {top: 10, right: 25, bottom: 35, left: 30}},
    w = 700 - margin.linegraph.right,
    h = 660 - margin.linegraph.top - margin.linegraph.bottom;

var svglinegraph = d3.select("#linegraph").append("svg")
    .attr('class', 'svglinegraph')
    .attr("width", w + margin.linegraph.left + margin.linegraph.right)
    .attr("height", h + margin.linegraph.top + margin.linegraph.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.linegraph.left + "," + margin.linegraph.top + ")");

// Add the x-axis
var xScale = d3.scale.linear().domain([2004, 2016]).range([0, w]),
    xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(14, d3.format(",d")); 

svglinegraph.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);

// Add an x-axis label
svglinegraph.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", w)
    .attr("y", h + margin.linegraph.bottom - 5)
    .text("Year");

// Add the y-axis
var yScale = d3.scale.linear().domain([0, 300]).range([h, 0]),
    yAxis = d3.svg.axis().orient("left").scale(yScale); 

var gAxis = svglinegraph.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// Add a y-axis label
svglinegraph.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", "0.75em")
    .attr("transform", "rotate(-90)")
    .text("average response time (days)"); 

// Add legend
// Data
var legendData = [ { "x": w - 40, "y": 50}, { "x": w - 10, "y": 50},
		   { "x": w - 40, "y": 75}, { "x": w - 10, "y": 75} ]; 

// Line mapping for legend
var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");

svglinegraph.append("path")
    .attr("d", lineFunction([legendData[0], legendData[1]]))
    .attr("class", "lgleg")

svglinegraph.append("path")
    .attr("d", lineFunction([legendData[2], legendData[3]]))
    .attr("class", "lgleg")
    .attr("stroke-dasharray", "2, 2"); 

svglinegraph.append("text")
    .attr("class", "lglegcw")
    .attr("x", legendData[2].x - 6)
    .attr("y", legendData[2].y + 3)
    .attr("text-anchor", "end")
    .text("City-wide")

// Line mapping for responsetime
var line = d3.svg.line()
    .x(function(d) { return xScale(d.year); })
    .y(function(d) { return yScale(d.avgresptime); });


function lineGraph(neighborhood, type) {

    // Filter data to selected neighborhood
    var filtered = nhbytype.filter(function(d) {
	return d.neighborhood == neighborhood || d.neighborhood == "City-wide"; 
    });
   
    // Nest data by neighborhood and request type
    var nestdta = d3.nest().key(function(d) { return d.neighborhood + '_' + d.requesttype; }).entries(filtered);
    
    // Create an array holding the selected neighborhood/request type,
    // formatted the same way as the keys of the nested data
    var keys = []; 
    type.forEach(function(d) {
	keys.push(neighborhood + "_" + d);
	keys.push("City-wide_" + d); 
    });

    // Get the maximum response time to update the y axis
    var max = d3.max(filtered.filter(function(d) {
	return $.inArray(d.requesttype, type) > -1;
    }), function(d) { return +d.avgresptime; });

    var max = (max > 20) ? max : 20;  // Set mininum max value to 20

    // Set duration of update
    var duration = 300; 
    
    // Update y-axis
    yScale.domain([0, max]);
    gAxis
	.transition()
	.ease("linear")
	.duration(duration)
	.call(yAxis);

    
    var color = d3.scale.category20()
	.domain(requesttypes)
    
    // Add lines
    var lines = svglinegraph.selectAll(".line")
	.data(nestdta)

    lines
        .transition()
	.ease("sin")
	.duration(duration)
        .attr("class", "line")
	.attr("d", function(d) { return line(d.values); })
	.style("stroke-width", function(d) {
	    for (var i = 0; i < keys.length; i++) { 
		if (d.key == keys[i]) {
                    return 2; 
		}
            }
            return 0; 
	})
        .style("stroke", function(d) {
	    var t = d.key.substr(d.key.indexOf("_") + 1); 
	    return color(t) 
	})
       
    lines
        .enter().append("path")
	.attr("class", "line")
	.attr("d", function(d) { return line(d.values); })
	.style("stroke-width", function(d) {
	    for (var i = 0; i < keys.length; i++) { 
		if (d.key == keys[i]) {
                    return 2; 
		}
            }
            return 0; 
	})
        .style("stroke-dasharray", function(d) {
	    if(d.key.substr(0, 9) == "City-wide") { return "2, 2" }; 
	})
        .style("stroke", function(d) {
	    var t = d.key.substr(d.key.indexOf("_") + 1); 
	    return color(t) 
	})

    lines.exit().remove();

    // Update legend text with neighborhood name
    var legendText = svglinegraph.selectAll(".lglegtext")
        .data(uniqueNeighborhoods)

    legendText
        .attr("class", "lglegtext")
        .transition()
        .text(function(d) { if(d == neighborhood) return d; }) 

    legendText
	.enter().append("text")
        .attr("class", "lglegtext")
        .attr("x", legendData[0].x - 6)
        .attr("y", legendData[0].y + 3)
        .attr("text-anchor", "end")
        .text(function(d) { if(d == neighborhood) return d; }) 

    legendText.exit().remove(); 
    
}


// Function for adding checkboxes with request types
function checkboxes() {

    // Set color scale for when the checkboxes are toggled
    var color = d3.scale.category20()
	.domain(requesttypes)
    
    // Now add a checkbox for each request type in the data
    requesttypes.forEach(function(d, i) {

	var id = d.replace(' ', '').replace(/\//g, ''); 
	var h = d.charAt(0).toUpperCase() + d.slice(1);

	// Append an <li> following the structure of the <li>s here: http://bootsnipp.com/snippets/featured/material-design-switch
	$("#requestlist").append('<li class="list-group-item">' + h + 
				 '<div class="material-switch pull-right"><input id="' + id +'" type="checkbox"/>' + 
				 '<label for="' + id + '" class="label-default"></label></div></li>'
				)

	
	$('.material-switch > #' + id + '+ label').css('background', color(d))

	if(id == "All") { $('#All').prop('checked', true); }; 
	
    })
}


// Listen to request type selections
$(document.body).on('click', 'input[type="checkbox"]', function () {

    var checkedtypes = []; 
    var id = this.id;

    if(id != "selectall") { $('#selectall').prop('checked', false) };
    if(id != "deselectall") { $('#deselectall').prop('checked', false) }; 
        
    $('input[type="checkbox"]').each(function(i) {

	// Select/deselect if necessary
	if(id == "selectall") {
	    if(this.id != "deselectall") $(this).prop('checked', true); 
	} else if (id == "deselectall") {
	    if(this.id != "deselectall") $(this).prop('checked', false); 
	}

	// Push selected request category to an array
	if(this.checked) {
	    checkedtypes.push(requesttypes[i]); 
	}
    });

    // Send to the graphing function
    lineGraph(neighName, checkedtypes);
})


// Function for deselecting all selected request types except "All" in
// the list of possible selections when the user searches for a new
// neighborhood

function clearCheckList() {

    $('input[type="checkbox"]').each(function() {
	if(this.id != "All") $(this).prop('checked', false); 	
    }); 
    
}
