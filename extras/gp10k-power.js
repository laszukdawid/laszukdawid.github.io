var leftBound, rightBound;
var MEN_F=true, WOMEN_F=true;
var year=$('#powerYearCmb').val();
console.log(year);

var updatedValues = function(d){return d;};

var powUnit = "W", convert = 1;
var avgPowTxt, totPowTxt;
var bulbNTxt, bulbPowTxt;

var bulbPow = 40;

d3.select('#powerYearCmb')
.on('change', function(){
  console.log(year);
  year=$('#powerYearCmb').val();
  updatedValues();
}
);

d3.select('#units')
.on('change', function() {
  var sys = d3.select(this).property('value');

  if(sys == "metric"){
    powUnit = "W"; 
    convert = 1;
  }
  else{
    powUnit = "stones times (yard / quadratic tea-time) times Queen's age"
      convert = 1.09361*62.3/6.35029;
  }

  updatedValues();
});

d3.select('#lightbulbPow')
.on('change', function() {
  bulbPow = d3.select(this).property('value');
  updatedValues();
});


$(document).on('click', '.toggle-button', function() {
  $(this).toggleClass('toggle-button-selected'); 

  var g = $('button', this).attr('id');
  if(g=="Male") MEN_F = !MEN_F;
  else WOMEN_F = !WOMEN_F;
  console.log("M " + MEN_F + "  F " + WOMEN_F);
  updatedValues();
});

var powerFunc = function(d,w){
  // avg power is:
  // P = mg eta L/t
  var m=d.Weight?+d.Weight:w;
  var g=9.81;    //
  var e=0.1;   // efficiency ~= 0.1
  var L=10000; // 10km
  var t=(+d.Min)*60 + (+d.Sec);
  return m*g*e*L/t;
}

$.when(allDeferred).done(function(){
  console.log('Loading power graph...');
  connectSlider.noUiSlider.on('update', function( values, handle, boundValues, b, handlePositions ) {

    var offset = handlePositions[handle];

    // Right offset is 100% - left offset
    if ( handle === 1 ) {
      offset = 100 - offset;
    }
    leftBound = boundValues[0];
    rightBound = boundValues[1];
    console.log("LeftValue: " + leftBound + ". RightValue: " + rightBound);

    updatedValues();
  });

  var circSVG = d3.select('#powerGraph').append('svg')
    .attr('width', 1000).attr('height', 500).attr('class','radSol');

  peopleTxt = d3.select("#people");
  avgPowTxt = d3.select("#avgPow");
  totPowTxt = d3.select("#totPow");

  bulbNTxt = d3.select("#bulbN");
  bulbPowTxt = d3.select("#bulbPow");

  updatedValues = function(){
    var _data = totalData[year];

    var mAvgW=0, fAvgW=0;
    // Sex filter
    if(!MEN_F){
      _data = _data.filter(function(d){return d.Sex!='M';});
    } else {
      mData = _data.filter(function(d){return d.Sex=='M' && d.Weight});
      mData.forEach(function(d){mAvgW += +d.Weight});
      mAvgW/=mData.length;
    }
    if(!WOMEN_F){
      _data = _data.filter(function(d){return d.Sex!='F';});
    }else{
      fData = _data.filter(function(d){return d.Sex=='F' && d.Weight});
      fData.forEach(function(d){fAvgW += +d.Weight});
      fAvgW/=fData.length;
    }

    // Age filter
    _data = _data.filter(function(d){return (d.Age>=leftBound && d.Age<= rightBound)});

    var totPow = 0;
    _data.forEach(function(d){
      totPow += powerFunc(d,d.Sex=='M'?mAvgW:fAvgW);
    });

    var nPeople = _data.length;
    var avgPow = nPeople?totPow/nPeople:0;

    var bulbN = Math.floor(totPow/bulbPow)
      var nArr = d3.range(bulbN);

    console.log("Pow: " +totPow+", which are " +bulbN+" lightbulbs.");

    circSVG.selectAll('circle').data(nArr)
      .exit()
      .remove();

    circSVG.selectAll('#circles').data(nArr)
      .enter()
      .append("circle")
      .style("fill", "yellow")
      .attr("r", 2*Math.sqrt(bulbPow)).attr("cx", 20).attr("cy", 20)
      .attr('cx', function(d,i){ return 50+50*(i%16);})
      .attr('cy', function(d,i){ return 50+50*Math.floor(i/16);});

    // Convert units
    avgPow *= convert; totPow *= convert;

    //
    var l = (MEN_F?" boys":"") + ((MEN_F&&WOMEN_F)?" and":"") + (WOMEN_F?" girls":"");
    peopleTxt.text(nPeople + l);

    totPowTxt.text(totPow.toFixed(2).toString() + " " + powUnit);
    avgPowTxt.text(avgPow.toFixed(2).toString() + " " + powUnit);

    bulbNTxt.text(bulbN.toString());
    bulbPowTxt.text(bulbPow.toString());

  }

  updatedValues();
});
