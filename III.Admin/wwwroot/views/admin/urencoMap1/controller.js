var ctxfolder = "/views/admin/urencoMap";
//var webSyncHandleUrl = "https://websync.s-work.vn/websync.ashx";
var webSyncHandleUrl = 'http://117.6.131.222:8080/websync.ashx';
var currentRoom = "HN.VN";
var mUtil;
var carSourceVector = new ol.source.Vector({
    features: []

});
var popup;
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngSanitize', "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {

        getAllData: function (data, callback) {
            $http.get('/Admin/Map/GetAll?objType=' + data).then(callback);
        },

    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $filter, dataservice, $cookies, $translate) {
    $rootScope.IsMapCustomer = true;
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    //$rootScope.$on('$translateChangeSuccess', function () {
    //    caption = caption[culture];
    //    $.extend($.validator.messages, {
    //        min: caption.COM_VALIDATE_VALUE_MIN,
    //        //max: 'Max some message {0}'
    //    });
    //});

});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function (error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else if (element.prop('type') === 'radio' && element.parent('.radio-inline').length) {
                error.insertAfter(element.parent().parent());
            } else if (element.prop('type') === 'checkbox' || element.prop('type') === 'radio') {
                error.appendTo(element.parent().parent());
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        success: function (label) {
            label.closest('.form-group').removeClass('has-error');
        }
    });
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, $location, dataservice, $filter, DTOptionsBuilder, DTColumnBuilder) {
    var map;
    var cars = {};
    $scope.numLines = [{ Code: '', Name: "Tất cả" }, { Code: 1, Name: "1 Chiều" }, { Code: 2, Name: "2 Chiều" }];
    $scope.statuss = [{ Code: '', Name: "Tất cả" }, { Code: 1, Name: "Cấm đường" }, { Code: 2, Name: "Hoạt động" }];
    setTimeout(function () {
        config.init();
    }, 200);
    //load map

    var config = {
        init: function () {
            config.loadMap();
            config.setHeightMap();
            //config.mapClick();
        },
        //load map
        loadMap: function () {
            debugger
            var styles = {
                default: null,
                hide: [
                    {
                        featureType: 'poi.business',
                        stylers: [{ visibility: 'off' }]
                    },
                    {
                        featureType: 'transit',
                        elementType: 'labels.icon',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            };

            //carLayerMarker = new ol.layer.Vector({
            //    source: carSourceVector
            //});
            //carLayerMarker.setZIndex(2);
            //fields_vector_source = new ol.source.Vector({});

            //vectorSource1 = new ol.source.Vector({});
            //var view1 = new ol.View({
            //    //	center : ol.proj.fromLonLat([105.810227394,20.991132437]),
            //    center: ol.proj.fromLonLat([105.8102273, 20.99113243]),
            //    zoom: 12
            //});
            //var googleLayer = new ol.layer.Tile({
            //    source: new ol.source.OSM({
            //        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            //        attributions: [
            //            new ol.Attribution({ html: '© Google' }),
            //            new ol.Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
            //        ]
            //    })
            //});
            //map = new ol.Map({
            //    target: $('#map')[0],
            //    layers: [
            //        googleLayer,
            //        //vectorLayerMarker,
            //        carLayerMarker

            //    ],
            //    view: new ol.View({
            //        center: ol.proj.transform([105.805069, 20.991153], 'EPSG:4326', 'EPSG:3857'),
            //        zoom: 15
            //    }),
            //    controls: ol.control.defaults({
            //        attribution: false,
            //        zoom: false,
            //    })
            //});
            //element = document.getElementById('popupBooking');
            //popup = new ol.Overlay({
            //    element: element,
            //    positioning: 'bottom-center',
            //    stopEvent: false,
            //    offset: [0, -10]
            //});
            //map.addOverlay(popup);
            ////map.addLayer(drawLV);
            //map.addOverlay(popup);



            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 20.996721, lng: 105.808515 },
                zoom: 13,
                mapTypeControl: false
            });

            // autocomplete
            var input = document.getElementById('autocomplete');
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);
            // Set the data fields to return when the user selects a place.
            autocomplete.setFields(
                ['address_components', 'geometry', 'icon', 'name']);

            var infowindow = new google.maps.InfoWindow();
            var infowindowContent = document.getElementById('infowindow-content');
            infowindow.setContent(infowindowContent);
            var marker = new google.maps.Marker({
                map: map,
                anchorPoint: new google.maps.Point(0, -29)
            });

            autocomplete.addListener('place_changed', function () {
                infowindow.close();
                marker.setVisible(false);
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);  // Why 17? Because it looks good.
                }
                marker.setPosition(place.geometry.location);
                marker.setVisible(true);

                var address = '';
                if (place.address_components) {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                    ].join(' ');
                }

                infowindowContent.children['place-icon'].src = place.icon;
                infowindowContent.children['place-name'].textContent = place.name;
                infowindowContent.children['place-address'].textContent = address;
                infowindow.open(map, marker);
            });
            //option ve Polyline
            poly = new google.maps.Polyline({
                strokeColor: '#32CD32',
                strokeOpacity: 1.0,
                strokeWeight: 3
            });
            poly.setMap(map);
            //hide and show icon 
            document.getElementById('hide-poi').addEventListener('click', function () {
                map.setOptions({ styles: styles['hide'] });
            });
            document.getElementById('show-poi').addEventListener('click', function () {
                map.setOptions({ styles: styles['default'] });
            });
            // chuyeern map gg vaf osm
            document.getElementById('show-OSM').addEventListener('click', function osm() {
                var element = document.getElementById("map");
                var mapTypeIds = [];
                for (var type in google.maps.MapTypeId) {
                    mapTypeIds.push(google.maps.MapTypeId[type]);
                }
                mapTypeIds.push("OSM");

                var map = new google.maps.Map(element, {
                    center: new google.maps.LatLng(20.996721, 105.808515),
                    zoom: 11,
                    mapTypeId: "OSM",
                    mapTypeControlOptions: {
                        mapTypeIds: mapTypeIds
                    }
                });

                map.mapTypes.set("OSM", new google.maps.ImageMapType({
                    getTileUrl: function (coord, zoom) {
                        // See above example if you need smooth wrapping at 180th meridian
                        return "https://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
                    },
                    tileSize: new google.maps.Size(256, 256),
                    name: "OpenStreetMap",
                    maxZoom: 18
                }));
            });
            document.getElementById('show-gg').addEventListener('click', function googleMap() {
                map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: 20.996721, lng: 105.808515 },
                    zoom: 13,
                    mapTypeControl: false
                });
                poly = new google.maps.Polyline({
                    strokeColor: '#32CD32',
                    strokeOpacity: 1.0,
                    strokeWeight: 3
                });
                poly.setMap(map);
            });
        },
        setHeightMap: function () {
            var maxHeightMap = $(window).height() - $("#map").position().top - 40;
            $("#map").css({
                'height': maxHeightMap,
                'max-height': maxHeightMap,
                'overflow': 'auto',
            });
        },
        radians: function (n) {
            return n * (Math.PI / 180);
        },
        degrees: function (n) {
            return n * (180 / Math.PI);
        },
        getBearing: function (startLat, startLong, endLat, endLong) {
            startLat = config.radians(startLat);
            startLong = config.radians(startLong);
            endLat = config.radians(endLat);
            endLong = config.radians(endLong);
            var dLong = endLong - startLong;
            var dPhi = Math.log(Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0));
            if (Math.abs(dLong) > Math.PI) {
                if (dLong > 0.0)
                    dLong = -(2.0 * Math.PI - dLong);
                else
                    dLong = (2.0 * Math.PI + dLong);
            }
            return (config.degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
        }
    }
    //code join websync
    fm.websync.client.enableMultiple = true;
    client = new fm.websync.client(webSyncHandleUrl);
    client.setDisableCORS(true);
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
                    channel: '/' + currentRoom,
                    onSuccess: function (args) {
                        // console.log("subcribe successx: "+channel);
                        //	util.log('subcribe success to WebSync.')
                    },
                    onFailure: function (args) {
                        // console.log("subcribe failed: "+args.channel);
                    },
                    onReceive: function (args) {
                        var dataDriver = args.getData();
                        console.log("onReceive-----------");
                        console.log(dataDriver);
                        drawMarkerExist(dataDriver);
                        //drawMarkerExistRm(dataDriver);
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
        //allUserOrder = {};
        //allClientMap = {};
        //allClientArr = [];
        client.connect({
            onSuccess: function (args) {
                chatObject.clientId = args.clientId;
            },
            onFailure: function (args) {

            }
        });

        util.subcribe();
        //changeRoom("VN.HN.TX");
    });
    //Ham ve tren Map gg
    drawMarkerExist = function (data) {
        if (data == null) {
        }
        else {
            var id = data.locationMessage.driverId;
            var name = data.locationMessage.driverName;
            if (cars[id] != undefined) {
                //di chuyển maker 


                // vị trí hien tai
                var lat = cars[id].getPosition().lat();
                var lng = cars[id].getPosition().lng();
                var bearing = config.getBearing(lat, lng, data.locationMessage.latitude, data.locationMessage.longitude)






                //console.log(bearing);
                //$('img[src="/images/map/car.png"]').css({
                //    'transform': 'rotate(' + bearing + 'deg)'
                //});
                var icon = cars[id].getIcon();
                console.log(icon);
                icon.rotation = bearing;
                cars[id].setIcon(icon);
                var latlong = { "lat": data.locationMessage.latitude, "lng": data.locationMessage.longitude }
                cars[id].setPosition(latlong);

            }
            else {
                // Tạo mảng id người dùng và tên người dùng
                //this.listID.push({
                //    Id: id,
                //    Name: data.locationMessage.driverName
                //});
                //tạo mới maker
                //this.loc = new LatLng(data.locationMessage.latitude, data.locationMessage.longitude);
                //this.gpsDirect = { lat: data.locationMessage.latitude, lng: data.locationMessage.longitude };
                // var bear = bearing(lat, lon, book.location[0], book.location[1]);
                //{
                //    "lat": 21.035487313948504,
                //        "lng": 105.83923336615783
                //}
                //var contentString = '<div id="content">' +
                //    '<div id="siteNotice">' +
                //    '</div>' +
                //    '<h1 id="firstHeading" class="firstHeading"><b>Thông tin xe</b></h1>' +
                //    '<div id="bodyContent">' +
                //    '<p><b>Tên tài xế : </b>' + name + '<br>' +
                //    '<b>Biển số xe : </b>' + '29B - 125.' + id + '<br>' +
                //    '<b>Tình trạng : </b>' + 'Đang hoạt động' +
                //    '</p>' +
                //    '</div>' +
                //    '</div>';
                var contentString = '<div id="content">' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<h1 id="firstHeading" class="firstHeading"><b>Thông tin xe</b></h1>' +
                    '<div id="bodyContent">' +
                    '<table>' +
                    '<tbody>' +
                    '<tr>' +
                    '<td id="taixe_cot1">Tên tài xế : </td>' +
                    '<td>' + name + '<td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td id="bienso_cot1">Biển số xe : </td>' +
                    '<td> 29B - 125.' + id + '<td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td id="tinhtrang_cot1">Tình trạng :</td>' +
                    '<td>Đang hoạt động<td>' +
                    '</tr>' +
                    '</tbody>' +
                    '</table>' +
                    '</div>' +
                    '</div>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                var latlong = { "lat": data.locationMessage.latitude, "lng": data.locationMessage.longitude };


                //var icon = {

                //    path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
                    //fillColor: '#FF0000',
                    //fillOpacity: .6,
                    //anchor: new google.maps.Point(12, -290),
                    //strokeWeight: 0,
                    //scale: .25,
                //    rotation: rotation
                //}
                var pathimg = "M32,68.597h266.709c17.664,0,32,14.325,32,32v255.819H0V100.597C0,82.923,14.325,68.597,32,68.597 " +
                    "M478.645,269.291l-18.005-62.24c-3.104-10.699-13.056-18.187-24.203-18.187h-81.664v80.427H478.645z " +
                    "478.667,269.259 354.731,269.259 354.731,188.832 " +
                    "M478.645,269.291l-18.005-62.24c-3.104-10.699-13.056-18.187-24.203-18.187h-81.664L478.645,269.291z " +
                    "M32,68.597h266.709c17.664,0,32,14.325,32,32v255.819H0V100.597C0,82.923,14.325,68.597,32,68.597 " +
                    "M512.043,356.405v36.16h-512v-36.16h53.44c12.48-22.4,36.48-37.547,64-37.547  c27.413,0,51.413,15.147,64,37.547h171.947c12.48-22.4,36.363-37.547,63.883-37.547c27.52,0,51.413,15.147,64,37.547H512.043z " +
                    "M468.416,392.341c0,28.224-22.88,51.104-51.104,51.104s-51.083-22.88-51.083-51.104  s22.869-51.104,51.083-51.104C445.547,341.237,468.416,364.117,468.416,392.341 " +
                    "M437.856,392.341c0,11.339-9.195,20.523-20.523,20.523c-11.339,0-20.544-9.184-20.544-20.523  c0-11.339,9.195-20.523,20.544-20.523C428.661,371.808,437.856,381.003,437.856,392.341 " +
                    "M168.544,392.341c0,28.224-22.891,51.104-51.104,51.104c-28.224,0-51.104-22.88-51.104-51.104  s22.88-51.104,51.104-51.104C145.653,341.237,168.544,364.117,168.544,392.341 " +
                    "M137.963,392.341c0,11.339-9.184,20.523-20.523,20.523s-20.533-9.184-20.533-20.523  c0-11.339,9.195-20.523,20.533-20.523S137.963,381.003,137.963,392.341";
                var imgMaker = {
                    //url: '/images/map/car.png',
                    //path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
                    path: pathimg,
                    labelOrigin: new google.maps.Point(18, -8),
                    fillColor: '#FF0000',
                    fillOpacity: .6,
                    anchor: new google.maps.Point(12, -290),
                    strokeWeight: 0,
                    scale: .1,
                    rotation: 0
                }
                cars[id] = new google.maps.Marker({
                    position: latlong,
                    icon: imgMaker,
                    map: map,
                    draggable: false,
                    labelclass: "labels",
                    label: {
                        text: "29b-125." + id,
                        color: 'red',
                        fontsize: '12px',
                        fontweight: '1000'
                    }
                });

                //var defer = $.Deferred();
                //defer.resolve(map);
                //var RotateIcon = function (options) {
                //    this.options = options || {};
                //    this.rImg = options.img || new Image();
                //    this.rImg.src = this.rImg.src || this.options.url || '';
                //    this.options.width = this.options.width || this.rImg.width || 100;
                //    this.options.height = this.options.height || this.rImg.height || 100;
                //    canvas = document.createElement("canvas");
                //    canvas.width = this.options.width;
                //    canvas.height = this.options.height;
                //    this.context = canvas.getContext("2d");
                //    this.canvas = canvas;
                //};
                //RotateIcon.makeIcon = function (url) {
                //    return new RotateIcon({ url: url });
                //};
                //RotateIcon.prototype.setRotation = function (options) {
                //    var canvas = this.context,
                //        angle = options.deg ? options.deg * Math.PI / 180 :
                //            options.rad,
                //        centerX = this.options.width / 2,
                //        centerY = this.options.height / 2;

                //    canvas.clearRect(0, 0, this.options.width, this.options.height);
                //    canvas.save();
                //    canvas.translate(centerX, centerY);
                //    canvas.rotate(angle);
                //    canvas.translate(-centerX, -centerY);
                //    canvas.drawImage(this.rImg, 0, 0);
                //    canvas.restore();
                //    return this;
                //};
                //RotateIcon.prototype.getUrl = function () {
                //    return this.canvas.toDataURL('image/png');
                //};


                //$(function () {
                //    debugger
                //    $('#test').one('load', function () {
                //        (function (test) {
                //            defer.then(function (map) {
                //                debugger
                //                cars[id] = new google.maps.Marker({
                //                    position: latlong,
                //                    map: map,
                //                    draggable: false,
                //                    labelclass: "labels",
                //                    label: {
                //                        text: "29b-125." + id,
                //                        color: 'red',
                //                        fontsize: '12px',
                //                        fontweight: '1000'
                //                    }
                //                });
                //                var step = 1;
                //                var angle = 1;
                //                test.attr('src', RotateIcon.makeIcon("/images/map/xeracX.png")
                //                    .setRotation({ deg: angle += step % 360 })
                //                    .getUrl());
                //                marker.setOptions({
                //                    icon: test.attr('src')
                //                })

                //            })
                //        })($(this))
                //    }).each(function () {
                //        if (this.complete) {
                //            $(this).trigger('load');
                //        }
                //    })
                //})

                //------------
                //var RotateIcon = function (options) {
                //    this.options = options || {};
                //    this.rImg = options.img || new Image();
                //    this.rImg.src = this.rImg.src || this.options.url || '';
                //    this.options.width = this.options.width || this.rImg.width || 15;
                //    this.options.height = this.options.height || this.rImg.height || 44;
                //    var canvas = document.createElement("canvas");
                //    canvas.width = this.options.width;
                //    canvas.height = this.options.height;
                //    this.context = canvas.getContext("2d");
                //    this.canvas = canvas;
                //};
                //debugger
                //RotateIcon.makeIcon = function (url) {
                //    return new RotateIcon({ url: url });
                //};
                //RotateIcon.prototype.setRotation = function (options) {
                //    var canvas = this.context,
                //        angle = options.deg ? options.deg * Math.PI / 180 :
                //            options.rad,
                //        centerX = this.options.width / 2,
                //        centerY = this.options.height / 2;

                //    canvas.clearRect(0, 0, this.options.width, this.options.height);
                //    canvas.save();
                //    canvas.translate(centerX, centerY);
                //    canvas.rotate(angle);
                //    canvas.translate(-centerX, -centerY);
                //    canvas.drawImage(this.rImg, 0, 0);
                //    canvas.restore();
                //    return this;
                //};
                //RotateIcon.prototype.getUrl = function () {
                //    return this.canvas.toDataURL('image/png');
                //};

                //cars[id] = new google.maps.Marker({
                //    icon: {
                //        url: RotateIcon
                //            .makeIcon(
                //                '/images/map/xeracX.png')
                //            .getUrl()
                //    },
                //    //icon: imgMaker,
                //position: latlong,
                //map: map,
                //draggable: false,
                //labelclass: "labels",
                //label: {
                //    text: "29b-125." + id,
                //    color: 'red',
                //    fontsize: '12px',
                //    fontweight: '1000'
                //}
                //})
                //cars[id].addListener('click', function () {
                //    infowindow.open(map, cars[id]);
                //});
            }
        }
    };
    //ham vẽ trên map ol
    drawMarkerExistRm = function (data) {
        //var lat = cars[id].getPosition().lat();
        //var lng = cars[id].getPosition().lng();
        //var bearing = config.getBearing(lat, lng, data.locationMessage.latitude, data.locationMessage.longitude)
        var styleFunction = new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 0.5],
                size: [32, 32],
                opacity: 6,
                scale: 0.7,
                //rotation: this.get("bear"),
                src: '/images/map/car.png'
            })),
        })

        try {
            //var book = data.bookUserSend;
            var id = data.locationMessage.driverId;
            //console.log(" -------------> ");
            //console.log(data);
            //console.log(" <---------------------------------------------------------------------------------------------------------");
            var book = {
                location: [data.locationMessage.latitude, data.locationMessage.longitude]
            };
            if (data != null) {
                if (carSourceVector.getFeatureById(id) != null) {
                    var feature1 = carSourceVector.getFeatureById(id);
                    var popup = feature1.get("popup");
                    popup.hide();
                    map.removeOverlay(popup);

                    var coord = feature1.getGeometry().getCoordinates();
                    var coord1 = feature1.getGeometry().getCoordinates();
                    coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
                    var lon = coord[0];
                    var lat = coord[1];
                    //if (data.type != -888 && Contains(book.location[1], book.location[0], polygon)) {
                    var bear = bearing(lat, lon, book.location[0], book.location[1]);
                    var styleFunction1 = new ol.style.Style({
                        image: new ol.style.Icon(({
                            anchor: [0.5, 0.5],
                            size: [32, 32],
                            opacity: 6,
                            scale: 0.7,
                            rotation: bear,
                            src: '/images/map/car.png'
                        })),
                    })
                    var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                        'EPSG:3857'));
                    var style = carSourceVector.getFeatureById(id).getStyle();
                    carSourceVector.getFeatureById(id).setGeometry(lonlat3857);
                    carSourceVector.getFeatureById(id).set("name", data.locationMessage.driverName);
                    carSourceVector.getFeatureById(id).set("bear", bear);
                    carSourceVector.getFeatureById(id).setStyle(styleFunction1);
                    console.log("-------------------------------------------");
                    //}
                    //else {
                    //    var fea = carSourceVector.getFeatureById(id);
                    //    carSourceVector.removeFeature(fea);
                    //    var popup = fea.get("popup");
                    //    popup.hide();
                    //    map.removeOverlay(popup);
                    //    console.log("++++++++++++++++++++++++++++++++++++++");
                    //}

                }
                else if (carSourceVector.getFeatureById(id) == null) {
                    var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                        'EPSG:3857'));

                    var iconFeature = new ol.Feature({
                        geometry: lonlat3857,
                        name: "" /*+ "_" + data.location_message.channel*/,
                        population: 4000,
                        rainfall: 500,
                        style: styleFunction
                    });
                    iconFeature.setId(id);
                    iconFeature.set("name", data.locationMessage.driverName);

                    iconFeature.set("isShow", false);
                    var popup = new ol.Overlay.Popup;
                    iconFeature.set("popup", popup);
                    iconFeature.setStyle(styleFunction);
                    carSourceVector.addFeature(iconFeature);
                    //map.getViewport().addEventListener("click", function (e) {
                    //    map.forEachFeatureAtPixel(map.getEventPixel(e), function (feature, layer) {
                    //        console.log("aaaaaaaaaaaaaaaaa");
                    //        map.addOverlay(popup);
                    //        var html = '<div id="content">' +
                    //            '<div id="siteNotice">' +
                    //            '</div>' +
                    //            '<h1 id="firstHeading" class="firstHeading"><b>Thông tin xe</b></h1>' +
                    //            '<div id="bodyContent">' +
                    //            '<p><b>Tên tài xế : </b>' + name + '<br>' +
                    //            '<b>Biển số xe : </b>' + '29B - 125.' + id + '<br>' +
                    //            '<b>Tình trạng : </b>' + 'Đang hoạt động' +
                    //            '</p>' +
                    //            '</div>' +
                    //            '</div>';
                    //        popup.show(coord, html);
                    //    });
                    //});

                }

            }
        }
        catch (ex) {
            console.log(data);
        }
    };

    Contains = function (x, y, points) {
        console.log("**********************");
        console.log(points);
        console.log("111111111111111111111111");
        var j = 0;
        var oddNodes = false;
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
        return oddNodes;
    };
    //Ham dong menu
    setTimeout(function () {
        $.app.menu.expanded = true;
        $.app.menu.collapsed = false;
        $.app.menu.toggle();
    }, 100);
    //Hide leftMenu
    setTimeout(function () {
        $("#arrow-tab-urenco-hide").click(function () {
            $(".leftPanel").show(500);
            $(".rightPanel-hide").hide(500);

        });
        $("#arrow-tab-urenco").click(function () {
            $(".leftPanel").hide(500);
            $(".rightPanel-hide").show(500);
        });
    });
});