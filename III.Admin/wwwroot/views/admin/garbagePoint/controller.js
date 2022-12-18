var ctxfolder = "/views/admin/garbagePoint";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'monospaced.qrcode']);
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
            $http.post('/Admin/GarbagePoint/GetItem/' + data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/GarbagePoint/Insert/', data).then(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/GarbagePoint/InsertCommonSetting/',data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/GarbagePoint/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/GarbagePoint/Delete/' + data).then(callback);
        },
        getListRoute: function (callback) {
            $http.post('/Admin/GarbagePoint/GetListRoute/').then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/GarbagePoint/GetListUnit/').then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/GarbagePoint/GetListStatus/').then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.post('/MobileLogin/GetAddress?latitude=' + lat + '&longitude=' + lon).then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUploadFile('/Admin/RubbishBin/UploadImage/', data, callback);
        },
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        getEmployee: function (callback) {
            $http.post('/Admin/Route/GetEmployee').then(callback);
        },
        getRoute: function (data, callback) {
            $http.get('/Admin/GarbagePoint/GetRoute?RouteCode=' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.validationOptions = {
            rules: {
                NodeCode: {
                    required: true,

                },
                NodeName: {
                    required: true
                },
                Address: {
                    required: true
                },
                VolumeLimit: {
                    required: true
                },
                Volume: {
                    required: true
                }
            },
            messages: {
                NodeCode: {
                    //required: "Mã điểm không được để trống",
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.GBP_VALIDATE_CODE_LOCATION)

                },
                NodeName: {
                    //required: "Tên điểm không được để trống",
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.GBP_VALIDATE_NAME_LOCATION)
                },
                Address: {
                    //required: "Địa chỉ không được để trống",
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.GBP_VALIDATE_ADDRESS)
                },
                VolumeLimit: {
                    //required: "Sức chứa không được để trống",
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.GBP_VALIDATE_EDIT)
                },
                Volume: {
                    //required: "Lượng rác hiện tại không được để trống",
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.GBP_VALIDATE_CURRENT_AMOUNT_GARBAGE)
                }
            }
        }

    });
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    $rootScope.zoomMapDefault = 16;

});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/GarbagePoint/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter, $window) {
    var vm = $scope;
    $scope.model = {
        NodeCode: '',
        NodeName: '',
        Note: '',
        Address: '',

    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/GarbagePoint/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.NodeCode = $scope.model.NodeCode;
                d.NodeName = $scope.model.NodeName;
                d.Address = $scope.model.Address;
                d.VolumeLimit = $scope.model.VolumeLimit;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('nodeCode').withOption('sClass', 'dataTable-15per').withTitle('{{"GBP_LIST_COL_CODE_LOCATION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('nodeName').withOption('sClass', 'dataTable-10per').withTitle('{{"GBP_LIST_COL_NAME_LOCATION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('route').withOption('sClass').withTitle('{{"GBP_LIST_COL_NAME_ROUTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('marager').withOption('sClass', 'dataTable-10per').withTitle('{{"GBP_LIST_COL_MANAGER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('address').withOption('sClass', 'dataTable-10per').withTitle('{{"GBP_LIST_COL_ADDRESS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('gps').withOption('sClass', 'textView').withTitle('{{"GBP_LIST_LOC_GPS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('volumeLimit').withOption('sClass', 'dataTable-10per').withTitle('{{"GBP_LIST_COL_VOLUME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withOption('sClass', 'dataTable-10per').withTitle('{{"GBP_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-10per').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<button title="Edit" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Delete" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function toggleOne(selectedItems) {
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.PFW_CURD_CONFRIM_DELETE;
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {rs=rs.data;
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
    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });
    }


});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.model = {
        NodeCode: '',
        NodeName: '',
        Note: '',
        Address: '',
        VolumeLimit: '',
        QrCode: '',
        GpsNode: '',
        managers: ''
    };
    $scope.managers = [];
    $scope.openMap = function () {
        debugger
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/googleMap.html',
            controller: 'googleMap',
            backdrop: 'static',
            size: '90',
            resolve: {
                para: function () {
                    return $scope.model;
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d) {
                $scope.model.GpsNode = d;
            }
        }, function () { });
    }
    $scope.changeQrCode = function () {
        $scope.model.QrCode = $scope.model.NodeCode + "/" + $scope.model.NodeName + "/" + $scope.model.Address + "/" + $scope.model.VolumeLimit;
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
    $scope.initData = function () {

        dataservice.getListRoute(function (rs) {rs=rs.data;
            $scope.listRoute = rs;
        });
        dataservice.getListUnit(function (rs) {rs=rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListStatus(function (rs) {rs=rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getEmployee(function (rs) {rs=rs.data;
            $scope.managers = rs;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        console.log($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insert($scope.model, function (rs) {rs=rs.data;
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
    $scope.addCommonSettingUrencoUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: true,
            resolve: {
                para: function () {
                    return {
                        Group: 'URENCO_UNIT',
                        GroupNote: 'Đơn vị',
                        AssetCode: 'URENCO'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getListUnit(function (rs) {rs=rs.data;
                $scope.listUnit = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingUrencoStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: true,
            resolve: {
                para: function () {
                    return {
                        Group: 'URENCO_STATUS_NODE',
                        GroupNote: 'Trạng thái',
                        AssetCode: 'URENCO'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getListStatus(function (rs) {rs=rs.data;
                $scope.listStatus = rs;
            });
        }, function () { });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Route == "" || data.Route == null) {
            $scope.errorRoute = true;
            mess.Status = true;
        } else {
            $scope.errorRoute = false;

        }
        if (data.Manager == "" || data.Manager == null) {
            $scope.errorManager = true;
            mess.Status = true;
        } else {
            $scope.errorManager = false;

        }
        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;

        }
        return mess;
    }
    function showHideSearch() {
        debugger
        $('#btnGPS').onkeyup(function () {
            if ($scope.model.Route == '') {
                $('.enableOnInput').prop('disabled', true);
            } else {
                $('.enableOnInput').prop('disabled', false);
            }
        });
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.managers = [];
    $scope.openMap = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/googleMap.html',
            controller: 'googleMap',
            backdrop: true,
            size: '80',
            resolve: {
                para: function () {
                    return $scope.model;
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
    $scope.addCommonSettingUrencoUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: true,
            resolve: {
                para: function () {
                    return {
                        Group: 'URENCO_UNIT',
                        GroupNote: 'Đơn vị',
                        AssetCode: 'URENCO'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getListUnit(function (rs) {rs=rs.data;
                $scope.listUnit = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingUrencoStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: true,
            resolve: {
                para: function () {
                    return {
                        Group: 'URENCO_STATUS_NODE',
                        GroupNote: 'Trạng thái',
                        AssetCode: 'URENCO'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getListStatus(function (rs) {rs=rs.data;
                $scope.listStatus = rs;
            });
        }, function () { });
    }
    $scope.changeQrCode = function () {
        $scope.model.QrCode = $scope.model.NodeCode + "/" + $scope.model.NodeName + "/" + $scope.model.Address + "/" + $scope.model.VolumeLimit;
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {

        dataservice.getItem(para, function (rs) {rs=rs.data;
            debugger
            $scope.model = rs;
        });
        dataservice.getListRoute(function (rs) {rs=rs.data;
            $scope.listRoute = rs;
        });
        dataservice.getListUnit(function (rs) {rs=rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListStatus(function (rs) {rs=rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getEmployee(function (rs) {rs=rs.data;
            $scope.managers = rs;
        });
    }
    $scope.initData();
    $scope.submit = function () {

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
                                dataservice.uploadImage(data, function (rs) {rs=rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        $scope.model.Image = '/uploads/images/' + rs.Object;
                                        dataservice.update($scope.model, function (rs) {rs=rs.data;
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
            dataservice.update($scope.model, function (rs) {rs=rs.data;
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
});
app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, para) {
    $scope.listParkingTemp = [];
    debugger
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
    var draw;
    /** Code Phòng thêm **/
    //layer chứa polygon park
    var parkSources = new ol.source.Vector({
        features: [
        ]
    });
    var parkSourceVector = new ol.layer.Vector({
        source: parkSources,
        updateWhileAnimating: true
    });
    //layer chứa route đc chọn
    var routeSources = new ol.source.Vector({
        features: [
        ]
    });

    //mảng chứa layer Marker
    var routeMarkerSources = new ol.source.Vector({
        features: [
        ]
    });
    var routeMarkerLayer = new ol.layer.Vector({
        source: routeMarkerSources,
    });

    var routeLayer = new ol.layer.Vector({
        source: routeSources,
        updateWhileAnimating: true
    });
    var element = document.getElementById('popup');
    var circleCoords = [];
    var centerPoint;
    var eventCircleDraw;
    var typeDraw;
    //code hide future 
    encodeStyle = function (styles) {
        let ret = "";

        const styleparse_types = { "all": "0", "administrative": "1", "administrative.country": "17", "administrative.land_parcel": "21", "administrative.locality": "19", "administrative.neighborhood": "20", "administrative.province": "18", "landscape": "5", "landscape.man_made": "81", "landscape.natural": "82", "poi": "2", "poi.attraction": "37", "poi.business": "33", "poi.government": "34", "poi.medical": "36", "poi.park": "40", "poi.place_of_worship": "38", "poi.school": "35", "poi.sports_complex": "39", "road": "3", "road.arterial": "50", "road.highway": "49", "road.local": "51", "transit": "4", "transit.line": "65", "transit.station": "66", "water": "6" };

        const styleparse_elements = { "all": "a", "geometry": "g", "geometry.fill": "g.f", "geometry.stroke": "g.s", "labels": "l", "labels.icon": "l.i", "labels.text": "l.t", "labels.text.fill": "l.t.f", "labels.text.stroke": "l.t.s" };

        const styleparse_stylers = { "color": "p.c", "gamma": "p.g", "hue": "p.h", "invert_lightness": "p.il", "lightness": "p.l", "saturation": "p.s", "visibility": "p.v", "weight": "p.w" };

        styles.forEach((style) => {
            if (style.featureType) ret += "s.t:" + styleparse_types[style.featureType] + "|";

            // if !styleparse_elements[style.elementType], the style element is unknown
            if (style.elementType) ret += "s.e:" + styleparse_elements[style.elementType] + "|";

            style.stylers.forEach((styler) => {
                let keys = [];
                for (var k in styler) {
                    if (k === "color" && styler[k].length === 7) styler[k] = "#ff" + styler[k].slice(1);
                    ret += styleparse_stylers[k] + ":" + styler[k] + "|";
                }
            });

            ret = ret.slice(0, ret.length - 1);
            ret += ","
        });

        return encodeURIComponent(ret.slice(0, ret.length - 1));
    };
    //layer hide fure 
    styles = [
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        }
    ];
    const apistyles = encodeStyle(styles);
    var googleLayer = new ol.source.XYZ({
        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=' + apistyles,
    })

    var config = {
        init: function () {
            config.loadMap();
            config.hideMenuRight();
            //config.mapClick();
            config.pointMap();
            config.resetDrag();
            config.toogleClick();
            config.save();
            config.drawPoint();
            config.setHeightMap();
            config.menuLeftClick();
            config.cancelModal();
            config.mapReSize();
            config.loadDataRoute();
            config.loadDataGarbage();
            config.circlePolygon();
        },
        //load map
        loadMap: function () {
            const iconFeature = new ol.Feature({
                geometry: new ol.geom.Point([0, 0])
            });

            const iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [6, 0],
                    src: "https://dieuhanh.vatco.vn/uploads/tempFile/File_temp_0f531255.jpg",
                    scale: 0.1
                })
            });
            iconFeature.setStyle(iconStyle);
            const vectorSource = new ol.source.Vector({
                features: [iconFeature]
            });

            const vectorLayer = new ol.layer.Vector({
                source: vectorSource
            });
            map = new ol.Map({
                target: $('#map')[0],
                layers: [
                    new ol.layer.Tile({
                        source: googleLayer
                    }),
                    parkSourceVector,
                    routeLayer,
                    vectorLayer
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
        ////map click
        //mapClick: function () {
        //    map.on('click', function (evt) {
        //        var feature = map.forEachFeatureAtPixel(evt.pixel,
        //            function (feature) {
        //                return feature;
        //            });
        //        if (feature) {
        //            var coordinates = feature.getGeometry().getCoordinates();
        //            popup.setPosition(coordinates);
        //            var data = feature.get('title');
        //            if (data != null && data != "") {
        //                //map.getView().fit(aaaa.getGeometry(), map.getSize());
        //                //map.getView().setZoom(16);

        //                var object = {
        //                    title: feature.get('title'),
        //                    icon: feature.get('Icon'),
        //                    Code: feature.get('Code'),
        //                    Name: feature.get('Name'),
        //                    AreaTxt: feature.get('AreaTxt'),
        //                    GroupTxt: feature.get('GroupTxt'),
        //                    RoleTxt: feature.get('RoleTxt'),
        //                    TypeTxt: feature.get('TypeTxt'),
        //                    Image: feature.get('Image')
        //                }
        //                var modalInstance = $uibModal.open({
        //                    animation: true,
        //                    templateUrl: ctxfolder + '/detail.html',
        //                    controller: 'detail',
        //                    backdrop: true,
        //                    size: '30',
        //                    resolve: {
        //                        para: function () {
        //                            return object;
        //                        }
        //                    }
        //                });
        //                modalInstance.result.then(function (d) {
        //                }, function () { });
        //            }
        //        }
        //    });
        //},
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
        //vẽ điểm trên polyline
        drawPoint: function () {
            $('#drawPoint').click(function () {
                debugger
                //xóa polygon cũ
                var features = parkSourceVector.getSource().getFeatures();
                if (features != null && features.length > 0) {

                    parkSourceVector.getSource().removeFeature(features[features.length - 1]);

                }
                ol.Observable.unByKey(eventCircleDraw); 
                typeDraw = "Polygon";
                draw = new ol.interaction.Draw({
                    source: parkSources,
                    type: typeDraw
                });               
                map.addInteraction(draw);
            });
        },

        /** Vẽ điểm rác hình tròn */
        circlePolygon: function () {
            $('#draw').click(function () {
                debugger
                typeDraw = "None";
                map.removeInteraction(draw);
                eventCircleDraw = map.on('click', function (evt) {
                    //xóa polygon cũ
                    var features = parkSourceVector.getSource().getFeatures();
                    if (features != null && features.length > 0) {

                        parkSourceVector.getSource().removeFeature(features[features.length - 1]);

                    }
                    map.removeInteraction(parkSourceVector);
                    //typeSelect.value = 'None';

                    // vẽ marker
                    var styleFunction = new ol.style.Style({
                        image: new ol.style.Icon(({
                            anchor: [0.06, 0.7],
                            size: [32, 32],
                            opacity: 6,
                            scale: 0.7,
                            src: 'https://docs.maptiler.com/openlayers/default-marker/marker-icon.png',
                            //src: '/images/map/xeracX.png'
                            //src: '/images/map/car.png'
                        })),
                        text: new ol.style.Text({
                            //text: result[i].NodeName,
                            fill: new ol.style.Fill({
                                color: '#8B0000'
                            }),
                            stroke: new ol.style.Stroke({
                                color: [141, 238, 238, 0.8],
                                width: 10
                            }),
                            font: 'bold 11px "Helvetica Neue", Arial',
                            backgroundFill: new ol.style.Fill({
                                color: 'black',
                            }),
                            textAlign: "bottom",
                            offsetY: -24,
                            offsetX: -4
                        })
                    })
                    var lonlat3857 = new ol.geom.Point(evt.coordinate);
                    var iconFeature = new ol.Feature({
                        geometry: lonlat3857,
                        style: styleFunction
                    });
                    routeMarkerSources.addFeature(iconFeature);

                    //let x = evt.coordinate[0];
                    //let y = evt.coordinate[1];
                    //var marker = new ol.layer.Vector({
                    //    source: new ol.source.Vector({
                    //        features: [
                    //            new ol.Feature({
                    //                geometry: new ol.geom.Point(ol.proj.fromLonLat([x, y])),
                    //            })
                    //        ],
                    //    }),

                    //    style: new ol.style.Style({
                    //        image: new ol.style.Icon({
                    //            anchor: [0.5, 1],
                    //            crossOrigin: 'anonymous',
                    //            src: 'https://docs.maptiler.com/openlayers/default-marker/marker-icon.png',
                    //        })
                    //    })
                    //});

                    //map.addLayer(marker);

                    //var marker = new ol.source.Vector({
                    //    features: [
                    //        new ol.Feature({
                    //            geometry: new ol.geom.Point(ol.proj.fromLonLat([x, y])),
                    //        })
                    //    ],
                    //});

                    //// vẽ marker
                    //var styleFunction = new ol.style.Style({
                    //    image: new ol.style.Icon(({
                    //        anchor: [0.06, 0.7],
                    //        size: [32, 32],
                    //        opacity: 6,
                    //        scale: 0.7,
                    //        src: 'https://docs.maptiler.com/openlayers/default-marker/marker-icon.png',
                    //        //src: '/images/map/xeracX.png'
                    //        //src: '/images/map/car.png'
                    //    })),
                    //    text: new ol.style.Text({
                    //        //text: result[i].NodeName,
                    //        fill: new ol.style.Fill({
                    //            color: '#8B0000'
                    //        }),
                    //        stroke: new ol.style.Stroke({
                    //            color: [141, 238, 238, 0.8],
                    //            width: 10
                    //        }),
                    //        font: 'bold 11px "Helvetica Neue", Arial',
                    //        backgroundFill: new ol.style.Fill({
                    //            color: 'black',
                    //        }),
                    //        textAlign: "bottom",
                    //        offsetY: -24,
                    //        offsetX: -4
                    //    })
                    //})
                    //var lonlat3857 = new ol.geom.Point(evt.coordinate);
                    //var iconFeature = new ol.Feature({
                    //    geometry: lonlat3857,
                    //    style: styleFunction
                    //});
                    //routeMarkerSources.addFeature(iconFeature)

                    // Thêm mới
                    //circleCoords = createCirclePointCoords(evt.coordinate[0], evt.coordinate[1], 10, 360)
                    //centerPoint = evt.coordinate;
                    //var parkPolygon = new ol.geom.Polygon([circleCoords]);
                    //var styleLine = new ol.style.Style({
                    //    stroke: new ol.style.Stroke({
                    //        width: 0.1, color: '#0000FF'
                    //    }),
                        
                    //    fill: new ol.style.Fill({
                    //        color: '#00FFFF'
                    //    }),
                    //    zIndex: 2
                    //})
                    //var aaaa = new ol.Feature({
                    //    geometry: parkPolygon
                    //});
                    //aaaa.setStyle(styleLine);
                    //aaaa.set("centerPoin", evt.coordinate);
                    //parkSources.addFeature(aaaa);

                    //var place = autocomplete.getPlace();

                    //var a = bounds.extend(place.geometry.location);
                    //var lat = place.geometry.location.lat();
                    //var lng = place.geometry.location.lng();
                    //var point = new ol.geom.Point(ol.proj.transform(
                    //    [lng, lat],
                    //    'EPSG:4326', 'EPSG:3857'));

                    //parkSources.addFeature(point);
                });
            });
        },
        //reset drag
        resetDrag: function () {
            $('#refresh').click(function () {
                var features = parkSourceVector.getSource().getFeatures();
                if (features != null && features.length > 0) {
                    parkSourceVector.getSource().removeFeature(features[features.length - 1]);
                }
                map.addOverlay(popup);
                map.removeInteraction(parkSourceVector);
                typeSelect.value = 'None';
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
            //config.circlePolygon();
        },
        //cancel modal
        cancelModal: function () {
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            }
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
            if (para.GpsNode != '') {
                var param = JSON.parse(para.GpsNode)
                var parkPolygon = new ol.geom.Polygon(param.gis_data);
                var styleLine = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width: 0.1, color: '#0000FF'
                    }),
                    fill: new ol.style.Fill({
                        color: '#00FFFF'
                    }),
                    zIndex: 2
                })
                var aaaa = new ol.Feature({
                    geometry: parkPolygon
                });
                aaaa.setStyle(styleLine);
                parkSources.addFeature(aaaa);
                map.getView().fit(aaaa.getGeometry(), map.getSize());
                map.getView().setZoom(16);
            }
        },
        //click save
        save: function () {
            $('#save').click(function () {
                debugger
                var data = {};
                var features2 = parkSourceVector.getSource().getFeatures();
                var newForm = new ol.format.GeoJSON();
                var featColl = newForm.writeFeaturesObject(features2);
                if (featColl.features.length == 0) {
                    App.toastrError("Vui lòng vẽ vị trí !");
                }
                else {
                    //data = {
                    //    gis_data: featColl.features[0].geometry.coordinates,
                    //    centerPoint: centerPoint,
                    //    properties: {
                    //        fill_color: "#FF0000",
                    //        font_size: 12
                    //    }
                    //};
                    //var a = JSON.stringify(data);
                    //$uibModalInstance.close(a);
                    if (featColl.features.length == 1) {

                        data = {
                            gis_data: featColl.features[0].geometry.coordinates,
                            centerPoint: centerPoint,
                            properties: {
                                fill_color: "#FF0000",
                                font_size: 12
                            }
                        };
                        var a = JSON.stringify(data);
                        $uibModalInstance.close(a);
                    }
                    else {
                        App.toastrError("Chỉ được phép vẽ 1 vị trí !");
                    }
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
        },
        loadDataRoute: function () {
            debugger
            dataservice.getRoute(para.Route, function (result) {result=result.data;
                debugger
                console.log(result);
                var array = [];
                var data = JSON.parse(result.RouteDataGps);
                for (var j = 0; j < data.gis_data.length; j++) {
                    var a = ol.proj.transform([data.gis_data[j].lng, data.gis_data[j].lat], 'EPSG:4326', 'EPSG:3857');
                    array.push(a)
                }
                var lineString = new ol.geom.LineString([]);
                lineString.setCoordinates(array);
                var styleLine = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width: 2, color: '#8A2BE2'
                    }),
                    text: new ol.style.Text({
                        text: result.RouteName,
                        fill: new ol.style.Fill({
                            color: '#8B0000'
                        }),
                        stroke: new ol.style.Stroke({
                            color: [141, 238, 238, 0.8],
                            width: 10
                        }),
                        font: 'bold 11px "Helvetica Neue", Arial',
                        backgroundFill: new ol.style.Fill({
                            color: 'black',
                        }),
                        textAlign: "bottom",
                        offsetY: -18,
                        offsetX: -38
                    }),
                    zIndex: 2
                })
                var aaaa = new ol.Feature({
                    geometry: lineString,
                    name: result.RouteName
                });
                aaaa.setStyle(styleLine);
                aaaa.setId(result.Id);
                aaaa.set("idRoute", result.Id);
                aaaa.set("nameRoute", result.RouteName);
                routeSources.addFeature(aaaa);

                if (para.GpsNode == "" || para.GpsNode == null) {
                    map.getView().fit(aaaa.getGeometry(), map.getSize());
                    map.getView().setZoom(14);
                }
            });
        },
    }
    //hàm lấy ra các điểm xung quanh 1 center
    function createCirclePointCoords(circleCenterX, circleCenterY, circleRadius, pointsToFind) {

        var angleToAdd = 360 / pointsToFind;
        var coords = [];
        var angle = 0;
        for (var i = 0; i < pointsToFind; i++) {
            angle = angle + angleToAdd;
            console.log(angle);
            var coordX = circleCenterX + circleRadius * Math.cos(angle * Math.PI / 180);
            var coordY = circleCenterY + circleRadius * Math.sin(angle * Math.PI / 180);
            coords.push([coordX, coordY]);
        }

        return coords;
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
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
});
app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',
        AssetCode: para.AssetCode,
        Group: para.Group,
        GroupNote: para.GroupNote,
        Type:''
    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CommonSetting/JTableDetail/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SettingGroup = para.Group;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.CodeSet = data.CodeSet;
                    $scope.model.ValueSet = data.ValueSet;
                    $scope.model.Type = data.Type;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"GBP_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"GBP_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"GBP_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"GBP_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"GBP_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"GBP_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function toggleOne(selectedItems) {
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataservice.getDataType(function (rs) {rs=rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.COM_SET_CURD_MSG_SETTING_NOT_BLANK);
        } else {
            $scope.model.CodeSet = $scope.model.ValueSet;
            dataservice.insertCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.CodeSet == '') {
            App.toastrError(caption.COM_SET_CURD_MSG_DATA_NOT_BLANK)
        } else {
            dataservice.updateCommonSetting($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.deleteCommonSetting(id, function (rs) {rs=rs.data;
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
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
