/* All rights reserved to Gabo <freemanowe@citromail.hu>. Content free to copy for non-commercial use only. */
var tableinstance;

$(function() {
    // from Attila
    $("#data_export").click(data_export);
    document.getElementById('data_import').addEventListener('change', data_import, false);

    $(".formatted-double").on("input", function(event) {
        $(this).val(procNumberInput($(this).val()));
    });

    $(".formatted-integer").on("input", function(event) {
        $(this).val(procNumberInput($(this).val(),false));
    });

    $(".formatted-unsigned-integer").on("input", function(event) {
        $(this).val(procNumberInput($(this).val(),false,false));
    });

    $(".formatted-double").each(function(event) {
        $(this).val(procNumberInput($(this).val()));
    });

    $(".formatted-integer").each(function(event) {
        $(this).val(procNumberInput($(this).val(),false));
    });

    $(".formatted-unsigned-integer").each(function(event) {
        $(this).val(procNumberInput($(this).val(),false,false));
    });

    $(".money").each(function(event) {
        $(this).val(procNumberInput($(this).val(),true,true,1,2));
    });

    $(".money2").each(function(event) {
        $(this).val(procNumberInput($(this).val(),true,true,2,2));
    });

    $(".money").on("input", function(event) {
        $(this).val(procNumberInput($(this).val(),true,true,1,2));
    });

    $(".money2").on("input", function(event) {
        $(this).val(procNumberInput($(this).val(),true,true,2,2));
    });

    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawBasic);

    tableinstance = $('#tabla').DataTable({
        "paging":   false,
        "ordering": false,
        "info":     false,
        "searching":false,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'excel', 'pdf'
        ]
    } );

    calc();
});


function procNumberInput(value, real = true, signed = true, precision = 9, padTo = 3, forcePad = false) {
    var thousandsSeparator = ' ';
    var radix = ',';
    var altradix = '.';

    value = String(value);
    if(value == 'NaN') value = '0';

    if(real) {
        // change all '.' to ','
        var inputfilter = new RegExp(escapeRegExp(altradix),'g');
        value = value.replace(inputfilter, radix);

        // change first ',' to '.'
        inputfilter = new RegExp(escapeRegExp(radix));
        value = value.replace(inputfilter, altradix);
    }

    if(signed) {
        // change all '-' to 'n'
        inputfilter = new RegExp(escapeRegExp('-'),'g');
        value = value.replace(inputfilter, 'n');

        // change first 'n' to '-'
        inputfilter = new RegExp('^n');
        value = value.replace(inputfilter, '-');
    }

    if(real && signed) {
        // remove non-numeric characters except '-' or ','
        inputfilter = new RegExp('[^0-9\.\-]+','g');
    }
    else if(signed) {
        inputfilter = new RegExp('[^0-9\-]+','g');
    }
    else if(real) {
        inputfilter = new RegExp('[^0-9\.]+','g');
    }
    else {
        inputfilter = new RegExp('[^0-9]+','g');
    }

    value = value.replace(inputfilter, '');

    var pattern = new RegExp("^[0-9 \-]*\\.\\d{" + (precision + 1) + ",}$");
    var append0 = false;

    if(padTo > 0 && real && pattern.test(value)) {
        value = (Math.round(value * Math.pow(10,precision)) / Math.pow(10,precision)).toFixed(precision);
        append0 = true;
    }

    // change the '.' to ','
    var inputfilter = new RegExp(escapeRegExp(altradix));
    value = value.replace(inputfilter, radix);

    // add separators and change '.' to ','
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    var parts = value.split(radix);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    if(append0 || forcePad) {
        if(parts[1] !== undefined) {
            if(parts[1].length < padTo) parts[1] = String(parts[1] + '000000000').slice(0, padTo);
        }
        else {
            parts[1] = String('000000000').slice(0, padTo);
        }
    }

    return parts.join(radix);
}

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
}

