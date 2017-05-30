var labels = true; // show the text labels beside individual boxplots?

var boxMargin = {top: 30, right: 50, bottom: 100, left: 90};
var  width = 900 - boxMargin.left - boxMargin.right;
var height = 400 - boxMargin.top - boxMargin.bottom;

var min = Infinity,
    max = -Infinity;
var years = [2017,2016,2015];

$.when(allDeferred).done(function(){
  console.log('Loading boxplot...');

  var data = [];

  for(var p=0; p<Object.keys(dataset).length; p++){ 
    var y=years[p];
    var d=Object.values(dataset[y]);
    data[p]=[];
    data[p][0]=y;
    data[p][1]=d;

    var tmpMax=Math.max.apply(Math,d);
    max=max<tmpMax?tmpMax:max;
    var tmpMin=Math.min.apply(Math,d);
    min=min>tmpMin?tmpMin:min;
  }

  var chart = d3.box()
    .whiskers(iqr(1.5))
    .height(height)	
    .domain([min, max])
    .showLabels(labels)
    .timeFormat(true);

  var svg = d3.select(".boxplot").append("svg")
    .attr("width", width + boxMargin.left + boxMargin.right)
    .attr("height", height + boxMargin.top + boxMargin.bottom)
    .attr("class", "box")    
    .append("g")
    .attr("transform", "translate(" +  boxMargin.left + "," + boxMargin.top + ")");

  // the x-axis
  var x = d3.scale.ordinal()	   
    .domain(data.map(function(d) {return d[0]}))
    .rangeRoundBands([0 , width], 0.7, 0.3);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  // the y-axis
  var y = d3.scale.linear()
    .domain([min, max])
    .range([height + boxMargin.top, 0 + boxMargin.top]);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(function(d){return timeFormatFunc(d);});

  // draw the boxplots	
  svg.selectAll(".box")	   
    .data(data)
    .enter().append("g")
    .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + boxMargin.top + ")"; } )
    .call(chart.width(x.rangeBand())); 


  // add a title
  svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 + (boxMargin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "18px") 
    .style("text-decoration", "underline")  
    .text("Year by year");

  // draw y axis
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text") // and text1
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-size", "16px") 
    .text("Time [s]");

  // draw x axis	
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height  + boxMargin.top + 10) + ")")
    .call(xAxis)
    .append("text")             // text label for the x axis
    .attr("x", (width / 2) )
    .attr("y",30)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .style("font-size", "16px") 
    .text("Year"); 
});

// Returns a function to compute the interquartile range.
function iqr(k) {
  return function(d, i) {
    var q1 = d.quartiles[0],
    q3 = d.quartiles[2],
    iqr = (q3 - q1) * k,
    i = -1,
    j = d.length;
    while (d[++i] < q1 - iqr);
    while (d[--j] > q3 + iqr);
    return [i, j];
  };
}

function timeFormatFunc(d){
  var m = Math.floor(d/60);
  var s = Math.floor(d%60);
  return m.toString()+"m "+s.toString().padStart(2,0)+"s";
}
