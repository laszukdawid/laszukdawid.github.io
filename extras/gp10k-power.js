var leftBound, rightBound;
var MEN_F=true, WOMEN_F=true;

var updatedValues = function(d){return d;};

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
    var m = d.Weight; // in Kg
    var g = 10;    //
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
        .attr('width', 800).attr('height', 800).attr('class','radSol');
    
    circSVG.append("defs")
            .append("circle")
                .attr("id", "bulb")
                .style("fill", "yellow")
                .attr("r", 10).attr("cx", 20).attr("cy", 20);
    
    updatedValues = function(){
        var _data = totalData['2016'];
        
        // Sex filter
        if(!MEN_F)   _data = _data.filter(function(d){ return d.Sex!='M';});
        if(!WOMEN_F) _data = _data.filter(function(d){ return d.Sex!='F';});
        
        // Age filter
        _data = _data.filter(function(d){ return (d.Age>=leftBound && d.Age<= rightBound)});
        
        var avgPow = 0;
        _data.forEach(function(d){
           avgPow += powerFunc(d);
        });
        
        var nImg = Math.floor(avgPow/100);
        var nArr = d3.range(nImg);
        
        console.log("Pow: " +avgPow+", which are " +nImg+" lightbulbs.");
        
//        circSVG.selectAll('circles').remove();

        circSVG.selectAll('use').data(nArr)
            .exit()
                .remove();
        
        circSVG.selectAll('#circles').data(nArr)
            .enter()
                .append('use')
                .attr('xlink:href', "#bulb")
                .attr('x', function(d,i){ return 50+50*(i%10);})
                .attr('y', function(d,i){ return 50+50*Math.floor(i/10);});

            ;
    }
    
    updatedValues();
});