function getNumVal(elem) {
    var value = 0;
    if(elem.is('input')) {
        value = elem.val();
    }
    else {
        value = elem.html();
    }
    if(value == '') value = 0;
    value = String(value).replace(/ /g, '');
    value = value.replace(/\,/g, '.');

    return parseFloat(value);
}

function convert2Money3(input) {
    return procNumberInput(input,true,true,3,3,true);
}

function convert2Money1(input) {
    return procNumberInput(input,true,true,1,2,true);
}

function convert2Money2(input) {
    return procNumberInput(input,true,true,2,2,true);
}

function convert2precision(input,precision = 1,length = 1) {
    return procNumberInput(input,true,true,precision,length,true);
}

function convert2integer(input) {
    return procNumberInput(input,false,true,0,0,false);
}

function torlesztoszamitas(osszeg, kamat, honapok) {
    var torleszto = osszeg * Math.pow((1+kamat),honapok) * kamat / (Math.pow((1+kamat),honapok) - 1);
    return Math.round(torleszto + 0.5);
}

function calcdue() {
    var futamido = getNumVal($('#run')) * 12.0;
    var kamat = getNumVal($('#rate')) / 1200.0;
    var remain = getNumVal($('#loan'));
    var torleszto = torlesztoszamitas(remain, kamat, futamido);
    $('#due').val(convert2Money2(torleszto));
    calc();
}

function disablecost(id) {
    if(parseInt($('input[name=pre-mode-' + id + ']:checked').val())) {
        $('#pre-cost-' + id).prop('disabled', false);
    }
    else {
        $('#pre-cost-' + id).prop('disabled', true);
    }
}

var diagramdata = new Array();
var diagramdata_year = new Array();
var tabledata = new Array();

