var runners, path;
var svg;
var timeScale = 30;
var timeConvert = 1000/3600;
var useData;

$('#timeScale').val(timeScale.toString());
function hashCode(str) { // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
} 

function intToRGB(i){
  var c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

var getTime=function(d) {
  return (+d.Min)*60+(+d.Sec);
};

function ready(error, xml) {

  //Adding our svg file to HTML document
  var importedNode = document.importNode(xml.documentElement, true);
  d3.select("#pathAnimation").node().appendChild(importedNode);

  svg = d3.select("svg");
  path = svg.select("path#wiggle");
  startPoint = pathStartPoint(path);

  //runner = svg.append("runner");
  var runnersGroup = svg.selectAll("runner")
    .data(useData)
    .enter()
    .append("g")
    .attr("class", "runner");
  
  circles = runnersGroup
    .append("circle")
    .text(function(d){return d.Name;})
    .attr("r", 5)
    .style("fill", function(d,i){return intToRGB(hashCode(d.Name));})
  ;

  runnersGroup
    .append("text")
    .text(function(d){return d.Name})
    .attr("fill", "black")
//    .attr("font-size", "38px")
    .attr("dx", 10) 
    .attr("dy", -5)
    ;

  runners = svg.selectAll(".runner");
  runners
    .attr("transform", "translate(" + startPoint + ")");

  startRace();
}

//Get path start point for placing marker
function pathStartPoint(path) {
  var d = path.attr("d");
  dsplitted = d.split(" ");
  return dsplitted[1].split(",");
}

function startRace() {
  var tmp = Number($("#scaleTime").val());
  timeScale = tmp>0?tmp:timeScale;
  
  $("#scaleTime").val(timeScale);

  runners.transition()
    .duration(function(d,i){
        var t=getTime(d);
        return t*timeScale*timeConvert})
    .attrTween("transform", translateAlong(path.node()))
    .ease("linear")
    ;
}

function translateAlong(path) {
  var l = path.getTotalLength();
  return function(i) {
    return function(t) {
      var p = path.getPointAtLength((1-t)*l);
      return "translate(" + p.x + "," + p.y + ")";//Move marker
    }
  }
}

var pathYearChange = function(){
  var year = $("#pathYearCmb").val();
  useData = totalData[year];
  $(".bgmap").empty();

  queue()
    .defer(d3.xml, "/extras/gp10k-runpath.svg", "image/svg+xml")
    .await(ready);
}

$.when(allDeferred).done(function(){
  pathYearChange();
});
