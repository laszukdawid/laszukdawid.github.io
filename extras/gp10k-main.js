var totalData = {};
var dataset = {};
var diffDataset = {};

var convertToTime = function (csvData){
	var time = {};
	for(var i=0; i<csvData.length; i++){
		var item = csvData[i];
		var n = item.Name;
		var m = +item.Min;
		var s = +item.Sec;
		time[n] = m*60+s;
	};
	return time;
}


var deferred2015 = new $.Deferred();
d3.csv("/extras/run10k-2015.csv", function(csvData) {
	dataset["2015"] = convertToTime(csvData);
  totalData["2015"] = csvData;
	deferred2015.resolve();
});

var deferred2016 = new $.Deferred();
d3.csv("/extras/run10k-2016.csv", function(csvData) {
	dataset["2016"] = convertToTime(csvData);
  totalData["2016"] = csvData;
	deferred2016.resolve();
});

var deferred2017 = new $.Deferred();
d3.csv("/extras/run10k-2017.csv", function(csvData) {
	dataset["2017"] = convertToTime(csvData);
  totalData["2017"] = csvData;
	deferred2017.resolve();
});

var allDeferred = new $.Deferred();
$.when(deferred2015, deferred2016, deferred2017).done(function(){
  allDeferred.resolve();
});