// szamolo
function calc() {
	//// Default setup
    var futamido = getNumVal($('#run')) * 12.0;
    var new_futamido = futamido;
    var mar_befizetett = 0;
    var kamat = getNumVal($('#rate')) / 1200.0;
    var remain = getNumVal($('#loan'));
    var startLoan = getNumVal($('#loan'));
    var torleszto = getNumVal($('#due'));
    var i, j, prev, kamattorl, toketorl, loss = 0, lloss, min, totalAid = 0, pluspay = 0;
    tableinstance.clear();
    diagramdata = [];
    diagramdata_year = [];
    tabledata = [];
    var elotorl = new Array();
    var interestList = new Array();
    var temp = new Array();
    var otherLoss 		= getNumVal($('#startfee'));
    var otherLossTotal 	= getNumVal($('#startfee'));
    
    // read elotorlesztesek
    for(j = 0; j < prefieldnum; j++) {
        var month = getNumVal($('#month-' + j));
        var add = getNumVal($('#pre-add-' + j));
        var aid = getNumVal($('#pre-aid-' + j));
        var addfull = getNumVal($('#pre-add-' + j));
        var rate = getNumVal($('#pre-rate-' + j)) / 100;
        var cost = getNumVal($('#pre-cost-' + j));
        var mode = parseInt($('input[name=pre-mode-' + j + ']:checked').val());

        if(mode != 0) add = add - cost;
        add = add - (add * rate);
        if(mode == 0) {
            lloss = Math.round(add * rate);
        }
        else {
            lloss = cost + Math.round(add * rate);
        }
        if(month > 0 && add > 0){
        	elotorl.push([month, add, lloss, mode, aid, addfull]);
        }
    }
    for(j = 0; j < interestFieldNum; j++) {
    	var month = getNumVal($('#interest-month-' + j));
    	var rate = getNumVal($('#interest-rate-' + j));
    	var mode = parseInt($('input[name=interest-mode-' + j + ']:checked').val());
    	
    	if(month > 0 && rate > 0){
    		interestList.push([month,rate,mode]);
    	}
    }

    
    ///Generate without prepayment
    
    var woRemain = remain;
    var woLoss = 0;
    for(woHonap = 1; woHonap <= futamido && woRemain >= 0; woHonap++) {
        prev = woRemain;
        kamattorl = Math.round(woRemain * kamat);
        toketorl = torleszto - kamattorl;
        woRemain = woRemain - toketorl;
        woLoss = woLoss + kamattorl;
        otherLoss += getNumVal($('#mountlyfee'));
    }
    
    var startFullPayable = woLoss + startLoan + otherLoss;
    $('#fin-full-months').html((woHonap - 1) + ' (' + parseInt((woHonap - 1)/12) + ' év ' + ((woHonap - 1)%12) + ' hónap)');
    $('#fin-full-loss').html(convert2Money2(woLoss) + ' Ft');
    $('#fin-full-total').html(convert2Money2(startFullPayable) + ' Ft');
    $('#fin-full-prepay').html(convert2Money2(otherLoss) + ' Ft');
    var startThm = thmCalculator(startLoan, startFullPayable, woHonap - 1);
    $('#fin-full-thm').html(startThm + '%');
    
    ///Generate data
    
    tabledata.push([0, '0', '0',Math.round(kamat*1200 * 100)/100 , '0', '0', '0', convert2Money2(remain)]);
    diagramdata.push([0,remain]);
    diagramdata_year.push([0,remain]);
    
    for(honap = 1; remain > 0 && honap <= 1000; honap++) {
        for(j = 0; j < interestList.length; j++) {
            var month = interestList[j][0];

            if(honap == month) {
                var rate = interestList[j][1];
                var mode = interestList[j][2];
                
                kamat = rate / 1200.0;
                
                if(mode == 0){
                	torleszto = torlesztoszamitas(remain,kamat,new_futamido);
                }
                else{
                	new_futamido = futamidoszamitas(remain,kamat,torleszto,new_futamido);
                }
                tabledata.push([honap, '', '',Math.round(kamat*1200 * 100)/100, '', '', '', '']);
            }
        }
        for(j = 0; j < elotorl.length; j++) {
        	var month = elotorl[j][0];
        	
        	if(honap == month) {
        		var add = elotorl[j][1];
        		var addfull = elotorl[j][5];
        		var lloss = elotorl[j][2];
        		var mode = elotorl[j][3];
        		var aid = elotorl[j][4];
        		
        		pluspay += addfull - aid;
        		totalAid += aid;
        		otherLossTotal += lloss;
        		loss = loss + lloss;
        		remain = remain - add;
        		if (remain < 0){
        			remain = 0;
        		}
        		mar_befizetett = mar_befizetett + add;
        		if(mode == 0){
        			torleszto = torlesztoszamitas(remain,kamat,new_futamido);
        		}
        		else{
        			new_futamido = futamidoszamitas(remain,kamat,torleszto,new_futamido);
        		}
        		tabledata.push([honap, '', '', '' ,'', convert2Money2(add), '', '']);
        	}
        }

        prev = remain;
        kamattorl = Math.round(remain * kamat);
        toketorl = torleszto - kamattorl;
        remain = remain - toketorl;
        loss = loss + kamattorl;
        otherLossTotal += getNumVal($('#mountlyfee'));

        if(remain < 0) {
            remain = 0;
            toketorl = prev;
            torleszto = toketorl + kamattorl;
        }
        mar_befizetett = mar_befizetett + toketorl;

        tabledata.push([honap, convert2Money2(prev), convert2Money2(torleszto),Math.round(kamat*1200 * 100)/100 , convert2Money2(kamattorl), convert2Money2(toketorl), convert2Money2(mar_befizetett + loss), convert2Money2(remain)]);
        diagramdata.push([honap,remain]);
        if(honap % 12 == 0){
        	diagramdata_year.push([honap/12,remain]);
        }
        new_futamido--;
    }
    
    
    var newFullPayable = loss + startLoan + otherLossTotal;
    $('#fin-months').html((honap - 1) + ' (' + parseInt((honap - 1)/12) + ' év ' + ((honap - 1)%12) + ' hónap)');
    $('#fin-loss').html(convert2Money2(loss) + ' Ft');
    $('#fin-total').html(convert2Money2(newFullPayable) + ' Ft');
    $('#fin-prepay').html(convert2Money2(otherLossTotal) + ' Ft');
    $('#fin-aid').html(convert2Money2(totalAid) + ' Ft');
    $('#fin-pluspay').html(convert2Money2(pluspay) + ' Ft');
    var newThm = thmCalculator(startLoan, newFullPayable, honap - 1);
    $('#fin-thm').html(newThm + '%');
    
    $('#fin-diff-months').html((woHonap - honap) + ' (' + parseInt((woHonap - honap)/12) + ' év ' + ((woHonap - honap)%12) + ' hónap)');
    $('#fin-diff-loss').html(convert2Money2(woLoss-loss) + ' Ft');
    $('#fin-diff-total').html(convert2Money2( startFullPayable - newFullPayable) + ' Ft');
    $('#fin-diff-prepay').html(convert2Money2(otherLossTotal - otherLoss) + ' Ft');
    $('#fin-diff-aid').html(convert2Money2(totalAid) + ' Ft');
    $('#fin-diff-pluspay').html(convert2Money2(pluspay) + ' Ft');
    $('#fin-diff-thm').html(Math.round((startThm - newThm) * 1000) / 1000 + '%');
    
    
    
    
    $('#fin-saving').html(convert2Money2(woLoss-loss - (+otherLossTotal - otherLoss) + totalAid) + ' Ft');

    
    
    if(tableinstance) {
        tableinstance.rows.add(tabledata).draw();
    }
    drawBasic();
}


