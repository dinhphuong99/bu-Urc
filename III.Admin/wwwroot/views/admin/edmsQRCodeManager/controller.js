var ctxfolder = "/views/admin/edmsQRCodeManager";
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

        $http(req).success(callback);
    };
    return {
        insert: function (data, callback) {
            submitFormUpload('/Admin/IconManager/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/IconManager/Update', data, callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/IconManager/DeleteItems/', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/IconManager/Delete/' + data).success(callback);
        },
        updateQRCode: function (data, callback) {
            $http.post('/Admin/EDMSQRCodeManager/UpdateQRCode', data).success(callback);
        },
        updatePrint: function (data, callback) {
            $http.post('/Admin/EDMSQRCodeManager/UpdatePrint', data).success(callback);
        },
        getListUser: function (callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetListUser', callback).success(callback);
        },
        //Danh sách kho
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetListWareHouse', callback).success(callback);
        },
        getWareHouseById: function (data, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetWareHouseById?id=' + data).success(callback);
        },
        getFloorById: function (data, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetFloorById?id=' + data).success(callback);
        },
        getLineById: function (data, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetLineById?id=' + data).success(callback);
        },
        getRackById: function (data, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetRackById?id=' + data).success(callback);
        },

        getFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetFloorByWareHouseCode?wareHouseCode=' + data).success(callback);
        },
        getLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetLineByFloorCode?floorCode=' + data).success(callback);
        },
        getRackByLineCode: function (data, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetRackByLineCode?lineCode=' + data).success(callback);
        },

        //Tạo mã QR_CODE
        genWareHouseCode: function (callback) {
            $http.get('/Admin/EDMSQRCodeManager/GenWareHouseCode').success(callback);
        },
        genFloorCode: function (wareHouseCode, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GenFloorCode?wareHouseCode' + wareHouseCode).success(callback);
        },
        genLineCode: function (wareHouseCode, floorCode, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GenLineCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode).success(callback);
        },
        genRackCode: function (wareHouseCode, floorCode, lineCode, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GenRackCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode + '&lineCode' + lineCode).success(callback);
        },
        genBoxCode: function (wareHouseCode, floorCode, lineCode, rackCode, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GenBoxCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode + '&lineCode' + lineCode + '&rackCode' + rackCode).success(callback);
        },
        genBookCode: function (wareHouseCode, floorCode, lineCode, rackCode, boxCode, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GenBookCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode + '&lineCode' + lineCode + '&rackCode' + rackCode + '&boxCode' + boxCode).success(callback);
        },

        //Lấy danh sách theo đối tượng
        getListObjByObjType: function (objType, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetListObjByObjType?objType=' + objType).success(callback);
        },
        createQRCode: function (data, callback) {
            $http.post('/Admin/EDMSQRCodeManager/CreateQRCode/', data).success(callback);
        },
        genQRCode: function (code, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GenQRCode?code=' + code).success(callback);
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

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSQRCodeManager/JTable",
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
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.ObjType = $scope.model.OBJ_Type;
                d.CreatedBy = $scope.model.CreatedBy;
            },
            complete: function (data) {
                $rootScope.listQRCode = data.responseJSON.data;
                dataservice.updateQRCode($rootScope.listQRCode, function (rs) {
                    $rootScope.listQRCode = rs.Object;
                });
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [6, 'desc'])
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
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OBJ_Code').withTitle('{{"EDMS_QRCODE_MANAGER_COL_OBJ_CODE"|translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('{{"EDMS_QRCODE_MANAGER_COL_QR_CODE"|translate}}').renderWith(function (data, type , full) {
        //return '<qr text=\'' + data + '\' size=50 input-mode=0 image=true></qr>';
        return '<img ng-click="viewQrCode(\'' + data + '\')" class=" image-upload h-50 w50"  role="button" src="data:image/png;base64, ' + data + '" />';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OBJ_Type').withTitle('{{"EDMS_QRCODE_MANAGER_COL_OBJ_TYPE"|translate}}').renderWith(function (data, type, full, meta) {

        switch (data) {
            case "OBJ_WAREHOUSE":
                data = "Kho";
                break;
            case "OBJ_FLOOR":
                data = "Tầng";
                break;
            case "OBJ_LINE":
                data = "Dãy";
                break;
            case "OBJ_RACK":
                data = "Kệ";
                break;
            case "OBJ_RACK_POSITION":
                data = "Vị trí kệ";
                break;
            case "OBJ_BOX":
                data = "Thùng HSCT";
                break;
            case "OBJ_BOOK":
                data = "Cuốn HSCT";
                break;
            default:
                break;
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PrintNumber').withTitle('{{"EDMS_QRCODE_MANAGER_COL_PRINT_NUMBER"|translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"EDMS_QRCODE_MANAGER_COL_GIVEN_NAME"|translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"EDMS_QRCODE_MANAGER_COL_CREATD_TIME"|translate}}').renderWith(function (data, type) {
        return data;
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $rootScope.reloadIndex = function () {
        $scope.reload();
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

    $scope.showSearchBox = function (hidden) {
        $scope.searchBoxAdvanced = true;
    }
    $scope.hideSearchBox = function (hidden) {
        $scope.searchBoxAdvanced = false;
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

    $scope.init = function () {
        dataservice.getListWareHouse(function (rs) {
            $scope.listWareHouse = rs;
        });
        dataservice.getListUser(function (rs) {
            $scope.listUser = rs;
        });
    }
    $scope.init();

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
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            var listQrCode = "";
            for (var j = 0; j < $rootScope.listQRCode.length; j++) {
                var str = $scope.subString($rootScope.listQRCode[j].OBJ_Code);
                var strLenght = $rootScope.listQRCode[j].OBJ_Code.length;
                var margin_bottom = -12;
                //if (strLenght > 26) {
                //    margin_bottom = -8;
                //}
                listQrCode = listQrCode + '<div class="col-md-2" style="text-align: center;margin-bottom:10px;"> ' +
                    '<img src="data:image/png;base64,' + $rootScope.listQRCode[j].QR_Code + '"width="125" height="125" style="margin-bottom:' + margin_bottom + 'px;" /> ' +
                    '<p style="font-family:verdana, arial, sans-serif;font-size:6px;width:100px;word-break:break-all;margin-left:15px;">' + str + '<p/>' +
                    '</div>';
            }
            var html = '<body>' + listQrCode + '</body>';
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + listQrCode + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);

        } else {
            App.toastrError("Danh sách không có mã QRCode nào !")
        }
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
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.QRCode = '';
    $scope.model = {
        OBJ_Type: '',
        OBJ_Code: ''
    }

    $scope.guideMsg = '';

    $scope.listWareHouse = [];
    $scope.listFloor = [];
    $scope.listLine = [];
    $scope.listRack = [];
    $scope.listObjCode = [];
    $scope.listQRCode = [];

    $scope.init = function () {
        dataservice.getListWareHouse(function (rs) {
            $scope.listWareHouse = rs;
        });
    }
    $scope.init();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.createQRCode($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else
                    App.toastrSuccess(rs.Title);
                $rootScope.reloadIndex();
                dataservice.genQRCode($scope.model.OBJ_Code, function (rs) {
                    $scope.QRCode = rs;
                    $rootScope.isShowQRCode = true;
                    $scope.addQRCode($scope.QRCode);
                    $scope.model.OBJ_Code = '';
                });
            });
        }
    }

    $scope.addQRCode = function (qrCode) {
        var exits = $scope.listQRCode.filter(k => k.ObjCode === $scope.model.OBJ_Code);
        if (exits.length == 0) {
            var obj = {
                STT: 0,
                QRCode: qrCode,
                ObjCode: $scope.model.OBJ_Code
            }

            $scope.listQRCode.push(obj);
        } else {
            App.toastrError(caption.EDMS_QRCODE_MANAGER_MSG_CODE_EXIST);
        }
    };

    $scope.removeQRCode = function (index) {
        $scope.listQRCode.splice(index, 1);
    }

    $scope.changeWareHouse = function (wareHouseCode) {
        dataservice.getFloorByWareHouseCode(wareHouseCode, function (rs) {
            $scope.listFloor = [];
            $scope.listFloor.push(rs);
        });
    }

    $scope.changeFloor = function (floorCode) {
        dataservice.getLineByFloorCode(floorCode, function (rs) {
            $scope.listLine = [];
            $scope.listLine.push(rs);
        });
    }

    $scope.changeLine = function (lineCode) {
        dataservice.getRackByLineCode(lineCode, function (rs) {
            $scope.listRack = rs;
        });
    }

    $scope.changeObjType = function (ObjType) {
        $scope.errorObjType = false;
        dataservice.getListObjByObjType(ObjType, function (rs) {
            $scope.listObjCode = [];
            $scope.listObjCode = rs;
            $scope.model.OBJ_Code = '';
            switch (ObjType) {
                case 'OBJ_WAREHOUSE':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc WH.Tên Kho';
                    break;
                case 'OBJ_FLOOR':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc F.Tên Tầng_Mã kho';
                    break;
                case 'OBJ_LINE':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc F.Tên Dãy_Mã tầng';
                    break;
                case 'OBJ_RACK':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc R.Tên Kệ_Mã Dãy';
                    break;
                case 'OBJ_RACK_POSITION':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc RP.Tên Vị Trí Kệ_Mã Dãy';
                    break;
                case 'OBJ_BOX':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc BX.Số thùng_BR.Mã Chi Nhánh_TYPE.Mã Loại chứng từ_USR.Mã nhân viên_Time.hhmmss';
                    break;
                case 'OBJ_BOOK':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc BX.Số thùng_BR.Mã Chi Nhánh_TYPE.Mã Loại chứng từ_USR.Mã nhân viên_Time.hhmmss';
                    break;
            }
        });
    }

    $scope.changeObjCode = function (ObjCode) {
        $scope.errorObjCode = false;
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.OBJ_Type == "") {
            $scope.errorObjType = true;
            mess.Status = true;
        } else {
            $scope.errorObjType = false;
        }

        if (data.OBJ_Code == "") {
            $scope.errorObjCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjCode = false;
        }
        return mess;
    };

    $scope.print = function () {
        var listPrint = [];
        if ($scope.listQRCode.length > 0) {
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            var listQrCode = "";
            for (var j = 0; j < $scope.listQRCode.length; j++) {
                var str = $scope.subString($scope.listQRCode[j].ObjCode);
                var strLenght = $scope.listQRCode[j].ObjCode.length;
                var margin_bottom = -10;
                if (strLenght > 26) {
                    margin_bottom = -8;
                }
                listPrint.push($scope.listQRCode[j].ObjCode);
                listQrCode = listQrCode + '<div class="col-md-2" style="text-align: center;margin-bottom:20px;"> ' +
                    '<img src="data:image/png;base64,' + $scope.listQRCode[j].QRCode + '" width="125" height="125" style="margin-bottom:' + margin_bottom + 'px;" /> ' +
                    '<span style="font-family:verdana, arial, sans-serif;font-size:6px;pading-top:0;">' + str + '<span/>' +
                    '</div >';
            }
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style>' + '<body>' + listQrCode + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);

            if (listPrint.length > 0) {
                dataservice.updatePrint(listPrint, function (rs) {

                });
            }
        } else {
            App.toastrError(caption.EDMS_QRCODE_MANAGER_MSG_QRCODE_NOT_EXIST);
        }
    }

    $scope.subString = function (str) {
        var strResult = '';
        var lenght = str.length;
        if (lenght > 26) {
            strResult = str.substr(0, 26) + "<br/>" + str.substr(26, lenght - 1);
        } else {
            strResult = str;
        }
        return strResult;
    }

    $timeout(function () {
        setModalDraggable('.modal-dialog');
    }, 100);
});

