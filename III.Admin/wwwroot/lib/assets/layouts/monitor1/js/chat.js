﻿var webSyncHandleUrl = 'http://117.6.131.222:8080/websync.ashx';
fm.websync.client.enableMultiple = true;
client = new fm.websync.client(webSyncHandleUrl);
client.setDisableCORS(true);
var current_channel = {};
var driverlist = { "driverId": 4045, "name": "AAA", "cdata": [105.0000, 21.07571], "status": 2 };
var robots = [];
var remoocs = [];
var tracktors = [];
var textArea;
var listRoom;
var mUtil;
var currentRoom = "warehouse2";
var list = [10000];
var data;
var map, polygon, id;
id = 0;
var addMarker = function (data) {
    drawMarkerExist(data);
}

//var addMarker1 = function (data) {
//    var data1 = data;
//    var count = 0;
//    setInterval(() => {
//        drawMarkerExist1(data1, count);
//        count++;
//    }, 5000)
//}
var addMarker1 = function (data) {
    drawMarkerExist1(data);
}
$(document).ready(function () {
    console.log("idL: " );
    textArea = document.getElementById('log_id');
    textArea.innerHTML = "";
    
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "http://localhost:5002/JnanaMonitor/GetRooms",
        success: function (data) {
            debugger
            listRoom = data;
            for (var i = 0; i < listRoom.length; i++) {
                $('#listRoom')
                    .append($("<option>")
                        .attr("class", 'list-group-item')
                        .attr("data-customvalue", listRoom[i].District_channel)
                        .attr("value", listRoom[i].District_channel + " - " + listRoom[i].District_name));
            }
       
            //oninput = 'onInput()' 
        },
        failure: function (data) {
            console.log(data);
        }
    });

    $.ajax({
        type: "GET",
        dataType: "json",
        url: "http://localhost:5002/JnanaMonitor/GetRobots",
        success: function (data) {
             robots = data;
            for (var i = 0; i < robots.length; i++) {

                $('#listNodeStart')
                    .append($("<option>")
                        .attr("class", 'list-group-item')
                        .attr("data-customvalue", robots[i].Username)
                        .attr("value", robots[i].Name));
            }

            //oninput = 'onInput()' 
        },
        failure: function (data) {
            console.log(data);
        }
    });
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "http://localhost:5002/JnanaMonitor/GetRemoocs",
        success: function (data) {
            //listRoom = data;
            // console.log(listRoom);
            remoocs = data;
            for (var i = 0; i < remoocs.length; i++) {

                $('#listRemooc')
                    .append($("<option>")
                        .attr("class", 'list-group-item')
                        .attr("data-customvalue", remoocs[i].Code)
                        .attr("value", remoocs[i].Code));
            }

            //oninput = 'onInput()' 
        },
        failure: function (data) {
            console.log(data);
        }
    });
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "http://localhost:5002/JnanaMonitor/GetTracktors",
        success: function (data) {
            //listRoom = data;
            // console.log(listRoom);
            tracktors = data;
            for (var i = 0; i < tracktors.length; i++) {

                $('#listTracktor')
                    .append($("<option>")
                        .attr("class", 'list-group-item')
                        .attr("data-customvalue", tracktors[i].Code)
                        .attr("value", tracktors[i].Name));
            }

            //oninput = 'onInput()' 
        },
        failure: function (data) {
            console.log(data);
        }
    });
   
});

