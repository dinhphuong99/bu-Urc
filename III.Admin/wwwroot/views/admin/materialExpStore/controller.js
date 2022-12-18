var ctxfolder = "/views/admin/materialExpStore";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";

var app = angular.module('App_ESEIM_EXPORTSTORE', ["App_ESEIM_CUSTOMER", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor', 'monospaced.qrcode']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getUnit: function (data, callback) {
            $http.get('/Admin/MaterialExpStore/GetUnit?impCode=' + data).then(callback);
        },
        getStore: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetStore').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetUser').then(callback);
        },
        getSupplier: function (callback) {
            $http.post('/Admin/MaterialExpStore/Getsupplier').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetItem', data).then(callback);
        },
        getListProductGrid: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProductGrid', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/Insert', data, {
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
            $http.post('/Admin/MaterialExpStore/Update', data, {
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
            $http.post('/Admin/MaterialExpStore/Delete', data).then(callback);
        },
        insertDetailProductCoid: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/InsertDetailProductCoid', data, {
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
        deleteDetailProductCoid: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/DeleteDetailProductCoid', data).then(callback);
        },
        insertDetailProductOdd: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/InsertDetailProductOdd', data, {
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
        deleteDetailProductOdd: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/DeleteDetailProductOdd', data).then(callback);
        },
        getListLotProduct: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListLotProduct').then(callback);
        },
        getListLotProduct4Update: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListLotProduct4Update?lotProductCode=' + data).then(callback);
        },
        getListStore: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListStore').then(callback);
        },
        getListContract: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListContract').then(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListCustomer').then(callback);
        },
        getCustomer: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetCustomer?contractCode=' + data).then(callback);
        },
        getListUserExport: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListUserExport').then(callback);
        },
        getListReason: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListReason').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListCurrency').then(callback);
        },
        getListProduct: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProduct?storeCode=' + data).then(callback);
        },
        getListProductCode: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProductCode?storeCode=' + data).then(callback);
        },
        getListProduct4QrCode: function (data1, data2, data3, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProduct4QrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3).then(callback);
        },
        getListGridProduct: function (data1, data2, data3, callback) {
            $http.post('/Admin/MaterialExpStore/GetListGridProduct?ticketExpCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3).then(callback);
        },
        getListCoilByProdQrCode: function (data1, data2, data3, data4, callback) {
            $http.post('/Admin/MaterialExpStore/GetListCoilByProdQrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3 + '&productQrCode=' + data4).then(callback);
        },
        getListLotByProdQrCode: function (data1, data2, data3, data4, callback) {
            $http.post('/Admin/MaterialExpStore/GetListLotByProdQrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3 + '&productQrCode=' + data4).then(callback);
        },
        getListRackCode: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListRackCode?productQrCode=' + data).then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListUnit').then(callback);
        },
        getListPaymentStatus: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListPaymentStatus').then(callback);
        },
        getLotProduct: function (data, data1, callback) {
            $http.post('/Admin/MaterialExpStore/GetLotProduct/?lotProductCode=' + data + '&storeCode=' + data1).then(callback);
        },
        getLotProduct4Update: function (data, data1, data2, callback) {
            $http.post('/Admin/MaterialExpStore/GetLotProduct4Update/?lotProductCode=' + data + '&&storeCode=' + data1 + '&&ticketCode=' + data2).then(callback);
        },
        //Tạo mã ticket code
        createTicketCode: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/CreateTicketCode?type=' + data).then(callback);
        },

        //tạo mã QR_Code
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GeneratorQRCode?code=' + data).then(callback);
        },
        getUpdateLog: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetUpdateLog?ticketCode=' + data).then(callback);
        },
        getPositionProduct: function (productQrCode, productCoil, callback) {
            $http.get('/Admin/MaterialExpStore/GetPositionProduct?productQrCode=' + productQrCode + '&&productCoil=' + productCoil, callback).then(callback);
        },
        getPositionProductCode: function (productCode, productLot, storeCode, callback) {
            $http.get('/Admin/MaterialExpStore/GetPositionProduct?productCode=' + productCode + '&&productLot=' + productLot + '&&storeCode=' + storeCode, callback).then(callback);
        },
        getListProductLot: function (data, data1, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProductLot?productCode=' + data + '&&storeCode=' + data1).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM_EXPORTSTORE', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.permissionMaterialExpStore = PERMISSION_MaterialExpStore;
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
        //var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
        //var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
        //var partternUrl = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^!@$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng & dấu #
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.ExpCode)) {
            mess.Status = true;
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.ADM_RESOURCE_CURD_LBL_RESOURCE_CODE), "<br/>");
        }

        return mess;
    }
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
    });
    $rootScope.validationOptions = {
        rules: {
            Title: {
                required: true,

            },
            TimeTicketCreate: {
                required: true,
            },
            Note: {
                maxlength: 1000
            }
        },
        messages: {
            Title: {
                required: caption.MES_VALIDATE_TITLE

            },
            TimeTicketCreate: {
                required: caption.MES_MSG_ENTER_CREATED_TIME
            },
            Note: {
                maxlength: caption.MES_CURD_VALIDATE_EXPSTORE_NOTE
            }
        }
    }

    $rootScope.ExpCode = '';
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {

    $translateProvider.useUrlLoader('/Admin/MaterialExpStore/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window) {
    var vm = $scope;
    $scope.model = {
        Title: '',
        CusCode: '',
        StoreCode: '',
        UserExport: '',
        FromDate: '',
        ToDate: '',
        Reason: '',
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: $rootScope.permissionMaterialExpStore.LIST,
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
                d.UserExport = $scope.model.UserExport;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Reason = $scope.model.Reason;
            },
            complete: function () {
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
            if ($rootScope.permissionMaterialExpStore.Update) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withOption('sClass', 'hidden').withTitle('Id').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QrTicketCode').withTitle('{{"MES_LIST_COL_QR" | translate}}').renderWith(function (data, type, full, meta) {
        return '<qrcode role="button" ng-click="viewQrCode(\'' + full.TicketCode + '\')" data=' + full.TicketCode + ' size="35"></qrcode>'
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCode').withTitle('{{"MES_LIST_COL_ESTORE_CODE" | translate}}').renderWith(function (data, type, full, meta) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"MES_LIST_COL_TITLE" | translate }}').renderWith(function (data) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"Khách hàng" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{"MES_LIST_COL_ESTORE_NAME" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserExportName').withTitle('{{"MES_LIST_COL_PEOPLE_EXPORT" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReasonName').withTitle('{{"MES_LIST_COL_REASON" | translate }}').renderWith(function (data) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CostTotal').withTitle('{{"MES_LIST_COL_ESTORE_TOTAL_MONEY" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CurrencyName').withTitle('{{"Tiền tệ" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Discount').withTitle('{{"Chiết khấu" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Commission').withTitle('{{"Hoa hồng" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TaxTotal').withTitle('{{"Thuế" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalMustPayment').withTitle('{{"Tổng phải thu" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPayed').withTitle('{{"Tổng đã thu" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('NextTimePayment').withTitle('{{"Ngày thu tiếp" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeTicketCreate').withTitle('{{"MES_LIST_COL_CREATED_TIME" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"MES_LIST_COL_NOTE" | translate }}').renderWith(function (data) {
        return data;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('Debt').withTitle('{{"MES_LIST_COL_ESTORE_DEBT" | translate }}').renderWith(function (data, type, full) {
    //    var result = "";
    //    if (data == "") {
    //        result = caption.COM_MSG_NO_CONFIRM;
    //    } else if (data == "True") {
    //        result = (full.Total - full.TotalPayed);
    //        result = result != "" ? $filter('currency')(result, '', 0) : null
    //    } else if (data == "False") {
    //        result = caption.COM_MSG_NO_CONFIRM;
    //    }
    //    return result;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MES_LIST_COL_ESTORE_ACTION" | translate }}').renderWith(function (data, type, full) {
        var listButton = '';
        if ($rootScope.permissionMaterialExpStore.Update) {
            listButton += '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
        }
        if ($rootScope.permissionMaterialExpStore.Delete) {
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

    $scope.initLoad = function () {
        //dataservice.getListLotProduct(function (rs) {rs=rs.data;
        //    $scope.listLotProduct = rs;
        //});
        //dataservice.getListUnit(function (rs) {rs=rs.data;
        //    $scope.listUnit = rs;
        //});
        dataservice.getListStore(function (rs) {rs=rs.data;
            $scope.listStore = rs;
            $scope.listStoreReceipt = rs;
            $rootScope.MapStores = {};
            for (var i = 0; i < rs.length; ++i) {
                $rootScope.MapStores[rs[i].Code] = rs[i];
            }
        });
        dataservice.getListCustomer(function (rs) {rs=rs.data;
            $scope.listCustomer = rs;
        });
        dataservice.getListUserExport(function (rs) {rs=rs.data;
            $scope.listUserExport = rs;
        });
        dataservice.getListReason(function (rs) {rs=rs.data;
            $scope.listReason = rs;
        });
        //dataservice.getListReason(function (rs) {rs=rs.data;
        //    $scope.listReason = rs;
        //});
        //dataservice.getListCurrency(function (rs) {rs=rs.data;
        //    $scope.listCurrency = rs;
        //});
        //dataservice.getListPaymentStatus(function (rs) {rs=rs.data;
        //    $scope.listPaymentStatus = rs;
        //});
    }
    $scope.initLoad();
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
                    dataservice.delete(id, function (rs) {rs=rs.data;
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, $window) {
    var vm = $scope;
    $scope.isNotSave = true;
    //Khởi tạo
    $scope.modelShow = {
        ProductQrCode: ''
    };
    $scope.listLotProductBackup = [];
    $scope.model = {};
    $scope.model.Title = '';
    $scope.model.TimeTicketCreate = $filter('date')(new Date(), 'dd/MM/yyyy');
    $scope.model.StoreCode = '';
    $scope.model.CusCode = '';
    $scope.model.Reason = 'EXP_TO_SALE';
    $scope.model.StoreCodeReceipt = '';
    $scope.model.UserExport = '';
    $scope.model.Note = '';
    $scope.model.UserReceipt = '';
    $scope.model.InsurantTime = '';
    $scope.IsEnabledExportLot = false;
    $rootScope.IsEnabledExportLot = false;
    $scope.modelDisable = true;
    $scope.maxQuantity = 0;
    $scope.disableChoiseProduct = true;

    $scope.init = function () {
        $scope.model.LotProductCode = '';
        $scope.model.TicketCode = '';
        $scope.model.ListProduct = [];
        $scope.model.ListPoProduct = [];

        $scope.modelList = {
            ProductCode: '',
            ProductName: '',
            RackCode: '',
            RackName: '',
            ProductQrCode: '',
            sProductQrCode: '',
            Quantity: null,
            Unit: '',
            UnitName: '',
        };
        $scope.errorLotProductCode = false;
        var type = "ODD";
        if ($rootScope.IsEnabledExpLot) {
            type = "PO";
        } else {
            $scope.model.LotProductCode = '';
        };
        dataservice.createTicketCode(type, function (rs) {rs=rs.data;
            $scope.model.TicketCode = rs.Object;
        });
    }
    $scope.init();

    $scope.initLoad = function () {
        dataservice.getListLotProduct(function (rs) {rs=rs.data;
            // bỏ dòng $scope.listLotProduct = rs; để fix bug #1005
            //$scope.listLotProduct = rs;
            $scope.listLotProductBackup = rs;
        });
        dataservice.getListUnit(function (rs) {rs=rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListStore(function (rs) {rs=rs.data;
            $scope.listStore = rs;
            $scope.listStoreReceipt = rs;
            $rootScope.MapStores = {};
            for (var i = 0; i < rs.length; ++i) {
                $rootScope.MapStores[rs[i].Code] = rs[i];
            }
        });
        dataservice.getListContract(function (rs) {rs=rs.data;
            $scope.listContract = rs;
        });
        dataservice.getListCustomer(function (rs) {rs=rs.data;
            $scope.listCustomer = rs;
        });
        dataservice.getListUserExport(function (rs) {rs=rs.data;
            $scope.listUserExport = rs;
        });
        dataservice.getListReason(function (rs) {rs=rs.data;
            $scope.listReason = rs;
        });
        dataservice.getListCurrency(function (rs) {rs=rs.data;
            $scope.listCurrency = rs;
        });
        dataservice.getListPaymentStatus(function (rs) {rs=rs.data;
            $scope.listPaymentStatus = rs;
        });
    }
    $scope.initLoad();

    $scope.reloadGridDetail = function () {
        debugger
        dataservice.getListProductGrid($rootScope.rootId, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model.ListProduct = rs.Object.ListProduct;
            }
        });
    }

    $rootScope.refeshData = function (id) {
        dataservice.getItem(id, function (rs) {rs=rs.data;
            debugger
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object.Header;
                $scope.model.ListPoProduct = rs.Object.ListPoProduct;

                dataservice.getListProductGrid($rootScope.rootId, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        $scope.model.ListProduct = rs.Object.ListProduct;
                    }
                });

                if ($scope.model.LotProductCode != '') {
                    $scope.IsEnabledExportLot = true;
                    $rootScope.IsEnabledExportLot = true;

                    dataservice.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {rs=rs.data;
                        $scope.listLotProduct = rs;
                    });
                }
                else {
                    //Không theo lô thì không cần lấy danh sách lô
                    //dataservice.getListLotProduct(function (rs) {rs=rs.data;
                    //    $scope.listLotProduct = rs;
                    //});
                }

                dataservice.getListProductCode($scope.model.StoreCode, function (rs) {rs=rs.data;
                    $scope.listProduct = rs;
                });
            }
        });
    }
    //Load init date
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }
    function loadDate() {
        //$("#FromTo").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#DateTo').datepicker('setStartDate', maxDate);
        //});
        //$("#DateTo").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#FromTo').datepicker('setEndDate', maxDate);
        //});
        //$('.end-date').click(function () {
        //    var from = $scope.model.FromDate.split("/");
        //    var date = new Date(from[2], from[1] - 1, from[0])
        //    $('#DateTo').datepicker('setStartDate', date);
        //    $('#FromTo').datepicker('setEndDate', null);
        //});
        //$('.start-date').click(function () {
        //    var from = $scope.model.ToDate.split("/");
        //    var date = new Date(from[2], from[1] - 1, from[0])
        //    $('#FromTo').datepicker('setEndDate', date);
        //    $('#DateTo').datepicker('setStartDate', null);
        //});
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
        var today = new Date(new Date());
        // Tạm chú thích dòng này để test dự báo: Hoàng
        //$('#TimeTicketCreate').datepicker('setStartDate', today);
        //$('#TimeTicketCreate').datepicker('setEndDate', today);
        //$('#TimeTicketCreate').datepicker('update', new Date());
        // end chú thích

        //$('#NextTimePayment').datepicker('setStartDate', today);
        $('#InsurantTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    setTimeout(function () {
        loadDate();
        loadPoper();
    }, 200);
    //Hết khởi tạo

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reloadRoot();
    }

    //Hàm lựa chọn/bỏ lựa chọn nhập theo lô
    $scope.checkedExportLot = function (chk) {
        $scope.init();
        $rootScope.IsEnabledExportLot = chk;
        $scope.errorLotProductCode = false;

        //thêm dòng để fix bug #1005
        if (chk == false) {
            $scope.listLotProduct = [];
            $scope.model.LotProductCode = null;
        }
        else {
            $scope.listLotProduct = $scope.listLotProductBackup;
        }

        var type = "ODD";
        if ($rootScope.IsEnabledExportLot) {
            type = "PO";
        } else {
            $scope.model.LotProductCode = '';
            $scope.model.ListProduct = [];
        };

        dataservice.createTicketCode(type, function (rs) {rs=rs.data;
            $scope.model.TicketCode = rs.Object;
        });
    }

    ////Hàm add sản phẩm vào list chi tiết
    //$scope.add = function () {
    //    if ($scope.isNotSave) {
    //        App.toastrError('Vui lòng bấm lưu lại trước khi thêm sản phẩm');
    //        return;
    //    }

    //    //Check null
    //    if ($scope.modelList.ProductQrCode == undefined || $scope.modelList.ProductQrCode == null || $scope.modelList.ProductQrCode == '' ||
    //        $scope.modelList.RackCode == undefined || $scope.modelList.RackCode == null || $scope.modelList.RackCode == '' ||
    //        $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == '' ||
    //        $scope.modelList.ProductCoil == undefined || $scope.modelList.ProductCoil == null || $scope.modelList.ProductCoil == '' ||
    //        $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
    //    ) {
    //        App.toastrError('Nhập các thông tin bắt buộc');
    //    }
    //    else {
    //        //var indexCheck = -1;
    //        //var elementCheck = $scope.model.ListProduct.find(function (element) {
    //        //    if (element.ProductQrCode == $scope.modelList.ProductQrCode && element.RackCode == $scope.modelList.RackCode) {
    //        //        indexCheck = 0;
    //        //        return element;
    //        //    }
    //        //});

    //        //if (indexCheck > -1) {
    //        //    App.toastrError(caption.MES_MSG_PRODUCT_ADD_CATEGORY);
    //        //}
    //        //else {

    //        //}

    //        if ($scope.maxQuantity < $scope.modelList.Quantity) {
    //            App.toastrError(caption.MES_MSG_AMOUNT_PRODUCT_ENTER);
    //        }
    //        else {
    //            var addItem = {
    //                ProductCoil: $scope.modelList.ProductCoil,
    //                ProductLot: $scope.modelList.ProductLot,
    //                ProductCode: $scope.modelList.ProductCode,
    //                ProductType: $scope.modelList.ProductType,
    //                ProductName: $scope.modelList.ProductName,
    //                ProductQrCode: $scope.modelList.ProductQrCode,
    //                sProductQrCode: $scope.modelList.sProductQrCode,
    //                RackCode: $scope.modelList.RackCode,
    //                RackName: $scope.modelList.RackName,
    //                Quantity: $scope.modelList.Quantity,
    //                Unit: $scope.modelList.Unit,
    //                UnitName: $scope.modelList.UnitName,
    //            };
    //            $scope.model.ListProduct.push(addItem);

    //            var elementCheckListCoil = $scope.listCoil.find(function (element) {
    //                if (element.ProductCoil == $scope.modelList.ProductCoil) {
    //                    if (element.Remain == $scope.modelList.Quantity) {
    //                        element.Remain = 0;
    //                        $scope.modelList.Quantity = 0;

    //                        var index = $scope.listCoil.indexOf(element);
    //                        $scope.listCoil.splice(index, 1);
    //                    }

    //                    if (element.Remain > $scope.modelList.Quantity) {
    //                        element.Remain = element.Remain - $scope.modelList.Quantity;
    //                        $scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
    //                    }
    //                    return element;
    //                }
    //            });
    //        }
    //    }
    //}
    //Hàm add sản phẩm vào list chi tiết - Update 19.07.24 : Thêm trực tiếp vào DB
    $scope.add = function () {
        //Check null
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' ||
            //$scope.modelList.RackCode == undefined || $scope.modelList.RackCode == null || $scope.modelList.RackCode == '' ||
            $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == '' ||
            $scope.modelList.ProductCoil == undefined || $scope.modelList.ProductCoil == null || $scope.modelList.ProductCoil == '' ||
            $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
        ) {
            App.toastrError(caption.MES_MSG_ENTER_INFORMATION);
        }
        else {
            if ($scope.modelList.Quantity > $scope.maxQuantity) {
                App.toastrError(caption.MES_MSG_AMOUNT_PRODUCT_ENTER);
            }
            else {
                var addItem = {
                    TicketCode: $scope.model.TicketCode,
                    ProductCoil: $scope.modelList.ProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ProductCode: $scope.modelList.ProductCode,
                    ProductType: $scope.modelList.ProductType,
                    ProductName: $scope.modelList.ProductName,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    sProductQrCode: $scope.modelList.sProductQrCode,
                    RackCode: $scope.modelList.RackCode,
                    RackName: $scope.modelList.RackName,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,
                };

                dataservice.insertDetailProductOdd(addItem, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        //Thay đổi các giá trị tổng
                        $scope.maxQuantity = $scope.maxQuantity - addItem.Quantity;
                        $scope.modelList.Quantity = 0;

                        var elementCheckListCoil = $scope.listCoil.find(function (element) {
                            if (element.ProductCoil == $scope.modelList.ProductCoil) {
                                if (element.Remain == $scope.modelList.Quantity) {
                                    //element.Remain = 0;
                                    //$scope.modelList.Quantity = 0;

                                    var index = $scope.listCoil.indexOf(element);
                                    //$scope.listCoilChoose.push(element);
                                    $scope.listCoil.splice(index, 1);
                                }

                                if (element.Remain > $scope.modelList.Quantity) {
                                    element.Remain = element.Remain - $scope.modelList.Quantity;
                                    //$scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
                                }
                                return element;
                            }
                        });

                        $scope.reloadGridDetail();
                        App.toastrSuccess(rs.Title);
                    }
                });
            }
        }
    }

    $scope.openLog = function () {
        dataservice.getUpdateLog($scope.model.TicketCode, function (rs) {rs=rs.data;
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
    //Hàm remove sản phẩm
    //$scope.removeItem = function (item, index) {
    //    //Lấy lại giá trị model vừa xóa đưa lên chỗ add
    //    $scope.modelList.ProductCode = item.ProductCode;
    //    $scope.modelList.ProductType = item.ProductType;
    //    $scope.modelList.ProductName = item.ProductName;
    //    $scope.modelList.ProductQrCode = item.ProductQrCode;
    //    $scope.modelList.sProductQrCode = item.sProductQrCode;
    //    $scope.modelList.RackCode = item.RackCode;
    //    $scope.modelList.RackName = item.RackName;
    //    $scope.modelList.Quantity = item.Quantity;
    //    $scope.modelList.Unit = item.Unit;
    //    $scope.modelList.UnitName = item.UnitName;

    //    //Show label QR_Code sản phẩm
    //    $scope.modelShow.ProductQrCode = $scope.modelList.ProductQrCode;

    //    //get ra list rackcode
    //    dataservice.getListRackCode($scope.modelList.ProductQrCode, function (rs) {rs=rs.data;
    //        $scope.listRackCode = rs;
    //        //lấy giá trị max Quantity
    //        angular.forEach($scope.listRackCode, function (value, key) {
    //            if (value.Code == $scope.modelList.RackCode) {
    //                $scope.maxQuantity = value.Quantity + item.Quantity;
    //            }
    //        })
    //    });

    //    //Check xem đã có trong list chưa
    //    $scope.model.ListProduct.splice(index, 1);


    //    ////Thay đổi các giá trị tổng
    //    //$scope.model.CostTotal = $scope.model.CostTotal - item.Total;
    //    //$scope.model.Discount = $scope.model.Discount - item.DiscountTotal;
    //    //$scope.model.TaxTotal = $scope.model.TaxTotal - item.TaxTotal;
    //    //$scope.model.Commission = $scope.model.Commission - item.CommissionTotal;
    //    //$scope.model.TotalMustPayment = $scope.model.CostTotal - ($scope.model.Discount + $scope.model.TaxTotal + $scope.model.Commission);
    //}

    //Hàm remove sản phẩm
    $scope.removeItem = function (item, index) {
        dataservice.deleteDetailProductOdd(item.Id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                //Lấy lại giá trị model vừa xóa đưa lên chỗ add
                $scope.modelList.ProductCode = item.ProductCode;
                $scope.modelList.ProductType = item.ProductType;
                $scope.modelList.ProductName = item.ProductName;
                $scope.modelList.ProductCoil = item.ProductCoil;
                $scope.modelList.ProductLot = item.ProductLot == undefined ? '' : item.ProductLot;
                $scope.modelList.ProductQrCode = item.ProductQrCode;
                $scope.modelList.sProductQrCode = item.sProductQrCode;
                $scope.modelList.RackCode = item.RackCode;
                $scope.modelList.RackName = item.RackName;
                $scope.modelList.Quantity = item.Quantity;
                $scope.modelList.Unit = item.Unit;
                $scope.modelList.UnitName = item.UnitName;

                debugger
                //Lấy ra list ProductLot

                dataservice.getListProductLot($scope.modelList.ProductCode, $scope.model.StoreCode, function (rs) {rs=rs.data;
                    $scope.listLot = rs.Object;
                });

                //Lấy ra list CoidCode
                dataservice.getPositionProductCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.model.StoreCode, function (rs) {rs=rs.data;
                    if (!rs.Error) {
                        $scope.listCoil = rs.Object;

                        //lấy giá trị max Quantity
                        angular.forEach($scope.listCoil, function (value, key) {
                            debugger
                            if (value.ProductCoil == $scope.modelList.ProductCoil) {
                                $scope.maxQuantity = value.Remain;
                            }
                        })

                    }
                });

                $scope.reloadGridDetail();
                App.toastrSuccess(rs.Title);
            }
        });
    }

    //Hàm nhập sản phẩm/vị trí/số lượng xuất
    $scope.choiseProduct = function (item, index) {
        if ($scope.isNotSave) {
            App.toastrError(caption.MES_MSG_SAVE_FIRSR);
            return;
        }

        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            Model: $scope.model,
            Product: item,
            Index: index,
            StoreCode: $scope.model.StoreCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/choiseProduct.html',
            controller: 'choiseProduct',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined && d != null) {
                item.ListProductInRack = d.ListProduct;
                item.Quantity = d.QuantityTotal;
            }
        }, function () {
        });

    }

    //Thống kê lượng tồn cuộn/thùng
    $scope.reportInStock = function (item, index) {
        debugger
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            Product: item,
            Index: index,
            StoreCode: $scope.model.StoreCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportInStock.html',
            controller: 'reportInStock',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
            //if (d != undefined && d != null) {
            //    item.ListProductInRack = d.ListProduct;
            //    item.Quantity = d.QuantityTotal;
            //}
        }, function () {
        });

    }
    $scope.reportLotInStock = function (item, index) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            Product: item,
            Index: index,
            StoreCode: $scope.model.StoreCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportLotInStock.html',
            controller: 'reportLotInStock',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
            //if (d != undefined && d != null) {
            //    item.ListProductInRack = d.ListProduct;
            //    item.Quantity = d.QuantityTotal;
            //}
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

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        //Hàm chọn 1 lô để nhập
        if (SelectType == "LotProductCode") {
            $rootScope.LotProductCode = item.Code;
            $scope.model.Reason = 'EXP_TO_SALE';
            $scope.model.StoreCodeReceipt = '';

            dataservice.getLotProduct(item.Code, $scope.model.StoreCode, function (rs) {rs=rs.data;
                $scope.model.CusCode = rs.CusCode;
                ////bỏ phần tiền
                //$scope.model.StoreCode = rs.StoreCode;
                //$scope.model.CostTotal = rs.CostTotal;
                //$scope.model.TaxTotal = rs.TaxTotal;
                //$scope.model.Discount = rs.Discount;
                //$scope.model.Commission = rs.Commission;
                //$scope.model.TotalMustPayment = rs.TotalMustPayment;
                ////$scope.model.Currency = rs.Currency;

                $scope.model.ListPoProduct = rs.ListProduct;
                $scope.model.ListProduct = [];
            });

            //Bỏ validate
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                $scope.errorLotProductCode = false;
            }
        }
        if (SelectType == "ProductQrCode") {
            $scope.modelList.Unit = item.Unit;
            $scope.modelList.UnitName = item.UnitName;
            $scope.modelList.ProductCode = item.ProductCode;
            $scope.modelList.ProductName = item.Name;
            $scope.modelList.ProductType = item.ProductType;
            $scope.modelList.SupCode = item.SupCode;
            $scope.modelList.SupName = item.SupName;

            //Xóa vị trí kệ, số lượng
            $scope.modelList.Quantity = null;
            $scope.modelList.RackCode = '';
            $scope.modelList.RackName = '';
            $scope.maxQuantity = 0;

            //Show label QR_Code sản phẩm
            $scope.modelShow.ProductQrCode = item.Code;

            dataservice.getListRackCode($scope.modelList.ProductQrCode, function (rs) {rs=rs.data;
                $scope.listRackCode = rs;
            });

            dataservice.getListProductLot($scope.modelList.ProductCode, $scope.model.StoreCode, function (rs) {rs=rs.data;
                $scope.listLot = rs.Object;
                $scope.modelList.ProductLot = '';
            });
        }
        if (SelectType == "ProductLot") {
            dataservice.getListRackCode($scope.modelList.ProductQrCode, function (rs) {rs=rs.data;
                $scope.listRackCode = rs;
            });

            dataservice.getPositionProductCode($scope.modelList.ProductCode, item.Code, $scope.model.StoreCode, function (rs) {rs=rs.data;
                if (!rs.Error) {
                    $scope.listCoil = rs.Object;
                    $scope.modelList.ProductCoil = '';
                }
            });
        }
        if (SelectType == "ProductCoil") {
            $scope.modelList.ProductCoil = item.ProductCoil;
            $scope.modelList.RackCode = item.RackCode;
            $scope.modelList.RackName = item.PositionInStore;
            $scope.modelList.ProductQrCode = item.ProductQrCode;
            $scope.modelList.Quantity = item.Remain;
            $scope.maxQuantity = item.Remain;
            angular.forEach($scope.listRackCode, function (value, key) {
                if (value.Code == $scope.modelList.RackCode) {
                    $scope.modelList.RackName = value.Name;
                }
            })

            dataservice.generatorQRCode($scope.modelList.ProductQrCode, function (result) {result=result.data;
                $scope.modelList.sProductQrCode = result;
            });
        }
        if (SelectType == "RackCode") {
            $scope.modelList.RackCode = item.Code;
            $scope.modelList.RackName = item.Name;
            $scope.modelList.Quantity = item.Quantity;
            $scope.maxQuantity = item.Quantity;
        }
        if (SelectType == "StoreCode") {
            $scope.disableChoiseProduct = false;

            $scope.model.ListProduct = [];
            $scope.modelList = {};
            dataservice.getListProductCode($scope.model.StoreCode, function (rs) {rs=rs.data;
                $scope.listProduct = rs;
                if (rs.length == 0) {
                    App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                }
            });
            if ($scope.model.StoreCode != undefined && $scope.model.StoreCode != null && $scope.model.StoreCode != '') {
                $scope.errorStoreCode = false;
            }
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                dataservice.getLotProduct($scope.model.LotProductCode, $scope.model.StoreCode, function (rs) {rs=rs.data;
                    $scope.model.ListPoProduct = rs.ListProduct;
                    $scope.model.ListProduct = [];
                });
            }
        }
        if (SelectType == "Reason") {
            if ($scope.model.Reason != undefined && $scope.model.Reason != null && $scope.model.Reason != '') {
                $scope.errorReason = false;
            }
            if ($scope.model.Reason == 'EXP_TO_SALE') {
                $scope.model.StoreCodeReceipt = '';
            }
            else {
                $scope.model.ContractCode = '';
                $scope.model.CusCode = '';
            }
        }
        if (SelectType == "StoreCodeReceipt") {
            if ($scope.model.StoreCodeReceipt == $scope.model.StoreCode) {
                $scope.model.StoreCodeReceipt = '';
                App.toastrError(caption.MES_MSG_WARE_HOURE_GOTO_DEFERICEN);
            }
            if ($scope.model.StoreCodeReceipt != undefined && $scope.model.StoreCodeReceipt != null && $scope.model.StoreCodeReceipt != '') {
                $scope.errorStoreCodeReceipt = false;
            }
        }
        if (SelectType == "UserExport") {
            if ($scope.model.UserExport != undefined && $scope.model.UserExport != null && $scope.model.UserExport != '') {
                $scope.errorUserExport = false;
            }
        }
        if (SelectType == "ContractCode") {
            dataservice.getCustomer(item.Code, function (rs) {rs=rs.data;
                $scope.model.CusCode = rs;
            });
        }
    }

    //Validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null lô hàng khi chọn xuất theo lô
        if ($scope.IsEnabledExportLot == true && (data.LotProductCode == undefined || data.LotProductCode == null || data.LotProductCode == '')) {
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
        if ($scope.model.Reason == 'EXP_TO_MOVE_STORE' && (data.StoreCodeReceipt == undefined || data.StoreCodeReceipt == null || data.StoreCodeReceipt == '')) {
            $scope.errorStoreCodeReceipt = true;
            mess.Status = true;
        } else {
            $scope.errorStoreCodeReceipt = false;
        }

        //Check null nhân viên xuất
        if (data.UserExport == undefined || data.UserExport == null || data.UserExport == '') {
            $scope.errorUserExport = true;
            mess.Status = true;
        } else {
            $scope.errorUserExport = false;
        }

        return mess;
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            //if ($scope.model.ListProduct.length == 0 && $scope.model.ListPoProduct.length == 0) {
            //    App.toastrError(caption.MES_MSG_CHOSE_PRODUCT_WARE_HOURE);
            //    return;
            //}

            //if ($scope.IsEnabledExportLot == true) {
            //    if ($scope.model.ListPoProduct.length == 0) {
            //        App.toastrError(caption.MES_MSG_CHOSE_PRODUCT_WARE_HOURE);
            //        return;
            //    }
            //    else {
            //        var chk = false;
            //        var countQuantity = 0;
            //        angular.forEach($scope.model.ListPoProduct, function (value, key) {
            //            countQuantity = countQuantity + value.Quantity;
            //            if (value.Quantity > value.QuantityMax) {
            //                chk = true;
            //                value.Message = caption.MES_CURD_AMUONT_MAX_ALLOW;
            //                //return;
            //            }
            //            if (value.Quantity < 0 || value.Quantity == undefined) {
            //                chk = true;
            //                value.Message = caption.MES_MSG_AMOUNT_AM;
            //                //return;
            //            }
            //        })
            //        if (chk == true) {
            //            App.toastrError(caption.MES_MSG_ENTER_PRODUCT_MAX_OR_AM);
            //            return;
            //        }
            //        if (countQuantity == 0) {
            //            App.toastrError(caption.MES_CURD_AMUONT_ONE_PEOPLE_ZERO);
            //            return;
            //        }
            //    }
            //}
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                var msg = $rootScope.checkData($scope.model);
                if (msg.Status) {
                    App.toastrError(msg.Title);
                    return;
                } else {
                    if ($scope.isNotSave) {
                        dataservice.insert($scope.model, function (rs) {rs=rs.data;
                            if (rs.Error) {
                                var type = "ODD";
                                if ($rootScope.IsEnabledExportLot) {
                                    type = "PO";
                                } else {
                                    $scope.model.LotProductCode = '';
                                };
                                dataservice.createTicketCode(type, function (rs) {rs=rs.data;
                                    $scope.model.TicketCode = rs.Object;
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
                        dataservice.update($scope.model, function (rs) {rs=rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                            }
                        });
                    }
                }
            }
        }
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
                $scope.message = caption.MES_MSG_CODE_EXIST_TRANSFER_TO + " " + ticketCode;
                $scope.ok = function () {
                    dataservice.insert(para.model, function (rs) {rs=rs.data;
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

    $scope.addCustomer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataservice.getListCustomer(function (rs) {rs=rs.data;
                $scope.listCustomer = rs;
            });
        }, function () {
        });
    }
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, para, $window) {
    $rootScope.rootId = para;

    var vm = $scope;
    //Khởi tạo
    $scope.modelShow = {
        ProductQrCode: ''
    };

    $scope.model = {};
    $scope.model.Title = '';

    $scope.model.StoreCode = '';
    $scope.model.CusCode = '';
    $scope.model.Reason = 'EXP_TO_SALE';
    $scope.model.StoreCodeReceipt = '';
    $scope.model.TimeTicketCreate = $filter('date')(new Date(), 'dd/MM/yyyy');
    $scope.model.UserExport = '';
    $scope.model.Note = '';
    $scope.model.UserReceipt = '';
    $scope.model.InsurantTime = '';

    $scope.init = function () {
        $scope.model.LotProductCode = null;
        //$scope.model.TicketCode = '';
        //$scope.model.CostTotal = null;
        //$scope.model.Discount = null;
        //$scope.model.TaxTotal = null;
        //$scope.model.Commission = null;
        //$scope.model.TotalMustPayment = null;
        //$scope.model.TotalPayed = 0;
        $scope.model.ListProduct = [];
        $scope.model.ListPoProduct = [];
        $scope.modelList = {
            ProductCode: '',
            ProductName: '',
            RackCode: '',
            RackName: '',
            ProductQrCode: '',
            sProductQrCode: '',
            Quantity: null,
            Unit: '',
            UnitName: '',
            SalePrice: null,
            TaxRate: 10,
            Discount: 0,
            Commission: 0,
        };
    }
    $scope.init();
    $scope.IsEnabledExportLot = false;
    $rootScope.IsEnabledExportLot = false;
    $scope.modelDisable = true;
    $scope.maxQuantity = 0;
    $scope.listCoil = [];
    //Luôn luôn có Store code rồi nên biến này = false
    $scope.disableChoiseProduct = false;

    $scope.initLoad = function () {
        dataservice.getListUnit(function (rs) {rs=rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListStore(function (rs) {rs=rs.data;
            $scope.listStore = rs;
            $scope.listStoreReceipt = rs;
            $rootScope.MapStores = {};
            for (var i = 0; i < rs.length; ++i) {
                $rootScope.MapStores[rs[i].Code] = rs[i];
            }
        });
        dataservice.getListContract(function (rs) {rs=rs.data;
            $scope.listContract = rs;
        });
        dataservice.getListCustomer(function (rs) {rs=rs.data;
            $scope.listCustomer = rs;
        });
        dataservice.getListUserExport(function (rs) {rs=rs.data;
            $scope.listUserExport = rs;
        });
        dataservice.getListReason(function (rs) {rs=rs.data;
            $scope.listReason = rs;
        });
        dataservice.getListCurrency(function (rs) {rs=rs.data;
            $scope.listCurrency = rs;
        });
        dataservice.getListPaymentStatus(function (rs) {rs=rs.data;
            $scope.listPaymentStatus = rs;
        });

        dataservice.getItem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object.Header;
                $scope.model.ListPoProduct = rs.Object.ListPoProduct;

                dataservice.getListProductGrid($rootScope.rootId, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        $scope.model.ListProduct = rs.Object.ListProduct;
                    }
                });


                if ($scope.model.LotProductCode != '') {
                    $scope.IsEnabledExportLot = true;
                    $rootScope.IsEnabledExportLot = true;

                    dataservice.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {rs=rs.data;
                        $scope.listLotProduct = rs;
                    });
                }
                else {
                    //Không theo lô thì không cần lấy danh sách lô
                    //dataservice.getListLotProduct(function (rs) {rs=rs.data;
                    //    $scope.listLotProduct = rs;
                    //});
                }

                dataservice.getListProductCode($scope.model.StoreCode, function (rs) {rs=rs.data;
                    $scope.listProduct = rs;
                });
            }
        });
    }
    $scope.initLoad();


    $scope.reloadGridDetail = function () {
        debugger
        dataservice.getListProductGrid($rootScope.rootId, function (rs) {rs=rs.data;
            debugger
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model.ListProduct = rs.Object.ListProduct;
            }
        });
    }

    $rootScope.refeshData = function (id) {
        dataservice.getItem(id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object.Header;
                $scope.model.ListPoProduct = rs.Object.ListPoProduct;

                dataservice.getListProductGrid($rootScope.rootId, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        $scope.model.ListProduct = rs.Object.ListProduct;
                    }
                });

                if ($scope.model.LotProductCode != '') {
                    $scope.IsEnabledExportLot = true;
                    $rootScope.IsEnabledExportLot = true;

                    dataservice.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {rs=rs.data;
                        $scope.listLotProduct = rs;
                    });
                }
                else {
                    //Không theo lô thì không cần lấy danh sách lô
                    //dataservice.getListLotProduct(function (rs) {rs=rs.data;
                    //    $scope.listLotProduct = rs;
                    //});
                }

                dataservice.getListProductCode($scope.model.StoreCode, function (rs) {rs=rs.data;
                    $scope.listProduct = rs;
                });
            }
        });
    }

    //Load init date
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }
    function loadDate() {
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
        var today = new Date(new Date());
        $('#InsurantTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    setTimeout(function () {
        loadDate();
        loadPoper();
    }, 200);
    //Hết khởi tạo

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reloadRoot();
    }

    //Hàm lựa chọn/bỏ lựa chọn nhập theo lô
    $scope.checkedExportLot = function (chk) {
        $scope.init();
        $rootScope.IsEnabledExportLot = chk;
        $scope.errorLotProductCode = false;
        //if (chk) {
        //}
        //else {
        //    $scope.model.LotProductCode = '';
        //    $scope.model.StoreCode = '';
        //    $scope.model.Currency = '';
        //}
    }

    ////Hàm add sản phẩm vào list chi tiết
    //$scope.add = function () {
    //    //Check null
    //    if ($scope.modelList.ProductQrCode == undefined || $scope.modelList.ProductQrCode == null || $scope.modelList.ProductQrCode == '' ||
    //        $scope.modelList.RackCode == undefined || $scope.modelList.RackCode == null || $scope.modelList.RackCode == '' ||
    //        $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == '' ||
    //        $scope.modelList.ProductCoil == undefined || $scope.modelList.ProductCoil == null || $scope.modelList.ProductCoil == '' ||
    //        $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
    //    ) {
    //        App.toastrError('Nhập các thông tin bắt buộc');
    //    }
    //    else {
    //        //Check xem đã có trong list chưa
    //        //var listCheck = $scope.model.ListProduct.map(function (obj, index) { return { ProductQrCode: obj.ProductQrCode, RackCode: obj.RackCode } });
    //        //var objCheck = {
    //        //    ProductQrCode: $scope.modelList.ProductQrCode,
    //        //    RackCode: $scope.modelList.RackCode
    //        //};
    //        //var indexCheck = listCheck.indexOf(objCheck);
    //        //var index = $scope.model.ListProduct.map(function (obj, index) { return obj.ProductQrCode }).indexOf($scope.modelList.ProductQrCode);

    //        //var indexCheck = -1;
    //        //var elementCheck = $scope.model.ListProduct.find(function (element) {
    //        //    debugger
    //        //    if (element.ProductQrCode == $scope.modelList.ProductQrCode && element.RackCode == $scope.modelList.RackCode) {
    //        //        indexCheck = 0;
    //        //        return element;
    //        //    }
    //        //});
    //        if ($scope.maxQuantity < $scope.modelList.Quantity) {
    //            App.toastrError(caption.MES_MSG_AMOUNT_PRODUCT_ENTER);
    //        }
    //        else {
    //            //var check = $scope.model.ListProduct.filter(k => k.ProductQrCode == $scope.modelList.ProductQrCode && k.RackCode == $scope.modelList.RackCode);
    //            //if (check.length == 0) {

    //            //} else {
    //            //    if (check.length == 1) {
    //            //        check[0].Quantity = check[0].Quantity + $scope.modelList.Quantity;
    //            //        $scope.maxQuantity = $scope.maxQuantity - $scope.modelList.Quantity;
    //            //    } else {
    //            //        App.toastrError("Danh sách sản phẩm đã tồn tại");
    //            //    }
    //            //}
    //            var addItem = {
    //                ProductCoil: $scope.modelList.ProductCoil,
    //                ProductLot: $scope.modelList.ProductLot,
    //                ProductCode: $scope.modelList.ProductCode,
    //                ProductType: $scope.modelList.ProductType,
    //                ProductName: $scope.modelList.ProductName,
    //                ProductQrCode: $scope.modelList.ProductQrCode,
    //                sProductQrCode: $scope.modelList.sProductQrCode,
    //                RackCode: $scope.modelList.RackCode,
    //                RackName: $scope.modelList.RackName,
    //                Quantity: $scope.modelList.Quantity,
    //                Unit: $scope.modelList.Unit,
    //                UnitName: $scope.modelList.UnitName,
    //            };
    //            $scope.model.ListProduct.push(addItem);
    //            var elementCheckListCoil = $scope.listCoil.find(function (element) {
    //                if (element.ProductCoil == $scope.modelList.ProductCoil) {
    //                    if (element.Remain == $scope.modelList.Quantity) {
    //                        element.Remain = 0;
    //                        $scope.modelList.Quantity = 0;

    //                        var index = $scope.listCoil.indexOf(element);
    //                        $scope.listCoil.splice(index, 1);
    //                    }

    //                    if (element.Remain > $scope.modelList.Quantity) {
    //                        element.Remain = element.Remain - $scope.modelList.Quantity;
    //                        $scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
    //                    }
    //                    return element;
    //                }
    //            });
    //        }
    //    }
    //}
    //Hàm add sản phẩm vào list chi tiết - Update 19.07.24 : Thêm trực tiếp vào DB
    $scope.add = function () {
        //Check null
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' ||
            //$scope.modelList.RackCode == undefined || $scope.modelList.RackCode == null || $scope.modelList.RackCode == '' ||
            $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == '' ||
            $scope.modelList.ProductCoil == undefined || $scope.modelList.ProductCoil == null || $scope.modelList.ProductCoil == '' ||
            $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
        ) {
            App.toastrError(caption.MES_MSG_ENTER_INFO_REQUIRED);
        }
        else {
            if ($scope.modelList.Quantity > $scope.maxQuantity) {
                App.toastrError(caption.MES_MSG_AMOUNT_PRODUCT_ENTER);
            }
            else {
                var addItem = {
                    TicketCode: $scope.model.TicketCode,
                    ProductCoil: $scope.modelList.ProductCoil,
                    ProductLot: $scope.modelList.ProductLot,
                    ProductCode: $scope.modelList.ProductCode,
                    ProductType: $scope.modelList.ProductType,
                    ProductName: $scope.modelList.ProductName,
                    ProductQrCode: $scope.modelList.ProductQrCode,
                    sProductQrCode: $scope.modelList.sProductQrCode,
                    RackCode: $scope.modelList.RackCode,
                    RackName: $scope.modelList.RackName,
                    Quantity: $scope.modelList.Quantity,
                    Unit: $scope.modelList.Unit,
                    UnitName: $scope.modelList.UnitName,
                };

                dataservice.insertDetailProductOdd(addItem, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        //Thay đổi các giá trị tổng
                        $scope.maxQuantity = $scope.maxQuantity - addItem.Quantity;
                        $scope.modelList.Quantity = 0;

                        var elementCheckListCoil = $scope.listCoil.find(function (element) {
                            if (element.ProductCoil == $scope.modelList.ProductCoil) {
                                if (element.Remain == $scope.modelList.Quantity) {
                                    //element.Remain = 0;
                                    //$scope.modelList.Quantity = 0;

                                    var index = $scope.listCoil.indexOf(element);
                                    //$scope.listCoilChoose.push(element);
                                    $scope.listCoil.splice(index, 1);
                                }

                                if (element.Remain > $scope.modelList.Quantity) {
                                    element.Remain = element.Remain - $scope.modelList.Quantity;
                                    //$scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
                                }
                                return element;
                            }
                        });

                        $scope.reloadGridDetail();
                        App.toastrSuccess(rs.Title);
                    }
                });
            }
        }
    }

    $scope.openLog = function () {
        dataservice.getUpdateLog($scope.model.TicketCode, function (rs) {rs=rs.data;
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
    ////Hàm remove sản phẩm
    //$scope.removeItem = function (item, index) {
    //    //Lấy lại giá trị model vừa xóa đưa lên chỗ add
    //    $scope.modelList.ProductCode = item.ProductCode;
    //    $scope.modelList.ProductType = item.ProductType;
    //    $scope.modelList.ProductName = item.ProductName;
    //    $scope.modelList.ProductQrCode = item.ProductQrCode;
    //    $scope.modelList.sProductQrCode = item.sProductQrCode;
    //    $scope.modelList.RackCode = item.RackCode;
    //    $scope.modelList.RackName = item.RackName;
    //    $scope.modelList.Quantity = item.Quantity;
    //    $scope.modelList.Unit = item.Unit;
    //    $scope.modelList.UnitName = item.UnitName;

    //    //Show label QR_Code sản phẩm
    //    $scope.modelShow.ProductQrCode = $scope.modelList.ProductQrCode;

    //    //get ra list rackcode
    //    dataservice.getListRackCode($scope.modelList.ProductQrCode, function (rs) {rs=rs.data;
    //        $scope.listRackCode = rs;
    //        //lấy giá trị max Quantity
    //        angular.forEach($scope.listRackCode, function (value, key) {
    //            if (value.Code == $scope.modelList.RackCode) {
    //                $scope.maxQuantity = value.Quantity + item.Quantity;
    //            }
    //        })
    //    });


    //    //Check xem đã có trong list chưa
    //    $scope.model.ListProduct.splice(index, 1);

    //    ////Thay đổi các giá trị tổng
    //    //$scope.model.CostTotal = $scope.model.CostTotal - item.Total;
    //    //$scope.model.Discount = $scope.model.Discount - item.DiscountTotal;
    //    //$scope.model.TaxTotal = $scope.model.TaxTotal - item.TaxTotal;
    //    //$scope.model.Commission = $scope.model.Commission - item.CommissionTotal;
    //    //$scope.model.TotalMustPayment = $scope.model.CostTotal - ($scope.model.Discount + $scope.model.TaxTotal + $scope.model.Commission);
    //}

    //Hàm remove sản phẩm
    $scope.removeItem = function (item, index) {
        debugger
        dataservice.deleteDetailProductOdd(item.Id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                //Lấy lại giá trị model vừa xóa đưa lên chỗ add
                $scope.modelList.ProductCode = item.ProductCode;
                $scope.modelList.ProductType = item.ProductType;
                $scope.modelList.ProductName = item.ProductName;
                $scope.modelList.ProductCoil = item.ProductCoil;
                $scope.modelList.ProductLot = item.ProductLot == undefined ? '' : item.ProductLot;
                $scope.modelList.ProductQrCode = item.ProductQrCode;
                $scope.modelList.sProductQrCode = item.sProductQrCode;
                $scope.modelList.RackCode = item.RackCode;
                $scope.modelList.RackName = item.RackName;
                $scope.modelList.Quantity = item.Quantity;
                $scope.modelList.Unit = item.Unit;
                $scope.modelList.UnitName = item.UnitName;

                debugger
                //Lấy ra list ProductLot
                dataservice.getListProductLot($scope.modelList.ProductCode, $scope.model.StoreCode, function (rs) {rs=rs.data;
                    $scope.listLot = rs.Object;
                });

                //Lấy ra list CoidCode
                dataservice.getPositionProductCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, $scope.model.StoreCode, function (rs) {rs=rs.data;
                    if (!rs.Error) {
                        $scope.listCoil = rs.Object;

                        //lấy giá trị max Quantity
                        angular.forEach($scope.listCoil, function (value, key) {
                            debugger
                            if (value.ProductCoil == $scope.modelList.ProductCoil) {
                                $scope.maxQuantity = value.Remain;
                            }
                        })

                    }
                });

                $scope.reloadGridDetail();
                App.toastrSuccess(rs.Title);
            }
        });
    }
    //Hàm nhập sản phẩm/vị trí/số lượng xuất
    $scope.choiseProduct = function (item, index) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            Model: $scope.model,
            Product: item,
            Index: index,
            StoreCode: $scope.model.StoreCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/choiseProduct.html',
            controller: 'choiseProduct',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined && d != null) {
                item.ListProductInRack = d.ListProduct;
                item.Quantity = d.QuantityTotal;
            }
        }, function () {
        });

    }
    //Thống kê lượng tồn cuộn/thùng
    $scope.reportInStock = function (item, index) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            Product: item,
            Index: index,
            StoreCode: $scope.model.StoreCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportInStock.html',
            controller: 'reportInStock',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
            //if (d != undefined && d != null) {
            //    item.ListProductInRack = d.ListProduct;
            //    item.Quantity = d.QuantityTotal;
            //}
        }, function () {
        });

    }
    $scope.reportLotInStock = function (item, index) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            Product: item,
            Index: index,
            StoreCode: $scope.model.StoreCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportLotInStock.html',
            controller: 'reportLotInStock',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
            //if (d != undefined && d != null) {
            //    item.ListProductInRack = d.ListProduct;
            //    item.Quantity = d.QuantityTotal;
            //}
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

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        //Hàm chọn 1 lô để nhập
        if (SelectType == "LotProductCode") {
            $rootScope.LotProductCode = item.Code;
            $scope.model.Reason = 'EXP_TO_SALE';
            $scope.model.StoreCodeReceipt = '';

            dataservice.getLotProduct(item.Code, $scope.model.StoreCode, function (rs) {rs=rs.data;
                $scope.model.CusCode = rs.CusCode;

                $scope.model.ListPoProduct = rs.ListProduct;
                $scope.model.ListProduct = [];
            });

            //Bỏ validate
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                $scope.errorLotProductCode = false;
            }
        }
        if (SelectType == "ProductQrCode") {
            $scope.modelList.Unit = item.Unit;
            $scope.modelList.UnitName = item.UnitName;
            $scope.modelList.ProductCode = item.ProductCode;
            $scope.modelList.ProductName = item.Name;
            $scope.modelList.ProductType = item.ProductType;
            $scope.modelList.SupCode = item.SupCode;
            $scope.modelList.SupName = item.SupName;

            //Xóa vị trí kệ, số lượng
            $scope.modelList.Quantity = null;
            $scope.modelList.RackCode = '';
            $scope.modelList.RackName = '';
            $scope.maxQuantity = 0;

            //Show label QR_Code sản phẩm
            $scope.modelShow.ProductQrCode = item.Code;
            dataservice.getListRackCode($scope.modelList.ProductQrCode, function (rs) {rs=rs.data;
                $scope.listRackCode = rs;
            });

            dataservice.getListProductLot($scope.modelList.ProductCode, $scope.model.StoreCode, function (rs) {rs=rs.data;
                $scope.listLot = rs.Object;
                $scope.modelList.ProductLot = '';
            });
        }
        if (SelectType == "ProductLot") {
            dataservice.getListRackCode($scope.modelList.ProductQrCode, function (rs) {rs=rs.data;
                $scope.listRackCode = rs;
            });

            dataservice.getPositionProductCode($scope.modelList.ProductCode, item.Code, $scope.model.StoreCode, function (rs) {rs=rs.data;
                if (!rs.Error) {
                    $scope.listCoil = rs.Object;
                    $scope.modelList.ProductCoil = '';

                    //if ($scope.model.ListProduct.length > 0) {
                    //    for (var i = 0; i < $scope.model.ListProduct.length; i++) {

                    //        var elementCheckListCoil = $scope.listCoil.find(function (element) {
                    //            if (element.ProductCoil == $scope.model.ListProduct[i].ProductCoil) {
                    //                if (element.Remain == $scope.modelList.Quantity) {
                    //                    element.Remain = 0;
                    //                    $scope.modelList.Quantity = 0;

                    //                    var index = $scope.listCoil.indexOf(element);
                    //                    $scope.listCoil.splice(index, 1);
                    //                }

                    //                if (element.Remain > $scope.modelList.Quantity) {
                    //                    element.Remain = element.Remain - $scope.modelList.Quantity;
                    //                    $scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
                    //                }
                    //                return element;
                    //            }
                    //        });
                    //    }
                    //}
                }
            });
        }
        if (SelectType == "ProductCoil") {
            $scope.modelList.ProductCoil = item.ProductCoil;
            $scope.modelList.RackCode = item.RackCode;
            $scope.modelList.RackName = item.PositionInStore;
            $scope.modelList.ProductQrCode = item.ProductQrCode;
            $scope.modelList.Quantity = item.Remain;
            $scope.maxQuantity = item.Remain;
            angular.forEach($scope.listRackCode, function (value, key) {
                if (value.Code == $scope.modelList.RackCode) {
                    $scope.modelList.RackName = value.Name;
                }
            })

            dataservice.generatorQRCode($scope.modelList.ProductQrCode, function (result) {result=result.data;
                $scope.modelList.sProductQrCode = result;
            });
        }
        if (SelectType == "RackCode") {
            $scope.modelList.RackCode = item.Code;
            $scope.modelList.RackName = item.Name;
            $scope.modelList.Quantity = item.Quantity;
            $scope.maxQuantity = item.Quantity;
        }
        if (SelectType == "StoreCode") {
            $scope.disableChoiseProduct = false;

            $scope.model.ListProduct = [];
            $scope.modelList = {};
            dataservice.getListProductCode($scope.model.StoreCode, function (rs) {rs=rs.data;
                $scope.listProduct = rs;
                if (rs.length == 0) {
                    App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                }
            });
            if ($scope.model.StoreCode != undefined && $scope.model.StoreCode != null && $scope.model.StoreCode != '') {
                $scope.errorStoreCode = false;
            }
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                dataservice.getLotProduct($scope.model.LotProductCode, $scope.model.StoreCode, function (rs) {rs=rs.data;
                    $scope.model.ListPoProduct = rs.ListProduct;
                    $scope.model.ListProduct = [];
                });
            }
        }
        if (SelectType == "Reason") {
            if ($scope.model.Reason != undefined && $scope.model.Reason != null && $scope.model.Reason != '') {
                $scope.errorReason = false;
            }
            if ($scope.model.Reason == 'EXP_TO_SALE') {
                $scope.model.StoreCodeReceipt = '';
            }
            else {
                $scope.model.ContractCode = '';
                $scope.model.CusCode = '';
            }
        }
        if (SelectType == "StoreCodeReceipt") {
            if ($scope.model.StoreCodeReceipt == $scope.model.StoreCode) {
                $scope.model.StoreCodeReceipt = '';
                App.toastrError(caption.MES_MSG_WARE_HOURE_GOTO_DEFERICEN);
            }
            if ($scope.model.StoreCodeReceipt != undefined && $scope.model.StoreCodeReceipt != null && $scope.model.StoreCodeReceipt != '') {
                $scope.errorStoreCodeReceipt = false;
            }
        }
        if (SelectType == "UserExport") {
            if ($scope.model.UserExport != undefined && $scope.model.UserExport != null && $scope.model.UserExport != '') {
                $scope.errorUserExport = false;
            }
        }
        if (SelectType == "ContractCode") {
            dataservice.getCustomer(item.Code, function (rs) {rs=rs.data;
                $scope.model.CusCode = rs;
            });
        }
    }

    //Validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null lô hàng khi chọn xuất theo lô
        if ($scope.IsEnabledExportLot == true && (data.LotProductCode == undefined || data.LotProductCode == null || data.LotProductCode == '')) {
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
        if ($scope.model.Reason == 'EXP_TO_MOVE_STORE' && (data.StoreCodeReceipt == undefined || data.StoreCodeReceipt == null || data.StoreCodeReceipt == '')) {
            $scope.errorStoreCodeReceipt = true;
            mess.Status = true;
        } else {
            $scope.errorStoreCodeReceipt = false;
        }

        //Check null nhân viên xuất
        if (data.UserExport == undefined || data.UserExport == null || data.UserExport == '') {
            $scope.errorUserExport = true;
            mess.Status = true;
        } else {
            $scope.errorUserExport = false;
        }

        return mess;
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                var msg = $rootScope.checkData($scope.model);
                if (msg.Status) {
                    App.toastrError(msg.Title);
                    return;
                } else {
                    dataservice.update($scope.model, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            }

        }


    }

    $scope.addCustomer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataservice.getListCustomer(function (rs) {rs=rs.data;
                $scope.listCustomer = rs;
            });
        }, function () {
        });
    }

    $scope.export = function () {
        location.href = "/Admin/MaterialExpStore/ExportExcelProduct?"
            + "ticketCode=" + $scope.model.TicketCode
    }
});

