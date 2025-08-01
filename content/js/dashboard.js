/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 31.6932, "KoPercent": 68.3068};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.220125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5721483333333334, 500, 1500, "QRI SPR BRAND_TOKEN 2.0 Login QR-i (WALLET)"], "isController": false}, {"data": [0.022855714285714285, 500, 1500, "QRi SPR TARJETA PLANO 1.2 Agregar bines y consultar planes (WALLET)"], "isController": false}, {"data": [0.6448883333333333, 500, 1500, "QRI SPR BRAND_TOKEN 2.2 Agregar bines y consultar planes (WALLET)"], "isController": false}, {"data": [0.02543, 500, 1500, "QRi SPR TARJETA PLANO 1.3 Realizar compra (WALLET)"], "isController": false}, {"data": [0.021701428571428573, 500, 1500, "QRi SPR TARJETA PLANO 1.0 Login QR-i (WALLET)"], "isController": false}, {"data": [0.82091, 500, 1500, "QRI SPR BRAND_TOKEN  2.3 Realizar compra (WALLET)"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3000000, 2049204, 68.3068, 237.50153533333284, 1, 40152, 600.0, 1299.0, 1501.0, 2298.0, 132.01837167660253, 50.618075937228674, 125.5319290076157], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["QRI SPR BRAND_TOKEN 2.0 Login QR-i (WALLET)", 300000, 3432, 1.144, 876.7888166666712, 5, 40152, 900.0, 1600.0, 1901.0, 2800.0, 13.901444596418125, 4.877692768103028, 5.226617353145486], "isController": false}, {"data": ["QRi SPR TARJETA PLANO 1.2 Agregar bines y consultar planes (WALLET)", 700000, 679597, 97.08528571428572, 38.16706857142884, 1, 32598, 16.0, 26.0, 31.0, 50.0, 612.7987393854504, 122.12457955577564, 683.3614626876696], "isController": false}, {"data": ["QRI SPR BRAND_TOKEN 2.2 Agregar bines y consultar planes (WALLET)", 300000, 3542, 1.1806666666666668, 762.5279066666589, 5, 40071, 795.0, 1500.0, 1899.0, 2700.0, 13.901329935601163, 12.94361197347786, 15.905692106324414], "isController": false}, {"data": ["QRi SPR TARJETA PLANO 1.3 Realizar compra (WALLET)", 700000, 679705, 97.10071428571429, 33.25363571428603, 1, 22293, 16.0, 26.0, 31.0, 51.0, 613.2475487619407, 126.6527825642114, 794.0548706118853], "isController": false}, {"data": ["QRi SPR TARJETA PLANO 1.0 Login QR-i (WALLET)", 700000, 679410, 97.05857142857143, 40.32529142857248, 1, 32101, 16.0, 26.0, 31.0, 51.0, 612.2739943618311, 111.53855062254051, 230.20067170830566], "isController": false}, {"data": ["QRI SPR BRAND_TOKEN  2.3 Realizar compra (WALLET)", 300000, 3518, 1.1726666666666667, 474.9579733333308, 3, 40093, 498.0, 901.0, 1199.0, 1700.0, 13.901271961750743, 16.406454165881634, 20.684188010370722], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 2048308, 99.95627570510305, 68.27693333333333], "isController": false}, {"data": ["504/Gateway Timeout", 239, 0.011663065268270021, 0.007966666666666667], "isController": false}, {"data": ["401/Unauthorized", 657, 0.03206122962867533, 0.0219], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3000000, 2049204, "503/Service Unavailable", 2048308, "401/Unauthorized", 657, "504/Gateway Timeout", 239, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["QRI SPR BRAND_TOKEN 2.0 Login QR-i (WALLET)", 300000, 3432, "503/Service Unavailable", 3350, "504/Gateway Timeout", 82, "", "", "", "", "", ""], "isController": false}, {"data": ["QRi SPR TARJETA PLANO 1.2 Agregar bines y consultar planes (WALLET)", 700000, 679597, "503/Service Unavailable", 679448, "401/Unauthorized", 149, "", "", "", "", "", ""], "isController": false}, {"data": ["QRI SPR BRAND_TOKEN 2.2 Agregar bines y consultar planes (WALLET)", 300000, 3542, "503/Service Unavailable", 3344, "401/Unauthorized", 106, "504/Gateway Timeout", 92, "", "", "", ""], "isController": false}, {"data": ["QRi SPR TARJETA PLANO 1.3 Realizar compra (WALLET)", 700000, 679705, "503/Service Unavailable", 679424, "401/Unauthorized", 281, "", "", "", "", "", ""], "isController": false}, {"data": ["QRi SPR TARJETA PLANO 1.0 Login QR-i (WALLET)", 700000, 679410, "503/Service Unavailable", 679410, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["QRI SPR BRAND_TOKEN  2.3 Realizar compra (WALLET)", 300000, 3518, "503/Service Unavailable", 3332, "401/Unauthorized", 121, "504/Gateway Timeout", 65, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
