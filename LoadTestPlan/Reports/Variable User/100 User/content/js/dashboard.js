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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8305, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.89, 500, 1500, "Get Heros Page"], "isController": false}, {"data": [0.835, 500, 1500, "Get Feeds"], "isController": false}, {"data": [0.995, 500, 1500, "Play Channel Video - video segment"], "isController": false}, {"data": [1.0, 500, 1500, "Get Channels Page"], "isController": false}, {"data": [1.0, 500, 1500, "Play Channel Video - master"], "isController": false}, {"data": [0.175, 500, 1500, "Get Channels"], "isController": false}, {"data": [0.5, 500, 1500, "Get Heros"], "isController": false}, {"data": [1.0, 500, 1500, "Play Channel Video - audio segment"], "isController": false}, {"data": [1.0, 500, 1500, "login"], "isController": false}, {"data": [0.91, 500, 1500, "Get Feeds Page"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1000, 0, 0.0, 422.51899999999955, 1, 3168, 165.0, 1253.6999999999998, 1889.9499999999985, 2719.92, 14.85111754659538, 95425.92250965323, 4.1406191987822085], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Heros Page", 100, 0, 0.0, 360.7799999999999, 60, 906, 347.5, 600.7, 674.1999999999998, 905.7499999999999, 1.5430908108942212, 43.846985668544086, 0.4912574261245274], "isController": false}, {"data": ["Get Feeds", 100, 0, 0.0, 376.58, 61, 1014, 319.5, 757.9, 830.4499999999998, 1013.91, 1.5137295268081499, 42.93285805379795, 0.4715622256365233], "isController": false}, {"data": ["Play Channel Video - video segment", 100, 0, 0.0, 178.43, 152, 504, 168.5, 204.9, 214.95, 501.3899999999987, 1.5294963368562733, 80236.55184371224, 0.3136662409568529], "isController": false}, {"data": ["Get Channels Page", 100, 0, 0.0, 21.389999999999993, 9, 51, 19.0, 29.900000000000006, 39.0, 50.95999999999998, 1.5438293142310187, 5.469739015654429, 0.4960154730293019], "isController": false}, {"data": ["Play Channel Video - master", 100, 0, 0.0, 5.170000000000002, 1, 22, 2.0, 14.0, 16.0, 21.989999999999995, 1.5287481081742162, 4.522048847323926, 0.3359065667374987], "isController": false}, {"data": ["Get Channels", 100, 0, 0.0, 1801.86, 370, 3168, 1880.5, 2719.2, 2807.0, 3167.99, 1.5028102551771814, 120.02229325087914, 0.46669302846322624], "isController": false}, {"data": ["Get Heros", 100, 0, 0.0, 1013.6399999999999, 217, 1775, 1076.5, 1506.3000000000002, 1566.7999999999997, 1773.8499999999995, 1.5362634999155054, 71.78731295991888, 0.47258105710291426], "isController": false}, {"data": ["Play Channel Video - audio segment", 100, 0, 0.0, 39.43999999999999, 34, 144, 36.0, 41.0, 51.64999999999992, 143.68999999999983, 1.5405472023662805, 17833.512823129775, 0.31593253173527236], "isController": false}, {"data": ["login", 100, 0, 0.0, 72.65, 14, 206, 62.5, 158.4000000000001, 182.74999999999994, 205.91999999999996, 1.513156899238882, 1.8279053558188447, 0.4093207627823929], "isController": false}, {"data": ["Get Feeds Page", 100, 0, 0.0, 355.2500000000001, 60, 1251, 305.5, 705.7, 972.5499999999995, 1249.229999999999, 1.5432098765432098, 43.850368923611114, 0.49129533179012347], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1000, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
