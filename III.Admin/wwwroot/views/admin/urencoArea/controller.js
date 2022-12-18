var ctxfolder = "/views/admin/urencoArea";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'monospaced.qrcode']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUploadFile = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        getItem: function (data, callback) {
            $http.get('/Admin/UrencoArea/Getitem?id=' + data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/UrencoArea/Insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/UrencoArea/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/UrencoArea/Delete/' + data).then(callback);
        },
        getListRoute: function (callback) {
            $http.post('/Admin/UrencoArea/GetListRoute').then(callback);
        },
        getListTeam: function (callback) {
            $http.post('/Admin/UrencoArea/GetListTeam').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUploadFile('/Admin/RubbishBin/UploadImage/', data, callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $rootScope.validationOptions = {
            rules: {
                AreaCode: {
                    required: true,
                },
                AreaName: {
                    required: true,
                },
            },
            messages: {
                AreaCode: {
                    //required: "Mã vùng yêu cầu bắt buộc!",
                    required: caption.UA_VALIDATE_AREA_CODE
                },
                AreaName: {
                    //required: "Tên vùng yêu cầu bắt buộc",
                    required: caption.UA_VALIDATE_AREA_NAME
                },
            }
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/UrencoArea/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        }).when('/function/', {
            templateUrl: ctxfolder + '/function.html',
            controller: 'function'
        });

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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, dataservice) {
    var vm = $scope;
    $scope.model = {
        AreaCode: '',
        AreaName: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UrencoArea/jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AreaCode = $scope.model.AreaCode;
                d.AreaName = $scope.model.AreaName;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected, $event)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AreaCode').withTitle('{{"UA_LIST_COL_AREA_CODE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AreaName').withTitle('{{"UA_LIST_COL_AREA_NAME" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GisData').withTitle('{{"UA_LIST_COL_GIS_DATA" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"UA_LIST_COL_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"UA_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"UA_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"UA_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems, evt) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    }
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: 'static',
                size: '50',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
            }, function () {
            });
        })
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        AreaCode: '',
        AreaName: '',
        GisData: '',
        Picture: '',
        ListTeam: [],
        Description: '',
        ListRoute: []
    }
    $scope.init = function () {
        dataservice.getListRoute(function (rs) {
            rs = rs.data;
            $scope.listRoute = rs;
        })
        dataservice.getListTeam(function (rs) {
            rs = rs.data;
            $scope.listTeam = rs;
        })
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.COM_MSG_MAXIMUM_FILE_SIZE);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataservice.uploadImage(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Picture = '/uploads/images/' + rs.Object;
                                            dataservice.insert($scope.model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                }
                                                else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                            })
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                dataservice.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                })
            }
        }
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/googleMap.html',
            controller: 'googleMap',
            backdrop: 'static',
            size: '90',
            resolve: {
                para: function () {
                    return $scope.model.GisData;
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d) {
                $scope.model.GisData = d;
            }
        }, function () { });
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.addRoute = function (item) {
        var checkExist = $scope.model.ListRoute.find(function (element) {
            if (element.Code == item.Code) return true;
        });
        if (!checkExist) {
            $scope.model.ListRoute.push(item);
        }
    }
    $scope.removeRoute = function (index) {
        $scope.model.ListRoute.splice(index, 1);
    }
    $timeout(function () {
        setModalDraggable('.modal-dialog');
    }, 100);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para, $timeout) {
    var id = -1;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        $scope.model = para;
        dataservice.getListRoute(function (rs) {
            rs = rs.data;
            $scope.listRoute = rs;
        })
        dataservice.getListTeam(function (rs) {
            rs = rs.data;
            $scope.listTeam = rs;
        })
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.COM_MSG_MAXIMUM_FILE_SIZE);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataservice.uploadImage(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Picture = '/uploads/images/' + rs.Object;
                                            dataservice.update($scope.model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                }
                                                else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                            })
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                dataservice.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                })
            }
        }
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/googleMap.html',
            controller: 'googleMap',
            backdrop: 'static',
            size: '90',
            resolve: {
                para: function () {
                    return $scope.model.GisData;
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d) {
                $scope.model.GpsNode = d;
            }
        }, function () { });
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.addRoute = function (item) {
        var checkExist = $scope.model.ListRoute.find(function (element) {
            if (element.Code == item.Code) return true;
        });
        if (!checkExist) {
            var obj = {
                Id: id--,
                Code: item.Code,
                Name: item.Name
            }
            $scope.model.ListRoute.push(obj);
        }
    }
    $scope.removeRoute = function (index, id) {
        debugger
        if (id > 0) {
            $scope.model.ListDeleteRoute.push(id);
        }
        $scope.model.ListRoute.splice(index, 1);
    }

    $timeout(function () {
        setModalDraggable('.modal-dialog');
    }, 100);
});
app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, para) {
    $scope.listParkingTemp = [];
    $scope.lisPicture = [
        {
            'name': 'pinmap_red',
            'url': '/images/map/pinmap_red.png'
        },
        {
            'name': 'pinmap_start',
            'url': '/images/map/pinmap_start.png'
        }, {
            'name': 'pinmap_orange',
            'url': '/images/map/pinmap_orange.png'
        }, {
            'name': 'pinmap_violet',
            'url': '/images/map/pinmap_violet.png'
        }
    ];

    var map;
    var fields_vector_source;
    //var isDraw = false;
    //var isOpen = false;
    var color = '#FF0000';
    var size = 12;
    var draw;
    //var vectorIcon2 = new ol.source.Vector({});
    //var vectorIcon3 = new ol.source.Vector({});
    //var ibs = 10;
    //var path = [];
    //var isBatch = true;
    //var objnew = {};
    var parkingTemplayer = new ol.source.Vector({});
    var count = 0;
    //$scope.person = {};
    var drawSV = new ol.source.Vector({ wrapX: false });
    var drawLV = new ol.layer.Vector({
        source: drawSV
    });
    var typeSelect = 'Polygon';
    var addPacking = document.getElementById('add_packing');
    var bounds = new google.maps.LatLngBounds();
    var element = document.getElementById('popup');
    var pos = ol.proj.fromLonLat([106.68479919433594, 10.897367896986843]);
    var popup = new ol.Overlay({
        element: element,
        position: pos,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, 50]

    });
    var config = {
        init: function () {
            config.loadMap();
            config.hideMenuRight();
            config.loadData();
            config.mapClick();
            config.pointMap();
            //config.searchMap();
            config.resetDrag();
            config.toogleClick();
            config.save();
            config.drag();
            //config.tabClick();
            //config.addParkingTemp();
            //config.deletedParkingTemp();
            config.setHeightMap();
            config.menuLeftClick();
            config.cancelModal();
            //config.searchSupplier();
            //config.searchCustomer();
            //config.searchStore();
        },
        //load map
        loadMap: function () {


            fields_vector_source = new ol.source.Vector({});

            vectorSource1 = new ol.source.Vector({});

            map = new ol.Map({
                target: $('#map')[0],
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM(
                            {
                                url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                                attributions: [
                                    new ol.Attribution({ html: '© Google' }),
                                    new ol.Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
                                ]
                            })
                    }),
                    new ol.layer.Vector({
                        source: fields_vector_source
                    })
                    //test
                    ,
                    new ol.layer.Vector({
                        source: vectorSource1
                    }),
                    new ol.layer.Vector({
                        source: parkingTemplayer
                    })

                ],
                view: new ol.View({
                    center: ol.proj.transform([105.805069, 20.991153], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 15
                }),
                controls: ol.control.defaults({
                    attribution: false,
                    zoom: false,
                })
            });
            map.addLayer(drawLV);
            map.addOverlay(popup);

        },
        //style drag
        styleDrag: function () {
            debugger
            var zoom = map.getView().getZoom();
            var font_size = zoom * 1;
            var coordinates = this.getGeometry().getInteriorPoint().getCoordinates();
            var k = new ol.geom.Point(coordinates);
            var image = config.loadImage(this.get('Icon'));
            return [
                new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: this.get('fill_color')
                    }),
                    stroke: new ol.style.Stroke({
                        color: "#7ebdda",
                        width: this.get('stroke_width')
                    }),
                    text: new ol.style.Text({
                        font: font_size + 'px Calibri,sans-serif',
                        fill: new ol.style.Fill({ color: "#7ebdda" }),
                        textBaseline: 'top',
                        stroke: new ol.style.Stroke({
                            color: '#33a6da', width: '1'
                        }),
                        text: map.getView().getZoom() > 12 ? this.get('description') : ''
                    }),
                    zIndex: 1000
                }),
                new ol.style.Style({
                    image: new ol.style.Icon(({
                        anchor: [0.7, 1],
                        opacity: 6,
                        scale: 30 / image.height,
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        src: image.src
                    })),
                    geometry: k
                })
            ];
        },
        //load data in map
        loadData: function () {
            var styles3 = [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#64c936',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 0, 255, 0.1)'
                    }),
                    image: new ol.style.Icon(({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: 'https://openlayers.org/en/v4.3.2/examples/data/icon.png'
                    }))
                }),
            ];
            vectorSource1 = new ol.source.Vector({});
            var vectorIcon = new ol.source.Vector({});

            centervier = [];
            vnfields = [];
            var iconFeatures = [];
            config.loadDataGarbage();
            var vectorLayer1 = new ol.layer.Vector({
                source: vectorSource1,
                style: styles3
            });

            vectorLayer2 = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            vectorLayer3 = new ol.layer.Vector({
                source: parkingTemplayer,
                style: styles3
            });

            map.addLayer(vectorLayer1);
            map.addLayer(vectorLayer2);
            map.addLayer(vectorLayer3);
        },
        //map click
        mapClick: function () {
            map.on('click', function (evt) {
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature) {
                        return feature;
                    });
                if (feature) {
                    var coordinates = feature.getGeometry().getCoordinates();
                    popup.setPosition(coordinates);
                    var data = feature.get('title');
                    if (data != null && data != "") {
                        //map.getView().fit(feature.getGeometry(), map.getSize());
                        //map.getView().setZoom(13);

                        var object = {
                            title: feature.get('title'),
                            icon: feature.get('Icon'),
                            Code: feature.get('Code'),
                            Name: feature.get('Name'),
                            AreaTxt: feature.get('AreaTxt'),
                            GroupTxt: feature.get('GroupTxt'),
                            RoleTxt: feature.get('RoleTxt'),
                            TypeTxt: feature.get('TypeTxt'),
                            Image: feature.get('Image')
                        }
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detail.html',
                            controller: 'detail',
                            backdrop: true,
                            size: '30',
                            resolve: {
                                para: function () {
                                    return object;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                        }, function () { });
                    }
                }
            });
        },
        //point to map
        pointMap: function () {
            map.on('pointermove', function (e) {
                if (e.dragging) {
                    $(element).popover('destroy');
                    return;
                }
                var pixel = map.getEventPixel(e.originalEvent);
                var hit = map.hasFeatureAtPixel(pixel);
                map.getTarget().style.cursor = hit ? 'pointer' : '';
            });
        },
        //search map
        searchMap: function () {
            $('#TimKiem').click(function () {
                var place = autocomplete.getPlace();

                var a = bounds.extend(place.geometry.location);
                var lat = place.geometry.location.lat();
                var lng = place.geometry.location.lng();
                var point = new ol.geom.Point(ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'));
                map.setView(new ol.View({
                    center: ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 11
                }));
                map.getView().setZoom(15);
            })
        },
        //drag
        drag: function () {
            $('#draw').click(function () {
                map.removeInteraction(draw);
                config.addInteraction();
            })
        },
        //reset drag
        resetDrag: function () {
            $('#refresh').click(function () {
                var features = drawLV.getSource().getFeatures();
                if (features != null && features.length > 0) {

                    drawLV.getSource().removeFeature(features[features.length - 1]);

                }
                map.addOverlay(popup);
                map.removeInteraction(draw);
                typeSelect.value = 'None';
                config.addInteraction();
            })
        },
        //remove drag
        cancelDrag: function () {
            var features = drawLV.getSource().getFeatures();
            if (features != null && features.length > 0) {

                for (x in features) {
                    drawLV.getSource().removeFeature(features[x]);
                }
            }

            map.addOverlay(popup);

            map.removeInteraction(draw);
            typeSelect.value = 'None';
            config.addInteraction();
        },
        //cancel modal
        cancelModal: function () {
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            }
        },
        //add interaction
        addInteraction: function () {
            draw = new ol.interaction.Draw({
                source: drawSV,
                type: typeSelect
            });
            map.addInteraction(draw);
        },
        //toggleTab click
        toogleClick: function () {
            $('.mini-submenu').on('click', function () {
                if ($('.tab-content').hasClass("hidden")) {
                    $(".tab-content").removeClass("hidden");
                } else {
                    $(".tab-content").addClass("hidden");
                }
            });
        },
        //hide menu
        hideMenuRight: function () {
            $(".tab-content").addClass("hidden");
        },
        loadDataGarbage: function () {
            if (para != '' && para != null && para != undefined) {
                vectorSource1.clear();
                var parse = JSON.parse(para);
                var fill_color = parse.properties.fill_color;
                var font_size = parse.properties.font_size;
                var polygon1 = new ol.geom.Polygon(parse.gis_data);
                var feature = new ol.Feature(polygon1);
                feature.getGeometry();
                ////
                var center = feature.getProperties();
                var bounds = center.geometry.getExtent();
                feature.set('point', parse.gis_data[0][0]);
                if (fill_color.includes('rgba')) {
                    feature.set('fill_color', fill_color);
                    feature.set('stroke_color', fill_color);
                }
                else {
                    feature.set('fill_color', hexToRgbA(fill_color, 0.2));
                    feature.set('stroke_color', hexToRgbA(fill_color, 1));
                }

                feature.set('stroke_width', "0.2");
                feature.set('text_fill', "#000000");
                feature.set('text_stroke_color', "#000000");
                feature.set('text_stroke_width', "0");
                feature.set('font_size', 12);
                feature.set('zindex', "30");
                feature.setStyle(config.styleDrag);
                vectorSource1.addFeature(feature);
                map.getView().fit(feature.getGeometry(), map.getSize());
                map.getView().setZoom(16);
            }
        },
        //click save
        save: function () {
            $('#save').click(function () {
                debugger
                var features2 = drawLV.getSource().getFeatures();
                var newForm = new ol.format.GeoJSON();
                var featColl = newForm.writeFeaturesObject(features2);

                var dataObj = new Object();
                if (featColl.features.length != 0) {
                    if (featColl.features.length == 1) {
                        var polygon1 = new ol.geom.Polygon(featColl.features[0].geometry.coordinates);
                        var feature = new ol.Feature(polygon1);
                        feature.getGeometry();
                        var center = feature.getProperties();
                        var bounds = center.geometry.getExtent();
                        dataObj.gis_data = featColl.features[0].geometry.coordinates;
                        dataObj.properties = {};
                        dataObj.properties.fill_color = color;
                        dataObj.properties.font_size = size;
                        $uibModalInstance.close(JSON.stringify(dataObj));
                    } else {
                        App.toastrError(caption.UA_MSG_PLS_DRAW_POINT);
                    }
                } else {
                    App.toastrError(caption.UA_MSG_PLS_DRAW_POINT);
                }
            })
        },

        //set height map
        setHeightMap: function () {
            var maxHeightMap = $(window).height() - $("#map").position().top - 150;
            $("#map").css({
                'height': maxHeightMap,
                'max-height': maxHeightMap,
                'overflow': 'auto',
            });
            config.mapReSize();
        },
        //set map resize
        mapReSize: function () {
            setTimeout(function () {
                map.updateSize();
            }, 600);
        },
        menuLeftClick: function () {
            $(".menu-toggle").click(function (e) {
                config.mapReSize();
            });
        },
        loadImage: function (src) {
            var image = new Image();
            image.src = src;
            return image;
        }
    }
    function hexToRgbA(hex, opacity) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
        }
        throw new Error('Bad Hex');
    }
    function hexToRgb(hex, a) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            r = parseInt(result[1], 16);
            g = parseInt(result[2], 16);
            b = parseInt(result[3], 16);
            var mess = 'rgba(' + r + ', ' + g + ', ' + b + ',' + a + ')';
            return mess
        }

    }
    setInterval(function () {
        var crzoom = map.getView().getZoom();
        if (crzoom < 11
        ) {
            map.addLayer(vectorLayer2);
        }
    }, 1000);
    setTimeout(function () {
        config.init();
    }, 200);
});