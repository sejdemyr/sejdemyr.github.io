
// Version 1: display bars -- no styling or interactivity


// Width, height, and margins 
var margin = {top: 19.5, right: 25, bottom: 35, left: 45},
    width = 500 - margin.right - margin.left, 
    height = 1300 - margin.top - margin.bottom, 
    barPadding = 1.5;

// Create the SVG container 
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set x-axis attributes 
var xScale = d3.scale.linear().domain([0, 5]).range([0, width]),
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");  

// Add the x-axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis); 

// Add x-axis label
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.bottom - 5)
    .text("number of earths required");


// Read data
d3.csv("data/gfn-cleaned.csv", function(data) {

    // Store data and convert to numeric if necessary
    var footprint = data.map(function(d) {

	return {
	    builtupland: +d.builtupland, 
	    carbon: +d.carbon, 
	    country: d.country, 
	    cropland: +d.cropland, 
	    fish: +d.fish, 
	    forestprod: +d.forestprod, 
	    gdppc: +d.gdppc, 
	    grazing: +d.grazing, 
	    hdi: +d.hdi, 
	    incomegr: d.incomegr, 
	    noearths: +d.noearths, 
	    pop: +d.pop, 
	    region: d.region
	};

    }); 

    // Keep countries with at least 1 million people
    footprint = footprint.filter(function(d) { return d.pop >= 1; }); 
    
    // Sort data according to ecological footprint
    footprint = footprint.sort(function(a, b) {
        return d3.descending(a.noearths, +b.noearths);
    });

    // Pass data to a data visualization function
    visualizeData(footprint); 
    
}); 


function visualizeData(data) {

    
    console.log(data); 

    // Add the bars using general update pattern 
    var bars = svg.selectAll("rect")
	.data(data)
        .enter().append("rect")
	.attr("y", function(d, i) { return i * (height / data.length); })
	.attr("height", height / data.length - barPadding)
	.attr("width", function(d) { return xScale(d.noearths) })

}

