
// Version 2: display stacked bars in different colors 

// Width, height, and margins 
var margin = {top: 40, right: 25, bottom: 35, left: 45},
    width = 700 - margin.right - margin.left, 
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
    xAxis = d3.svg.axis().scale(xScale);  

// Add bottom and top x axes 
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis.orient("bottom"));

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (0 - 3) + ")")
    .call(xAxis.orient("top"));

// Add x-axis label
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.bottom - 5)
    .text("number of earths required");


// Read data
d3.csv("data/gfn-cleaned.csv", function(data) {

    // Map variables in data (e.g., convert to numeric)
    var footprint = data.map(function(d) {

	return {
	    country: d.country,
	    pop: +d.pop, 
	    builtupland: +d.builtupland, 
	    carbon: +d.carbon, 
	    cropland: +d.cropland, 
	    fish: +d.fish, 
	    forestprod: +d.forestprod, 
	    grazing: +d.grazing,
	    totfootprint: +d.totfootprint, 
	    noearths: +d.noearths
	};

    });

    // Keep countries with at least 1 million people
    footprint = footprint.filter(function(d) { return d.pop >= 1; }); 
    
    // Sort data according to ecological footprint
    footprint = footprint.sort(function(a, b) {
        return d3.descending(a.noearths, b.noearths);
    });

    // Convert data from wide to long format (two keys: country and type of footprint)
    // 'val' is proportional to how much of the total a given type accounts for
    // 'sumPrev' gives the sum of previous values in a country, i.e., the starting position for 'val'
    var footprintLong = []; // Array to hold long data
    var types = ["carbon", "cropland", "grazing", "forestprod", "fish", "builtupland"]; // Types of footprint
    
    footprint.forEach(function(d, j) {

	var sumPrev = 0; 
	types.forEach(function(v, i) {

	    var val = (d[v] / d.totfootprint) * d.noearths;
	    var row = {
		j: j,
		i: i,
		country: d.country,
		type: v,
		val: val,
		start: sumPrev,
		noearths: d.noearths
	    };
	    
	    footprintLong.push(row);
	    sumPrev = sumPrev + val;
	    
	});
	
    });

    // Pass data to a data visualization function
    visualizeData(footprintLong); 
    
}); 


function visualizeData(data) {

    // Get number of countries ('j' in last observation)
    var nocty = data[data.length - 1].j + 1;

    // Set colors for each type
    var color = d3.scale.ordinal()
	.domain(["carbon", "cropland", "grazing", "forestprod", "fish", "builtupland"])
	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"])
    
    // Add the bars using general update pattern 
    var bars = svg.selectAll("rect")
	.data(data)
        .enter().append("rect")
	.attr("y", function(d) { return d.j * (height / nocty); })
	.attr("height", height / nocty - barPadding)
	.attr("x", function(d) { return xScale(d.start) })
	.attr("width", function(d) { return xScale(d.val) })
        .style("fill", function(d) { return color(d.type); })

}



