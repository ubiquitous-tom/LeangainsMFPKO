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

ko.bindingHandlers.jSlider = {
	init: function(element, valueAccessor, allBingingAccessor) {
		// console.log('jSlider init');
		// console.log('element: ', element);
		// console.log('valueAccessor: ', valueAccessor());
		// console.log('allBingingAccessor: ', allBingingAccessor());
		console.log('jSlider init: ', valueAccessor().value());
		$( element ).slider({
			value: valueAccessor().value(),
			min: 0,
			max: 1000,
			step: 1,
			slide: function( event, ui ) {
				$( "#wo-"+valueAccessor().type ).val( ui.value );
			}
		});
		// $( "#wo-"+valueAccessor().type ).val( $( "#wo-"+valueAccessor().type+"-slider" ).slider( "value" ) );
	},
	update: function(element, valueAccessor) {
		// console.log('jSlider update');
		// console.log('element: ', element);
		console.log('valueAccessor: ', valueAccessor());
		$( "#wo-"+valueAccessor().type ).val( valueAccessor().value());
	}
}



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
    		// console.log(match);
    		// console.log(parseFloat(match[0]).toFixed(2));
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

// function womacro(type, value, thisself) {
// 	var self = this;
// 	self.type = type;
// 	self.value = ko.observable(value).extend({ required: "" });
// 	if(type === 'protein') thisself.woProtein = ko.observable(value).extend({ required: "" });
// 	if(type === 'carbs') thisself.woCarbs = ko.observable(value).extend({ required: "" });
// 	if(type === 'fat') thisself.woFat = ko.observable(value).extend({ required: "" });
// 	//self.value = ko.observable(value).extend({ required: "" });
// }

// function rtmacro(type, value, thisself) {
// 	var self = this;
// 	self.type = type;
// 	self.value = ko.observable(value).extend({ required: "" });
// 	if(type === 'protein') thisself.rtProtein =  ko.observable(value).extend({ required: "" });
// 	if(type === 'carbs') thisself.rtCarbs =  ko.observable(value).extend({ required: "" });
// 	if(type === 'fat') thisself.rtFat =  ko.observable(value).extend({ required: "" });
// 	//self.value = ko.observable(value).extend({ required: "" });
// }

function macro(type, value) {
	var self = this;
	self.type = type;
	self.value = ko.observable(value).extend({ required: "" });
}