getImagebyStatus = function (status) {
    if (status == 1) {
        return "lib/assets/layouts/monitor/image/car_grey.png";
    }
    if (status == 2) {

        return "lib/assets/layouts/monitor/image/car.png";
    }
    //if(status != 1  && status != 2){

    //    return "lib/assets/layouts/monitor/image/car_grey.png";
    //}
}
//
function initMap() {
    var uluru = { lat: 20.99093210090554, lng: 105.80906867980957 };
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            rotation: 0,
            src: 'lib/assets/layouts/monitor/image/check.png'
        }))
    });
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([105.81022739410399, 20.99113243756568], 'EPSG:4326',
       'EPSG:3857')),
        name: 'Hạ Đình',
        population: 4000,
        rainfall: 500,
        style: iconStyle
    });
    iconFeature.setId(1);
    iconFeature.setStyle(iconStyle);
    var vectorSource = new ol.source.Vector({
        features: [iconFeature]
    });
    console.log("idL: " + vectorSource.getFeatureById(1).get('name'));


    var vectorLayerMarker = new ol.layer.Vector({
        source: vectorSource
    });
    // car layer
    carSourceVector = new ol.source.Vector({
        features: []

    });
    
    carLayerMarker = new ol.layer.Vector({
        source: carSourceVector
    });
    carLayerMarker.setZIndex(2);
    // path layer
    pathSourceVector = new ol.source.Vector({
        features: []
    });
    pathLayerMarker = new ol.layer.Vector({
        source: pathSourceVector
    });
    var view1 = new ol.View({
        //	center : ol.proj.fromLonLat([105.810227394,20.991132437]),
        center: ol.proj.fromLonLat([105.8102273, 20.99113243]),
        zoom: 12
    });
    var googleLayer = new ol.layer.Tile({
        source: new ol.source.OSM({
            url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            attributions: [
                new ol.Attribution({ html: '© Google' }),
                new ol.Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
            ]
        })
    });
    map = new ol.Map({
        target: 'map',
        layers: [
            googleLayer,
            vectorLayerMarker,
            carLayerMarker
        ],
        view: view1
    });
    map.on('moveend', checknewzoom);
   
    element = document.getElementById('popupBooking');
    popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
    });
    map.addOverlay(popup);

    map.on('click', function (evt) {
        var coordinatez = evt.coordinate;
        var hdms = ol.proj.transform(coordinatez, 'EPSG:3857', 'EPSG:4326');
        console.log(hdms);

        if ($('#coorx1').val() == null || $('#coorx1').val() == "") {
            $('#coorx1').val(hdms[1]);
            $('#coory1').val(hdms[0]);
        }
        else {
            $('#coorx2').val(hdms[1]);
            $('#coory2').val(hdms[0]);
        }
    });
    // var element = popup.getElement();
    // popup.setPosition([11772998.295847073,2390238.343688335]);
    // $(element).popover({
    // 'placement': 'top',
    // 'html': true,
    // 'content': "ThuLuu"
    // });
    // $(element).popover('show');
    //$.ajax({
    //    type: "POST",
    //    dataType: "json",
    //    url: "/Driver/GetAllDriverId",
    //    success: function (data) {
    //        var listDriver = data.Object;
    //        console.log(listDriver)
    //        for (var i = 0; i < listDriver.length; i++) {
    //            $('#listNodeStart')
    //                .append($("<option>")
    //                    .attr("class", 'list-group-item')
    //                    .attr("data-customvalue", data.Object[i].Id)
    //                    .attr("value", listDriver[i].Name));
    //        }
    //    }
    //});
}

