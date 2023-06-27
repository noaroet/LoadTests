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

    var data = {"OkPercent": 99.9885004599816, "KoPercent": 0.011499540018399264};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.49913753449862003, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.017857142857142856, 500, 1500, "Get Feeds"], "isController": false}, {"data": [1.0, 500, 1500, "Play Channel Video - master"], "isController": false}, {"data": [0.0021770682148040637, 500, 1500, "Get Channels"], "isController": false}, {"data": [0.0015151515151515152, 500, 1500, "Get Heros"], "isController": false}, {"data": [1.0, 500, 1500, "Play Feed Video - master"], "isController": false}, {"data": [0.1850282485875706, 500, 1500, "login"], "isController": false}, {"data": [0.004038772213247173, 500, 1500, "Get Feeds Page"], "isController": false}, {"data": [1.0, 500, 1500, "Play Feed Video - video segment"], "isController": false}, {"data": [1.0, 500, 1500, "Play Feed Video - audio segment"], "isController": false}, {"data": [0.0039494470774091624, 500, 1500, "Get Heros Page"], "isController": false}, {"data": [0.9901515151515151, 500, 1500, "Play Channel Video - video segment"], "isController": false}, {"data": [0.23515625, 500, 1500, "Get Channels Page"], "isController": false}, {"data": [0.9977272727272727, 500, 1500, "Play Channel Video - audio segment"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8696, 1, 0.011499540018399264, 4687.715731370754, 1, 39360, 966.0, 14338.3, 17977.59999999999, 25765.15, 20.34708914486538, 113642.11644893895, 5.36903155366498], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Feeds", 700, 1, 0.14285714285714285, 6648.617142857143, 1, 24059, 5566.0, 13222.999999999998, 15237.299999999992, 20979.99, 1.6395861684510828, 46.43664401158719, 0.5107695192733354], "isController": false}, {"data": ["Play Channel Video - master", 660, 0, 0.0, 8.828787878787884, 1, 45, 8.0, 15.0, 16.0, 26.0, 1.5827300174340109, 4.683273391430716, 0.3477678260963403], "isController": false}, {"data": ["Get Channels", 689, 0, 0.0, 17038.647314949216, 405, 39360, 15775.0, 25735.0, 27741.0, 34944.700000000026, 1.6128201646996034, 128.80826045845993, 0.5008562620844472], "isController": false}, {"data": ["Get Heros", 660, 0, 0.0, 11709.063636363631, 562, 29691, 10948.0, 19315.6, 23407.549999999977, 26990.57, 1.5488303983779521, 72.37454547107912, 0.47644685106353024], "isController": false}, {"data": ["Play Feed Video - master", 689, 0, 0.0, 9.985486211901307, 1, 199, 8.0, 15.0, 17.0, 41.30000000000007, 1.6500187991982203, 4.896881963636124, 0.37383238419334675], "isController": false}, {"data": ["login", 708, 0, 0.0, 6878.13559322034, 48, 33187, 5500.0, 15495.300000000001, 18258.49999999999, 25486.74999999997, 1.663920883852212, 2.010029427075377, 0.45010359846392844], "isController": false}, {"data": ["Get Feeds Page", 619, 0, 0.0, 6714.941841680131, 417, 23964, 5662.0, 12649.0, 14059.0, 20088.59999999999, 1.4602431694117979, 41.49286669958504, 0.4648821027619591], "isController": false}, {"data": ["Play Feed Video - video segment", 689, 0, 0.0, 29.32946298984038, 13, 299, 24.0, 40.0, 52.0, 147.7000000000006, 1.649280205286314, 12042.04063950077, 0.3495056685030568], "isController": false}, {"data": ["Play Feed Video - audio segment", 689, 0, 0.0, 6.9230769230769225, 3, 200, 6.0, 8.0, 11.0, 21.0, 1.6491894078476523, 2695.6612875151695, 0.34948642724896534], "isController": false}, {"data": ["Get Heros Page", 633, 0, 0.0, 7174.6113744075865, 330, 24591, 5867.0, 13216.800000000001, 15882.999999999996, 21266.94, 1.4874343519791338, 42.26550521439145, 0.473538670649607], "isController": false}, {"data": ["Play Channel Video - video segment", 660, 0, 0.0, 197.25606060606046, 94, 2351, 162.0, 312.9, 360.0, 648.4599999999998, 1.5814898592953264, 82964.10549675555, 0.3243289750507994], "isController": false}, {"data": ["Get Channels Page", 640, 0, 0.0, 4495.915625000003, 17, 20977, 3646.5, 10192.0, 11911.049999999992, 17861.930000000004, 1.5052129758766102, 5.332922535625333, 0.48360846588223116], "isController": false}, {"data": ["Play Channel Video - audio segment", 660, 0, 0.0, 44.96363636363633, 21, 553, 35.0, 50.89999999999998, 112.94999999999993, 228.0, 1.581921987277512, 18312.472595373718, 0.32441759504714607], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 100.0, 0.011499540018399264], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8696, 1, "502/Bad Gateway", 1, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Feeds", 700, 1, "502/Bad Gateway", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
