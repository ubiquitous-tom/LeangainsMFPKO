var today_type;
var cal_index, carbs_index, fiber_index, fat_index, protien_index;
var t_cal, t_carbs, t_fiber, t_fat, t_protein, tf_cal, tf_carbs, tf_fiber, tf_fat, tf_protein;
var tt_cal, tt_carbs, tt_fiber, tt_fat, tt_protein, ttf_cal, ttf_carbs, ttf_fiber, ttf_fat, ttf_protein;

function lgInit() {
	//load_jquery();
	jQuery.noConflict();
	// console.log('hey');
	var tRatio = jQuery('<div/>').attr('id','today-ratio');
	var rRatio = jQuery('<div/>').attr('id','rec-ratio');
	jQuery('#content').append(tRatio).append(rRatio);
    get_table_column();
}

function get_table_column() {
    //google.load( "visualization", "1.0", {packages:["corechart"]} );
    //console.log('haha');
    //restore_options();
    cal_index = jQuery('table').find('td:contains("Calories")').index();
    carbs_index = jQuery('table').find('td:contains("Carbs")').index();
    fiber_index = jQuery('table').find('td:contains("Fiber")').index();
    fat_index = jQuery('table').find('td:contains("Fat")').index();
    protein_index = jQuery('table').find('td:contains("Protein")').index();
    //console.log(cal_index, carbs_index, fiber_index, fat_index, protein_index);
    
    load_options();
}

function load_options() {
    chrome.storage.local.get('lg', function(items) {
        // console.log('lg: ',items.lg);
        lg = items.lg;

        if (lg) {
            var lg = jQuery.parseJSON(items.lg) || defaultLG;
            // console.log(lg);
            ko.applyBindings(new LeangainsMFPModel(lg));
        } else {
           alert('you need to fill in your info in the option page first.');
        }
    });

}

function LeangainsMFPModel(lg) {
    //console.log(lg);
    var self = this;
    set_today_type(lg);
    inject_daily_cal_macro(lg);
    recalculate_remaining();
    add_net_carb_column();
    get_total_today_macro();
    make_pie_chart();
}

function set_today_type(lg) {
    var retrieved_date = jQuery('#date_selector').val().split('-');
    var today = new Date(retrieved_date[0], retrieved_date[1]-1, retrieved_date[2]);
    today_type = get_today_type(today);
    // console.log(type);
    // console.log(lg.lgSchedule[type].woValue);
    var day_type = lg.lgSchedule[today_type].woValue === 'true' ? 'WorkOut Day' : 'Rest Day';
    var day_type_div = jQuery('<div></div>').addClass('day-type')
    var h1 = jQuery('<h1></h1>').text('Today is a '+day_type);
    jQuery('.container').prepend(jQuery(day_type_div).append(h1));
}

function get_today_type(date) {
    var d = new Date(date);
    var weekday = new Array(7);
    weekday[0] = 6;
    weekday[1] = 0;
    weekday[2] = 1;
    weekday[3] = 2;
    weekday[4] = 3;
    weekday[5] = 4;
    weekday[6] = 5;

    return weekday[d.getDay()];
}

function inject_daily_cal_macro(lg) {
    //console.log(jQuery('.total.alt').find('td:eq('+cal_index+')').text());
    // console.log(lg.woMacro.length);
    if (lg.lgSchedule[today_type].woValue) {
        t_cal = lg.woCal;
        for (var i=0;i<lg.woMacro.length;i++) {
            if (lg.woMacro[i].type === 'carbs') t_carbs = lg.woMacro[i].value;
            if (lg.woMacro[i].type === 'fat') t_fat = lg.woMacro[i].value;
            if (lg.woMacro[i].type === 'protein') t_protein = lg.woMacro[i].value;
        }
    } else {
        t_cal = lg.rtCal;
        for (var i=0;i<lg.rtMacro.length;i++) {
            if (lg.rtMacro[i].type === 'carbs') t_carbs = lg.rtMacro[i].value;
            if (lg.rtMacro[i].type === 'fat') t_fat = lg.rtMacro[i].value;
            if (lg.rtMacro[i].type === 'protein') t_protein = lg.rtMacro[i].value;
        }
    }
    // console.log(t_cal, t_carbs, t_fat, t_protein);
    jQuery('.total.alt')
    .find('td:eq('+cal_index+')').text(t_cal).end()
    .find('td:eq('+carbs_index+')').text(t_carbs).end()
    .find('td:eq('+fat_index+')').text(t_fat).end()
    .find('td:eq('+protein_index+')').text(t_protein);
}