function LeangainsMFPModel(lg) {
	console.log(lg);
	var self = this;
	self.lgSchedule = ko.observableArray(lg.lgSchedule);

	self.splitOptions = ko.observableArray([
		{type:"Standard Recomp (-20/+20)", value:0, multiplier: {"rt": -20, "wo": 20}}, 
		{type:"Weight Loss (-20/0)", value:1, multiplier: {"rt": -20, "wo": 0}}, 
		{type:"Weight Loss #2 (-40/+20)", value:2, multiplier: {"rt": -40, "wo": 20}}, 
		{type:"Faster Weight Loss (-10/-30)", value:3, multiplier: {"rt": .9, "wo": .7}}, 
		{type:"Lean Massing (-10/+20)", value:4, multiplier: {"rt": -10, "wo": 20}}, 
		{type:"Weight Gain (+10/+20)", value:5, multiplier: {"rt": 10, "wo": 20}},
		{type:"Weight Gain #2 (-10/+30)", value:6, multiplier: {"rt": -10, "wo": 30}},
		{type:"Maintain (0/0)", value:7, multiplier: {"rt": 0, "wo": 0}}
	]);
	self.split = ko.observable(3).extend({ required: "" });

	self.macroSplitOptions = ko.observableArray([
		{type:"50/50 - 50/50", value:0, multiplier: {"rt": [.5, .5], "wo": [.5, .5]}}, 
		{type:"50/50 - 75/25", value:1, multiplier: {"rt": [.5, .5], "wo": [.75, .25]}}, 
		{type:"25/75 - 75/25", value:2, multiplier: {"rt": [.25, .75], "wo": [.75, .25]}}, 
		{type:"20/80 - 80/20", value:3, multiplier: {"rt": [.2, .8], "wo": [.8, .2]}}, 
		{type:"15/85 - 85/15", value:4, multiplier: {"rt": [.15, .85], "wo": [.85, .15]}}, 
		{type:"10/90 - 90/10", value:5, multiplier: {"rt": [.1, .9], "wo": [.9, .1]}},
	]);
	self.macroSplit = ko.observable(0).extend({ required: "" });

	// self.woCal = ko.observable(lg.woCal).extend({ required: "" });
	// self.woCal = ko.computed(function() {
	// 	var p = 0, c = 0, f = 0;
	// 	ko.utils.arrayForEach(self.woMacro(), function(item) {
	// 		p = (item.type() === 'protein') ? item.value() * 4 : 0;
	// 		c = (item.type() === 'carbs') ? item.value() * 4 : 0;
	// 		f = (item.type() === 'fat') ? item.value() * 4 : 0;
	// 		if(!isNaN(item.value())) {
	// 			newTotal += parseFloat(item.value());
	// 		}
	// 		y++;
	// 	});
	// });
	// self.rtCal = ko.observable(lg.rtCal).extend({ required: "" });

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

	make_wo_pie_chart('wo-pie', self.woMacro()[0].value(), self.woMacro()[1].value(), self.woMacro()[2].value(), 'Workout Ratio');
	make_rt_pie_chart('rt-pie', self.rtMacro()[0].value(), self.rtMacro()[1].value(), self.rtMacro()[2].value(), 'Rest Ratio');

	self.gender = ko.observable(lg.gender);

	self.heightFoot = ko.observable(lg.heightFoot).extend({ required: "" });
	self.heightInch = ko.observable(lg.heightInch).extend({ required: "" });
	self.heightCM = ko.computed({
		read: function() {
			if (!isNaN(self.heightFoot()) && !isNaN(self.heightInch())) {
				return parseInt(((parseInt(self.heightFoot()) * 12) + parseInt(self.heightInch())) * 2.54);
			} else { 
				return undefined;
			}
		},
		write: function(newValue) {
			var totalInch = !isNaN(newValue) ? parseFloat(newValue) / 2.54 : undefined;
			if (!isNaN(totalInch)) {
				self.heightFoot(parseInt(totalInch / 12));
				self.heightInch(parseInt(totalInch % 12));
			}
		}
	}).extend({ required: "" });

	self.weight = ko.observable(lg.weight).extend({ required: "" });
	self.weightKG = ko.computed({
		read: function() {
			return !isNaN(self.weight()) ? (self.weight() / 2.2).toFixed(2) : undefined;
		},
		write: function(newValue) {
			var pd_weight = !isNaN(newValue) ? (parseFloat(newValue) * 2.2).toFixed(2) : undefined;
            self.weight(pd_weight);
		}
	}).extend({ required: "" });

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

	// console.log('self.split: ', self.split());
	// console.log(self.splitOptions()[self.split()].multiplier.wo);
	// console.log(self.tdee());
	self.woCal = ko.observable(parseInt(parseFloat(self.tdee())*parseFloat(self.splitOptions()[self.split()].multiplier.wo))).extend({ required: "" });
	// self.woCal = ko.computed(function() {
	// 	var p = 0, c = 0, f = 0;
	// 	ko.utils.arrayForEach(self.woMacro(), function(item) {
	// 		p = (item.type() === 'protein') ? item.value() * 4 : 0;
	// 		c = (item.type() === 'carbs') ? item.value() * 4 : 0;
	// 		f = (item.type() === 'fat') ? item.value() * 4 : 0;
	// 		if(!isNaN(item.value())) {
	// 			newTotal += parseFloat(item.value());
	// 		}
	// 		y++;
	// 	});
	// });
	self.rtCal = ko.observable(parseInt(parseFloat(self.tdee())*parseFloat(self.splitOptions()[self.split()].multiplier.rt))).extend({ required: "" });

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
		return !isNaN(self.weekDiff()) ? (parseFloat(self.weekDiff())/3500).toFixed(2) : undefined;
	});

	self.woChart = ko.computed(function() {
		// console.log('---------------------- start self.woChart -------------------------');
		// console.log('in woChart:', self.woMacro());

		var x = 0, y = 0;
		var newTotal = 0;
		var newValue = [];
		ko.utils.arrayForEach(self.woMacro(), function(item) {
			//newValue[y] = parseFloat(item.value());
			// console.log('item value: ', item.value());
			newValue.push(parseFloat(item.value()));
			// console.log('newValue: ', newValue);
			if(!isNaN(item.value())) {
				newTotal += parseFloat(item.value());
			}
			y++;
		});
		// console.log('newTotal: ', newTotal);
		// console.log('newValue: ', newValue);
		var macroSet = self.woMacro();
		var start = 0;
		var mainCover = [];
		var coverId = [];
		pie_wo.each(function() {

			// console.log('id: ', this.sector.id);
			// console.log('total: ', this.total);
			// console.log('radius: ', this.r);
			// console.log('cx and cy: ', this.cx+' '+this.cy);
			//this.sector.scale(0, 0, this.cx, this.cy);
			//this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 1000, "bounce")

			
			//console.log(self.woMacro()[x].value());
			//var val = 360 / this.total * self.woMacro()[x].value();
			// console.log('x: ', x);
			// console.log('self.woMacro() value: ', newValue[x]);
			var val = 360 / newTotal * newValue[x];
			
			// console.log('start: ', start);
			// console.log('val: ', val);
			var a1 = start;
			var a2 = start + val;
			var flag = (a2 - a1) > 180;
			// console.log('flag: ', +flag);
			// console.log('a1 & a2: ', a1+' & '+a2);
			// console.log('flag: ', flag);
			// console.log('mod a1: ', a1 % 360);
			// console.log('mod a2: ', a2 % 360);
			a1 = (a1 % 360) * Math.PI / 180;
		    a2 = (a2 % 360) * Math.PI / 180;
		    // console.log('a1 & a2: ', a1+' & '+a2);
		    // console.log('lx,y: l', (this.r * Math.cos(a1))+','+(this.r * Math.sin(a1)));
		    // mainCover[x] = [['M', this.cx, this.cy], ['l', this.r * Math.cos(a1), this.r * Math.sin(a1)], ['A', this.r, this.r, 0, +flag, 1, this.cx + this.r * Math.cos(a2), this.cy + this.r * Math.sin(a2)], ['z']];
		    // console.log('M'+this.cx+','+this.cy+' l'+(this.r * Math.cos(a1))+','+(this.r * Math.sin(a1))+' A'+this.r+','+this.r+',0,'+(+flag)+',1,'+(this.cx + this.r * Math.cos(a2))+','+(this.cy + this.r * Math.sin(a2))+'z');
			mainCover.push('M'+this.cx+','+this.cy+' l'+(this.r * Math.cos(a1))+','+(this.r * Math.sin(a1))+' A'+this.r+','+this.r+',0,'+(+flag)+',1,'+(this.cx + this.r * Math.cos(a2))+','+(this.cy + this.r * Math.sin(a2))+'z');
			//this.sector.animate({transform: 'M'+this.cx+','+this.cy+' l'+(this.r * Math.cos(a1))+','+(this.r * Math.sin(a1))+' A'+this.r+','+this.r+',0,1,1,'+(this.cx + this.r * Math.cos(a2))+','+(this.cy + this.r * Math.sin(a2))+'z'}, 1000, "bounce");
			// this.sector.scale(0, 0, this.cx, this.cy);
			// this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 1000, "bounce");
			this.sector.animate({path: [['M', this.cx, this.cy], ['l', this.r * Math.cos(a1), this.r * Math.sin(a1)], ['A', this.r, this.r, 0, +flag, 1, this.cx + this.r * Math.cos(a2), this.cy + this.r * Math.sin(a2)], ['z']]}, 800, "bounce");
			//this.sector.animate({segment: [this.cx, this.cy, this.r, start, start+val]}, 1000)
			//this.section.value.value = 300;
			//this.cover.transform([['M', this.cx, this.cy], ['L', this.r * Math.cos(a1), this.r * Math.sin(a1)], ['A', this.r, this.r, 0, +flag, 1, this.cx + this.r * Math.cos(a2), this.cy + this.r * Math.sin(a2)], ['Z']]);
			// console.log('pie_wo each cover: ', pie_wo.covers[x]);
			// console.log('pie_wo each cover id: ', pie_wo.covers[x].id);
			coverId.push(pie_wo.covers[x].id);
			// console.log('pie_wo this:', this);
			// console.log('pie_wo this sector: ', this.sector.attrs.path.toString());
			// console.log('pie_wo this cover: ', this.cover.attrs.path.toString());
			// console.log('pie_wo cover: ', this.cover);
			// console.log('pie_wo section: ', this.sector)
			start += val;
			x++;
		});
	// console.log('last x value: ', x);
    // console.log('pie_wo covers: ', pie_wo.covers);
    // console.log('pie_wo covers each attr path 0: ', pie_wo.covers.items[0].attrs.path.toString());
    // console.log('pie_wo covers each attr path 1: ', pie_wo.covers.items[1].attrs.path.toString());
    // console.log('pie_wo covers each attr path 2: ', pie_wo.covers.items[2].attrs.path.toString());
    // console.log('getById(3): ', wo.getById(3).node);
    // console.log('getById(4): ', wo.getById(4));
    // console.log('getById(5): ', wo.getById(5));
    // wo.getById(3).transform({path: mainCover[0]});
    // wo.getById(4).transform({path: mainCover[1]});
    // wo.getById(5).transform({path: mainCover[2]});
    // console.log(mainCover[0]);
    // console.log(mainCover[1]);
    // console.log(mainCover[2]);
    for (var c=0;c<coverId.length;c++) {
	    $(wo.getById(coverId[c]).node).attr('d', mainCover[c]);
	}
    // $(wo.getById(3).node).attr('d', mainCover[0]);
    // $(wo.getById(4).node).attr('d', mainCover[1]);
    // $(wo.getById(5).node).attr('d', mainCover[2]);
    // console.log('getById(3): ', wo.getById(3));
    // console.log('getById(4): ', wo.getById(4));
    // console.log('getById(5): ', wo.getById(5));
		// console.log('---------------------- end self.woChart -------------------------');
		return newTotal !== 0 ? true : false;
	});

	self.rtChart = ko.computed(function() {
		// console.log('---------------------- start self.rtChart -------------------------');
		// console.log('in rtChart:', self.rtMacro());
		if(isNaN(self.rtMacro()))
		var x = 0, y = 0;
		var newTotal = 0;
		var newValue = [];
		var coverId = [];
		ko.utils.arrayForEach(self.rtMacro(), function(item) {
			//newValue[y] = parseFloat(item.value());
			// console.log('item value: ', item.value());
			newValue.push(parseFloat(item.value()));
			// console.log('newValue: ', newValue);
			if(!isNaN(item.value())) {
				newTotal += parseFloat(item.value());
			}
			y++;
		});
		// console.log('newTotal: ', newTotal);
		// console.log('newValue: ', newValue);
		var macroSet = self.rtMacro();
		var start = 0;
		var mainCover = [];
		pie_rt.each(function() {

			// console.log('id: ', this.sector.id);
			// console.log('total: ', this.total);
			// console.log('radius: ', this.r);
			// console.log('cx and cy: ', this.cx+' '+this.cy);
			//this.sector.scale(0, 0, this.cx, this.cy);
			//this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 1000, "bounce")

			
			//console.log(self.rtMacro()[x].value());
			//var val = 360 / this.total * self.rtMacro()[x].value();
			// console.log('x: ', x);
			// console.log('self.rtMacro() value: ', newValue[x]);
			var val = 360 / newTotal * newValue[x];
			
			// console.log('start: ', start);
			// console.log('val: ', val);
			var a1 = start;
			var a2 = start + val;
			var flag = (a2 - a1) > 180;
			// console.log('flag: ', +flag);
			// console.log('a1 & a2: ', a1+' & '+a2);
			// console.log('flag: ', flag);
			// console.log('mod a1: ', a1 % 360);
			// console.log('mod a2: ', a2 % 360);
			a1 = (a1 % 360) * Math.PI / 180;
		    a2 = (a2 % 360) * Math.PI / 180;
		    // console.log('a1 & a2: ', a1+' & '+a2);
		    // console.log('lx,y: l', (this.r * Math.cos(a1))+','+(this.r * Math.sin(a1)));
		    // mainCover[x] = [['M', this.cx, this.cy], ['l', this.r * Math.cos(a1), this.r * Math.sin(a1)], ['A', this.r, this.r, 0, +flag, 1, this.cx + this.r * Math.cos(a2), this.cy + this.r * Math.sin(a2)], ['z']];
		    // console.log('M'+this.cx+','+this.cy+' l'+(this.r * Math.cos(a1))+','+(this.r * Math.sin(a1))+' A'+this.r+','+this.r+',0,'+(+flag)+',1,'+(this.cx + this.r * Math.cos(a2))+','+(this.cy + this.r * Math.sin(a2))+'z');
			mainCover.push('M'+this.cx+','+this.cy+' l'+(this.r * Math.cos(a1))+','+(this.r * Math.sin(a1))+' A'+this.r+','+this.r+',0,'+(+flag)+',1,'+(this.cx + this.r * Math.cos(a2))+','+(this.cy + this.r * Math.sin(a2))+'z');
			//this.sector.animate({transform: 'M'+this.cx+','+this.cy+' l'+(this.r * Math.cos(a1))+','+(this.r * Math.sin(a1))+' A'+this.r+','+this.r+',0,1,1,'+(this.cx + this.r * Math.cos(a2))+','+(this.cy + this.r * Math.sin(a2))+'z'}, 1000, "bounce");
			// this.sector.scale(0, 0, this.cx, this.cy);
			// this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 1000, "bounce");
			this.sector.animate({path: [['M', this.cx, this.cy], ['l', this.r * Math.cos(a1), this.r * Math.sin(a1)], ['A', this.r, this.r, 0, +flag, 1, this.cx + this.r * Math.cos(a2), this.cy + this.r * Math.sin(a2)], ['z']]}, 800, "bounce");
			//this.sector.animate({segment: [this.cx, this.cy, this.r, start, start+val]}, 1000)
			//this.section.value.value = 300;
			//this.cover.transform([['M', this.cx, this.cy], ['L', this.r * Math.cos(a1), this.r * Math.sin(a1)], ['A', this.r, this.r, 0, +flag, 1, this.cx + this.r * Math.cos(a2), this.cy + this.r * Math.sin(a2)], ['Z']]);
			// console.log('pie_rt each cover: ', pie_rt.covers[x]);
			// console.log('pie_rt each cover id: ', pie_rt.covers[x].id);
			// coverId.push(pie_rt.covers[x].id);
			// console.log('pie_rt this:', this);
			// console.log('pie_rt this sector: ', this.sector.attrs.path.toString());
			// console.log('pie_rt this cover: ', this.cover.attrs.path.toString());
			// console.log('pie_rt cover: ', this.cover);
			// console.log('pie_rt section: ', this.sector)
			start += val;
			x++;
		});
	// console.log('last x value: ', x);
    // console.log('pie_rt covers: ', pie_rt.covers);
    // console.log('pie_rt covers each attr path 0: ', pie_rt.covers.items[0].attrs.path.toString());
    // console.log('pie_rt covers each attr path 1: ', pie_rt.covers.items[1].attrs.path.toString());
    // console.log('pie_rt covers each attr path 2: ', pie_rt.covers.items[2].attrs.path.toString());
    // console.log('getById(3): ', rt.getById(3).node);
    // console.log('getById(4): ', rt.getById(4));
    // console.log('getById(5): ', rt.getById(5));
    // rt.getById(3).transform({path: mainCover[0]});
    // rt.getById(4).transform({path: mainCover[1]});
    // rt.getById(5).transform({path: mainCover[2]});
    // console.log(mainCover[0]);
    // console.log(mainCover[1]);
    // console.log(mainCover[2]);
    for (var c=0;c<coverId.length;c++) {
	    $(rt.getById(coverId[c]).node).attr('d', mainCover[c]);
	}
	//$(rt.getById(16).node).attr('d', mainCover[0]);
    //$(rt.getById(17).node).attr('d', mainCover[1]);
    //$(rt.getById(18).node).attr('d', mainCover[2]);
    // console.log('getById(3): ', rt.getById(3));
    // console.log('getById(4): ', rt.getById(4));
    // console.log('getById(5): ', rt.getById(5));
		// console.log('---------------------- end self.rtChart -------------------------');
		return newTotal !== 0 ? true : false;
	});

	self.chart = ko.computed(function(){
		//console.log(self.woChart() && self.rtChart());
		/*<div data-bind="visible: chart" id="piechart" class="row">
			<div data-bind="visible: woChart" id="wo-pie"></div>
			<div date-bind="visible: rtChart" id="rt-pie"></div>
		</div>*/
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

var pie_wo, pie_rt, wo, rt; 
var pieWidth = 225, pieHeight = 140, pieRadius = 100;
function make_wo_pie_chart(e, p, c, f, h) {
	//console.log(e, p, c, f, h);
	// console.log('---------------------- start make_wo_pie_chart -------------------------');
    wo = Raphael(e);

    pie_wo = wo.piechart(pieWidth, pieHeight, pieRadius, [p, c, f], { 
            legend: ["%%.%% ("+p+") - Protein", "%%.%% ("+c+") - Net Carbs", "%%.%% ("+f+") - Fat"],
            colors: ["#E48701", "#A5BC4E", "#1B95D9"],
            matchColors: true,
            legendpos: "south", 
            // defcut: true,
            //href: ["http://raphaeljs.com", "http://g.raphaeljs.com"]
        });

    wo.text(pieWidth, 10, h).attr({ font: "20px sans-serif" });
    
    pie_wo.hover(function () {
        this.sector.stop();
        this.sector.scale(1.1, 1.1, this.cx, this.cy);
        
        console.log(this.sector.attr());
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
 //    console.log('wo:', wo);
 //    console.log('pie_wo: ', pie_wo);
 //    console.log('pie_wo [1]: ', pie_wo[1]);
 //    console.log('pie_wo covers: ', pie_wo.covers);
 //    console.log('pie_wo covers each attr path 0: ', pie_wo.covers.items[0].attrs.path.toString());
 //    console.log('pie_wo covers each attr path 1: ', pie_wo.covers.items[1].attrs.path.toString());
 //    console.log('pie_wo covers each attr path 2: ', pie_wo.covers.items[2].attrs.path.toString());
 //    pie_wo.each(function(){
 //    	console.log('pie_wo each sector: ', this.sector);
 //    	console.log('pie_wo each sector attributes: ', this.sector.attr());
 //    	console.log('pie_wo each sector attributes string: ', this.sector.attr().path.toString())
 //    });
 //    //console.log(p !== undefined && c !== undefined && f !== undefined);
	// console.log('---------------------- end make_wo_pie_chart -------------------------');

    return (p !== undefined && c !== undefined && f !== undefined) ? true : false;
}

function make_rt_pie_chart(e, p, c, f, h) {
	//console.log(e, p, c, f, h);
	// console.log('---------------------- start make_rt_pie_chart -------------------------');

    rt = Raphael(e);

    pie_rt = rt.piechart(pieWidth, pieHeight, pieRadius, [p, c, f], { 
            legend: ["%%.%% ("+p+") - Protein", "%%.%% ("+c+") - Net Carbs", "%%.%% ("+f+") - Fat"],
            colors: ["#E48701", "#A5BC4E", "#1B95D9"],
            matchColors: true,
            legendpos: "south", 
            //defcut: true,
            //href: ["http://raphaeljs.com", "http://g.raphaeljs.com"]
        });

    rt.text(pieWidth, 10, h).attr({ font: "20px sans-serif" });
    pie_rt.hover(function () {
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
 //    console.log('rt: ', rt);
 //    console.log('pie_rt: ', pie_rt);
 //    //console.log(p !== undefined && c !== undefined && f !== undefined);
	// console.log('---------------------- end make_rt_pie_chart -------------------------');

    return (p !== undefined && c !== undefined && f !== undefined) ? true : false;
}

// function animate(ms, total, ii) {
//     var start = 0,
//         val;
//     for (i = 0; i < ii; i++) {
//         val = 360 / total * data[i];
//         pie_wo[i].animate({segment: [120, 140, 100, start, start += val]}, ms || 1500, "bounce");
//         pie_wo[i].angle = start - val / 2;
//     }
// }