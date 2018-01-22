
var margin = {top: 50.5, right: 25, bottom: 35, left: 40},
    width = 800 - margin.right,
    height = 620 - margin.top - margin.bottom;

var projection =  d3.geo.mercator()
    .center([-73.95, 40.70])
    .scale(65000)
    .translate([(width) / 2, (height)/2]);

var path = d3.geo.path()
    .projection(projection)

var svg = d3.select("#choropleth-map").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("#choropleth-map").append('div')
    .attr("class", "tooltip")
    .style("opacity", 1);

function choroplethMap(neighborhood) {

    var color = d3.scale.threshold()
	.domain([17, 21, 25])
	.range(["#edf8fb","#b3cde3","#8c96c6","#88419d"]);

    var blocks = svg.selectAll("path")
	.data(neighborhoods.features);

    blocks.attr("class", "blocks")
        .transition()
        .each("end", pulse);

    blocks.enter().append("path")
	.attr("d", path)
        .attr("class", "blocks")
	.attr("stroke", "#fff")
        .attr("stroke-width", 1)
    	.style("fill", function(d) {
	    var value = d.properties.avgresptime;
	    if (value) {
		return color(value);
	    } else {
		return "#fff";
	    }
	});

    // Function for making selected neighborhood pulsate
    function pulse() {
	blocks
	    .filter(function(d) { return d.properties.neighborhood == neighborhood; })
	    .transition()
	    .duration(800)
	    .attr("stroke-width", 3.5)
	    .ease('sine')
	    .transition()
	    .duration(300)
	    .attr('stroke-width', 0)
	    .ease('sine')
	    .each("end", pulse);
    }


    // Add a pointer, a curved line pointing to the neighborhood
    var sval = [110, 0]; // starting values for line relative to svg

    var projectedCentroids = [];
    neighborhoods.features.forEach(function(d) {

	// Get and project centroid for each neighborhood
	// Pointer will end here
	var c = d3.geo.centroid(d);
	projectedCentroids.push(
	    {
		'neighborhood': d.properties.neighborhood,
		'x': projection([c[0], c[1]])[0],
		'y': projection([c[0], c[1]])[1]
	    }
	);

    });

    // Use general update pattern to add the pointer
    var pointer = svg.selectAll(".pointer")
        .data(projectedCentroids);

    pointer
        .attr("class", "pointer")
        .style("stroke-width", function(d) {
	    return (d.neighborhood == neighborhood) ? 2 : 0;
	})

    pointer
	.enter().append("path")
        .attr("d", function(d) {
	    return "M" + sval[0] + " " + sval[1] + " C " + sval[0] + " " + sval[1] + "," +
		d.x/2 + " " + d.y*1.5 + "," + d.x + " " + d.y;
	})
        .attr("class", "pointer")
        .style("stroke-width", 0)
        .style("fill", "none")
        .style("stroke", "#000")
        .style("stroke-dasharray", "1, 2")


    pointer.exit().remove();

    // Add explanatory text
    var text = svg.selectAll("text.explain")
	.data(neighborhoods.features);

    text
	.html(function(d) {
	    if(d.properties.neighborhood == neighborhood) {

		var pcrank = d.properties.rankrt / neighborhoods.features.length,
		    pcrank = d3.round(100 * pcrank, 0),
		    rank = (pcrank > 50) ? "bottom " + (100 - pcrank) : "top " + pcrank;

		return "<tspan x=-2.6em dy=-0.7em>" +
		    neighborhood + " (average response time: " +
		    d3.round(d.properties.avgresptime, 1) +
		    " days) </tspan>"

	    }
	})
	.attr("class", "explain")

    text
	.enter().append("text")
        .attr("class", "explain")
	.attr("x", sval[0])
        .attr("y", sval[1])

    text.exit().remove();

    // Add legend
    var legendLabels = ["Less than 17 days", "17-21 days", "21-25 days", "More than 25 days"];

    var legcolor = d3.scale.ordinal()
	.domain(legendLabels)
	.range(color.range());

    var legend = svg.selectAll(".legend")
	.data(legendLabels, function(d) { return d })
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("y", 190)
	.attr("x", 15)
	.attr("width", 15)
	.attr("height", 15)
	.style("fill", legcolor);

    legend.append("text")
	.attr("y", 198)
	.attr("x", 35)
	.attr("dy", ".35em")
	.style("text-anchor", "start")
        .style("font-size", "9px")
	.text(function(d, i){ return legendLabels[i]; });

    // Legend title
    svg.append("text")
        .style("font-size", "10px")
        .style("font-weight", "bold")
	.attr("y", 182)
	.attr("x", 15)
        .text("Average response time")

    blocks
	.on("mouseover", mouseover)
        .on("mousemove", mousemove)
	.on("mouseout", mouseout);

    function mouseover(d) {
	d3.select(this)
	    .attr("stroke-width", 2.5)

	tooltip
	    .style("opacity", 0.9)
	    .html('<span style="font-weight: bold;">' + d.properties.neighborhood + '</span><br>' +
		  '<em> Average response time: </em>' + d3.round(d.properties.avgresptime, 1) + " days<br>" +
		  '<em> Rank: </em>' + d.properties.rankrt + " of 190 neighborhoods")
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 80) + "px");
    }

    function mousemove(d) {
	tooltip
	    .html('<span style="font-weight: bold;">' + d.properties.neighborhood + '</span><br>' +
		  '<em> Average response time: </em>' + d3.round(d.properties.avgresptime, 1) + " days<br>" +
		   '<em> Rank: </em>' + d.properties.rankrt + " of 190 neighborhoods")
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 80) + "px");
    }

    function mouseout(d) {
	d3.select(this)
	    .attr("stroke-width", 1)

	tooltip.style("opacity", 0);
    }

}