var drawMarkerExist = function (data) {
    if (data != null && carSourceVector.getFeatureById(data.DriverId) != null) {
        var feature1 = carSourceVector.getFeatureById(data.DriverId);
        var coord = feature1.getGeometry().getCoordinates();
        coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
        var lon = coord[0];
        var lat = coord[1];
        if (Contains(data.Position[1], data.Position[0], polygon)) {
            var bear = bearing(lat, lon, data.Position[0], data.Position[1]);
            var lonlat3857 = new ol.geom.Point(ol.proj.transform([data.Position[1], data.Position[0]], 'EPSG:4326',
                'EPSG:3857'));

            var style = carSourceVector.getFeatureById(data.DriverId).getStyle();

            carSourceVector.getFeatureById(data.DriverId).setGeometry(lonlat3857);
            carSourceVector.getFeatureById(data.DriverId).set("name", "Đây là tên người lái");
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    rotation: bear,
                    src: 'lib/assets/layouts/monitor/image/car.png'
                }))
            });
            carSourceVector.getFeatureById(data.DriverId).setStyle(iconStyle);
        }
        else {
            var fea = carSourceVector.getFeatureById(data.DriverId);
            carSourceVector.removeFeature(fea);
        }
       
    }
    else if (data != null && carSourceVector.getFeatureById(data.DriverId) == null) {
        if (Contains(data.Position[1], data.Position[0], polygon)) {
            var lonlat3857 = new ol.geom.Point(ol.proj.transform([data.Position[1], data.Position[0]], 'EPSG:4326',
                'EPSG:3857'));
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    rotation: 0,
                    src: 'lib/assets/layouts/monitor/image/car.png'
                }))
            });

            var iconFeature = new ol.Feature({
                geometry: lonlat3857,
                name: data.name /*+ "_" + data.location_message.channel*/,
                population: 4000,
                rainfall: 500,
                style: iconStyle
            });
            iconFeature.setId(data.DriverId);
            iconFeature.setStyle(iconStyle);
            carSourceVector.addFeature(iconFeature);
        }
    }
}

var drawMarkerExist1 = function (data) {
   // console.log('HH');
    //console.log(data);
    if (data != null && carSourceVector.getFeatureById(data.driverId) != null) {
        
        var lonlat3857 = new ol.geom.Point(ol.proj.transform(data.cdata, 'EPSG:4326',
            'EPSG:3857'));
        console.log('HG');
        console.log(lonlat3857);
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                src: 'http://sohanews.sohacdn.com/thumb_w/660/2017/photo1486969199024-1486969199175-0-32-308-529-crop-1486969281069.jpg'
            }))
        });

        var iconFeature = new ol.Feature({
            geometry: lonlat3857,
            name: data.name,
            population: 4000,
            rainfall: 500,
            style: iconStyle
        });
        iconFeature.setId(data.driverId);
        iconFeature.setStyle(iconStyle);
       
        carSourceVector.clear();
        carSourceVector.addFeature(iconFeature);
        var field_location = carSourceVector.getFeatureById(data.driverId).getProperties();
        var field_extent = field_location.geometry.getExtent();
        map.getView().fit(field_extent, map.getSize());
        map.getView().setZoom(15);
        
    }
    else if (data != null && carSourceVector.getFeatureById(data.driverId) == null) {
        //--------------------------------------------
        var lonlat3857 = new ol.geom.Point(ol.proj.transform(data.cdata, 'EPSG:4326',
            'EPSG:3857'));
        console.log('HG');
        console.log(lonlat3857);
        //   var carFeature = renderCarFeature(lonlat3857,data.id);
        //console.log("22222222222222222222222222222222222222" + data.location_message.status)
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                src: 'http://sohanews.sohacdn.com/thumb_w/660/2017/photo1486969199024-1486969199175-0-32-308-529-crop-1486969281069.jpg'
            }))
        });

        var iconFeature = new ol.Feature({
            geometry: lonlat3857,
            name: data.name,
            population: 4000,
            rainfall: 500,
            style: iconStyle
        });
        iconFeature.setId(data.driverId);
        iconFeature.setStyle(iconStyle);
        carSourceVector.clear();
        carSourceVector.addFeature(iconFeature);
        var field_location = carSourceVector.getFeatureById(data.driverId).getProperties();
        var field_extent = field_location.geometry.getExtent();
        map.getView().fit(field_extent, map.getSize());
        map.getView().setZoom(12);
        
    }
}

