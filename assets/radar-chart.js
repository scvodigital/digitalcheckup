/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////

function radarChart(id, data, options) {
  var cfg = {
    w: 600,				//Width of the circle
    h: 600,				//Height of the circle
    margin: {top: 5, right: 5, bottom: 5, left: 5}, //The margins of the SVG
    levels: 4,				//How many levels or inner circles should there be drawn
    maxValue: 0, 			//What is the value that the biggest circle will represent
    labelFactor: 1.2, 	//How much farther than the radius of the outer circle should the labels be placed
    wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
    opacityArea: 0.25, 	//The opacity of the area of the blob
    dotRadius: 10, 			//The size of the colored circles of each blog
    opacityCircles: 0, 	//The opacity of the circles of each blob
    strokeWidth: 3, 		//The width of the stroke around each blob
    roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
    color: d3.scale.category10()	//Color function
  };

  //Put all of the options into a variable called cfg
  if('undefined' !== typeof options){
    for(var i in options){
      if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
    }//for i
  }//if

  //If the supplied maxValue is smaller than the actual one, replace by the max in the data
  var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i) {
    return d3.max(i.map(function(o) {
      return o.value;
    }));
  }));
  var allAxis = (data[0].map(function(i, j){
    return i.axis;
  }));	//Names of each axis
  var total = allAxis.length;					      //The number of different axes
  var radius = Math.min(cfg.w/2, cfg.h/2); 	//Radius of the outermost circle
  var Format = d3.format('%');			 	      //Percentage formatting
  var angleSlice = Math.PI * 2 / total;		  //The width in radians of each "slice"

  //Scale for the radius
  var rScale = d3.scale.linear()
    .range([0, radius])
    .domain([0, maxValue]);

  //Remove whatever chart with the same id/class was present before
  d3.select(id).select("svg").remove();

  //Initiate the radar chart SVG
  var svg = d3.select(id).append("svg")
    .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
    .attr("class", "radar"+id);

  //Append a g element
  var g = svg.append("g")
    .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

  //Wrapper for the grid & axes
  var axisGrid = g.append("g").attr("class", "axisWrapper");

  //Draw the background circles
  axisGrid.selectAll(".levels")
    .data(d3.range(1,(cfg.levels+1)).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", function(d, i){
      return radius/cfg.levels*d;
    })
    .style("fill", "#B8B8B8")
    .style("stroke", "#B8B8B8")
    .style("fill-opacity", cfg.opacityCircles);

  //Create the straight lines radiating outward from the center
  var axis = axisGrid.selectAll(".axis")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "axis");

  //Append the lines
  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function(d, i){
      return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2);
    })
    .attr("y2", function(d, i){
      return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2);
    })
    .attr("class", "line")
    .style("stroke", "#B8B8B8")
    .style("stroke-width", "1px");

  //Append the labels at each axis
  axis.append("text")
    .attr("class", "legend")
    .style("font-size", "0.9rem")
    .style("font-variant", "all-small-caps")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", function(d, i){
      return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2);
    })
    .attr("y", function(d, i){
      return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2);
    })
    .text(function(d){return d})
    .call(wrap, cfg.wrapWidth);

  /////////////////////////////////////////////////////////
  ///////////// Draw the radar chart blobs ////////////////
  /////////////////////////////////////////////////////////

  //The radial line function
  var radarLine = d3.svg.line.radial()
    .interpolate("linear-closed")
    .radius(function(d) {
      return rScale(d.value);
    })
    .angle(function(d, i) {
      return i*angleSlice;
    });

  if (cfg.roundStrokes) {
    radarLine.interpolate("cardinal-closed");
  }

  //Create a wrapper for the blobs
  var blobWrapper = g.selectAll(".radarWrapper")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "radarWrapper");

  //Append the backgrounds
  blobWrapper.append("path")
    .attr("class", "radarArea")
    .attr("d", function(d, i) {
      return radarLine(d);
    })
    .style("fill", function(d, i) {
      return cfg.color(i);
    })
    .style("fill-opacity", function(d, i) {
      return cfg.fillOpacity(i);
    });

  //Create the outlines
  blobWrapper.append("path")
    .attr("class", "radarStroke")
    .attr("d", function(d,i) {
      return radarLine(d);
    })
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke-dasharray", function(d, i) {
      return cfg.strokeStyle(i);
    })
    .style("stroke", function(d, i) {
      return cfg.color(i);
    })
    .style("fill", "none");

  //Append the circles
  blobWrapper.selectAll(".radarCircle")
    .data(function(d, i) {
      return d;
    })
    .enter().append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr("cx", function(d, i){
      return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2);
    })
    .attr("cy", function(d, i){
      return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2);
    })
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke-dasharray", function(d, i, j) {
      return cfg.strokeStyle(j);
    })
    .style("stroke", function(d, i, j) {
      return cfg.color(j);
    })
    .style("fill", function(d, i, j) {
      return cfg.dotColor(j);
    })
    .style("fill-opacity", 1);

  //Taken from http://bl.ocks.org/mbostock/7555321
  //Wraps SVG text
  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.4, // ems
          y = text.attr("y"),
          x = text.attr("x"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
}