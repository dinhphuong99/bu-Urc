var ctxfolderTransfer = "/views/admin/assetTransfer";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderInventory = "/views/admin/assetInventory";

var app = angular.module('App_ESEIM_TRANSFER', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'monospaced.qrcode', 'ngTagsInput']).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
    });
app.directive('customOnChangeCustomer', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCustomer);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.factory('dataserviceTransfer', function ($http) {
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
    var submitFormUpload1 = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        getreject: function (data, data1, callback) {
            $http.post('/Admin/AssetTransfer/Reject?id=' + data + '&&reason=' + data1, callback).then(callback);
        },
        getapprove: function (data, data1, callback) {
            $http.post('/Admin/AssetTransfer/Approve?id=' + data + '&&reason=' + data1, callback).then(callback);
        },
        getpending: function (data, callback) {
            $http.post('/Admin/AssetTransfer/Pending?id=' + data, callback).then(callback);
        },
        getActivityStatus: function (data, callback) {
            $http.get('/Admin/AssetTransfer/GetActivityStatus?Id=' + data).then(callback);
        },
        deleteTransfer: function (data, callback) {
            $http.post('/Admin/AssetTransfer/Delete?Id=' + data).then(callback);
        },
        deleteasset: function (data, callback) {
            $http.post('/Admin/AssetTransfer/Deleteasset?Id=' + data).then(callback);
        },
        updateTransfer: function (data, callback) {
            $http.post('/Admin/AssetTransfer/Update/', data).then(callback);
        },
        getItemTransfer: function (data, callback) {
            $http.post('/Admin/AssetTransfer/GetItem?Id=' + data).then(callback);
        },
        GetDonvichuyen: function (callback) {
            $http.post('/Admin/AssetTransfer/GetDonvichuyen').then(callback);
        },
        GetDonvinhan: function (callback) {
            $http.post('/Admin/AssetTransfer/GetDonvinhan').then(callback);
        },
        GetStatus: function (callback) {
            $http.post('/Admin/AssetTransfer/GetStatus').then(callback);
        },
        GetStatusAsset: function (callback) {
            $http.post('/Admin/AssetTransfer/GetStatusAsset').then(callback);
        },
        GetAssset: function (callback) {
            $http.post('/Admin/AssetTransfer/GetAssset').then(callback);
        },
        GetNguoichuyen: function (callback) {
            $http.post('/Admin/AssetTransfer/GetNguoichuyen').then(callback);
        },
        GetNguoinhan: function (callback) {
            $http.post('/Admin/AssetTransfer/GetNguoinhan').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/AssetTransfer/Insert', data).then(callback);
        },
        insertasset: function (data, callback) {
            $http.post('/Admin/AssetTransfer/InsertAsset', data).then(callback);
        },
        genReqfile: function (callback) {
            $http.post('/Admin/AssetRqMaintenanceRepair/GenReqfile').then(callback);
        },
        getGenReqCode: function (callback) {
            $http.post('/Admin/AssetTransfer/GenReqCode').then(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/AssetTransfer/UploadFile', data, callback);
        },
        getListFile: function (data, callback) {
            $http.post('/Admin/AssetTransfer/GetListFile?code=' + data).then(callback);
        },

        getCatObjActivity: function (callback) {
            $http.post('/Admin/AssetTransfer/GetCatObjActivity').then(callback);
        },

        getCatActivity: function (callback) {
            $http.get('/Admin/AssetTransfer/GetCatActivity').then(callback);
        },

        insertLogData: function (data, callback) {
            $http.post('/Admin/AssetTransfer/InsertLogData', data).then(callback);
        },

        insertAttrData: function (data, callback) {
            $http.post('/Admin/assetInventory/InsertAttrData', data).then(callback);
        },
        updateAttrData: function (data, callback) {
            $http.post('/Admin/assetInventory/UpdateAttrData?id=' + data).then(callback);
        },
        getItemAttrSetup: function (data, callback) {
            $http.post('/Admin/AssetAllocation/GetItemAttrSetup/', data).then(callback);
        },

        getListActivityAttrData: function (data, data1, data2, callback) {
            $http.post('/Admin/assetInventory/GetListActivityAttrData?objCode=' + data + '&&actCode=' + data1 + '&&objActCode=' + data2).then(callback);
        },

        deleteAttrData: function (data, callback) {
            $http.post('/Admin/AssetTransfer/DeleteAttrData?id=' + data).then(callback);
        },

        deleteItemActivity: function (data, callback) {
            $http.post('/Admin/AssetTransfer/DeleteItemActivity?id=' + data).then(callback);
        },
        getUser: function (data, callback) {
            $http.post('/Admin/AssetAllocation/GetUser?unit=' + data).then(callback);
        },
        checkRoleUser: function (data, callback) {
            $http.post('/Admin/AssetAllocation/CheckRoleUser?wfCode=' + data).then(callback);
        },
        getCatActivityWorkFlow: function (data, callback) {
            $http.get('/Admin/AssetAllocation/GetCatActivityWorkFlow?wfCode=' + data).then(callback);
        },
        getStausObjStream: function (data, callback) {
            $http.post('/Admin/assetInventory/GetStausObjStream', data).then(callback);
        },
        //file
        insertAssetFile: function (data, callback) {
            submitFormUpload1('/Admin/AssetTransfer/InsertAssetFile/', data, callback);
        },
        getSuggestionsAssetFile: function (data, callback) {
            $http.get('/Admin/AssetTransfer/GetSuggestionsAssetFile?assetCode=' + data).then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getAssetFile: function (data, callback) {
            $http.post('/Admin/AssetTransfer/GetAssetFile/' + data).then(callback);
        },
        updateAssetFile: function (data, callback) {
            submitFormUpload('/Admin/AssetTransfer/UpdateAssetFile/', data, callback);
        },
        deleteAssetFile: function (data, callback) {
            $http.post('/Admin/AssetTransfer/DeleteAssetFile/' + data).then(callback);
        },
        getListObjectTypeShare: function (callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectTypeShare/').then(callback);
        },
        getListFileWithObject: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileWithObject?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListObjectShare: function (objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectShare?objectCodeShared=' + objectCodeShared + '&objectTypeShared=' + objectTypeShared + '&objectCode=' + objectCode + '&objectType=' + objectType + '&fileCode=' + fileCode).then(callback);
        },
        getListObjectCode: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectCode?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        insertFileShare: function (data, callback) {
            $http.post('/Admin/FileObjectShare/InsertFileShare/', data).then(callback);
        },
        deleteObjectShare: function (data, callback) {
            $http.get('/Admin/FileObjectShare/DeleteObjectShare?id=' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_TRANSFER', function ($scope, $rootScope, $compile, $uibModal, dataserviceTransfer, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'


        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Ticket: {
                    required: true
                },
                addresstransf: {
                    required: true
                },
                addressreceived: {
                    required: true
                },
                StartTime: {
                    required: true
                },
                ReceivedTime: {
                    required: true
                }

            },
            messages: {
                Ticket: {
                    required: caption.COM_SET_TITLE_ADD10.replace("{0}", caption.ASSET_LIST_COL_TITLE),
                },
                addresstransf: {
                    required: caption.COM_SET_TITLE_ADD10.replace("{0}", caption.COM_LOCATIONTRANSF),
                },
                addressreceived: {
                    required: caption.COM_SET_TITLE_ADD10.replace("{0}", caption.COM_LOCATIONRECEIVED),
                },
                StartTime: {
                    required: "Thời gian chuyển không được bỏ trống"
                },
                ReceivedTime: {
                    required: "Thời gian nhận không được bỏ trống"
                }
            },


        }
        $rootScope.validationOptionsAsset = {
            rules: {
                Quantity: {
                    required: true,
                    regx: /^$|^[0-9,]+$/
                }
            },
            messages: {
                Quantity: {
                    required: "Số lượng không được trống",
                    regx: "Nhập số dương"
                }
            },


        }
    });
    dataserviceTransfer.GetStatus(function (result) {
        result = result.data;
        $rootScope.ListStatus = result;
    });
    dataserviceTransfer.GetAssset(function (result) {
        result = result.data;
        $rootScope.ListAsset = result;
    });
    dataserviceTransfer.getCatActivity(function (rs) {
        rs = rs.data;
        $rootScope.listCatActivity = rs;
    });
    $rootScope.IsAdd = false;

});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AssetTransfer/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderTransfer + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolderTransfer + '/google-map.html',
            controller: 'google-map'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter) {
    $scope.modelsearch = {
        FromDate: '',
        ToDate: '',
        TicketCode: '',
        DepartTransf: '',
        DepartReceived: '',
        AssetName: ''

    }
    $scope.ListDonvichuyen = [];
    $scope.initLoad = function () {
        dataserviceTransfer.GetDonvichuyen(function (result) {
            result = result.data;
            $scope.ListDonvichuyen = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.ListDonvichuyen.unshift(all)
        });
    }
    $scope.initLoad();

    $scope.ListDonvinhan = [];
    $scope.initLoad = function () {

        dataserviceTransfer.GetDonvinhan(function (result) {
            result = result.data;
            $scope.ListDonvinhan = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.ListDonvinhan.unshift(all)
        });
    }
    $scope.initLoad();

    $scope.ListStatus = [];
    $scope.initLoad = function () {

        dataserviceTransfer.GetStatus(function (result) {
            result = result.data;
            $scope.ListStatus = result;
        });
    }
    $scope.initLoad();

    $rootScope.reloadNoResetPage1 = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage2 = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage3 = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage4 = function () {
        reloadData(false);
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTransfer + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage(),
                $scope.reloadNoResetPage5();
        }, function () { });
    }
    $scope.cancel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTransfer + '/cancel.html',
            controller: 'cancel',
            backdrop: true,
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }
    $scope.edit = function (id) {
        //var userModel = {};
        //var listdata = $('#tblData').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}


        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTransfer + '/edit.html',
            controller: 'editTransfer',
            backdrop: 'static',
            size: '70',
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceTransfer.Delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $rootScope.reloadNoResetPage4();
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
            $rootScope.reloadNoResetPage4();
        }, function () {
        });
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    function loadDate() {

        $("#fromdate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $("#todate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('AssetTransfer', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter, $translate) {
    var vm = $scope;
    $scope.model = {
        StoreCode: '',
        StoreName: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetTransfer/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.DateFrom = $scope.model.DateFrom;
                d.DateTo = $scope.model.DateTo;
                d.Phone = $scope.model.Phone;
                d.Email = $scope.model.Email;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("AssetID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.AssetID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.AssetID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetID').withTitle('ID').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetName').withTitle('{{"COM_SET_CURD_TAB_ASSET" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetCode').withTitle('{{"COM_SET_CURD_ASSET_CODE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"ASSET_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusAsset').withTitle('{{"ASSET_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASSET_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ASSET_LIST_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.AssetID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage1 = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage2 = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage3 = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage4 = function () {
        reloadData(false);
    };

    $scope.edit = function (id) {
        dataserviceTransfer.getItemTransfer(id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderTransfer + '/edit.html',
                controller: 'editTransfer',
                backdrop: 'static',
                size: '70',
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
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataserviceTransfer.deleteasset(id, function (rs) {
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

    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        //$('#FromTo').datepicker('setEndDate', $rootScope.DateNow);
        //$('#DateTo').datepicker('setStartDate', $rootScope.DateBeforeSevenDay);
        //$('#FromTo').datepicker('update', $rootScope.DateBeforeSevenDay);
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {

        loadDate();
    }, 200);
});

app.controller('TicketTransfer', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter, $translate) {
    var vm = $scope;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetTransfer/JTableTicket",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

                d.Ticketcode = $scope.modelsearch.Ticketcode;
                d.Ticket = $scope.modelsearch.Ticket;
                d.DepartTransf = $scope.modelsearch.DepartTransf;
                d.DepartReceived = $scope.modelsearch.DepartReceived;
                d.FromDate = $scope.modelsearch.FromDate;
                d.ToDate = $scope.modelsearch.ToDate;
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.AssetID;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("AssetID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.AssetID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.AssetID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('AssetID').withTitle('Id').withOption('sWidth', '30px').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ticketcode').withTitle('{{"ASSET_LIST_COL_TICKETCODE" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ticket').withTitle('{{"ASSET_LIST_COL_TITLE" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DepartReceived').withTitle('{{"ASSET_LINK_ATTRUNIT" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DepartTransf').withTitle('{{"ASSET_LINK_ATTRCODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{"ASSET_TRANSFER_LIST_COL_DATE" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReceivedTime').withTitle('{{"COM_RECEIVEDTIME" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LocationTransf').withTitle('{{"COM_LOCATIONTRANSF" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReceivedLocation').withTitle('{{"COM_LOCATIONRECEIVED" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserTransf').withTitle('{{"COM_USERTRANSF" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserReceived').withTitle('{{"COM_SET_CURD_PRO_STATUS1" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ASSET_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASSET_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ASSET_LIST_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; COM_BTN_EDIT &quot; | translate}}" ng-click="edit(' + full.AssetID + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.AssetID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage1 = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage2 = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage3 = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage4 = function () {
        reloadData(true);
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTransfer + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        dataserviceTransfer.getItemTransfer(id, function (rs) {
            rs = rs.data;
            $rootScope.Ticketcode = rs.Object.Ticketcode; // de hien o ngoai  index phan edit. cua  tai san
            $rootScope.AssetCode = rs.Object.Ticketcode; // de hien o ngoai  index phan edit. cua  tai san
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderTransfer + '/edit.html',
                controller: 'editTransfer',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return id;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataserviceTransfer.deleteTransfer(id, function (rs) {
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
            $scope.reloadNoResetPage1();
        }, function () {
        });
    }

    // reload lại bảng sau khi search

    $rootScope.search = function (id) {
        reloadData(true);
    };
    function loadDate() {
        $("#fromdate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#todate').datepicker('setStartDate', maxDate);
        });
        $("#todate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#fromdate').datepicker('setEndDate', maxDate);
        });
        //$('#FromTo').datepicker('setEndDate', $rootScope.DateNow);
        //$('#DateTo').datepicker('setStartDate', $rootScope.DateBeforeSevenDay);
        //$('#FromTo').datepicker('update', $rootScope.DateBeforeSevenDay);
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
        $('.end-date').click(function () {
            $('#fromdate').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#todate').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {

        loadDate();
    }, 200);
});

app.controller('Addtable', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter, $translate) {
    var vm = $scope;
    $scope.model = {
        Ticketcode: '',
        AssetCode: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetTransfer/JTableADD",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Ticketcode = $rootScope.Ticketcode;

            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataAssetTrans");
            }
        })

        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(2)
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.AssetID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.AssetID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetID').withTitle('ID').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetName').withTitle('{{"COM_SET_CURD_TAB_ASSET" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"COM_CREATEBY" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"COM_CREATETIME" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"ASSET_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusAsset').withTitle('{{"ASSET_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{ "ASSET_LIST_COL_NOTE" | translate }}').renderWith(function (data, type) {
        return data;
    }));


    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ASSET_LIST_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.AssetID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $rootScope.reloadNoResetPage5 = function () {
        reloadData(false);
    };

    $scope.addasset = function () {
        //$scope.model.CreatedTime = convertDatetime($scope.model.CreatedTime);
        validationSelect($scope.model);
        if ($scope.addassetform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.Ticketcode = $rootScope.Ticketcode;
            dataserviceTransfer.insertasset($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reloadNoResetPage5();
                }
            });
        }
    }

    dataserviceTransfer.GetStatusAsset(function (rs) {
        rs = rs.data;
        $rootScope.listStatusAsset = rs;
    });

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataserviceTransfer.deleteasset(id, function (rs) {
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
                    $uibModalInstance.close('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
            $scope.reloadNoResetPage1();
        }, function () {
        });
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "AssetCode" && $scope.model.AssetCode != "") {
            $scope.errorAssetCode = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.AssetCode == "") {
            $scope.errorAssetCode = true;
            mess.Status = true;
        } else {
            $scope.errorAssetCode = false;
        }
        return mess;
    };

    setTimeout(function () {

    }, 200);
});

app.controller('activity', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceTransfer, $timeout, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initLoad = function () {
        $scope.listActivity = para;
    };
    $scope.initLoad();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);
});

app.controller('reasonReject', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceTransfer, $timeout, para) {
    $scope.model = {
        Reason: para,
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        $scope.reloadNoResetPage2();
        $uibModalInstance.close($scope.model);
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);
});

app.controller('file_add_old', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataserviceTransfer, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        //dataserviceTransfer.generateTicketCode(function (result) {result=result.data;
        //    $scope.model.TicketCode = result;
        //});
        dataserviceTransfer.genReqfile(function (rs) {
            rs = rs.data;
            $scope.model.FileCode = rs;
        });
    }
    $scope.initData();
    $scope.model = {
    }
    $scope.submit = function () {
        if ($scope.addformfile.validate()) {
            var file = document.getElementById("File").files[0];
            if (file == null || file == undefined) {
                App.toastrError(caption.COM_SET_TITLE_ADD5);
            } else {
                var formData = new FormData();
                formData.append("fileUpload", file);
                formData.append("FileName", $scope.model.FileName);
                formData.append("FileCode", $scope.model.FileCode);
                formData.append("Ticketcode", $rootScope.Ticketcode);
                dataserviceTransfer.insertFile(formData, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter) {
    $scope.CheckCode = '';
    $scope.model = {
        DepartTransf: '',
        DepartReceived: '',
        UserTransf: '',
        UserReceived: '',
        StartTime: '',
        ReceivedTime: '',
        Status: $rootScope.ListStatus.length > 0 ? $rootScope.ListStatus[0].Code : '',

    }

    $scope.UnitEditorData = [];
    $scope.chkAdd = function () {
        if ($scope.CheckCode == '') {
            App.toastrError(caption.MLP_CURD_MSG_SAVE_TICKET);
        }
    }

    $scope.cancel = function () {
        $rootScope.Ticketcode = null;
        $rootScope.IsAdd = false;
        $uibModalInstance.close('cancel');
    }
    $scope.submit = function () {

        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }

            if (!$rootScope.IsAdd) {
                dataserviceTransfer.insert($scope.model, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $rootScope.Ticketcode = $scope.model.Ticketcode;
                        $scope.model.ObjCode = $scope.model.Ticketcode;
                        $scope.model.AssetID = result.ID;
                        $rootScope.IsAdd = true;
                        $scope.reloadNoResetPage1();
                        $rootScope.AssetCode = $scope.model.Ticketcode;
                        $scope.CheckCode = $scope.model.Ticketcode;
                        // $uibModalInstance.close();
                    }
                });
            }
            else {
                dataserviceTransfer.updateTransfer($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        $rootScope.IsAdd = false;
                        App.toastrSuccess(rs.Title);
                        $scope.reloadNoResetPage1();
                        $uibModalInstance.close();
                        $rootScope.Ticketcode = null;

                    }
                });
            }

        }
    }
    $scope.refresh = function () {
        $scope.model.Ticket = "";
        $scope.model.DepartTransf = "";
        $scope.model.UserTransf = "";
        $scope.model.StartTime = "";
        $scope.model.LocationTransf = "";
        $scope.model.ReceivedLocation = "";
        $scope.model.DepartReceived = "";
        $scope.model.UserReceived = "";
        $scope.model.ReceivedTime = "";
        $scope.model.Note = "";
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 10);

    $scope.addFile = function () {
        if ($rootScope.IsAdd == true) {
            $rootScope.Ticketcode = $scope.model.Ticketcode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderTransfer + '/file_add.html',
                controller: 'file_add',
                backdrop: 'static',
                size: '40'
            });
            modalInstance.result.then(function (d) {
                dataserviceTransfer.getListFile($scope.model.Ticketcode, function (rs) {
                    rs = rs.data;
                    $scope.model.listFile = rs;
                });
            }, function () {
            });
        } else {
            App.toastrError("Vui lòng lưu phiếu trước khi tải tệp tin");
        }
    }

    $scope.ListDonvichuyen = [];
    $scope.ListNguoinhan = [];
    $scope.ListNguoichuyen = [];
    $scope.ListDonvinhan = [];
    $scope.initLoad = function () {
        dataserviceTransfer.getCatObjActivity(function (rs) {
            rs = rs.data;
            $scope.listCatObjActivity = rs;
            if ($scope.listCatObjActivity.length == 1) {
                $scope.model.ObjActCode = $scope.listCatObjActivity[0].Code;
            }
        })
        dataserviceTransfer.GetDonvinhan(function (result) {
            result = result.data;
            $scope.ListDonvinhan = result;
        });
        dataserviceTransfer.GetDonvichuyen(function (result) {
            result = result.data;
            $scope.ListDonvichuyen = result;
        });
        dataserviceTransfer.GetStatus(function (result) {
            result = result.data;
            $scope.ListStatus = result;
        });
        dataserviceTransfer.GetNguoichuyen(function (result) {
            result = result.data;
            $scope.ListNguoichuyen = result;
        });
        dataserviceTransfer.GetNguoinhan(function (result) {
            result = result.data;
            $scope.ListNguoinhan = result;
        });
        dataserviceTransfer.getGenReqCode(function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model.Ticketcode = rs;
            }
        });
    }
    $scope.initLoad();

    function initDateTime() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "DepartTransf" && $scope.model.DepartTransf != "") {
            dataserviceTransfer.getUser($scope.model.DepartTransf, function (rs) {
                rs = rs.data;
                $scope.model.UserTransf = '';
                $scope.ListNguoichuyen = rs;
            });
            $scope.errorDepartTransf = false;
        }
        if (SelectType == "DepartReceived" && $scope.model.DepartReceived != "") {

            dataserviceTransfer.getUser($scope.model.DepartReceived, function (rs) {
                rs = rs.data;
                $scope.model.UserReceived = '';
                $scope.ListNguoinhan = rs;
            });
            $scope.errorDepartReceived = false;
        }
        if (SelectType == "UserTransfer" && $scope.model.UserTransf != "") {
            $scope.errorUserTransf = false;
        }
        if (SelectType == "UserReceived" && $scope.model.UserReceived != "") {
            $scope.errorUserReceived = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.DepartTransf == "") {
            $scope.errorDepartTransf = true;
            mess.Status = true;
        } else {
            $scope.errorDepartTransf = false;
        }

        if (data.DepartReceived == "") {
            $scope.errorDepartReceived = true;
            mess.Status = true;
        } else {
            $scope.errorDepartReceived = false;
        }

        if (data.UserTransf == "") {
            $scope.errorUserTransf = true;
            mess.Status = true;
        } else {
            $scope.errorUserTransf = false;
        }

        if (data.UserReceived == "") {
            $scope.errorUserReceived = true;
            mess.Status = true;
        } else {
            $scope.errorUserReceived = false;
        }

        return mess;
    };
    setTimeout(function () {
        initDateTime();

        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('editTransfer', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter, para) {
    $scope.isDisabled = true;
    $scope.checkRoleWf = false;
    $scope.model = {

        Status: $rootScope.ListStatus.length > 0 ? $rootScope.ListStatus[0].Code : '',
        ObjActCode: '',
        ObjCode: '',
        AttrCode: '',
        listCatObjActivity: [],
    }
    $rootScope.AssetID = para

    $scope.initData = function () {
        dataserviceTransfer.getItemTransfer(para, function (rs) {
            rs = rs.data;
            $rootScope.Ticketcode = rs.Object.Ticketcode; // de hien o ngoai  index phan edit. cua  tai san
            $rootScope.AssetCode = rs.Object.Ticketcode; // de hien o ngoai  index phan edit. cua  tai san
            $scope.model = rs.Object;
            $scope.model.StartTime = $filter('date')(new Date($scope.model.StartTime), 'dd/MM/yyyy');
            $scope.model.ReceivedTime = $filter('date')(new Date($scope.model.ReceivedTime), 'dd/MM/yyyy');
            dataserviceTransfer.getListFile($rootScope.TicketCode, function (rs) {
                rs = rs.data;

                $scope.model.listFile = rs;
            });
            dataserviceTransfer.getCatObjActivity(function (rs) {
                rs = rs.data;
                $scope.model.listCatObjActivity = rs;
            });
            $scope.model.ObjCode = $rootScope.TicketCode;
            dataserviceTransfer.checkRoleUser($scope.model.ObjActCode, function (rs) {
                rs = rs.data;
                if (rs == true) {
                    $scope.isDisabled = false;
                    $scope.checkRoleWf = true;
                }
            })
            dataserviceTransfer.getCatActivityWorkFlow($scope.model.ObjActCode, function (rs) {
                debugger
                rs = rs.data;
                $rootScope.listCatActivity = rs;
            });
            dataserviceTransfer.getCatObjActivity(function (rs) {
                rs = rs.data;
                $scope.listCatObjActivity = rs;
                if ($scope.listCatObjActivity.length == 1) {
                    $scope.model.ObjActCode = $scope.listCatObjActivity[0].Code;
                }
            })
            dataserviceTransfer.GetDonvichuyen(function (result) {
                result = result.data;
                $scope.ListDonvichuyen = result;
            });
            dataserviceTransfer.GetNguoinhan(function (result) {
                result = result.data;
                $scope.ListNguoinhan = result;
            });
            dataserviceTransfer.GetNguoichuyen(function (result) {
                result = result.data;
                $scope.ListNguoichuyen = result;
            });
            dataserviceTransfer.GetDonvinhan(function (result) {
                result = result.data;
                $scope.ListDonvinhan = result;
            });
        });


    }
    $scope.initData();

    $scope.edit = function () {
        $scope.isDisabled = false;
    }

    $scope.pending = function () {
        dataserviceTransfer.getpending($scope.model.AssetID, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model.Status = $rootScope.ListStatus.length > 0 ? $rootScope.ListStatus[1].Code : '',
                    $scope.reloadNoResetPage();
                // $scope.loadData();
                // $rootScope.reloadReceiptProfile();
                App.toastrSuccess(rs.Title);
            }
        });
    }

    $scope.reject = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTransfer + '/reasonReject.html',
            controller: 'reasonReject',
            backdrop: 'static',
            size: '25',
            resolve: {
                para: function () {
                    return $scope.model.ReasonStatus;
                }
            }

        });
        modalInstance.result.then(function (d) {
            $scope.model.ReasonStatus = d.Reason;
            if ($scope.model.ReasonStatus == null || $scope.model.ReasonStatus == undefined)
                $scope.model.ReasonStatus = '';
            dataserviceTransfer.getreject($scope.model.AssetID, $scope.model.ReasonStatus, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.model.Status = $rootScope.ListStatus.length > 0 ? $rootScope.ListStatus[3].Code : '',
                        App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                    //$rootScope.reloadReceiptProfile();
                    //$scope.loadData();
                }
            });
        }, function () {
        });
    }

    $scope.addFile = function () {
        if ($rootScope.IsAdd == true) {
            $rootScope.Ticketcode = $scope.model.Ticketcode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderTransfer + '/file_add.html',
                controller: 'file_add',
                backdrop: 'static',
                size: '40'
            });
            modalInstance.result.then(function (d) {
                dataserviceTransfer.getListFile($scope.model.Ticketcode, function (rs) {
                    rs = rs.data;
                    $scope.model.listFile = rs;
                });
            }, function () {
            });
        } else {
            App.toastrError("Vui lòng lưu phiếu trước khi tải tệp tin");
        }
    }
    $scope.refresh = function () {
        $scope.model.Ticket = "";
        $scope.model.DepartTransf = "";
        $scope.model.UserTransf = "";
        $scope.model.StartTime = "";
        $scope.model.LocationTransf = "";
        $scope.model.ReceivedLocation = "";
        $scope.model.DepartReceived = "";
        $scope.model.UserReceived = "";
        $scope.model.ReceivedTime = "";
        $scope.model.Note = "";
    };
    $scope.statusObjAct = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderInventory + '/statusObjAct.html',
            controller: 'statusObjAct',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    var obj = { ObjActCode: $scope.model.ObjActCode, ObjCode: $scope.model.TicketCode };
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.approve = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTransfer + '/reasonReject.html',
            controller: 'reasonReject',
            backdrop: 'static',
            size: '25',
            resolve: {
                para: function () {
                    return $scope.model.ReasonStatus;
                }
            }

        });
        modalInstance.result.then(function (d) {
            $scope.model.ReasonStatus = d.Reason;
            if ($scope.model.ReasonStatus == null || $scope.model.ReasonStatus == undefined)
                $scope.model.ReasonStatus = '';
            dataserviceTransfer.getapprove($scope.model.AssetID, $scope.model.ReasonStatus, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.model.Status = $rootScope.ListStatus.length > 0 ? $rootScope.ListStatus[2].Code : '',
                        App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                    // $rootScope.reloadReceiptProfile();
                    // $scope.loadData();
                }
            });
        }, function () {
        });
    }

    $scope.viewActivityStatus = function () {
        dataserviceTransfer.getActivityStatus($scope.model.AssetID, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderTransfer + '/activity.html',
                    controller: 'activity',
                    backdrop: 'static',
                    size: '40',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {

                }, function () {
                });
            }
        })
    }

    $scope.UnitEditorData = [];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.Ticketcode = null;
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {

            dataserviceTransfer.updateTransfer($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage1();
                    $uibModalInstance.close();
                    $rootScope.Ticketcode = null;

                }
            });
        }
    }

    $scope.resultActivity = function () {
        if ($scope.model.ActCode == "" || $scope.model.ActCode == null) {
            $scope.errorActCode = true;
        } else {
            $scope.errorObjActCode = false;
            //mở form
            $rootScope.ActCode = $scope.model.ActCode;
            $rootScope.ObjActCode = $scope.model.ObjActCode;
            $rootScope.ObjCode = $scope.model.Ticketcode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderTransfer + '/resultActivity.html',
                controller: 'resultActivity',
                backdrop: 'static',
                size: '50',
            });
        }
    }

    $scope.tableActivity = function () {
        $rootScope.ActCode = $scope.model.ActCode;
        $rootScope.ObjActCode = $scope.model.ObjActCode;
        $rootScope.ObjCode = $scope.model.Ticketcode;

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTransfer + '/tableActivity.html',
            controller: 'tableActivity',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.listCatObjActivity = [];

    $scope.ListNguoinhan = [];
    $scope.ListNguoichuyen = [];
    $scope.ListDonvinhan = [];
    $scope.ListDonvichuyen = [];

    function initDateTime() {

        $("#starttime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#starttime').datepicker('setStartDate', maxDate);
        });
        $("#receivedtime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#receivedtime').datepicker('setEndDate', maxDate);
        });

        $('.end-date').click(function () {
            $('#receivedtime').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#starttime').datepicker('setStartDate', null);
        });
    }
    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "DepartTransf" && $scope.model.DepartTransf != "") {
            dataserviceTransfer.getUser($scope.model.DepartTransf, function (rs) {
                rs = rs.data;
                $scope.model.UserTransf = '';
                $scope.ListNguoichuyen = rs;
            });
            $scope.errorDepartTransf = false;
        }
        if (SelectType == "DepartReceived" && $scope.model.DepartReceived != "") {

            dataserviceTransfer.getUser($scope.model.DepartReceived, function (rs) {
                rs = rs.data;
                $scope.model.UserReceived = '';
                $scope.ListNguoinhan = rs;
            });
            $scope.errorDepartReceived = false;
        }
        if (SelectType == "UserTransfer" && $scope.model.UserTransf != "") {
            $scope.errorUserTransf = false;
        }
        if (SelectType == "UserReceived" && $scope.model.UserReceived != "") {
            $scope.errorUserReceived = false;
        }
    }
    $scope.checkRole = function () {
        if ($scope.checkRoleWf == false) {
            App.toastrError("Bạn không có quyền thực hiện thao tác");
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.DepartTransf == "") {
            $scope.errorDepartTransf = true;
            mess.Status = true;
        } else {
            $scope.errorDepartTransf = false;
        }

        if (data.DepartReceived == "") {
            $scope.errorDepartReceived = true;
            mess.Status = true;
        } else {
            $scope.errorDepartReceived = false;
        }

        if (data.UserTransf == "") {
            $scope.errorUserTransf = true;
            mess.Status = true;
        } else {
            $scope.errorUserTransf = false;
        }

        if (data.UserReceived == "") {
            $scope.errorUserReceived = true;
            mess.Status = true;
        } else {
            $scope.errorUserReceived = false;
        }
        if (data.ObjActCode == "") {
            $scope.errorObjActCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjActCode = false;
        }
        if (data.ActCode == "") {
            $scope.errorActCode = true;
            mess.Status = true;
        } else {
            $scope.errorActCode = false;
        }
        return mess;
    };
    setTimeout(function () {
        initDateTime();

        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});
