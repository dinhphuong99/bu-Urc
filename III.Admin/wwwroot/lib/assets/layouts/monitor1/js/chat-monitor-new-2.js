
//var webSyncHandleUrl = 'https://websync.s-work.vn/websync.ashx';
var webSyncHandleUrl = 'http://117.6.131.222:8080/websync.ashx';
var host = "http://117.6.131.222:4010";
//var host = "http://localhost:5100";
//var hostSwork = "http://s-work.vn";

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
var pins = [
    { name: "Romooc, Tam Long", pin: "RM" },
    { name: "Vicem", pin: "VC" },
    { name: "S-work", pin: "SW" },
    { name: "Công ty môi trường Hà Nội", pin: "HN.VN" }
]
var currentRoom = pins[3].pin;
var list = [10000];
var data;
var map, polygon, id;
id = 0;
carSourceVector = new ol.source.Vector({
    features: []

});
[{"id":"11555124643704","endereco":"Taquara - RS, Brasil","lonlat":[-5652354.790976063,-3458758.3463331293],"desc":"","parada":1,"rota":[],"titulo":"teste"},
{"id":"1155512471187","endereco":"Porto Alegre - RS, Brasil","lonlat":[-5701522.828947599,-3508003.6558393957],"desc":"","parada":2,"rota":[[[-5652364.4757717615,-3458755.1440211986],"0,0"],[[-5652991.204504928,-3460794.409209077],"1,6"],[[-5655450.363376042,-3462894.0916865217],"3,3"],[[-5656636.472550443,-3463549.12735936],"4,9"],[[-5658193.60958766,-3464244.1781683587],"6,6"],[[-5658309.938455539,-3464937.344190145],"8,2"],[[-5658753.3239873685,-3464813.1636174275],"9,8"],[[-5659405.99016189,-3466882.7399102626],"11,5"],[[-5659417.901347405,-3467979.4375401046],"13,1"],[[-5659193.258614984,-3469064.5629181396],"14,8"],[[-5659837.019230241,-3469323.7759347623],"16,4"],[[-5660949.991499193,-3470434.4000548366],"18,0"],[[-5660857.485002344,-3471126.2328895433],"19,7"],[[-5661597.648296627,-3470563.506877913],"21,3"],[[-5661880.399803243,-3470987.376129928],"23,0"],[[-5662711.065843542,-3472066.3441478917],"24,6"],[[-5663804.557201605,-3472726.2068976895],"26,2"],[[-5664352.360415798,-3474156.0685352483],"27,9"],[[-5665685.74527652,-3475601.095798322],"29,5"],[[-5665639.881646313,-3476826.0398931582],"31,2"],[[-5666881.984524584,-3478676.7609132407],"32,8"],[[-5666698.530003757,-3479674.2623296143],"34,4"],[[-5666603.017880657,-3481178.038074919],"36,1"],[[-5666680.71888523,-3481941.412877518],"37,7"],[[-5667964.78921153,-3483343.040644237],"39,4"],[[-5669186.96590095,-3485168.004385581],"41,0"],[[-5672607.145936082,-3485107.035439237],"42,6"],[[-5677008.162004595,-3488622.914850853],"44,3"],[[-5678047.774729113,-3489986.495802677],"45,9"],[[-5680289.415315217,-3490838.7434764034],"47,6"],[[-5681795.234067177,-3492364.507477413],"49,2"],[[-5683135.854694801,-3493714.872470905],"50,8"],[[-5684801.41691605,-3494712.1329178363],"52,5"],[[-5686406.977931761,-3495552.620316036],"54,1"],[[-5687368.778332216,-3496619.3982721255],"55,8"],[[-5689670.420123857,-3498376.744324593],"57,4"],[[-5690670.848387616,-3499438.232685465],"59,0"],[[-5698972.388094034,-3499890.1726210634],"60,7"],[[-5700298.537187854,-3503284.538308085],"62,3"],[[-5701536.409925476,-3506243.569283563],"64,0"],[[-5701805.246495741,-3506667.4644706794],"65,6"],[[-5701721.979516628,-3507316.3844104544],"67,2"],[[-5701781.869402674,-3507595.5317221563],"68,9"],[[-5701593.739463234,-3507979.8675280297],"70,5"],[[-5701522.828947599,-3508003.6558393957],"72,2"]]}]
const path=[
    ol.proj.transform([ 105.8101872,20.9962109], 'EPSG:4326', 'EPSG:3857'),
    ol.proj.transform([105.8176866,21.0011489], 'EPSG:4326', 'EPSG:3857'), 
    ol.proj.transform( [105.8222356, 21.0046775 ],'EPSG:4326', 'EPSG:3857'), 
        ol.proj.transform([ 105.8238289,21.0080036 ],'EPSG:4326', 'EPSG:3857'), 
            ol.proj.transform([105.8250012,21.0104199],'EPSG:4326', 'EPSG:3857'), 
                ol.proj.transform( [105.8269242,21.0134587],'EPSG:4326', 'EPSG:3857'), 
                    ol.proj.transform( [105.8294953, 21.0177516 ],'EPSG:4326', 'EPSG:3857'), 
                        ol.proj.transform([105.8340038,21.0142161 ],'EPSG:4326', 'EPSG:3857'), 
                            ol.proj.transform( [105.8322809,21.0123176],'EPSG:4326', 'EPSG:3857'), 
                                ol.proj.transform( [105.8307506,21.0110089],'EPSG:4326', 'EPSG:3857'), 
                                    ol.proj.transform( [105.8310524,21.0102828],'EPSG:4326', 'EPSG:3857'), 

]
const ArrayTrashCan = [{
    Id: 1,
    Name: "Thùng rác 1 - Đường : Tràng Thi",
    location: { Lat: 21.024478, Lng: 105.856857 }
},
{
    Id: 2,
    Name: "Thùng rác 2 - Đường : Tràng Thi",
    location: { Lat: 21.024708, Lng: 105.856017 }
},
{
    Id: 3,
    Name: "Thùng rác 3 - Đường : Tràng Thi",
    location: { Lat: 21.024896, Lng: 105.855384 }
},
{
    Id: 4,
    Name: "Thùng rác 4 - Đường : Tràng Thi",
    location: { Lat: 21.024981, Lng: 105.855140 }
},
{
    Id: 5,
    Name: "Thùng rác 5 - Đường : Tràng Thi",
    location: { Lat: 21.025084, Lng: 105.854756 }
},
{
    Id: 6,
    Name: "Thùng rác 6 - Đường : Tràng Thi",
    location: { Lat: 21.025172, Lng: 105.854448 }
},
{
    Id: 7,
    Name: "Thùng rác 7 - Đường : Tràng Thi",
    location: { Lat: 21.025237, Lng: 105.854201 }
},
{
    Id: 8,
    Name: "Thùng rác 8 - Đường : Tràng Thi",
    location: { Lat: 21.025332, Lng: 105.853823 }
},
{
    Id: 9,
    Name: "Thùng rác 9 - Đường : Tràng Thi",
    location: { Lat: 21.025480, Lng: 105.853270 }
},
{
    Id: 10,
    Name: "Thùng rác 10 - Đường : Tràng Thi0",
    location: { Lat: 21.025613, Lng: 105.852870 }
},
{
    Id: 11,
    Name: "Thùng rác 1 - Đường : Tràng Thi1",
    location: { Lat: 21.026282, Lng: 105.850848 }
},
{
    Id: 12,
    Name: "Thùng rác 1 - Đường : Tràng Thi2",
    location: { Lat: 21.027028, Lng: 105.848158 }
},
{
    Id: 13,
    Name: "Thùng rác 1 - Đường : Tràng Thi3",
    location: { Lat: 21.027430, Lng: 105.846811 }
}, {
    Id: 14,
    Name: "Thùng rác 1 - Đường : Tràng Thi4",
    location: { Lat: 21.027749, Lng: 105.845682 }
}, {
    Id: 15,
    Name: "Thùng rác 1 - Đường : Tràng Thi5",
    location: { Lat: 21.028240, Lng: 105.844223 }
}
    , {
    Id: 16,
    Name: "Thùng rác 1 - Đường : Tràng Thi5",
    location: { Lat: 20.992376, Lng: 105.804833 },
    PayLoad: 100
}
    , {
        Id: 17,
        Name: "Thùng rác 1 - Đường : Tràng Thi5",
        location: { Lat: 20.994670, Lng: 105.808030 },
        PayLoad: 90
    }
    , {
        Id: 18,
        Name: "Thùng rác 1 - Đường : Tràng Thi5",
        location: { Lat: 20.997034, Lng: 105.811431 },
        PayLoad: 80
    }
    , {
        Id: 19,
        Name: "Thùng rác 1 - Đường : Tràng Thi5",
        location: { Lat: 20.999247, Lng: 105.814896 },
        PayLoad: 70
    }
    , {
        Id: 20,
        Name: "Thùng rác 1 - Đường : Tràng Thi5",
        location: { Lat: 21.000119, Lng: 105.818136 },
        PayLoad: 60
    }
    ,
     {
        Id: 21,
        Name: "Thùng rác 1 - Đường : Tràng Thi5",
        location: { Lat: 20.992408, Lng: 105.804851 },
        PayLoad:50
    },
     {
         Id: 22,
         Name: "Thùng rác 1 - Đường : Tràng Thi5",
         location: { Lat: 20.992467, Lng: 105.804929 },
         PayLoad: 40
     },
     {
         Id: 23,
         Name: "Thùng rác 1 - Đường : Tràng Thi5",
         location: { Lat: 20.994586, Lng: 105.807834 },
         PayLoad: 30
     },
     {
         Id: 24,
         Name: "Thùng rác 1 - Đường : Tràng Thi5",
         location: { Lat: 20.994586, Lng: 105.807834 },
         PayLoad: 30
     },
     {
         Id: 25,
         Name: "Thùng rác 1 - Đường : Tràng Thi5",
         location: { Lat: 21.000028, Lng: 105.818052 },
         PayLoad: 32
     }
]
var addMarker = function (data) {
    drawMarkerExist(data);
}
//var regularLayer = new olgm.layer.Google({
//    styles: [
//        {
//            "featureType": "poi.business",
//            "elementType": "labels.icon",
//            "stylers": [
//                {
//                    "visibility": "off"
//                }
//            ]
//        },
//        {
//            "featureType": "poi.government",
//            "elementType": "labels.icon",
//            "stylers": [
//                {
//                    "visibility": "off"
//                }
//            ]
//        },
//        {
//            "featureType": "poi.medical",
//            "elementType": "labels.icon",
//            "stylers": [
//                {
//                    "visibility": "off"
//                }
//            ]
//        },
//        {
//            "featureType": "poi.park",
//            "elementType": "labels.icon",
//            "stylers": [
//                {
//                    "visibility": "off"
//                }
//            ]
//        },
//        {
//            "featureType": "poi.place_of_worship",
//            "elementType": "labels.icon",
//            "stylers": [
//                {
//                    "visibility": "off"
//                }
//            ]
//        },
//        {
//            "featureType": "poi.school",
//            "elementType": "labels.icon",
//            "stylers": [
//                {
//                    "visibility": "off"
//                }
//            ]
//        },
//        {
//            "featureType": "poi.sports_complex",
//            "elementType": "labels.icon",
//            "stylers": [
//                {
//                    "visibility": "off"
//                }
//            ]
//        }
//    ]
//});

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
    textArea = document.getElementById('log_id');
    textArea.innerHTML = "";

    for (var i = 0; i < pins.length; i++) {
        $('#listRoom')
            .append($("<option>")
                .attr("class", 'list-group-item')
                .attr("data-customvalue", pins[i].pin)
                .attr("value", pins[i].pin + " - " + pins[i].name));
    }
    oninput = 'onInput()';

    //$.ajax({
    //    type: "GET",
    //    dataType: "json",
    //    url: host+"/PingMeMonitor/GetRooms",
    //    success: function (data) {
    //        listRoom = data;
    //        console.log(data);
    //        for (var i = 0; i < listRoom.length; i++) {
    //            $('#listRoom')
    //                .append($("<option>")
    //                    .attr("class", 'list-group-item')
    //                    .attr("data-customvalue", listRoom[i].District_channel)
    //                    .attr("value", listRoom[i].District_channel + " - " + listRoom[i].District_name));
    //        }

    //        //oninput = 'onInput()' 
    //    },
    //    failure: function (data) {
    //        console.log(data);
    //    }
    //});

    //$.ajax({
    //    type: "GET",
    //    dataType: "json",
    //    url: host+"/PingMeMonitor/GetRobots",
    //    success: function (data) {
    //        robots = data;
    //        console.log(data);
    //        for (var i = 0; i < robots.length; i++) {

    //            $('#listNodeStart')
    //                .append($("<option>")
    //                    .attr("class", 'list-group-item')
    //                    .attr("data-customvalue", robots[i].Username)
    //                    .attr("value", robots[i].Displayname));
    //        }

    //        //oninput = 'onInput()' 
    //    },
    //    failure: function (data) {
    //        console.log(data);
    //    }
    //});

    $.ajax({
        type: "POST",
        dataType: "json",
        url: host + "/Monitor2/getTestUser",
        success: function (data) {
            robots = data;
            console.log(data);
            var id = 0;
            for (var i = 0; i < robots.length; i++) {

                $('#listNodeStart')
                    .append($("<option>")
                        .attr("class", 'list-group-item')
                        .attr("data-customvalue", robots[i].Username)
                        .attr("value", robots[i].GivenName));

                //$('#listNodeStart')
                //    .append($("<option>")
                //        .attr("class", 'list-group-item')
                //        .attr("data-customvalue", i)
                //        .attr("value", robots[i].GivenName));
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
    console.log("idL133333: " + vectorSource.getFeatureById(1).get('name'));
    //-------------------------------------------------------------------------------------------------------------------------------------------------
//debugger
    //vẽ đường ------------------------------------------------------------------------------------------------------------------------
    var ArrayTrashCanIcon = []

    for (var ik = 0; ik < ArrayTrashCan.length; ik++) {
      //  debugger
        var item = ArrayTrashCan[ik];
        var IconTrash = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                zIndex: 1,
                scale: 0.05,
                src: item.PayLoad > 70 ? "monitor/js/red.png" : (item.PayLoad < 40 ? "monitor/js/green.png" :"monitor/js/yellow.png")
            }))
        });
        var iconFeatureTrash = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([ArrayTrashCan[ik].location.Lng, ArrayTrashCan[ik].location.Lat], 'EPSG:4326',
                'EPSG:3857')),
            name: 'Trash',
            population: 4000,
            rainfall: 500,
            style: IconTrash,
            type:'infor',
            desc: "Tên: "+ArrayTrashCan[ik].Name +" </br> Tình trạng : Đầy" +"</br> ID: "+ArrayTrashCan[ik].Id,
        });

        var shadowStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0,0,0,0.5)',
                width: 6
            }),
            zIndex: 0
        });
        iconFeatureTrash.setId(ArrayTrashCan[ik].Id);
        iconFeatureTrash.setStyle([IconTrash, shadowStyle]);
        console.log(iconFeatureTrash)
        ArrayTrashCanIcon.push(iconFeatureTrash)
    }

    var vectorSourceTrash = new ol.source.Vector({
        features: ArrayTrashCanIcon
    });


    var vectorLayerMarkerTrash = new ol.layer.Vector({
        source: vectorSourceTrash
    });
    var vectorLayerMarker = new ol.layer.Vector({
        source: vectorSource
    });
    // car layer
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

