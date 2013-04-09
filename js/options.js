var defaultLG = {
	lgSchedule: [
		{abbr:'m', day:'Monday', woValue:'true', rtValue:'false'}, 
		{abbr:'t', day:'Tuesday', woValue:'false', rtValue:'true'}, 
		{abbr:'w', day:'Wednesday', woValue:'true', rtValue:'false'}, 
		{abbr:'th', day:'Thursday', woValue:'false', rtValue:'true'}, 
		{abbr:'f', day:'Friday', woValue:'true', rtValue:'false'}, 
		{abbr:'sa', day:'Saturday', woValue:'false', rtValue:'true'}, 
		{abbr:'su', day:'sunday', woValue:'false', rtValue:'true'}
	],
	woCal: undefined,
	rtCal: undefined,
	woMacro: [{type:'protein', value:undefined}, {type:'carbs',value:undefined}, {type:'fat',value:undefined}],
	rtMacro: [{type:'protein', value:undefined}, {type:'carbs',value:undefined}, {type:'fat',value:undefined}],
	gender: 'm',
	heightFoot: undefined,
	heightInch: undefined,
	weight: undefined,
	age: undefined,
	activity: undefined
};
var defaultLGtom = {
	lgSchedule: [
		{abbr:'m', day:'Monday', woValue:'true', rtValue:'false'}, 
		{abbr:'t', day:'Tuesday', woValue:'false', rtValue:'true'}, 
		{abbr:'w', day:'Wednesday', woValue:'true', rtValue:'false'}, 
		{abbr:'th', day:'Thursday', woValue:'false', rtValue:'true'}, 
		{abbr:'f', day:'Friday', woValue:'true', rtValue:'false'}, 
		{abbr:'sa', day:'Saturday', woValue:'false', rtValue:'true'}, 
		{abbr:'su', day:'sunday', woValue:'false', rtValue:'true'}
	],
	woCal: 1984,
	rtCal: 1543,
	woMacro: [{type:'protein', value:180}, {type:'carbs',value:237}, {type:'fat',value:35.1}],
	rtMacro: [{type:'protein', value:180}, {type:'carbs',value:51.4}, {type:'fat',value:68.6}],
	gender: 'm',
	heightFoot: 5,
	heightInch: 11,
	weight: 180,
	age: 33,
	activity: 0
};
$(document).ready(function(){
	chrome.storage.local.get('lg', function(items) {
		//console.log('lg: ',items.lg);
		//var lg = JSON.parse(items.lg) || defaultLGtom;
		var lg = $.parseJSON(items.lg) || defaultLGtom;
		//console.log(lg);
		ko.applyBindings(new LeangainsMFPModel(lg));
	});

	chrome.storage.onChanged.addListener(function(changes, namespace) {
	  for (key in changes) {
	    var storageChange = changes[key];
	    console.log('Storage key "%s" in namespace "%s" changed. ' +
	                'Old value was "%s", new value is "%s".',
	                key,
	                namespace,
	                storageChange.oldValue,
	                storageChange.newValue);
	  }
	});

});

ko.extenders.required = function(target, overrideMessage) {
    //add some sub-observables to our observable
	//console.log(target());
    target.hasError = ko.observable();
    target.validationMessage = ko.observable();
 
    //define a function to do validation
    function validate(newValue) {
    	var rx = new RegExp(/^\d+(?:\.\d{1,2})?$/);
    	var myRegexp = /^\d+(?:\.\d{1,2})?$/;
    	var match = myRegexp.exec(newValue);
    	if (match != null) {
    		console.log(match);
    		console.log(parseFloat(match[0]).toFixed(2));
    	}
       	target.hasError(rx.test(newValue) ? 'success' : 'error');
       	target.validationMessage(rx.test(newValue) ? "" : overrideMessage || "This field is required");
    }
 
    //initial validation
    validate(target());
 
    //validate whenever the value changes
    target.subscribe(validate);
 
    //return the original observable
    return target;
};

function womacro(type, value, thisself) {
	var self = this;
	self.type = type;
	self.value = ko.observable(value).extend({ required: "" });
	if(type === 'protein') thisself.woProtein = ko.observable(value).extend({ required: "" });
	if(type === 'carbs') thisself.woCarbs = ko.observable(value).extend({ required: "" });
	if(type === 'fat') thisself.woFat = ko.observable(value).extend({ required: "" });
	//self.value = ko.observable(value).extend({ required: "" });
}

function rtmacro(type, value, thisself) {
	var self = this;
	self.type = type;
	self.value = ko.observable(value).extend({ required: "" });
	if(type === 'protein') thisself.rtProtein =  ko.observable(value).extend({ required: "" });
	if(type === 'carbs') thisself.rtCarbs =  ko.observable(value).extend({ required: "" });
	if(type === 'fat') thisself.rtFat =  ko.observable(value).extend({ required: "" });
	//self.value = ko.observable(value).extend({ required: "" });
}

