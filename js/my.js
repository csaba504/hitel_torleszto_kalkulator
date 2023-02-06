/* All rights reserved to Csaba504 <csaba504@gmail.com>. Content free to copy for non-commercial use only.
 * The code was a legacy code. I just expanded it!
 *
 * */
var tableinstance;
const toastTrigger = document.getElementById('liveToastBtn');
const toastLiveExample = document.getElementById('liveToast');

let myChart;

const initalizeTooltips = () => {
  $('.tooltip').hide();
  document.querySelectorAll('.tooltip').forEach(tooltip => {
    tooltip.style.position = 'static';
  });
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl)
  );
};

let datapoints = [];

// Chart code
const loadChart = () => {
  const ctx = document.getElementById('myChart');
  const labels = [];
  // const datapoints = [
  //   10000000, 9500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000,
  //   7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000,
  //   7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000,
  //   7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000,
  //   7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000,
  //   7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000, 7500000,
  //   5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000,
  //   5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000,
  //   5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000,
  //   5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000,
  //   5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000,
  //   5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000,
  //   5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000,
  //   5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000, 5500000,
  //   5500000, 4500000, 4500000, 4500000, 4500000, 4500000, 4500000, 4500000,
  //   4500000, 4500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000,
  //   2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000,
  //   2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000,
  //   2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000,
  //   2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000,
  //   2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000,
  //   2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000,
  //   2500000, 2500000, 1500000, 500000, 0,
  // ];

  const DATA_COUNT = datapoints.length;
  for (let i = 0; i < DATA_COUNT; ++i) {
    labels.push(i.toString());
  }
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Tőketartozás',
        data: datapoints,
        borderColor: '#26A889',
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },
      // {
      //   label: 'Cubic interpolation',
      //   data: datapoints,
      //   borderColor: 'green',
      //   fill: false,
      //   tension: 0.4,
      // },
      // {
      //   label: 'Linear interpolation (default)',
      //   data: datapoints,
      //   borderColor: 'green',
      //   fill: false,
      // },
    ],
  };

  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        // title: {
        //   display: true,
        // },
        legend: {
          display: false,
        },
      },
      interaction: {
        intersect: false,
      },
      elements: {
        point: {
          radius: 0,
        },
      },
      scales: {
        x: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Hónapok',
            color: 'black',
            font: {
              weight: 'bold',
              size: 18,
              family: "'Titillium Web', sans-serif",
            },
          },
          grid: {
            display: false,
          },
          min: 0,
          max: datapoints.length - 1,
          ticks: {
            stepSize: 10,
            color: 'black',
            font: {
              size: 18,
              family: "'Titillium Web', sans-serif",
            },
          },
        },
        y: {
          display: true,
          // title: {
          //   display: true,
          //   text: 'Value',
          // },
          suggestedMin: 0,
          suggestedMax: 10000000,
          ticks: {
            stepSize: 5000000,
            color: 'black',
            font: {
              weight: 'bold',
              size: 18,
              family: "'Titillium Web', sans-serif",
            },
          },
        },
      },
    },
  });
  myChart.update();
};

// Gets remainingsum for chart

const getRemainingSum = () => {
  datapoints.splice(0, datapoints.length);
  for (let data of diagramdata) {
    datapoints.push(data[1]);
  }
  // document.getElementById('myChart').remove();
  loadChart();
};

$(function () {
  //   $('#data_export').click(data_export);
  //   document
  //     .getElementById('data_import')
  //     .addEventListener('change', data_import, false);

  $('#data_export_browser_button').click(data_export_browser);
  $('#data_import_browser_load').click(data_import_browser_load);
  $('#data_import_browser_delete').click(data_import_browser_delete);
  data_import_load();
  $('.formatted-double').on('input', function (event) {
    $(this).val(procNumberInput($(this).val()));
  });

  $('.formatted-integer').on('input', function (event) {
    $(this).val(procNumberInput($(this).val(), false));
  });

  $('.formatted-unsigned-integer').on('input', function (event) {
    $(this).val(procNumberInput($(this).val(), false, false));
  });

  $('.formatted-double').each(function (event) {
    $(this).val(procNumberInput($(this).val()));
  });

  $('.formatted-integer').each(function (event) {
    $(this).val(procNumberInput($(this).val(), false));
  });

  $('.formatted-unsigned-integer').each(function (event) {
    $(this).val(procNumberInput($(this).val(), false, false));
  });

  $('.money').each(function (event) {
    $(this).val(procNumberInput($(this).val(), true, true, 1, 2));
  });

  $('.money2').each(function (event) {
    $(this).val(procNumberInput($(this).val(), true, true, 2, 2));
  });

  $('.money').on('input', function (event) {
    $(this).val(procNumberInput($(this).val(), true, true, 1, 2));
  });

  $('.money2').on('input', function (event) {
    $(this).val(procNumberInput($(this).val(), true, true, 2, 2));
  });

  //   google.charts.load('current', { packages: ['corechart', 'line'] });
  //   google.charts.setOnLoadCallback(drawBasic);

  tableinstance = $('#tabla').DataTable({
    paging: false,
    ordering: false,
    info: false,
    searching: false,
    dom: 'Bfrtip',
    buttons: ['copy', 'excel', 'pdf'],
  });

  calc();
});