//////////////////////////////////////
var IconCarRun = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
        anchor: [1,1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        rotation: 0,
        zIndex: 1,
        scale: 1,
        src: './monitor/js/xerac.png'
    }))
});
var iconFeatureCarRun = new ol.Feature({
    geometry: new ol.geom.Point(path[0]),
    name: 'CarRun',
    population: 4000,
    rainfall: 500,
    style: IconCarRun
});

var shadowStyleCar = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#CC0000',
        width: 6
    }),
    zIndex: 0
});
iconFeatureCarRun.setId(12);
iconFeatureCarRun.setStyle([IconCarRun, shadowStyleCar]);

var vectorSourceCar = new ol.source.Vector({
    features: [iconFeatureCarRun]
});


var vectorLayerMarkerCar = new ol.layer.Vector({
    source: vectorSourceCar
});


var osm = new ol.source.OSM();

var sourceFeatures = new ol.source.Vector(),
    layerFeatures = new ol.layer.Vector({source: sourceFeatures});
    
    
var lineString = new ol.geom.LineString([]);

var layerRoute =  new ol.layer.Vector({
    source: new ol.source.Vector({
        features: [
            new ol.Feature({ geometry: lineString })
        ]
    }),
    style: [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 3, color: '#CC0000'
               // lineDash: [.1, 5]
            }),
            zIndex: 2
        })
    ],
    updateWhileAnimating: true
});

