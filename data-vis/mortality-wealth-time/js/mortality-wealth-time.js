
// Various accessors that specify the four dimensions of data to visualize.
function x(d) { return d.gdppc; }
function y(d) { return d.u5mr; }
function radius(d) { return d.u5deaths; }
function color(d) { return d.region; }
function key(d) { return d.country; }

// Chart dimensions.
var margin = {top: 19.5, right: 25, bottom: 35, left: 39.5},
    width = 960 - margin.right,
    height = 500 - margin.top - margin.bottom;

// Various scales
var regions = ["Latin America and the Caribbean",
	       "East Asia and Pacific",
	       "Industrialized countries",
	       "Sub-Saharan Africa",
	       "South Asia",
	       "CEE/CIS",
	       "Middle East and North Africa"]


var xScale = d3.scale.log().domain([100, 125000]).range([0, width]),
    yScale = d3.scale.linear().domain([0, 350]).range([height, 0]),
    radiusScale = d3.scale.sqrt().domain([12, 4338317]).range([2.5, 35]),
    colorScale = d3.scale.ordinal()
    .domain(regions)
    .range(["#ff7f0e", "#9467bd", "#2ca02c", "#d62728", "#1f77b4", "#e7ba52", "#843c39"])


// The x & y axes.
var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(",d")),
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// Create the SVG container and set the origin.
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add the x-axis.
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Add the y-axis.
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// Add an x-axis label.
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.bottom - 5)
    .text("GDP per capita, inflation-adjusted (dollars)");

// Add a y-axis label.
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("under-five mortality rate (deaths per 1,000 live births)");

// Add the year label; the value is set on transition.
var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", 90)
    .attr("x", width+24)
    .text(1990);

var tooltip = d3.select("#tooltip")
    .style("top", (height-160)+"px")
    .style("left",  (width-margin.left-255)+"px")
    .style("opacity", 0);

$(document).ready(function() {
    $("#tooltip").removeClass("hidden");
});  