function procNumberInput(value, real, signed, precision, padTo, forcePad) {
  real = typeof real !== 'undefined' ? real : true;
  signed = typeof signed !== 'undefined' ? signed : true;
  precision = typeof precision !== 'undefined' ? precision : 9;
  padTo = typeof padTo !== 'undefined' ? padTo : 3;
  forcePad = typeof forcePad !== 'undefined' ? forcePad : false;

  var thousandsSeparator = ' ';
  var radix = ',';
  var altradix = '.';

  value = String(value);
  if (value == 'NaN') value = '0';

  if (real) {
    // change all '.' to ','
    var inputfilter = new RegExp(escapeRegExp(altradix), 'g');
    value = value.replace(inputfilter, radix);

    // change first ',' to '.'
    inputfilter = new RegExp(escapeRegExp(radix));
    value = value.replace(inputfilter, altradix);
  }

  if (signed) {
    // change all '-' to 'n'
    inputfilter = new RegExp(escapeRegExp('-'), 'g');
    value = value.replace(inputfilter, 'n');

    // change first 'n' to '-'
    inputfilter = new RegExp('^n');
    value = value.replace(inputfilter, '-');
  }

  if (real && signed) {
    // remove non-numeric characters except '-' or ','
    inputfilter = new RegExp('[^0-9.-]+', 'g');
  } else if (signed) {
    inputfilter = new RegExp('[^0-9-]+', 'g');
  } else if (real) {
    inputfilter = new RegExp('[^0-9.]+', 'g');
  } else {
    inputfilter = new RegExp('[^0-9]+', 'g');
  }

  value = value.replace(inputfilter, '');

  var pattern = new RegExp('^[0-9 -]*\\.\\d{' + (precision + 1) + ',}$');
  var append0 = false;

  if (padTo > 0 && real && pattern.test(value)) {
    value = (
      Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)
    ).toFixed(precision);
    append0 = true;
  }

  // change the '.' to ','
  var inputfilter = new RegExp(escapeRegExp(altradix));
  value = value.replace(inputfilter, radix);

  // add separators and change '.' to ','
  // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  var parts = value.split(radix);
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  if (append0 || forcePad) {
    if (parts[1] !== undefined) {
      if (parts[1].length < padTo)
        parts[1] = String(parts[1] + '000000000').slice(0, padTo);
    } else {
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
  if (elem.is('input')) {
    value = elem.val();
  } else {
    value = elem.html();
  }
  if (value == '') value = 0;
  value = String(value).replace(/ /g, '');
  value = value.replace(/\,/g, '.');

  return parseFloat(value);
}

function convert2Money3(input) {
  return procNumberInput(input, true, true, 3, 3, true);
}

function convert2Money1(input) {
  return procNumberInput(input, true, true, 1, 2, true);
}

function convert2Money2(input) {
  return procNumberInput(input, true, true, 2, 2, true);
}

function convert2precision(input, precision, length) {
  precision = typeof precision !== 'undefined' ? precision : 1;
  length = typeof length !== 'undefined' ? length : 1;
  return procNumberInput(input, true, true, precision, length, true);
}

function convert2integer(input) {
  return procNumberInput(input, false, true, 0, 0, false);
}

function torlesztoszamitas(osszeg, kamat, honapok) {
  var torleszto =
    (osszeg * Math.pow(1 + kamat, honapok) * kamat) /
    (Math.pow(1 + kamat, honapok) - 1);
  return Math.round(torleszto + 0.5);
}

function calcdue() {
  var futamido = getNumVal($('#runmonth'));
  var kamat = getNumVal($('#rate')) / 1200.0;
  var remain = getNumVal($('#loan'));
  var torleszto = torlesztoszamitas(remain, kamat, futamido);
  $('#due').val(convert2Money2(torleszto));
  calc();
}

function disablecost(id) {
  // if (parseInt($('input[name=pre-mode-' + id + ']:checked').val())) {
  if ($('select[name=pre-mode-' + id + ']').val()) {
    $('#pre-cost-' + id).prop('disabled', false);
    $('#pre-newdue-' + id).prop('disabled', false);
  } else {
    $('#pre-cost-' + id).prop('disabled', true);
    $('#pre-newdue-' + id).prop('disabled', true);
  }
}

var diagramdata = new Array();
var diagramdata_year = new Array();
var tabledata = new Array();

function calc() {
  // myChart.destroy();
  try {
    if (typeof window.localStorage !== 'undefined') {
      var run_calc = parseInt(window.localStorage['RunCalc']);
      if (isNaN(run_calc)) run_calc = 1;
      //   if (run_calc % 100 == 0) {
      //     if (run_calc < 501) {
      //       alert(
      //         'Köszönöm, hogy használod a Hitel törlesztő kalkulátort!\nRemélem, hogy nagyon sokat tudtam segíteni abban, hogy a számodra a lehető legjobb döntést hozd meg!\n \nHa úgy érzed, hogy a munkámmal hozzájárultam az életedhez, akkor kérlek támogass engem.\n\nElőre is nagyon köszönöm.\nKis Csaba'
      //       );
      //     } else if (run_calc < 2001) {
      //       alert(
      //         'Köszönöm, hogy használaod a Hitel törlesztő kalkulátort!\nÖrülök, hogy ilyen sokat használod, mert akkor gondolom hasznos számodra és segít a munkában, vagy az élet egyik legfontosabb pénzügyi döntésében!\n\nHa megteheted, kérkek támogass engem bármilyen formában, hogy tudjak hasonló hasznos tartalmakat készíteni!\nHa tudok neked bármilyen fejlesztéssel segíteni akkor is írj nyugodtan.\n\nKöszönettel, Kis Csaba'
      //       );
      //     } else {
      //       alert(
      //         'Úgy látom, hogy ezt az oldalt a munkádhoz használod, amiből neked bevételed származik. Kérlek támogasd a munkámat bármilyen módon.\nHa tudok neked esetleg segíteni bármilyen fejlesztéssel kapcsolatban, akkor vedd fel velem a kapcsolatot.\n\nKöszönöm, Kis Csaba'
      //       );
      //     }
      //   }
      window.localStorage['RunCalc'] = run_calc + 1;
    }
  } catch (err) {}

  if (getNumVal($('#runmonth')) == 0) $('#runmonth').val($('#run').val() * 12);

  //// Default setup
  var futamido = getNumVal($('#runmonth'));
  var new_futamido = futamido;
  var mar_befizetett = 0;
  var kamat = getNumVal($('#rate')) / 1200.0;
  var remain = getNumVal($('#loan'));
  var startLoan = getNumVal($('#loan'));
  var torleszto = getNumVal($('#due'));
  var i,
    j,
    prev,
    kamattorl,
    toketorl,
    loss = 0,
    lloss,
    min,
    totalAid = 0,
    pluspay = 0;
  tableinstance.clear();
  diagramdata = [];
  diagramdata_year = [];
  tabledata = [];
  var elotorl = new Array();
  var interestList = new Array();
  var temp = new Array();
  var otherLoss = getNumVal($('#startfee'));
  var otherLossTotal = getNumVal($('#startfee'));
  var max_months_pay = 0;

  gtag('event', startLoan.toString(), {
    event_category: getNumVal($('#rate')).toString(),
    event_label: torleszto.toString(),
    value: getNumVal($('#run')),
  });

  $('.prepayment-row').each(function (e) {
    var month = getNumVal($(this).find('[name="month"]'));
    var add = getNumVal($(this).find('[name="pre-add"]'));
    var aid = getNumVal($(this).find('[name="pre-aid"]'));
    var addfull = getNumVal($(this).find('[name="pre-add"]'));
    var rate = getNumVal($(this).find('[name="pre-rate"]')) / 100;
    var cost = getNumVal($(this).find('[name="pre-cost"]'));
    var costElement = $(this).find('[name="pre-cost"]');
    var newdue = Math.abs(getNumVal($(this).find('[name="pre-newdue"]')));
    var newdueElement = $(this).find('[name="pre-newdue"]');
    var mode = parseInt($(this).find('[name="pre-mode"]').val());

    //debugger;

    if (mode != 0) add = add - cost;
    add = add - add * rate;
    costElement.prop('disabled', false);
    newdueElement.prop('disabled', false);
    if (mode == 0) {
      lloss = addfull - add;
      newdue = 0;
      costElement.prop('disabled', true);
      newdueElement.prop('disabled', true);
    } else {
      lloss = cost + addfull - add;
    }
    if (month > 0 && add > 0) {
      elotorl.push([month, add, lloss, mode, aid, addfull, newdue]);
    }
  });

  // read elotorlesztesek
  // for (j = 0; j < prefieldnum; j++) {
  //   var month = getNumVal($('#month-' + j));
  //   var add = getNumVal($('#pre-add-' + j));
  //   var aid = getNumVal($('#pre-aid-' + j));
  //   var addfull = getNumVal($('#pre-add-' + j));
  //   var rate = getNumVal($('#pre-rate-' + j)) / 100;
  //   var cost = getNumVal($('#pre-cost-' + j));
  //   var newdue = Math.abs(getNumVal($('#pre-newdue-' + j)));
  //   var mode = parseInt($('input[name=pre-mode-' + j + ']:checked').val());

  //   if (mode != 0) add = add - cost;
  //   add = add - add * rate;
  //   if (mode == 0) {
  //     lloss = addfull - add;
  //     newdue = 0;
  //   } else {
  //     lloss = cost + addfull - add;
  //   }
  //   if (month > 0 && add > 0) {
  //     elotorl.push([month, add, lloss, mode, aid, addfull, newdue]);
  //   }
  // }
  for (j = 0; j < document.querySelectorAll('.interest-row').length - 1; j++) {
    var month = getNumVal($('#interest-month-' + j));
    var rate = getNumVal($('#interest-rate-' + j));
    var mode = parseInt($('input[name=interest-mode-' + j + ']:checked').val());

    if (month > 0 && rate > 0) {
      interestList.push([month, rate, mode]);
    }
  }

  ///Generate without prepayment

  var woRemain = remain;
  var woLoss = 0;
  for (woHonap = 1; woHonap <= futamido && woRemain >= 0; woHonap++) {
    prev = woRemain;
    kamattorl = Math.round(woRemain * kamat);
    toketorl = torleszto - kamattorl;
    woRemain = woRemain - toketorl;
    woLoss = woLoss + kamattorl;
    otherLoss += getNumVal($('#mountlyfee'));
  }

  var startFullPayable = woLoss + startLoan + otherLoss;
  $('#fin-full-months').html(
    woHonap -
      1 +
      ' (' +
      parseInt((woHonap - 1) / 12) +
      ' év ' +
      ((woHonap - 1) % 12) +
      ' hónap)'
  );
  $('#fin-full-loss').html(convert2Money2(woLoss) + ' Ft');
  $('#fin-full-total').html(convert2Money2(startFullPayable) + ' Ft');
  $('#fin-full-prepay').html(convert2Money2(otherLoss) + ' Ft');
  var startThm = thmCalculator(startLoan, startFullPayable, woHonap - 1);
  $('#fin-full-thm').html(startThm + '%');
  $('#fin-full-months-pay').html(
    convert2Money2(torleszto + getNumVal($('#mountlyfee'))) + ' Ft'
  );
  $('.fin-full-plus').html(convert2Money2(woLoss + otherLoss) + ' Ft');

  ///Generate data

  tabledata.push([
    0,
    '0',
    '0',
    Math.round(kamat * 1200 * 100) / 100,
    '0',
    '0',
    '0',
    convert2Money2(remain),
  ]);
  diagramdata.push([0, remain]);
  diagramdata_year.push([0, remain]);

  for (honap = 1; remain > 0 && honap <= 1000; honap++) {
    for (j = 0; j < interestList.length; j++) {
      var month = interestList[j][0];

      if (honap == month) {
        var rate = interestList[j][1];
        var mode = interestList[j][2];

        kamat = rate / 1200.0;

        if (mode == 0) {
          torleszto = torlesztoszamitas(remain, kamat, new_futamido);
        } else {
          new_futamido = futamidoszamitas(
            remain,
            kamat,
            torleszto,
            new_futamido
          );
        }
        tabledata.push([
          honap,
          '',
          '',
          Math.round(kamat * 1200 * 100) / 100,
          '',
          '',
          '',
          '',
        ]);
      }
    }
    for (j = 0; j < elotorl.length; j++) {
      var month = elotorl[j][0];

      if (honap == month) {
        var add = elotorl[j][1];
        var lloss = elotorl[j][2];
        var mode = elotorl[j][3];
        var aid = elotorl[j][4];
        var addfull = elotorl[j][5];
        var newdue = elotorl[j][6];

        pluspay += addfull - aid;
        totalAid += aid;
        otherLossTotal += lloss;
        //Bug Fix #3
        //loss = loss + lloss;
        remain = remain - add;
        if (remain < 0) {
          remain = 0;
        }
        mar_befizetett = mar_befizetett + add;
        if (mode == 0) {
          torleszto = torlesztoszamitas(remain, kamat, new_futamido);
        } else {
          if (newdue != 0) torleszto = newdue;
          new_futamido = futamidoszamitas(
            remain,
            kamat,
            torleszto,
            new_futamido
          );
        }
        tabledata.push([honap, '', '', '', '', convert2Money2(add), '', '']);
      }
    }

    prev = remain;
    kamattorl = Math.round(remain * kamat);
    toketorl = torleszto - kamattorl;
    remain = remain - toketorl;
    loss = loss + kamattorl;
    otherLossTotal += getNumVal($('#mountlyfee'));

    if (remain < 0) {
      remain = 0;
      toketorl = prev;
      torleszto = toketorl + kamattorl;
    }
    mar_befizetett = mar_befizetett + toketorl;
    if (max_months_pay < torleszto) max_months_pay = torleszto;

    tabledata.push([
      honap,
      convert2Money2(prev),
      convert2Money2(torleszto),
      Math.round(kamat * 1200 * 100) / 100,
      convert2Money2(kamattorl),
      convert2Money2(toketorl),
      convert2Money2(mar_befizetett + loss),
      convert2Money2(remain),
    ]);
    diagramdata.push([honap, remain]);
    if (honap % 12 == 0) {
      diagramdata_year.push([honap / 12, remain]);
    }
    new_futamido--;
  }

  var newFullPayable = loss + startLoan + otherLossTotal;
  $('#fin-months').html(
    honap -
      1 +
      ' (' +
      parseInt((honap - 1) / 12) +
      ' év ' +
      ((honap - 1) % 12) +
      ' hónap)'
  );
  $('#fin-loss').html(convert2Money2(loss) + ' Ft');
  $('#fin-total').html(convert2Money2(newFullPayable) + ' Ft');
  $('#fin-prepay').html(convert2Money2(otherLossTotal) + ' Ft');
  $('#fin-aid').html(convert2Money2(totalAid) + ' Ft');
  $('#fin-pluspay').html(convert2Money2(pluspay) + ' Ft');
  var newThm = thmCalculator(startLoan, newFullPayable, honap - 1);
  $('#fin-thm').html(newThm + '%');
  $('#fin-months-pay').html(
    convert2Money2(max_months_pay + getNumVal($('#mountlyfee'))) + ' Ft'
  );
  $('.fin-plus').html(convert2Money2(loss + otherLossTotal - totalAid) + ' Ft');

  $('#fin-diff-months').html(
    woHonap -
      honap +
      ' (' +
      parseInt((woHonap - honap) / 12) +
      ' év ' +
      ((woHonap - honap) % 12) +
      ' hónap)'
  );
  $('#fin-diff-loss').html(convert2Money2(woLoss - loss) + ' Ft');
  $('#fin-diff-total').html(
    convert2Money2(startFullPayable - newFullPayable) + ' Ft'
  );
  $('#fin-diff-prepay').html(
    convert2Money2(otherLossTotal - otherLoss) + ' Ft'
  );
  $('#fin-diff-aid').html(convert2Money2(totalAid) + ' Ft');
  $('#fin-diff-pluspay').html(convert2Money2(pluspay) + ' Ft');
  $('#fin-diff-thm').html(Math.round((startThm - newThm) * 1000) / 1000 + '%');
  $('#fin-diff-months-pay').html(
    convert2Money2(getNumVal($('#due')) - max_months_pay) + ' Ft'
  );
  $('#fin-diff-plus').html(
    convert2Money2(loss + otherLossTotal - totalAid - (woLoss + otherLoss)) +
      ' Ft'
  );

  $('.fin-saving').html(
    convert2Money2(woLoss - loss - (+otherLossTotal - otherLoss) + totalAid) +
      ' Ft'
  );

  if (tableinstance) {
    tableinstance.rows.add(tabledata).draw();
  }
  //   drawBasic();
  getRemainingSum();
}

function thmCalculator(startPrice, fullPrice, duration) {
  //XXX: ie bug :S
  try {
    if (typeof window.localStorage !== 'undefined') {
      var stored =
        window.localStorage[
          'thm' + startPrice + ' ' + fullPrice + ' ' + duration
        ];
      if (stored) {
        return stored;
      }
    }
  } catch (err) {}

  monthly = fullPrice / duration;

  r = 0.000001;
  calcPrice = startPrice + 1;
  while (startPrice < calcPrice) {
    r = r + 0.000001;
    calcPrice = monthly * (1 / r - 1 / (r * Math.pow(1 + r, duration)));
  }
  thm = Math.round(r * 12 * 100 * 1000) / 1000;
  if (typeof window.localStorage !== 'undefined') {
    window.localStorage['thm' + startPrice + ' ' + fullPrice + ' ' + duration] =
      thm;
  }
  return thm;
}

function futamidoszamitas(remain, kamat, torleszto, new_futamido) {
  var i = 0;
  var prev, kamattorl, toketorl;
  for (i = 1; remain > 0; i++) {
    prev = remain;
    kamattorl = Math.round(remain * kamat);
    toketorl = torleszto - kamattorl;
    remain = remain - toketorl;
    if (remain < 0) {
      remain = 0;
    }
  }
  return i - 1;
}

// function drawBasic() {
//   var data = new google.visualization.DataTable();
//   data.addColumn('number', 'X');
//   data.addColumn('number', 'Tőketartozás');

//   data.addRows(diagramdata);

//   var options = {
//     hAxis: {
//       title: 'Hónapok',
//     },
//     vAxis: {
//       title: 'Tőketartozás',
//     },
//   };
//   var chart = new google.visualization.LineChart(
//     document.getElementById('chart_div')
//   );
//   chart.draw(data, options);

//   data = new google.visualization.DataTable();
//   data.addColumn('number', 'X');
//   data.addColumn('number', 'Tőketartozás');

//   data.addRows(diagramdata_year);
//   options = {
//     hAxis: {
//       title: 'Évek',
//     },
//     vAxis: {
//       title: 'Tőketartozás',
//     },
//   };
//   chart = new google.visualization.LineChart(
//     document.getElementById('chart_year_div')
//   );
//   chart.draw(data, options);
// }

// var prefieldnum = 1;
// var prefieldnum = 0;
// var interestFieldNum = 0;

// calculatePreFieldNum = () => {
//   let prepaymentRows = document.querySelectorAll('.prepayment-row');
//   prefieldnum = prepaymentRows.length;
// };

// calculateInterestNum = () => {
//   let interestRows = document.querySelectorAll('.interest-row');
//   interestFieldNum = interestRows.length;
// };

const removePreRow = element => {
  $('.tooltip').hide();
  let parentRow = element.closest('.prepayment-row');
  $(parentRow).remove();
  if (document.querySelectorAll('.prepayment-row').length < 1) {
    $('#add-prefield').removeClass('d-none');
  }
  calc();
};

const removeInterestRow = element => {
  let parentRow = element.closest('.interest-row');
  $(parentRow).remove();
  if (document.querySelectorAll('.interest-row').length < 1) {
    $('#add-interest').removeClass('d-none');
  }
  calc();
};

const copyPreRow = element => {
  $('#add-prefield').addClass('d-none');
  let parentRow = element.closest('.prepayment-row');
  let monthVal = $(parentRow).find('input[name="month"]').val();
  let preAddVal = $(parentRow).find('input[name="pre-add"]').val();
  let preAidVal = $(parentRow).find('input[name="pre-aid"]').val();
  let preRateVal = $(parentRow).find('input[name="pre-rate"]').val();
  let preCostVal = $(parentRow).find('input[name="pre-cost"]').val();
  let preNewdueVal = $(parentRow).find('input[name="pre-newdue"]').val();
  let preModeVal = $(parentRow).find('[name="pre-mode"]').val();
  //debugger;

  var tmp = document.getElementsByClassName('prepayment-template')[0];

  var item = tmp.content.cloneNode(true);
  $(item).find('input[name="month"]').val(monthVal);
  $(item).find('input[name="pre-add"]').val(preAddVal);
  $(item).find('input[name="pre-aid"]').val(preAidVal);
  $(item).find('input[name="pre-rate"]').val(preRateVal);
  $(item).find('input[name="pre-cost"]').val(preCostVal);
  $(item).find('input[name="pre-newdue"]').val(preNewdueVal);
  $(item).find('[name="pre-mode"]').val(preModeVal);

  // debugger;

  $('#pre-inputs').append(item);

  calc();
  initalizeTooltips();
};

const copyInterestRow = element => {
  $('#add-interest').addClass('d-none');
  let parentRow = element.closest('.interest-row');
  let interestMonthVal = $(parentRow)
    .find('input[name="interest-month"]')
    .val();
  let interestRateVal = $(parentRow).find('input[name="interest-rate"]').val();
  let interestModeVal = $(parentRow).find('[name="interest-mode"]').val();
  //debugger;

  var tmp = document.getElementsByClassName('interest-template')[0];

  var item = tmp.content.cloneNode(true);
  $(item).find('input[name="interest-month"]').val(interestMonthVal);
  $(item).find('input[name="interest-rate"]').val(interestRateVal);
  $(item).find('[name="interest-mode"]').val(interestModeVal);

  // debugger;

  $('#interest-inputs').append(item);

  calc();
  initalizeTooltips();
};

function addPreFields() {
  $('#add-prefield').addClass('d-none');
  var tmp = document.getElementsByClassName('prepayment-template')[0];
  tmp = tmp.content.cloneNode(true);

  $('#pre-inputs').append(tmp);

  // $('#pre-add-' + prefieldnum).on('input', function (event) {
  //   $(this).val(procNumberInput($(this).val(), true, true, 1, 2));
  // });
  // $('#pre-aid-' + prefieldnum).on('input', function (event) {
  //   $(this).val(procNumberInput($(this).val(), true, true, 1, 2));
  // });
  // $('#pre-cost-' + prefieldnum).on('input', function (event) {
  //   $(this).val(procNumberInput($(this).val(), true, true, 1, 2));
  // });
  // $('#pre-newdue-' + prefieldnum).on('input', function (event) {
  //   $(this).val(procNumberInput($(this).val(), true, true, 1, 2));
  // });
  // $('#month-' + prefieldnum).on('input', function (event) {
  //   $(this).val(procNumberInput($(this).val(), false));
  // });
  // $('#pre-rate-' + prefieldnum).on('input', function (event) {
  //   $(this).val(procNumberInput($(this).val()));
  // });

  // prefieldnum++;

  initalizeTooltips();
}

function addInterestFields(interestMonth, interestRate) {
  // var tmp =
  //   '<tr><td><input id="interest-month-' +
  //   interestFieldNum +
  //   '" class="formatted-integer" type="text" placeholder="Hónap" onchange="calc();"></input></td><td><input id="interest-rate-' +
  //   interestFieldNum +
  //   '" class="money" type="text" placeholder="Új kamatláb" onchange="calc();"></input>%</td><td>- Törlesztő<input name="interest-mode-' +
  //   interestFieldNum +
  //   '" type="radio" value="0" onchange="calc();"  checked="true"></input><input name="interest-mode-' +
  //   interestFieldNum +
  //   '" type="radio" value="1" onchange="calc();"></input>Futamidő -</td></tr>';

  $('#add-interest').addClass('d-none');
  var tmp = document.getElementsByClassName('interest-template')[0];
  tmp = tmp.content.cloneNode(true);

  if (interestMonth && interestRate) {
    $(tmp).find('input[name="interest-month"]').val(interestMonth);
    $(tmp).find('input[name="interest-rate"]').val(interestRate);
    // $(tmp).find('[name="interest-mode"]').val(interestModeVal);
  }

  $('#interest-inputs').append(tmp);

  initalizeTooltips();
}
function resetInterestFields() {
  // interestFieldNum = document.querySelectorAll('.interest-row').length - 1;
  // var i;
  // for (i = 0; i < interestFieldNum - 1; i++) {
  //   $('#interest-inputs tr:last').remove();
  // }
  // interestFieldNum = 1;
  // $('#interest-month-0,#interest-rate-0').val('');
  const interestFields = document.querySelectorAll('.interest-row');
  interestFields.forEach(field => {
    field.remove();
  });
}
var bubor = [
  0.234, 0.177, 0.108, 0.1, 0.1, 0.094, 0.097, 0.09, 0.094, 0.196, 0.278, 0.285,
  0.29, 0.304, 0.321, 0.382, 0.399, 0.428, 0.495, 0.66, 0.767, 0.813, 0.852,
  0.913, 0.962, 0.978, 1.037, 1.222, 1.341, 1.35, 1.355, 1.358, 1.372, 1.387,
  1.39, 1.407, 1.518, 1.674, 1.77, 1.967, 2.1, 2.135, 2.163, 2.194, 2.2, 2.227,
  2.248, 2.364, 2.531, 2.687, 2.836, 2.908, 2.893, 2.848, 3.015, 3.233, 3.457,
  3.646, 3.83, 4.023, 4.15, 4.339, 4.59, 4.931, 5.253, 5.571, 5.927, 6.249,
  6.673, 7.024, 7.288, 7.38, 7.471, 7.505, 7.641, 7.726, 7.894, 8.124, 7.533,
  6.777, 6.255, 6.147, 6.136, 6.14, 6.146, 6.156, 6.154, 6.158, 6.193, 6.12,
  5.963, 5.639, 5.595, 5.608, 5.518, 5.417, 5.242, 5.177, 5.321, 5.636, 5.82,
  5.966, 6.143, 6.478, 6.953, 7.675, 8.09, 9.323, 9.694, 9.752, 9.903, 9.685,
  9.361, 9.544, 10.518, 11.616, 9.722, 8.706, 8.671, 8.865, 9.338, 9.017, 8.941,
  8.83, 7.971, 7.476, 7.469, 7.297, 7.205, 7.39, 7.441, 7.14, 7.448, 7.45,
  7.579, 7.954, 8.219, 8.036, 8.046, 8.274, 8.591, 8.34, 8.035, 7.785, 7.191,
  6.609, 6.795, 6.788, 6.346, 6.417, 6.685, 6.509, 6.169, 5.734, 6.148, 6.507,
  6.957, 7.398, 7.46, 7.321, 7.969, 8.593, 8.896, 9.49, 10.201, 10.758, 10.688,
  11.061, 11.047, 10.666, 10.63, 11.515, 12.474, 11.552,
];
function addInterest(mounth, plusInterest) {
  resetInterestFields();
  plusInterest = typeof plusInterest !== 'undefined' ? plusInterest : 2.5;
  for (i = 1; i <= bubor.length - 1; i++) {
    if (i % mounth == 0) {
      // $('#interest-month-' + (interestFieldNum - 2)).val(i);
      // $('#interest-rate-' + (interestFieldNum - 2)).val(
      //   Math.round((bubor[i] + plusInterest) * 1000) / 1000
      // );
      addInterestFields(i, Math.round((bubor[i] + plusInterest) * 1000) / 1000);
    }
  }
  addInterestFields();
}

// functions by Kukel Attila <kukel.attila 'at' gmail 'dot' com>

function data_load(name) {
  data_from_storage = JSON.parse(sessionStorage.getItem(name));

  const loadPrepayments = () => {
    $('#add-prefield').addClass('d-none');

    document.querySelectorAll('.prepayment-row').forEach(row => {
      row.remove();
    });

    data_from_storage.prepayments.forEach(prepayment => {
      var tmp = document.getElementsByClassName('prepayment-template')[0];
      var item = tmp.content.cloneNode(true);
      $(item).find('input[name="month"]').val(prepayment.month);
      $(item).find('input[name="pre-add"]').val(prepayment.preAdd);
      $(item).find('input[name="pre-aid"]').val(prepayment.preAid);
      $(item).find('input[name="pre-rate"]').val(prepayment.preRate);
      $(item).find('input[name="pre-cost"]').val(prepayment.preCost);
      $(item).find('input[name="pre-newdue"]').val(prepayment.preNewdue);
      $(item).find('[name="pre-mode"]').val(prepayment.preMode);

      // debugger;

      $('#pre-inputs').append(item);
    });

    calc();
    initalizeTooltips();
  };

  const loadInterests = () => {
    $('#add-interest').addClass('d-none');

    document.querySelectorAll('.interest-row').forEach(row => {
      row.remove();
    });

    data_from_storage.interests.forEach(interest => {
      var tmp = document.getElementsByClassName('interest-template')[0];
      var item = tmp.content.cloneNode(true);
      $(item).find('input[name="interest-month"]').val(interest.interestMonth);
      $(item).find('input[name="interest-rate"]').val(interest.interestRate);
      $(item).find('[name="interest-mode"]').val(interest.interestMode);

      // debugger;

      $('#interest-inputs').append(item);
    });

    calc();
    initalizeTooltips();
  };

  if (data_from_storage) {
    $('#loan').val(data_from_storage.loan);
    $('#rate').val(data_from_storage.rate);
    $('#run').val(data_from_storage.run);
    if (typeof data_from_storage.runmonth != 'undefined')
      $('#runmonth').val(data_from_storage.runmonth);
    else $('#runmonth').val('');
    $('#due').val(data_from_storage.due);
    $('#startfee').val(data_from_storage.startfee);
    $('#mountlyfee').val(data_from_storage.mountlyfee);

    loadPrepayments();
    loadInterests();

    if (data_from_storage.pre.key_count) {
      for (i = 1; i < data_from_storage.pre.key_count; i++) {
        addPreFields();
      }
      for (i = 0; i <= data_from_storage.pre.key_count; i++) {
        $('#month-' + i).val(data_from_storage.pre.month[i]);
        $('#pre-add-' + i).val(data_from_storage.pre.pre_add[i]);
        $('#pre-aid-' + i).val(data_from_storage.pre.pre_aid[i]);
        $('#pre-rate-' + i).val(data_from_storage.pre.pre_rate[i]);
        $('#pre-cost-' + i).val(data_from_storage.pre.pre_cost[i]);
        if (typeof data_from_storage.pre.pre_newdue != 'undefined')
          $('#pre-newdue-' + i).val(data_from_storage.pre.pre_newdue[i]);
        $(
          'input[name=pre-mode-' +
            i +
            '][value=' +
            data_from_storage.pre.pre_mode[i] +
            ']'
        ).click();
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
var pre_newdue = new Array();
var pre_mode = new Array();
function data_save(name) {
  $.each($('#pre-inputs tr'), function (key, value) {
    if (key === 0) {
      // skip first row
      return true;
    }
    month[key - 1] = $(value)
      .find('td input#month-' + (key - 1) + '')
      .val();
    pre_add[key - 1] = $(value)
      .find('td input#pre-add-' + (key - 1) + '')
      .val();
    pre_aid[key - 1] = $(value)
      .find('td input#pre-aid-' + (key - 1) + '')
      .val();
    pre_rate[key - 1] = $(value)
      .find('td input#pre-rate-' + (key - 1) + '')
      .val();
    pre_cost[key - 1] = $(value)
      .find('td input#pre-cost-' + (key - 1) + '')
      .val();
    pre_newdue[key - 1] = $(value)
      .find('td input#pre-newdue-' + (key - 1) + '')
      .val();
    pre_mode[key - 1] = $(value)
      .find('td input[name=pre-mode-' + (key - 1) + ']:checked')
      .val();
  });

  const prepayments = [];
  const prepaymentRow = document.querySelectorAll('.prepayment-row');
  const interests = [];
  const interestRow = document.querySelectorAll('.interest-row');

  prepaymentRow.forEach((row, index) => {
    prepayments.push({
      month: document.querySelectorAll('.prepayment-row input[name="month"]')[
        index
      ].value,
      preAdd: document.querySelectorAll(
        '.prepayment-row input[name="pre-add"]'
      )[index].value,
      preAid: document.querySelectorAll(
        '.prepayment-row input[name="pre-aid"]'
      )[index].value,
      preRate: document.querySelectorAll(
        '.prepayment-row input[name="pre-rate"]'
      )[index].value,
      preCost: document.querySelectorAll(
        '.prepayment-row input[name="pre-cost"]'
      )[index].value,
      preNewdue: document.querySelectorAll(
        '.prepayment-row input[name="pre-newdue"]'
      )[index].value,
      preMode: document.querySelectorAll(
        '.prepayment-row select[name="pre-mode"]'
      )[index].value,
    });
  });

  interestRow.forEach((row, index) => {
    interests.push({
      interestMonth: document.querySelectorAll(
        '.interest-row input[name="interest-month"]'
      )[index].value,
      interestRate: document.querySelectorAll(
        '.interest-row input[name="interest-rate"]'
      )[index].value,
      interestMode: document.querySelectorAll(
        '.interest-row select[name="interest-mode"]'
      )[index].value,
    });
  });

  data_to_save = {
    loan: $('#loan').val(),
    rate: $('#rate').val(),
    run: $('#run').val(),
    runmonth: $('#runmonth').val(),
    due: $('#due').val(),
    startfee: $('#startfee').val(),
    mountlyfee: $('#mountlyfee').val(),
    pre: {
      month: month,
      pre_add: pre_add,
      pre_aid: pre_aid,
      pre_rate: pre_rate,
      pre_cost: pre_cost,
      pre_newdue: pre_newdue,
      pre_mode: pre_mode,
      key_count: $('input[id^=month-]').length,
    },
    prepayments: prepayments,
    interests: interests,
  };
  sessionStorage.setItem(name, JSON.stringify(data_to_save));
}

function data_export() {
  if (typeof Storage !== 'undefined') {
    //save data
    data_save('UtolsóMentés');
    var element = document.createElement('a');
    element.style.display = 'none';
    element.setAttribute(
      'href',
      'data:text/json;charset=utf-8,' +
        encodeURIComponent(sessionStorage.getItem('UtolsóMentés'))
    );
    element.setAttribute('download', 'szamolo.json');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  } else {
    alert('A mentés csak HTML5 támogatással működik.');
  }
}

function data_import_browser_delete() {
  sessionStorage.removeItem($('#data_import_browser').val());
  data_import_load();
}

function data_import_browser_load() {
  data_load($('#data_import_browser').val());
}

function data_export_browser() {
  if (typeof Storage !== 'undefined') {
    //save data
    name = $('#data_export_browser').val();
    if (name == '') name = new Date().toISOString().substring(0, 19);
    data_save(name);
    // alert('Elmentve a következő néven: ' + name);

    // Saved Bootstrap toast
    const savedToast = document.getElementById('savedToast');
    const savedToastContent = document.querySelector('#savedToast .toast-body');
    const toast = new bootstrap.Toast(savedToast);
    savedToastContent.innerText = `Elmentve a következő néven:
    ${name}`;
    toast.show();

    data_import_load();
  } else {
    alert('A mentés csak HTML5 támogatással működik.');
  }
}

function data_import_load() {
  $('#data_import_browser').find('option').remove();

  var values = [],
    keys = Object.keys(sessionStorage),
    i = keys.length;

  $('#data_import_browser').append(
    $('<option disabled selected>Mentett kalkulációk</option>')
  );

  while (i--) {
    $('#data_import_browser').append(
      $('<option>', { value: keys[i], text: keys[i] })
    );
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
        sessionStorage.setItem('UtolsóMentés', e.target.result);
        data_load('UtolsóMentés');
      } catch (ex) {}
    };
  })(f);
  reader.readAsText(f);
}

$(document).ready(function () {
  addPreFields();
  addInterestFields();

  // Slide-toggles

  $('.long-dropdown__title.toggle1').click(function () {
    $('.long-dropdown__content.toggle1').slideToggle();
    $('.long-dropdown__title.toggle1').toggleClass('rounded');
  });

  $('.long-dropdown__title.toggle2').click(function () {
    $('.long-dropdown__content.toggle2').slideToggle();
    $('.long-dropdown__title.toggle2').toggleClass('rounded');
  });

  $('.long-dropdown__title.toggle3').click(function () {
    $('.long-dropdown__content.toggle3').slideToggle();
    $('.long-dropdown__title.toggle3').toggleClass('rounded');
  });

  // Bootstrap toast initalization

  const toastElList = document.querySelectorAll('.toast');
  const toastList = [...toastElList].map(
    toastEl => new bootstrap.Toast(toastEl)
  );

  const copyToClipboardButton = document.querySelector('.buttons-copy');
  const copyToClipboardToast = document.getElementById('copyToClipboard');
  copyToClipboardButton.addEventListener('click', () => {
    const toast = new bootstrap.Toast(copyToClipboard);
    toast.show();
  });

  // Bootstrap tooltip initalization

  initalizeTooltips();

  // Run getRemainingSum

  getRemainingSum();
});