var lineString2 = new ol.geom.LineString([]);
var path2 = []
var xol = 1
var yol =1
path.forEach(function(e)
{
    var kl = []
    kl.push(e[0])
    kl.push(e[1]-30)

    path2.push(kl)
    //-5652354.790976063
})
// for(o = 0;o<path.length;o++)
// {
//     var kl =[]
//     if(o<path.length-1)
//     {
//     //     if(path[o][1]>path[o+1][1]&& path[o][0]>path[o+1][0]){
//     //         kl.push(path[o][0]-60)
//     //         kl.push(path[o][1] )
//     //  }
//     //  else if(path[o][1]>path[o+1][1]&& path[o][0]<path[o+1][0])
//     //  {
//     //     kl.push(path[o][0]-30)
//     //     kl.push(path[o][1])
//     //  }
//     //  else{
//     //     kl.push(path[o][0])
//     //     kl.push(path[o][1]-30)
//     //  }
//     if(path[o][0]<path[o+1][1]&& path[o][1]<path[o+1][0]){
//         //X tang, Y tang
//         kl.push(path[o][0]-)
//         kl.push(path[o][1]-)
//     }
//     else if(path[o][0]<path[o+1][1]&& path[o][1]>path[o+1][0]){
//         //X tang, Y giam
//         kl.push(path[o][0]-)
//         kl.push(path[o][1]-)
//     }
//     else if(path[o][0]>path[o+1][1]&& path[o][1]<path[o+1][0]){
//         //X giam, Y giam
//         kl.push(path[o][0]-)
//         kl.push(path[o][1]-)
//     }
//     else if(path[o][0]<path[o+1][1]&& path[o][1]<path[o+1][0]){
//         //X giam, Y tang
//         kl.push(path[o][0]-)
//         kl.push(path[o][1]-)
//     }
//     }
//     // else{
//     //     kl.push(path[o][0])
//     //     kl.push(path[o][1]-30)
//     // }
//     path2.push(kl)

    
// }