fm.util.addOnLoad(function () {
    var chatObject = {
        alias: 'Unknown',
        clientId: '0',
        channels: {
            main: '/chat'
        }
    }
    listDriver = [1000];
    util = {

        observe: fm.util.observe,
        stopEvent: function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        },

        subcribe: function (channel) {
            client.subscribe({
                channel: '/warehouse2',
                onSuccess: function (args) {
                    // console.log("subcribe successx: "+channel);
                    //	util.log('subcribe success to WebSync.')
                },
                onFailure: function (args) {
                    // console.log("subcribe failed: "+args.channel);
                },
                onReceive: function (args) {    
                    
                    var dataDriver = args.getData();
                    //console.log(dataDriver);
                    if (dataDriver.Type == "MOVE") {
                        //console.log('------------');
                        //console.log(dataDriver.Object);
                        
                        //log = Number(20.05464);
                        //lat = Number(105.056464);
                        //dataDriver.cdata = [log, lat];
                        addMarker(dataDriver.Object);
                    }
                    else {
                        //log = Number(20.05464);
                        //lat = Number(105.056464);
                        //driverlist.cdata = [log, lat];
                        //console.log('------------->' + dataDriver.Object.cdata)
                        //var kk = { driverId: 1, name: 'name', cdata: '[10.46541,105.46871]' };
                       // addMarker1(dataDriver.Object);
                    }
                    //data = JSON.stringify(dataDriver);
                    //console.log('aaa' + data)
                   // $('#test').val(dataDriver.cdata);
                    

                    //a = dataDriver.cdata;

                   // aa = a.split('[');
                    //aaa = aa[1].split(']');
                    //aaaa = aaa[0].split(',');
                    //console.log('a' + aaaa)
                    
                    
                }
            });
        },

        unsubcribe: function (channel) {
            client.unsubscribe({
                channel: '/' + channel,
                onSuccess: function (args) {
                    // console.log("unsubcribe success: "+args.channel);
                    //	util.log('subcribe success to WebSync.')
                },
                onFailure: function (args) {
                    // console.log("subcribe failed: "+args.channel);
                }

            });
        },
        disconnect: function () {
        }
    }
    mUtil = util;
    allUserOrder = {};
    allClientMap = {};
    allClientArr = [];

    client.connect({
        onSuccess: function (args) {
            chatObject.clientId = args.clientId;
        },
        onFailure: function (args) {

        }
    });

    util.subcribe();
    //util.subcribe("VN.HN.DA");
    //util.subcribe("VN.HN.DD");
    //util.subcribe("VN.HN.BD");
    //util.subcribe("VN.HN.CG");
    //util.subcribe("VN.HN.GL");
    //util.subcribe("VN.HN.HB");
    //util.subcribe("VN.HN.HK");
    //util.subcribe("VN.HN.HM");
    //util.subcribe("VN.HN.LB");
    //util.subcribe("VN.HN.SS");
    //util.subcribe("VN.HN.TH");
    //util.subcribe("VN.HN.TL");
    //util.subcribe("VN.HN.TT");
    //util.subcribe("VN.TH.HH");
    //util.subcribe("VN.TH.TH");
    //util.subcribe("VN.TH.NS");


    //util.subcribe("VN.NB.GV");
    //util.subcribe("VN.NB.HL");
    //util.subcribe("VN.NB.KS");
    //util.subcribe("VN.NB.NQ");
    //util.subcribe("VN.NB.NB");
    //util.subcribe("VN.NB.TD");
    //util.subcribe("VN.NB.YK");
    //util.subcribe("VN.NB.YM");
});

function removeAllMarker() {
    carSourceVector.clear()
}

