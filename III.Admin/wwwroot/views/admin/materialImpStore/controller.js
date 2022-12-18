var ctxfolder = "/views/admin/materialImpStore";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor', 'monospaced.qrcode'])
    .directive('customOnChange', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.on('change', onChangeHandler);
                element.on('$destroy', function () {
                    element.off();
                });

            }
        };
    });
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
    return {
        getUnit: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetUnit?impCode=' + data).then(callback);
        },
        getStore: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetStore').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetUser').then(callback);
        },
        getSupplier: function (callback) {
            $http.post('/Admin/MaterialImpStore/Getsupplier').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/GetItem', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/Insert', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".modal-content",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".modal-content");
                }
            }).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/Update', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".modal-content",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".modal-content");
                }
            }).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/Delete', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".message-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".message-body");
                }
            }).then(callback);
        },

        getListLotProduct: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListLotProduct').then(callback);
        },
        getListLotProduct4Update: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/GetListLotProduct4Update?lotProductCode=' + data).then(callback);
        },
        getListStore: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListStore').then(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListCustomer').then(callback);
        },
        getListUserImport: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListUserImport').then(callback);
        },
        getListReason: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListReason').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListCurrency').then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListProduct').then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListUnit').then(callback);
        },
        getListPaymentStatus: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListPaymentStatus').then(callback);
        },
        getLotProduct: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/GetLotProduct?lotProductCode=' + data).then(callback);
        },
        ////lấy giá của 1 sản phẩm
        //getSalePrice: function (data, callback) {
        //    $http.post('/Admin/MaterialImpStore/GetSalePrice?qrCode=' + data).then(callback);
        //},
        //tạo mã QR_Code
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/GeneratorQRCode?code=' + data).then(callback);
        },

        getListLine: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetListLine?storeCode=' + data, callback).then(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetListRackByLineCode?lineCode=' + data, callback).then(callback);
        },
        getListProductInStore: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetListProductInStore?rackCode=' + data, callback).then(callback);
        },
        getQuantityEmptyInRack: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetQuantityEmptyInRack?rackCode=' + data, callback).then(callback);
        },
        orderingProductInStore: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/OrderingProductInStore', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
        deleteProductInStore: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/DeleteProductInStore?id=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
        checkProductInStore: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/CheckProductInStore?productQrCode=' + data, callback).then(callback);
        },
        checkProductInStoreCoil: function (productQrCode, coilCode, callback) {
            $http.get('/Admin/MaterialImpStore/CheckProductInStoreCoil?productQrCode=' + productQrCode + '&&coilCode=' + coilCode, callback).then(callback);
        },
        checkProductCoilOrderingStore: function (productQrCode, callback) {
            $http.get('/Admin/MaterialImpStore/CheckProductCoilOrderingStore?productQrCode=' + productQrCode, callback).then(callback);
        },
        checkQuantityMaxProductInStore: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/CheckQuantityMaxProductInStore?productQrCode=' + data, callback).then(callback);
        },
        getPositionProduct: function (productQrCode, productCoil, callback) {
            $http.get('/Admin/MaterialImpStore/GetPositionProduct?productQrCode=' + productQrCode + '&&productCoil=' + productCoil, callback).then(callback);
        },
        getProductNotInStore: function (productQrCode, productCoil, callback) {
            $http.get('/Admin/MaterialImpStore/GetProductNotInStore?productQrCode=' + productQrCode + '&&productCoil=' + productCoil, callback).then(callback);
        },
        checkProductInExpTicket: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/CheckProductInExpTicket?productQrCode=' + data, callback).then(callback);
        },
        getUpdateLog: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/GetUpdateLog?ticketCode=' + data).then(callback);
        },

        getListProductRelative: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListProductRelative').then(callback);
        },

        //Tạo mã ticket code
        createTicketCode: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/CreateTicketCode?type=' + data).then(callback);
        },
        countCoil: function (callback) {
            $http.post('/Admin/MaterialImpStore/CountCoil').then(callback);
        },
        setCoilInStore: function (id, data, callback) {
            $http.get('/Admin/MaterialImpStore/SetCoilInStore?id=' + id + "&&rackCode=" + data).then(callback);
        },
        setCoilInStore: function (id, data, callback) {
            $http.get('/Admin/MaterialImpStore/GetPositionInfo?rackCode=' + data).then(callback);
        },

        getListCoilByProdQrCode: function (ticketCode, productQrCode, callback) {
            $http.get('/Admin/MaterialImpStore/GetListCoilByProdQrCode?ticketCode=' + ticketCode + '&&productQrCode=' + productQrCode).then(callback);
        },

    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    debugger
    $rootScope.permissionMaterialImpStore = PERMISSION_MaterialImpStore;
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.TicketCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.MIS_MSG_CODE), "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                ImpCode: {
                    required: true,
                    maxlength: 100
                },
                CreatedTime: {
                    required: true,
                },
                Note: {
                    maxlength: 1000
                },
                Title: {
                    required: true,
                },
            },
            messages: {
                ImpCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MIS_CURD_LBL_MIS_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MIS_CURD_LBL_MIS_CODE).replace("{1}", "100")
                },
                CreatedTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MIS_CURD_LBL_MIS_CREATE),
                },
                Note: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MIS_CURD_LBL_MIS_NOTE).replace("{1}", "1000"),
                },
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MIS_LIST_COL_TITLE_IMPORT),
                },
            }
        }
    });

    $rootScope.ImpCode = '';
    $rootScope.showListFloor = true;
    $rootScope.showListLine = true;
    $rootScope.showListRack = true;

    $rootScope.listWareHouse = [];
    $rootScope.listFloor = [];
    $rootScope.listLine = [];
    $rootScope.listRack = [];

    $rootScope.wareHouseID = null;
    $rootScope.floorID = null;
    $rootScope.lineID = null;
    $rootScope.rackID = null;

    $rootScope.wareHouseCode = 0;
    $rootScope.floorCode = 0;
    $rootScope.lineCode = 0;
    $rootScope.rackCode = 0;

    $rootScope.positionBox = 'Chưa có vị trí';
    $rootScope.cntBox = null;
    $rootScope.chooseBoxObj = {};

    $rootScope.storeCode = '';

});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/MaterialImpStore/Translation');
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
    $httpProvider.interceptors.push('interceptors');
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window) {
    var vm = $scope;
    $scope.model = {
        Title: '',
        CusCode: '',
        StoreCode: '',
        UserImport: '',
        FromDate: '',
        ToDate: '',
        TimeTicketCreate: '',
        ReasonName: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: $rootScope.permissionMaterialImpStore.LIST,
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
                d.Title = $scope.model.Title;
                d.CusCode = $scope.model.CusCode;
                d.StoreCode = $scope.model.StoreCode;
                d.UserImport = $scope.model.UserImport;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.ReasonName = $scope.model.ReasonName;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            if ($rootScope.permissionMaterialImpStore.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var Id = data.Id;
                        $scope.edit(Id);
                    }
                });
            }
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QrTicketCode').withTitle('{{"MIS_LIST_COL_MIS_CODE_QR" | translate}}').renderWith(function (data, type, full, meta) {
        return '<qrcode role="button" ng-click="viewQrCode(\'' + full.TicketCode + '\')" data=' + full.TicketCode + ' size="35"></qrcode>'
        //return '<img ng-click="viewQrCode(\'' + full.TicketCode + '\')"  src="../../../images/default/ic_qrcode.png" role="button" class="h-50 w50">';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCode').withTitle('{{"MES_LIST_COL_ESTORE_CODE" | translate}}').renderWith(function (data, type, full, meta) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"MIS_LIST_COL_MIS_TITLE" | translate }}').renderWith(function (data) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"MIST_COL_CUSTOMER" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{"MIS_LIST_COL_MIS_NAME_WAREHOUSE" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserImportName').withTitle('{{"MIS_LIST_COL_MIS_STAFT_ENTER" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReasonName').withTitle('{{"MIS_LIST_COL_MIS_REASON" | translate }}').renderWith(function (data) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CostTotal').withTitle('{{"MES_LIST_COL_ESTORE_TOTAL_MONEY" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CurrencyName').withTitle('{{"MIT_COL_CURRENCY" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Discount').withTitle('{{"MIS_LIST_COL_DISCOUNT" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Commission').withTitle('{{"Hoa hồng" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TaxTotal').withTitle('{{"Thuế" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalMustPayment').withTitle('{{"Tổng phải trả" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPayed').withTitle('{{"Tổng đã trả" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('NextTimePayment').withTitle('{{"Ngày trả tiếp" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeTicketCreate').withTitle('{{"MIS_LIST_COL_MIS_DATE_TO_MIS" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"MIS_LIST_COL_MIS_NOTE" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MIS_LIST_COL_MIS_ACTION" | translate }}').renderWith(function (data, type, full) {
        var listButton = '';
        if ($rootScope.permissionMaterialImpStore.Update) {
            listButton += '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
        }
        if ($rootScope.permissionMaterialImpStore.Delete) {
            listButton += '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }
        return listButton;
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

    $scope.initLoad = function () {
        dataservice.getListStore(function (rs) {
            rs = rs.data;
            $scope.listStore = rs;
        });
        dataservice.getListCustomer(function (rs) {
            rs = rs.data;
            $scope.listCustomer = rs;
        });
        dataservice.getListUserImport(function (rs) {
            rs = rs.data;
            $scope.listUserImport = rs;
        });
        dataservice.getListReason(function (rs) {
            rs = rs.data;
            $scope.listReason = rs;
        });
    }
    $scope.initLoad();
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadRoot = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return '';
                }
            }
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
            size: '65',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
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
                            $uibModalInstance.close();
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
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
        $('.end-date').click(function () {
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#DateTo').datepicker('setStartDate', date);
            }
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, $window) {
    //Khởi tạo
    $scope.isDisable = false;
    $scope.isNotSave = true;
    $scope.isEdit = false;
    $scope.isDelete = true;
    $scope.isEditCoil = false;

    $scope.IsEnabledImportLot = false;
    $rootScope.IsEnabledImportLot = false;
    $scope.modelDisable = true;
    $scope.model = {
        Title: '',
        StoreCode: '',
        CusCode: '',
        Reason: 'IMP_FROM_BUY',
        StoreCodeSend: '',
        Currency: 'CURRENCY_VND',
        PaymentStatus: '',
        UserImport: '',
        Note: '',
        UserSend: '',
        InsurantTime: '',
        LotProductCode: '',
        TicketCode: '',
        TimeTicketCreate: $filter('date')(new Date(), 'dd/MM/yyyy'),
        ListProduct: [],
        ListCoil: []
    }
    $scope.modelList = {
        ProductCode: '',
        ProductName: '',
        ProductQrCode: '',
        sProductQrCode: '',
        QuantityOrder: null,
        Quantity: null,
        Unit: '',
        UnitName: '',
        ImpType: ''
    };

    $scope.isShowListCoil = true;
    $scope.isShow = true;
    $scope.isODD = true;//Kiểm tra hình thức nhập
    $scope.isInsertCoil = false;

    $scope.modelUpdate = {};
    $scope.modelUpdateCoil = {};
    $scope.disableProductCode = false;
    $scope.disableProductCoil = false;
    $scope.disableProductRelative = false;
    $scope.disableListCoil = false;

    $scope.disableProductImpType = false;
    $scope.disableValueCoil = false;
    $scope.disableUnitCoil = true;
    $scope.disableQuantityCoil = false;

    $scope.isCoil = true;
    $scope.showCoil = false;
    $scope.allowAddCoil = false;
    $scope.listProductType = [];

    $scope.listProductRelative = [];
    $scope.chooseCoilInStore = false;

    $scope.initLoad = function () {
        dataservice.getListLotProduct(function (rs) {
            rs = rs.data;
            $scope.listLotProduct = rs;
        });
        dataservice.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListStore(function (rs) {
            rs = rs.data;
            $scope.listStore = rs;
            $scope.listStoreSend = rs;
        });
        dataservice.getListCustomer(function (rs) {
            rs = rs.data;
            $scope.listCustomer = rs;
        });
        dataservice.getListUserImport(function (rs) {
            rs = rs.data;
            $scope.listUserImport = rs;
        });
        dataservice.getListReason(function (rs) {
            rs = rs.data;
            $scope.listReason = rs;
        });
        dataservice.getListProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
        dataservice.getListProductRelative(function (rs) {
            rs = rs.data;
            $scope.listProductRelative = rs;
        });

        $scope.errorLotProductCode = false;
        if ($rootScope.IsEnabledImportLot) {
        } else {
            $scope.model.LotProductCode = '';
        };
    }
    $scope.initLoad();
    $scope.initLoadTicketCode = function () {
        var type = "ODD";
        if ($rootScope.IsEnabledImportLot) {
            type = "PO";
        }
        dataservice.createTicketCode(type, function (rs) {
            rs = rs.data;
            $scope.model.TicketCode = rs.Object;
            createCoilCode("", "", "");
        });
    }
    $scope.initLoadTicketCode();

    $rootScope.refeshData = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object.Header;
                $scope.model.ListProduct = rs.Object.ListProduct;
                $scope.model.ListCoil = [];
                for (var i = 0; i < $scope.model.ListProduct.length; i++) {
                    if ($scope.model.ListProduct[i].ListCoil.length > 0) {
                        for (var j = 0; j < $scope.model.ListProduct[i].ListCoil.length; j++) {
                            $scope.model.ListProduct[i].ListCoil[j].ValueCoil = $scope.model.ListProduct[i].ListCoil[j].Size;

                            var productCoil = $scope.model.ListProduct[i].ListCoil[j].ProductCoil;
                            $scope.model.ListProduct[i].ListCoil[j].RuleCoil = productCoil.split("_")[productCoil.split("_").length - 2];
                        }
                    }
                    $scope.model.ListProduct[i].sQuantityCoil = $scope.model.ListProduct[i].ListCoil.length;
                    $scope.model.ListProduct[i].QuantityOrder = $scope.model.ListProduct[i].Quantity - $scope.model.ListProduct[i].QuantityIsSet;
                }
                $rootScope.storeCode = $scope.model.StoreCode;
                if ($scope.model.LotProductCode != '') {
                    $scope.IsEnabledImportLot = true;
                    $rootScope.IsEnabledImportLot = true;

                    dataservice.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {
                        rs = rs.data;
                        $scope.listLotProduct = rs;
                    });
                }
                else {
                    dataservice.getListLotProduct(function (rs) {
                        rs = rs.data;
                        $scope.listLotProduct = rs;
                    });
                }

                createCoilCode("", "", "");
            }
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reloadRoot();
    }

    $scope.checkedImportLot = function (chk) {
        //$scope.initLoad();
        $rootScope.IsEnabledImportLot = chk;
        $scope.errorLotProductCode = false;
        var type = "ODD";
        if ($rootScope.IsEnabledImportLot) {
            type = "PO";
        } else {
            $scope.model.LotProductCode = '';
            $scope.model.ListProduct = [];
        };

        dataservice.createTicketCode(type, function (rs) {
            rs = rs.data;
            $scope.model.TicketCode = rs.Object;
        });
    }
    $scope.add = function () {
        if ($scope.isNotSave) {
            App.toastrError(caption.MIST_VALIDATE_SAVE_ADD_PRODUCT);
            return;
        }

        var msg = validationProduct($scope.modelList);
        if (msg.Status) {
            return;
        }
        if ($scope.model.ListCoil.length == 0) {
            App.toastrError(caption.MIST_VALIDATE_ROLL_BOX_BLANK);
            return;
        }
        //Check null
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' ||
            $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
            || $scope.modelList.SalePrice == undefined || $scope.modelList.SalePrice == null
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
        }
        else {
            var indexCheck = -1;
            var elementCheck = $scope.model.ListProduct.find(function (element) {
                if (element.ProductCode == $scope.modelList.ProductCode && element.ProductType == $scope.modelList.ProductType && element.ProductCoil == $scope.modelList.ProductCoil) {
                    indexCheck = 0;
                    return element;
                }
            });
            if (indexCheck > -1) {
                App.toastrError(caption.MES_MSG_PRODUCT_ADD_CATEGORY);
            } else {

                createProductQrCode();
                var addItem = {
                    ProductCode: $scope.modelList.ProductCode,
                    ProductName: $scope.modelList.ProductName,
                    ProductType: $scope.modelList.ProductType,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    sProductQrCode: $scope.modelList.sProductQrCode,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,

                    SalePrice: $scope.modelList.SalePrice,

                    QuantityIsSet: 0,
                    QuantityNeedSet: $scope.modelList.Quantity,
                    QuantityOrder: $scope.modelList.Quantity,

                    ProductCoil: $scope.modelList.ProductCoil,
                    sProductCoil: $scope.modelList.sProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ImpType: $scope.modelList.ImpType,
                    ProductCoilRelative: $scope.modelList.ProductCoilRelative,
                    ////Tính toán
                    Total: $scope.modelList.Quantity * $scope.modelList.SalePrice,
                    ListCoil: $scope.model.ListCoil,
                    QuantityCoil: $scope.model.ListCoil.length,
                    sQuantityCoil: $scope.model.ListCoil.length,
                };
                $scope.model.ListProduct.push(addItem);
                App.toastrSuccess(caption.COM_ADD_SUCCESS);
                $scope.model.ListCoil = [];
            }
        }
    }
    $scope.addCoil = function () {
        if ($scope.isNotSave) {
            App.toastrError(caption.MIST_VALIDATE_SAVE_ADD_ROLL_BOX);
            return;
        }
        //Check null
        if ($scope.modelList.ValueCoil == undefined || $scope.modelList.ValueCoil == null || $scope.modelList.ValueCoil == '' ||
            $scope.modelList.QuantityCoil == undefined || $scope.modelList.QuantityCoil == null || $scope.modelList.QuantityCoil == ''
            || $scope.modelList.RuleCoil == undefined || $scope.modelList.RuleCoil == null || $scope.modelList.RuleCoil == ''
            || $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == ''
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
            $scope.isInsertCoil = false;
            return;
        }
        else {
            $scope.modelList.QuantityCoil = parseInt($scope.modelList.QuantityCoil);
            if ($scope.modelList.QuantityCoil > 100) {
                App.toastrError(caption.MIST_VALIDATE_ADD_LIMIT100);
                return;
            }

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.RuleCoil);
            debugger
            var quantityAdd = $scope.modelList.QuantityCoil;
            for (var i = 0; i < quantityAdd; i++) {
                var addItem = {
                    ProductCode: $scope.modelList.ProductCode,
                    ProductName: $scope.modelList.ProductName,
                    ProductType: $scope.modelList.ProductType,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    //sProductQrCode: $scope.modelList.sProductQrCode,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,

                    SalePrice: $scope.modelList.SalePrice,

                    QuantityIsSet: 0,
                    QuantityNeedSet: $scope.modelList.QuantityNeedSet,

                    ProductCoil: $scope.modelList.ProductCoil,
                    sProductCoil: $scope.modelList.sProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ImpType: $scope.modelList.ImpType,
                    ProductImpType: $scope.modelList.ProductImpType,
                    ValueCoil: $scope.modelList.ValueCoil,
                    UnitCoil: $scope.modelList.UnitCoil,
                    QuantityCoil: $scope.modelList.QuantityCoil,
                    RuleCoil: $scope.modelList.RuleCoil,
                    ProductCoilRelative: $scope.modelList.ProductCoilRelative,
                    IsOrder: false,
                };
                $scope.model.ListCoil.push(addItem);
                $scope.isInsertCoil = true;
            }

            if ($scope.isInsertCoil) {
                App.toastrSuccess(caption.MIST_BTN_SAVE_INFORMATION);
            }

            //Cập nhật lại giá trị ở trên
            $scope.modelList.Quantity = 0;
            for (var i = 0; i < $scope.model.ListCoil.length; i++) {
                $scope.modelList.Quantity = $scope.modelList.Quantity + parseFloat($scope.model.ListCoil[i].ValueCoil);
            }
        }
    }

    $scope.editCoil = function (item, index) {
        $scope.modelUpdateCoil = item;
    }
    $scope.saveCoil = function () {
        //Check null
        if ($scope.modelList.ValueCoil == undefined || $scope.modelList.ValueCoil == null || $scope.modelList.ValueCoil == '' ||
            $scope.modelList.QuantityCoil == undefined || $scope.modelList.QuantityCoil == null || $scope.modelList.QuantityCoil == ''
            || $scope.modelList.RuleCoil == undefined || $scope.modelList.RuleCoil == null || $scope.modelList.RuleCoil == ''
            || $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == ''
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
            return;
        }
        else {
            $scope.model.ListCoil = [];

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.RuleCoil);

            var quantityAdd = $scope.modelList.QuantityCoil;
            $scope.modelList.Quantity = $scope.modelList.Quantity;
            for (var i = 0; i < quantityAdd; i++) {

                var addItem = {
                    ProductCode: $scope.modelList.ProductCode,
                    ProductName: $scope.modelList.ProductName,
                    ProductType: $scope.modelList.ProductType,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,

                    SalePrice: $scope.modelList.SalePrice,

                    QuantityIsSet: 0,
                    QuantityNeedSet: $scope.modelList.QuantityNeedSet,
                    ProductCoil: $scope.modelList.ProductCoil,
                    sProductCoil: $scope.modelList.sProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ImpType: $scope.modelList.ImpType,
                    ProductImpType: $scope.modelList.ProductImpType,
                    ValueCoil: $scope.modelList.ValueCoil,
                    UnitCoil: $scope.modelList.UnitCoil,
                    QuantityCoil: $scope.modelList.QuantityCoil,
                    RuleCoil: $scope.modelList.RuleCoil,
                    ProductCoilRelative: $scope.modelList.ProductCoilRelative,
                };
                $scope.model.ListCoil.push(addItem);
            }
        }
    }
    $scope.editItem = function (item, index) {
        $scope.disableProductCode = true;
        $scope.modelUpdate = item;
        $scope.isEdit = true;
        $scope.isEditCoil = true;

        //if (item.ImpType != null && item.ImpType != '' && item.ImpType != undefined) {
        //    var listUnit = item.ImpType.split(',');
        //    if (listUnit.length == 1) {
        //        $scope.isDelete = false;
        //    } else if (listUnit.length > 1) {
        //        $scope.isDelete = true;
        //    }
        //}

        $scope.modelList.ProductCode = item.ProductCode;
        $scope.modelList.ProductType = item.ProductType;
        $scope.modelList.ProductName = item.ProductName;
        //$scope.modelList.ProductQrCode = item.ProductQrCode;
        //$scope.modelList.sProductQrCode = item.sProductQrCode;
        $scope.modelList.Quantity = item.Quantity;
        $scope.modelList.Unit = item.Unit;
        $scope.modelList.UnitName = item.UnitName;
        $scope.modelList.ProductLot = item.ProductLot;
        $scope.modelList.SalePrice = item.SalePrice;
        $scope.modelList.ImpType = item.ImpType;
        //$scope.modelList.PackType = packType;
        $scope.modelList.ProductCoilRelative = item.ProductCoilRelative;
        $scope.model.ListCoil = item.ListCoil;

        var quantityCoil = 0;
        for (var i = 0; i < $scope.model.ListCoil.length; i++) {
            quantityCoil = quantityCoil + $scope.model.ListCoil[i].ValueCoil;
        }
        $scope.modelList.Quantity = quantityCoil;

        if (item.ImpType != '' && item.ImpType != null && item.ImpType != undefined) {
            $scope.listProductType = item.ImpType.split(",");
            if ($scope.listProductType.length > 0) {
                $scope.showCoil = true;
                $scope.modelList.UnitCoil = $scope.listProductType[$scope.listProductType.length - 1];
                if ($scope.listProductType.length == 1) {
                    $scope.disableProductImpType = true;
                    $scope.disableValueCoil = true;
                    $scope.disableUnitCoil = true;
                    //$scope.disableQuantityCoil = true;
                    //$scope.isODD = true;
                    //$scope.isDelete = false;

                    $scope.modelList.ProductImpType = $scope.modelList.UnitCoil;
                    $scope.modelList.ValueCoil = 1;
                    $scope.modelList.QuantityCoil = item.Quantity;
                    $scope.modelList.RuleCoil = 1;
                    $scope.modelList.ProductLot = 1;
                    //if ($scope.model.ListCoil.length == 0)
                    //    $scope.addCoil();
                } else {
                    //$scope.isODD = false;
                    $scope.isDelete = true;
                    $scope.disableProductImpType = false;
                    $scope.disableValueCoil = false;
                    $scope.disableUnitCoil = true;
                    $scope.disableQuantityCoil = false;

                    $scope.modelList.ProductImpType = '';
                    $scope.modelList.ValueCoil = '';
                    $scope.modelList.QuantityCoil = '';
                    $scope.modelList.RuleCoil = '';
                    $scope.modelList.ProductLot = '';
                }
            } else {
                //$scope.isODD = false;
                $scope.showCoil = false;
                //$scope.isDelete = false;
            }
        } else {
            App.toastrError(caption.MIST_VALIDATE_IN_PRODUCT_TYPE);
        }

        $scope.disableFiled(item.ImpType);
    }
    $scope.save = function () {
        if ($scope.model.ListCoil.length == 0) {
            App.toastrError(caption.MIST_VALIDATE_ROLL_BOX_BLANK);
            return;
        }

        $scope.disableProductCode = false;
        $scope.isEditCoil = false;

        $scope.modelUpdate.ProductCode = $scope.modelList.ProductCode;
        $scope.modelUpdate.ProductType = $scope.modelList.ProductType;
        $scope.modelUpdate.ProductName = $scope.modelList.ProductName;
        //$scope.modelUpdate.ProductQrCode = $scope.modelList.ProductQrCode;
        //$scope.modelUpdate.sProductQrCode = $scope.modelList.sProductQrCode;
        $scope.modelUpdate.Quantity = $scope.modelList.Quantity;
        $scope.modelUpdate.Unit = $scope.modelList.Unit;
        $scope.modelUpdate.UnitName = $scope.modelList.UnitName;
        $scope.modelUpdate.ProductLot = $scope.modelList.ProductLot;
        $scope.modelUpdate.SalePrice = $scope.modelList.SalePrice;
        $scope.modelUpdate.ImpType = $scope.modelList.ImpType;
        $scope.modelUpdate.ProductCoilRelative = $scope.modelList.ProductCoilRelative;
        $scope.modelUpdate.ListCoil = $scope.model.ListCoil;
        $scope.modelUpdate.QuantityCoil = $scope.model.ListCoil.length;
        $scope.modelUpdate.sQuantityCoil = $scope.model.ListCoil.length;
        App.toastrSuccess(caption.COM_UPDATE_SUCCESS);
        $scope.model.ListCoil = [];

        dataservice.update($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $rootScope.refeshData($rootScope.rootId);
                App.toastrSuccess(caption.COM_UPDATE_SUCCESS);
            }
        });
    }

    $scope.removeItem = function (item, index) {
        if (item.QuantityIsSet > 0) {
            App.toastrError(caption.MIST_SORT_PRODUCT_CANNOT_DELETE);
        }
        else {
            dataservice.checkProductInExpTicket(item.ProductQrCode, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    //Lấy lại giá trị model vừa xóa đưa lên chỗ add
                    $scope.modelList.ProductCode = item.ProductCode;
                    $scope.modelList.ProductType = item.ProductType;
                    $scope.modelList.ProductName = item.ProductName;
                    $scope.modelList.ProductQrCode = item.ProductQrCode;
                    $scope.modelList.sProductQrCode = item.sProductQrCode;
                    $scope.modelList.Quantity = item.Quantity;
                    $scope.modelList.Unit = item.Unit;
                    $scope.modelList.UnitName = item.UnitName;
                    $scope.modelList.SalePrice = item.SalePrice;
                    $scope.modelList.ProductLot = item.ProductLot;

                    //Check xem đã có trong list chưa
                    $scope.model.ListProduct.splice(index, 1);
                    App.toastrSuccess(caption.COM_DELETE_SUCCESS);
                } else {
                    App.toastrError(rs.Title);
                }
            });
        }
    }
    $scope.removeCoil = function (item) {
        if (item.IsOrder) {
            App.toastrError(caption.MIST_SORT_CANNOT_DELETE);
        } else {
            var index = $scope.model.ListCoil.indexOf(item);
            if (index < -1) {
                App.toastrError(caption.MIST_NOT_FOUND_DEL_PRODUCT);
                return;
            }
            $scope.model.ListCoil.splice(index, 1);
            $scope.modelList.Quantity = 0;
            for (var i = 0; i < $scope.model.ListCoil.length; i++) {
                $scope.modelList.Quantity = $scope.modelList.Quantity + (parseFloat(item.ValueCoil));
            }
            App.toastrSuccess(caption.MIST_BTN_SAVE_INFORMATION);
        }
    }
    $scope.changleSelect = function (SelectType, item) {
        //Hàm chọn 1 lô để nhập
        if (SelectType == "LotProductCode") {
            $rootScope.LotProductCode = item.Code;
            $scope.model.Reason = 'IMP_FROM_BUY';
            $scope.model.StoreCodeSend = '';

            dataservice.getLotProduct(item.Code, function (rs) {
                rs = rs.data;
                $scope.model.CusCode = rs.SupCode;
                //$scope.model.CostTotal = rs.CostTotal;
                //$scope.model.TaxTotal = rs.TaxTotal;
                //$scope.model.Discount = rs.Discount;
                //$scope.model.Commission = rs.Commission;
                //$scope.model.TotalMustPayment = rs.TotalMustPayment;
                //$scope.model.Currency = rs.Currency;
                createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);

                $scope.model.ListProduct = rs.ListProduct;
            });

            //Bỏ validate
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                $scope.errorLotProductCode = false;
            }
        }
        if (SelectType == "ProductCode") {
            if ($scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' || $scope.modelList.ProductCode == undefined) {
                $scope.errorProductCode = true;
            } else {
                $scope.errorProductCode = false;
            }
            $scope.model.ListCoil = [];
            $scope.modelList.Unit = item.Unit;
            $scope.modelList.UnitName = item.UnitName;
            $scope.modelList.ProductName = item.Name;
            $scope.modelList.ProductType = item.ProductType;
            $scope.modelList.ImpType = item.ImpType;
            createProductQrCode();
            if (item.ImpType != '' && item.ImpType != null && item.ImpType != undefined) {
                $scope.modelList.Quantity = 0;
                $scope.listProductType = item.ImpType.split(",");
                if ($scope.listProductType.length > 0) {
                    $scope.showCoil = true;
                    $scope.modelList.UnitCoil = $scope.listProductType[$scope.listProductType.length - 1];
                    if ($scope.listProductType.length == 1) {
                        $scope.disableProductImpType = true;
                        $scope.disableValueCoil = true;
                        $scope.disableUnitCoil = true;
                        //$scope.disableQuantityCoil = true;//Phần này cho phép nhập số lượng

                        //$scope.isODD = true;
                        $scope.modelList.ProductImpType = $scope.modelList.UnitCoil;
                        $scope.modelList.ValueCoil = 1;
                        $scope.modelList.QuantityCoil = 1;
                        $scope.modelList.RuleCoil = 1;
                        $scope.modelList.ProductLot = 1;
                        //if ($scope.model.ListCoil.length == 0) {
                        //    $scope.modelList.Quantity = 0;
                        //    $scope.addCoil();
                        //}

                        //Kiểm tra giá trị có null hay không
                        //if ($scope.modelList.Quantity == null || $scope.modelList.Quantity == '' || $scope.modelList.Quantity == undefined) {
                        //    $scope.errorQuantity = true;
                        //} else {
                        //    $scope.errorQuantity = false;
                        //}
                    } else {
                        //$scope.isODD = false;
                        $scope.disableProductImpType = false;
                        $scope.disableValueCoil = false;
                        $scope.disableUnitCoil = true;
                        $scope.disableQuantityCoil = false;

                        $scope.modelList.ProductImpType = '';
                        $scope.modelList.ValueCoil = '';
                        $scope.modelList.QuantityCoil = '';
                        $scope.modelList.RuleCoil = '';
                        $scope.modelList.ProductLot = '';
                    }
                } else {
                    //$scope.isODD = false;
                    $scope.showCoil = false;
                }
            } else {
                App.toastrError(caption.MIST_VALIDATE_IN_PRODUCT_TYPE);
            }

            $scope.disableFiled(item.ImpType);

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.sProductCoil);
        }
        if (SelectType == "ProductRelative") {
            $scope.chooseCoilInStore = true;
            var check = $scope.listProduct.filter(k => k.Code === item.ProductCode);
            if (check.length == 1) {
                $scope.modelList.ProductCode = item.ProductCode;
                $scope.modelList.SalePrice = item.SalePrice;
                $scope.modelList.Quantity = item.Quantity;
                $scope.modelList.Unit = check[0].Unit;
                $scope.modelList.UnitName = check[0].UnitName;
                $scope.modelList.ProductName = check[0].Name;
                $scope.modelList.ProductType = check[0].ProductType;
                $scope.modelList.ImpType = check[0].ImpType;
                $scope.modelList.ProductLot = item.ProductLot;
                validationProduct($scope.modelList);
                createProductQrCode();
            }

            //var listRelative = $scope.listProductRelative.filter(k => k.CoilRelative === item.Code);
            //var no = listRelative.length + 1;
            //$scope.modelList.ProductCoil = item.Code + "_" + no;

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.sProductCoil);
        }
        if (SelectType == "StoreCode") {
            if ($scope.model.StoreCodeSend == $scope.model.StoreCode) {
                $scope.model.StoreCodeSend = '';
                App.toastrError(caption.MIS_MSG_OTHER_IMPORT_WAREHOUSE_TRANSFER);
            }
            createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);
            //$scope.model.ListProduct = [];
            //$scope.modelList = {
            //    ProductCode: '',
            //    ProductName: '',
            //    ProductQrCode: '',
            //    sProductQrCode: '',
            //    Quantity: null,
            //    Unit: '',
            //    UnitName: '',
            //    SalePrice: null,
            //    TaxRate: 10,
            //    Discount: 0,
            //    Commission: 0,
            //};
            if ($scope.model.StoreCode != undefined && $scope.model.StoreCode != null && $scope.model.StoreCode != '') {
                $scope.errorStoreCode = false;
            }
        }
        if (SelectType == "Reason") {
            if ($scope.model.Reason != undefined && $scope.model.Reason != null && $scope.model.Reason != '') {
                $scope.errorReason = false;
            }
            if ($scope.model.Reason == 'IMP_FROM_BUY') {
                $scope.model.StoreCodeSend = '';
            }
            else {
                $scope.model.CusCode = '';
            }
        }
        if (SelectType == "StoreCodeSend") {
            if ($scope.model.StoreCodeSend == $scope.model.StoreCode) {
                $scope.model.StoreCodeSend = '';
                App.toastrError(caption.MIS_MSG_OTHER_IMPORT_WAREHOUSE_TRANSFER);
            }
            if ($scope.model.StoreCodeSend != undefined && $scope.model.StoreCodeSend != null && $scope.model.StoreCodeSend != '') {
                $scope.errorStoreCodeSend = false;
            }
        }
        if (SelectType == "UserImport") {
            createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);
            if ($scope.model.UserImport != undefined && $scope.model.UserImport != null && $scope.model.UserImport != '') {
                $scope.errorUserImport = false;
            }
        }
    }
    $scope.changeCoil = function () {
        createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.sProductCoil);
    }
    $scope.change = function (type) {
        switch (type) {
            //Quy cách
            case 'ruleCoil':
                createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.RuleCoil);
                break;
            case 'quantity':
                if ($scope.modelList.Quantity == null || $scope.modelList.Quantity == '' || $scope.modelList.Quantity == undefined) {
                    $scope.errorQuantity = true;
                } else {
                    $scope.errorQuantity = false;
                }
                break;
            case 'price':
                if ($scope.modelList.SalePrice == null || $scope.modelList.SalePrice == '' || $scope.modelList.SalePrice == undefined) {
                    $scope.errorSalePrice = true;
                } else {
                    $scope.errorSalePrice = false;
                }
                break;
            default:
        }
    }
    $scope.changeTilte = function () {
        if ($scope.model.Title != undefined && $scope.model.Title != null && $scope.model.Title != '') {
            $scope.errorTitle = false;
        } else {
            $scope.errorTitle = true;
        }

    }
    $scope.openLog = function () {
        dataservice.getUpdateLog($scope.model.TicketCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/showLog.html',
                controller: 'showLog',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () { });
        });
    }
    $scope.showAddCoil = function (item, index) {
        if ($scope.isNotSave) {
            App.toastrError(caption.MIST_VALIDATE_SAVE_ADD_ROLL_BOX);
            return;
        }
        var objPara = {
            item: item,
            rootId: $rootScope.rootId,
            productName: item.ProductName,
            ticketCode: $scope.model.TicketCode,
            model: $scope.model
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/showAddCoil.html',
            controller: 'showAddCoil',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        objPara
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initLoad();
        }, function () {
        });
    }
    $scope.showListCoil = function () {
        if ($scope.isShow == true) {
            $scope.isShow = false;
            $scope.isShowListCoil = true;
        }
        else {
            $scope.isShow = true;
            $scope.isShowListCoil = false;
        }
    }

    //Xử lý phần disable khi danh mục sản phẩm có hình thức nhập là cuộn, thùng
    $scope.disableFiled = function (type) {

        if (type != "Thùng" && type != "Cuộn") {
            $scope.disableProductCoil = true;
            $scope.disableProductRelative = true;
            $scope.disableListCoil = true;
        } else {
            $scope.disableProductCoil = false;
            $scope.disableProductRelative = false;
            $scope.disableListCoil = false;
            $scope.allowAddCoil = true;
        }
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.IsEnabledImportLot == true) {
            var chk = false;
            var countQuantity = 0;
            //angular.forEach($scope.model.ListProduct, function (value, key) {
            //    countQuantity = countQuantity + value.Quantity;
            //    if (value.Quantity > value.QuantityOrder) {
            //        chk = true;
            //        value.Message = caption.MIS_MSG_AMOUNT_EXCEED;
            //        //Số lượng vượt mức cho phép
            //        //return;
            //    }
            //    if (value.Quantity < 0 || value.Quantity == undefined || value.Quantity == null) {
            //        chk = true;
            //        value.Message = caption.MIS_MSG_AMOUNT_SOUNT;
            //        //Số lượng âm
            //        //return;
            //    }
            //})
            //if (chk == true) {
            //    App.toastrError(caption.MIS_MSG_ENTER_PRODUCT_IMPORT_EXCEED_OR_AMOUNT_SOUNT);
            //    return;
            //}
            //if (countQuantity == 0) {
            //    App.toastrError(caption.MIS_MSG_CHOSE_PRODUCT_AMOUNT_ZERO);
            //    return;
            //}
        }
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            } else {
                if (!$scope.isEdit) {
                    dataservice.insert($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            var type = "ODD";
                            if ($rootScope.IsEnabledImportLot) {
                                type = "PO";
                            } else {
                                $scope.model.LotProductCode = '';
                            };
                            dataservice.createTicketCode(type, function (rs) {
                                rs = rs.data;
                                $scope.model.TicketCode = rs.Object;
                                createCoilCode("", "", "");
                                $scope.confirmCodeExits($scope.model.TicketCode);
                            });
                        } else {
                            $scope.isNotSave = false;
                            $scope.isDisable = true;
                            $scope.isEdit = true;
                            $rootScope.storeCode = $scope.model.StoreCode;
                            App.toastrSuccess(rs.Title);
                            $rootScope.rootId = rs.ID;
                        }
                    });
                } else {
                    dataservice.update($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            $scope.isDisable = true;
                            App.toastrSuccess(rs.Title);
                        }
                    });
                }
            }
        }
    }
    $scope.orderingItemCoil = function (item) {
        //var item = $scope.model.ListCoil[index];
        if (item != null) {
            dataservice.checkProductInStoreCoil(item.ProductQrCode, item.ProductCoil, function (rs) {
                rs = rs.data;
                if (rs) {
                    var getStore = $scope.listStore.find(function (element) {
                        if (element.Code == $scope.model.StoreCode) return true;
                    });
                    var objPara = {
                        item: item,
                        rootId: $rootScope.rootId,
                        productName: item.ProductName,
                        productCoil: item.ProductCoil,
                        storeName: getStore ? getStore.Name : ''
                    }

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/orderProduct.html',
                        controller: 'orderProduct',
                        backdrop: 'static',
                        size: '70',
                        resolve: {
                            para: function () {
                                return {
                                    objPara
                                };
                            }
                        }
                    });
                    modalInstance.result.then(function (id) {
                        //$scope.initLoad();
                    }, function () {
                    });
                } else {
                    App.toastrError(caption.MIS_MSG_PRODUCT_NON_ADD_REQUEST_CHOSE_ADD);
                }
            });
        } else {
            App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
    }
    $rootScope.updateOrderItemCoil = function (id) {
        var item = $scope.model.ListCoil.find(function (element) {
            if (element.Id == id) return true;
        });
        if (item) {
            if (item.IsOrder == false) {
                item.IsOrder = true;
            } else {
                item.IsOrder = false;
            }
        }
    }
    $rootScope.reloadData = function () {
        if ($rootScope.rootId != null && $rootScope.rootId != undefined && $rootScope.rootId != '') {
            var id = parseFloat($rootScope.rootId);
            dataservice.getItem(id, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = rs.Object.Header;
                    $scope.model.ListProduct = rs.Object.ListProduct;
                    $scope.model.ListCoil = [];
                    for (var i = 0; i < $scope.model.ListProduct.length; i++) {
                        if ($scope.model.ListProduct[i].ListCoil.length > 0) {
                            for (var j = 0; j < $scope.model.ListProduct[i].ListCoil.length; j++) {
                                $scope.model.ListProduct[i].ListCoil[j].ValueCoil = $scope.model.ListProduct[i].ListCoil[j].Size;

                                var productCoil = $scope.model.ListProduct[i].ListCoil[j].ProductCoil;
                                $scope.model.ListProduct[i].ListCoil[j].RuleCoil = productCoil.split("_")[productCoil.split("_").length - 2];
                            }
                        }
                        $scope.model.ListProduct[i].sQuantityCoil = $scope.model.ListProduct[i].ListCoil.length;
                        $scope.model.ListProduct[i].QuantityOrder = $scope.model.ListProduct[i].Quantity - $scope.model.ListProduct[i].QuantityIsSet;
                    }
                    $rootScope.storeCode = $scope.model.StoreCode;
                    if ($scope.model.LotProductCode != '') {
                        $scope.IsEnabledImportLot = true;
                        $rootScope.IsEnabledImportLot = true;

                        dataservice.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {
                            rs = rs.data;
                            $scope.listLotProduct = rs;
                        });
                    }
                    else {
                        dataservice.getListLotProduct(function (rs) {
                            rs = rs.data;
                            $scope.listLotProduct = rs;
                        });
                    }

                    createCoilCode("", "", "");
                }
            });
        }
    }

    $scope.orderingItem = function (index) {
        var item = $scope.model.ListProduct[index];
        if (item != null) {
            dataservice.checkProductInStore(item.ProductQrCode, function (rs) {
                rs = rs.data;
                debugger
                if (rs) {
                    var getStore = $scope.listStore.find(function (element) {
                        if (element.Code == $scope.model.StoreCode) return true;
                    });
                    var objPara = {
                        item: item,
                        rootId: $rootScope.rootId,
                        productName: item.ProductName,
                        productCoil: '',
                        storeName: getStore ? getStore.Name : ''
                    }
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/orderProduct.html',
                        controller: 'orderProduct',
                        backdrop: 'static',
                        size: '70',
                        resolve: {
                            para: function () {
                                return {
                                    objPara
                                };
                            }
                        }
                    });
                    modalInstance.result.then(function (id) {
                        $rootScope.reloadData();
                    }, function () {
                    });
                } else {
                    App.toastrError(caption.MIS_MSG_PRODUCT_NON_ADD_REQUEST_CHOSE_ADD);
                }
            });
        } else {
            App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
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

    $scope.confirmCodeExits = function (ticketCode) {
        var model = $scope.model;
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmQuestion.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return {
                        model
                    };
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.MIST_VALIDATE_ALREADY_EXIST_THEN + ticketCode;
                $scope.ok = function () {
                    dataservice.insert(para.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close(rs.ID);
                        }
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.close(false, null);
                };
            },
            size: '25'
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.isNotSave = false;
                $scope.isDisable = true;
                $scope.isEdit = true;
                $rootScope.storeCode = $scope.model.StoreCode;
                $rootScope.rootId = d;
            }
        }, function () {
        });
    }

    function loadDate() {
        //$("#NextTimePayment").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //});
        $("#InsurantTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#TimeTicketCreate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //var today = new Date(new Date());
        //// tạm chú thích để test phần dự báo: Hoàng
        //$('#TimeTicketCreate').datepicker('setStartDate', today);
        //$('#TimeTicketCreate').datepicker('update', new Date());
        //$('#TimeTicketCreate').datepicker('setEndDate', today);
        //$scope.model.TimeTicketCreate = $filter('date')(new Date(today), 'dd/MM/yyyy');
        //$('#NextTimePayment').datepicker('setStartDate', today);
        //$('#InsurantTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    function createTicketCode(lot, store, user) {

    }
    function createProductQrCode() {
        var today = moment().format('DDMMYYYY-HHmm');
        //$scope.modelList.ProductQrCode = "LE_SP." + $scope.modelList.ProductCode + "_SL." + $scope.modelList.Quantity + "_T." + today;
        $scope.modelList.ProductQrCode = $scope.modelList.ProductCode + "_SL." + $scope.modelList.Quantity + "_T." + today;
        dataservice.generatorQRCode($scope.modelList.ProductQrCode, function (result) {
            result = result.data;
            $scope.modelList.sProductQrCode = result;
        });
    }
    function createCoilCode(productCode, lot, rule) {
        if (productCode == "" || productCode == undefined || productCode == null)
            productCode = "";

        if (lot == "" || lot == undefined || lot == null)
            lot = "";

        if (rule == "" || rule == undefined || rule == null)
            rule = "";

        var no = 1;
        $scope.modelList.ProductCoil = $scope.model.TicketCode + "_" + productCode + "_" + rule + "_";
    }
    function validationProduct(data) {
        var mess = { Status: false, Title: "" }
        //Check null lô hàng khi chọn nhập theo lô
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '') {
            $scope.errorProductCode = true;
            mess.Status = true;
            mess.Title = caption.MIS_VALIDATE_CHOOSE_PRODUCT;
        } else {
            $scope.errorProductCode = false;
        }
        if ($scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == '') {
            $scope.errorQuantity = true;
            mess.Status = true;
            if (mess.Title != "")
                mess.Title = mess.Title + "</br>caption.MIS_VALIDATE_ENTER_VALUE";
            else
                mess.Title = caption.MIS_VALIDATE_ENTER_VALUE;
        } else {
            $scope.errorQuantity = false;
        }
        if ($scope.modelList.SalePrice == undefined || $scope.modelList.SalePrice == null || $scope.modelList.SalePrice == '') {
            $scope.errorSalePrice = true;
            mess.Status = true;
            if (mess.Title != "")
                mess.Title = mess.Title + "</br>caption.MIS_VALIDATE_ENTER_PRICE";
            else
                mess.Title = caption.MIS_VALIDATE_ENTER_PRICE;
        } else {
            $scope.errorSalePrice = false;
        }
        return mess;
    }
    function validationProductCoil(data) {
        var mess = { Status: false, Title: "" }
        if ($scope.modelList.ProductCoil == undefined || $scope.modelList.ProductCoil == null || $scope.modelList.ProductCoil == '') {
            $scope.errorProductCoil = true;
            mess.Status = true;
            if (mess.Title != "")
                mess.Title = mess.Title + "</br>caption.MIST_VALDIATE_ADD_ROLL_BOX";
            else
                mess.Title = caption.MIST_VALDIATE_ADD_ROLL_BOX;
        } else {
            $scope.errorProductCoil = false;
        }

        return mess;
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null lô hàng khi chọn nhập theo lô
        if ($scope.IsEnabledImportLot == true && (data.LotProductCode == undefined || data.LotProductCode == null || data.LotProductCode == '')) {
            $scope.errorLotProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorLotProductCode = false;
        }

        //Check null kho hàng
        if (data.StoreCode == undefined || data.StoreCode == null || data.StoreCode == '') {
            $scope.errorStoreCode = true;
            mess.Status = true;
        } else {
            $scope.errorStoreCode = false;
        }

        //Check null lý do
        if (data.Reason == undefined || data.Reason == null || data.Reason == '') {
            $scope.errorReason = true;
            mess.Status = true;
        } else {
            $scope.errorReason = false;
        }

        //Check null kho chuyển đến
        if ($scope.model.Reason == 'IMP_FROM_MOVE_STORE' && (data.StoreCodeSend == undefined || data.StoreCodeSend == null || data.StoreCodeSend == '')) {
            $scope.errorStoreCodeSend = true;
            mess.Status = true;
        } else {
            $scope.errorStoreCodeSend = false;
        }

        //Check null nhân viên nhập
        if (data.UserImport == undefined || data.UserImport == null || data.UserImport == '') {
            $scope.errorUserImport = true;
            mess.Status = true;
        } else {
            $scope.errorUserImport = false;
        }

        //Check title
        if (data.Title == undefined || data.Title == null || data.Title == '') {
            $scope.errorTitle = true;
            mess.Status = true;
        } else {
            $scope.errorTitle = false;
        }

        return mess;
    };
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }
    setTimeout(function () {
        loadDate();
        loadPoper();
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, para, $window) {
    $rootScope.rootId = para;
    $scope.isDisable = false;
    $scope.isEdit = false;
    $scope.IsEnabledImportLot = false;
    $rootScope.IsEnabledImportLot = false;
    $scope.modelDisable = true;
    $scope.isDelete = true;
    $scope.model = {
        Title: '',
        StoreCode: '',
        CusCode: '',
        Reason: 'IMP_FROM_BUY',
        StoreCodeSend: '',
        Currency: 'CURRENCY_VND',
        PaymentStatus: '',
        UserImport: '',
        Note: '',
        UserSend: '',
        InsurantTime: '',
        LotProductCode: '',
        TicketCode: '',
        TimeTicketCreate: $filter('date')(new Date(), 'dd/MM/yyyy'),
        ListProduct: [],
        ListCoil: []
    }
    $scope.modelList = {
        ProductCode: '',
        ProductName: '',
        ProductQrCode: '',
        sProductQrCode: '',
        QuantityOrder: null,
        Quantity: null,
        Unit: '',
        UnitName: '',
        ImpType: ''
    };

    $scope.isShowListCoil = true;
    $scope.isShow = true;
    $scope.isInsertCoil = false;

    $scope.modelUpdate = {};
    $scope.disableProductCode = false;
    $scope.disableProductCoil = false;
    $scope.disableProductRelative = false;
    $scope.disableListCoil = false;

    $scope.disableProductImpCoil = false;
    $scope.disableValueCoil = false;
    $scope.disableUnitCoil = true;
    $scope.disableQuantityCoil = false;

    $scope.isCoil = true;
    $scope.allowAddCoil = false;

    $scope.listProductRelative = [];
    $scope.chooseCoilInStore = false;

    $scope.initLoad = function () {
        dataservice.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListStore(function (rs) {
            rs = rs.data;
            $scope.listStore = rs;
            $scope.listStoreSend = rs;
        });
        dataservice.getListCustomer(function (rs) {
            rs = rs.data;
            $scope.listCustomer = rs;
        });
        dataservice.getListUserImport(function (rs) {
            rs = rs.data;
            $scope.listUserImport = rs;
        });
        dataservice.getListReason(function (rs) {
            rs = rs.data;
            $scope.listReason = rs;
        });
        dataservice.getListProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });

        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object.Header;
                $scope.model.ListProduct = rs.Object.ListProduct;
                $scope.model.ListCoil = [];
                for (var i = 0; i < $scope.model.ListProduct.length; i++) {
                    if ($scope.model.ListProduct[i].ListCoil.length > 0) {
                        for (var j = 0; j < $scope.model.ListProduct[i].ListCoil.length; j++) {
                            $scope.model.ListProduct[i].ListCoil[j].ValueCoil = $scope.model.ListProduct[i].ListCoil[j].Size;

                            var productCoil = $scope.model.ListProduct[i].ListCoil[j].ProductCoil;
                            $scope.model.ListProduct[i].ListCoil[j].RuleCoil = productCoil.split("_")[productCoil.split("_").length - 2];
                        }
                    }
                    $scope.model.ListProduct[i].sQuantityCoil = $scope.model.ListProduct[i].ListCoil.length;
                    $scope.model.ListProduct[i].QuantityOrder = $scope.model.ListProduct[i].Quantity - $scope.model.ListProduct[i].QuantityIsSet;
                }
                $rootScope.storeCode = $scope.model.StoreCode;
                if ($scope.model.LotProductCode != '') {
                    $scope.IsEnabledImportLot = true;
                    $rootScope.IsEnabledImportLot = true;

                    dataservice.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {
                        rs = rs.data;
                        $scope.listLotProduct = rs;
                    });
                }
                else {
                    dataservice.getListLotProduct(function (rs) {
                        rs = rs.data;
                        $scope.listLotProduct = rs;
                    });
                }

                createCoilCode("", "", "");
            }
        });

        dataservice.getListProductRelative(function (rs) {
            rs = rs.data;
            $scope.listProductRelative = rs;
        });
    }
    $scope.initLoad();

    $rootScope.refeshData = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object.Header;
                $scope.model.ListProduct = rs.Object.ListProduct;
                $scope.model.ListCoil = [];
                for (var i = 0; i < $scope.model.ListProduct.length; i++) {
                    if ($scope.model.ListProduct[i].ListCoil.length > 0) {
                        for (var j = 0; j < $scope.model.ListProduct[i].ListCoil.length; j++) {
                            $scope.model.ListProduct[i].ListCoil[j].ValueCoil = $scope.model.ListProduct[i].ListCoil[j].Size;

                            var productCoil = $scope.model.ListProduct[i].ListCoil[j].ProductCoil;
                            $scope.model.ListProduct[i].ListCoil[j].RuleCoil = productCoil.split("_")[productCoil.split("_").length - 2];
                        }
                    }
                    $scope.model.ListProduct[i].sQuantityCoil = $scope.model.ListProduct[i].ListCoil.length;
                    $scope.model.ListProduct[i].QuantityOrder = $scope.model.ListProduct[i].Quantity - $scope.model.ListProduct[i].QuantityIsSet;
                }
                $rootScope.storeCode = $scope.model.StoreCode;
                if ($scope.model.LotProductCode != '') {
                    $scope.IsEnabledImportLot = true;
                    $rootScope.IsEnabledImportLot = true;

                    dataservice.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {
                        rs = rs.data;
                        $scope.listLotProduct = rs;
                    });
                }
                else {
                    dataservice.getListLotProduct(function (rs) {
                        rs = rs.data;
                        $scope.listLotProduct = rs;
                    });
                }

                createCoilCode("", "", "");
            }
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reloadRoot();
    }
    $scope.checkedImportLot = function (chk) {
        $scope.init();
        $rootScope.IsEnabledImportLot = chk;
        $scope.errorLotProductCode = false;

    }
    $scope.add = function () {
        var msg = validationProduct($scope.modelList);
        if (msg.Status) {
            return;
        }
        if ($scope.model.ListCoil.length == 0) {
            App.toastrError(caption.MIST_VALIDATE_ROLL_BOX_BLANK);
            return;
        }
        //Check null
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' ||
            $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
            || $scope.modelList.SalePrice == undefined || $scope.modelList.SalePrice == null
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
        }
        else {
            var indexCheck = -1;
            var elementCheck = $scope.model.ListProduct.find(function (element) {
                if (element.ProductCode == $scope.modelList.ProductCode && element.ProductType == $scope.modelList.ProductType && element.ProductCoil == $scope.modelList.ProductCoil) {
                    indexCheck = 0;
                    return element;
                }
            });
            if (indexCheck > -1) {
                App.toastrError(caption.MES_MSG_PRODUCT_ADD_CATEGORY);
            }
            else {
                //Tạo QrCode cho sản phẩm
                createProductQrCode();

                var addItem = {
                    ProductCode: $scope.modelList.ProductCode,
                    ProductName: $scope.modelList.ProductName,
                    ProductType: $scope.modelList.ProductType,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    sProductQrCode: $scope.modelList.sProductQrCode,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,

                    SalePrice: $scope.modelList.SalePrice,

                    QuantityIsSet: 0,
                    QuantityNeedSet: $scope.modelList.QuantityNeedSet,
                    QuantityOrder: $scope.modelList.Quantity,//Số lượng cần xếp kho 
                    ProductCoil: $scope.modelList.ProductCoil,
                    sProductCoil: $scope.modelList.sProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ImpType: $scope.modelList.ImpType,
                    ProductCoilRelative: $scope.modelList.ProductCoilRelative,
                    ////Tính toán
                    Total: $scope.modelList.Quantity * $scope.modelList.SalePrice,
                    ListCoil: $scope.model.ListCoil,
                    QuantityCoil: $scope.model.ListCoil.length,
                    sQuantityCoil: $scope.model.ListCoil.length,
                };
                $scope.model.ListProduct.push(addItem);
                $scope.model.ListCoil = [];
                App.toastrSuccess(caption.COM_ADD_SUCCESS);
            }
        }
    }
    $scope.addCoil = function () {
        //Check null
        if ($scope.modelList.ValueCoil == undefined || $scope.modelList.ValueCoil == null || $scope.modelList.ValueCoil == '' ||
            $scope.modelList.QuantityCoil == undefined || $scope.modelList.QuantityCoil == null || $scope.modelList.QuantityCoil == ''
            || $scope.modelList.RuleCoil == undefined || $scope.modelList.RuleCoil == null || $scope.modelList.RuleCoil == ''
            || $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == ''
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
            $scope.isInsertCoil = false;
            return;
        }
        else {
            $scope.modelList.QuantityCoil = parseInt($scope.modelList.QuantityCoil);
            if ($scope.modelList.QuantityCoil > 100) {
                App.toastrError(caption.MIST_VALIDATE_ADD_LIMIT100);
                return;
            }

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.RuleCoil);
            debugger
            var quantityAdd = $scope.modelList.QuantityCoil;
            $scope.modelList.Quantity = $scope.modelList.Quantity + ($scope.modelList.QuantityCoil * $scope.modelList.ValueCoil);
            for (var i = 0; i < quantityAdd; i++) {

                var addItem = {
                    ProductCode: $scope.modelList.ProductCode,
                    ProductName: $scope.modelList.ProductName,
                    ProductType: $scope.modelList.ProductType,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    //sProductQrCode: $scope.modelList.sProductQrCode,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,

                    SalePrice: $scope.modelList.SalePrice,

                    QuantityIsSet: 0,
                    QuantityNeedSet: $scope.modelList.QuantityNeedSet,

                    ProductCoil: $scope.modelList.ProductCoil,
                    sProductCoil: $scope.modelList.sProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ImpType: $scope.modelList.ImpType,
                    ProductImpType: $scope.modelList.ProductImpType,
                    ValueCoil: $scope.modelList.ValueCoil,
                    UnitCoil: $scope.modelList.UnitCoil,
                    QuantityCoil: $scope.modelList.QuantityCoil,
                    RuleCoil: $scope.modelList.RuleCoil,
                    ProductCoilRelative: $scope.modelList.ProductCoilRelative,
                    IsOrder: false,
                };
                $scope.model.ListCoil.push(addItem);
                $scope.isInsertCoil = true;
            }

            if ($scope.isInsertCoil) {
                App.toastrSuccess(caption.COM_ADD_SUCCESS);
            }
        }
    }

    $scope.editCoil = function (item, index) {
        $scope.modelUpdateCoil = item;
    }
    $scope.saveCoil = function () {
        //Check null
        if ($scope.modelList.ValueCoil == undefined || $scope.modelList.ValueCoil == null || $scope.modelList.ValueCoil == '' ||
            $scope.modelList.QuantityCoil == undefined || $scope.modelList.QuantityCoil == null || $scope.modelList.QuantityCoil == ''
            || $scope.modelList.RuleCoil == undefined || $scope.modelList.RuleCoil == null || $scope.modelList.RuleCoil == ''
            || $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == ''
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
            return;
        }
        else {
            $scope.model.ListCoil = [];

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.RuleCoil);

            var quantityAdd = $scope.modelList.QuantityCoil;
            $scope.modelList.Quantity = $scope.modelList.Quantity;
            for (var i = 0; i < quantityAdd; i++) {

                var addItem = {
                    ProductCode: $scope.modelList.ProductCode,
                    ProductName: $scope.modelList.ProductName,
                    ProductType: $scope.modelList.ProductType,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,

                    SalePrice: $scope.modelList.SalePrice,

                    QuantityIsSet: 0,
                    QuantityNeedSet: $scope.modelList.QuantityNeedSet,
                    ProductCoil: $scope.modelList.ProductCoil,
                    sProductCoil: $scope.modelList.sProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ImpType: $scope.modelList.ImpType,
                    ProductImpType: $scope.modelList.ProductImpType,
                    ValueCoil: $scope.modelList.ValueCoil,
                    UnitCoil: $scope.modelList.UnitCoil,
                    QuantityCoil: $scope.modelList.QuantityCoil,
                    RuleCoil: $scope.modelList.RuleCoil,
                    ProductCoilRelative: $scope.modelList.ProductCoilRelative,
                };
                $scope.model.ListCoil.push(addItem);
            }
        }
    }
    $scope.editItem = function (item, index) {
        $scope.disableProductCode = true;
        $scope.modelUpdate = item;
        $scope.isEdit = true;

        //if (item.ImpType != null && item.ImpType != '' && item.ImpType != undefined) {
        //    var listUnit = item.ImpType.split(',');
        //    if (listUnit.length == 1) {
        //        $scope.isDelete = false;
        //    } else if (listUnit.length > 1) {
        //        $scope.isDelete = true;
        //    }
        //}

        $scope.modelList.ProductCode = item.ProductCode;
        $scope.modelList.ProductType = item.ProductType;
        $scope.modelList.ProductName = item.ProductName;
        //$scope.modelList.ProductQrCode = item.ProductQrCode;
        //$scope.modelList.sProductQrCode = item.sProductQrCode;
        $scope.modelList.Quantity = item.Quantity;
        $scope.modelList.Unit = item.Unit;
        $scope.modelList.UnitName = item.UnitName;
        $scope.modelList.ProductLot = item.ProductLot;
        $scope.modelList.SalePrice = item.SalePrice;
        $scope.modelList.ImpType = item.ImpType;
        //$scope.modelList.PackType = packType;
        $scope.modelList.ProductCoilRelative = item.ProductCoilRelative;
        $scope.model.ListCoil = item.ListCoil;

        var quantityCoil = 0;
        for (var i = 0; i < $scope.model.ListCoil.length; i++) {
            quantityCoil = quantityCoil + $scope.model.ListCoil[i].ValueCoil;
        }
        $scope.modelList.Quantity = quantityCoil;

        if (item.ImpType != '' && item.ImpType != null && item.ImpType != undefined) {
            $scope.listProductType = item.ImpType.split(",");
            if ($scope.listProductType.length > 0) {
                $scope.showCoil = true;
                $scope.modelList.UnitCoil = $scope.listProductType[$scope.listProductType.length - 1];
                if ($scope.listProductType.length == 1) {
                    $scope.disableProductImpType = true;
                    $scope.disableValueCoil = true;
                    $scope.disableUnitCoil = true;
                    //$scope.disableQuantityCoil = true;
                    //$scope.isODD = true;
                    //$scope.isDelete = false;

                    $scope.modelList.ProductImpType = $scope.modelList.UnitCoil;
                    $scope.modelList.ValueCoil = 1;
                    $scope.modelList.QuantityCoil = item.Quantity;
                    $scope.modelList.RuleCoil = 1;
                    $scope.modelList.ProductLot = 1;
                    //if ($scope.model.ListCoil.length == 0)
                    //    $scope.addCoil();
                } else {
                    //$scope.isODD = false;
                    $scope.isDelete = true;
                    $scope.disableProductImpType = false;
                    $scope.disableValueCoil = false;
                    $scope.disableUnitCoil = true;
                    $scope.disableQuantityCoil = false;

                    $scope.modelList.ProductImpType = '';
                    $scope.modelList.ValueCoil = '';
                    $scope.modelList.QuantityCoil = '';
                    $scope.modelList.RuleCoil = '';
                    $scope.modelList.ProductLot = '';
                }
            } else {
                //$scope.isODD = false;
                $scope.showCoil = false;
                //$scope.isDelete = false;
            }
        } else {
            App.toastrError(caption.MIST_VALIDATE_IN_PRODUCT_TYPE);
        }

        $scope.disableFiled(item.ImpType);
    }
    $scope.save = function () {
        if ($scope.model.ListCoil.length == 0) {
            App.toastrError(caption.MIST_VALIDATE_ROLL_BOX_BLANK);
            return;
        }

        $scope.disableProductCode = false;
        $scope.isEdit = false;

        $scope.modelUpdate.ProductCode = $scope.modelList.ProductCode;
        $scope.modelUpdate.ProductType = $scope.modelList.ProductType;
        $scope.modelUpdate.ProductName = $scope.modelList.ProductName;
        //$scope.modelUpdate.ProductQrCode = $scope.modelList.ProductQrCode;
        //$scope.modelUpdate.sProductQrCode = $scope.modelList.sProductQrCode;
        $scope.modelUpdate.Quantity = $scope.modelList.Quantity;
        $scope.modelUpdate.QuantityOrder = $scope.modelList.Quantity - $scope.modelUpdate.QuantityIsSet;//Số lượng cần xếp kho 
        $scope.modelUpdate.Unit = $scope.modelList.Unit;
        $scope.modelUpdate.UnitName = $scope.modelList.UnitName;
        $scope.modelUpdate.ProductLot = $scope.modelList.ProductLot;
        $scope.modelUpdate.SalePrice = $scope.modelList.SalePrice;
        $scope.modelUpdate.ImpType = $scope.modelList.ImpType;
        $scope.modelUpdate.ProductCoilRelative = $scope.modelList.ProductCoilRelative;
        $scope.modelUpdate.ListCoil = $scope.model.ListCoil;
        $scope.modelUpdate.QuantityCoil = $scope.model.ListCoil.length;
        $scope.modelUpdate.sQuantityCoil = $scope.model.ListCoil.length;
        $scope.model.ListCoil = [];
        dataservice.update($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $rootScope.refeshData($rootScope.rootId);
                App.toastrSuccess(caption.COM_UPDATE_SUCCESS);
            }
        });
    }

    $scope.removeItem = function (item, index) {
        if (item.QuantityIsSet > 0) {
            App.toastrError(caption.MIST_SORT_PRODUCT_CANNOT_DELETE);
        }
        else {
            dataservice.checkProductInExpTicket(item.ProductQrCode, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    //Lấy lại giá trị model vừa xóa đưa lên chỗ add
                    $scope.modelList.ProductCode = item.ProductCode;
                    $scope.modelList.ProductType = item.ProductType;
                    $scope.modelList.ProductName = item.ProductName;
                    $scope.modelList.ProductQrCode = item.ProductQrCode;
                    $scope.modelList.sProductQrCode = item.sProductQrCode;
                    $scope.modelList.Quantity = item.Quantity;
                    $scope.modelList.Unit = item.Unit;
                    $scope.modelList.UnitName = item.UnitName;
                    $scope.modelList.SalePrice = item.SalePrice;
                    $scope.modelList.ProductLot = item.ProductLot;

                    //Check xem đã có trong list chưa
                    $scope.model.ListProduct.splice(index, 1);
                    App.toastrSuccess(caption.COM_DELETE_SUCCESS);
                } else {
                    App.toastrError(rs.Title);
                }
            });
        }
    }
    $scope.removeCoil = function (item) {
        if (item.IsOrder) {
            App.toastrError(caption.MIST_SORT_CANNOT_DELETE);
        } else {
            var index = $scope.model.ListCoil.indexOf(item);
            if (index < -1) {
                App.toastrError(caption.MIST_NOT_FOUND_DEL_PRODUCT);
                return;
            }

            $scope.model.ListCoil.splice(index, 1);
            $scope.modelList.Quantity = 0;
            for (var i = 0; i < $scope.model.ListCoil.length; i++) {
                $scope.modelList.Quantity = $scope.modelList.Quantity + (parseFloat(item.ValueCoil));
            }
            App.toastrSuccess(caption.MIST_BTN_SAVE_INFORMATION);
        }
    }
    $scope.changleSelect = function (SelectType, item) {
        //Hàm chọn 1 lô để nhập
        if (SelectType == "LotProductCode") {
            $rootScope.LotProductCode = item.Code;
            $scope.model.Reason = 'IMP_FROM_BUY';
            $scope.model.StoreCodeSend = '';

            dataservice.getLotProduct(item.Code, function (rs) {
                rs = rs.data;
                $scope.model.CusCode = rs.SupCode;
                //$scope.model.CostTotal = rs.CostTotal;
                //$scope.model.TaxTotal = rs.TaxTotal;
                //$scope.model.Discount = rs.Discount;
                //$scope.model.Commission = rs.Commission;
                //$scope.model.TotalMustPayment = rs.TotalMustPayment;
                //$scope.model.Currency = rs.Currency;
                createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);

                $scope.model.ListProduct = rs.ListProduct;
            });

            //Bỏ validate
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                $scope.errorLotProductCode = false;
            }
        }
        if (SelectType == "ProductCode") {
            if ($scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' || $scope.modelList.ProductCode == undefined) {
                $scope.errorProductCode = true;
            } else {
                $scope.errorProductCode = false;
            }
            $scope.model.ListCoil = [];
            $scope.modelList.Unit = item.Unit;
            $scope.modelList.UnitName = item.UnitName;
            $scope.modelList.ProductName = item.Name;
            $scope.modelList.ProductType = item.ProductType;
            $scope.modelList.ImpType = item.ImpType;
            createProductQrCode();
            if (item.ImpType != '' && item.ImpType != null && item.ImpType != undefined) {
                $scope.modelList.Quantity = 0;
                $scope.listProductType = item.ImpType.split(",");
                if ($scope.listProductType.length > 0) {
                    $scope.showCoil = true;
                    $scope.modelList.UnitCoil = $scope.listProductType[$scope.listProductType.length - 1];
                    if ($scope.listProductType.length == 1) {
                        $scope.disableProductImpType = true;
                        $scope.disableValueCoil = true;
                        $scope.disableUnitCoil = true;
                        //$scope.disableQuantityCoil = true;//Phần này cho phép nhập số lượng

                        //$scope.isODD = true;
                        $scope.modelList.ProductImpType = $scope.modelList.UnitCoil;
                        $scope.modelList.ValueCoil = 1;
                        $scope.modelList.QuantityCoil = 1;
                        $scope.modelList.RuleCoil = 1;
                        $scope.modelList.ProductLot = 1;
                        //if ($scope.model.ListCoil.length == 0) {
                        //    $scope.modelList.Quantity = 0;
                        //    $scope.addCoil();
                        //}

                        //Kiểm tra giá trị có null hay không
                        //if ($scope.modelList.Quantity == null || $scope.modelList.Quantity == '' || $scope.modelList.Quantity == undefined) {
                        //    $scope.errorQuantity = true;
                        //} else {
                        //    $scope.errorQuantity = false;
                        //}
                    } else {
                        $scope.disableProductImpType = false;
                        $scope.disableValueCoil = false;
                        $scope.disableUnitCoil = true;
                        $scope.disableQuantityCoil = false;

                        $scope.modelList.ProductImpType = '';
                        $scope.modelList.ValueCoil = '';
                        $scope.modelList.QuantityCoil = '';
                        $scope.modelList.RuleCoil = '';
                        $scope.modelList.ProductLot = '';
                        //$scope.isODD = false;
                    }
                } else {
                    //$scope.isODD = false;
                    $scope.showCoil = false;
                }
            } else {
                App.toastrError(caption.MIST_VALIDATE_IN_PRODUCT_TYPE);
            }

            $scope.disableFiled(item.ImpType);

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.sProductCoil);
        }
        if (SelectType == "ProductRelative") {
            $scope.chooseCoilInStore = true;
            var check = $scope.listProduct.filter(k => k.Code === item.ProductCode);
            if (check.length == 1) {
                $scope.modelList.ProductCode = item.ProductCode;
                $scope.modelList.SalePrice = item.SalePrice;
                $scope.modelList.Quantity = item.Quantity;
                $scope.modelList.Unit = check[0].Unit;
                $scope.modelList.UnitName = check[0].UnitName;
                $scope.modelList.ProductName = check[0].Name;
                $scope.modelList.ProductType = check[0].ProductType;
                $scope.modelList.ImpType = check[0].ImpType;
                $scope.modelList.ProductLot = item.ProductLot;
                validationProduct($scope.modelList);
                createProductQrCode();
            }

            //var listRelative = $scope.listProductRelative.filter(k => k.CoilRelative === item.Code);
            //var no = listRelative.length + 1;
            //$scope.modelList.ProductCoil = item.Code + "_" + no;

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.sProductCoil);
        }
        if (SelectType == "StoreCode") {
            if ($scope.model.StoreCodeSend == $scope.model.StoreCode) {
                $scope.model.StoreCodeSend = '';
                App.toastrError(caption.MIS_MSG_OTHER_IMPORT_WAREHOUSE_TRANSFER);
            }
            createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);
            //$scope.model.ListProduct = [];
            //$scope.modelList = {
            //    ProductCode: '',
            //    ProductName: '',
            //    ProductQrCode: '',
            //    sProductQrCode: '',
            //    Quantity: null,
            //    Unit: '',
            //    UnitName: '',
            //    SalePrice: null,
            //    TaxRate: 10,
            //    Discount: 0,
            //    Commission: 0,
            //};
            if ($scope.model.StoreCode != undefined && $scope.model.StoreCode != null && $scope.model.StoreCode != '') {
                $scope.errorStoreCode = false;
            }
        }
        if (SelectType == "Reason") {
            if ($scope.model.Reason != undefined && $scope.model.Reason != null && $scope.model.Reason != '') {
                $scope.errorReason = false;
            }
            if ($scope.model.Reason == 'IMP_FROM_BUY') {
                $scope.model.StoreCodeSend = '';
            }
            else {
                $scope.model.CusCode = '';
            }
        }
        if (SelectType == "StoreCodeSend") {
            if ($scope.model.StoreCodeSend == $scope.model.StoreCode) {
                $scope.model.StoreCodeSend = '';
                App.toastrError(caption.MIS_MSG_OTHER_IMPORT_WAREHOUSE_TRANSFER);
            }
            if ($scope.model.StoreCodeSend != undefined && $scope.model.StoreCodeSend != null && $scope.model.StoreCodeSend != '') {
                $scope.errorStoreCodeSend = false;
            }
        }
        if (SelectType == "UserImport") {
            createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);
            if ($scope.model.UserImport != undefined && $scope.model.UserImport != null && $scope.model.UserImport != '') {
                $scope.errorUserImport = false;
            }
        }
    }
    $scope.changeCoil = function () {
        createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.sProductCoil);
    }
    $scope.change = function (type) {
        switch (type) {
            //Quy cách
            case 'ruleCoil':
                createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.RuleCoil);
                break;
            case 'quantity':
                if ($scope.modelList.Quantity == null || $scope.modelList.Quantity == '' || $scope.modelList.Quantity == undefined) {
                    $scope.errorQuantity = true;
                } else {
                    $scope.errorQuantity = false;
                }
                break;
            case 'price':
                if ($scope.modelList.SalePrice == null || $scope.modelList.SalePrice == '' || $scope.modelList.SalePrice == undefined) {
                    $scope.errorSalePrice = true;
                } else {
                    $scope.errorSalePrice = false;
                }
                break;
            default:
        }
    }
    $scope.changeTilte = function () {
        if ($scope.model.Title != undefined && $scope.model.Title != null && $scope.model.Title != '') {
            $scope.errorTitle = false;
        } else {
            $scope.errorTitle = true;
        }

    }
    $scope.openLog = function () {
        dataservice.getUpdateLog($scope.model.TicketCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/showLog.html',
                controller: 'showLog',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () { });
        });
    }
    $scope.showAddCoil = function (item, index) {
        var objPara = {
            item: item,
            rootId: $rootScope.rootId,
            productName: item.ProductName,
            ticketCode: $scope.model.TicketCode,
            model: $scope.model
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/showAddCoil.html',
            controller: 'showAddCoil',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        objPara
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initLoad();
        }, function () {
        });
    }
    $scope.showListCoil = function () {
        if ($scope.isShow == true) {
            $scope.isShow = false;
            $scope.isShowListCoil = true;
        }
        else {
            $scope.isShow = true;
            $scope.isShowListCoil = false;
        }
    }

    //Xử lý phần disable khi danh mục sản phẩm có hình thức nhập là cuộn, thùng
    $scope.disableFiled = function (type) {

        if (type != "Thùng" && type != "Cuộn") {
            $scope.disableProductCoil = true;
            $scope.disableProductRelative = true;
            $scope.disableListCoil = true;
        } else {
            $scope.disableProductCoil = false;
            $scope.disableProductRelative = false;
            $scope.disableListCoil = false;
            $scope.allowAddCoil = true;
        }
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        //if ($scope.model.ListProduct.length == 0) {
        //    App.toastrError(caption.MIS_MSG_CHOSE_PRODUCT_IMPORT);
        //    return;
        //}
        //if ($scope.model.TotalPayed == undefined || $scope.model.TotalPayed == null) {
        //    App.toastrError('Nhập số tiền đã trả');
        //    return;
        //}
        //if ($scope.model.TotalMustPayment < $scope.model.TotalPayed) {
        //    App.toastrError('Nhập lại số tiền đã trả');
        //    return;
        //}
        //var chkMapping = false;
        //angular.forEach($scope.model.ListProduct, function (value, key) {
        //    if (value.Quantity < value.QuantityIsSet) {
        //        chkMapping = true;
        //        value.Message = "Số lượng điều chỉnh không được nhỏ hơn số lượng đã xếp kho";
        //    }
        //})
        //if (chkMapping == true) {
        //    App.toastrError("Số lượng sản phẩm không được nhỏ hơn số lượng đã xếp kho");
        //    return;
        //}
        //if ($scope.IsEnabledImportLot == true) {
        //    var chk = false;
        //    var countQuantity = 0;
        //    angular.forEach($scope.model.ListProduct, function (value, key) {
        //        countQuantity = countQuantity + value.Quantity;
        //        if (value.Quantity > value.QuantityOrder) {
        //            chk = true;
        //            value.Message = caption.MIS_MSG_AMOUNT_EXCEED;
        //            //Số lượng vượt mức cho phép
        //            //return;
        //        }
        //        if (value.Quantity < value.QuantityIsSet) {
        //            chk = true;
        //            value.Message = "Số lượng điều chỉnh không được nhỏ hơn số lượng đã xếp kho";
        //            //Số lượng vượt mức cho phép
        //            //return;
        //        }
        //        if (value.Quantity < 0 || value.Quantity == undefined || value.Quantity == null) {
        //            chk = true;
        //            value.Message = caption.MIS_MSG_AMOUNT_SOUNT;
        //            //'Số lượng âm'
        //            //return;
        //        }
        //    })
        //    if (chk == true) {
        //        App.toastrError(caption.MIS_MSG_ENTER_PRODUCT_IMPORT_EXCEED_OR_AMOUNT_SOUNT);
        //        return;
        //    }
        //    if (countQuantity == 0) {
        //        App.toastrError(caption.MIS_MSG_CHOSE_PRODUCT_AMOUNT_ZERO);
        //        return;
        //    }
        //}
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            } else {
                dataservice.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        $scope.isDisable = true;
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }

    $rootScope.reloadData = function () {
        if ($rootScope.rootId != null && $rootScope.rootId != undefined && $rootScope.rootId != '') {
            var id = parseFloat($rootScope.rootId);
            dataservice.getItem(id, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = rs.Object.Header;
                    $scope.model.ListProduct = rs.Object.ListProduct;
                    $scope.model.ListCoil = [];
                    for (var i = 0; i < $scope.model.ListProduct.length; i++) {
                        if ($scope.model.ListProduct[i].ListCoil.length > 0) {
                            for (var j = 0; j < $scope.model.ListProduct[i].ListCoil.length; j++) {
                                $scope.model.ListProduct[i].ListCoil[j].ValueCoil = $scope.model.ListProduct[i].ListCoil[j].Size;

                                var productCoil = $scope.model.ListProduct[i].ListCoil[j].ProductCoil;
                                $scope.model.ListProduct[i].ListCoil[j].RuleCoil = productCoil.split("_")[productCoil.split("_").length - 2];
                            }
                        }
                        $scope.model.ListProduct[i].sQuantityCoil = $scope.model.ListProduct[i].ListCoil.length;
                        $scope.model.ListProduct[i].QuantityOrder = $scope.model.ListProduct[i].Quantity - $scope.model.ListProduct[i].QuantityIsSet;
                    }
                    $rootScope.storeCode = $scope.model.StoreCode;
                    if ($scope.model.LotProductCode != '') {
                        $scope.IsEnabledImportLot = true;
                        $rootScope.IsEnabledImportLot = true;

                        dataservice.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {
                            rs = rs.data;
                            $scope.listLotProduct = rs;
                        });
                    }
                    else {
                        dataservice.getListLotProduct(function (rs) {
                            rs = rs.data;
                            $scope.listLotProduct = rs;
                        });
                    }

                    createCoilCode("", "", "");
                }
            });
        }
    }
    $rootScope.updateOrderItemCoil = function (id) {
        var item = $scope.model.ListCoil.find(function (element) {
            if (element.Id == id) return true;
        });
        if (item) {
            if (item.IsOrder == false) {
                item.IsOrder = true;
            } else {
                item.IsOrder = false;
            }
        }
    }
    $scope.orderingItemCoil = function (item) {
        //var item = $scope.model.ListCoil[index];
        if (item != null) {
            dataservice.checkProductInStoreCoil(item.ProductQrCode, item.ProductCoil, function (rs) {
                rs = rs.data;
                if (rs) {
                    var getStore = $scope.listStore.find(function (element) {
                        if (element.Code == $scope.model.StoreCode) return true;
                    });
                    var objPara = {
                        item: item,
                        rootId: $rootScope.rootId,
                        productName: item.ProductName,
                        productCoil: item.ProductCoil,
                        storeName: getStore ? getStore.Name : ''
                    }

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/orderProduct.html',
                        controller: 'orderProduct',
                        backdrop: 'static',
                        size: '70',
                        resolve: {
                            para: function () {
                                return {
                                    objPara
                                };
                            }
                        }
                    });
                    modalInstance.result.then(function (id) {
                        //$rootScope.reloadData();
                        $rootScope.refeshData(id);
                    }, function () {
                    });
                } else {
                    App.toastrError(caption.MIS_MSG_PRODUCT_NON_ADD_REQUEST_CHOSE_ADD);
                }
            });
        } else {
            App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
    }
    $scope.orderingItem = function (index) {
        var item = $scope.model.ListProduct[index];
        for (var i = 0; i < item.ListCoil.length; i++) {
            if (item.ListCoil[i].Id == undefined) {
                App.toastrError(caption.MIST_LIST_ROLL_BOX_SAVE);
                return;
            }
        }
        if (item != null) {
            dataservice.checkProductInStore(item.ProductQrCode, function (rs) {
                rs = rs.data;
                debugger
                if (rs) {
                    var getStore = $scope.listStore.find(function (element) {
                        if (element.Code == $scope.model.StoreCode) return true;
                    });
                    var objPara = {
                        item: item,
                        rootId: $rootScope.rootId,
                        productName: item.ProductName,
                        productCoil: '',
                        storeName: getStore ? getStore.Name : ''
                    }
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/orderProduct.html',
                        controller: 'orderProduct',
                        backdrop: 'static',
                        size: '70',
                        resolve: {
                            para: function () {
                                return {
                                    objPara
                                };
                            }
                        }
                    });
                    modalInstance.result.then(function (id) {
                        $scope.initLoad();
                    }, function () {
                    });
                } else {
                    App.toastrError(caption.MIS_MSG_PRODUCT_NON_ADD_REQUEST_CHOSE_ADD);
                }
            });
        } else {
            App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
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
    function createTicketCode(lot, store, user) {

    }
    function createProductQrCode() {
        var today = moment().format('DDMMYYYY-HHmm');
        //$scope.modelList.ProductQrCode = "LE_SP." + $scope.modelList.ProductCode + "_SL." + $scope.modelList.Quantity + "_T." + today;
        $scope.modelList.ProductQrCode = $scope.modelList.ProductCode + "_SL." + $scope.modelList.Quantity + "_T." + today;
        dataservice.generatorQRCode($scope.modelList.ProductQrCode, function (result) {
            result = result.data;
            $scope.modelList.sProductQrCode = result;
        });
    }
    function createCoilCode(productCode, lot, rule) {
        if (productCode == "" || productCode == undefined || productCode == null)
            productCode = "";

        if (lot == "" || lot == undefined || lot == null)
            lot = "";

        if (rule == "" || rule == undefined || rule == null)
            rule = "";

        var no = 1;
        $scope.modelList.ProductCoil = $scope.model.TicketCode + "_" + productCode + "_" + rule + "_";
    }
    function validationProduct(data) {
        var mess = { Status: false, Title: "" }
        //Check null lô hàng khi chọn nhập theo lô
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '') {
            $scope.errorProductCode = true;
            mess.Status = true;
            mess.Title = caption.MIS_VALIDATE_CHOOSE_PRODUCT;
        } else {
            $scope.errorProductCode = false;
        }
        if ($scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == '') {
            $scope.errorQuantity = true;
            mess.Status = true;
            if (mess.Title != "")
                mess.Title = mess.Title + "</br>caption.MIS_VALIDATE_ENTER_VALUE";
            else
                mess.Title = caption.MIS_VALIDATE_ENTER_VALUE;
        } else {
            $scope.errorQuantity = false;
        }
        if ($scope.modelList.SalePrice == undefined || $scope.modelList.SalePrice == null || $scope.modelList.SalePrice == '') {
            $scope.errorSalePrice = true;
            mess.Status = true;
            if (mess.Title != "")
                mess.Title = mess.Title + "</br>caption.MIS_VALIDATE_ENTER_PRICE";
            else
                mess.Title = caption.MIS_VALIDATE_ENTER_PRICE;
        } else {
            $scope.errorSalePrice = false;
        }
        return mess;
    }
    function validationProductCoil(data) {
        var mess = { Status: false, Title: "" }
        if ($scope.modelList.ProductCoil == undefined || $scope.modelList.ProductCoil == null || $scope.modelList.ProductCoil == '') {
            $scope.errorProductCoil = true;
            mess.Status = true;
            if (mess.Title != "")
                mess.Title = mess.Title + "</br>MIST_VALDIATE_ADD_ROLL_BOX";
            else
                mess.Title = caption.MIST_VALDIATE_ADD_ROLL_BOX;
        } else {
            $scope.errorProductCoil = false;
        }

        return mess;
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null lô hàng khi chọn nhập theo lô
        if ($scope.IsEnabledImportLot == true && (data.LotProductCode == undefined || data.LotProductCode == null || data.LotProductCode == '')) {
            $scope.errorLotProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorLotProductCode = false;
        }

        //Check null kho hàng
        if (data.StoreCode == undefined || data.StoreCode == null || data.StoreCode == '') {
            $scope.errorStoreCode = true;
            mess.Status = true;
        } else {
            $scope.errorStoreCode = false;
        }

        //Check null lý do
        if (data.Reason == undefined || data.Reason == null || data.Reason == '') {
            $scope.errorReason = true;
            mess.Status = true;
        } else {
            $scope.errorReason = false;
        }

        //Check null kho chuyển đến
        if ($scope.model.Reason == 'IMP_FROM_MOVE_STORE' && (data.StoreCodeSend == undefined || data.StoreCodeSend == null || data.StoreCodeSend == '')) {
            $scope.errorStoreCodeSend = true;
            mess.Status = true;
        } else {
            $scope.errorStoreCodeSend = false;
        }

        //Check null nhân viên nhập
        if (data.UserImport == undefined || data.UserImport == null || data.UserImport == '') {
            $scope.errorUserImport = true;
            mess.Status = true;
        } else {
            $scope.errorUserImport = false;
        }

        //Check title
        if (data.Title == undefined || data.Title == null || data.Title == '') {
            $scope.errorTitle = true;
            mess.Status = true;
        } else {
            $scope.errorTitle = false;
        }

        return mess;
    };
    function loadDate() {
        //$("#NextTimePayment").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //});
        $("#InsurantTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#TimeTicketCreate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //var today = new Date(new Date());
        //$('#TimeTicketCreate').datepicker('setStartDate', today);
        //$('#TimeTicketCreate').datepicker('setEndDate', today);
        //$('#NextTimePayment').datepicker('setStartDate', today);
        //$('#InsurantTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }

    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        loadDate();
        loadPoper();
    }, 200);

    $scope.export = function () {
        location.href = "/Admin/MaterialImpStore/ExportExcelProduct?"
            + "ticketCode=" + $scope.model.TicketCode
    }
});

