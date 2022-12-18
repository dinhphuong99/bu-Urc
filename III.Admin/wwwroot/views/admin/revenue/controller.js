﻿var ctxfolder = "/views/admin/revenue";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getTotal: function (data, callback) {
            $http.post('/Admin/Revenue/GetTotal', data).then(callback);
        },
        //getListStore: function (callback) {
        //    $http.post('/Admin/Revenue/GetListStore').then(callback);
        //},
        //getListCustomer: function (callback) {
        //    $http.post('/Admin/Revenue/GetListCustomer').then(callback);
        //},
        //getListUserExport: function (callback) {
        //    $http.post('/Admin/Revenue/GetListUserExport').then(callback);
        //},
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
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });


        //            required: true,
        //            maxlength: 255
        //        },
        //        ApplicationCode: {
        //            required: true,
        //            maxlength: 50
        //        },
        //        Ord: {
        //            required: true,
        //            maxlength: 5
        //        },
        //        AppUrl: {
        //            required: true,
        //            maxlength: 255
        //        }
        //    },
        //    messages: {
        //        Title: {
        //            required: caption.ERR_REQUIRED.replace('{0}', caption.APP_NAME),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace('{0}', caption.APP_NAME).replace('{1}', '255')
        //        },
        //        ApplicationCode: {
        //            required: caption.ERR_REQUIRED.replace("{0}", caption.APP_CODE),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace("{0}", caption.APP_CODE).replace("{1}", "50")
        //        },
        //        Ord: {
        //            required: caption.ERR_REQUIRED.replace("{0}", caption.ORDER),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace('{0}', caption.ORDER_SORT).replace('{1}', '5')
        //        },
        //        AppUrl: {
        //            required: caption.ERR_REQUIRED.replace("{0}", caption.URL_APP),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace("{0}", caption.URL_APP).replace("{1}", "255")
        //        }
        //    }
        //}

    });
    $rootScope.validationOptions = {
        rules: {
            Title: {
                required: true,
                maxlength: 255
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
                required: caption.RE_VALIDATE_TITLE,
                maxlength: caption.RE_VALIDATE_TITLE_EXCEED
            },
            TimeTicketCreate: {
                required: caption.RE_VALIDATE_CREATED_TIME
            },
            Note: {
                maxlength: caption.MES_CURD_VALIDATE_EXPSTORE_NOTE
            }
        }
    }
    $rootScope.ExpCode = '';
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {

    $translateProvider.useUrlLoader('/Admin/Revenue/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
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
            url: "/Admin/Revenue/jtable",
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('QrTicketCode').withTitle('{{"Mã Qr" | translate}}').renderWith(function (data, type, full, meta) {
    //    return '<img class=" image-upload h-50 w50" style="width:50px; height:50px" role="button" src="data:image/png;base64, ' + data + '" />';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCode').withTitle('{{"MES_LIST_COL_ESTORE_CODE" | translate}}').renderWith(function (data, type, full, meta) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeTicketCreate').withTitle('{{"RE_LIST_COL_TIME_TICKET_CREATE" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"Tiêu đề phiếu" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"Khách hàng" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{"MES_LIST_COL_ESTORE_NAME" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('UserExportName').withTitle('{{"Nhân viên xuất" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ReasonName').withTitle('{{"Lý do" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractTitle').withTitle('{{"RE_LIST_COL_CONTRACT_TITLE" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractNo').withTitle('{{"RE_LIST_COL_CONTRACT_NO" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CurrencyName').withTitle('{{"RE_LIST_COL_CURRENCY_NAME" | translate }}').renderWith(function (data) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CostTotal').withTitle('{{"RE_LIST_COL_COST_TOTAL" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Discount').withTitle('{{"RE_LIST_COL_DISCOUNT" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Commission').withTitle('{{"RE_LIST_COL_COMMISSION" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('Buget').withTitle('{{"Tổng tiền trước thuế" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RealBudget').withTitle('{{"RE_LIST_COL_REAL_BUDGET" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('currency')(data, '', 2) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BudgetExcludeTax').withTitle('{{"RE_LIST_COL_BUDGET_EXCLUDE_TAX" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('currency')(data, '', 2) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TaxTotal').withTitle('{{"RE_LIST_COL_TAX_TOTAL" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('currency')(data, '', 2) : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalMustPayment').withTitle('{{"Tổng phải trả" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPayed').withTitle('{{"Tổng đã trả" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('TimeTicketCreate').withTitle('{{"Ngày tạo phiếu" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"Ghi chú" | translate }}').renderWith(function (data) {
    //    return data;
    //}));

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
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MES_LIST_COL_ESTORE_ACTION" | translate }}').renderWith(function (data, type, full) {
    //    return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));
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
        $scope.getTotalValue();
    }
    $scope.reload = function () {
        reloadData(true);
        $scope.getTotalValue();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
        $scope.getTotalValue();
    };

    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '70'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}
    //$scope.edit = function (id) {
    //    var userModel = {};
    //    var listdata = $('#tblData').DataTable().data();
    //    for (var i = 0; i < listdata.length; i++) {
    //        if (listdata[i].Id == id) {
    //            userModel = listdata[i];
    //            break;
    //        }
    //    }
    //    $rootScope.ExpCode = userModel.ExpCode;
    //    dataservice.getItem(userModel.Id, function (rs) {rs=rs.data;
    //        if (rs.Error) {
    //            App.toastrError(rs.Title);
    //        } else {
    //            var modalInstance = $uibModal.open({
    //                animation: true,
    //                templateUrl: ctxfolder + '/edit.html',
    //                controller: 'edit',
    //                backdrop: 'static',
    //                size: '70',
    //                resolve: {
    //                    para: function () {
    //                        return rs.Object;
    //                    }
    //                }
    //            });
    //            modalInstance.result.then(function (d) {
    //                $scope.reloadNoResetPage();
    //            }, function () {
    //            });
    //        }
    //    });
    //}
    //$scope.edit = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: '70',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () { });
    //};
    //$scope.delete = function (id) {
    //    var modalInstance = $uibModal.open({
    //        templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
    //        windowClass: "message-center",
    //        controller: function ($scope, $uibModalInstance) {
    //            $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
    //            $scope.ok = function () {
    //                dataservice.delete(id, function (rs) {rs=rs.data;
    //                    if (rs.Error) {
    //                        App.toastrError(rs.Title);
    //                        $uibModalInstance.close();
    //                    } else {
    //                        App.toastrSuccess(rs.Title);
    //                        $uibModalInstance.close();
    //                    }
    //                });
    //            };

    //            $scope.cancel = function () {
    //                $uibModalInstance.dismiss('cancel');
    //            };
    //        },
    //        size: '25',
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () {
    //    });
    //}

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
            var from = $scope.model.FromDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#DateTo').datepicker('setStartDate', date);
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            var from = $scope.model.ToDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
    }, 200);


    $scope.initLoad = function () {
        //dataservice.getListStore(function (rs) {rs=rs.data;
        //    $scope.listStore = rs;
        //    $scope.listStoreReceipt = rs;
        //});
        //dataservice.getListCustomer(function (rs) {rs=rs.data;
        //    $scope.listCustomer = rs;
        //});
        //dataservice.getListUserExport(function (rs) {rs=rs.data;
        //    $scope.listUserExport = rs;
        //});

        setTimeout(function () {
            $scope.getTotalValue();
        }, 500);
    }
    $scope.initLoad();
    $scope.getTotalValue = function () {
        dataservice.getTotal($scope.model, function (result) {result=result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.totalBuget = result.totalBuget;
                $scope.totalRealBuget = result.totalRealBuget;
                $scope.totalBudgetExcludeTax = result.totalBudgetExcludeTax;
                $scope.totalTaxTotal = result.totalTaxTotal;
            }
        });
    };


    //Export Excel
    $scope.export = function () {
        var orderBy = 'Id DESC';
        var exportType = 0;
        var orderArr = $scope.dtInstance.DataTable.order();
        var column;
        if (orderArr.length == 2) {
            column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
            orderBy = column.mData + ' ' + orderArr[1];
        } else if (orderArr.length > 0) {
            var order = orderArr[0];
            column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
            orderBy = column.mData + ' ' + order[1];
        }
        //var pageInfo = $scope.dtInstance.DataTable.page.info();
        //var obj = {
        //    start: pageInfo.row,
        //    length: pageInfo.length,
        //    //QueryOrderBy: orderBy,
        //    ExportType: exportType,
        //    Month: $scope.model.CustomerMonth,
        //    Packcode: $scope.model.PackCode,
        //    Cif: $scope.model.CustomerCif
        //};

        var page = vm.dtInstance.DataTable.page() + 1;
        var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/Revenue/ExportExcel?"
            //+ "page=" + page
            //+ "&row=" + length
            + "FromDate=" + $scope.model.FromDate
            + "&ToDate=" + $scope.model.ToDate
            //+ "&LotProductCode=" + $scope.model.LotProductCode
            //+ "&ProductQrCode=" + $scope.model.ProductQrCode
        //+ "&orderBy=" + orderBy
    }
});
