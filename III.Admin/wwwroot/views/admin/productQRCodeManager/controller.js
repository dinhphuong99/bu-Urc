﻿var ctxfolder = "/views/admin/productQRCodeManager";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
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
        insert: function (data, callback) {
            submitFormUpload('/Admin/IconManager/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/IconManager/Update', data, callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/IconManager/DeleteItems/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/IconManager/Delete/' + data).then(callback);
        },
        updateQRCode: function (data, callback) {
            $http.post('/Admin/productQRCodeManager/UpdateQRCode', data).then(callback);
        },
        updatePrint: function (data, callback) {
            $http.post('/Admin/productQRCodeManager/UpdatePrint', data).then(callback);
        },
        getListUser: function (callback) {
            $http.get('/Admin/productQRCodeManager/GetListUser', callback).then(callback);
        },
        //Danh sách kho
        getListWareHouse: function (callback) {
            $http.get('/Admin/productQRCodeManager/GetListWareHouse', callback).then(callback);
        },
        getWareHouseById: function (data, callback) {
            $http.get('/Admin/productQRCodeManager/GetWareHouseById?id=' + data).then(callback);
        },
        getFloorById: function (data, callback) {
            $http.get('/Admin/productQRCodeManager/GetFloorById?id=' + data).then(callback);
        },
        getLineById: function (data, callback) {
            $http.get('/Admin/productQRCodeManager/GetLineById?id=' + data).then(callback);
        },
        getRackById: function (data, callback) {
            $http.get('/Admin/productQRCodeManager/GetRackById?id=' + data).then(callback);
        },

        getFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/productQRCodeManager/GetFloorByWareHouseCode?wareHouseCode=' + data).then(callback);
        },
        getLineByFloorCode: function (data, callback) {
            $http.get('/Admin/productQRCodeManager/GetLineByFloorCode?floorCode=' + data).then(callback);
        },
        getRackByLineCode: function (data, callback) {
            $http.get('/Admin/productQRCodeManager/GetRackByLineCode?lineCode=' + data).then(callback);
        },

        //Tạo mã QR_CODE
        genWareHouseCode: function (callback) {
            $http.get('/Admin/productQRCodeManager/GenWareHouseCode').then(callback);
        },
        genFloorCode: function (wareHouseCode, callback) {
            $http.get('/Admin/productQRCodeManager/GenFloorCode?wareHouseCode' + wareHouseCode).then(callback);
        },
        genLineCode: function (wareHouseCode, floorCode, callback) {
            $http.get('/Admin/productQRCodeManager/GenLineCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode).then(callback);
        },
        genRackCode: function (wareHouseCode, floorCode, lineCode, callback) {
            $http.get('/Admin/productQRCodeManager/GenRackCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode + '&lineCode' + lineCode).then(callback);
        },
        genBoxCode: function (wareHouseCode, floorCode, lineCode, rackCode, callback) {
            $http.get('/Admin/productQRCodeManager/GenBoxCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode + '&lineCode' + lineCode + '&rackCode' + rackCode).then(callback);
        },
        genBookCode: function (wareHouseCode, floorCode, lineCode, rackCode, boxCode, callback) {
            $http.get('/Admin/productQRCodeManager/GenBookCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode + '&lineCode' + lineCode + '&rackCode' + rackCode + '&boxCode' + boxCode).then(callback);
        },

        //Lấy danh sách theo đối tượng
        getListObjByObjType: function (objType, callback) {
            $http.get('/Admin/productQRCodeManager/GetListObjByObjType?objType=' + objType).then(callback);
        },
        createQRCode: function (data, callback) {
            $http.post('/Admin/productQRCodeManager/CreateQRCode/', data).then(callback);
        },
        genQRCode: function (code, callback) {
            $http.get('/Admin/productQRCodeManager/GenQRCode?code=' + code).then(callback);
        },
        getLotProduct: function (callback) {
            $http.post('/Admin/productQRCodeManager/GetLotProduct').then(callback);
        },
        getImp: function (callback) {
            $http.post('/Admin/productQRCodeManager/GetImp').then(callback);
        },
        getListQrCodeBySearch: function (data, callback) {
            $http.post('/Admin/productQRCodeManager/GetListQrCodeBySearch', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });

    $rootScope.isShowQRCode = false;

    $rootScope.listWareHouse = [];
    $rootScope.listFloor = [];
    $rootScope.listLine = [];
    $rootScope.listRack = [];

    $rootScope.wareHouseID = null;
    $rootScope.floorID = null;
    $rootScope.lineID = null;
    $rootScope.rackID = null;

    $rootScope.wareHouseCode = null;
    $rootScope.floorCode = null;
    $rootScope.lineCode = null;
    $rootScope.rackCode = null;

    $rootScope.listObjType = [
        {
            OBJ_Code: 'OBJ_WAREHOUSE',
            OBJ_Name: 'Kho'
        },
        {
            OBJ_Code: 'OBJ_FLOOR',
            OBJ_Name: 'Tầng'
        },
        {
            OBJ_Code: 'OBJ_LINE',
            OBJ_Name: 'Dãy'
        },
        {
            OBJ_Code: 'OBJ_RACK',
            OBJ_Name: 'Kệ'
        },
        {
            OBJ_Code: 'OBJ_RACK_POSITION',
            OBJ_Name: 'Vị trí Kệ'
        },
        {
            OBJ_Code: 'OBJ_BOX',
            OBJ_Name: 'Thùng HSCT'
        },
        {
            OBJ_Code: 'OBJ_BOOK',
            OBJ_Name: 'Cuốn HSCT'
        }
    ];
    $rootScope.listQRCode = [];
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/productQRCodeManager/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.searchBoxAdvanced = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.listUser = [];
    $scope.listWareHouse = [];
    $scope.listFloor = [];
    $scope.listLine = [];
    $scope.listRack = [];

    $scope.lotProducts = [];
    $scope.ticketImps = [];

    $scope.qrcodeString2 = 'YOUR TEXT TO ENCODE';
    $scope.size = 50;
    $scope.correctionLevel = '';
    $scope.typeNumber = 0;
    $scope.inputMode = '';
    $scope.image = true;

    $scope.model = {
        FromDate: '',
        ToDate: '',
        ObjType: ''
    };
    $scope.jtableData = {};

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/productQRCodeManager/JTable",
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
                $scope.jtableData = [];
                d.Product = $scope.model.Product;
                d.LotCode = $scope.model.LotProductCode;
                d.ImpCode = $scope.model.TicketImpCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function (data) {
                debugger
                $rootScope.listQRCode = data.responseJSON.data;
                //dataservice.updateQRCode($rootScope.listQRCode, function (rs) {rs=rs.data;
                //    $rootScope.listQRCode = rs.Object;
                //});
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
            console.log(data.ID);
            $scope.jtableData[data.Id] = data;
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
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"PQRCM_COL_CODE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QrCode').withTitle('{{"PQRCM_COL_QRCODE" | translate}}').renderWith(function (data, type) {
        return '<img ng-click="viewQrCode(\'' + data + '\')" class=" image-upload h-50 w50"  role="button" src="data:image/png;base64, ' + data + '" />';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"PQRCM_COL_PRODUCT_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('Count').withTitle('{{"PQRCM_COL_COUNT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"PQRCM_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"PQRCM_COL_CREATD_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        $scope.jtableData = [];
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
        console.log($scope.jtableData);
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    console.log(selectedItems);
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
    $scope.reload = function () {
        $scope.jtableData = [];
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        $scope.jtableData = [];
        reloadData(false);
    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.init = function () {
        //dataservice.getLotProduct(function (rs) {rs=rs.data;
        //    debugger
        //    $scope.lotProducts = rs;
        //});
        dataservice.getImp(function (rs) {rs=rs.data;
            $scope.ticketImps = rs;
        });
    }
    $scope.init();
    $scope.showSearchBox = function (hidden) {
        $scope.searchBoxAdvanced = true;
    }
    $scope.hideSearchBox = function (hidden) {
        $scope.searchBoxAdvanced = false;
    }
    $scope.add = function (body) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return body;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewerBase64.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.data = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    function loadDate() {
        //Yêu cầu từ ngày --> đến ngày
        $("#dateFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateTo').datepicker('setStartDate', maxDate);
        });
        $("#dateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateFrom').datepicker('setEndDate', maxDate);
        });
    }

    setTimeout(function () {
        loadDate();
    }, 50);

    $scope.print = function () {
        if ($rootScope.listQRCode.length > 0) {
            var listQrCode = "";
            for (var j = 0; j < $rootScope.listQRCode.length; j++) {
                var str = $scope.subString($rootScope.listQRCode[j].ProductName);
                var strLenght = $rootScope.listQRCode[j].ProductName.length;
                var margin_bottom = -14;
                //if (strLenght > 26) {
                //    margin_bottom = -8;
                //}
                listQrCode = listQrCode + '<div class="col-md-2" style="text-align: center;margin-bottom:10px;"> ' +
                    '<img src="data:image/png;base64,' + $rootScope.listQRCode[j].QrCode + '"width="125" height="125" style="margin-bottom:' + margin_bottom + 'px;" /> ' +
                    '<p class="textQr">' + str + '<p/>' +
                    '</div>';
            }
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                     '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(listQrCode);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.PQRCM_MSG_QR_CODE)
        }

        //$rootScope.listQRCode = [];
        //dataservice.getListQrCodeBySearch($scope.model, function (rs) {rs=rs.data;
        //    $rootScope.listQRCode = rs;
            
        //});
    }

    $scope.subString = function (str) {
        var strResult = '';
        var lenght = str.length;
        strResult = str;

        //if (lenght > 26) {
        //    strResult = str.substr(0, 26) + "" + str.substr(26, lenght - 1);
        //} else {
        //    strResult = str;
        //}
        return strResult;
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate, $timeout, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.body = '';
    $scope.body = para;
});