function thmCalculator(startPrice, fullPrice, duration){
	var stored = localStorage["thm" + startPrice + " " +fullPrice + " " + duration];
	if (stored){ 
		return stored;
	}
	
	monthly = fullPrice / duration;
	
	r = 0.000001;
	calcPrice = startPrice + 1;
	while (startPrice < calcPrice){
		r = r + 0.000001;
		calcPrice = monthly * ( (1/r) - (1/  (r * (Math.pow((1+r), duration)))   )     );
	}
	thm = Math.round(r * 12 * 100 * 1000) / 1000; 
	localStorage["thm" + startPrice + " " +fullPrice + " " + duration] = thm;
	return thm;
}

function futamidoszamitas(remain,kamat,torleszto,new_futamido) {
    var i = 0;
    var prev, kamattorl, toketorl;
    for(i = 1;  remain > 0; i++) {
        prev = remain;
        kamattorl = Math.round(remain * kamat);
        toketorl = torleszto - kamattorl;
        remain = remain - toketorl;
        if(remain < 0) {
            remain = 0;
        }
    }
    return i - 1;
}

function drawBasic() {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Tőketartozás');

    data.addRows(diagramdata);

    var options = {
        hAxis: {
        title: 'Hónapok'
        },
        vAxis: {
        title: 'Tőketartozás'
        }
    };
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);

    data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Tőketartozás');

    data.addRows(diagramdata_year);
    options = {
        hAxis: {
        title: 'Évek'
        },
        vAxis: {
        title: 'Tőketartozás'
        }
    };
    chart = new google.visualization.LineChart(document.getElementById('chart_year_div'));
    chart.draw(data, options);
}