app.controller('showAddCoil', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $uibModalInstance, para, $filter) {
    $scope.isDisable = false;
    $scope.isEdit = false;
    $scope.IsEnabledImportLot = false;
    $scope.modelDisable = true;
    $scope.isDelete = true;

    $scope.modelUpdate = {};
    $scope.disableProductCode = false;
    $scope.disableProductCoil = false;
    $scope.disableProductRelative = false;
    $scope.disableListCoil = false;
    $scope.isCoil = true;
    $scope.allowAddCoil = false;
    $scope.isShowListCoil = true;
    $scope.isShow = true;
    $scope.showCoil = true;

    $scope.listProductType = [];
    $scope.isShowListCoil = true;
    $scope.isShow = true;
    $scope.isInsertCoil = false;

    $scope.listProductRelative = [];
    $scope.chooseCoilInStore = false;
    $scope.quantityCheck = 0;
    $scope.quantityLimit = 0;
    $scope.model = {
        Title: '',
        StoreCode: '',
        CusCode: '',
        Reason: 'IMP_FROM_BUY',
        StoreCodeSend: '',
        Currency: 'CURRENCY_VND',
        PaymentStatus: '',
        UserImport: '',
        Note: '',
        UserSend: '',
        InsurantTime: '',
        LotProductCode: '',
        TicketCode: para.objPara.ticketCode,
        TimeTicketCreate: $filter('date')(new Date(), 'dd/MM/yyyy'),
        ListProduct: [],
        ListCoil: []
    }
    $scope.modelList = {
        ProductCode: '',
        ProductName: '',
        ProductQrCode: '',
        sProductQrCode: '',
        QuantityOrder: null,
        Quantity: null,
        Unit: '',
        UnitName: '',
        SalePrice: null,
        ImpType: '',
        ListCoil: []
    };

    $scope.cancel = function () {
        $uibModalInstance.close('');
        $rootScope.refeshData($rootScope.rootId);
    }
    $scope.addCoil = function () {
        //Check null
        if ($scope.modelList.ValueCoil == undefined || $scope.modelList.ValueCoil == null || $scope.modelList.ValueCoil == '' ||
            $scope.modelList.QuantityCoil == undefined || $scope.modelList.QuantityCoil == null || $scope.modelList.QuantityCoil == ''
            || $scope.modelList.RuleCoil == undefined || $scope.modelList.RuleCoil == null || $scope.modelList.RuleCoil == ''
            || $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == ''
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
        }
        else {
            var indexCheck = -1;
            if (indexCheck > -1) {
                App.toastrError(caption.MES_MSG_PRODUCT_ADD_CATEGORY);
            }
            else {
                $scope.modelList.QuantityCoil = parseInt($scope.modelList.QuantityCoil);
                if ($scope.modelList.QuantityCoil > 100) {
                    App.toastrError(caption.MIST_VALIDATE_ADD_LIMIT100);
                    return;
                }

                createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.RuleCoil);
                var quantityAdd = $scope.modelList.QuantityCoil;
                $scope.quantityCheck = $scope.quantityCheck + (quantityAdd * parseFloat($scope.modelList.ValueCoil));
                if ($scope.quantityLimit < $scope.quantityCheck) {
                    $scope.quantityCheck = $scope.quantityCheck - (quantityAdd * parseFloat($scope.modelList.ValueCoil));
                    App.toastrError(caption.MIS_MSG_AMOUNT_EXCEED1);
                    $scope.isInsertCoil = false;
                    return;
                }
                for (var i = 0; i < quantityAdd; i++) {
                    var addItem = {
                        ProductCode: $scope.modelList.ProductCode,
                        ProductName: $scope.modelList.ProductName,
                        ProductType: $scope.modelList.ProductType,
                        ProductQrCode: $scope.modelList.ProductQrCode,
                        //sProductQrCode: $scope.modelList.sProductQrCode,
                        Quantity: $scope.modelList.Quantity,
                        Unit: $scope.modelList.Unit,
                        UnitName: $scope.modelList.UnitName,

                        SalePrice: $scope.modelList.SalePrice,

                        QuantityIsSet: 0,
                        QuantityNeedSet: $scope.modelList.QuantityNeedSet,

                        ProductCoil: $scope.modelList.ProductCoil,
                        sProductCoil: $scope.modelList.sProductCoil,
                        ProductLot: $scope.modelList.ProductLot,
                        ImpType: $scope.modelList.ImpType,
                        ProductImpType: $scope.modelList.ProductImpType,
                        ValueCoil: $scope.modelList.ValueCoil,
                        UnitCoil: $scope.modelList.UnitCoil,
                        QuantityCoil: $scope.modelList.QuantityCoil,
                        RuleCoil: $scope.modelList.RuleCoil,
                        ProductCoilRelative: $scope.modelList.ProductCoilRelative,
                        IsOrder: false,
                    };
                    $scope.model.ListCoil.push(addItem);
                    $scope.modelList.Quantity = $scope.modelList.Quantity + $scope.modelList.ValueCoil;
                    $scope.isInsertCoil = true;
                }

                if ($scope.isInsertCoil) {
                    App.toastrSuccess(caption.COM_ADD_SUCCESS);
                }
            }
        }
    }
    $scope.initItem = function (item) {
        $scope.disableProductCode = true;
        $scope.modelUpdate = item;
        $scope.isEdit = true;
        $scope.modelList.ProductCode = item.ProductCode;
        $scope.modelList.ProductType = item.ProductType;
        $scope.modelList.ProductName = item.ProductName;
        //$scope.modelList.ProductQrCode = item.ProductQrCode;
        //$scope.modelList.sProductQrCode = item.sProductQrCode;
        $scope.modelList.Quantity = item.Quantity;
        $scope.modelList.QuantityPoCount = item.QuantityPoCount;
        $scope.modelList.QuantityNeedSet = item.QuantityNeedSet;
        $scope.modelList.Unit = item.Unit;
        $scope.modelList.UnitName = item.UnitName;
        $scope.modelList.ProductLot = item.ProductLot;
        $scope.modelList.SalePrice = item.SalePrice;
        $scope.modelList.ImpType = item.ImpType;
        //$scope.modelList.PackType = packType;
        $scope.modelList.ProductCoilRelative = item.ProductCoilRelative;
        $scope.model.ListCoil = item.ListCoil;

        var quantityCoil = 0;
        $scope.quantityLimit = $scope.modelList.QuantityNeedSet;
        for (var i = 0; i < $scope.model.ListCoil.length; i++) {
            $scope.quantityLimit = $scope.quantityLimit + $scope.model.ListCoil[i].ValueCoil;
            $scope.quantityCheck = $scope.quantityCheck + $scope.model.ListCoil[i].ValueCoil;
            quantityCoil = quantityCoil + $scope.model.ListCoil[i].ValueCoil;
        }

        if (quantityCoil < $scope.modelList.Quantity)
            $scope.modelList.Quantity = quantityCoil;

        if (item.ImpType != '' && item.ImpType != null && item.ImpType != undefined) {
            $scope.listProductType = item.ImpType.split(",");
            if ($scope.listProductType.length > 0) {
                $scope.showCoil = true;
                $scope.modelList.UnitCoil = $scope.listProductType[$scope.listProductType.length - 1];
                if ($scope.listProductType.length == 1) {
                    $scope.disableProductImpType = true;
                    $scope.disableValueCoil = true;
                    $scope.disableUnitCoil = true;
                    //$scope.disableQuantityCoil = true;
                    //$scope.isODD = true;
                    //$scope.isDelete = false;

                    $scope.modelList.ProductImpType = $scope.modelList.UnitCoil;
                    $scope.modelList.ValueCoil = 1;
                    $scope.modelList.QuantityCoil = item.Quantity;
                    $scope.modelList.RuleCoil = 1;
                    $scope.modelList.ProductLot = 1;
                    //if ($scope.model.ListCoil.length == 0)
                    //    $scope.addCoil();
                } else {
                    //$scope.isODD = false;
                    $scope.isDelete = true;
                    $scope.disableProductImpType = false;
                    $scope.disableValueCoil = false;
                    $scope.disableUnitCoil = true;
                    $scope.disableQuantityCoil = false;

                    $scope.modelList.ProductImpType = '';
                    $scope.modelList.ValueCoil = '';
                    $scope.modelList.QuantityCoil = '';
                    $scope.modelList.RuleCoil = '';
                    $scope.modelList.ProductLot = '';
                }
            } else {
                //$scope.isODD = false;
                $scope.showCoil = false;
                //$scope.isDelete = false;
            }
        } else {
            App.toastrError(caption.MIST_VALIDATE_IN_PRODUCT_TYPE);
        }

        $scope.disableFiled(item.ImpType);
    }
    //Xử lý phần disable khi danh mục sản phẩm có hình thức nhập là cuộn, thùng
    $scope.disableFiled = function (type) {
        if (type != "Thùng" && type != "Cuộn") {
            $scope.disableProductCoil = true;
            $scope.disableProductRelative = true;
            $scope.disableListCoil = true;
        } else {
            $scope.disableProductCoil = false;
            $scope.disableProductRelative = false;
            $scope.disableListCoil = false;
            $scope.allowAddCoil = true;
        }
    }
    $scope.initLoad = function () {
        $scope.modelList = para.objPara.item;
        $scope.model = para.objPara.model;
        dataservice.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
        dataservice.getListProductRelative(function (rs) {
            rs = rs.data;
            $scope.listProductRelative = rs;
        });

        createCoilCode("", "", "");

        $scope.initItem(para.objPara.item);
    }
    $scope.initLoad();

    $scope.add = function () {
        var msg = validationProduct($scope.modelList);
        if (msg.Status) {
            //App.toastrError(msg.Title);
            return;
        }
        if ($scope.model.ListCoil.length == 0) {
            App.toastrError(caption.MIST_VALIDATE_ROLL_BOX_BLANK);
            return;
        }
        //Check null
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' ||
            $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
            || $scope.modelList.SalePrice == undefined || $scope.modelList.SalePrice == null || $scope.modelList.SalePrice == ''
            //|| $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
        }
        else {
            var indexCheck = -1;
            var elementCheck = $scope.model.ListProduct.find(function (element) {
                if (element.ProductCode == $scope.modelList.ProductCode && element.ProductType == $scope.modelList.ProductType && element.ProductCoil == $scope.modelList.ProductCoil) {
                    indexCheck = 0;
                    return element;
                }
            });
            if (indexCheck > -1) {
                App.toastrError(caption.MES_MSG_PRODUCT_ADD_CATEGORY);
            }
            else {

                //Tạo QrCode cho sản phẩm
                createProductQrCode();
                var addItem = {
                    ProductCode: $scope.modelList.ProductCode,
                    ProductName: $scope.modelList.ProductName,
                    ProductType: $scope.modelList.ProductType,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    sProductQrCode: $scope.modelList.sProductQrCode,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,

                    SalePrice: $scope.modelList.SalePrice,

                    QuantityIsSet: 0,
                    QuantityNeedSet: $scope.modelList.QuantityNeedSet,

                    //TaxRate: $scope.modelList.TaxRate,
                    //Discount: $scope.modelList.Discount,
                    //Commission: $scope.modelList.Commission,
                    ProductCoil: $scope.modelList.ProductCoil,
                    sProductCoil: $scope.modelList.sProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ImpType: $scope.modelList.ImpType,
                    ImpType: $scope.modelList.ImpType,
                    ProductCoilRelative: $scope.modelList.ProductCoilRelative,
                    ////Tính toán
                    Total: $scope.modelList.Quantity * $scope.modelList.SalePrice,
                    //TaxTotal: ($scope.modelList.Quantity * $scope.modelList.SalePrice) * $scope.modelList.TaxRate / 100,
                    //DiscountTotal: ($scope.modelList.Quantity * $scope.modelList.SalePrice) * $scope.modelList.Discount / 100,
                    //CommissionTotal: ($scope.modelList.Quantity * $scope.modelList.SalePrice) * $scope.modelList.Commission / 100,
                    ListCoil: $scope.model.ListCoil,
                    QuantityCoil: $scope.model.ListCoil.length,
                    sQuantityCoil: $scope.model.ListCoil.length,
                    //PackType: packType
                };
                $scope.model.ListProduct.push(addItem);
            }
        }
    }
    $scope.editItem = function (item, index) {
        $scope.disableProductCode = true;
        $scope.modelUpdate = item;
        $scope.isEdit = true;
        $scope.modelList.ProductCode = item.ProductCode;
        $scope.modelList.ProductType = item.ProductType;
        $scope.modelList.ProductName = item.ProductName;
        //$scope.modelList.ProductQrCode = item.ProductQrCode;
        //$scope.modelList.sProductQrCode = item.sProductQrCode;
        $scope.modelList.Quantity = item.Quantity;
        $scope.modelList.QuantityPoCount = item.QuantityPoCount;
        $scope.modelList.QuantityNeedSet = item.QuantityNeedSet;
        $scope.modelList.Unit = item.Unit;
        $scope.modelList.UnitName = item.UnitName;
        $scope.modelList.ProductLot = item.ProductLot;
        $scope.modelList.SalePrice = item.SalePrice;
        $scope.modelList.ImpType = item.ImpType;
        $scope.modelList.ProductCoilRelative = item.ProductCoilRelative;
        $scope.model.ListCoil = item.ListCoil;

        var quantityCoil = 0;
        for (var i = 0; i < $scope.model.ListCoil.length; i++) {
            quantityCoil = quantityCoil + $scope.model.ListCoil[i].ValueCoil;
        }
        if (quantityCoil < $scope.modelList.Quantity)
            $scope.modelList.Quantity = quantityCoil;

        $scope.disableFiled(item.ImpType);
    }
    $scope.save = function () {
        if ($scope.model.ListCoil.length == 0) {
            App.toastrError(caption.MIST_VALIDATE_ROLL_BOX_BLANK);
            return;
        }
        //$scope.disableProductCode = false;
        $scope.isEdit = false;

        var msg = validationProduct($scope.modelList);
        if (msg.Status) {
            return;
        }
        //Check null
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' ||
            $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
            || $scope.modelList.SalePrice == undefined || $scope.modelList.SalePrice == null || $scope.modelList.SalePrice == ''
            //|| $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
        }

        $scope.modelUpdate.ProductCode = $scope.modelList.ProductCode;
        $scope.modelUpdate.ProductType = $scope.modelList.ProductType;
        $scope.modelUpdate.ProductName = $scope.modelList.ProductName;
        //$scope.modelUpdate.ProductQrCode = $scope.modelList.ProductQrCode;
        //$scope.modelUpdate.sProductQrCode = $scope.modelList.sProductQrCode;
        $scope.modelUpdate.Quantity = $scope.modelList.Quantity;
        $scope.modelUpdate.QuantityPoCount = $scope.modelList.QuantityPoCount;
        $scope.modelUpdate.QuantityNeedSet = $scope.modelList.QuantityNeedSet;
        $scope.modelUpdate.Unit = $scope.modelList.Unit;
        $scope.modelUpdate.UnitName = $scope.modelList.UnitName;
        $scope.modelUpdate.ProductLot = $scope.modelList.ProductLot;
        $scope.modelUpdate.SalePrice = $scope.modelList.SalePrice;
        $scope.modelUpdate.ImpType = $scope.modelList.ImpType;
        //$scope.modelUpdate.PackType = packType;
        $scope.modelUpdate.ProductCoilRelative = $scope.modelList.ProductCoilRelative;
        $scope.modelUpdate.ListCoil = $scope.model.ListCoil;
        $scope.modelUpdate.QuantityCoil = $scope.model.ListCoil.length;
        $scope.modelUpdate.sQuantityCoil = $scope.model.ListCoil.length;
        dataservice.update($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(caption.COM_UPDATE_SUCCESS);
                $rootScope.refeshData($rootScope.rootId);
                dataservice.getListCoilByProdQrCode($scope.model.TicketCode, $scope.modelUpdate.ProductQrCode, function (rs) {
                    rs = rs.data;
                    if (!rs.Error) {
                        if (rs.Object.ListCoil != null && rs.Object.ListCoil.length > 0) {
                            $scope.model.ListCoil = rs.Object.ListCoil;
                            if ($scope.model.ListCoil.length > 0) {
                                for (var j = 0; j < $scope.model.ListCoil.length; j++) {
                                    $scope.model.ListCoil[j].ValueCoil = $scope.model.ListCoil[j].Size;

                                    var productCoil = $scope.model.ListCoil[j].ProductCoil;
                                    $scope.model.ListCoil[j].RuleCoil = productCoil.split("_")[productCoil.split("_").length - 2];
                                }
                            }
                        }
                    }
                });
            }
        });

        //$uibModalInstance.dismiss('cancel');
    }
    $scope.saveCoil = function () {
        //Kiểm tra xem sản phẩm này được xếp kho chưa nếu save thì không thay đổi được quy cách
        dataservice.checkProductCoilOrderingStore($scope.modelList.ProductQrCode, function (rs) {
            rs = rs.data;
            if (rs) {
                App.toastrError(caption.MIST_SORT_PRODUCT_CANNOT_EDIT);
                return;
            }
        });

        //Check null
        if ($scope.modelList.ValueCoil == undefined || $scope.modelList.ValueCoil == null || $scope.modelList.ValueCoil == '' ||
            $scope.modelList.QuantityCoil == undefined || $scope.modelList.QuantityCoil == null || $scope.modelList.QuantityCoil == ''
            || $scope.modelList.RuleCoil == undefined || $scope.modelList.RuleCoil == null || $scope.modelList.RuleCoil == ''
            || $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == ''
        ) {
            App.toastrError(caption.MIST_VALIDATE_REQUIRE_INFORMATION);
            return;
        }
        else {
            $scope.modelList.QuantityCoil = parseInt($scope.modelList.QuantityCoil);
            $scope.model.ListCoil = [];

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.RuleCoil);

            var quantityAdd = $scope.modelList.QuantityCoil;
            $scope.modelList.Quantity = $scope.modelList.Quantity;
            for (var i = 0; i < quantityAdd; i++) {

                var addItem = {
                    ProductCode: $scope.modelList.ProductCode,
                    ProductName: $scope.modelList.ProductName,
                    ProductType: $scope.modelList.ProductType,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,

                    SalePrice: $scope.modelList.SalePrice,

                    QuantityIsSet: 0,
                    QuantityNeedSet: $scope.modelList.QuantityNeedSet,
                    ProductCoil: $scope.modelList.ProductCoil,
                    sProductCoil: $scope.modelList.sProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ImpType: $scope.modelList.ImpType,
                    ProductImpType: $scope.modelList.ProductImpType,
                    ValueCoil: $scope.modelList.ValueCoil,
                    UnitCoil: $scope.modelList.UnitCoil,
                    QuantityCoil: $scope.modelList.QuantityCoil,
                    RuleCoil: $scope.modelList.RuleCoil,
                    ProductCoilRelative: $scope.modelList.ProductCoilRelative,
                };
                $scope.model.ListCoil.push(addItem);
            }
        }
    }
    $scope.removeItem = function (item, index) {
        if (item.IsOrder) {
            App.toastrError(caption.MIST_SORT_PRODUCT_CANNOT_DELETE);
        }
        else {
            dataservice.checkProductInExpTicket(item.ProductQrCode, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    //Lấy lại giá trị model vừa xóa đưa lên chỗ add
                    $scope.modelList.ProductCode = item.ProductCode;
                    $scope.modelList.ProductType = item.ProductType;
                    $scope.modelList.ProductName = item.ProductName;
                    $scope.modelList.ProductQrCode = item.ProductQrCode;
                    $scope.modelList.sProductQrCode = item.sProductQrCode;
                    $scope.modelList.Quantity = item.Quantity;
                    $scope.modelList.Unit = item.Unit;
                    $scope.modelList.UnitName = item.UnitName;
                    $scope.modelList.SalePrice = item.SalePrice;
                    $scope.modelList.ProductLot = item.ProductLot;

                    //Check xem đã có trong list chưa
                    $scope.model.ListProduct.splice(index, 1);
                } else {
                    App.toastrError(rs.Title);
                }
            });
        }
    }
    $scope.removeCoil = function (item) {
        if (item.IsOrder) {
            App.toastrError(caption.MIST_SORT_CANNOT_DELETE);
        } else {
            $scope.quantityCheck = $scope.quantityCheck - parseFloat(item.ValueCoil);
            var index = $scope.model.ListCoil.indexOf(item);
            if (index < -1) {
                App.toastrError(caption.MIST_CANNOT_FOUND_DEL_PRODUCT);
                return;
            }
            $scope.model.ListCoil.splice(index, 1);
            //if ($scope.modelList.QuantityCoil != '') {
            //    $scope.modelList.QuantityCoil = $scope.modelList.QuantityCoil - 1;
            //    $scope.modelList.Quantity = $scope.modelList.Quantity + $scope.modelList.ValueCoil;
            //}

            //Cập nhật lại giá trị ở trên
            $scope.modelList.Quantity = 0;
            for (var i = 0; i < $scope.model.ListCoil.length; i++) {
                $scope.modelList.Quantity = $scope.modelList.Quantity + (parseFloat($scope.model.ListCoil[i].ValueCoil));
            }

            App.toastrSuccess(caption.MIST_BTN_SAVE_INFORMATION);
        }
    }
    $scope.changleSelect = function (SelectType, item) {
        //Hàm chọn 1 lô để nhập
        if (SelectType == "LotProductCode") {
            $rootScope.LotProductCode = item.Code;
            $scope.model.Reason = 'IMP_FROM_BUY';
            $scope.model.StoreCodeSend = '';

            dataservice.getLotProduct(item.Code, function (rs) {
                rs = rs.data;
                $scope.model.CusCode = rs.SupCode;
                //$scope.model.CostTotal = rs.CostTotal;
                //$scope.model.TaxTotal = rs.TaxTotal;
                //$scope.model.Discount = rs.Discount;
                //$scope.model.Commission = rs.Commission;
                //$scope.model.TotalMustPayment = rs.TotalMustPayment;
                //$scope.model.Currency = rs.Currency;
                createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);

                $scope.model.ListProduct = rs.ListProduct;
            });

            //Bỏ validate
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                $scope.errorLotProductCode = false;
            }
        }
        if (SelectType == "ProductCode") {
            $scope.modelList.Unit = item.Unit;
            $scope.modelList.UnitName = item.UnitName;
            $scope.modelList.ProductName = item.Name;
            $scope.modelList.ProductType = item.ProductType;
            $scope.modelList.ImpType = item.ImpType;
            createProductQrCode();
            if (item.ImpType != '' && item.ImpType != null && item.ImpType != undefined) {
                $scope.modelList.Quantity = 0;
                $scope.listProductType = item.ImpType.split(",");
                if ($scope.listProductType.length > 1) {
                    $scope.showCoil = true;
                    $scope.modelList.UnitCoil = $scope.listProductType[$scope.listProductType.length - 1];
                } else {
                    $scope.showCoil = false;
                }
            } else {
                App.toastrError(caption.MIST_VALIDATE_IN_PRODUCT_TYPE);
            }

            $scope.disableFiled(item.ImpType);

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.sProductCoil);
        }
        if (SelectType == "ProductRelative") {
            $scope.chooseCoilInStore = true;
            var check = $scope.listProduct.filter(k => k.Code === item.ProductCode);
            if (check.length == 1) {
                $scope.modelList.ProductCode = item.ProductCode;
                $scope.modelList.SalePrice = item.SalePrice;
                $scope.modelList.Quantity = item.Quantity;
                $scope.modelList.Unit = check[0].Unit;
                $scope.modelList.UnitName = check[0].UnitName;
                $scope.modelList.ProductName = check[0].Name;
                $scope.modelList.ProductType = check[0].ProductType;
                $scope.modelList.ImpType = check[0].ImpType;
                $scope.modelList.ProductLot = item.ProductLot;
                validationProduct($scope.modelList);
                createProductQrCode();
            }

            //var listRelative = $scope.listProductRelative.filter(k => k.CoilRelative === item.Code);
            //var no = listRelative.length + 1;
            //$scope.modelList.ProductCoil = item.Code + "_" + no;

            createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.sProductCoil);
        }
        if (SelectType == "StoreCode") {
            if ($scope.model.StoreCodeSend == $scope.model.StoreCode) {
                $scope.model.StoreCodeSend = '';
                App.toastrError(caption.MIS_MSG_OTHER_IMPORT_WAREHOUSE_TRANSFER);
            }
            createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);
            //$scope.model.ListProduct = [];
            //$scope.modelList = {
            //    ProductCode: '',
            //    ProductName: '',
            //    ProductQrCode: '',
            //    sProductQrCode: '',
            //    Quantity: null,
            //    Unit: '',
            //    UnitName: '',
            //    SalePrice: null,
            //    TaxRate: 10,
            //    Discount: 0,
            //    Commission: 0,
            //};
            if ($scope.model.StoreCode != undefined && $scope.model.StoreCode != null && $scope.model.StoreCode != '') {
                $scope.errorStoreCode = false;
            }
        }
        if (SelectType == "Reason") {
            if ($scope.model.Reason != undefined && $scope.model.Reason != null && $scope.model.Reason != '') {
                $scope.errorReason = false;
            }
            if ($scope.model.Reason == 'IMP_FROM_BUY') {
                $scope.model.StoreCodeSend = '';
            }
            else {
                $scope.model.CusCode = '';
            }
        }
        if (SelectType == "StoreCodeSend") {
            if ($scope.model.StoreCodeSend == $scope.model.StoreCode) {
                $scope.model.StoreCodeSend = '';
                App.toastrError(caption.MIS_MSG_OTHER_IMPORT_WAREHOUSE_TRANSFER);
            }
            if ($scope.model.StoreCodeSend != undefined && $scope.model.StoreCodeSend != null && $scope.model.StoreCodeSend != '') {
                $scope.errorStoreCodeSend = false;
            }
        }
        if (SelectType == "UserImport") {
            createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);
            if ($scope.model.UserImport != undefined && $scope.model.UserImport != null && $scope.model.UserImport != '') {
                $scope.errorUserImport = false;
            }
        }
    }
    $scope.changeCoil = function () {
        createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.sProductCoil);
    }
    $scope.change = function (type) {
        switch (type) {
            //Quy cách
            case 'ruleCoil':
                createCoilCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.modelList.RuleCoil);
                break;
            case 'quantity':
                if ($scope.modelList.Quantity == null || $scope.modelList.Quantity == '' || $scope.modelList.Quantity == undefined) {
                    $scope.errorQuantity = true;
                } else {
                    $scope.errorQuantity = false;
                }
                break;
            case 'price':
                if ($scope.modelList.SalePrice == null || $scope.modelList.SalePrice == '' || $scope.modelList.SalePrice == undefined) {
                    $scope.errorSalePrice = true;
                } else {
                    $scope.errorSalePrice = false;
                }
                break;
            default:
        }
    }

    $scope.showListCoil = function () {
        if ($scope.isShow == true) {
            $scope.isShow = false;
            $scope.isShowListCoil = true;
        }
        else {
            $scope.isShow = true;
            $scope.isShowListCoil = false;
        }
    }

    $scope.orderingItemCoil = function (item) {
        //var item = $scope.model.ListCoil[index];
        if (item != null) {
            dataservice.checkProductInStoreCoil(item.ProductQrCode, item.ProductCoil, function (rs) {
                rs = rs.data;
                if (rs) {
                    var objPara = {
                        item: item,
                        rootId: $rootScope.rootId,
                        productName: item.ProductName,
                        productCoil: item.ProductCoil
                    }

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/orderProduct.html',
                        controller: 'orderProduct',
                        backdrop: 'static',
                        size: '70',
                        resolve: {
                            para: function () {
                                return {
                                    objPara
                                };
                            }
                        }
                    });
                    modalInstance.result.then(function (id) {
                    }, function () {
                    });
                } else {
                    App.toastrError(caption.MIS_MSG_PRODUCT_NON_ADD_REQUEST_CHOSE_ADD);
                }
            });
        } else {
            App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
    }
    $scope.orderingItem = function (index) {
        var item = $scope.model.ListProduct[index];
        if (item != null) {
            dataservice.checkProductInStore(item.ProductQrCode, function (rs) {
                rs = rs.data;
                if (rs) {
                    var objPara = {
                        item: item,
                        rootId: $rootScope.rootId,
                        productName: item.ProductName,
                        productCoil: ''
                    }

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/orderProduct.html',
                        controller: 'orderProduct',
                        backdrop: 'static',
                        size: '70',
                        resolve: {
                            para: function () {
                                return {
                                    objPara
                                };
                            }
                        }
                    });
                    modalInstance.result.then(function (id) {
                        $scope.initLoad();
                    }, function () {
                    });
                } else {
                    App.toastrError(caption.MIS_MSG_PRODUCT_NON_ADD_REQUEST_CHOSE_ADD);
                }
            });
        } else {
            App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
    }
    $rootScope.updateOrderItemCoil = function (id) {
        var item = $scope.model.ListCoil.find(function (element) {
            if (element.Id == id) return true;
        });
        if (item) {
            if (item.IsOrder == false) {
                item.IsOrder = true;
            } else {
                item.IsOrder = false;
            }
        }
    }
    function createTicketCode(lot, store, user) {

    }
    function createProductQrCode() {
        var today = moment().format('DDMMYYYY-HHmm');
        $scope.modelList.ProductQrCode = $scope.modelList.ProductCode + "_SL." + $scope.modelList.Quantity + "_T." + today;
        dataservice.generatorQRCode($scope.modelList.ProductQrCode, function (result) {
            result = result.data;
            $scope.modelList.sProductQrCode = result;
        });
    }
    function createCoilCode(productCode, lot, coil) {
        if (productCode == "" || productCode == undefined || productCode == null)
            productCode = "";

        if (lot == "" || lot == undefined || lot == null)
            lot = "";

        if (coil == "" || coil == undefined || coil == null)
            coil = "";

        var no = 1;
        $scope.modelList.ProductCoil = $scope.model.TicketCode + "_" + productCode + "_" + coil + "_";
    }
    function validationProduct(data) {
        var mess = { Status: false, Title: "" }
        //Check null lô hàng khi chọn nhập theo lô
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '') {
            $scope.errorProductCode = true;
            mess.Status = true;
            mess.Title = caption.MIS_VALIDATE_CHOOSE_PRODUCT;
        } else {
            $scope.errorProductCode = false;
        }
        if ($scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == '') {
            $scope.errorQuantity = true;
            mess.Status = true;
            if (mess.Title != "")
                mess.Title = mess.Title + "</br>caption.MIS_VALIDATE_ENTER_VALUE";
            else
                mess.Title = "Vui lòng nhập giá trị";
        } else {
            $scope.errorQuantity = false;
        }
        if ($scope.modelList.SalePrice == undefined || $scope.modelList.SalePrice == null || $scope.modelList.SalePrice == '') {
            $scope.errorSalePrice = true;
            mess.Status = true;
            if (mess.Title != "")
                mess.Title = mess.Title + "</br>caption.MIS_VALIDATE_ENTER_PRICE";
            else
                mess.Title = caption.MIS_VALIDATE_ENTER_PRICE;
        } else {
            $scope.errorSalePrice = false;
        }
        return mess;
    }
    function validationProductCoil(data) {
        var mess = { Status: false, Title: "" }
        if ($scope.modelList.ProductCoil == undefined || $scope.modelList.ProductCoil == null || $scope.modelList.ProductCoil == '') {
            $scope.errorProductCoil = true;
            mess.Status = true;
            if (mess.Title != "")
                mess.Title = mess.Title + "</br>MIST_VALDIATE_ADD_ROLL_BOX";
            else
                mess.Title = caption.MIST_VALDIATE_ADD_ROLL_BOX;
        } else {
            $scope.errorProductCoil = false;
        }

        return mess;
    }
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        loadPoper();
    }, 200);
});