function macro(type, value) {
	var self = this;
	self.type = type;
	self.value = ko.observable(value).extend({ required: "" });
}


function LeangainsMFPModel(lg) {
	console.log(lg);
	var self = this;
	self.lgSchedule = ko.observableArray(lg.lgSchedule);

	self.woCal = ko.observable(lg.woCal).extend({ required: "" });
	self.rtCal = ko.observable(lg.rtCal).extend({ required: "" });

	var newWoMacro = [];
	for(var i=0;i<lg.woMacro.length;i++) {
		// console.log('loop #', i);
		// console.log('for macro', lg.woMacro[i]);
		// console.log(lg.woMacro[i].type, lg.woMacro[i].value);
		// newWoMacro.push( new womacro(lg.woMacro[i].type, lg.woMacro[i].value, self) );
		newWoMacro.push( new macro(lg.woMacro[i].type, lg.woMacro[i].value) );
	}

	var newRtMacro = [];
	for(var i=0;i<lg.rtMacro.length;i++) {
		// console.log('loop #', i);
		// console.log('for macro', lg.rtMacro[i]);
		// console.log(lg.rtMacro[i].type, lg.rtMacro[i].value);
		// newRtMacro.push( new rtmacro(lg.rtMacro[i].type, lg.rtMacro[i].value, self) );
		newRtMacro.push( new macro(lg.rtMacro[i].type, lg.rtMacro[i].value) );
	}


	self.woMacro = ko.observableArray(newWoMacro);
	self.rtMacro = ko.observableArray(newRtMacro);
	//self.gender = ko.observable('m');
	// self.fieldStatus = ko.computed({
	// 	read: function(val) {
	// 		console.log('read val: ',self.woCal());
	// 	},
	// 	write: function(val) {
	// 		console.log('write val: ', val);
	// 	}
	// });

	self.gender = ko.observable(lg.gender);

	self.heightFoot = ko.observable(lg.heightFoot).extend({ required: "" });
	self.heightInch = ko.observable(lg.heightInch).extend({ required: "" });
	self.heightCM = ko.computed(function(){
		//console.log(self, self.heightFoot(), self.heightInch());
		var cm_height = (parseFloat(self.heightFoot())*12 + parseFloat(self.heightInch()) ) * 2.54;
		return !isNaN(cm_height) ? cm_height.toFixed(2) : undefined;
	});

	self.weight = ko.observable(lg.weight).extend({ required: "" });
	self.weightKG = ko.computed(function(){
		var kg_weight = parseFloat(self.weight())/2.2;
		return !isNaN(kg_weight) ? kg_weight.toFixed(2) : undefined;
	});

	self.age = ko.observable(lg.age).extend({ required: "" });

	self.activityOptions = ko.observableArray([
		{type:"Sedentary", value:0, multiplier: 1.2}, 
		{type:"Lightly Active", value:1, multiplier: 1.375}, 
		{type:"Moderately Active", value:2, multiplier: 1.55}, 
		{type:"Very Active", value:3, multiplier: 1.725}, 
		{type:"extremely Active", value:4, multiplier: 1.9}
	]);
	self.activity = ko.observable(lg.activity).extend({ required: "" });

	self.bmr = ko.computed(function(){
		//console.log(self.weightKG(), self.heightCM(), self.age(), self.gender());
		var cal_variable = (self.gender() == 'm') ? 5 : -161;
		var weight_ready = self.weightKG() !== undefined ? true : false;
		var height_ready = self.heightCM() !== undefined ? true : false;
		var age_ready = self.age() !== undefined && self.age() !== '' ? true : false;
		//console.log(weight_ready, height_ready, age_ready, cal_variable);
		if (weight_ready && height_ready && age_ready)
		return Math.floor( (10*self.weightKG())+(6.25*self.heightCM())-(5*self.age())+(cal_variable) );			
	});

	self.tdee = ko.computed(function(){
		//console.log('tdee read');
		var activityObject = self.activityOptions()[self.activity()];
		if(activityObject !== undefined) {
			//console.log(self.bmr(), activityObject.multiplier);
			return !isNaN(self.bmr()) ? Math.floor(self.bmr()*activityObject.multiplier) : undefined;
		}
	});

	self.twee = ko.computed(function(){
		return !isNaN(self.tdee()) ? self.tdee()*7 : undefined;
	});

	self.weekCal = ko.computed(function(){
		var wo_days = 0
		var rt_days = 0;
		ko.utils.arrayForEach(self.lgSchedule(), function(item){
			if (item.woValue === 'true') wo_days++;
			if (item.rtValue === 'true') rt_days++;
		});
		//console.log(self.woCal(), wo_days, self.rtCal() ,rt_days, self.woCal()*wo_days, self.rtCal()*rt_days);
		if (self.woCal() !== undefined && self.rtCal() !== undefined) {
			return self.woCal()*wo_days + self.rtCal()*rt_days;
		}
	});

	self.weekDiff = ko.computed(function(){
		return !isNaN(self.weekCal()) ? self.weekCal()-self.twee() : undefined;
	});
	self.weekChange = ko.computed(function(){
		return !isNaN(self.weekDiff()) ? parseFloat(self.weekDiff())/3500 : undefined;
	});

	// self.rtChartProtein = ko.observable();
	// self.rtChartCarbs = ko.observable();
	// self.rtChartFat = ko.observable();
	self.rtChart = ko.computed(function(){
		console.log('in rtChart:', self.rtMacro());
		// ko.utils.arrayForEach(self.rtMacro(), function(item){
		// 	console.log(item.type+': '+ item.value);
		// 	if(item.type === 'protein') {
		// 		self.rtChartProtein(item.value);
		// 	}
		// 	if(item.type === 'carbs') {
		// 		self.rtChartCarbs(item.value);
		// 	}
		// 	if(item.type === 'fat') {
		// 		self.rtChartFat(item.value);
		// 	}
		// });
		//console.log(self.woChartProtein(),self.woChartCarbs(),self.woChartFat());
		// var macro = ko.utils.arrayMap(self.rtMacro(), function(item) {
	 //        return item.value();
	 //    });
		return make_pie_chart(
					'rt-pie', 
					self.rtMacro()[0].value(), 
					self.rtMacro()[1].value(), 
					self.rtMacro()[2].value(), 
					'Rest Ratio'
				);
		});

	// self.woChartProtein = ko.observable();
	// self.woChartCarbs = ko.observable();
	// self.woChartFat = ko.observable();
	self.woChart = ko.computed(function(){
		console.log('in woChart:', self.woMacro());
		// ko.utils.arrayForEach(self.woMacro(), function(item){
		// 	//console.log(item.type+': '+ item.value);
		// 	if(item.type === 'protein') {
		// 		self.woChartProtein(item.value);
		// 	}
		// 	if(item.type === 'carbs') {
		// 		self.woChartCarbs(item.value);
		// 	}
		// 	if(item.type === 'fat') {
		// 		self.woChartFat(item.value);
		// 	}
		// });
		//console.log(self.woChartProtein(),self.woChartCarbs(),self.woChartFat());
		return make_pie_chart(
					'wo-pie', 
					self.woMacro()[0].value(), 
					self.woMacro()[1].value(), 
					self.woMacro()[2].value(), 
					'Workout Ratio'
				);
	});

	self.chart = ko.computed(function(){
		//console.log(self.woChart() && self.rtChart());
		return self.woChart() && self.rtChart();
	});

	self.saveData = ko.computed({
		read: function(){},
		write: function(value){
			// console.log('value: ',  ko.toJSON(value));
			 var rawData = ko.toJSON(value);
			// delete rawData.activityOptions;
			// delete rawData.bmr;
			// delete rawData.tdee;
			// delete rawData.twee;
			// delete rawData.weekCal;
			// delete rawData.weekDiff;
			// delete rawData.weekChange;
			// console.log('rawData: ', rawData);
			chrome.storage.local.set({'lg': rawData}, function() {
				// Notify that we saved.
				console.log('Settings saved');
			});
		}
	});

	self.deleteData = ko.computed({
		read: function() {},
		write: function(){
		    chrome.storage.local.remove('lg', function() {
		        // Notify that we saved.
		        console.log('Settings removed');
		        location.reload();
		    });
		}
	});

}

