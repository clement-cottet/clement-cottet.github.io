let datatable = [];

function readGPX() {
    let gpxString = document.getElementById("gpx-content").value;

    let parser = new DOMParser();
    let gpxXML = parser.parseFromString(gpxString, "application/xml");
    let points = gpxXML.getElementsByTagName('trkpt');
    let lineChartDatatable = [['Temps', 'Altitude']];
    for (let point of points) {
        let line = [];
        line.push(point.attributes.lat.value);
        line.push(point.attributes.lon.value);
        line.push(point.getElementsByTagName('ele')[0].innerHTML);
        line.push(point.getElementsByTagName('time')[0].innerHTML);
        datatable.push(line);

        let lineChartLine = [];
        lineChartLine.push(new Date(point.getElementsByTagName('time')[0].innerHTML));
        lineChartLine.push(parseFloat(point.getElementsByTagName('ele')[0].innerHTML));
        lineChartDatatable.push(lineChartLine);
    }

    // Line chart
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = google.visualization.arrayToDataTable(lineChartDatatable);

        var options = {
            title: 'Profil',
            curveType: 'function',
            legend: { position: 'bottom' }
        };

        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        chart.draw(data, options);
    }


    // Table
    google.charts.load('current', {'packages':['table']});
    google.charts.setOnLoadCallback(drawTable);

    function drawTable() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'latitude');
        data.addColumn('string', 'longitude');
        data.addColumn('string', 'altitude');
        data.addColumn('string', 'time');
        data.addRows(datatable);

        var table = new google.visualization.Table(document.getElementById('table_div'));

        table.draw(data, {showRowNumber: true});
    }
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

function exportTableToCSV(filename) {
    var csv = [];

    for (var i = 0; i < datatable.length; i++) {
        var row = [];
        var cols = datatable[i];
        
        for (var j = 0; j < cols.length; j++) 
            row.push(cols[j]);
        
        csv.push(row.join(","));
    }

    // Download CSV file
    downloadCSV(csv.join("\n"), filename);
}