function changeRoom(room) {
    client.unsubscribe({
        channel: '/' + currentRoom,
        onSuccess: function (args) {
        },
        onFailure:

        function (args) {

        }

    });
    removeAllMarker();
    currentRoom = room;
    client.subscribe({
        channel: '/' + currentRoom,
        onSuccess: function (args) {
            console.log("subcribe successx: " + currentRoom);
            //	util.log('subcribe success to WebSync.')
            textArea.innerHTML = "";
        },
        onFailure: function (args) {
            // console.log("subcribe failed: "+args.channel);
        },
        onReceive: function (args) {
            var dataDriver = args.getData();
            //console.log(dataDriver);
            if (dataDriver.Type == "MOVE") {
                //console.log('------------');
                //console.log(dataDriver.Object);

                //log = Number(20.05464);
                //lat = Number(105.056464);
                //dataDriver.cdata = [log, lat];
                addMarker(dataDriver.Object);
            }
            else {
                //log = Number(20.05464);
                //lat = Number(105.056464);
                //driverlist.cdata = [log, lat];
                //console.log('------------->' + dataDriver.Object.cdata)
                //var kk = { driverId: 1, name: 'name', cdata: '[10.46541,105.46871]' };
                // addMarker1(dataDriver.Object);
            }
            //console.log(dataDriver);
           // var kk = { driverId: 1, name: 'name', cdata:'[10.46541,105.46871]'};
            //addMarker1(dataDriver.Object);
            //var flag = false;
            //if (dataDriver.type == 3) {
            //    //var booking3 = dataDriver;
            //    console.log("dữ liệu: ");
            //    $('#act' + dataDriver.booking_message.driverId).append('<button type="button" onClick="mess3" class="btn btn-sm btn-success">Nhận chuyến</button>')
            //}
            //else if (dataDriver.type == 4) {
            //    console.log(JSON.stringify(dataDriver))

            //}
            //else if (dataDriver.type == 1) {
                //debugger
                //textArea.innerHTML = textArea.innerHTML + dataDriver.location_message.channel + " - " + dataDriver.location_message.driverName + " - " + dataDriver.location_message.driverTypeCar + " - " + dataDriver.location_message.lonlat[1] + "/" + dataDriver.location_message.lonlat[0] + " &#13;&#10;";
                //for (var i in listDriver) {
                //    if (dataDriver.location_message.driverId == listDriver[i]) {
                //        if (dataDriver.type != -99999 && dataDriver.location_message.channel != -1) {
                //            var element = document.getElementById("" + dataDriver.location_message.driverId);
                //            element.classList.remove("gone");
                //        }
                //        //element.classList.add("visiable");
                //        flag = true;
                //    }
                //}
                //if (flag == false) {
                    //list.push(dataDriver);
                    //$("#listNodeStart").find('[data-customvalue=' + dataDriver.location_message.driverId + ']').prop("disabled", true);
                    //var strStatus = (dataDriver.location_message.status == 0 ? '<p style="color:green">Rảnh</p>' : '<p style="color:red">Bận</p>')
                    //listDriver.push(dataDriver.location_message.driverId)
                    ////$('#tableDriver').append('<tr><td class="text-center">' + dataDriver.location_message.driverId + '</td><td class="text-center">' + strStatus + '</td><td ng-click="remove(' + dataDriver.location_message.driverId + ')" class="text-center" id="act' + dataDriver.location_message.driverId + '"></td></tr>')
                    //$('#tableDriver').append('<tr id="' + dataDriver.location_message.driverId + '"><td class="text-center">'
                    //    + dataDriver.location_message.driverId + '</td><td class="text-center">' +
                    //    dataDriver.location_message.driverName + '</td>' +
                    //    '<td class="text-center">' +
                    //    strStatus + '</td>' +
                    //    '<td ng-click="remove(' + dataDriver.location_message.driverId + ')" class="text-center" id="act' + dataDriver.location_message.driverId + '"></td>' +
                    //    '<td><label onclick=remove(' + dataDriver.location_message.driverId + ')> <a><i class="fa fa-ban" style="color:red"></i></a></label >'
                    //    + '</td ></tr > ')
                //}

                //<label ng-click="denied(' + full.Id + ')" title="Reject"><a><i class="fa fa-ban" style="color:red"></i></a></label>
           // }
        }
    });
}
function onInput() {
    var val = document.getElementById("count1").value;
    var res = val.split(" - ");
    var arr = res[0].split(".");
    if (arr.length == 3) {
        console.log(res[0]);
        //changeRoom(res[0]);
    }
}