///khoa 2
//  function VectorAB(A,B) {
//      var ha = (B[1]-A[1])/(B[0]-A[0])
//      var hb = A[1]-ha*A[0]
//     return [ha,hb]
//  }
//  function GetPoin(A,B,K)
//  {
//      var AB= VectorAB(A,B)
//      var G = AB
//      k= Math.sqrt((G[0]*G[0]+1)/400)

//         G[0]=G[0]/k
//         G[1]=-1/k

//      var C = [A[0]+G[0],A[1]+G[1]]
//      var D = [A[0]-G[0],A[1]-G[1]]
     
//     if( (AB[0]*C[0]-C[1]+AB[1])*((AB[0]*K[0] -K[1]+AB[1]))>0 )
//     {
//         return C
//     }
//     else{
//         return D
//     }
     
//  }

//  for(o = 0;o<path.length;o++)
//  {
//      if(o>0&&o<path.length-1)
//      {
        
//        path2.push(GetPoin(path[o-1],path[o],path2[path2.length-1]))
//         path2.push(GetPoin(path[o],path[o+1],path2[path2.length-1]))
        
//      }
//      else
//      {
//          var kl=[]
//         kl.push(path[o][0])
//        kl.push(path[o][1]-30)
//        path2.push(kl)
//      }
//  }
 
