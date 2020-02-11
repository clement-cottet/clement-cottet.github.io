var map = L.map('map').setView([45.7633, 4.8358], 9);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoibGVnYW1hYSIsImEiOiJjazZmYXh1eHkxc3FpM21tZ2JieWxka2E2In0.o3LGhvH2ltKwt2CbwK9a_g'
}).addTo(map);

var geoJsonDepartements = $.getJSON({'url': "departements.geojson", 'async': false});
geoJsonDepartements = JSON.parse(geoJsonDepartements.responseText);
L.geoJSON(geoJsonDepartements).addTo(map);


$.ajax({
    url: 'etablissements_final.csv',
    dataType: 'text',
}).done(loadAndProcessFile);

function loadAndProcessFile(data) {
    var dataTable = loadData(data);
    drawDataOnMap(dataTable);
    drawDataOnTable(dataTable);
}

function loadData(data) {
    var dataTable = [];
    var allRows = data.split(/\r?\n|\r/);
    for (var singleRow = 0; singleRow < allRows.length - 1; singleRow++) {
        var rowCells = allRows[singleRow].split(';');
        if (singleRow === 0) {
            var firstRow = rowCells;
        } else {
            var transformedRow = {}
            for (var i = 0; i < firstRow.length; i++) {
                transformedRow[firstRow[i].toLowerCase()] = rowCells[i];
            }
            transformedRow.latitude = transformCoordinates(transformedRow.latitude);
            transformedRow.longitude = transformCoordinates(transformedRow.longitude);
            dataTable.push(transformedRow);
        }
    }
    return dataTable;
}

function transformCoordinates(coordinate) {
    return Number(coordinate);
}

function drawDataOnMap(dataTable) {
    var colors = generateRandomColors(dataTable);
    var popUpMemory = {};
    dataTable.forEach(etablissement => {
        if (!popUpMemory[etablissement.localite]) {
            popUpMemory[etablissement.localite] = '<b>' + etablissement.localite + '</b><br><b>' + etablissement.groupement + '</b>';
        }
        var circle = L.circle([etablissement.latitude, etablissement.longitude], {
            color: colors[etablissement.groupement],
            fillColor: colors[etablissement.groupement],
            fillOpacity: 0.5,
            radius: 1000
        }).addTo(map);
        var popUpContent = '<br>' + etablissement.sigle + ' ' + etablissement['denomination complementaire'];
        popUpMemory[etablissement.localite] += popUpContent;
        circle.bindPopup(popUpMemory[etablissement.localite]);
        circle.on('click', function(e) {
            this.openPopup();
            this.letPopupOpened = true;
        });
        circle.on('mouseover', function(e) {
            this.openPopup();
        });
        circle.on('mouseout', function(e) {
            if (!this.letPopupOpened) {
                this.closePopup();
            }
        });
    });
}

function generateRandomColors(dataTable) {
    var colors = {};
    dataTable.forEach(etablissement => {
        if (!colors[etablissement.groupement]) {
            colors[etablissement.groupement] = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        }
    });
    return colors;
}

function drawDataOnTable(dataTable) {
    var table = document.getElementById('data-table');
    table.className = 'table table-striped';
    var tHead = document.createElement('thead');
    var tBody = document.createElement('tbody');
    // thead creation
    var tr = document.createElement('tr');
    tr.className = 'thead-dark';
    Object.keys(dataTable[0]).forEach(key => {
        var th = document.createElement('th');
        th.appendChild(document.createTextNode(key));
        tr.appendChild(th);
    });
    tHead.appendChild(tr);
    // tbody creation
    for (var i = 1; i < dataTable.length; i++) {
        tr = document.createElement('tr');
        Object.keys(dataTable[i]).forEach(key => {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(dataTable[i][key]));
            tr.appendChild(td);
        });
        tBody.appendChild(tr);
    }
    table.appendChild(tHead);
    table.appendChild(tBody);
    document.getElementsByTagName('body')[0].appendChild(table);
}