function make_pie_chart(e, p, c, f, h) {
	//console.log(e, p, c, f, h);
	
    var t = Raphael(e),
        pie = t.piechart(120, 140, 100, [p, c, f], { 
            legend: ["%%.%% ("+p+") - Protein", "%%.%% ("+c+") - Net Carbs", "%%.%% ("+f+") - Fat"],
            colors: ["#E48701", "#A5BC4E", "#1B95D9"],
            matchColors: true,
            legendpos: "south", 
            defcut: true,
            //href: ["http://raphaeljs.com", "http://g.raphaeljs.com"]
        });
console.log(t);
    t.text(120, 10, h).attr({ font: "20px sans-serif" });
    pie.hover(function () {
        this.sector.stop();
        this.sector.scale(1.1, 1.1, this.cx, this.cy);

        if (this.label) {
            this.label[0].stop();
            this.label[0].attr({ r: 7.5 });
            this.label[1].attr({ "font-weight": 800 });
        }
    }, function () {
        this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

        if (this.label) {
            this.label[0].animate({ r: 5 }, 500, "bounce");
            this.label[1].attr({ "font-weight": 400 });
        }
    });
    console.log('pie: ', pie);
    //console.log(p !== undefined && c !== undefined && f !== undefined);
    return (p !== undefined && c !== undefined && f !== undefined) ? true : false;
}

function animate(el, ms) {

}
