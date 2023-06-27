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

    var data = {"OkPercent": 99.98, "KoPercent": 0.02};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4263, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.154, 500, 1500, "Get Heros Page"], "isController": false}, {"data": [0.158, 500, 1500, "Get Feeds"], "isController": false}, {"data": [0.985, 500, 1500, "Play Channel Video - video segment"], "isController": false}, {"data": [0.432, 500, 1500, "Get Channels Page"], "isController": false}, {"data": [1.0, 500, 1500, "Play Channel Video - master"], "isController": false}, {"data": [0.005, 500, 1500, "Get Channels"], "isController": false}, {"data": [0.02, 500, 1500, "Get Heros"], "isController": false}, {"data": [1.0, 500, 1500, "Play Channel Video - audio segment"], "isController": false}, {"data": [0.338, 500, 1500, "login"], "isController": false}, {"data": [0.171, 500, 1500, "Get Feeds Page"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5000, 1, 0.02, 2894.137200000002, 1, 18169, 1562.5, 7749.300000000004, 9834.049999999996, 13473.879999999997, 15.469004755172062, 99396.07247045034, 4.312891462501586], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Heros Page", 500, 0, 0.0, 3321.8420000000024, 109, 12740, 2461.5, 6889.4000000000015, 7632.7, 8977.29, 1.5564299232991334, 44.22601706858875, 0.4955040576128101], "isController": false}, {"data": ["Get Feeds", 500, 0, 0.0, 3113.5179999999987, 65, 11403, 2217.5, 6915.800000000001, 7514.75, 8984.110000000006, 1.5616313425656978, 44.29146394739801, 0.48648476394380624], "isController": false}, {"data": ["Play Channel Video - video segment", 500, 0, 0.0, 185.23, 96, 831, 162.0, 225.90000000000003, 338.39999999999964, 700.8600000000001, 1.5564444582795063, 81650.23574053681, 0.3191927111706019], "isController": false}, {"data": ["Get Channels Page", 500, 0, 0.0, 2069.394000000002, 16, 9507, 1260.0, 5550.800000000001, 6253.499999999999, 7890.880000000004, 1.5568660908337952, 5.5159279077587975, 0.5002040467620299], "isController": false}, {"data": ["Play Channel Video - master", 500, 0, 0.0, 9.804000000000004, 1, 84, 9.0, 15.0, 16.0, 23.960000000000036, 1.5571909520976919, 4.606183001859286, 0.342156215060528], "isController": false}, {"data": ["Get Channels", 500, 0, 0.0, 8464.655999999995, 400, 18169, 7378.5, 13472.800000000001, 14474.55, 16089.61, 1.5546586902311468, 124.16318066844106, 0.48279439794287565], "isController": false}, {"data": ["Get Heros", 500, 0, 0.0, 5355.086000000005, 468, 12824, 4359.0, 10403.0, 11154.499999999998, 12302.58, 1.554064344480119, 72.61912000329461, 0.4780569028430053], "isController": false}, {"data": ["Play Channel Video - audio segment", 500, 0, 0.0, 44.22800000000002, 21, 335, 36.0, 53.900000000000034, 113.74999999999994, 233.84000000000015, 1.5570503238664675, 18024.55444031826, 0.3193169609491779], "isController": false}, {"data": ["login", 500, 0, 0.0, 3205.6719999999996, 32, 12776, 2104.5, 8372.900000000001, 9642.449999999999, 10830.28, 1.561870371006688, 1.8867516102883524, 0.42249813746958254], "isController": false}, {"data": ["Get Feeds Page", 500, 1, 0.2, 3171.9420000000023, 3, 11336, 2191.5, 6930.500000000003, 8174.449999999999, 9077.960000000003, 1.5569000252217804, 44.15173859025816, 0.4956537189670902], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 100.0, 0.02], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5000, 1, "502/Bad Gateway", 1, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Feeds Page", 500, 1, "502/Bad Gateway", 1, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
