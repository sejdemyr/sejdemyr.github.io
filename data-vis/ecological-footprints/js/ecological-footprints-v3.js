
// Version 3: Add country names and legend 

// Width, height, and margins 
var margin = {top: 25, right: 25, bottom: 35, left: 150},
    width = 700 - margin.right - margin.left, 
    height = 1500 - margin.top - margin.bottom, 
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

    // Convert data from wide to long format (with two keys: country and type of footprint)
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
    visualizeData(footprint, footprintLong);  // Note: Passing both wide and long data now
    
}); 


function visualizeData(dataWide, dataLong) {
    
    // Get number of countries 
    var nocty = dataWide.length;
    
    // Set colors for each type
    var color = d3.scale.ordinal()
	.domain(["carbon", "cropland", "grazing", "forestprod", "fish", "builtupland"])
	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"])
    
    // Add the bars 
    var bars = svg.selectAll("rect")
	.data(dataLong)
        .enter().append("rect")
	.attr("y", function(d) { return d.j * (height / nocty); })
	.attr("height", height / nocty - barPadding)
	.attr("x", function(d) { return xScale(d.start) })
	.attr("width", function(d) { return xScale(d.val) })
        .style("fill", function(d) { return color(d.type); })


    // Add y-axis labels with country names
    var yScale = d3.scale.ordinal()
	.domain(dataWide.map(function(d) { return d.country; }))
	.rangeBands([0, height]);
    
    var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.outerTickSize(0);
    
    svg.append("g")
	.attr("class", "y axis")
	.call(yAxis); 
    
    // Append a vertical line at x = 1
    svg.append("line")
	.attr("y1", 0 - 3)
	.attr("y2", height)
	.attr("x1", xScale(1))
	.attr("x2", xScale(1))
	.attr("stroke", "#000")
	.attr("stroke-width", "1")
	.attr("stroke-dasharray", "1.5,2")

    // Add a legend
    var legend = svg.selectAll(".legend")
	.data(["Carbon", "Cropland", "Grazing land", "Forest", "Fishing grounds", "Built-up land"])
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("y", 90)
	.attr("x", width - 18)
	.attr("width", 18)
	.attr("height", 18)
	.style("fill", color);

    legend.append("text")
	.attr("x", width - 24)
	.attr("y", 100)
	.attr("dy", ".35em")
	.style("text-anchor", "end")
	.text(function(d) { return d; });
    
}