function recalculate_remaining() {
    // console.log('total cal: ',jQuery('.total:eq(0)').find('td:eq('+cal_index+')').text().replace(/\s/g, "").replace(",", ""));
    var total_cal = parseInt(jQuery('.total:eq(0)').find('td:eq('+cal_index+')').text().replace(/\s/g, "").replace(",", ""));
    var total_carbs = parseInt(jQuery('.total:eq(0)').find('td:eq('+carbs_index+')').text().replace(/\s/g, "").replace(",", ""));
    var total_fat = parseInt(jQuery('.total:eq(0)').find('td:eq('+fat_index+')').text().replace(/\s/g, "").replace(",", ""));
    var total_protein = parseInt(jQuery('.total:eq(0)').find('td:eq('+protein_index+')').text().replace(/\s/g, "").replace(",", ""));
    var before_class_cal = jQuery('.total:eq(0)').find('td:eq('+cal_index+')').attr('class');
    var before_class_carbs = jQuery('.total:eq(0)').find('td:eq('+carbs_index+')').attr('class');
    var before_class_fat = jQuery('.total:eq(0)').find('td:eq('+fat_index+')').attr('class');
    var before_class_protein = jQuery('.total:eq(0)').find('td:eq('+protein_index+')').attr('class');
    // console.log('before class: ',before_class_cal,before_class_carbs,before_class_fat,before_class_protein);
    // console.log('remaining cal: ',parseInt(t_cal),parseInt(total_cal));
    var remaining_cal = parseInt(t_cal)-parseInt(total_cal); if (remaining_cal >= 0) { var remaining_cal_class = 'positive'; } else { var remaining_cal_class = 'negative'; }
    var remaining_carbs = parseInt(t_carbs)-parseInt(total_carbs); if (remaining_carbs >= 0) { var remaining_carbs_class = 'positive'; } else { var remaining_carbs_class = 'negative'; }
    var remaining_fat = parseInt(t_fat)-parseInt(total_fat); if (remaining_fat >= 0) { var remaining_fat_class = 'positive'; } else { var remaining_fat_class = 'negative'; }
    var remaining_protein = parseInt(t_protein)-parseInt(total_protein); if (remaining_protein >= 0) { var remaining_protein_class = 'positive'; } else { var remaining_protein_class = 'negative'; }
    jQuery('.total.remaining')
    .find('td:eq('+cal_index+')').removeClass().addClass(remaining_cal_class).text(remaining_cal).end()
    .find('td:eq('+carbs_index+')').removeClass().addClass(remaining_carbs_class).text(remaining_carbs).end()
    .find('td:eq('+fat_index+')').removeClass().addClass(remaining_fat_class).text(remaining_fat).end()
    .find('td:eq('+protein_index+')').removeClass().addClass(remaining_protein_class).text(remaining_protein);
}