// Load the data.
d3.csv("data/u5mr-gdp-combined.csv", function(mortality) {

    // Read data from csv: all and constant for 1990/2015 (used for labels)
    var allData = readData();
    var constantData = joinConstant();
    
    // Add a dot per nation. Initialize the data at 1990, and set the colors.
    var dot = svg.append("g")
	.attr("class", "dots")
	.selectAll(".dot")
	.data(interpolateData(1990))
	.enter().append("circle")
	.attr("class", "dot")
	.attr("opacity", 1)
	.call(position)
	.sort(order)

    dot
	.on("mouseover", mouseover)
	.on("mouseout", mouseout);

    function mouseover(d) {
	d3.select(this)
	    .attr("opacity", 0.95)
	    .transition()
	    .ease("linear") 
            .duration(200)
	    //.ease("cubic-in-out") 
            .attr("r", d.radius * 1.1)
	    .transition()
	    //.duration(400)
	    .ease("linear") 
            .attr("r", d.radius);

	//Update the tooltip values		   
	tooltip.select("#country").text(d.country);
	tooltip.select("#u5mr1").text(d3.round(d.u590, 0));
	tooltip.select("#u5mr2").text(d3.round(d.u515, 0));
	tooltip.select("#u5mr3").text(d3.format("+.0%")((d.u515 - d.u590)/d.u590));
	tooltip.select("#u5d1").text(d3.format(",")(d.u5d90));
	tooltip.select("#u5d2").text(d3.format(",")(d.u5d15));
	tooltip.select("#u5d3").text(d3.format("+.0%")((d.u5d15 - d.u5d90)/d.u5d90));
	tooltip.select("#gdp1").text(d3.format(",")(d.gdppc90));
	tooltip.select("#gdp2").text(d3.format(",")(d.gdppc15));
	tooltip.select("#gdp3").text(d3.format("+.0%")((d.gdppc15 - d.gdppc90)/d.gdppc90));
	
	//Show the tooltip
	d3.select("#tooltip").style("opacity", 100);	
    }
    
    function mouseout(d) {
	d3.select(this)
	    .transition()
	    .ease("cubic-in-out") 
	    .attr("opacity", 1)
	    .transition()
	    .ease("linear") 
	    .duration(170)
	    //.ease("cubic-in-out") 
            .attr("r", d.radius);
    }
    
    // Add an overlay for the year label.
    var box = label.node().getBBox();
    
    var overlay = svg.append("rect")
	.attr("class", "overlay")
	.attr("x", box.x)
	.attr("y", box.y)
	.attr("width", box.width)
	.attr("height", box.height)
	.on("mouseover", enableInteraction);
    
    // Start a transition that interpolates the data based on year.
    svg.transition()
	.duration(12000)
	.ease("linear")
	.tween("year", tweenYear)
	.each("end", enableInteraction);
    
    // Positions the dots based on data and adds colors 
    function position(dot) {
	dot .attr("cx", function(d) { return xScale(x(d)); })
	    .attr("cy", function(d) { return yScale(y(d)); })
	    .attr("r", function(d) { return d.radius; })
	    .style("fill", function(d) { return colorScale(color(d)); })
    }
    
    // Defines a sort order so that the smallest dots are drawn on top.
    function order(a, b) {
	return radius(b) - radius(a);
    }
    
    // After the transition finishes, you can mouseover to change the year.
    function enableInteraction() {
	var yearScale = d3.scale.linear()
	    .domain([1990, 2015])
	    .range([box.x + 10, box.x + box.width - 10])
	    .clamp(true);
	
	// Cancel the current transition, if any.
	svg.transition().duration(0);
	
	overlay
	    .on("mouseover", mouseover)
	    .on("mouseout", mouseout)
	    .on("mousemove", mousemove)
	    .on("touchmove", mousemove);
	
	function mouseover() {
	    label.classed("active", true);
	}
	
	function mouseout() {
	    label.classed("active", false);
	}
	
	function mousemove() {
	    displayYear(yearScale.invert(d3.mouse(this)[0]));
	}
    }
    
    // Tweens the entire chart by first tweening the year, and then the data.
    // For the interpolated data, the dots and label are redrawn.
    function tweenYear() {
	var year = d3.interpolateNumber(1990, 2015);
	return function(t) { displayYear(year(t)); };
    }
    
    // Updates the display to show the specified year.
    function displayYear(year) {
	dot.data(interpolateData(year)).call(position).sort(order);
	label.text(Math.round(year));
    }

    
    // Reads and maps the csv file
    function readData() {
	 return mortality.map(function(d) {
	    return {
		country: d.country,
		region: d.region,
		year: +d.year, 
		gdppc: +d.gdppc,
		u5mr: +d.u5mr,
		u5deaths: +d.u5deaths,
		radius: radiusScale(+d.u5deaths)
	    };
	});
    }

    // Reads information for label 
    function readConstant(year) {
	var data = mortality.filter(function(d){
            if(+d.year != year){
		return false;
            }
	    d.country = d.country;
            d.u5mr = +d.u5mr;
	    d.u5deaths = +d.u5deaths;
            return true;
	});
	return data.map(function(d) {
	    if(year === 1990) {
		return {
		    country: d.country,
		    u590: +d.u5mr,
		    u5d90: +d.u5deaths,
		    //gdppc90: d3.round(+d.gdppc, 0)
		}
	    } else if(year === 2015) {
		return {
		    country: d.country,
		    u515: +d.u5mr,
		    u5d15: +d.u5deaths,
		    //gdppc15: d3.round(+d.gdppc, 0)
		}
	    };
	});
    };

    function joinConstant(contentId) {
	var data90 = readConstant(1990, contentId),
	    data15 = readConstant(2015, contentId);
	return _.merge(data90, data15)		
	}

    // Interpolates the dataset for the given (fractional) year.
    function interpolateData(year) {
	var yrRounded = Math.floor(year); 
	
	// Find subsets with given years
	var sub1 = allData.filter(function(d) { return d.year == yrRounded; }),
	    sub2 = allData.filter(function(d) { return d.year == yrRounded + 1; });
	
	// Interpolate 
	var interp = d3.interpolateObject(sub1, sub2)(year - yrRounded);
	
	// Move from object of objects --> array of objects
	var interpArray = $.map(interp, function(value, index) {
	    return [value];
	});
	
	// Get a few values from 1990 and 2015 and join back into array	
	return _.merge(interpArray, constantData)
    }

    
});








