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
    
    tabledata.push([0, '0', '0', kamat*1200 , '0', '0', '0', convert2Money2(remain)]);
    diagramdata.push([0,remain]);
    diagramdata_year.push([0,remain]);
    
    for(honap = 1; remain > 0; honap++) {
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
                tabledata.push([honap, '', '',kamat*1200 , '', '', '', '']);
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

        tabledata.push([honap, convert2Money2(prev), convert2Money2(torleszto),kamat*1200 , convert2Money2(kamattorl), convert2Money2(toketorl), convert2Money2(mar_befizetett + loss), convert2Money2(remain)]);
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


var bubor = {"2004-01-05":"10.98","2004-01-06":"10.55","2004-01-07":"10.74","2004-01-08":"11.02","2004-01-09":"11.86","2004-01-10":"11.91","2004-01-12":"12.51","2004-01-13":"12.18","2004-01-14":"11.32","2004-01-15":"11.37","2004-01-16":"11.79","2004-01-19":"11.55","2004-01-20":"11.58","2004-01-21":"11.55","2004-01-22":"11.48","2004-01-23":"11.48","2004-01-26":"11.38","2004-01-27":"11.57","2004-01-28":"11.84","2004-01-29":"11.83","2004-01-30":"12.11","2004-02-02":"12.13","2004-02-03":"12.27","2004-02-04":"12.05","2004-02-05":"12.29","2004-02-06":"13.09","2004-02-09":"12.98","2004-02-10":"12.73","2004-02-11":"12.55","2004-02-12":"12.6","2004-02-13":"12.51","2004-02-16":"12.28","2004-02-17":"12.48","2004-02-18":"12.48","2004-02-19":"12.37","2004-02-20":"12.34","2004-02-23":"12.49","2004-02-24":"12.51","2004-02-25":"12.49","2004-02-26":"12.44","2004-02-27":"12.41","2004-03-01":"12.26","2004-03-02":"12.23","2004-03-03":"12.18","2004-03-04":"12.16","2004-03-05":"12.03","2004-03-08":"12.06","2004-03-09":"11.96","2004-03-10":"11.86","2004-03-11":"11.58","2004-03-12":"11.57","2004-03-16":"11.58","2004-03-17":"11.6","2004-03-18":"11.76","2004-03-19":"11.72","2004-03-22":"11.59","2004-03-23":"10.77","2004-03-24":"10.76","2004-03-25":"10.77","2004-03-26":"10.76","2004-03-29":"10.78","2004-03-30":"10.76","2004-03-31":"10.58","2004-04-01":"10.51","2004-04-02":"10.56","2004-04-05":"10.53","2004-04-06":"10.43","2004-04-07":"10.46","2004-04-08":"10.53","2004-04-09":"10.53","2004-04-13":"10.49","2004-04-14":"10.52","2004-04-15":"10.8","2004-04-16":"10.78","2004-04-19":"10.74","2004-04-20":"10.64","2004-04-21":"10.74","2004-04-22":"10.79","2004-04-23":"10.78","2004-04-26":"10.67","2004-04-27":"10.59","2004-04-28":"10.6","2004-04-29":"10.8","2004-04-30":"10.74","2004-05-03":"10.62","2004-05-04":"10.27","2004-05-05":"10.27","2004-05-06":"10.32","2004-05-07":"10.45","2004-05-10":"10.57","2004-05-11":"10.6","2004-05-12":"10.59","2004-05-13":"10.83","2004-05-14":"10.92","2004-05-17":"10.86","2004-05-18":"10.74","2004-05-19":"10.76","2004-05-20":"10.78","2004-05-21":"10.82","2004-05-24":"10.89","2004-05-25":"10.81","2004-05-26":"10.8","2004-05-27":"10.7","2004-05-28":"10.72","2004-06-01":"10.81","2004-06-02":"10.78","2004-06-03":"10.79","2004-06-04":"10.82","2004-06-07":"10.83","2004-06-08":"10.79","2004-06-09":"10.79","2004-06-10":"10.89","2004-06-11":"10.98","2004-06-14":"11.02","2004-06-15":"11.01","2004-06-16":"10.97","2004-06-17":"11.17","2004-06-18":"11.36","2004-06-21":"11.31","2004-06-22":"11.34","2004-06-23":"11.28","2004-06-24":"11.25","2004-06-25":"11.19","2004-06-28":"11.17","2004-06-29":"11.22","2004-06-30":"11.27","2004-07-01":"11.23","2004-07-02":"11.21","2004-07-05":"11.13","2004-07-06":"11.11","2004-07-07":"11.1","2004-07-08":"11.1","2004-07-09":"11.1","2004-07-12":"11.14","2004-07-13":"11.13","2004-07-14":"11.1","2004-07-15":"11.03","2004-07-16":"11.06","2004-07-19":"11.04","2004-07-20":"11.07","2004-07-21":"11.09","2004-07-22":"11.1","2004-07-23":"11.07","2004-07-26":"11.09","2004-07-27":"11.01","2004-07-28":"10.89","2004-07-29":"10.79","2004-07-30":"10.76","2004-08-02":"10.61","2004-08-03":"10.71","2004-08-04":"10.82","2004-08-05":"10.8","2004-08-06":"10.75","2004-08-09":"10.65","2004-08-10":"10.52","2004-08-11":"10.53","2004-08-12":"10.54","2004-08-13":"10.58","2004-08-16":"10.6","2004-08-17":"10.53","2004-08-18":"10.52","2004-08-19":"10.52","2004-08-23":"10.97","2004-08-24":"10.87","2004-08-25":"10.85","2004-08-26":"10.78","2004-08-27":"10.77","2004-08-30":"10.75","2004-08-31":"10.77","2004-09-01":"10.82","2004-09-02":"10.81","2004-09-03":"10.79","2004-09-06":"10.73","2004-09-07":"10.73","2004-09-08":"10.77","2004-09-09":"10.85","2004-09-10":"11","2004-09-13":"11.01","2004-09-14":"10.94","2004-09-15":"10.97","2004-09-16":"10.86","2004-09-17":"10.83","2004-09-20":"10.79","2004-09-21":"10.72","2004-09-22":"10.69","2004-09-23":"10.66","2004-09-24":"10.49","2004-09-27":"10.51","2004-09-28":"10.55","2004-09-29":"10.57","2004-09-30":"10.58","2004-10-01":"10.58","2004-10-04":"10.54","2004-10-05":"10.5","2004-10-06":"10.48","2004-10-07":"10.46","2004-10-08":"10.41","2004-10-11":"10.35","2004-10-12":"10.09","2004-10-13":"10.09","2004-10-14":"10.09","2004-10-15":"10.16","2004-10-18":"10.18","2004-10-19":"10.13","2004-10-20":"10.14","2004-10-21":"10.11","2004-10-22":"10.05","2004-10-25":"9.94","2004-10-26":"9.98","2004-10-27":"9.98","2004-10-28":"9.99","2004-10-29":"9.98","2004-11-02":"9.96","2004-11-03":"9.93","2004-11-04":"9.91","2004-11-05":"9.85","2004-11-08":"9.83","2004-11-09":"9.8","2004-11-10":"9.75","2004-11-11":"9.7","2004-11-12":"9.61","2004-11-15":"9.42","2004-11-16":"9.3","2004-11-17":"9.29","2004-11-18":"9.29","2004-11-19":"9.29","2004-11-22":"9.31","2004-11-23":"9.23","2004-11-24":"9.21","2004-11-25":"9.19","2004-11-26":"9.14","2004-11-29":"9.14","2004-11-30":"9.14","2004-12-01":"9.11","2004-12-02":"9.06","2004-12-03":"9.01","2004-12-06":"8.99","2004-12-07":"8.98","2004-12-08":"8.96","2004-12-09":"8.96","2004-12-10":"8.98","2004-12-13":"8.99","2004-12-14":"8.97","2004-12-15":"8.94","2004-12-16":"8.94","2004-12-17":"8.89","2004-12-18":"8.88","2004-12-20":"8.84","2004-12-21":"8.78","2004-12-22":"8.77","2004-12-23":"8.76","2004-12-27":"8.77","2004-12-28":"8.76","2004-12-29":"8.75","2004-12-30":"8.75","2004-12-31":"8.76","2005-01-03":"8.76","2005-01-04":"8.71","2005-01-05":"8.66","2005-01-06":"8.62","2005-01-07":"8.71","2005-01-10":"8.71","2005-01-11":"8.68","2005-01-12":"8.7","2005-01-13":"8.61","2005-01-14":"8.58","2005-01-17":"8.6","2005-01-18":"8.58","2005-01-19":"8.57","2005-01-20":"8.54","2005-01-21":"8.54","2005-01-24":"8.51","2005-01-25":"8.47","2005-01-26":"8.49","2005-01-27":"8.49","2005-01-28":"8.48","2005-01-31":"8.45","2005-02-01":"8.45","2005-02-02":"8.41","2005-02-03":"8.34","2005-02-04":"8.3","2005-02-07":"8.22","2005-02-08":"8.14","2005-02-09":"8.11","2005-02-10":"8.07","2005-02-11":"8.07","2005-02-14":"8.06","2005-02-15":"8.05","2005-02-16":"8.04","2005-02-17":"7.93","2005-02-18":"7.81","2005-02-21":"7.69","2005-02-22":"7.63","2005-02-23":"7.6","2005-02-24":"7.51","2005-02-25":"7.49","2005-02-28":"7.47","2005-03-01":"7.37","2005-03-02":"7.32","2005-03-03":"7.32","2005-03-04":"7.31","2005-03-07":"7.3","2005-03-08":"7.23","2005-03-09":"7.06","2005-03-10":"7.07","2005-03-11":"7.03","2005-03-16":"7.15","2005-03-17":"7.39","2005-03-18":"7.38","2005-03-19":"7.37","2005-03-21":"7.39","2005-03-22":"7.4","2005-03-23":"7.45","2005-03-24":"7.47","2005-03-25":"7.47","2005-03-29":"7.47","2005-03-30":"7.41","2005-03-31":"7.38","2005-04-01":"7.39","2005-04-04":"7.37","2005-04-05":"7.37","2005-04-06":"7.39","2005-04-07":"7.39","2005-04-08":"7.39","2005-04-11":"7.39","2005-04-12":"7.39","2005-04-13":"7.38","2005-04-14":"7.4","2005-04-15":"7.41","2005-04-18":"7.49","2005-04-19":"7.56","2005-04-20":"7.57","2005-04-21":"7.57","2005-04-22":"7.58","2005-04-25":"7.59","2005-04-26":"7.49","2005-04-27":"7.5","2005-04-28":"7.5","2005-04-29":"7.54","2005-05-02":"7.54","2005-05-03":"7.53","2005-05-04":"7.5","2005-05-05":"7.47","2005-05-06":"7.39","2005-05-09":"7.4","2005-05-10":"7.39","2005-05-11":"7.42","2005-05-12":"7.39","2005-05-13":"7.39","2005-05-17":"7.41","2005-05-18":"7.42","2005-05-19":"7.4","2005-05-20":"7.4","2005-05-23":"7.38","2005-05-24":"7.25","2005-05-25":"7.32","2005-05-26":"7.33","2005-05-27":"7.33","2005-05-30":"7.35","2005-05-31":"7.35","2005-06-01":"7.32","2005-06-02":"7.26","2005-06-03":"7.2","2005-06-06":"7.07","2005-06-07":"7.01","2005-06-08":"7","2005-06-09":"7","2005-06-10":"7.01","2005-06-13":"7.02","2005-06-14":"7","2005-06-15":"7","2005-06-16":"7","2005-06-17":"6.98","2005-06-20":"6.95","2005-06-21":"6.92","2005-06-22":"6.88","2005-06-23":"6.82","2005-06-24":"6.75","2005-06-27":"6.71","2005-06-28":"6.73","2005-06-29":"6.74","2005-06-30":"6.69","2005-07-01":"6.65","2005-07-04":"6.61","2005-07-05":"6.56","2005-07-06":"6.54","2005-07-07":"6.55","2005-07-08":"6.55","2005-07-11":"6.55","2005-07-12":"6.55","2005-07-13":"6.55","2005-07-14":"6.55","2005-07-15":"6.55","2005-07-18":"6.51","2005-07-19":"6.45","2005-07-20":"6.45","2005-07-21":"6.45","2005-07-22":"6.45","2005-07-25":"6.44","2005-07-26":"6.45","2005-07-27":"6.44","2005-07-28":"6.41","2005-07-29":"6.39","2005-08-01":"6.39","2005-08-02":"6.39","2005-08-03":"6.38","2005-08-04":"6.36","2005-08-05":"6.34","2005-08-08":"6.29","2005-08-09":"6.27","2005-08-10":"6.24","2005-08-11":"6.21","2005-08-12":"6.18","2005-08-15":"6.18","2005-08-16":"6.17","2005-08-17":"6.16","2005-08-18":"6.15","2005-08-19":"6.14","2005-08-22":"6.13","2005-08-23":"5.97","2005-08-24":"5.92","2005-08-25":"5.91","2005-08-26":"5.91","2005-08-29":"5.91","2005-08-30":"5.91","2005-08-31":"5.89","2005-09-01":"5.82","2005-09-02":"5.77","2005-09-05":"5.71","2005-09-06":"5.68","2005-09-07":"5.66","2005-09-08":"5.66","2005-09-09":"5.66","2005-09-12":"5.62","2005-09-13":"5.56","2005-09-14":"5.55","2005-09-15":"5.55","2005-09-16":"5.57","2005-09-19":"5.58","2005-09-20":"5.61","2005-09-21":"5.67","2005-09-22":"5.8","2005-09-23":"5.86","2005-09-26":"5.87","2005-09-27":"5.85","2005-09-28":"5.81","2005-09-29":"6.15","2005-09-30":"6.14","2005-10-03":"6.12","2005-10-04":"6.14","2005-10-05":"6.07","2005-10-06":"6.05","2005-10-07":"6.06","2005-10-10":"6.06","2005-10-11":"6.01","2005-10-12":"5.98","2005-10-13":"5.98","2005-10-14":"6.11","2005-10-17":"6.1","2005-10-18":"6.08","2005-10-19":"6.12","2005-10-20":"6.15","2005-10-21":"6.22","2005-10-24":"6.23","2005-10-25":"6.42","2005-10-26":"6.43","2005-10-27":"6.53","2005-10-28":"6.52","2005-11-02":"6.44","2005-11-03":"6.39","2005-11-04":"6.37","2005-11-05":"6.37","2005-11-07":"6.37","2005-11-08":"6.37","2005-11-09":"6.33","2005-11-10":"6.57","2005-11-11":"6.55","2005-11-14":"6.53","2005-11-15":"6.53","2005-11-16":"6.47","2005-11-17":"6.46","2005-11-18":"6.59","2005-11-21":"6.72","2005-11-22":"6.81","2005-11-23":"6.67","2005-11-24":"6.58","2005-11-25":"6.56","2005-11-28":"6.5","2005-11-29":"6.48","2005-11-30":"6.53","2005-12-01":"6.59","2005-12-02":"6.57","2005-12-05":"6.58","2005-12-06":"6.58","2005-12-07":"6.62","2005-12-08":"6.71","2005-12-09":"6.79","2005-12-12":"6.85","2005-12-13":"6.75","2005-12-14":"6.7","2005-12-15":"6.69","2005-12-16":"6.71","2005-12-19":"6.74","2005-12-20":"6.72","2005-12-21":"6.7","2005-12-22":"6.69","2005-12-23":"6.69","2005-12-27":"6.68","2005-12-28":"6.68","2005-12-29":"6.67","2005-12-30":"6.68","2006-01-02":"6.68","2006-01-03":"6.68","2006-01-04":"6.6","2006-01-05":"6.53","2006-01-06":"6.53","2006-01-09":"6.49","2006-01-10":"6.49","2006-01-11":"6.49","2006-01-12":"6.43","2006-01-13":"6.41","2006-01-16":"6.32","2006-01-17":"6.22","2006-01-18":"6.33","2006-01-19":"6.32","2006-01-20":"6.36","2006-01-23":"6.35","2006-01-24":"6.28","2006-01-25":"6.22","2006-01-26":"6.25","2006-01-27":"6.37","2006-01-30":"6.38","2006-01-31":"6.45","2006-02-01":"6.43","2006-02-02":"6.43","2006-02-03":"6.4","2006-02-06":"6.34","2006-02-07":"6.32","2006-02-08":"6.3","2006-02-09":"6.31","2006-02-10":"6.28","2006-02-13":"6.27","2006-02-14":"6.29","2006-02-15":"6.28","2006-02-16":"6.28","2006-02-17":"6.31","2006-02-20":"6.31","2006-02-21":"6.31","2006-02-22":"6.41","2006-02-23":"6.42","2006-02-24":"6.42","2006-02-27":"6.41","2006-02-28":"6.4","2006-03-01":"6.41","2006-03-02":"6.42","2006-03-03":"6.54","2006-03-06":"6.56","2006-03-07":"6.64","2006-03-08":"6.63","2006-03-09":"6.74","2006-03-10":"6.81","2006-03-13":"6.84","2006-03-14":"7.21","2006-03-16":"7.04","2006-03-17":"6.77","2006-03-20":"6.84","2006-03-21":"6.81","2006-03-22":"6.86","2006-03-23":"6.85","2006-03-24":"6.82","2006-03-27":"6.83","2006-03-28":"6.91","2006-03-29":"7.01","2006-03-30":"6.91","2006-03-31":"6.89","2006-04-03":"6.79","2006-04-04":"6.82","2006-04-05":"6.86","2006-04-06":"6.92","2006-04-07":"6.93","2006-04-10":"6.92","2006-04-11":"6.89","2006-04-12":"6.82","2006-04-13":"6.81","2006-04-14":"6.84","2006-04-18":"6.84","2006-04-19":"6.76","2006-04-20":"6.76","2006-04-21":"6.75","2006-04-24":"6.71","2006-04-25":"6.67","2006-04-26":"6.68","2006-04-27":"6.68","2006-04-28":"6.66","2006-05-02":"6.65","2006-05-03":"6.6","2006-05-04":"6.52","2006-05-05":"6.52","2006-05-08":"6.5","2006-05-09":"6.48","2006-05-10":"6.52","2006-05-11":"6.53","2006-05-12":"6.58","2006-05-15":"6.74","2006-05-16":"6.72","2006-05-17":"6.64","2006-05-18":"6.73","2006-05-19":"6.7","2006-05-22":"6.71","2006-05-23":"6.7","2006-05-24":"6.67","2006-05-25":"6.66","2006-05-26":"6.59","2006-05-29":"6.57","2006-05-30":"6.54","2006-05-31":"6.53","2006-06-01":"6.52","2006-06-02":"6.52","2006-06-06":"6.55","2006-06-07":"6.53","2006-06-08":"6.54","2006-06-09":"6.63","2006-06-12":"6.79","2006-06-13":"7.04","2006-06-14":"6.99","2006-06-15":"7.02","2006-06-16":"7.27","2006-06-19":"7.34","2006-06-20":"7.49","2006-06-21":"7.53","2006-06-22":"7.5","2006-06-23":"7.59","2006-06-26":"7.67","2006-06-27":"7.76","2006-06-28":"7.78","2006-06-29":"7.88","2006-06-30":"8.07","2006-07-03":"8.21","2006-07-04":"8.01","2006-07-05":"7.99","2006-07-06":"8.03","2006-07-07":"7.97","2006-07-10":"8","2006-07-11":"7.72","2006-07-12":"7.65","2006-07-13":"7.72","2006-07-14":"7.83","2006-07-17":"7.79","2006-07-18":"7.76","2006-07-19":"7.71","2006-07-20":"7.65","2006-07-21":"7.57","2006-07-24":"7.58","2006-07-25":"7.66","2006-07-26":"7.67","2006-07-27":"7.66","2006-07-28":"7.64","2006-07-31":"7.66","2006-08-01":"7.73","2006-08-02":"7.82","2006-08-03":"7.85","2006-08-04":"7.9","2006-08-07":"7.9","2006-08-08":"7.9","2006-08-09":"7.89","2006-08-10":"7.86","2006-08-11":"7.86","2006-08-14":"7.9","2006-08-15":"8.03","2006-08-16":"8.03","2006-08-17":"7.96","2006-08-18":"8.12","2006-08-21":"8.17","2006-08-22":"8.17","2006-08-23":"8.14","2006-08-24":"8.2","2006-08-25":"8.26","2006-08-28":"8.3","2006-08-29":"8.3","2006-08-30":"8.28","2006-08-31":"8.24","2006-09-01":"8.3","2006-09-04":"8.31","2006-09-05":"8.33","2006-09-06":"8.28","2006-09-07":"8.3","2006-09-08":"8.29","2006-09-11":"8.3","2006-09-12":"8.29","2006-09-13":"8.28","2006-09-14":"8.28","2006-09-15":"8.28","2006-09-18":"8.26","2006-09-19":"8.3","2006-09-20":"8.29","2006-09-21":"8.36","2006-09-22":"8.39","2006-09-25":"8.43","2006-09-26":"8.46","2006-09-27":"8.44","2006-09-28":"8.47","2006-09-29":"8.5","2006-10-02":"8.55","2006-10-03":"8.69","2006-10-04":"8.81","2006-10-05":"8.82","2006-10-06":"8.85","2006-10-09":"8.81","2006-10-10":"8.78","2006-10-11":"8.71","2006-10-12":"8.68","2006-10-13":"8.66","2006-10-16":"8.62","2006-10-17":"8.63","2006-10-18":"8.62","2006-10-19":"8.61","2006-10-20":"8.48","2006-10-24":"8.49","2006-10-25":"8.31","2006-10-26":"8.29","2006-10-27":"8.3","2006-10-30":"8.33","2006-10-31":"8.38","2006-11-02":"8.34","2006-11-03":"8.34","2006-11-06":"8.35","2006-11-07":"8.35","2006-11-08":"8.35","2006-11-09":"8.37","2006-11-10":"8.36","2006-11-13":"8.36","2006-11-14":"8.36","2006-11-15":"8.35","2006-11-16":"8.34","2006-11-17":"8.33","2006-11-20":"8.33","2006-11-21":"8.18","2006-11-22":"8.15","2006-11-23":"8.13","2006-11-24":"8.17","2006-11-27":"8.19","2006-11-28":"8.15","2006-11-29":"8.15","2006-11-30":"8.11","2006-12-01":"8.11","2006-12-04":"8.11","2006-12-05":"8.11","2006-12-06":"8.1","2006-12-07":"8.1","2006-12-08":"8.1","2006-12-11":"8.1","2006-12-12":"8.08","2006-12-13":"8.04","2006-12-14":"8.02","2006-12-15":"8.01","2006-12-18":"8","2006-12-19":"8","2006-12-20":"8","2006-12-21":"8","2006-12-22":"8","2006-12-27":"8","2006-12-28":"8","2006-12-29":"8","2007-01-02":"8","2007-01-03":"7.88","2007-01-04":"7.86","2007-01-05":"7.89","2007-01-08":"7.91","2007-01-09":"7.9","2007-01-10":"7.95","2007-01-11":"7.95","2007-01-12":"7.95","2007-01-15":"7.95","2007-01-16":"7.95","2007-01-17":"7.96","2007-01-18":"7.97","2007-01-19":"7.96","2007-01-22":"8.01","2007-01-23":"8.13","2007-01-24":"8.23","2007-01-25":"8.21","2007-01-26":"8.27","2007-01-29":"8.27","2007-01-30":"8.3","2007-01-31":"8.29","2007-02-01":"8.23","2007-02-02":"8.22","2007-02-05":"8.21","2007-02-06":"8.21","2007-02-07":"8.2","2007-02-08":"8.2","2007-02-09":"8.21","2007-02-12":"8.2","2007-02-13":"8.2","2007-02-14":"8.21","2007-02-15":"8.2","2007-02-16":"8.2","2007-02-19":"8.2","2007-02-20":"8.2","2007-02-21":"8.23","2007-02-22":"8.24","2007-02-23":"8.25","2007-02-26":"8.25","2007-02-27":"8.24","2007-02-28":"8.28","2007-03-01":"8.28","2007-03-02":"8.24","2007-03-05":"8.23","2007-03-06":"8.2","2007-03-07":"8.19","2007-03-08":"8.15","2007-03-09":"8.12","2007-03-10":"8.11","2007-03-12":"8.05","2007-03-13":"8.05","2007-03-14":"8.04","2007-03-19":"7.78","2007-03-20":"7.77","2007-03-21":"7.77","2007-03-22":"7.77","2007-03-23":"7.75","2007-03-26":"7.71","2007-03-27":"7.71","2007-03-28":"7.71","2007-03-29":"7.71","2007-03-30":"7.7","2007-04-02":"7.7","2007-04-03":"7.7","2007-04-04":"7.68","2007-04-05":"7.66","2007-04-06":"7.65","2007-04-10":"7.64","2007-04-11":"7.62","2007-04-12":"7.59","2007-04-13":"7.58","2007-04-16":"7.58","2007-04-17":"7.56","2007-04-18":"7.55","2007-04-19":"7.55","2007-04-20":"7.52","2007-04-21":"7.51","2007-04-23":"7.49","2007-04-24":"7.5","2007-04-25":"7.5","2007-04-26":"7.5","2007-04-27":"7.5","2007-05-02":"7.49","2007-05-03":"7.48","2007-05-04":"7.45","2007-05-07":"7.44","2007-05-08":"7.43","2007-05-09":"7.41","2007-05-10":"7.4","2007-05-11":"7.42","2007-05-14":"7.4","2007-05-15":"7.4","2007-05-16":"7.4","2007-05-17":"7.43","2007-05-18":"7.49","2007-05-21":"7.5","2007-05-22":"7.47","2007-05-23":"7.48","2007-05-24":"7.47","2007-05-25":"7.47","2007-05-29":"7.47","2007-05-30":"7.47","2007-05-31":"7.47","2007-06-01":"7.48","2007-06-04":"7.48","2007-06-05":"7.48","2007-06-06":"7.48","2007-06-07":"7.48","2007-06-08":"7.55","2007-06-11":"7.54","2007-06-12":"7.52","2007-06-13":"7.53","2007-06-14":"7.52","2007-06-15":"7.5","2007-06-18":"7.49","2007-06-19":"7.49","2007-06-20":"7.48","2007-06-21":"7.48","2007-06-22":"7.48","2007-06-25":"7.46","2007-06-26":"7.24","2007-06-27":"7.24","2007-06-28":"7.25","2007-06-29":"7.24","2007-07-02":"7.19","2007-07-03":"7.16","2007-07-04":"7.15","2007-07-05":"7.15","2007-07-06":"7.15","2007-07-09":"7.15","2007-07-10":"7.15","2007-07-11":"7.15","2007-07-12":"7.15","2007-07-13":"7.15","2007-07-16":"7.15","2007-07-17":"7.15","2007-07-18":"7.14","2007-07-19":"7.12","2007-07-20":"7.07","2007-07-23":"7.03","2007-07-24":"7.03","2007-07-25":"7.04","2007-07-26":"7.09","2007-07-27":"7.23","2007-07-30":"7.23","2007-07-31":"7.25","2007-08-01":"7.29","2007-08-02":"7.3","2007-08-03":"7.28","2007-08-06":"7.3","2007-08-07":"7.29","2007-08-08":"7.28","2007-08-09":"7.3","2007-08-10":"7.41","2007-08-13":"7.41","2007-08-14":"7.41","2007-08-15":"7.45","2007-08-16":"7.47","2007-08-17":"7.53","2007-08-21":"7.56","2007-08-22":"7.58","2007-08-23":"7.57","2007-08-24":"7.56","2007-08-27":"7.55","2007-08-28":"7.53","2007-08-29":"7.56","2007-08-30":"7.55","2007-08-31":"7.53","2007-09-03":"7.52","2007-09-04":"7.53","2007-09-05":"7.52","2007-09-06":"7.5","2007-09-07":"7.5","2007-09-10":"7.5","2007-09-11":"7.5","2007-09-12":"7.48","2007-09-13":"7.46","2007-09-14":"7.41","2007-09-17":"7.4","2007-09-18":"7.4","2007-09-19":"7.3","2007-09-20":"7.3","2007-09-21":"7.3","2007-09-24":"7.25","2007-09-25":"7.23","2007-09-26":"7.23","2007-09-27":"7.24","2007-09-28":"7.22","2007-10-01":"7.22","2007-10-02":"7.22","2007-10-03":"7.24","2007-10-04":"7.27","2007-10-05":"7.28","2007-10-08":"7.26","2007-10-09":"7.27","2007-10-10":"7.25","2007-10-11":"7.24","2007-10-12":"7.23","2007-10-15":"7.22","2007-10-16":"7.22","2007-10-17":"7.19","2007-10-18":"7.18","2007-10-19":"7.17","2007-10-20":"7.17","2007-10-24":"7.15","2007-10-25":"7.15","2007-10-26":"7.15","2007-10-27":"7.15","2007-10-29":"7.14","2007-10-30":"7.17","2007-10-31":"7.17","2007-11-05":"7.17","2007-11-06":"7.18","2007-11-07":"7.18","2007-11-08":"7.2","2007-11-09":"7.2","2007-11-12":"7.21","2007-11-13":"7.26","2007-11-14":"7.27","2007-11-15":"7.26","2007-11-16":"7.27","2007-11-19":"7.28","2007-11-20":"7.31","2007-11-21":"7.33","2007-11-22":"7.35","2007-11-23":"7.36","2007-11-26":"7.37","2007-11-27":"7.43","2007-11-28":"7.44","2007-11-29":"7.43","2007-11-30":"7.44","2007-12-03":"7.45","2007-12-04":"7.45","2007-12-05":"7.46","2007-12-06":"7.46","2007-12-07":"7.46","2007-12-10":"7.47","2007-12-11":"7.46","2007-12-12":"7.46","2007-12-13":"7.46","2007-12-14":"7.46","2007-12-17":"7.48","2007-12-18":"7.48","2007-12-19":"7.48","2007-12-20":"7.48","2007-12-21":"7.48","2007-12-22":"7.48","2007-12-27":"7.48","2007-12-28":"7.48","2007-12-29":"7.48","2008-01-02":"7.47","2008-01-03":"7.47","2008-01-04":"7.47","2008-01-07":"7.47","2008-01-08":"7.47","2008-01-09":"7.46","2008-01-10":"7.45","2008-01-11":"7.45","2008-01-14":"7.44","2008-01-15":"7.45","2008-01-16":"7.45","2008-01-17":"7.45","2008-01-18":"7.45","2008-01-21":"7.45","2008-01-22":"7.52","2008-01-23":"7.53","2008-01-24":"7.53","2008-01-25":"7.49","2008-01-28":"7.5","2008-01-29":"7.5","2008-01-30":"7.5","2008-01-31":"7.5","2008-02-01":"7.5","2008-02-04":"7.5","2008-02-05":"7.5","2008-02-06":"7.57","2008-02-07":"7.67","2008-02-08":"7.76","2008-02-11":"7.95","2008-02-12":"7.98","2008-02-13":"8.02","2008-02-14":"8.01","2008-02-15":"8.01","2008-02-18":"8.04","2008-02-19":"8.1","2008-02-20":"8.24","2008-02-21":"8.28","2008-02-22":"8.31","2008-02-25":"8.32","2008-02-26":"8.23","2008-02-27":"8.11","2008-02-28":"8.08","2008-02-29":"8.21","2008-03-03":"8.69","2008-03-04":"8.56","2008-03-05":"8.58","2008-03-06":"8.58","2008-03-07":"8.93","2008-03-10":"9.08","2008-03-11":"9.06","2008-03-12":"8.89","2008-03-13":"8.9","2008-03-14":"8.81","2008-03-17":"8.94","2008-03-18":"8.93","2008-03-19":"8.8","2008-03-20":"8.79","2008-03-21":"8.79","2008-03-25":"8.79","2008-03-26":"8.81","2008-03-27":"8.82","2008-03-28":"8.83","2008-03-31":"9.01","2008-04-01":"9.21","2008-04-02":"9.13","2008-04-03":"9.06","2008-04-04":"9.07","2008-04-07":"9.06","2008-04-08":"9.01","2008-04-09":"8.98","2008-04-10":"8.98","2008-04-11":"8.89","2008-04-14":"8.86","2008-04-15":"8.85","2008-04-16":"8.84","2008-04-17":"8.84","2008-04-18":"8.86","2008-04-21":"8.85","2008-04-22":"8.86","2008-04-23":"8.86","2008-04-24":"8.86","2008-04-25":"8.88","2008-04-26":"8.86","2008-04-28":"8.91","2008-04-29":"8.93","2008-04-30":"8.99","2008-05-05":"9.02","2008-05-06":"9.02","2008-05-07":"9.01","2008-05-08":"9.02","2008-05-09":"9.04","2008-05-13":"9.04","2008-05-14":"9.05","2008-05-15":"9.08","2008-05-16":"9.09","2008-05-19":"9.05","2008-05-20":"9.06","2008-05-21":"9.04","2008-05-22":"8.96","2008-05-23":"8.96","2008-05-26":"8.95","2008-05-27":"8.97","2008-05-28":"8.99","2008-05-29":"8.99","2008-05-30":"8.99","2008-06-02":"8.99","2008-06-03":"9","2008-06-04":"9.01","2008-06-05":"9.03","2008-06-06":"9.24","2008-06-09":"9.38","2008-06-10":"9.4","2008-06-11":"9.41","2008-06-12":"9.51","2008-06-13":"9.55","2008-06-16":"9.54","2008-06-17":"9.55","2008-06-18":"9.53","2008-06-19":"9.52","2008-06-20":"9.51","2008-06-23":"9.5","2008-06-24":"9.38","2008-06-25":"9.35","2008-06-26":"9.24","2008-06-27":"9.23","2008-06-30":"9.22","2008-07-01":"9.18","2008-07-02":"9.14","2008-07-03":"9.15","2008-07-04":"9.11","2008-07-07":"9.08","2008-07-08":"9.08","2008-07-09":"9.02","2008-07-10":"8.94","2008-07-11":"8.86","2008-07-14":"8.82","2008-07-15":"8.81","2008-07-16":"8.81","2008-07-17":"8.77","2008-07-18":"8.74","2008-07-21":"8.72","2008-07-22":"8.72","2008-07-23":"8.73","2008-07-24":"8.72","2008-07-25":"8.71","2008-07-28":"8.71","2008-07-29":"8.7","2008-07-30":"8.69","2008-07-31":"8.68","2008-08-01":"8.68","2008-08-04":"8.67","2008-08-05":"8.68","2008-08-06":"8.68","2008-08-07":"8.67","2008-08-08":"8.64","2008-08-11":"8.65","2008-08-12":"8.65","2008-08-13":"8.65","2008-08-14":"8.64","2008-08-15":"8.67","2008-08-18":"8.68","2008-08-19":"8.68","2008-08-21":"8.67","2008-08-22":"8.69","2008-08-25":"8.69","2008-08-26":"8.68","2008-08-27":"8.68","2008-08-28":"8.68","2008-08-29":"8.68","2008-09-01":"8.67","2008-09-02":"8.68","2008-09-03":"8.68","2008-09-04":"8.68","2008-09-05":"8.69","2008-09-08":"8.67","2008-09-09":"8.67","2008-09-10":"8.68","2008-09-11":"8.67","2008-09-12":"8.66","2008-09-15":"8.67","2008-09-16":"8.72","2008-09-17":"8.74","2008-09-18":"8.76","2008-09-19":"8.74","2008-09-22":"8.72","2008-09-23":"8.72","2008-09-24":"8.73","2008-09-25":"8.74","2008-09-26":"8.73","2008-09-29":"8.74","2008-09-30":"8.78","2008-10-01":"8.81","2008-10-02":"8.81","2008-10-03":"8.87","2008-10-06":"8.91","2008-10-07":"8.94","2008-10-08":"8.98","2008-10-09":"8.97","2008-10-10":"9.05","2008-10-13":"9.05","2008-10-14":"9.02","2008-10-15":"9.05","2008-10-16":"9.05","2008-10-17":"9.04","2008-10-18":"9.05","2008-10-20":"9.1","2008-10-21":"9.13","2008-10-22":"9.2","2008-10-27":"12.39","2008-10-28":"12.32","2008-10-29":"12.21","2008-10-30":"12.09","2008-10-31":"11.85","2008-11-03":"11.78","2008-11-04":"11.76","2008-11-05":"11.73","2008-11-06":"11.71","2008-11-07":"11.72","2008-11-10":"11.71","2008-11-11":"11.71","2008-11-12":"11.71","2008-11-13":"11.69","2008-11-14":"11.71","2008-11-17":"11.7","2008-11-18":"11.71","2008-11-19":"11.71","2008-11-20":"11.71","2008-11-21":"11.7","2008-11-24":"11.7","2008-11-25":"11.25","2008-11-26":"11.23","2008-11-27":"11.2","2008-11-28":"11.18","2008-12-01":"11.16","2008-12-02":"11.16","2008-12-03":"11.15","2008-12-04":"11.13","2008-12-05":"11.1","2008-12-08":"11.09","2008-12-09":"10.58","2008-12-10":"10.55","2008-12-11":"10.58","2008-12-12":"10.48","2008-12-15":"10.49","2008-12-16":"10.46","2008-12-17":"10.39","2008-12-18":"10.34","2008-12-19":"10.3","2008-12-20":"10.31","2008-12-22":"10.29","2008-12-23":"9.84","2008-12-29":"9.83","2008-12-30":"9.83","2008-12-31":"9.82","2009-01-05":"9.8","2009-01-06":"9.77","2009-01-07":"9.75","2009-01-08":"9.75","2009-01-09":"9.77","2009-01-12":"9.74","2009-01-13":"9.76","2009-01-14":"9.76","2009-01-15":"9.76","2009-01-16":"9.76","2009-01-19":"9.68","2009-01-20":"9.31","2009-01-21":"9.29","2009-01-22":"9.28","2009-01-23":"9.28","2009-01-26":"9.28","2009-01-27":"9.28","2009-01-28":"9.28","2009-01-29":"9.28","2009-01-30":"9.29","2009-02-02":"9.28","2009-02-03":"9.28","2009-02-04":"9.29","2009-02-05":"9.31","2009-02-06":"9.3","2009-02-09":"9.31","2009-02-10":"9.3","2009-02-11":"9.3","2009-02-12":"9.3","2009-02-13":"9.3","2009-02-16":"9.3","2009-02-17":"9.33","2009-02-18":"9.38","2009-02-19":"9.4","2009-02-20":"9.41","2009-02-23":"9.45","2009-02-24":"9.47","2009-02-25":"9.49","2009-02-26":"9.52","2009-02-27":"9.51","2009-03-02":"9.51","2009-03-03":"9.5","2009-03-04":"9.52","2009-03-05":"9.53","2009-03-06":"9.56","2009-03-09":"9.59","2009-03-10":"9.63","2009-03-11":"9.65","2009-03-12":"9.67","2009-03-13":"9.67","2009-03-16":"9.68","2009-03-17":"9.69","2009-03-18":"9.69","2009-03-19":"9.69","2009-03-20":"9.69","2009-03-23":"9.69","2009-03-24":"9.69","2009-03-25":"9.7","2009-03-26":"9.73","2009-03-27":"9.8","2009-03-28":"9.83","2009-03-30":"9.96","2009-03-31":"10.09","2009-04-01":"10.18","2009-04-02":"10.11","2009-04-03":"10.08","2009-04-06":"10.05","2009-04-07":"10.03","2009-04-08":"10.01","2009-04-09":"9.96","2009-04-10":"9.91","2009-04-14":"9.83","2009-04-15":"9.81","2009-04-16":"9.82","2009-04-17":"9.82","2009-04-20":"9.82","2009-04-21":"9.82","2009-04-22":"9.82","2009-04-23":"9.82","2009-04-24":"9.82","2009-04-27":"9.81","2009-04-28":"9.82","2009-04-29":"9.82","2009-04-30":"9.81","2009-05-04":"9.81","2009-05-05":"9.8","2009-05-06":"9.81","2009-05-07":"9.79","2009-05-08":"9.77","2009-05-11":"9.75","2009-05-12":"9.75","2009-05-13":"9.75","2009-05-14":"9.74","2009-05-15":"9.74","2009-05-18":"9.74","2009-05-19":"9.74","2009-05-20":"9.74","2009-05-21":"9.73","2009-05-22":"9.73","2009-05-25":"9.73","2009-05-26":"9.73","2009-05-27":"9.73","2009-05-28":"9.73","2009-05-29":"9.73","2009-06-02":"9.73","2009-06-03":"9.72","2009-06-04":"9.71","2009-06-05":"9.71","2009-06-08":"9.71","2009-06-09":"9.71","2009-06-10":"9.71","2009-06-11":"9.7","2009-06-12":"9.7","2009-06-15":"9.7","2009-06-16":"9.69","2009-06-17":"9.68","2009-06-18":"9.69","2009-06-19":"9.68","2009-06-22":"9.67","2009-06-23":"9.68","2009-06-24":"9.68","2009-06-25":"9.67","2009-06-26":"9.67","2009-06-29":"9.68","2009-06-30":"9.68","2009-07-01":"9.68","2009-07-02":"9.67","2009-07-03":"9.67","2009-07-06":"9.68","2009-07-07":"9.67","2009-07-08":"9.67","2009-07-09":"9.67","2009-07-10":"9.66","2009-07-13":"9.66","2009-07-14":"9.65","2009-07-15":"9.57","2009-07-16":"9.51","2009-07-17":"9.41","2009-07-20":"9.34","2009-07-21":"9.33","2009-07-22":"9.31","2009-07-23":"9.28","2009-07-24":"9.26","2009-07-27":"9.23","2009-07-28":"8.37","2009-07-29":"8.39","2009-07-30":"8.39","2009-07-31":"8.36","2009-08-03":"8.37","2009-08-04":"8.35","2009-08-05":"8.32","2009-08-06":"8.3","2009-08-07":"8.3","2009-08-10":"8.27","2009-08-11":"8.25","2009-08-12":"8.22","2009-08-13":"8.19","2009-08-14":"8.18","2009-08-17":"8.17","2009-08-18":"8.16","2009-08-19":"8.15","2009-08-24":"8.14","2009-08-25":"7.73","2009-08-26":"7.73","2009-08-27":"7.74","2009-08-28":"7.74","2009-08-29":"7.74","2009-08-31":"7.74","2009-09-01":"7.74","2009-09-02":"7.75","2009-09-03":"7.74","2009-09-04":"7.74","2009-09-07":"7.74","2009-09-08":"7.74","2009-09-09":"7.74","2009-09-10":"7.74","2009-09-11":"7.75","2009-09-14":"7.75","2009-09-15":"7.75","2009-09-16":"7.74","2009-09-17":"7.73","2009-09-18":"7.73","2009-09-21":"7.73","2009-09-22":"7.73","2009-09-23":"7.68","2009-09-24":"7.68","2009-09-25":"7.64","2009-09-28":"7.55","2009-09-29":"7.25","2009-09-30":"7.21","2009-10-01":"7.21","2009-10-02":"7.21","2009-10-05":"7.2","2009-10-06":"7.18","2009-10-07":"7.17","2009-10-08":"7.17","2009-10-09":"7.15","2009-10-12":"7.15","2009-10-13":"7.14","2009-10-14":"7.13","2009-10-15":"7.11","2009-10-16":"7.09","2009-10-19":"7.02","2009-10-20":"6.66","2009-10-21":"6.64","2009-10-22":"6.63","2009-10-26":"6.63","2009-10-27":"6.62","2009-10-28":"6.63","2009-10-29":"6.64","2009-10-30":"6.64","2009-11-02":"6.64","2009-11-03":"6.64","2009-11-04":"6.64","2009-11-05":"6.64","2009-11-06":"6.63","2009-11-09":"6.61","2009-11-10":"6.61","2009-11-11":"6.6","2009-11-12":"6.58","2009-11-13":"6.56","2009-11-16":"6.54","2009-11-17":"6.52","2009-11-18":"6.5","2009-11-19":"6.49","2009-11-20":"6.49","2009-11-23":"6.46","2009-11-24":"6.19","2009-11-25":"6.18","2009-11-26":"6.17","2009-11-27":"6.17","2009-11-30":"6.17","2009-12-01":"6.17","2009-12-02":"6.17","2009-12-03":"6.17","2009-12-04":"6.16","2009-12-07":"6.17","2009-12-08":"6.17","2009-12-09":"6.17","2009-12-10":"6.17","2009-12-11":"6.17","2009-12-14":"6.18","2009-12-15":"6.19","2009-12-16":"6.19","2009-12-17":"6.18","2009-12-18":"6.18","2009-12-19":"6.18","2009-12-21":"6.18","2009-12-22":"6.08","2009-12-23":"6.04","2009-12-28":"6.03","2009-12-29":"6.03","2009-12-30":"6.03","2010-01-04":"6.03","2010-01-05":"6.02","2010-01-06":"6.02","2010-01-07":"6.01","2010-01-08":"6","2010-01-11":"5.99","2010-01-12":"5.99","2010-01-13":"5.99","2010-01-14":"5.99","2010-01-15":"5.99","2010-01-18":"5.99","2010-01-19":"5.99","2010-01-20":"5.99","2010-01-21":"5.99","2010-01-22":"5.98","2010-01-25":"5.95","2010-01-26":"5.84","2010-01-27":"5.84","2010-01-28":"5.86","2010-01-29":"5.86","2010-02-01":"5.85","2010-02-02":"5.85","2010-02-03":"5.85","2010-02-04":"5.85","2010-02-05":"5.86","2010-02-08":"5.86","2010-02-09":"5.86","2010-02-10":"5.85","2010-02-11":"5.85","2010-02-12":"5.85","2010-02-15":"5.83","2010-02-16":"5.84","2010-02-17":"5.83","2010-02-18":"5.82","2010-02-19":"5.81","2010-02-22":"5.79","2010-02-23":"5.74","2010-02-24":"5.74","2010-02-25":"5.74","2010-02-26":"5.74","2010-03-01":"5.74","2010-03-02":"5.74","2010-03-03":"5.72","2010-03-04":"5.71","2010-03-05":"5.71","2010-03-08":"5.7","2010-03-09":"5.7","2010-03-10":"5.7","2010-03-11":"5.69","2010-03-12":"5.66","2010-03-16":"5.66","2010-03-17":"5.63","2010-03-18":"5.63","2010-03-19":"5.62","2010-03-22":"5.62","2010-03-23":"5.6","2010-03-24":"5.59","2010-03-25":"5.59","2010-03-26":"5.59","2010-03-29":"5.59","2010-03-30":"5.41","2010-03-31":"5.4","2010-04-01":"5.4","2010-04-02":"5.39","2010-04-06":"5.39","2010-04-07":"5.39","2010-04-08":"5.39","2010-04-09":"5.39","2010-04-12":"5.38","2010-04-13":"5.37","2010-04-14":"5.37","2010-04-15":"5.36","2010-04-16":"5.34","2010-04-19":"5.34","2010-04-20":"5.34","2010-04-21":"5.34","2010-04-22":"5.34","2010-04-23":"5.34","2010-04-26":"5.3","2010-04-27":"5.14","2010-04-28":"5.16","2010-04-29":"5.14","2010-04-30":"5.14","2010-05-03":"5.15","2010-05-04":"5.13","2010-05-05":"5.16","2010-05-06":"5.16","2010-05-07":"5.24","2010-05-10":"5.21","2010-05-11":"5.19","2010-05-12":"5.18","2010-05-13":"5.17","2010-05-14":"5.17","2010-05-17":"5.18","2010-05-18":"5.16","2010-05-19":"5.17","2010-05-20":"5.18","2010-05-21":"5.18","2010-05-25":"5.18","2010-05-26":"5.18","2010-05-27":"5.18","2010-05-28":"5.18","2010-05-31":"5.18","2010-06-01":"5.2","2010-06-02":"5.2","2010-06-03":"5.21","2010-06-04":"5.22","2010-06-07":"5.23","2010-06-08":"5.23","2010-06-09":"5.22","2010-06-10":"5.23","2010-06-11":"5.23","2010-06-14":"5.25","2010-06-15":"5.24","2010-06-16":"5.25","2010-06-17":"5.25","2010-06-18":"5.24","2010-06-21":"5.25","2010-06-22":"5.25","2010-06-23":"5.25","2010-06-24":"5.25","2010-06-25":"5.24","2010-06-28":"5.25","2010-06-29":"5.27","2010-06-30":"5.36","2010-07-01":"5.37","2010-07-02":"5.37","2010-07-05":"5.37","2010-07-06":"5.37","2010-07-07":"5.37","2010-07-08":"5.37","2010-07-09":"5.37","2010-07-12":"5.38","2010-07-13":"5.38","2010-07-14":"5.38","2010-07-15":"5.38","2010-07-16":"5.38","2010-07-19":"5.45","2010-07-20":"5.47","2010-07-21":"5.46","2010-07-22":"5.46","2010-07-23":"5.47","2010-07-26":"5.48","2010-07-27":"5.48","2010-07-28":"5.47","2010-07-29":"5.47","2010-07-30":"5.47","2010-08-02":"5.47","2010-08-03":"5.48","2010-08-04":"5.49","2010-08-05":"5.49","2010-08-06":"5.5","2010-08-09":"5.51","2010-08-10":"5.51","2010-08-11":"5.52","2010-08-12":"5.53","2010-08-13":"5.52","2010-08-16":"5.52","2010-08-17":"5.52","2010-08-18":"5.51","2010-08-19":"5.51","2010-08-23":"5.51","2010-08-24":"5.54","2010-08-25":"5.54","2010-08-26":"5.53","2010-08-27":"5.56","2010-08-30":"5.56","2010-08-31":"5.56","2010-09-01":"5.58","2010-09-02":"5.58","2010-09-03":"5.58","2010-09-06":"5.59","2010-09-07":"5.59","2010-09-08":"5.61","2010-09-09":"5.63","2010-09-10":"5.62","2010-09-13":"5.63","2010-09-14":"5.63","2010-09-15":"5.61","2010-09-16":"5.61","2010-09-17":"5.61","2010-09-20":"5.62","2010-09-21":"5.62","2010-09-22":"5.62","2010-09-23":"5.61","2010-09-24":"5.61","2010-09-27":"5.61","2010-09-28":"5.61","2010-09-29":"5.6","2010-09-30":"5.6","2010-10-01":"5.6","2010-10-04":"5.6","2010-10-05":"5.6","2010-10-06":"5.59","2010-10-07":"5.59","2010-10-08":"5.58","2010-10-11":"5.58","2010-10-12":"5.59","2010-10-13":"5.59","2010-10-14":"5.58","2010-10-15":"5.6","2010-10-18":"5.6","2010-10-19":"5.6","2010-10-20":"5.6","2010-10-21":"5.6","2010-10-22":"5.6","2010-10-25":"5.6","2010-10-26":"5.6","2010-10-27":"5.6","2010-10-28":"5.6","2010-10-29":"5.6","2010-11-02":"5.6","2010-11-03":"5.61","2010-11-04":"5.61","2010-11-05":"5.61","2010-11-08":"5.61","2010-11-09":"5.62","2010-11-10":"5.62","2010-11-11":"5.63","2010-11-12":"5.64","2010-11-15":"5.64","2010-11-16":"5.64","2010-11-17":"5.64","2010-11-18":"5.64","2010-11-19":"5.64","2010-11-22":"5.63","2010-11-23":"5.63","2010-11-24":"5.63","2010-11-25":"5.64","2010-11-26":"5.64","2010-11-29":"5.64","2010-11-30":"5.86","2010-12-01":"5.86","2010-12-02":"5.87","2010-12-03":"5.88","2010-12-06":"5.89","2010-12-07":"5.89","2010-12-08":"5.89","2010-12-09":"5.89","2010-12-10":"5.89","2010-12-11":"5.88","2010-12-13":"5.89","2010-12-14":"5.9","2010-12-15":"5.9","2010-12-16":"5.91","2010-12-17":"5.9","2010-12-20":"5.9","2010-12-21":"6.08","2010-12-22":"6.09","2010-12-23":"6.1","2010-12-27":"6.11","2010-12-28":"6.11","2010-12-29":"6.11","2010-12-30":"6.11","2010-12-31":"6.11","2011-01-03":"6.11","2011-01-04":"6.1","2011-01-05":"6.1","2011-01-06":"6.11","2011-01-07":"6.11","2011-01-10":"6.11","2011-01-11":"6.1","2011-01-12":"6.1","2011-01-13":"6.1","2011-01-14":"6.1","2011-01-17":"6.1","2011-01-18":"6.1","2011-01-19":"6.1","2011-01-20":"6.1","2011-01-21":"6.1","2011-01-24":"6.1","2011-01-25":"6.17","2011-01-26":"6.17","2011-01-27":"6.18","2011-01-28":"6.18","2011-01-31":"6.19","2011-02-01":"6.19","2011-02-02":"6.19","2011-02-03":"6.19","2011-02-04":"6.19","2011-02-07":"6.2","2011-02-08":"6.2","2011-02-09":"6.2","2011-02-10":"6.2","2011-02-11":"6.2","2011-02-14":"6.2","2011-02-15":"6.19","2011-02-16":"6.19","2011-02-17":"6.19","2011-02-18":"6.2","2011-02-21":"6.19","2011-02-22":"6.19","2011-02-23":"6.19","2011-02-24":"6.19","2011-02-25":"6.19","2011-02-28":"6.18","2011-03-01":"6.17","2011-03-02":"6.17","2011-03-03":"6.18","2011-03-04":"6.17","2011-03-07":"6.17","2011-03-08":"6.17","2011-03-09":"6.17","2011-03-10":"6.18","2011-03-11":"6.18","2011-03-16":"6.17","2011-03-17":"6.17","2011-03-18":"6.16","2011-03-19":"6.15","2011-03-21":"6.14","2011-03-22":"6.14","2011-03-23":"6.14","2011-03-24":"6.14","2011-03-25":"6.14","2011-03-28":"6.14","2011-03-29":"6.14","2011-03-30":"6.14","2011-03-31":"6.14","2011-04-01":"6.14","2011-04-04":"6.15","2011-04-05":"6.15","2011-04-06":"6.14","2011-04-07":"6.14","2011-04-08":"6.14","2011-04-11":"6.14","2011-04-12":"6.15","2011-04-13":"6.16","2011-04-14":"6.16","2011-04-15":"6.16","2011-04-18":"6.16","2011-04-19":"6.16","2011-04-20":"6.16","2011-04-21":"6.16","2011-04-22":"6.17","2011-04-26":"6.16","2011-04-27":"6.16","2011-04-28":"6.16","2011-04-29":"6.16","2011-05-02":"6.17","2011-05-03":"6.17","2011-05-04":"6.17","2011-05-05":"6.17","2011-05-06":"6.17","2011-05-09":"6.17","2011-05-10":"6.17","2011-05-11":"6.16","2011-05-12":"6.14","2011-05-13":"6.14","2011-05-16":"6.15","2011-05-17":"6.15","2011-05-18":"6.15","2011-05-19":"6.15","2011-05-20":"6.15","2011-05-23":"6.15","2011-05-24":"6.15","2011-05-25":"6.15","2011-05-26":"6.15","2011-05-27":"6.15","2011-05-30":"6.15","2011-05-31":"6.15","2011-06-01":"6.15","2011-06-02":"6.15","2011-06-03":"6.15","2011-06-06":"6.15","2011-06-07":"6.15","2011-06-08":"6.15","2011-06-09":"6.15","2011-06-10":"6.15","2011-06-14":"6.15","2011-06-15":"6.15","2011-06-16":"6.15","2011-06-17":"6.14","2011-06-20":"6.14","2011-06-21":"6.14","2011-06-22":"6.14","2011-06-23":"6.14","2011-06-24":"6.14","2011-06-27":"6.14","2011-06-28":"6.14","2011-06-29":"6.14","2011-06-30":"6.15","2011-07-01":"6.14","2011-07-04":"6.14","2011-07-05":"6.14","2011-07-06":"6.14","2011-07-07":"6.14","2011-07-08":"6.14","2011-07-11":"6.14","2011-07-12":"6.14","2011-07-13":"6.14","2011-07-14":"6.14","2011-07-15":"6.14","2011-07-18":"6.14","2011-07-19":"6.14","2011-07-20":"6.14","2011-07-21":"6.14","2011-07-22":"6.14","2011-07-25":"6.14","2011-07-26":"6.13","2011-07-27":"6.14","2011-07-28":"6.14","2011-07-29":"6.14","2011-08-01":"6.14","2011-08-02":"6.14","2011-08-03":"6.14","2011-08-04":"6.14","2011-08-05":"6.14","2011-08-08":"6.14","2011-08-09":"6.14","2011-08-10":"6.14","2011-08-11":"6.14","2011-08-12":"6.14","2011-08-15":"6.14","2011-08-16":"6.14","2011-08-17":"6.14","2011-08-18":"6.13","2011-08-19":"6.13","2011-08-22":"6.13","2011-08-23":"6.13","2011-08-24":"6.13","2011-08-25":"6.13","2011-08-26":"6.13","2011-08-29":"6.13","2011-08-30":"6.13","2011-08-31":"6.14","2011-09-01":"6.13","2011-09-02":"6.13","2011-09-05":"6.14","2011-09-06":"6.13","2011-09-07":"6.13","2011-09-08":"6.13","2011-09-09":"6.13","2011-09-12":"6.13","2011-09-13":"6.15","2011-09-14":"6.15","2011-09-15":"6.15","2011-09-16":"6.15","2011-09-19":"6.15","2011-09-20":"6.15","2011-09-21":"6.16","2011-09-22":"6.15","2011-09-23":"6.15","2011-09-26":"6.16","2011-09-27":"6.16","2011-09-28":"6.16","2011-09-29":"6.16","2011-09-30":"6.18","2011-10-03":"6.18","2011-10-04":"6.21","2011-10-05":"6.22","2011-10-06":"6.24","2011-10-07":"6.25","2011-10-10":"6.26","2011-10-11":"6.25","2011-10-12":"6.26","2011-10-13":"6.26","2011-10-14":"6.26","2011-10-17":"6.26","2011-10-18":"6.26","2011-10-19":"6.26","2011-10-20":"6.27","2011-10-21":"6.28","2011-10-24":"6.27","2011-10-25":"6.28","2011-10-26":"6.28","2011-10-27":"6.28","2011-10-28":"6.27","2011-11-02":"6.33","2011-11-03":"6.38","2011-11-04":"6.43","2011-11-05":"6.4","2011-11-07":"6.43","2011-11-08":"6.47","2011-11-09":"6.48","2011-11-10":"6.53","2011-11-11":"6.68","2011-11-14":"6.7","2011-11-15":"6.73","2011-11-16":"6.84","2011-11-17":"6.88","2011-11-18":"6.93","2011-11-21":"6.91","2011-11-22":"6.89","2011-11-23":"6.89","2011-11-24":"6.91","2011-11-25":"7.23","2011-11-28":"7.26","2011-11-29":"7.31","2011-11-30":"7.49","2011-12-01":"7.51","2011-12-02":"7.53","2011-12-05":"7.51","2011-12-06":"7.51","2011-12-07":"7.51","2011-12-08":"7.5","2011-12-09":"7.52","2011-12-12":"7.51","2011-12-13":"7.51","2011-12-14":"7.51","2011-12-15":"7.51","2011-12-16":"7.51","2011-12-19":"7.52","2011-12-20":"7.51","2011-12-21":"7.54","2011-12-22":"7.56","2011-12-23":"7.55","2011-12-27":"7.58","2011-12-28":"7.58","2011-12-29":"7.61","2011-12-30":"7.61","2012-01-02":"7.59","2012-01-03":"7.63","2012-01-04":"7.84","2012-01-05":"8.14","2012-01-06":"8.24","2012-01-09":"8.26","2012-01-10":"8.28","2012-01-11":"8.27","2012-01-12":"8.28","2012-01-13":"8.28","2012-01-16":"8.28","2012-01-17":"8.28","2012-01-18":"8.28","2012-01-19":"8.28","2012-01-20":"8.25","2012-01-23":"8.24","2012-01-24":"8.23","2012-01-25":"8.12","2012-01-26":"8.03","2012-01-27":"7.99","2012-01-30":"7.97","2012-01-31":"7.96","2012-02-01":"7.95","2012-02-02":"7.95","2012-02-03":"7.94","2012-02-06":"7.94","2012-02-07":"7.93","2012-02-08":"7.91","2012-02-09":"7.9","2012-02-10":"7.9","2012-02-13":"7.9","2012-02-14":"7.9","2012-02-15":"7.9","2012-02-16":"7.91","2012-02-17":"7.89","2012-02-20":"7.89","2012-02-21":"7.88","2012-02-22":"7.88","2012-02-23":"7.86","2012-02-24":"7.85","2012-02-27":"7.84","2012-02-28":"7.84","2012-02-29":"7.82","2012-03-01":"7.82","2012-03-02":"7.8","2012-03-05":"7.81","2012-03-06":"7.78","2012-03-07":"7.77","2012-03-08":"7.75","2012-03-09":"7.75","2012-03-12":"7.74","2012-03-13":"7.72","2012-03-14":"7.72","2012-03-19":"7.72","2012-03-20":"7.72","2012-03-21":"7.71","2012-03-22":"7.7","2012-03-23":"7.69","2012-03-24":"7.71","2012-03-26":"7.69","2012-03-27":"7.67","2012-03-28":"7.66","2012-03-29":"7.66","2012-03-30":"7.66","2012-04-02":"7.66","2012-04-03":"7.65","2012-04-04":"7.64","2012-04-05":"7.64","2012-04-06":"7.64","2012-04-10":"7.64","2012-04-11":"7.65","2012-04-12":"7.65","2012-04-13":"7.65","2012-04-16":"7.65","2012-04-17":"7.65","2012-04-18":"7.65","2012-04-19":"7.65","2012-04-20":"7.65","2012-04-21":"7.65","2012-04-23":"7.65","2012-04-24":"7.65","2012-04-25":"7.65","2012-04-26":"7.58","2012-04-27":"7.56","2012-05-02":"7.53","2012-05-03":"7.52","2012-05-04":"7.51","2012-05-07":"7.51","2012-05-08":"7.51","2012-05-09":"7.5","2012-05-10":"7.5","2012-05-11":"7.5","2012-05-14":"7.5","2012-05-15":"7.5","2012-05-16":"7.51","2012-05-17":"7.51","2012-05-18":"7.5","2012-05-21":"7.5","2012-05-22":"7.5","2012-05-23":"7.5","2012-05-24":"7.5","2012-05-25":"7.5","2012-05-29":"7.5","2012-05-30":"7.5","2012-05-31":"7.5","2012-06-01":"7.5","2012-06-04":"7.5","2012-06-05":"7.5","2012-06-06":"7.5","2012-06-07":"7.49","2012-06-08":"7.49","2012-06-11":"7.49","2012-06-12":"7.48","2012-06-13":"7.48","2012-06-14":"7.49","2012-06-15":"7.49","2012-06-18":"7.49","2012-06-19":"7.49","2012-06-20":"7.46","2012-06-21":"7.44","2012-06-22":"7.44","2012-06-25":"7.45","2012-06-26":"7.44","2012-06-27":"7.43","2012-06-28":"7.43","2012-06-29":"7.41","2012-07-02":"7.4","2012-07-03":"7.4","2012-07-04":"7.4","2012-07-05":"7.41","2012-07-06":"7.41","2012-07-09":"7.4","2012-07-10":"7.4","2012-07-11":"7.4","2012-07-12":"7.39","2012-07-13":"7.39","2012-07-16":"7.39","2012-07-17":"7.38","2012-07-18":"7.38","2012-07-19":"7.38","2012-07-20":"7.36","2012-07-23":"7.36","2012-07-24":"7.36","2012-07-25":"7.36","2012-07-26":"7.35","2012-07-27":"7.35","2012-07-30":"7.34","2012-07-31":"7.34","2012-08-01":"7.33","2012-08-02":"7.31","2012-08-03":"7.32","2012-08-06":"7.33","2012-08-07":"7.33","2012-08-08":"7.33","2012-08-09":"7.33","2012-08-10":"7.33","2012-08-13":"7.32","2012-08-14":"7.32","2012-08-15":"7.32","2012-08-16":"7.32","2012-08-17":"7.32","2012-08-21":"7.31","2012-08-22":"7.31","2012-08-23":"7.31","2012-08-24":"7.31","2012-08-27":"7.31","2012-08-28":"7.31","2012-08-29":"7.09","2012-08-30":"7.09","2012-08-31":"7.09","2012-09-03":"7.09","2012-09-04":"7.09","2012-09-05":"7.09","2012-09-06":"7.09","2012-09-07":"7.09","2012-09-10":"7.09","2012-09-11":"7.09","2012-09-12":"7.08","2012-09-13":"7.07","2012-09-14":"7.06","2012-09-17":"7.05","2012-09-18":"7.04","2012-09-19":"7.03","2012-09-20":"7.02","2012-09-21":"7.02","2012-09-24":"7.02","2012-09-25":"7.02","2012-09-26":"6.82","2012-09-27":"6.81","2012-09-28":"6.82","2012-10-01":"6.82","2012-10-02":"6.82","2012-10-03":"6.82","2012-10-04":"6.82","2012-10-05":"6.82","2012-10-08":"6.82","2012-10-09":"6.8","2012-10-10":"6.81","2012-10-11":"6.8","2012-10-12":"6.74","2012-10-15":"6.69","2012-10-16":"6.64","2012-10-17":"6.63","2012-10-18":"6.59","2012-10-19":"6.58","2012-10-24":"6.58","2012-10-25":"6.56","2012-10-26":"6.55","2012-10-27":"6.55","2012-10-29":"6.53","2012-10-30":"6.51","2012-10-31":"6.32","2012-11-05":"6.31","2012-11-06":"6.31","2012-11-07":"6.31","2012-11-08":"6.31","2012-11-09":"6.31","2012-11-10":"6.31","2012-11-12":"6.31","2012-11-13":"6.31","2012-11-14":"6.29","2012-11-15":"6.29","2012-11-16":"6.29","2012-11-19":"6.29","2012-11-20":"6.28","2012-11-21":"6.27","2012-11-22":"6.27","2012-11-23":"6.24","2012-11-26":"6.24","2012-11-27":"6.24","2012-11-28":"6.02","2012-11-29":"6.01","2012-11-30":"6.01","2012-12-01":"6.02","2012-12-03":"5.99","2012-12-04":"6.01","2012-12-05":"6.01","2012-12-06":"6.01","2012-12-07":"6.01","2012-12-10":"6","2012-12-11":"6","2012-12-12":"5.99","2012-12-13":"5.99","2012-12-14":"5.99","2012-12-15":"5.99","2012-12-17":"5.99","2012-12-18":"5.99","2012-12-19":"5.73","2012-12-20":"5.73","2012-12-21":"5.73","2012-12-27":"5.72","2012-12-28":"5.72","2013-01-02":"5.71","2013-01-03":"5.69","2013-01-04":"5.63","2013-01-07":"5.62","2013-01-08":"5.61","2013-01-09":"5.6","2013-01-10":"5.58","2013-01-11":"5.58","2013-01-14":"5.57","2013-01-15":"5.57","2013-01-16":"5.57","2013-01-17":"5.57","2013-01-18":"5.57","2013-01-21":"5.57","2013-01-22":"5.57","2013-01-23":"5.57","2013-01-24":"5.57","2013-01-25":"5.56","2013-01-28":"5.56","2013-01-29":"5.56","2013-01-30":"5.39","2013-01-31":"5.35","2013-02-01":"5.34","2013-02-04":"5.34","2013-02-05":"5.35","2013-02-06":"5.34","2013-02-07":"5.31","2013-02-08":"5.3","2013-02-11":"5.3","2013-02-12":"5.28","2013-02-13":"5.27","2013-02-14":"5.27","2013-02-15":"5.26","2013-02-18":"5.25","2013-02-19":"5.25","2013-02-20":"5.25","2013-02-21":"5.25","2013-02-22":"5.25","2013-02-25":"5.24","2013-02-26":"5.21","2013-02-27":"5.01","2013-02-28":"5","2013-03-01":"5","2013-03-04":"5","2013-03-05":"5","2013-03-06":"5","2013-03-07":"5","2013-03-08":"4.99","2013-03-11":"4.99","2013-03-12":"4.99","2013-03-13":"4.99","2013-03-14":"4.98","2013-03-18":"4.96","2013-03-19":"4.95","2013-03-20":"4.95","2013-03-21":"4.93","2013-03-22":"4.93","2013-03-25":"4.93","2013-03-26":"4.91","2013-03-27":"4.73","2013-03-28":"4.7","2013-03-29":"4.69","2013-04-02":"4.68","2013-04-03":"4.68","2013-04-04":"4.65","2013-04-05":"4.65","2013-04-08":"4.65","2013-04-09":"4.65","2013-04-10":"4.65","2013-04-11":"4.65","2013-04-12":"4.65","2013-04-15":"4.65","2013-04-16":"4.65","2013-04-17":"4.65","2013-04-18":"4.65","2013-04-19":"4.65","2013-04-22":"4.65","2013-04-23":"4.61","2013-04-24":"4.4","2013-04-25":"4.4","2013-04-26":"4.4","2013-04-29":"4.39","2013-04-30":"4.39","2013-05-02":"4.39","2013-05-03":"4.39","2013-05-06":"4.39","2013-05-07":"4.39","2013-05-08":"4.39","2013-05-09":"4.39","2013-05-10":"4.38","2013-05-13":"4.38","2013-05-14":"4.38","2013-05-15":"4.37","2013-05-16":"4.37","2013-05-17":"4.35","2013-05-21":"4.35","2013-05-22":"4.34","2013-05-23":"4.34","2013-05-24":"4.34","2013-05-27":"4.34","2013-05-28":"4.34","2013-05-29":"4.17","2013-05-30":"4.16","2013-05-31":"4.17","2013-06-03":"4.17","2013-06-04":"4.16","2013-06-05":"4.15","2013-06-06":"4.15","2013-06-07":"4.17","2013-06-10":"4.17","2013-06-11":"4.17","2013-06-12":"4.17","2013-06-13":"4.17","2013-06-14":"4.16","2013-06-17":"4.15","2013-06-18":"4.15","2013-06-19":"4.15","2013-06-20":"4.15","2013-06-21":"4.16","2013-06-24":"4.16","2013-06-25":"4.16","2013-06-26":"4.1","2013-06-27":"4.1","2013-06-28":"4.09","2013-07-01":"4.09","2013-07-02":"4.1","2013-07-03":"4.09","2013-07-04":"4.09","2013-07-05":"4.09","2013-07-08":"4.09","2013-07-09":"4.08","2013-07-10":"4.08","2013-07-11":"4.08","2013-07-12":"4.07","2013-07-15":"4.07","2013-07-16":"4.07","2013-07-17":"4.07","2013-07-18":"4.07","2013-07-19":"4.07","2013-07-22":"4.07","2013-07-23":"4.07","2013-07-24":"3.88","2013-07-25":"3.87","2013-07-26":"3.86","2013-07-29":"3.86","2013-07-30":"3.85","2013-07-31":"3.85","2013-08-01":"3.85","2013-08-02":"3.85","2013-08-05":"3.85","2013-08-06":"3.85","2013-08-07":"3.85","2013-08-08":"3.85","2013-08-09":"3.85","2013-08-12":"3.85","2013-08-13":"3.85","2013-08-14":"3.85","2013-08-15":"3.85","2013-08-16":"3.85","2013-08-21":"3.85","2013-08-22":"3.85","2013-08-23":"3.85","2013-08-24":"3.85","2013-08-26":"3.85","2013-08-27":"3.85","2013-08-28":"3.72","2013-08-29":"3.7","2013-08-30":"3.7","2013-09-02":"3.7","2013-09-03":"3.7","2013-09-04":"3.71","2013-09-05":"3.71","2013-09-06":"3.71","2013-09-09":"3.7","2013-09-10":"3.7","2013-09-11":"3.7","2013-09-12":"3.68","2013-09-13":"3.68","2013-09-16":"3.67","2013-09-17":"3.68","2013-09-18":"3.66","2013-09-19":"3.66","2013-09-20":"3.65","2013-09-23":"3.65","2013-09-24":"3.65","2013-09-25":"3.49","2013-09-26":"3.49","2013-09-27":"3.49","2013-09-30":"3.49","2013-10-01":"3.49","2013-10-02":"3.49","2013-10-03":"3.48","2013-10-04":"3.49","2013-10-07":"3.49","2013-10-08":"3.48","2013-10-09":"3.49","2013-10-10":"3.49","2013-10-11":"3.48","2013-10-14":"3.48","2013-10-15":"3.48","2013-10-16":"3.48","2013-10-17":"3.47","2013-10-18":"3.47","2013-10-21":"3.47","2013-10-22":"3.46","2013-10-24":"3.45","2013-10-25":"3.45","2013-10-28":"3.45","2013-10-29":"3.44","2013-10-30":"3.29","2013-10-31":"3.29","2013-11-04":"3.29","2013-11-05":"3.28","2013-11-06":"3.28","2013-11-07":"3.28","2013-11-08":"3.27","2013-11-11":"3.26","2013-11-12":"3.25","2013-11-13":"3.25","2013-11-14":"3.25","2013-11-15":"3.25","2013-11-18":"3.25","2013-11-19":"3.25","2013-11-20":"3.25","2013-11-21":"3.25","2013-11-22":"3.25","2013-11-25":"3.25","2013-11-26":"3.24","2013-11-27":"3.09","2013-11-28":"3.09","2013-11-29":"3.08","2013-12-02":"3.08","2013-12-03":"3.08","2013-12-04":"3.08","2013-12-05":"3.08","2013-12-06":"3.08","2013-12-07":"3.08","2013-12-09":"3.08","2013-12-10":"3.08","2013-12-11":"3.08","2013-12-12":"3.08","2013-12-13":"3.09","2013-12-16":"3.08","2013-12-17":"3.08","2013-12-18":"2.9","2013-12-19":"2.9","2013-12-20":"2.89","2013-12-21":"2.89","2013-12-23":"2.89","2013-12-30":"2.89","2013-12-31":"2.89","2014-01-02":"2.89","2014-01-03":"2.89","2014-01-06":"2.89","2014-01-07":"2.89","2014-01-08":"2.89","2014-01-09":"2.89","2014-01-10":"2.89","2014-01-13":"2.89","2014-01-14":"2.89","2014-01-15":"2.89","2014-01-16":"2.89","2014-01-17":"2.89","2014-01-20":"2.89","2014-01-21":"2.88","2014-01-22":"2.78","2014-01-23":"2.77","2014-01-24":"2.76","2014-01-27":"2.75","2014-01-28":"2.75","2014-01-29":"2.76","2014-01-30":"2.79","2014-01-31":"2.85","2014-02-03":"2.91","2014-02-04":"2.92","2014-02-05":"2.88","2014-02-06":"2.9","2014-02-07":"2.9","2014-02-10":"2.91","2014-02-11":"2.9","2014-02-12":"2.91","2014-02-13":"2.91","2014-02-14":"2.91","2014-02-17":"2.91","2014-02-18":"2.9","2014-02-19":"2.85","2014-02-20":"2.88","2014-02-21":"2.87","2014-02-24":"2.88","2014-02-25":"2.88","2014-02-26":"2.88","2014-02-27":"2.88","2014-02-28":"2.88","2014-03-03":"2.89","2014-03-04":"2.88","2014-03-05":"2.9","2014-03-06":"2.93","2014-03-07":"2.93","2014-03-10":"2.91","2014-03-11":"2.91","2014-03-12":"2.91","2014-03-13":"2.91","2014-03-14":"2.93","2014-03-17":"2.93","2014-03-18":"2.93","2014-03-19":"2.94","2014-03-20":"2.94","2014-03-21":"2.95","2014-03-24":"2.93","2014-03-25":"2.92","2014-03-26":"2.86","2014-03-27":"2.86","2014-03-28":"2.86","2014-03-31":"2.84","2014-04-01":"2.84","2014-04-02":"2.84","2014-04-03":"2.84","2014-04-04":"2.84","2014-04-07":"2.84","2014-04-08":"2.85","2014-04-09":"2.85","2014-04-10":"2.85","2014-04-11":"2.85","2014-04-14":"2.85","2014-04-15":"2.85","2014-04-16":"2.85","2014-04-17":"2.85","2014-04-18":"2.84","2014-04-22":"2.84","2014-04-23":"2.84","2014-04-24":"2.84","2014-04-25":"2.83","2014-04-28":"2.82","2014-04-29":"2.82","2014-04-30":"2.73","2014-05-05":"2.71","2014-05-06":"2.71","2014-05-07":"2.71","2014-05-08":"2.71","2014-05-09":"2.71","2014-05-10":"2.7","2014-05-12":"2.7","2014-05-13":"2.7","2014-05-14":"2.7","2014-05-15":"2.69","2014-05-16":"2.7","2014-05-19":"2.7","2014-05-20":"2.7","2014-05-21":"2.7","2014-05-22":"2.7","2014-05-23":"2.69","2014-05-26":"2.69","2014-05-27":"2.69","2014-05-28":"2.61","2014-05-29":"2.6","2014-05-30":"2.6","2014-06-02":"2.6","2014-06-03":"2.6","2014-06-04":"2.6","2014-06-05":"2.6","2014-06-06":"2.6","2014-06-10":"2.59","2014-06-11":"2.58","2014-06-12":"2.56","2014-06-13":"2.55","2014-06-16":"2.54","2014-06-17":"2.54","2014-06-18":"2.53","2014-06-19":"2.52","2014-06-20":"2.51","2014-06-23":"2.5","2014-06-24":"2.5","2014-06-25":"2.43","2014-06-26":"2.43","2014-06-27":"2.42","2014-06-30":"2.42","2014-07-01":"2.42","2014-07-02":"2.43","2014-07-03":"2.43","2014-07-04":"2.43","2014-07-07":"2.43","2014-07-08":"2.43","2014-07-09":"2.41","2014-07-10":"2.41","2014-07-11":"2.42","2014-07-14":"2.42","2014-07-15":"2.42","2014-07-16":"2.42","2014-07-17":"2.42","2014-07-18":"2.42","2014-07-21":"2.4","2014-07-22":"2.39","2014-07-23":"2.24","2014-07-24":"2.25","2014-07-25":"2.24","2014-07-28":"2.24","2014-07-29":"2.24","2014-07-30":"2.23","2014-07-31":"2.23","2014-08-01":"2.24","2014-08-04":"2.24","2014-08-05":"2.24","2014-08-06":"2.24","2014-08-07":"2.25","2014-08-08":"2.25","2014-08-11":"2.25","2014-08-12":"2.25","2014-08-13":"2.25","2014-08-14":"2.25","2014-08-15":"2.25","2014-08-18":"2.25","2014-08-19":"2.25","2014-08-21":"2.25","2014-08-22":"2.25","2014-08-25":"2.25","2014-08-26":"2.25","2014-08-27":"2.25","2014-08-28":"2.25","2014-08-29":"2.25","2014-09-01":"2.25","2014-09-02":"2.25","2014-09-03":"2.25","2014-09-04":"2.25","2014-09-05":"2.24","2014-09-08":"2.24","2014-09-09":"2.25","2014-09-10":"2.25","2014-09-11":"2.25","2014-09-12":"2.25","2014-09-15":"2.24","2014-09-16":"2.24","2014-09-17":"2.22","2014-09-18":"2.21","2014-09-19":"2.21","2014-09-22":"2.2","2014-09-23":"2.2","2014-09-24":"2.2","2014-09-25":"2.2","2014-09-26":"2.2","2014-09-29":"2.2","2014-09-30":"2.2","2014-10-01":"2.2","2014-10-02":"2.2","2014-10-03":"2.2","2014-10-06":"2.2","2014-10-07":"2.2","2014-10-08":"2.2","2014-10-09":"2.2","2014-10-10":"2.2","2014-10-13":"2.2","2014-10-14":"2.2","2014-10-15":"2.2","2014-10-16":"2.2","2014-10-17":"2.2","2014-10-18":"2.2","2014-10-20":"2.2","2014-10-21":"2.2","2014-10-22":"2.2","2014-10-27":"2.2","2014-10-28":"2.2","2014-10-29":"2.2","2014-10-30":"2.2","2014-10-31":"2.2","2014-11-03":"2.2","2014-11-04":"2.2","2014-11-05":"2.2","2014-11-06":"2.2","2014-11-07":"2.2","2014-11-10":"2.2","2014-11-11":"2.2","2014-11-12":"2.2","2014-11-13":"2.2","2014-11-14":"2.2","2014-11-17":"2.2","2014-11-18":"2.19","2014-11-19":"2.19","2014-11-20":"2.19","2014-11-21":"2.19","2014-11-24":"2.19","2014-11-25":"2.19","2014-11-26":"2.18","2014-11-27":"2.18","2014-11-28":"2.18","2014-12-01":"2.17","2014-12-02":"2.16","2014-12-03":"2.16","2014-12-04":"2.16","2014-12-05":"2.17","2014-12-08":"2.18","2014-12-09":"2.16","2014-12-10":"2.17","2014-12-11":"2.16","2014-12-12":"2.15","2014-12-13":"2.15","2014-12-15":"2.15","2014-12-16":"2.16","2014-12-17":"2.17","2014-12-18":"2.16","2014-12-19":"2.16","2014-12-22":"2.17","2014-12-23":"2.17","2014-12-29":"2.17","2014-12-30":"2.17","2014-12-31":"2.16","2015-01-05":"2.16","2015-01-06":"2.15","2015-01-07":"2.15","2015-01-08":"2.15","2015-01-09":"2.14","2015-01-10":"2.15","2015-01-12":"2.13","2015-01-13":"2.14","2015-01-14":"2.14","2015-01-15":"2.13","2015-01-16":"2.13","2015-01-19":"2.13","2015-01-20":"2.13","2015-01-21":"2.13","2015-01-22":"2.13","2015-01-23":"2.13","2015-01-26":"2.13","2015-01-27":"2.13","2015-01-28":"2.11","2015-01-29":"2.12","2015-01-30":"2.13","2015-02-02":"2.13","2015-02-03":"2.12","2015-02-04":"2.12","2015-02-05":"2.12","2015-02-06":"2.11","2015-02-09":"2.11","2015-02-10":"2.1","2015-02-11":"2.1","2015-02-12":"2.1","2015-02-13":"2.1","2015-02-16":"2.1","2015-02-17":"2.1","2015-02-18":"2.1","2015-02-19":"2.1","2015-02-20":"2.1","2015-02-23":"2.08","2015-02-24":"2.08","2015-02-25":"2.08","2015-02-26":"2.07","2015-02-27":"2.07","2015-03-02":"2.07","2015-03-03":"2.05","2015-03-04":"2.06","2015-03-05":"2.03","2015-03-06":"2.02","2015-03-09":"2.02","2015-03-10":"2.02","2015-03-11":"2.03","2015-03-12":"2.01","2015-03-13":"2.01","2015-03-16":"1.99","2015-03-17":"1.99","2015-03-18":"1.98","2015-03-19":"1.97","2015-03-20":"1.96","2015-03-23":"1.94","2015-03-24":"1.93","2015-03-25":"1.85","2015-03-26":"1.84","2015-03-27":"1.84","2015-03-30":"1.83","2015-03-31":"1.83","2015-04-01":"1.83","2015-04-02":"1.82","2015-04-03":"1.82","2015-04-07":"1.82","2015-04-08":"1.82","2015-04-09":"1.81","2015-04-10":"1.8","2015-04-13":"1.8","2015-04-14":"1.8","2015-04-15":"1.8","2015-04-16":"1.8","2015-04-17":"1.8","2015-04-20":"1.8","2015-04-21":"1.78","2015-04-22":"1.71","2015-04-23":"1.7","2015-04-24":"1.69","2015-04-27":"1.69","2015-04-28":"1.69","2015-04-29":"1.69","2015-04-30":"1.69","2015-05-04":"1.69","2015-05-05":"1.69","2015-05-06":"1.69","2015-05-07":"1.7","2015-05-08":"1.7","2015-05-11":"1.69","2015-05-12":"1.69","2015-05-13":"1.69","2015-05-14":"1.69","2015-05-15":"1.69","2015-05-18":"1.69","2015-05-19":"1.7","2015-05-20":"1.7","2015-05-21":"1.7","2015-05-22":"1.7","2015-05-26":"1.7","2015-05-27":"1.58","2015-05-28":"1.56","2015-05-29":"1.56","2015-06-01":"1.56","2015-06-02":"1.56","2015-06-03":"1.56","2015-06-04":"1.55","2015-06-05":"1.55","2015-06-08":"1.55","2015-06-09":"1.55","2015-06-10":"1.54","2015-06-11":"1.54","2015-06-12":"1.54","2015-06-15":"1.55","2015-06-16":"1.54","2015-06-17":"1.54","2015-06-18":"1.52","2015-06-19":"1.52","2015-06-22":"1.52","2015-06-23":"1.5","2015-06-24":"1.45","2015-06-25":"1.45","2015-06-26":"1.44","2015-06-29":"1.44","2015-06-30":"1.42","2015-07-01":"1.42","2015-07-02":"1.42","2015-07-03":"1.42","2015-07-06":"1.42","2015-07-07":"1.42","2015-07-08":"1.42","2015-07-09":"1.42","2015-07-10":"1.42","2015-07-13":"1.42","2015-07-14":"1.41","2015-07-15":"1.41","2015-07-16":"1.41","2015-07-17":"1.41","2015-07-20":"1.41","2015-07-21":"1.41","2015-07-22":"1.39","2015-07-23":"1.39","2015-07-24":"1.39","2015-07-27":"1.39","2015-07-28":"1.39","2015-07-29":"1.39","2015-07-30":"1.39","2015-07-31":"1.39","2015-08-03":"1.39","2015-08-04":"1.39","2015-08-05":"1.39","2015-08-06":"1.39","2015-08-07":"1.39","2015-08-08":"1.39","2015-08-10":"1.39","2015-08-11":"1.39","2015-08-12":"1.39","2015-08-13":"1.39","2015-08-14":"1.39","2015-08-17":"1.39","2015-08-18":"1.39","2015-08-19":"1.39","2015-08-24":"1.39","2015-08-25":"1.39","2015-08-26":"1.39","2015-08-27":"1.39","2015-08-28":"1.39","2015-08-31":"1.39","2015-09-01":"1.39","2015-09-02":"1.39","2015-09-03":"1.39","2015-09-04":"1.39","2015-09-07":"1.39","2015-09-08":"1.39","2015-09-09":"1.39","2015-09-10":"1.39","2015-09-11":"1.39","2015-09-14":"1.39","2015-09-15":"1.39","2015-09-16":"1.39","2015-09-17":"1.39","2015-09-18":"1.39","2015-09-21":"1.39","2015-09-22":"1.39","2015-09-23":"1.38","2015-09-24":"1.38","2015-09-25":"1.38","2015-09-28":"1.38","2015-09-29":"1.38","2015-09-30":"1.38","2015-10-01":"1.38","2015-10-02":"1.38","2015-10-05":"1.38","2015-10-06":"1.38","2015-10-07":"1.38","2015-10-08":"1.38","2015-10-09":"1.38","2015-10-12":"1.38","2015-10-13":"1.38","2015-10-14":"1.37","2015-10-15":"1.37","2015-10-16":"1.37","2015-10-19":"1.37","2015-10-20":"1.37","2015-10-21":"1.37","2015-10-22":"1.37","2015-10-26":"1.36","2015-10-27":"1.36","2015-10-28":"1.37","2015-10-29":"1.36","2015-10-30":"1.36","2015-11-02":"1.36","2015-11-03":"1.36","2015-11-04":"1.36","2015-11-05":"1.36","2015-11-06":"1.36","2015-11-09":"1.37","2015-11-10":"1.36","2015-11-11":"1.36","2015-11-12":"1.36","2015-11-13":"1.36","2015-11-16":"1.36","2015-11-17":"1.36","2015-11-18":"1.36","2015-11-19":"1.36","2015-11-20":"1.36","2015-11-23":"1.35","2015-11-24":"1.35","2015-11-25":"1.35","2015-11-26":"1.35","2015-11-27":"1.35","2015-11-30":"1.35","2015-12-01":"1.35","2015-12-02":"1.35","2015-12-03":"1.35","2015-12-04":"1.35","2015-12-07":"1.36","2015-12-08":"1.36","2015-12-09":"1.36","2015-12-10":"1.35","2015-12-11":"1.36","2015-12-12":"1.36","2015-12-14":"1.36","2015-12-15":"1.36","2015-12-16":"1.36","2015-12-17":"1.35","2015-12-18":"1.36","2015-12-21":"1.36","2015-12-22":"1.35","2015-12-23":"1.35","2015-12-28":"1.35","2015-12-29":"1.35","2015-12-30":"1.35","2015-12-31":"1.35","2016-01-04":"1.35","2016-01-05":"1.36","2016-01-06":"1.35","2016-01-07":"1.35","2016-01-08":"1.35","2016-01-11":"1.35","2016-01-12":"1.35","2016-01-13":"1.35","2016-01-14":"1.34","2016-01-15":"1.34","2016-01-18":"1.35","2016-01-19":"1.35","2016-01-20":"1.35","2016-01-21":"1.35","2016-01-22":"1.35","2016-01-25":"1.35","2016-01-26":"1.35","2016-01-27":"1.35","2016-01-28":"1.35","2016-01-29":"1.35","2016-02-01":"1.35","2016-02-02":"1.35","2016-02-03":"1.35","2016-02-04":"1.35","2016-02-05":"1.35","2016-02-08":"1.35","2016-02-09":"1.35","2016-02-10":"1.35","2016-02-11":"1.35","2016-02-12":"1.35","2016-02-15":"1.35","2016-02-16":"1.35","2016-02-17":"1.35","2016-02-18":"1.35","2016-02-19":"1.35","2016-02-22":"1.34","2016-02-23":"1.32","2016-02-24":"1.32","2016-02-25":"1.32","2016-02-26":"1.31","2016-02-29":"1.3","2016-03-01":"1.3","2016-03-02":"1.3","2016-03-03":"1.3","2016-03-04":"1.3","2016-03-05":"1.3","2016-03-07":"1.3","2016-03-08":"1.3","2016-03-09":"1.29","2016-03-10":"1.27","2016-03-11":"1.25","2016-03-16":"1.26","2016-03-17":"1.26","2016-03-18":"1.25","2016-03-21":"1.25","2016-03-22":"1.25","2016-03-23":"1.09","2016-03-24":"1.08","2016-03-25":"1.07","2016-03-29":"1.08","2016-03-30":"1.08","2016-03-31":"1.08","2016-04-01":"1.08","2016-04-04":"1.08","2016-04-05":"1.08","2016-04-06":"1.07","2016-04-07":"1.06","2016-04-08":"1.06","2016-04-11":"1.06","2016-04-12":"1.06","2016-04-13":"1.06","2016-04-14":"1.05","2016-04-15":"1.04","2016-04-18":"1.04","2016-04-19":"1.04","2016-04-20":"1.04","2016-04-21":"1.03","2016-04-22":"1.03","2016-04-25":"1.02","2016-04-26":"1.02","2016-04-27":"0.94","2016-04-28":"0.96","2016-04-29":"0.96","2016-05-02":"0.96","2016-05-03":"0.96","2016-05-04":"0.97","2016-05-05":"0.96","2016-05-06":"0.98","2016-05-09":"0.97","2016-05-10":"0.98","2016-05-11":"0.99","2016-05-12":"0.98","2016-05-13":"0.99","2016-05-17":"0.99","2016-05-18":"0.99","2016-05-19":"0.99","2016-05-20":"1","2016-05-23":"0.99","2016-05-24":"0.99","2016-05-25":"0.97","2016-05-26":"0.97","2016-05-27":"0.96","2016-05-30":"0.97","2016-05-31":"0.97","2016-06-01":"0.97","2016-06-02":"0.97","2016-06-03":"0.97","2016-06-06":"0.97","2016-06-07":"0.97","2016-06-08":"0.97","2016-06-09":"0.96","2016-06-10":"0.95","2016-06-13":"0.95","2016-06-14":"0.96","2016-06-15":"0.96","2016-06-16":"0.96","2016-06-17":"0.96","2016-06-20":"0.96","2016-06-21":"0.96","2016-06-22":"0.96","2016-06-23":"0.96","2016-06-24":"0.96","2016-06-27":"0.96","2016-06-28":"0.96","2016-06-29":"0.96","2016-06-30":"0.96","2016-07-01":"0.96","2016-07-04":"0.96","2016-07-05":"0.96","2016-07-06":"0.96","2016-07-07":"0.96","2016-07-08":"0.96","2016-07-11":"0.95","2016-07-12":"0.95","2016-07-13":"0.93","2016-07-14":"0.9","2016-07-15":"0.88","2016-07-18":"0.89","2016-07-19":"0.88","2016-07-20":"0.88","2016-07-21":"0.88","2016-07-22":"0.88","2016-07-25":"0.88","2016-07-26":"0.88","2016-07-27":"0.88","2016-07-28":"0.88","2016-07-29":"0.88","2016-08-01":"0.88","2016-08-02":"0.89","2016-08-03":"0.89","2016-08-04":"0.88","2016-08-05":"0.88","2016-08-08":"0.88","2016-08-09":"0.88","2016-08-10":"0.86","2016-08-11":"0.86","2016-08-12":"0.85","2016-08-15":"0.84","2016-08-16":"0.84","2016-08-17":"0.84","2016-08-18":"0.84","2016-08-19":"0.84","2016-08-22":"0.84","2016-08-23":"0.83","2016-08-24":"0.83","2016-08-25":"0.83","2016-08-26":"0.83","2016-08-29":"0.83","2016-08-30":"0.83","2016-08-31":"0.83","2016-09-01":"0.83","2016-09-02":"0.83","2016-09-05":"0.83","2016-09-06":"0.83","2016-09-07":"0.83","2016-09-08":"0.82","2016-09-09":"0.82","2016-09-12":"0.82","2016-09-13":"0.82","2016-09-14":"0.82","2016-09-15":"0.82","2016-09-16":"0.81","2016-09-19":"0.8","2016-09-20":"0.8","2016-09-21":"0.8","2016-09-22":"0.8","2016-09-23":"0.81","2016-09-26":"0.8","2016-09-27":"0.8","2016-09-28":"0.8","2016-09-29":"0.79","2016-09-30":"0.8","2016-10-03":"0.8","2016-10-04":"0.8","2016-10-05":"0.8","2016-10-06":"0.8","2016-10-07":"0.79","2016-10-10":"0.79","2016-10-11":"0.79","2016-10-12":"0.79","2016-10-13":"0.79","2016-10-14":"0.79","2016-10-15":"0.79","2016-10-17":"0.78","2016-10-18":"0.77","2016-10-19":"0.75","2016-10-20":"0.75","2016-10-21":"0.74","2016-10-24":"0.74","2016-10-25":"0.73","2016-10-26":"0.72","2016-10-27":"0.7","2016-10-28":"0.7","2016-11-02":"0.7","2016-11-03":"0.7","2016-11-04":"0.7","2016-11-07":"0.7","2016-11-08":"0.7","2016-11-09":"0.69","2016-11-10":"0.69","2016-11-11":"0.68","2016-11-14":"0.67","2016-11-15":"0.67","2016-11-16":"0.67","2016-11-17":"0.67","2016-11-18":"0.67","2016-11-21":"0.67","2016-11-22":"0.66","2016-11-23":"0.64","2016-11-24":"0.62","2016-11-25":"0.6","2016-11-28":"0.6","2016-11-29":"0.58","2016-11-30":"0.57","2016-12-01":"0.57","2016-12-02":"0.55","2016-12-05":"0.54","2016-12-06":"0.53","2016-12-07":"0.52","2016-12-08":"0.5","2016-12-09":"0.49","2016-12-12":"0.49","2016-12-13":"0.48","2016-12-14":"0.48","2016-12-15":"0.48","2016-12-16":"0.48","2016-12-19":"0.48","2016-12-20":"0.48","2016-12-21":"0.48","2016-12-22":"0.48","2016-12-23":"0.47","2016-12-27":"0.48","2016-12-28":"0.48","2016-12-29":"0.47","2016-12-30":"0.47","2017-01-02":"0.47","2017-01-03":"0.47","2017-01-04":"0.46","2017-01-05":"0.45","2017-01-06":"0.45","2017-01-09":"0.45","2017-01-10":"0.45","2017-01-11":"0.44","2017-01-12":"0.43","2017-01-13":"0.43","2017-01-16":"0.43","2017-01-17":"0.42","2017-01-18":"0.42","2017-01-19":"0.41","2017-01-20":"0.41","2017-01-23":"0.41","2017-01-24":"0.41","2017-01-25":"0.41","2017-01-26":"0.4","2017-01-27":"0.4","2017-01-30":"0.4","2017-01-31":"0.4","2017-02-01":"0.4","2017-02-02":"0.4","2017-02-03":"0.41","2017-02-06":"0.4","2017-02-07":"0.4","2017-02-08":"0.4","2017-02-09":"0.4","2017-02-10":"0.4","2017-02-13":"0.4","2017-02-14":"0.4","2017-02-15":"0.4","2017-02-16":"0.4","2017-02-17":"0.4","2017-02-20":"0.4","2017-02-21":"0.4","2017-02-22":"0.4","2017-02-23":"0.4","2017-02-24":"0.39","2017-02-27":"0.39","2017-02-28":"0.39","2017-03-01":"0.39","2017-03-02":"0.39","2017-03-03":"0.39","2017-03-06":"0.39","2017-03-07":"0.39","2017-03-08":"0.39","2017-03-09":"0.39","2017-03-10":"0.39","2017-03-13":"0.39","2017-03-14":"0.39","2017-03-16":"0.39","2017-03-17":"0.39","2017-03-20":"0.39","2017-03-21":"0.39","2017-03-22":"0.38","2017-03-23":"0.38","2017-03-24":"0.38","2017-03-27":"0.38","2017-03-28":"0.38","2017-03-29":"0.36","2017-03-30":"0.34","2017-03-31":"0.34","2017-04-03":"0.33","2017-04-04":"0.33","2017-04-05":"0.34","2017-04-06":"0.33","2017-04-07":"0.33","2017-04-10":"0.33","2017-04-11":"0.32","2017-04-12":"0.32","2017-04-13":"0.32","2017-04-18":"0.31","2017-04-19":"0.31","2017-04-20":"0.31","2017-04-21":"0.32","2017-04-24":"0.32","2017-04-25":"0.31","2017-04-26":"0.32","2017-04-27":"0.31","2017-04-28":"0.31","2017-05-02":"0.32","2017-05-03":"0.32","2017-05-04":"0.32","2017-05-05":"0.32","2017-05-08":"0.32","2017-05-09":"0.32","2017-05-10":"0.32","2017-05-11":"0.31","2017-05-12":"0.31","2017-05-15":"0.3","2017-05-16":"0.3","2017-05-17":"0.3","2017-05-18":"0.3","2017-05-19":"0.3","2017-05-22":"0.29","2017-05-23":"0.29","2017-05-24":"0.29","2017-05-25":"0.29","2017-05-26":"0.29","2017-05-29":"0.29","2017-05-30":"0.29","2017-05-31":"0.29","2017-06-01":"0.29","2017-06-02":"0.29","2017-06-06":"0.29","2017-06-07":"0.29","2017-06-08":"0.29","2017-06-09":"0.29","2017-06-12":"0.29","2017-06-13":"0.29","2017-06-14":"0.29","2017-06-15":"0.29","2017-06-16":"0.29","2017-06-19":"0.29","2017-06-20":"0.29","2017-06-21":"0.29","2017-06-22":"0.29","2017-06-23":"0.29","2017-06-26":"0.29","2017-06-27":"0.29","2017-06-28":"0.29","2017-06-29":"0.29","2017-06-30":"0.29","2017-07-03":"0.29","2017-07-04":"0.29","2017-07-05":"0.29","2017-07-06":"0.29","2017-07-07":"0.29","2017-07-10":"0.29","2017-07-11":"0.29","2017-07-12":"0.29","2017-07-13":"0.29","2017-07-14":"0.29","2017-07-17":"0.28","2017-07-18":"0.28","2017-07-19":"0.28","2017-07-20":"0.28","2017-07-21":"0.28","2017-07-24":"0.28","2017-07-25":"0.28","2017-07-26":"0.28","2017-07-27":"0.28","2017-07-28":"0.28","2017-07-31":"0.28","2017-08-01":"0.28","2017-08-02":"0.28","2017-08-03":"0.28","2017-08-04":"0.28","2017-08-07":"0.28","2017-08-08":"0.28","2017-08-09":"0.28","2017-08-10":"0.28","2017-08-11":"0.28","2017-08-14":"0.28","2017-08-15":"0.28","2017-08-16":"0.28","2017-08-17":"0.28","2017-08-18":"0.28","2017-08-21":"0.28","2017-08-22":"0.28","2017-08-23":"0.28","2017-08-24":"0.28","2017-08-25":"0.27","2017-08-28":"0.27","2017-08-29":"0.27","2017-08-30":"0.27","2017-08-31":"0.27","2017-09-01":"0.27","2017-09-04":"0.27","2017-09-05":"0.27","2017-09-06":"0.26","2017-09-07":"0.26","2017-09-08":"0.26","2017-09-11":"0.25","2017-09-12":"0.24","2017-09-13":"0.23","2017-09-14":"0.22","2017-09-15":"0.21","2017-09-18":"0.21","2017-09-19":"0.2","2017-09-20":"0.15","2017-09-21":"0.14","2017-09-22":"0.12","2017-09-25":"0.11","2017-09-26":"0.11","2017-09-27":"0.11","2017-09-28":"0.11","2017-09-29":"0.11","2017-10-02":"0.1","2017-10-03":"0.1","2017-10-04":"0.1","2017-10-05":"0.1","2017-10-06":"0.1","2017-10-09":"0.1","2017-10-10":"0.1","2017-10-11":"0.1","2017-10-12":"0.1","2017-10-13":"0.09","2017-10-16":"0.09","2017-10-17":"0.09","2017-10-18":"0.09","2017-10-19":"0.09","2017-10-20":"0.09","2017-10-24":"0.09","2017-10-25":"0.09","2017-10-26":"0.09","2017-10-27":"0.09","2017-10-30":"0.09","2017-10-31":"0.09","2017-11-02":"0.09","2017-11-03":"0.09","2017-11-06":"0.09","2017-11-07":"0.09","2017-11-08":"0.09","2017-11-09":"0.09","2017-11-10":"0.09","2017-11-13":"0.09","2017-11-14":"0.09","2017-11-15":"0.09","2017-11-16":"0.09","2017-11-17":"0.09","2017-11-20":"0.09","2017-11-21":"0.09","2017-11-22":"0.09","2017-11-23":"0.09","2017-11-24":"0.09","2017-11-27":"0.09","2017-11-28":"0.09","2017-11-29":"0.09","2017-11-30":"0.09","2017-12-01":"0.09","2017-12-04":"0.09","2017-12-05":"0.09","2017-12-06":"0.09","2017-12-07":"0.09","2017-12-08":"0.1","2017-12-11":"0.1","2017-12-12":"0.1","2017-12-13":"0.1","2017-12-14":"0.1","2017-12-15":"0.1","2017-12-18":"0.1","2017-12-19":"0.1","2017-12-20":"0.1","2017-12-21":"0.1","2017-12-22":"0.1","2017-12-27":"0.1","2017-12-28":"0.1","2017-12-29":"0.1","2018-01-02":"0.1","2018-01-03":"0.1","2018-01-04":"0.1","2018-01-05":"0.1","2018-01-08":"0.09","2018-01-09":"0.1","2018-01-10":"0.1","2018-01-11":"0.09","2018-01-12":"0.09","2018-01-15":"0.09","2018-01-16":"0.09","2018-01-17":"0.09","2018-01-18":"0.09","2018-01-19":"0.09","2018-01-22":"0.09","2018-01-23":"0.09","2018-01-24":"0.09","2018-01-25":"0.09","2018-01-26":"0.09","2018-01-29":"0.1","2018-01-30":"0.1","2018-01-31":"0.1","2018-02-01":"0.1","2018-02-02":"0.1","2018-02-05":"0.1","2018-02-06":"0.1","2018-02-07":"0.1","2018-02-08":"0.1","2018-02-09":"0.1","2018-02-12":"0.1","2018-02-13":"0.1","2018-02-14":"0.1","2018-02-15":"0.1","2018-02-16":"0.1","2018-02-19":"0.1","2018-02-20":"0.1","2018-02-21":"0.1","2018-02-22":"0.1","2018-02-23":"0.1","2018-02-26":"0.1","2018-02-27":"0.1","2018-02-28":"0.1","2018-03-01":"0.1","2018-03-02":"0.1","2018-03-05":"0.1","2018-03-06":"0.1","2018-03-07":"0.1","2018-03-08":"0.1","2018-03-09":"0.1","2018-03-10":"0.1","2018-03-12":"0.1","2018-03-13":"0.1","2018-03-14":"0.1","2018-03-19":"0.1","2018-03-20":"0.1","2018-03-21":"0.1","2018-03-22":"0.1","2018-03-23":"0.1","2018-03-26":"0.1","2018-03-27":"0.1","2018-03-28":"0.1","2018-03-29":"0.1","2018-04-03":"0.1","2018-04-04":"0.1","2018-04-05":"0.11","2018-04-06":"0.1","2018-04-09":"0.1","2018-04-10":"0.11","2018-04-11":"0.11","2018-04-12":"0.11","2018-04-13":"0.11","2018-04-16":"0.11","2018-04-17":"0.11","2018-04-18":"0.11","2018-04-19":"0.11","2018-04-20":"0.11","2018-04-21":"0.11","2018-04-23":"0.11","2018-04-24":"0.11","2018-04-25":"0.11","2018-04-26":"0.11","2018-04-27":"0.11","2018-05-02":"0.11","2018-05-03":"0.12","2018-05-04":"0.13","2018-05-07":"0.13","2018-05-08":"0.13","2018-05-09":"0.14","2018-05-10":"0.14","2018-05-11":"0.14","2018-05-14":"0.14","2018-05-15":"0.15","2018-05-16":"0.17","2018-05-17":"0.18","2018-05-18":"0.2","2018-05-22":"0.22","2018-05-23":"0.23","2018-05-24":"0.23","2018-05-25":"0.23","2018-05-28":"0.23","2018-05-29":"0.23","2018-05-30":"0.23","2018-05-31":"0.23","2018-06-01":"0.22","2018-06-04":"0.22","2018-06-05":"0.22","2018-06-06":"0.22","2018-06-07":"0.21","2018-06-08":"0.21","2018-06-11":"0.23","2018-06-12":"0.25","2018-06-13":"0.27","2018-06-14":"0.29"}