function add_net_carb_column() {

    // console.log(carbs_index, fiber_index);
    jQuery('table').find('td:contains("Carbs")').before(jQuery('<td />').addClass('alt net-carbs').html('Net<br>Carbs'));
    jQuery('colgroup').find('col:eq('+carbs_index+')').before(jQuery('<col />').addClass('col-2'));
    //jQuery('tfoot').find(':contains("Carbs")').before(jQuery('<td />').addClass('alt').html('Net<br>Carbs'));
    //jQuery('tr.bottom, tr.total').each(function(index, el) {
    jQuery('tbody tr').not('.meal_header,.spacer').each(function(index, el) {
        // console.log(index, el);
        // console.log(jQuery(el).attr('class'));
        var carbs_text = jQuery(el).find('td:eq('+carbs_index+')').text();
        var fiber_text = jQuery(el).find('td:eq('+fiber_index+')').text();
        var carbs = 0, fiber = 0, net_carbs = 0;
        var class_name = jQuery(el).attr('class');
        switch (class_name) {
            case 'total':
                // console.log('in total');
                var total_net_carbs = 0;
                jQuery('.bottom .net_carbs').each(function(){
                    total_net_carbs += (jQuery(this).text().trim().length === 0)?0:parseInt(jQuery(this).text());
                });
                jQuery(el).find('td').eq(carbs_index).before(jQuery('<td/>').addClass('total_net_carbs').text(total_net_carbs));
                break;
            case 'total alt':
                // console.log('in total alt');
                // console.log('carbs: ',jQuery(el).find('td').eq(carbs_index).text());
                jQuery(el).find('td').eq(carbs_index).before(jQuery('<td/>').addClass('goal_net_carbs').text(jQuery(el).find('td').eq(carbs_index).text()));
                break;
            case 'total remaining':
                // console.log('in total remaining');
                // console.log('goal and total: ',jQuery('.goal_net_carbs').text(),jQuery('.total_net_carbs').text());
                var remaining = jQuery('.goal_net_carbs').text()-jQuery('.total_net_carbs').text();
                // console.log('remaining: ', remaining);
                var remaining_class = 'positive';
                if (remaining < 0) remaining_class = 'negative';
                jQuery(el).find('td').eq(carbs_index).before(jQuery('<td/>').addClass('remaining_net_carbs '+remaining_class).text(jQuery(el).find('td').eq(carbs_index).text()));
                jQuery('.remaining_net_carbs').text(remaining);
                break;
            default:
                // console.log('in default');
                carbs = carbs_text;
                fiber = fiber_text;
                // console.log(carbs_text, fiber_text);
                // console.log(carbs_text.trim().length === 0,fiber_text.trim().length === 0);
                if (carbs_text.trim().length === 0 || fiber_text.trim().length === 0) { 
                    net_carbs = '';
                    // console.log('net_carbs in if: ',net_carbs);
                } else {
                    net_carbs = carbs-fiber; 
                    // console.log('net_carbs in else: ',net_carbs);
                }
                //if (net_carbs == 0) net_carbs = '';
                jQuery(el).not('.total alt,.total remaining').find('td:eq('+carbs_index+')').before(jQuery('<td />').addClass('net_carbs').text(net_carbs));
        }
        
        
        

       // console.log(parseInt(carbs, 10), parseInt(fiber, 10)); 
    });

}

function get_total_today_macro() {
    tt_protein = parseInt(jQuery('tr.total').find('td').eq(protein_index+1).text());
    tt_carbs = parseInt(jQuery('.total_net_carbs').text());
    tt_fat = parseInt(jQuery('tr.total').find('td').eq(fat_index+1).text());
    // console.log(tt_protein,tt_carbs,tt_fat);
}


function make_pie_chart() {
    var t = Raphael("today-ratio"),
        pie = t.piechart(120, 140, 100, [tt_protein, tt_carbs, tt_fat], { 
            legend: ["%%.%% ("+tt_protein+")- Protein", "%%.%% ("+tt_carbs+") - Net Carbs", "%%.%% ("+tt_fat+") - Fat"],
            colors: ["#E48701", "#A5BC4E", "#1B95D9"],
            matchColors: true,
            legendpos: "south", 
            defcut: true,
            //href: ["http://raphaeljs.com", "http://g.raphaeljs.com"]
        });

    t.text(120, 10, "Today Ratio").attr({ font: "20px sans-serif" });
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

    var r = Raphael("rec-ratio"),
        pie = r.piechart(120, 140, 100, [t_protein, t_carbs, t_fat], { 
            legend: ["%%.%% ("+tf_protein+")- Protein", "%%.%% ("+tf_carbs+") - Net Carbs", "%%.%% ("+tf_fat+") - Fat"],
            colors: ["#E48701", "#A5BC4E", "#1B95D9"],
            matchColors: true,
            legendpos: "south", 
            defcut: true,
            //href: ["http://raphaeljs.com", "http://g.raphaeljs.com"]
        });

    r.text(120, 10, "Recommended Ratio").attr({ font: "20px sans-serif" });
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
}


// window.addEventListener("load", function(){
	lgInit();
// });