var prefieldnum = 1;
function addPreFields() {
    var tmp = '<tr><td><input id="month-' + prefieldnum + '" class="formatted-integer" type="text" placeholder="Hónap" onchange="calc();"></input></td><td><input id="pre-add-' + prefieldnum + '" class="money" type="text" placeholder="Összeg" onchange="calc();"></input> Ft</td><td><input id="pre-aid-' + prefieldnum + '" class="money" type="text" placeholder="Támogatás" onchange="calc();"></input> Ft</td><td><input id="pre-rate-' + prefieldnum + '" class="formatted-double" type="text" placeholder="Kamat" onchange="calc();"></input> %</td><td><input id="pre-cost-' + prefieldnum + '" class="money" type="text" placeholder="Költség" onchange="calc();"></input> Ft</td><td>- Törlesztő<input name="pre-mode-' + prefieldnum + '" type="radio" value="0" onchange="calc();disablecost(' + prefieldnum + ');"></input><input name="pre-mode-' + prefieldnum + '" type="radio" value="1" onchange="calc();disablecost(' + prefieldnum + ');" checked="true"></input>Futamidő -</td></tr>';
    $('#pre-inputs').append(tmp);

    $("#pre-add-" + prefieldnum).on("input", function(event) {
        $(this).val(procNumberInput($(this).val(),true,true,1,2));
    });
    $("#pre-aid-" + prefieldnum).on("input", function(event) {
    	$(this).val(procNumberInput($(this).val(),true,true,1,2));
    });
    $("#pre-cost-" + prefieldnum).on("input", function(event) {
        $(this).val(procNumberInput($(this).val(),true,true,1,2));
    });
    $("#month-" + prefieldnum).on("input", function(event) {
        $(this).val(procNumberInput($(this).val(),false));
    });
    $("#pre-rate-" + prefieldnum).on("input", function(event) {
        $(this).val(procNumberInput($(this).val()));
    });

    prefieldnum++;
}

var interestFieldNum = 1;
function addInterestFields() {
	var tmp = '<tr><td><input id="interest-month-' + interestFieldNum + '" class="formatted-integer" type="text" placeholder="Hónap" onchange="calc();"></input></td><td><input id="interest-rate-' + interestFieldNum + '" class="money" type="text" placeholder="Új kamatláb" onchange="calc();"></input>%</td><td>- Törlesztő<input name="interest-mode-' + interestFieldNum + '" type="radio" value="0" onchange="calc();"  checked="true"></input><input name="interest-mode-' + interestFieldNum + '" type="radio" value="1" onchange="calc();"></input>Futamidő -</td></tr>';
	$('#interest-inputs').append(tmp);	
	interestFieldNum++;
}
function resetInterestFields(){
    var i ;
    for(i=0 ; i < interestFieldNum - 1 ; i++ ){
        $('#interest-inputs tr:last').remove();
    }
    interestFieldNum = 1;
    $('#interest-month-0,#interest-rate-0').val('');
}
var bubor = [0.234,0.177,0.108,0.100,0.100,0.094,0.097,0.090,0.094,0.196,0.278,0.285,0.290,0.304,0.321,0.382,0.399,0.428,0.495,0.660,0.767,0.813,0.852,0.913,0.962,0.978,1.037,1.222,1.341,1.350,1.355,1.358,1.372,1.387,1.390,1.407,1.518,1.674,1.770,1.967,2.100,2.135,2.163,2.194,2.200,2.227,2.248,2.364,2.531,2.687,2.836,2.908,2.893,2.848,3.015,3.233,3.457,3.646,3.830,4.023,4.150,4.339,4.590,4.931,5.253,5.571,5.927,6.249,6.673,7.024,7.288,7.380,7.471,7.505,7.641,7.726,7.894,8.124,7.533,6.777,6.255,6.147,6.136,6.140,6.146,6.156,6.154,6.158,6.193,6.120,5.963,5.639,5.595,5.608,5.518,5.417,5.242,5.177,5.321,5.636,5.820,5.966,6.143,6.478,6.953,7.675,8.090,9.323,9.694,9.752,9.903,9.685,9.361,9.544,10.518,11.616,9.722,8.706,8.671,8.865,9.338,9.017,8.941,8.830,7.971,7.476,7.469,7.297,7.205,7.390,7.441,7.140,7.448,7.450,7.579,7.954,8.219,8.036,8.046,8.274,8.591,8.340,8.035,7.785,7.191,6.609,6.795,6.788,6.346,6.417,6.685,6.509,6.169,5.734,6.148,6.507,6.957,7.398,7.460,7.321,7.969,8.593,8.896,9.490,10.201,10.758,10.688,11.061,11.047,10.666,10.630,11.515,12.474,11.552];
function addInterest(mounth, plusInterest){
	resetInterestFields();
	plusInterest = typeof plusInterest !== 'undefined' ? plusInterest : 2.5;
	for (i = 1; i<=bubor.length-1; i++)
	{
		if (i % mounth == 0){
			addInterestFields();
			$('#interest-month-'+(interestFieldNum-2)).val(i);
			$('#interest-rate-'+(interestFieldNum-2)).val( Math.round((bubor[i] + plusInterest)*1000)/1000);
		}
	}
}