app.controller('choiseProduct', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, para) {
    var vm = $scope;
    //Khởi tạo
    $scope.modelShow = {
        ProductQrCode: ''
    };

    $scope.isAdd = true;
    $scope.model = {};
    $scope.model.ListProduct = [];
    $scope.modelList = {
        ProductCode: '',
        ProductName: '',
        RackCode: '',
        RackName: '',
        ProductQrCode: '',
        sProductQrCode: '',
        Quantity: null,
        Unit: '',
        UnitName: '',
    };

    $scope.listCoil = [];
    $scope.listCoilChoose = [];

    $scope.init = function () {
        if (para.Product.Quantity != undefined && para.Product.Quantity != null && para.Product.Quantity > 0) {
            $scope.model.QuantityTotal = para.Product.Quantity;
            $scope.model.QuantityOrder = para.Product.QuantityOrder;
            $scope.model.QuantityNeedExport = para.Product.QuantityOrder - para.Product.Quantity;
            //$scope.model.ListProduct = para.Product.ListProductInRack;
        }
        else {
            $scope.model.QuantityTotal = 0;
            $scope.model.QuantityOrder = para.Product.QuantityOrder;
            $scope.model.QuantityNeedExport = para.Product.QuantityOrder;
            //$scope.model.ListProduct = [];
        }

    }
    $scope.init();
    $scope.modelDisable = true;
    $scope.maxQuantity = 0;

    $scope.initLoad = function () {
        dataservice.getListUnit(function (rs) {rs=rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListProduct4QrCode(para.StoreCode, para.Product.ProductCode, para.Product.ProductType, function (rs) {rs=rs.data;
            $scope.listProduct = rs;
        });
        dataservice.getListGridProduct(para.Model.TicketCode, para.Product.ProductCode, para.Product.ProductType, function (rs) {rs=rs.data;
            $scope.model.ListProduct = rs;
        });
    }
    $scope.initLoad();
    //Hết khởi tạo

    $scope.reloadGrid = function (param1, param2, param3) {
        dataservice.getListGridProduct(para.Model.TicketCode, para.Product.ProductCode, para.Product.ProductType, function (rs) {rs=rs.data;
            $scope.model.ListProduct = rs;
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.refeshData($rootScope.rootId);
        //$rootScope.reloadRoot();
    }

    //Hàm add sản phẩm vào list chi tiết
    $scope.add = function () {
        //Check null
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' ||
            //$scope.modelList.RackCode == undefined || $scope.modelList.RackCode == null || $scope.modelList.RackCode == '' ||
            $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == '' ||
            $scope.modelList.ProductCoil == undefined || $scope.modelList.ProductCoil == null || $scope.modelList.ProductCoil == '' ||
            $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
        ) {
            App.toastrError(caption.MES_MSG_ENTER_INFO_REQUIRED);
        }
        else {
            if ($scope.modelList.Quantity > $scope.model.QuantityNeedExport) {
                App.toastrError(caption.MES_MSG_TOTAL_GREATER_THAN_EXP);
            }
            else {

                if ($scope.modelList.Quantity > $scope.maxQuantity) {
                    App.toastrError(caption.MES_MSG_AMOUNT_PRODUCT_ENTER);
                }
                else {
                    var addItem = {
                        TicketCode: para.Model.TicketCode,
                        ProductCoil: $scope.modelList.ProductCoil,
                        ProductLot: $scope.modelList.ProductLot,
                        ProductCode: $scope.modelList.ProductCode,
                        ProductType: $scope.modelList.ProductType,
                        ProductName: $scope.modelList.ProductName,
                        ProductQrCode: $scope.modelList.ProductQrCode,
                        sProductQrCode: $scope.modelList.sProductQrCode,
                        RackCode: $scope.modelList.RackCode,
                        RackName: $scope.modelList.RackName,
                        Quantity: $scope.modelList.Quantity,
                        Unit: $scope.modelList.Unit,
                        UnitName: $scope.modelList.UnitName,
                    };

                    dataservice.insertDetailProductCoid(addItem, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            $scope.reloadGrid(addItem.TicketCode, addItem.ProductCode, addItem.ProductType);
                            debugger
                            //Thay đổi các giá trị tổng
                            $scope.model.QuantityTotal = $scope.model.QuantityTotal + addItem.Quantity;
                            $scope.model.QuantityNeedExport = $scope.model.QuantityNeedExport - addItem.Quantity;
                            $scope.maxQuantity = $scope.maxQuantity - addItem.Quantity;

                            var elementCheckListCoil = $scope.listCoil.find(function (element) {
                                if (element.ProductCoil == $scope.modelList.ProductCoil) {
                                    debugger
                                    if (element.Remain == $scope.modelList.Quantity) {
                                        element.Remain = 0;
                                        //$scope.modelList.Quantity = 0;

                                        var index = $scope.listCoil.indexOf(element);
                                        $scope.listCoilChoose.push(element);
                                        $scope.listCoil.splice(index, 1);
                                    }

                                    if (element.Remain > $scope.modelList.Quantity) {
                                        element.Remain = element.Remain - $scope.modelList.Quantity;
                                        //$scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
                                    }
                                    return element;
                                }
                            });

                            $scope.modelList.Quantity = $scope.model.QuantityNeedExport;

                            App.toastrSuccess(rs.Title);
                        }
                    });
                }
            }
        }
    }
    ////Hàm edit sản phẩm
    //$scope.edit = function (item, index) {
    //    debugger
    //    $scope.isAdd = false;

    //    //Thay đổi các giá trị tổng
    //    //$scope.model.QuantityTotal = $scope.model.QuantityTotal - item.Quantity;
    //    $scope.model.QuantityNeedExport = $scope.model.QuantityNeedExport + item.Quantity;
    //    ////$scope.modelList.Quantity = $scope.model.QuantityNeedExport;

    //    //Lấy ra list ProductLot
    //    dataservice.getListProductLot(item.ProductCode, para.StoreCode, function (rs) {rs=rs.data;
    //        $scope.listLot = rs.Object;
    //    });

    //    //Lấy ra list CoilCode
    //    dataservice.getPositionProductCode(item.ProductCode, item.ProductLot, para.StoreCode, function (rs) {rs=rs.data;
    //        if (!rs.Error) {
    //            $scope.listCoil = rs.Object;

    //            //lấy giá trị max Quantity
    //            angular.forEach($scope.listCoil, function (value, key) {
    //                if (value.ProductCoil == item.ProductCoil) {
    //                    $scope.maxQuantity = value.Remain + item.Quantity;
    //                }
    //            })
    //        }
    //    });

    //    //Lấy lại giá trị model đưa lên chỗ add
    //    $scope.modelList.ProductCode = item.ProductCode;
    //    $scope.modelList.ProductType = item.ProductType;
    //    $scope.modelList.ProductName = item.ProductName;
    //    $scope.modelList.ProductCoil = item.ProductCoil;
    //    $scope.modelList.ProductLot = item.ProductLot;
    //    $scope.modelList.ProductQrCode = item.ProductQrCode;
    //    $scope.modelList.sProductQrCode = item.sProductQrCode;
    //    $scope.modelList.RackCode = item.RackCode;
    //    $scope.modelList.RackName = item.RackName;
    //    $scope.modelList.Quantity = item.Quantity;
    //    $scope.modelList.Unit = item.Unit;
    //    $scope.modelList.UnitName = item.UnitName;
    //}
    //$scope.close = function (id) {
    //    $scope.isAdd = true;
    //    $scope.modelList = {
    //        ProductCode: '',
    //        ProductName: '',
    //        RackCode: '',
    //        RackName: '',
    //        ProductQrCode: '',
    //        sProductQrCode: '',
    //        Quantity: null,
    //        Unit: '',
    //        UnitName: '',
    //    };
    //    $scope.init();
    //    $scope.initLoad();
    //}
    //Hàm remove sản phẩm
    $scope.removeItem = function (item, index) {
        dataservice.deleteDetailProductCoid(item.Id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.reloadGrid(item.TicketCode, item.ProductCode, item.ProductType);

                //Lấy lại giá trị model vừa xóa đưa lên chỗ add
                $scope.modelList.ProductCode = item.ProductCode;
                $scope.modelList.ProductType = item.ProductType;
                $scope.modelList.ProductName = item.ProductName;
                $scope.modelList.ProductCoil = item.ProductCoil;
                $scope.modelList.ProductLot = item.ProductLot == undefined ? '' : item.ProductLot;
                $scope.modelList.ProductQrCode = item.ProductQrCode;
                $scope.modelList.sProductQrCode = item.sProductQrCode;
                $scope.modelList.RackCode = item.RackCode;
                $scope.modelList.RackName = item.RackName;
                $scope.modelList.Quantity = item.Quantity;
                $scope.modelList.Unit = item.Unit;
                $scope.modelList.UnitName = item.UnitName;

                //Thay đổi các giá trị tổng
                $scope.model.QuantityTotal = $scope.model.QuantityTotal - item.Quantity;
                $scope.model.QuantityNeedExport = $scope.model.QuantityNeedExport + item.Quantity;
                //$scope.modelList.Quantity = $scope.model.QuantityNeedExport;

                //Lấy ra list ProductLot
                dataservice.getListProductLot($scope.modelList.ProductCode, para.StoreCode, function (rs) {rs=rs.data;
                    $scope.listLot = rs.Object;
                });

                //Lấy ra list CoidCode
                dataservice.getPositionProductCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, para.StoreCode, function (rs) {rs=rs.data;
                    if (!rs.Error) {
                        $scope.listCoil = rs.Object;

                        //lấy giá trị max Quantity
                        angular.forEach($scope.listCoil, function (value, key) {
                            debugger
                            if (value.ProductCoil == $scope.modelList.ProductCoil) {
                                $scope.maxQuantity = value.Remain;
                            }
                        })

                    }
                });

                App.toastrSuccess(rs.Title);
            }
        });
    }

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "ProductQrCode") {
            $scope.modelList.Unit = item.Unit;
            $scope.modelList.UnitName = item.UnitName;
            $scope.modelList.ProductCode = item.ProductCode;
            $scope.modelList.ProductName = item.Name;
            $scope.modelList.ProductType = item.ProductType;
            $scope.modelList.SupCode = item.SupCode;
            $scope.modelList.SupName = item.SupName;

            //Xóa vị trí kệ, số lượng
            $scope.modelList.Quantity = null;
            $scope.modelList.RackCode = '';
            $scope.modelList.RackName = '';
            $scope.maxQuantity = 0;

            //Show label QR_Code sản phẩm
            $scope.modelShow.ProductQrCode = item.Code;

            dataservice.getListRackCode($scope.modelList.ProductQrCode, function (rs) {rs=rs.data;
                $scope.listRackCode = rs;
            });

            dataservice.getListProductLot($scope.modelList.ProductCode, para.StoreCode, function (rs) {rs=rs.data;
                $scope.listLot = rs.Object;
                $scope.modelList.ProductLot = '';
            });
        }

        if (SelectType == "ProductLot") {
            dataservice.getListRackCode($scope.modelList.ProductQrCode, function (rs) {rs=rs.data;
                $scope.listRackCode = rs;
            });

            dataservice.getPositionProductCode($scope.modelList.ProductCode, item.Code, para.StoreCode, function (rs) {rs=rs.data;
                if (!rs.Error) {
                    $scope.listCoil = rs.Object;
                    $scope.modelList.ProductCoil = '';

                    //if ($scope.model.ListProduct.length > 0) {
                    //    for (var i = 0; i < $scope.model.ListProduct.length; i++) {

                    //        var elementCheckListCoil = $scope.listCoil.find(function (element) {
                    //            if (element.ProductCoil == $scope.model.ListProduct[i].ProductCoil) {
                    //                if (element.Remain == $scope.modelList.Quantity) {
                    //                    element.Remain = 0;
                    //                    $scope.modelList.Quantity = 0;

                    //                    var index = $scope.listCoil.indexOf(element);
                    //                    $scope.listCoil.splice(index, 1);
                    //                }
                    //                else if (element.Remain > $scope.modelList.Quantity) {
                    //                    element.Remain = element.Remain - $scope.modelList.Quantity;
                    //                    $scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
                    //                }

                    //                return element;
                    //            }
                    //        });
                    //    }
                    //}
                }
            });
        }

        if (SelectType == "ProductCoil") {
            $scope.modelList.ProductCoil = item.ProductCoil;
            $scope.modelList.RackCode = item.RackCode;
            $scope.modelList.RackName = item.PositionInStore;
            $scope.modelList.ProductQrCode = item.ProductQrCode;
            $scope.modelList.Quantity = item.Remain;
            $scope.maxQuantity = item.Remain;
            angular.forEach($scope.listRackCode, function (value, key) {
                if (value.Code == $scope.modelList.RackCode) {
                    $scope.modelList.RackName = value.Name;
                }
            })

            dataservice.generatorQRCode($scope.modelList.ProductQrCode, function (result) {result=result.data;
                $scope.modelList.sProductQrCode = result;
            });
        }
        if (SelectType == "RackCode") {
            $scope.modelList.RackCode = item.Code;
            $scope.modelList.RackName = item.Name;
            $scope.modelList.Quantity = item.Quantity;
            $scope.maxQuantity = item.Quantity;
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

    //Validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        return mess;
    };
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    //$scope.submit = function () {
    //    validationSelect($scope.model);
    //    if ($scope.model.ListProduct.length == 0) {
    //        App.toastrError(caption.MES_MSG_CHOSE_PRODUCT_WARE_HOURE);
    //        return;
    //    }
    //    if ($scope.model.QuantityTotal > para.Product.QuantityMax) {
    //        App.toastrError('Số lượng tổng cộng vượt quá lượng cần phải xuất.');
    //        return;
    //    }
    //    dataservice.update(para.Model, function (rs) {rs=rs.data;
    //        if (rs.Error) {
    //            App.toastrError('Cập nhật thất bại');
    //        } else {
    //            App.toastrSuccess('Cập nhật thành công');
    //            $rootScope.refeshData($rootScope.rootId);
    //        }
    //    });
    //}
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        loadPoper();
    }, 200);
});

