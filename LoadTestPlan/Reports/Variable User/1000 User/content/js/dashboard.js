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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4834230769230769, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.049, 500, 1500, "Get Feeds"], "isController": false}, {"data": [1.0, 500, 1500, "Play Channel Video - master"], "isController": false}, {"data": [0.001, 500, 1500, "Get Channels"], "isController": false}, {"data": [0.004, 500, 1500, "Get Heros"], "isController": false}, {"data": [1.0, 500, 1500, "Play Feed Video - master"], "isController": false}, {"data": [0.079, 500, 1500, "login"], "isController": false}, {"data": [0.0445, 500, 1500, "Get Feeds Page"], "isController": false}, {"data": [0.999, 500, 1500, "Play Feed Video - video segment"], "isController": false}, {"data": [0.999, 500, 1500, "Play Feed Video - audio segment"], "isController": false}, {"data": [0.041, 500, 1500, "Get Heros Page"], "isController": false}, {"data": [0.9405, 500, 1500, "Play Channel Video - video segment"], "isController": false}, {"data": [0.1305, 500, 1500, "Get Channels Page"], "isController": false}, {"data": [0.997, 500, 1500, "Play Channel Video - audio segment"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13000, 0, 0.0, 4836.286384615379, 1, 37718, 1498.0, 13692.699999999992, 17528.249999999985, 25887.98, 19.13723458127731, 107748.42738135972, 5.06176404452204], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Feeds", 1000, 0, 0.0, 6817.245000000006, 64, 28548, 6168.0, 12360.799999999996, 15594.24999999999, 22606.21, 1.4767776711216125, 41.88481826404785, 0.46005085653104927], "isController": false}, {"data": ["Play Channel Video - master", 1000, 0, 0.0, 9.932000000000006, 1, 197, 9.0, 15.0, 17.0, 44.0, 1.483527650730118, 4.388286380919461, 0.3259704310686295], "isController": false}, {"data": ["Get Channels", 1000, 0, 0.0, 14520.001999999997, 1154, 37718, 13916.0, 22996.8, 26308.45, 31519.38, 1.4766206650108826, 117.9306554940625, 0.45855993307955145], "isController": false}, {"data": ["Get Heros", 1000, 0, 0.0, 11768.592, 349, 34828, 11249.0, 19979.1, 23260.64999999999, 27742.390000000003, 1.4828039229060583, 69.28922628032704, 0.4561359723783285], "isController": false}, {"data": ["Play Feed Video - master", 1000, 0, 0.0, 10.353000000000009, 1, 249, 9.0, 15.0, 17.0, 41.99000000000001, 1.477377654662973, 4.382699965373961, 0.3347183748845799], "isController": false}, {"data": ["login", 1000, 0, 0.0, 8902.267999999987, 24, 32089, 8396.0, 17806.199999999997, 20924.299999999996, 26516.950000000004, 1.4786381151504218, 1.7862063949619842, 0.39998316200846373], "isController": false}, {"data": ["Get Feeds Page", 1000, 0, 0.0, 7119.134000000006, 63, 28623, 6393.5, 13192.9, 16538.999999999996, 25692.690000000006, 1.4911996850586264, 42.37249730092857, 0.4747373997354612], "isController": false}, {"data": ["Play Feed Video - video segment", 1000, 0, 0.0, 58.583, 13, 17529, 24.0, 60.0, 166.94999999999993, 282.93000000000006, 1.4777247767157862, 10789.445451510031, 0.31315066069074765], "isController": false}, {"data": ["Play Feed Video - audio segment", 1000, 0, 0.0, 28.78999999999998, 3, 18801, 6.0, 12.0, 27.0, 94.98000000000002, 1.478749628464156, 2417.0693308644068, 0.31336784118820493], "isController": false}, {"data": ["Get Heros Page", 1000, 0, 0.0, 7475.690000000009, 66, 31559, 6643.0, 13670.4, 17192.5, 26735.04, 1.4879601702821619, 42.28044636201178, 0.4737060698359226], "isController": false}, {"data": ["Play Channel Video - video segment", 1000, 0, 0.0, 268.79199999999963, 94, 9163, 163.0, 525.8, 899.1999999999975, 1706.99, 1.483168998208332, 77806.24467681377, 0.30416551721069307], "isController": false}, {"data": ["Get Channels Page", 1000, 0, 0.0, 5790.574999999997, 7, 31077, 5175.0, 11650.099999999995, 14342.049999999988, 21874.84, 1.4880642367569723, 5.272165088822554, 0.47809876356742564], "isController": false}, {"data": ["Play Channel Video - audio segment", 1000, 0, 0.0, 101.76699999999988, 21, 25656, 35.0, 75.0, 148.94999999999993, 282.97, 1.4834880364107303, 17172.990791618886, 0.30423094496704434], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13000, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
