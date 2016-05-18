var leftBound, rightBound;
var MEN_F=true, WOMEN_F=true;

var updatedValues = function(d){return d;};

var powUnit = "W", convert = 1;
var avgPowTxt, totPowTxt;
var bulbNTxt, bulbPowTxt;

var bulbPow = 40;

d3.select('#units')
  .on('change', function() {
    var sys = d3.select(this).property('value');
    
    if(sys == "metric"){
        powUnit = "W"; 
        convert = 1;
    }
    else{
        powUnit = "stones (yard / quadratic tea-time) times Queen's age"
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

var powerFunc = function(d){
    // avg power is:
    // P = mg eta L/t
    var m = +d.Weight; // in Kg
    var g = 9.81;    //
    var e = 0.1;   // efficiency ~= 0.1
    var L = 10000; // 10km
    var t = (+d.Min)*60 + (+d.Sec);
    return m*g*e*L/t;
}

$.when(deferred2015, deferred2016).done(function(){
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
    
    console.log(connectSlider);
    
    var circSVG = d3.select('#powerGraph').append('svg')
        .attr('width', 600).attr('height', 400).attr('class','radSol');
    
    circSVG.append("defs")
            .append("circle")
                .attr("id", "bulb")
                .style("fill", "yellow")
                .attr("r", 10).attr("cx", 20).attr("cy", 20);
    
    peopleTxt = d3.select("#people").append("tet");
    avgPowTxt = d3.select("#avgPow").append("tet");
    totPowTxt = d3.select("#totPow").append("tet");
    
    bulbNTxt = d3.select("#bulbN").append("tet");
    bulbPowTxt = d3.select("#bulbPow").append("tet");
    
    updatedValues = function(){
        var _data = totalData['2016'];
        
        // Weight filter
        _data = _data.filter(function(d){ return d.Weight;})
        
        // Sex filter
        if(!MEN_F)   _data = _data.filter(function(d){ return d.Sex!='M';});
        if(!WOMEN_F) _data = _data.filter(function(d){ return d.Sex!='F';});
        
        // Age filter
        _data = _data.filter(function(d){ return (d.Age>=leftBound && d.Age<= rightBound)});
        
        var totPow = 0;
        _data.forEach(function(d){
           totPow += powerFunc(d);
        });
        
        var nPeople = _data.length;
        var avgPow = nPeople?totPow/nPeople:0;

        var bulbN = Math.floor(totPow/bulbPow)
        var nArr = d3.range(bulbN);
        
        console.log("Pow: " +totPow+", which are " +bulbN+" lightbulbs.");

        circSVG.selectAll('use').data(nArr)
            .exit()
                .remove();
        
        circSVG.selectAll('#circles').data(nArr)
            .enter()
                .append('use')
                .attr('xlink:href', "#bulb")
                .attr('x', function(d,i){ return 50+50*(i%10);})
                .attr('y', function(d,i){ return 50+50*Math.floor(i/10);});
        
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