//khoa 3
 function VectorAB(A,B) {
     var ha = (B[1]-A[1])/(B[0]-A[0])
     var hb = A[1]-ha*A[0]
    return [ha,hb]
 }
for(kh=0;kh<path.length;kh++)
{
    if(kh>0&&kh<path.length-1)
    {

    }
}



//
console.log(path)
console.log(path2)

lineString2.setCoordinates(path2);

var layerRoute2 =  new ol.layer.Vector({
    source: new ol.source.Vector({
        features: [
            new ol.Feature({ geometry: lineString2 })
        ]
    }),
    style: [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 3, color: '#00FF99'
               // lineDash: [.1, 5]
            }),
            zIndex: 2
        })
    ],
    updateWhileAnimating: true
});

///////////////////////////////////////////////////////////////

    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
              }),
            googleLayer,
            vectorLayerMarker,
            carLayerMarker,
            vectorLayerMarkerTrash,
            layerFeatures,
            layerRoute,
            vectorLayerMarkerCar,
            layerRoute2
        ],

        view: view1,
        
    });
    
    // var markerEl = document.getElementById('geo-marker');
    // var marker = new ol.Overlay({
    //     positioning: 'center-center',
    //     offset: [0, -5],
    //     element: markerEl,
    //     stopEvent: false
    // });
    // map.addOverlay(marker);
    
    
    var fill = new ol.style.Fill({color:'rgba(255,255,255,1)'}),
        stroke = new ol.style.Stroke({color:'rgba(0,0,0,1)'}),
        style1 = [
            new ol.style.Style({
                image: new ol.style.Icon(({
                    scale: .7, opacity: 1,
                    rotateWithView: false, anchor: [0.5, 1],
                    anchorXUnits: 'fraction', anchorYUnits: 'fraction',
                    src: '//raw.githubusercontent.com/jonataswalker/map-utils/master/images/marker.png'
                })),
                zIndex: 5
            }),
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6, fill: fill, stroke: stroke
                }),
                zIndex: 4
            })
        ];


        var feature1 = new ol.Feature({
        geometry: new ol.geom.Point(path[0])
    }),
    feature2 = new ol.Feature({
        geometry: new ol.geom.Point(path[path.length - 1])
    });
    
feature1.setStyle(style1);
feature2.setStyle(style1);
sourceFeatures.addFeatures([feature1, feature2]);

lineString.setCoordinates(path);


//fire the animation
map.once('postcompose', function(event) {
    console.info('postcompose');
    interval = setInterval(animation, 1000);
});