app.controller('reportInStock', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, para) {
    var vm = $scope;
    $scope.model = {};

    $scope.listCoil = [];

    $scope.initLoad = function () {
        debugger
        //if (para.Product.ListProductInRack.length > 0) {
        //    var productQrCode = para.Product.ListProductInRack[0].ProductQrCode;
        var productQrCode = para.ProductQrCode;
        dataservice.getListCoilByProdQrCode(para.StoreCode, para.Product.ProductCode, para.Product.ProductType, productQrCode, function (rs) {rs=rs.data;
            $scope.listCoil = [];
            $scope.QuantityExpTotal = 0;
            $scope.RemainTotal = 0;
            if (rs.Object.length > 0) {
                for (var j = 0; j < rs.Object.length; j++) {
                    rs.Object[j].ValueCoil = rs.Object[j].Size;
                    rs.Object[j].QuantityExp = rs.Object[j].Size - rs.Object[j].Remain;
                    rs.Object[j].StoreCode = rs.Object[j].RackCode.split("_")[rs.Object[j].RackCode.split("_").length - 1];
                    var store = $rootScope.MapStores[rs.Object[j].StoreCode];
                    if (store != undefined) {
                        rs.Object[j].StoreName = store.Name;
                    }

                    var productCoil = rs.Object[j].ProductCoil;
                    rs.Object[j].RuleCoil = productCoil.split("_")[productCoil.split("_").length - 2];

                    if (rs.Object[j].StoreCode == para.StoreCode) {

                        $scope.QuantityExpTotal = $scope.QuantityExpTotal + rs.Object[j].QuantityExp;
                        $scope.RemainTotal = $scope.RemainTotal + rs.Object[j].Remain;

                        $scope.listCoil.push(rs.Object[j]);
                    }
                }
            }
        });
        //}
    }
    $scope.initLoad();
    //Hết khởi tạo

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadPoper();
    }, 200);
});

app.controller('reportLotInStock', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, para) {
    var vm = $scope;
    $scope.model = {};

    $scope.listLot = [];

    $scope.initLoad = function () {
        dataservice.getListLotByProdQrCode(para.StoreCode, para.Product.ProductCode, para.Product.ProductType, para.ProductQrCode, function (rs) {rs=rs.data;
            $scope.listLot = [];
            $scope.QuantityTotal = 0;
            $scope.QuantityUnitTotal = 0;
            if (rs.Object.length > 0) {
                for (var j = 0; j < rs.Object.length; j++) {
                    var store = $rootScope.MapStores[rs.Object[j].StoreCode];
                    if (store != undefined) {
                        rs.Object[j].StoreName = store.Name;
                    }

                    $scope.QuantityTotal = $scope.QuantityTotal + rs.Object[j].Quantity;
                    $scope.QuantityUnitTotal = $scope.QuantityUnitTotal + rs.Object[j].QuantityUnit;

                    $scope.listLot.push(rs.Object[j]);
                }
            }
        });
    }
    $scope.initLoad();
    //Hết khởi tạo

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadPoper();
    }, 200);
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