app.controller('orderProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $uibModalInstance, para) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.QuantityEmpty = "...";
    $scope.isCoil = false;

    $scope.ImpType = para.objPara.item.ImpType;
    if ($scope.ImpType == "Cuộn")
        $scope.isCoil = true;

    $scope.model = {
        ProductCode: '',
        ProductName: para.objPara.productName,
        LineCode: '',
        RackCode: '',
        RackPosition: '',
        Quantity: 0,
        Unit: para.objPara.item.Unit,
        ListCoil: []
    }
    //var listCoils = para.objPara.item.ListCoil.filter(k => k.RackCode === '' || k.RackCode === null || k.RackCode === undefined);

    $scope.RackPosition = '';
    $scope.listSelect = [];
    $scope.listLine = [];
    $scope.listRack = [];
    $scope.listCoil = [];

    $scope.obj = {
        WareHouseCode: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        WareHouseName: '',
        FloorName: '',
        LineName: '',
        RackName: '',
        CNTBox: '',
        NumBox: '',
    }

    $scope.listProducts = [];
    $scope.listSelect = [];

    $scope.QuantityMax = '';

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWarehouseManager/JTable",
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

            },
            complete: function (data) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QRCode').withTitle('{{"EDWHR_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return '<img src="' + data + '" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"EDWHR_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION"|translate}}').renderWith(function (data, type, full) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.cancel = function () {
        $uibModalInstance.close($rootScope.rootId);
    }
    $scope.selectOrder = function (position, entities) {
        angular.forEach(entities, function (subscription, index) {
            if (position == index) {
                subscription.Checked = true;
                $rootScope.cntBox = subscription.Text;
            } else {
                subscription.Checked = false;
            }
        });
    }
    $scope.selectBox = function (position, boxs) {
        angular.forEach(boxs, function (subscription, index) {
            if (position == index) {
                if (subscription.Checked) {
                    subscription.Checked = false;
                    var indexRemove = $scope.listSelect.indexOf(boxs[index]);
                    $scope.listSelect.splice(indexRemove, 1);
                    boxs[index].WHS_Code = 0;
                    boxs[index].FloorCode = 0;
                    boxs[index].LineCode = 0;
                    boxs[index].RackCode = 0;
                    boxs[index].Ordering = 0;
                    boxs[index].RackPosition = '';
                    boxs[index].IsStored = false;
                } else {
                    boxs[index].WHS_Code = $rootScope.wareHouseCode;
                    boxs[index].FloorCode = $rootScope.floorCode;
                    boxs[index].LineCode = $rootScope.lineCode;
                    boxs[index].RackCode = $rootScope.rackCode;
                    boxs[index].Ordering = $rootScope.cntBox;
                    boxs[index].RackPosition = $scope.RackPosition;
                    boxs[index].IsStored = true;

                    if (boxs[index].FloorCode == 0) {
                        App.toastrError(caption.MIS_MSG_REQUEST_CHOSE_FLOOR_BEFORE_CHOSE_BOX);
                        return;
                    }

                    if (boxs[index].LineCode == 0) {
                        App.toastrError(caption.MIS_MSG_REQUEST_CHOSE_LINE_BEFORE_CHOSE_BOX);
                        return;
                    }

                    if (boxs[index].RackCode == 0) {
                        App.toastrError(caption.MIS_MSG_REQUEST_CHOSE_RACK_BEFORE_CHOSE_BOX);
                        return;
                    }

                    if (boxs[index].RackPosition == "") {
                        App.toastrError(caption.MIS_MSG_REQUEST_ENTER_LOCATION_RACK_BEFORE_CHOSE_BOX);
                        return;
                    }

                    if (boxs[index].Ordering == null) {
                        App.toastrError(caption.MIS_MSG_REQUEST_CHOSE_ORDERING_BEFORE_CHOSE_BOX);
                        return;
                    }

                    subscription.Checked = true;
                    $scope.listSelect.push(boxs[index]);
                }
            }
        });
    }

    $scope.initLoad = function () {
        var itemProduct = para.objPara.item;
        $scope.model.ProductQrCode = itemProduct.ProductQrCode;
        $scope.model.Quantity = itemProduct.ValueCoil;
        $scope.model.sProductCoil = para.objPara.productCoil;
        dataservice.getListLine($rootScope.storeCode, function (rs) {
            rs = rs.data;
            $scope.listLine = rs;
            $scope.listRack = [];
            $scope.model.RackCode = '';
            if (rs.length > 0) {
                $scope.model.LineCode = rs[0].LineCode;
                dataservice.getListRackByLineCode(rs[0].LineCode, function (result) {
                    result = result.data;
                    $scope.listRack = result;
                    if (result.length > 0) {
                        $scope.model.RackCode = result[0].RackCode;
                    }
                });
            } else {
                // App.toastrError("Không tìm thấy đường line trong" + ' ' + para.objPara.storeName);
            }
        });
        dataservice.getPositionProduct($scope.model.ProductQrCode, $scope.model.sProductCoil, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model.ListCoil = rs.Object;
                for (var i = 0; i < $scope.model.ListCoil.length; i++) {
                    $scope.model.ListCoil[i].sProductCoil = $scope.model.ListCoil[i].ProductCoil.split("_")[$scope.model.ListCoil[i].ProductCoil.split("_").length - 2];
                    $scope.model.ListCoil[i].CoilCode = $scope.model.ListCoil[i].ProductCoil;
                }
            }
        });
        dataservice.getProductNotInStore($scope.model.ProductQrCode, $scope.model.sProductCoil, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.listCoil = rs.Object;
                for (var i = 0; i < $scope.listCoil.length; i++) {
                    $scope.listCoil[i].sProductCoil = $scope.listCoil[i].ProductCoil.split("_")[$scope.listCoil[i].ProductCoil.split("_").length - 2];
                }
            }
        });
    }

    $scope.initLoad();

    $scope.setPositionBox = function () {
        $scope.obj.WareHouseCode = $rootScope.wareHouseCode;
        $scope.obj.FloorCode = $rootScope.floorCode;
        $scope.obj.LineCode = $rootScope.lineCode;
        $scope.obj.RackCode = $rootScope.rackCode;
        $scope.obj.CNTBox = $rootScope.cntBox;
        $scope.obj.NumBox = $rootScope.chooseBoxObj.NumBoxth;

        var objBox = $rootScope.chooseBoxObj;
        objBox.WHS_Code = $rootScope.wareHouseCode;
        objBox.FloorCode = $rootScope.floorCode;
        objBox.LineCode = $rootScope.lineCode;
        objBox.RackCode = $rootScope.rackCode;
        dataservice.getNameObjectType($scope.obj, function (rs) {
            rs = rs.data;
            $scope.obj = rs;
            $rootScope.positionBox = rs.PositionBox;
            App.toastrSuccess("caption.MIST_SORT_SUCCESS <br/>" + "Vị trí: " + $rootScope.positionBox);

            $uibModalInstance.close();
        });
    }

    $scope.validate = function () {
        if ($scope.model.LineCode != '' && $scope.model.RackCode != '' && $scope.model.RackPosition != '') {
            return false;
        } else {
            App.toastrError(caption.MIST_VALIDATE_ADD_REQUIRE_INFO_RB);
            return true;
        }
    }

    $scope.changeSelect = function (type, id) {
        switch (type) {
            case "LINE":
                dataservice.getListRackByLineCode(id, function (rs) {
                    rs = rs.data;
                    $scope.listRack = rs;
                    $scope.model.RackCode = '';
                });
            case "RACK":
                dataservice.getListProductInStore(id, function (rs) {
                    rs = rs.data;
                    $scope.listProducts = rs;
                });
                dataservice.getQuantityEmptyInRack(id, function (rs) {
                    rs = rs.data;
                    $scope.QuantityEmpty = rs;
                });
                break;
        }
    };
    //Tạm thời comment vì thêm số lượng
    //$scope.changeCoil = function (item) {
    //    var check = $scope.model.ListCoil.filter(k => k.ProductCoil === item.ProductCoil);
    //    if (check.length > 0) {
    //        App.toastrError(caption.MIST_LIST_EXIST);
    //    } else {
    //        var position = '';
    //        var line = $scope.listLine.filter(k => k.LineCode === $scope.model.LineCode);
    //        var rack = $scope.listRack.filter(k => k.RackCode === $scope.model.RackCode);
    //        if (rack.length == 1 && line.length == 1) {
    //            position = $scope.model.RackPosition + ", " + rack[0].RackName + ", " + line[0].L_Text;
    //            item.PositionInStore = position;
    //            item.CoilRelative = item.ProductCoilRelative;
    //            item.CoilCode = item.ProductCoil;
    //            item.LineCode = $scope.model.LineCode;
    //            item.RackCode = $scope.model.RackCode;
    //            item.RackPosition = $scope.model.RackPosition;
    //        }

    //        if (!$scope.validate()) {
    //            $scope.model.ListCoil.push(item);
    //            var index = $scope.listCoil.indexOf(item);
    //            $scope.model.Quantity = parseFloat(item.Size);
    //            $scope.listCoil.splice(index, 1);
    //        } else {
    //            $scope.model.ProductCoil = '';
    //        }
    //    }
    //}
    $scope.item = [];
    $scope.changeCoil = function (item) {
        $scope.item = item;
        var check = $scope.model.ListCoil.filter(k => k.ProductCoil === item.ProductCoil);
        if (check.length > 0) {
            //App.toastrError(caption.MIST_LIST_EXIST);
            var position = '';
            var line = $scope.listLine.filter(k => k.LineCode === $scope.model.LineCode);
            var rack = $scope.listRack.filter(k => k.RackCode === $scope.model.RackCode);
            if (rack.length === 1 && line.length === 1) {
                position = $scope.model.RackPosition + ", " + rack[0].RackName + ", " + line[0].L_Text;
                item.PositionInStore = position;
                item.CoilRelative = item.ProductCoilRelative;
                item.CoilCode = item.ProductCoil;
                item.LineCode = $scope.model.LineCode;
                item.RackCode = $scope.model.RackCode;
                item.RackPosition = $scope.model.RackPosition;
            }
        } else {
            var position = '';
            var line = $scope.listLine.filter(k => k.LineCode === $scope.model.LineCode);
            var rack = $scope.listRack.filter(k => k.RackCode === $scope.model.RackCode);
            if (rack.length === 1 && line.length === 1) {
                position = $scope.model.RackPosition + ", " + rack[0].RackName + ", " + line[0].L_Text;
                item.PositionInStore = position;
                item.CoilRelative = item.ProductCoilRelative;
                item.CoilCode = item.ProductCoil;
                item.LineCode = $scope.model.LineCode;
                item.RackCode = $scope.model.RackCode;
                item.RackPosition = $scope.model.RackPosition;
            }

            if (!$scope.validate()) {
                $scope.model.Quantity = parseFloat(item.Remain);

                //$scope.model.ListCoil.push(item);
                //var index = $scope.listCoil.indexOf(item);
                //$scope.listCoil.splice(index, 1);
            } else {
                $scope.model.ProductCoil = '';
            }
        }
    };

    $scope.add = function (item) {
        debugger
        if (!$scope.validate()) {
            for (var i = 0; i < $scope.model.Quantity; i++) {
                item = $scope.listCoil[i];
                var check = $scope.model.ListCoil.filter(k => k.ProductCoil === item.ProductCoil);
                if (check.length > 0) {
                    App.toastrError(caption.MIST_LIST_EXIST);
                } else {
                    var position = '';
                    var line = $scope.listLine.filter(k => k.LineCode === $scope.model.LineCode);
                    var rack = $scope.listRack.filter(k => k.RackCode === $scope.model.RackCode);
                    if (rack.length === 1 && line.length === 1) {
                        position = $scope.model.RackPosition + ", " + rack[0].RackName + ", " + line[0].L_Text;
                        item.PositionInStore = position;
                        item.CoilRelative = item.ProductCoilRelative;
                        item.CoilCode = item.ProductCoil;
                        item.LineCode = $scope.model.LineCode;
                        item.RackCode = $scope.model.RackCode;
                        item.RackPosition = $scope.model.RackPosition;
                    }

                    $scope.model.ListCoil.push(item);
                }
            }

            for (var j = 0; j < $scope.model.ListCoil.length; j++) {
                var index = $scope.listCoil.indexOf($scope.model.ListCoil[j]);
                $scope.listCoil.splice(index, 1);
            }
        }
    };

    $scope.orderingProduct = function () {
        if ($scope.model.RackCode != '' && $scope.model.RackPosition != '' && $scope.model.Size != '') {
            //var itemProduct = para.objPara.item;
            //$scope.changeCoil(itemProduct);
            dataservice.orderingProductInStore($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $rootScope.updateOrderItemCoil(para.objPara.item.Id);
                    $rootScope.reloadData();
                }
            });
        } else {
            App.toastrError(caption.MIS_MSG_REQUEST_ENTER_INFORMATION_REQUIRE)
        }
    }

    //Hàm remove sản phẩm
    $scope.removeItem = function (index) {
        var productCoil = $scope.model.ListCoil[index];
        dataservice.deleteProductInStore(productCoil.Id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                if (para.objPara.item.Id != null && para.objPara.item.Id != '' && para.objPara.item.Id != undefined) {
                    $rootScope.updateOrderItemCoil(para.objPara.item.Id);
                    $rootScope.reloadData();
                }
                $scope.listCoil.push(productCoil);
                $scope.model.ListCoil.splice(index, 1);
                App.toastrSuccess(caption.MIST_DEL_LOCA_SUCESS);
            }
        });
    }

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('listFloor', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $timeout) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWarehouseManager/JTableFloor",
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
                d.WareHouseCode = $rootScope.wareHouseCode;
            },
            complete: function (data) {
                $rootScope.listFloor = data.responseJSON.data;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('scrollY', "110px")
        .withOption('scrollCollapse', false)
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
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    var floorCode = data.FloorCode;
                    $rootScope.floorID = Id;
                    $rootScope.floorCode = floorCode;
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblDataFloor').DataTable().$('tr.selected').removeClass('selected');
                        $('#tblDataFloor').DataTable().$('tr>td.fa-check').removeClass('fa-check');
                        $(self).addClass('selected');
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('{{"EDWHR_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        //return '<img src="data:image/png;base64,' + data + '" height="40" width="40">';
        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle('{{"MIS_LIST_COL_TILTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MapDesgin').withTitle('{{"MIS_LIST_COL_DESIGN" | translate}}').renderWith(function (data, type, full) {
        //return '<img src="' + data + '" height="40" width="40">';
        return '<img src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MIS_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addFloor.html',
            controller: 'addFloor',
            backdrop: 'static',
            size: '65'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.edit = function (id) {
        var model = {};
        var listdata = $('#tblDataFloor').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id + "") {
                model = listdata[i];
                break;
            }
        }
        $rootScope.floorID = id;
        $rootScope.floorCode = model.FloorCode;
        $rootScope.showListFloor = true;
        $rootScope.showListLine = true;
        $rootScope.showListRack = false;

        $rootScope.reloadLine();
    }

    $rootScope.reloadFloor = function () {
        reloadData(false);
    }

    $rootScope.floorReload = true;
});
app.controller('listLine', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWarehouseManager/JTableLine",
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
                d.FloorCode = $rootScope.floorCode;
            },
            complete: function (data) {
                $rootScope.listLine = data.responseJSON.data;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('scrollY', "110px")
        //.withOption('scrollCollapse', true)
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
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    var lineCode = data.LineCode;
                    $rootScope.lineID = Id;
                    $rootScope.lineCode = lineCode;
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblDataLine').DataTable().$('tr.selected').removeClass('selected');
                        $('#tblDataLine').DataTable().$('tr>td.fa-check').removeClass('fa-check');
                        $(self).addClass('selected');
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('{{"EDWHR_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
        //return '<img src="' + qrCode + '" height="40" width="40">';
        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('L_Text').withTitle('{{"MIS_LIST_COL_TILTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"MIS_LIST_COL_DESCEPTION" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MIS_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.add = function () {
    }
    $scope.edit = function (id) {
        var model = {};
        var listdata = $('#tblDataLine').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id + "") {
                model = listdata[i];
                break;
            }
        }

        $rootScope.lineID = id;
        $rootScope.lineCode = model.LineCode;
        $rootScope.showListFloor = true;
        $rootScope.showListLine = true;
        $rootScope.showListRack = true;

        $rootScope.reloadRack();
    }

    $rootScope.reloadLine = function () {
        reloadData(false);
    }
});
app.controller('listRack', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWarehouseManager/JTableRack",
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
                //d.LineCode = $rootScope.lineCode;
            },
            complete: function (data) {
                $rootScope.listRack = data.responseJSON.data;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('scrollY', "110px")
        //.withOption('scrollCollapse', true)
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
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    var rackCode = data.RackCode;
                    $rootScope.rackID = Id;
                    $rootScope.rackCode = rackCode;
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblDataRack').DataTable().$('tr.selected').removeClass('selected');
                        $('#tblDataRack').DataTable().$('tr>td.fa-check').removeClass('fa-check');
                        $(self).addClass('selected');
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('{{"MIS_LIST_COL_QR_CODE" | translate}}').renderWith(function (data, type) {
        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RackName').withTitle('{{"MIS_LIST_COL_NAME_LINE_PALLET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RackPositionText').withTitle('{{"MIS_LIST_COL_LOCATION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MIS_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.add = function () {
        //var modalInstance = $uibModal.open({
        //    animation: true,
        //    templateUrl: ctxfolder + '/add.html',
        //    controller: 'add',
        //    backdrop: 'static',
        //    size: '65'
        //});
        //modalInstance.result.then(function (d) {

        //}, function () {
        //});
    }

    $scope.edit = function (id) {
        $rootScope.rackID = id;
    }

    $rootScope.reloadRack = function () {
        reloadData(false);
    }
});

app.controller('showLog', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout, para) {
    var data = JSON.parse(para);
    //$scope.logs = [];
    //if (data != null) {
    //    for (var i = 0; i < data.length; ++i) {
    //        var obj = {
    //            CreatedTime: data[i].Header.UpdatedTime != null ? $filter('date')(new Date(data[i].Header.UpdatedTime), 'dd/MM/yyyy HH:mm:ss') : $filter('date')(new Date(data[i].Header.CreatedTime), 'dd/MM/yyyy HH:mm:ss'),
    //            CreatedBy: data[i].Header.UpdatedBy != null ? data[i].Header.UpdatedBy : data[i].Header.CreatedBy,
    //            Body: data[i]
    //        }

    //        $scope.logs.push(obj);
    //    }
    //}
    $scope.obj = { data: data, options: { mode: 'code' } };
    $scope.onLoad = function (instance) {
        instance.expandAll();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 1);
});