app.controller('resultActivity', function ($scope, $rootScope, $uibModalInstance, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter) {
    $scope.model = {
        AttrCode: '',
        AttrDataType: '',
        AttrUnit: '',

    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };


    $scope.initLoad = function () {
        $scope.model.ActCode = $rootScope.ActCode;
        $scope.model.ObjCode = $rootScope.ObjCode;
        $scope.model.WorkFlowCode = $rootScope.ObjActCode;
        var obj = { WorkFlowCode: $scope.model.WorkFlowCode, ActCode: $scope.model.ActCode };
        dataserviceTransfer.getItemAttrSetup(obj, function (rs) {
            rs = rs.data;
            $scope.model.listAttrData = rs;
        });
        dataserviceTransfer.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
            rs = rs.data;
            $scope.model.listAttrDataSetUp = rs;
        });
    }
    $scope.initLoad();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.resultActivity.validate() && !validationSelect($scope.model).Status) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            dataserviceTransfer.insertAttrData($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    dataserviceTransfer.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
                        rs = rs.data;
                        $scope.model.listAttrDataSetUp = rs;
                    });
                }
            });
        };
    }
    $scope.updateStatus = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.ASSET_INVENTORY_MSG_YN_CHANGE_STATUS;
                $scope.ok = function () {
                    dataserviceTransfer.updateAttrData(id, function (rs) {
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
            dataserviceTransfer.getListActivityAttrData($rootScope.ObjCode, $rootScope.ActCode, $rootScope.ObjActCode, function (rs) {
                rs = rs.data;
                $scope.model.listAttrDataSetUp = [];
                $scope.model.listAttrDataSetUp = rs;
            });
        }, function () {
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.AttrCode == "") {
            $scope.errorAttrCode = true;
            mess.Status = true;
        } else {
            $scope.errorAttrCode = false;
        }
        if (data.AttrDataType == "") {
            $scope.errorAttrDataType = true;
            mess.Status = true;
        } else {
            $scope.errorAttrDataType = false;
        }
        if (data.AttrUnit == "") {
            $scope.errorAttrUnit = true;
            mess.Status = true;
        } else {
            $scope.errorAttrUnit = false;
        }

        return mess;
    };
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "AttrCode" && $scope.model.AttrCode != "") {
            debugger
            for (var i = 0; i < $scope.model.listAttrData.length; i++) {
                $scope.model.AttrUnit = $scope.model.listAttrData[i].UnitCode;
                $scope.model.AttrDataType = $scope.model.listAttrData[i].DataTypeCode;
            }
            $scope.errorAttrCode = false;
        }
    }
    $scope.delete = function (id) {
        dataserviceTransfer.deleteAttrData(id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataserviceTransfer.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listAttrDataSetUp = rs;
                });
            }
        });
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);
});
app.controller('tableActivity', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter) {
    $scope.model = {
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model.ActCode = $rootScope.ActCode;
    $scope.model.ObjActCode = $rootScope.ObjActCode;
    $scope.model.TicketCode = $rootScope.ObjCode;
    debugger
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetTransfer/JTableActivity",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TicketCode = $scope.model.TicketCode;
                d.ObjActCode = $scope.model.ObjActCode;
                d.ActCode = $scope.model.ActCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(20)
        .withOption('order', [1, 'asc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ID;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.ID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActName').withTitle('{{"Tên hành động" | translate}}').renderWith(function (data, type, full) {
        return '<span>' + data + '</span></br>' + '<span class="badge-customer badge-customer-success"> ' + full.Time + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActType').withTitle('{{"Loại hành động" | translate}}').withOption('sClass', 'w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserAct').withTitle('{{"Người tạo" | translate}}').withOption('sClass', 'w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Result').withTitle('{{"Kết quả" | translate}}').withOption('sClass', 'w350').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"Tác vụ" | translate}}').withOption('sClass', 'w20').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadTabTicket = function () {
        reloadData(true);
    }
    $scope.edit = function (id) {
        dataserviceTransfer.getItemTransfer(id, function (rs) {
            rs = rs.data;

            $rootScope.TicketCode = rs.Object.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderTransfer + '/edit.html',
                controller: 'editTransfer',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadTabTicket();
            }, function () {
            });
        });
    }
    $scope.delete = function (id) {
        var list = [];
        list.push(id);
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return list;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceTransfer.deleteItemActivity(para, function (rs) {
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
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadTabTicket();
        }, function () {
        });
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});
app.controller('statusObjAct', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ObjActCode = '';
    $scope.remainMinute = "";
    $scope.listStatusObj = [];
    $scope.initLoad = function () {
        var obj = para;
        dataserviceTransfer.getStausObjStream(obj, function (rs) {
            rs = rs.data;
            $scope.listStatusObj = [];
            var list = rs;
            for (var i = 0; i < list.length; i++) {
                if (list[i].Status == "STATUS_EDIT_ACT") {
                    list[i].LimitTimePre = $scope.timeRemaining(list[i].Time, list[i].UnitTime);
                }
                if (list[i].UnitTime == "ACTIVITY_GR_PR_WEEK" || list[i].UnitTime == "ACTIVITY_GR_PR_MOUNTH") {
                    list[i].Unit = "Ngày";
                }
                $scope.listStatusObj.push(list[i]);
            }
        });
    }
    //$scope.initLoad();
    $scope.timeRemaining = function (date, type) {
        var dateNow = new Date();
        var date22 = new Date(date);

        var dateNow_s = dateNow.getTime();
        var date22_s = date22.getTime();
        var offset = date22_s - dateNow_s;
        if (offset > 0) {
            if (type == "ACTIVITY_GR_PR_MINUTE") {
                var totalMinutes = Math.round(offset / 1000 / 60);
                return totalMinutes;
            }
            if (type == "ACTIVITY_GR_PR_HOUR") {
                var totalMinutes = Math.round(offset / 1000 / 60 / 60);
                return totalMinutes;
            }
            if (type == "ACTIVITY_GR_PR_DAY") {
                var totalMinutes = Math.round(offset / 1000 / 60 / 60 / 24);
                return totalMinutes;
            }
            if (type == "ACTIVITY_GR_PR_WEEK") {
                var totalMinutes = Math.round(offset / 1000 / 60 / 60 / 24);
                return totalMinutes;
            }
            if (type == "ACTIVITY_GR_PR_MOUNTH") {
                var totalMinutes = Math.round(offset / 1000 / 60 / 60 / 24);
                return totalMinutes;
            }
            return 0;
        } else {
            return 0;
        }
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
        $scope.initLoad();
    }, 300);
});