var i = 0, interval;
var animation = function(){
    
    if(i == path.length){
        i = 0;
    }

  //  marker.setPosition(path[i]);
    iconFeatureCarRun.setGeometry(new ol.geom.Point(path[i]))
    i++;
};
    //regularLayer
    //satelliteLayer
    map.on('moveend', onMoveEnd)
    map.on('moveend', checknewzoom)
    function onMoveEnd(evt) {
    console.log("--------------------------------->Khoa")
    ArrayTrashCanIcon.forEach(function(el){
        var newZoomLevel = map.getView().getZoom();
        var IconNew = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                zIndex: 1,
                scale: newZoomLevel/200,
                src: item.PayLoad > 70 ? "monitor/js/red.png" : (item.PayLoad < 40 ? "monitor/js/green.png" :"monitor/js/yellow.png")
            }))
        });
        el.setStyle(IconNew)
    })
      }
    



    element = document.getElementById('popupBooking');
    popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
    });
    map.addOverlay(popup);
  //  var select_interaction = new ol.interaction.Select();
  var popup2 = new ol.Overlay.Popup;
  popup2.setOffset([0, -20]);
  map.addOverlay(popup2);
    map.on('click', function (evt) {
        var coordinatez = evt.coordinate;
        var hdms = ol.proj.transform(coordinatez, 'EPSG:3857', 'EPSG:4326');
        //console.log("khoa->"+evt);
        var f = map.forEachFeatureAtPixel(
            evt.pixel,
            function(ft, layer){return ft;}
        );
        if (f && f.get('type') == 'infor') {
            console.log(f.get('type'))
            var geometry = f.getGeometry();
            var coord = geometry.getCoordinates();
            
            var content = '<p>'+f.get('desc')+'</p>';
            
            popup2.show(coord, content);
            
        } else { popup2.hide(); }
        // if ($('#coorx1').val() == null || $('#coorx1').val() == "") {
        //     $('#coorx1').val(hdms[1]);
        //     $('#coory1').val(hdms[0]);
        // }
        // else {
        //     $('#coorx2').val(hdms[1]);
        //     $('#coory2').val(hdms[0]);
        // }
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
   // debugger
    function styleLine() {
        var zoom = map.getView().getZoom();
        var font_size = zoom * 1;

        return [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: this.get('stroke_color'),
                    width: this.get('stroke_width')
                }),
                text: new ol.style.Text({
                    font: '12px Calibri,sans-serif',
                    fill: new ol.style.Fill({ color: this.get('text_fill') }),
                    textBaseline: 'top',
                    stroke: new ol.style.Stroke({
                        color: this.get('text_stroke_color'), width: this.get('text_stroke_width')
                    }),

                    text: this.get('description')
                }),
                zIndex: this.get('zindex')
            })
        ];
    }
    var styles3 = [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#64c936',
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'rgba(100, 201, 54,1)'
            })
        }),
    ];
    var vectorSource1 = new ol.source.Vector({});
    var vectorLayer1 = new ol.layer.Vector({
        source: vectorSource1,
        style: styles3
    });
   // debugger
    //vẽ đường
    var item =
        {
            Id: 111990,
            field_title: "field_title",
            fill_color: "#ff0099",
            stroke_color: "#ff0099",
            stroke_width: "5",
            text_stroke_color: "#ff0099",
            text_stroke_width: "1",
            font_size: "12",
            zindex: 999999,
        };
    var polygon = new ol.geom.LineString([[11778814.675553437, 2390215.2484001676], [11778426.518769177, 2390253.46691431], [11778024.030042117, 2390858.9914977564]]);
    var feature = new ol.Feature(polygon);
    feature.setId(item.Id);
    feature.set('fill_color', item.fill_color);
    feature.set('stroke_color', item.stroke_color);
    feature.set('stroke_width', item.stroke_width);
    feature.set('text_stroke_color', item.text_stroke_color);
    feature.set('text_stroke_width', item.text_stroke_width);
    feature.set('font_size', item.font_size);
    feature.set('zindex', item.zindex);
    feature.set('type', "line");
    feature.setProperties({
        'rainfall': 505,
    })
    feature.setStyle(styleLine);
    vectorSource1.addFeature(feature);
    map.addLayer(vectorLayer1);
    //map.addLayer(vectorSource1);
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
        // ArrayTrashCanIcon.forEach(element => {
        //     var IconRun = new ol.style.Style({
        //         image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
        //             anchor: [0.5, 0.5],
        //             anchorXUnits: 'fraction',
        //             anchorYUnits: 'fraction',
        //             rotation: 0,
        //             zIndex: 1,
        //             scale: newZoomLevel/20,
        //             src: "monitor/js/red.png"
        //         }))
        //     });
        //     console.log("--------------------------------------kl-------->")
        //     element.setStyle(IconRun)
        // });

}
var drawMarkerExist = function (data) {

    //var book = data.bookUserSend;
    var id = parseInt(book.fromID);
    console.log(" -------------> ");
    console.log(data);
    console.log(" <---------------------------------------------------------------------------------------------------------");
    if (data != null) {
        if (carSourceVector.getFeatureById(id) != null) {
            var feature1 = carSourceVector.getFeatureById(id);
            var coord = feature1.getGeometry().getCoordinates();
            coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
            var lon = coord[0];
            var lat = coord[1];
            if (Contains(book.location[1], book.location[0], polygon)) {
                var bear = bearing(lat, lon, book.location[0], book.location[1]);
                var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                    'EPSG:3857'));

                var style = carSourceVector.getFeatureById(id).getStyle();

                carSourceVector.getFeatureById(id).setGeometry(lonlat3857);
                carSourceVector.getFeatureById(id).set("name", "Đây là tên người lái");
                var iconStyle = new ol.style.Style({
                    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                        anchor: [0.5, 0.5],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        rotation: bear,
                        src: 'lib/assets/layouts/monitor/image/car.png'
                    }))
                });
                carSourceVector.getFeatureById(id).setStyle(iconStyle);
            }
            else {
                var fea = carSourceVector.getFeatureById(id);
                carSourceVector.removeFeature(fea);
            }

        }
        else if (carSourceVector.getFeatureById(id) == null) {
            if (Contains(book.location[1], book.location[0], polygon)) {
                var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
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
                    name: "" /*+ "_" + data.location_message.channel*/,
                    population: 4000,
                    rainfall: 500,
                    style: iconStyle
                });
                iconFeature.setId(id);
                iconFeature.setStyle(iconStyle);
                carSourceVector.addFeature(iconFeature);
            }
        }
    }

}