function remove(data) {
    var data1;
    var user_name = "";
    for (var i = 0; i < list.length; ++i) {
        console.log(list[i]);
        try {
            if (list[i] != null && list[i] != undefined && list[i].location_message.driverId == data) {
                data1 = list[i];
                user_name = data1.location_message.driverName;
                break;
            }
        }
        catch (ex) {

        }
    }

    data1.type = -99999;
    if (confirm("Có chắc đuổi tài xế " + user_name + " không?")) {
        var element = document.getElementById("" + data);
        element.classList.add("gone");
        client.publish({
            channel: '/warehouse',
            data: data1,
            onSuccess: function (args) {
                var element = document.getElementById("" + data);
                element.classList.add("gone");
                console.log("send success");
                ///   util.clear(dom.text);
            }
        });

    } else {

    }
}
function runRobot(robotCode) {
    console.log(robotCode);
    var robotId = -1;
    for (var item = 0; item < robots.length; item++) {
        if (robots[item].Username == robotCode) {
            robotId = robots[item].Id;
        }
    }
    var data = {
        Id: -1,
        Error: false,
        Title: "",
        Type: "START",
        Object: {
            DriverId: robotId,
            Position: ""
        }

    };
    client.publish({
        channel: '/'+currentRoom,
        data: data,
        onSuccess: function (args) {
            console.log("send success");
        }
    });
}
function stopRobot(robotCode) {
    console.log(robotCode);
    var robotId = -1;
    for (var item = 0; item < robots.length; item++) {
        if (robots[item].Username == robotCode) {
            robotId = robots[item].Id;
        }
    }
    var dt = { driverId: robotCode };
    var data = {
        Id: -1,
        Error: false,
        Title: "",
        Type: "STOP",
        Object: {
            DriverId: robotId,
            Position: ""
        }

    };
    client.publish({
        channel: '/' + currentRoom,
        data: data,
        onSuccess: function (args) {
            console.log("send success");
        }
    });
}
function finishRobot(robotCode) {
    var robotId = -1;
    for (var item = 0; item < robots.length; item++) {
        if (robots[item].Username == robotCode) {
            robotId = robots[item].Id;
        }
    }
    console.log(robotCode);
    var data = {
        Id: -1,
        Error: false,
        Title: "",
        Type: "FINISH",
        Object: {
            DriverId: robotId,
            Position: ""
        }

    };
    client.publish({
        channel: '/' + currentRoom,
        data: data,
        onSuccess: function (args) {
            console.log("send success");
        }
    });
}

function Smonitor() {
    
    var roomPos = $('#count1').val();
    var roomCode = $('#listRoom [value="' + roomPos + '"]').data('customvalue');

    var remoocPos = $('#count2').val();
    var remoocCode = $('#listRemooc [value="' + remoocPos + '"]').data('customvalue');

    var robotPos = $('#count3').val();
    var robotCode = $('#listNodeStart [value="' + robotPos + '"]').data('customvalue');

    var tracktorPos = $('#count4').val();
    var tracktorCode = $('#listTracktor [value="' + tracktorPos + '"]').data('customvalue');

    console.log("room Code: " + roomCode);
    console.log("remooc Code: " + remoocCode);
    console.log("robot Code: " + robotCode);
    console.log("tracktor Code: " + tracktorCode);

    var coorx1 = $('#coorx1').val();
    var coory1 = $('#coory1').val();
    var coorx2 = $('#coorx2').val();
    var coory2 = $('#coory2').val();
    var robotId = -1;
    debugger
    for (var item = 0; item < robots.length;item++) {
        if (robots[item].Username == robotCode) {
            robotId = robots[item].Id;
        }
    }
    changeRoom(roomCode);
    var mData = {
        Room: roomCode,
        driverId: robotId,
        userName: robotCode,
        DriverName: robotPos,
        RemoocId: remoocCode,
        RemoocName: robotPos,
        tracktorId: tracktorCode,
        Lat1: coorx1,
        Lng1: coory1,
        Lat2: coorx2,
        Lng2: coory2
    };
    console.log(mData);
    $.ajax({
        type: "POST",
        dataType: "json",
        crossDomain: true,
        url: "http://117.6.131.222:4037/RmCreateClientBot",
        data: mData,
        //+ "?Room=" + roomCode + "&driverId="+robotCode+ "&DriverName=" + robotPos + "&RemoocId=" + remoocCode
        //+ "&RemoocName=" + remoocPos + "&tracktorId=" + tracktorCode + "&tracktorName="+tracktorPos
        //+ "&lat1=" + coorx1
        //+ "&lng1=" + coory1
        //+ "&lat2=" + coorx2
        //+ "&lng2=" + coory2,
        success: function (data) {
            console.log(data);
            var html = '<tr><td class="text-center">' + robotCode + '</td>'
                + '< td class="text-center" > ' + robotCode + '</td>'
                + '<td <label onclick=runRobot("' + robotCode + '")> <a>Start</a></label ></td>'
                + '<td <label onclick=stopRobot("' + robotCode + '")> <a>Stop</a></label ></td>'
                + '<td><label onclick=finishRobot("' + robotCode + '")> <a>Finish</a></label >'
                + '</td ></tr > </tr>';
            $('#tableDriver').append(html)
        },
        fail: function (data) {
            console.log("1111");
        }
    });
}

