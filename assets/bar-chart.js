function barChart(id, data) {
  var element = document.querySelector(id);

  var margin = { top: 50, right: 75, bottom: 75, left: 50 };
  var width = element.offsetWidth - margin.left - margin.right;
  var height = Math.min(width + 90, window.innerHeight - margin.top - margin.bottom - 20);

  var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

  var x1 = d3.scale.ordinal();

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x0)
    .tickSize(0)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(function(d) { return d + '%' });

  var svg = d3.select(id)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var metricsNames = data.map(function(d) {
    return d.metric;
  });
  var groupNames = data[0].values.map(function(d) {
    return d.group;
  });

  x0.domain(metricsNames);
  x1.domain(groupNames).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(data, function(metric) {
    return d3.max(metric.values, function(d) {
      return d.value;
    });
  })]);

  svg.append("g")
    .attr("class", "x axis")
    .style('opacity','0')
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxis)
    .selectAll(".tick text")
    .attr("y", "5px")
    .call(wrap, x0.rangeBand())
    .select();

  svg.append("g")
    .attr("class", "y axis")
    .style('opacity','0')
    .call(yAxis)
    .append("text")
    .attr("y", "-1rem")
    .style("text-anchor", "middle")
    .style('font-weight','bold')
    .text("Score");

  svg.select('.y')
    .transition()
    .duration(500)
    .delay(1300)
    .style('opacity','1');

  svg.select('.x')
    .transition()
    .duration(500)
    .delay(1300)
    .style('opacity','1');

  var slice = svg.selectAll(".slice")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "g")
    .attr("transform", function(d) {
      return "translate(" + x0(d.metric) + ", 0)";
    });

  const tooltip = d3.select("body")
    .append("div")
    .attr("class","d3-tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("padding", "15px")
    .style("background", "rgba(0,0,0,0.6)")
    .style("border-radius", "5px")
    .style("color", "#fff")
    .text("a simple tooltip");

  slice.selectAll("rect")
    .data(function(d) {
      return d.values;
    })
    .enter().append("rect")
    .attr("width", x1.rangeBand())
    .attr("x", function(d) {
      return x1(d.group);
    })
    .style("fill", function(d) {
      return color(d.group);
    })
    .attr("y", function(d) {
      return y(0);
    })
    .attr("height", function(d) {
      return height - y(0);
    })
    .on("mouseover", function(d) {
      tooltip.html(`${d.label || d.group}: ${d.value}%`).style("visibility", "visible");
      d3.select(this).style("fill", d3.rgb(color(d.group)).darker(2));
    })
    .on("mousemove", function() {
      tooltip
        .style("top", (event.pageY - 10) + 'px')
        .style("left", (event.pageX + 10) + 'px')
    })
    .on("mouseout", function(d) {
      tooltip.html('').style("visibility", "hidden");
      d3.select(this).style("fill", color(d.group));
    });

  slice.selectAll("rect")
    .transition()
    .delay(function (d) {
      return Math.random() * 1000;
    })
    .duration(1000)
    .attr("y", function(d) {
      return y(d.value);
    })
    .attr("height", function(d) {
      return height - y(d.value);
    });

  // Neat little function that wraps x-axis ticks onto multiple lines
  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this);
      var words = text.text().split(/\s+/).reverse();
      var word;
      var line = [];
      var lineNumber = 0;
      var lineHeight = 1.1;
      var y = text.attr("y");
      var dy = parseFloat(text.attr("dy"));
      var tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
}