app.controller('fileAsset', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetTransfer/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AssetCode = $rootScope.AssetCode;
                //d.FromDate = $scope.model.FromDate;
                //d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataAssetTransFile");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(2)
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{ "CUS_CURD_TAB_FILE_LIST_COL_TITLE" | translate }}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;';
        }
        return icon + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"CUS_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{ "CUS_CURD_TAB_FILE_LIST_COL_NOTE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "CUS_CURD_TAB_FILE_LIST_COL_CREATETIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('Loại tệp').renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap text-center').withTitle('{{"Sửa tệp" | translate }}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        var typefile = "#";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewExcel(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewWord(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewPDF(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'width_90').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<button title="Sửa" ng-click="edit(\'' + full.FileName + '\',' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }
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
    $rootScope.reloadFile = function () {
        $scope.reload();
    }
    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/file_search.html',
            windowClass: 'modal-file',
            backdrop: 'static',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.add = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("AssetCode", $rootScope.AssetCode);
            data.append("IsMore", false);
            dataserviceTransfer.insertAssetFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.edit = function (fileName, id) {
        dataserviceTransfer.getAssetFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderTransfer + '/file_edit.html',
                    controller: 'fileEditAsset',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    reloadData()
                }, function () { });
            }
        })
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceTransfer.deleteAssetFile(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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
            $scope.reload();
        }, function () {
        });
    }
    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'fileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataservice.getByteFile(id, function (rs) {rs=rs.data;
        //    
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/views/admin/edmsRepository/imageViewer.html',
        //        controller: 'contractTabFileImageViewer',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return myBase64;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //    }, function () {
        //    });
        //});
    }
    $scope.dowload = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        dataserviceTransfer.getSuggestionsAssetFile($rootScope.AssetCode, function (rs) {
            rs = rs.data;
            var data = rs != '' ? rs : {};
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderTransfer + '/file_add.html',
                controller: 'fileAddAsset',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData()
            }, function () { });
        })
    }
    $scope.loadFile = function (event) {
        debugger
        $scope.file = event.target.files[0];
    }
    //Editor online
    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceTransfer.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return null;
                }
            });
        }
    };
    $scope.viewExcel = function (id, mode) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceTransfer.getItemFile(id, true, mode, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    if (rs.ID === -1) {
                        App.toastrError(rs.Title);
                        setTimeout(function () {
                            window.open('/Admin/Excel#', '_blank');
                        }, 2000);
                    } else {
                        App.toastrError(rs.Title);
                    }
                    return null;
                } else {
                    window.open('/Admin/Excel#', '_blank');
                }
            });
        }
    };
    $scope.viewWord = function (id, mode) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceTransfer.getItemFile(id, true, mode, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    if (rs.ID === -1) {
                        App.toastrError(rs.Title);
                        setTimeout(function () {
                            window.open('/Admin/Docman#', '_blank');
                        }, 2000);
                    } else {
                        App.toastrError(rs.Title);
                    }
                    return null;
                } else {
                    window.open('/Admin/Docman#', '_blank');
                }
            });
        }
    };
    $scope.viewPDF = function (id, mode) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceTransfer.getItemFile(id, true, mode, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    if (rs.ID === -1) {
                        App.toastrError(rs.Title);
                        setTimeout(function () {
                            window.open('/Admin/PDF#', '_blank');
                        }, 2000);
                    } else {
                        App.toastrError(rs.Title);
                    }
                    return null;
                } else {
                    window.open('/Admin/PDF#', '_blank');
                }
            });
        }
    };
    $scope.view = function (id) {
        debugger
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataAssetTransFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceTransfer.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        window.open(rs.Object, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    } else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
        else {
            dataserviceTransfer.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        debugger
                        var url = window.location.origin + '/' + rs.Object;
                        window.open(url, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    }
                    else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
    }
    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTransfer + '/viewer.html',
            controller: 'viewer',
            backdrop: 'false',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
    }

    $scope.tabFileHistory = function (fileId) {
        if (fileId === 0) {
            App.toastrError(caption.COM_MSG_FILE_NOT_HISTORY);
            return null;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTransfer + '/tabFileHistory.html',
            controller: 'tabFileHistory',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return fileId;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () { });
    };
    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('viewer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, para, $sce) {
    debugger
    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
    console.log($scope.currentProjectUrl);
    console.log(data);
});
app.controller('fileAddAsset', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceTransfer, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.CatCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (data.FolderId == '' || data.FolderId == null) {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (full.FolderId == '' || full.FolderId == null) {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            } else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }

            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('Thư mục lưu trữ').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
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
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var itemSelect = [];
            for (var id in $scope.selected) {
                if ($scope.selected.hasOwnProperty(id)) {
                    if ($scope.selected[id]) {
                        itemSelect.push(id);
                    }
                }
            }
            if (itemSelect.length == 0) {
                App.toastrError(caption.CUS_ERROR_CHOOSE_FILE);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.CUS_ERROR_CHOOSE_ONE_FILE);
                return;
            }
            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("AssetCode", $rootScope.AssetCode);
            data.append("IsMore", true);
            dataserviceTransfer.insertAssetFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    };

    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceTransfer.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: "Tất cả danh mục",//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('fileEditAsset', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceTransfer, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.CateRepoSettingCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: '',
        FileName: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (para.Path != null && para.Path != "") {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (para.Path != null && para.Path != "") {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{ "CUS_TITLE_FOLDER" | translate }}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        if (selectAll)
            $('#tblDataDetailRepository').DataTable().$('tr:not(.selected)').addClass('selected');
        else
            $('#tblDataDetailRepository').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.init = function () {
        $scope.model.FileName = para.FileName;
        $scope.model.NumberDocument = para.NumberDocument;
        $scope.model.Tags = (para.Tags != '' && para.Tags != null) ? para.Tags.split(',') : [];
        $scope.model.Desc = para.Desc;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        var itemSelect = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    itemSelect.push(id);
                }
            }
        }
        if (itemSelect.length == 0) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_FILE);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_ONE_FILE);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("AssetCode", $rootScope.AssetCode);
                dataserviceTransfer.updateAssetFile(data, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    };
    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceTransfer.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: "Tất cả danh mục",//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                    console.log($scope.treeDataCategory);
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //setModalMaxHeight('.modal-file');
    }, 200);
});
app.controller('fileShareAsset', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceTransfer) {
    $scope.model = {
        ObjectCodeShared: $rootScope.AssetCode,
        ObjectTypeShared: 'ASSET',
        ObjectType: '',
        ObjectCode: '',
        FileCode: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataserviceTransfer.getListObjectTypeShare(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceTransfer.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {
            rs = rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceTransfer.getListObjectCode($rootScope.AssetCode, ObjType, function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, ObjType, $scope.model.FileCode);
    }
    $scope.changeObjCode = function (objectCode) {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, objectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.selectFile = function (fileCode) {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, fileCode);
    }
    $scope.reloadListObjectShare = function () {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.removeObjectShare = function (id) {
        dataserviceTransfer.deleteObjectShare(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
            }
        });
    }
    $scope.share = function () {
        if (!$scope.validate()) {
            dataserviceTransfer.insertFileShare($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
                }
            });
        }
    }
    $scope.validate = function () {
        var error = false;
        if (($scope.model.ObjectType == "" || $scope.model.ObjectType == undefined)) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_OBJECT)
            error = true;
            return error;
        }
        if (($scope.model.ObjectCode == "" || $scope.model.ObjectCode == undefined)) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_OBJECT_CODE)
            error = true;
            return error;
        }
        if (($scope.model.FileCode == "" || $scope.model.FileCode == undefined)) {
            App.toastrError(caption.CUS_ERROR_SELECT_FILE)
            error = true;
            return error;
        }
    }
    function reloadListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode) {
        dataserviceTransfer.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {
            rs = rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('tabFileHistory', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTransfer, $filter, para) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    };
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetTransfer/JTableFileHistory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FileId = para;
                d.AssetCode = $rootScope.AssetCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractFileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', 'w75').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_NAME" | translate}}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;';
        }

        if (full.IsFileMaster == "False") {
            data = '<span class="text-warning">' + data + '<span>';
        } else {
            data = '<span class="text-primary">' + data + '<span>';
        }

        return icon + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_DESCRIPTION" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EditedFileTime').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_EDITED_TIME" | translate}}').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'HH:mm dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EditedFileBy').withTitle('{{"CONTRACT_CURD_TAB_FILE_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"CONTRACT_CURD_TAB_FILE_COL_ACTION" | translate}}').withOption('sClass', 'w75 nowrap text-center').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        var typefile = "#";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
        }

        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(' + full.Id + ')" target="_blank" href=' + typefile + ' title="{{&quot; Xem &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-eye pt5"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')"  style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }
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
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderTransfer + '/contractTabFileSearch.html',
            windowClass: 'modal-file',
            backdrop: 'static',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.add = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("RequestCode", $rootScope.RequestCode);
            data.append("IsMore", false);
            dataserviceTransfer.insertContractFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.edit = function (fileName, id) {
        dataserviceTransfer.getContractFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderTransfer + '/tabFileEdit.html',
                    controller: 'tabFileEdit',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '55',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    reloadData()
                }, function () { });
            }
        })
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceTransfer.deleteAssetFile(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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
            $scope.reload();
        }, function () {
        });
    }
    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'tabFileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataserviceTransfer.getByteFile(id, function (rs) {rs=rs.data;
        //    
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/views/admin/edmsRepository/imageViewer.html',
        //        controller: 'contractTabFileImageViewer',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return myBase64;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //    }, function () {
        //    });
        //});
    }
    $scope.dowload = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        dataserviceTransfer.getSuggestionsContractFile($rootScope.RequestCode, function (rs) {
            rs = rs.data;
            var data = rs != '' ? rs : {};
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderTransfer + '/tabFileAdd.html',
                controller: 'tabFileAdd',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '55',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData()
            }, function () { });
        })
    }
    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }
    $scope.getObjectFile = function (id) {
        dataserviceTransfer.getItemFile(id);
    };

    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('viewer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, para, $sce) {
    debugger
    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
    console.log($scope.currentProjectUrl);
    console.log(data);
});