var drawMarkerExist1 = function (data) {
    console.log('HH');
    console.log(data);
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

var drawMarkerExistRm = function (data) {

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
                if (data.type != -888 && Contains(book.location[1], book.location[0], polygon)) {
                    var bear = bearing(lat, lon, book.location[0], book.location[1]);

                    var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                        'EPSG:3857'));

                    var style = carSourceVector.getFeatureById(id).getStyle();

                    carSourceVector.getFeatureById(id).setGeometry(lonlat3857);
                    carSourceVector.getFeatureById(id).set("name", data.locationMessage.driverName);
                    carSourceVector.getFeatureById(id).set("tracktor", data.locationMessage.tracktorCode);
                    carSourceVector.getFeatureById(id).set("romooc", data.locationMessage.romoocCode);
                    carSourceVector.getFeatureById(id).set("bear", bear);
                    carSourceVector.getFeatureById(id).setStyle(styleFunction);
                    console.log("-------------------------------------------");
                }
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
                if (Contains(book.location[1], book.location[0], polygon)) {
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
                    iconFeature.set("tracktorCode", data.locationMessage.tracktorCode);
                    iconFeature.set("romoocCode", data.locationMessage.romoocCode);
                    iconFeature.set("romoocCode", data.locationMessage.romoocCode);
                    iconFeature.set("type", data.locationMessage.type);
                    iconFeature.set("isShow", false);
                    var popup = new ol.Overlay.Popup;
                    iconFeature.set("popup", popup);
                    iconFeature.setStyle(styleFunction);
                    carSourceVector.addFeature(iconFeature);
                }
            }
        }
    }
    catch (ex) {
        console.log(data);
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

                    drawMarkerExistRm(dataDriver);
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
    //changeRoom("VN.HN.TX");
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
            console.log("onReceive++++++++++++++");
            drawMarkerExist(dataDriver);
        }
    });
}
function onInput() {
    var val = document.getElementById("count1").value;
    var res = val.split(" - ");
    var arr = res[0].split(".");
    if (arr.length == 3) {
        console.log(res[0]);
        changeRoom(res[0]);
        console.log('room mới: ' + res[0]);
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
    var MapDataWebsync = {
        type: -999,
        from: "monitor",
        locationMessage: {
            driverId: robotId
        }
    }
    console.log(MapDataWebsync);
    client.publish({
        channel: '/' + currentRoom,
        data: MapDataWebsync,
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
    var MapDataWebsync = {
        type: -888,
        from: "monitor",
        locationMessage: {
            driverId: robotId
        }
    }
    client.publish({
        channel: '/' + currentRoom,
        data: MapDataWebsync,
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
    var MapDataWebsync = {
        type: -777,
        from: "monitor",
        locationMessage: {
            driverId: robotId
        }
    }
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
    var road = "";
    for (var item = 0; item < robots.length; item++) {
        if (robots[item].Username == robotCode) {
            robotId = robots[item].Id;
            road = robots[item].Road;
        }
    }

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
        Lng2: coory2,
        road: road
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
    console.log("**********************");
    console.log(points);
    console.log("111111111111111111111111");
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



var draw = function (x, y, id) {
    var lonlat3857 = new ol.geom.Point(ol.proj.transform([y, x], 'EPSG:4326',
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


function styleFunction() {

    var zoom = map.getView().getZoom();
    var font_size = 5;
    var isShow = this.get("isShow");
    var popup = this.get("popup");
    //map.removeOverlay(popup);
    if (this.get("type") == "car")
        var html = "Xe: " + this.get("name") + "";
    else
        var html = "NV: " + this.get("name") + "";
    if (this.get("type") == "car") {
        if (zoom >= 16) {
            if (zoom >= 16) {
                html += "<label " + "style='font-size:1em'" + ">" + "Biển số: 29H - 2935 </label></br>";
                html += "<label " + "style='font-size:1em'" + ">" + "Lái xe: Nguyễn Hoàng </label</br>";
                html += "<label " + "style='font-size:1em'" + ">" + "Sđt: 0979000391 </label></br>";
            }
            else if (15 <= zoom && zoom < 16) {
                html = "<b " + "style='font-size:1em'" + ">" + "Xe: " + this.get("name") + " </b>";
            }
            map.addOverlay(popup);
            popup.show(this.getGeometry().getCoordinates(), html);
        }
        else {
            map.removeOverlay(popup);
        }
    }
    else {
        if (zoom >= 16) {
            if (zoom >= 16) {
                html += "<label " + "style='font-size:1em'" + ">" + "Sđt: 0979000391 </label></br>";
            }
            else if (15 <= zoom && zoom < 16) {
                html = "<b " + "style='font-size:1em'" + ">" + "NV: " + this.get("name") + " </b>";
            }
            map.addOverlay(popup);
            popup.show(this.getGeometry().getCoordinates(), html);
        }
        else {
            map.removeOverlay(popup);
        }
    }


    //var html = "NV: : " + data.locationMessage.driverName;
    //html = html + "</br>Đầu kéo: " + data.locationMessage.tracktorCode;
    //html = html + "</br>Romooc: " + data.locationMessage.romoocCode;
    //// to show something
    //popup.show(coord1, html);

    return [

        //new ol.style.Style({
        //    anchor: [0.5, 2],
        //    fill: new ol.style.Fill({
        //        color: '#000000'
        //    }),
        //    stroke: new ol.style.Stroke({
        //        color: '#000000',
        //        width: '0'
        //    }),
        //    text: new ol.style.Text({
        //        offsetX: 0,
        //        offsetY: 30,
        //        font: font_size + 'px Calibri,sans-serif',
        //        fill: new ol.style.Fill({ color: '#000000' }),
        //        textBaseline: 'bottom',
        //        stroke: new ol.style.Stroke({
        //            color: '#000000', width: '1'
        //        }),
        //        // get the text from the feature - `this` is ol.Feature
        //        text: "NV: : " + this.get("name")
        //    }),
        //    zIndex: '999'
        //}),

        //new ol.style.Style({
        //    anchor: [0.5, 2],
        //    fill: new ol.style.Fill({
        //        color: '#000000'
        //    }),
        //    stroke: new ol.style.Stroke({
        //        color: '#000000',
        //        width: '0'
        //    }),
        //    text: new ol.style.Text({
        //        offsetX: 0,
        //        offsetY: 45,
        //        font: font_size + 'px Calibri,sans-serif',
        //        fill: new ol.style.Fill({ color: '#000000' }),
        //        textBaseline: 'bottom',
        //        stroke: new ol.style.Stroke({
        //            color: '#000000', width: '1'
        //        }),
        //        // get the text from the feature - `this` is ol.Feature
        //        text: "Đầu kéo: " + this.get("tracktorCode")
        //    }),
        //    zIndex: '999'
        //}),
        //new ol.style.Style({
        //    anchor: [0.5, 2],
        //    fill: new ol.style.Fill({
        //        color: '#000000'
        //    }),
        //    stroke: new ol.style.Stroke({
        //        color: '#000000',
        //        width: '0'
        //    }),
        //    text: new ol.style.Text({
        //        offsetX: 0,
        //        offsetY: 60,
        //        font: font_size + 'px Calibri,sans-serif',
        //        fill: new ol.style.Fill({ color: '#000000' }),
        //        textBaseline: 'bottom',
        //        stroke: new ol.style.Stroke({
        //            color: '#000000', width: '1'
        //        }),
        //        // get the text from the feature - `this` is ol.Feature
        //        text: "Romooc: " + this.get("romoocCode")
        //    }),
        //    zIndex: '999'
        //}),
        new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 0.5],
                size: [32, 32],
                opacity: 6,
                scale: 0.7,
                //rotation: this.get("bear"),
                src: this.get("type") == "car" ? 'monitor/js/xerac.png' : 'monitor/js/user.png'
            })),
        })

    ];
}