// Xét các tọa độ thuộc polygon
function Contains(x, y, points) {
    var j = 0;
    var oddNodes = false;
    /*
    var splPoint1 = p.split(':');
    var splitPoint = splPoint1[0].split(',').map(function (item) {
        return parseFloat(item);
    });

    var x = splitPoint[1], y = splitPoint[0];
    */
    
    for (i in points) {

        j++;
        if (j == points.length) { j = 0; }
        if (((points[i]['lat'] < y) && (points[j]['lat'] >= y))
            || ((points[j]['lat'] < y) && (points[i]['lat'] >= y))) {
            if (points[i]['lng'] + (y - points[i]['lat'])
                / (points[j]['lat'] - points[i]['lat'])
                * (points[j]['lng'] - points[i]['lng']) < x) {
                oddNodes = !oddNodes
            }
        }
    }
    //console.log('check: ' + oddNodes);
    return oddNodes;
}


// Lấy tọa độ 4 góc theo map
var getCoordinate = function () {

    var bounds = map.getBounds();
    var x1 = bounds.getNorthEast().lat();
    var y1 = bounds.getNorthEast().lng();
    var x2 = bounds.getSouthWest().lat();
    var y2 = bounds.getSouthWest().lng()

    polygon =
        [{ lat: x1, lng: y1 },
        { lat: x1, lng: y2 },
        { lat: x2, lng: y2 },
        { lat: x2, lng: y1 },
        { lat: x1, lng: y1 }];
}

// Sự kiện kéo map
var checknewzoom = function () {
    var newZoomLevel = map.getView().getZoom();
    console.log("newZoomLevel: " + newZoomLevel);
    var bounds = map.getView().calculateExtent(map.getSize());
    var extent = ol.proj.transformExtent(bounds, 'EPSG:3857', 'EPSG:4326');
     polygon =
        [{ lat: extent[1], lng: extent[2] },
        { lat: extent[3], lng: extent[2] },
        { lat: extent[3], lng: extent[0] },
        { lat: extent[1], lng: extent[0] },
        { lat: extent[1], lng: extent[2] }];
     
    

}

var draw = function (x,y,id) {
    var lonlat3857 = new ol.geom.Point(ol.proj.transform([y,x], 'EPSG:4326',
        'EPSG:3857'));
    //   var carFeature = renderCarFeature(lonlat3857,data.id);
    // console.log("22222222222222222222222222222222222222")
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            rotation: 0,
            src: 'lib/assets/layouts/monitor/image/car.png'
        }))
    });

    var iconFeature = new ol.Feature({
        geometry: lonlat3857,
        name: "" /*+ "_" + data.location_message.channel*/,
        population: 4000,
        rainfall: 500,
        style: iconStyle
    });
    iconFeature.setId(id);
    iconFeature.setStyle(iconStyle);
    carSourceVector.addFeature(iconFeature);
}