// functions by Kukel Attila <kukel.attila 'at' gmail 'dot' com>

function data_load() {
    data_from_storage = JSON.parse(sessionStorage.getItem("data"));
    if (data_from_storage) {
        $("#loan").val(data_from_storage.loan);
        $("#rate").val(data_from_storage.rate);
        $("#run").val(data_from_storage.run);
        $("#due").val(data_from_storage.due);
        $("#startfee").val(data_from_storage.startfee);
        $("#mountlyfee").val(data_from_storage.mountlyfee);
        if (data_from_storage.pre.key_count) {
            for (i = 1; i < data_from_storage.pre.key_count; i++) {
                addPreFields();
            }
            for (i = 0; i <= data_from_storage.pre.key_count; i++) {
                $("#month-" + i).val(data_from_storage.pre.month[i]);
                $("#pre-add-" + i).val(data_from_storage.pre.pre_add[i]);
                $("#pre-aid-" + i).val(data_from_storage.pre.pre_aid[i]);
                $("#pre-rate-" + i).val(data_from_storage.pre.pre_rate[i]);
                $("#pre-cost-" + i).val(data_from_storage.pre.pre_cost[i]);
                $("input[name=pre-mode-" + i + "][value=" + data_from_storage.pre.pre_mode[i] + "]").click();
                disablecost(i);
            }
        }
    }
    calc();
}

var month = new Array();
var pre_add = new Array();
var pre_aid = new Array();
var pre_rate = new Array();
var pre_cost = new Array();
var pre_mode = new Array();
function data_save() {
    $.each($("#pre-inputs tr"), function (key, value) {
        if (key === 0) {
            // skip first row
            return true;
        }
        month[key - 1] = $(value).find("td input#month-" + (key - 1) + "").val();
        pre_add[key - 1] = $(value).find("td input#pre-add-" + (key - 1) + "").val();
        pre_aid[key - 1] = $(value).find("td input#pre-aid-" + (key - 1) + "").val();
        pre_rate[key - 1] = $(value).find("td input#pre-rate-" + (key - 1) + "").val();
        pre_cost[key - 1] = $(value).find("td input#pre-cost-" + (key - 1) + "").val();
        pre_mode[key - 1] = $(value).find("td input[name=pre-mode-" + (key - 1) + "]:checked").val();
    });

    data_to_save = {
        loan: $("#loan").val(),
        rate: $("#rate").val(),
        run: $("#run").val(),
        due: $("#due").val(),
        startfee: $("#startfee").val(),
        mountlyfee: $("#mountlyfee").val(),
        pre: {
            month: month,
            pre_add: pre_add,
            pre_aid: pre_aid,
            pre_rate: pre_rate,
            pre_cost: pre_cost,
            pre_mode: pre_mode,
            key_count: $("input[id^=month-]").length
        }
    };
    sessionStorage.setItem("data", JSON.stringify(data_to_save));
}

function data_export() {
    if (typeof (Storage) !== "undefined") {
        //save data
        data_save();
        var element = document.createElement("a");
        element.style.display = "none";
        element.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(sessionStorage.getItem("data")));
        element.setAttribute("download", "szamolos.json");
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    else {
        alert("A mentés csak HTML5 támogatással működik.");
    }
}

function data_import(evt) {
    var files = evt.target.files; // FileList object
    var f = files[0];

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function (theFile) {
        return function (e) {
            try {
                sessionStorage.setItem("data", e.target.result);
                data_load();
            } catch (ex) {

            }
        }
    })(f);
    reader.readAsText(f);
}



