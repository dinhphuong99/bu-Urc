var ctxfolder = "/views/admin/paramForWarning";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        gettreedata: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/GetTreeData', data).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/ParamForWarning/GetCurrency/').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/ParamForWarning/GetItem/', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/ParamForWarning/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/ParamForWarning/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/ParamForWarning/Delete/' + data).then(callback);
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
                Total: {
                    required: true,
                    maxlength: 100,
                    regx: /^[+]?\d+(\.\d+)?$/
                },
                FromTime: {
                    required: true
                },
                ToTime: {
                    required: true
                }
            },
            messages: {
                Total: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.PFW_LBL_TOTAL_LIMIT) + "<br/>",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.PFW_LBL_TOTAL_LIMIT).replace('{1}', "100") + "<br/>",
                    regx: caption.PFW_VALIDATE_NUM_NEGATIVE
                },
                FromTime: {
                    required: caption.PFW_CURD_VALIDATE_FROM_TIME,
                },
                ToTime: {
                    required: caption.PFW_CURD_VALIDATE_TO_TIME,
                }
            }
        }

    });
    $rootScope.DateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
    $rootScope.DateBeforeSevenDay = $filter('date')(new Date().setDate((new Date()).getDate() + (-7)), 'dd/MM/yyyy');
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ParamForWarning/Translation');
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
        AETType: '',
        CatCode: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ParamForWarning/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Total = $scope.model.Total;
                d.Curency = $scope.model.Curency;
                d.FromTime = $scope.model.FromTime;
                d.ToTime = $scope.model.ToTime;
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('catCode').withTitle('Mã danh mục').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('catName').withOption('sClass', 'dataTable-15per').withTitle('{{"PFW_COL_CAT_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('aettype').withOption('sClass', 'dataTable-10per').withTitle('{{"PFW_COL_AET_TYPE" | translate}}').renderWith(function (data, type) {
        if (data == "Receipt") {
            return "Thu";
        }
        else {
            return "Chi";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('total').withOption('sClass', 'dataTable-10per').withTitle('{{"PFW_COL_TOTAL" | translate}}').renderWith(function (data, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('currency').withOption('sClass', 'dataTable-10per').withTitle('{{"PFW_COL_CURRENCY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fromTime').withOption('sClass', 'dataTable-10per').withTitle('{{"PFW_COL_FROM_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('toTime').withOption('sClass', 'dataTable-10per').withTitle('{{"PFW_COL_TO_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
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
            size: '30',
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
            size: '30',
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
        //Yêu cầu từ ngày --> đến ngày
        $("#FromTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToTime').datepicker('setStartDate', maxDate);
        });
        $("#ToTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTime').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTime').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            debugger
            $('#ToTime').datepicker('setStartDate', null);
        });

    });

});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.model = {

        Currency: 'VND'
    }
    $scope.listAetType = [
        {
            Code: "Receipt",
            Name: "Thu"
        }, {
            Code: "Expense",
            Name: "Chi"
        }];

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.AETType == "" || data.AETType == null) {
            $scope.errorAETType = true;
            mess.Status = true;
        } else {
            $scope.errorAETType = false;

        }
        if (data.CatCode == "" || data.CatCode == null) {
            $scope.errorCatCode = true;
            mess.Status = true;
        } else {
            $scope.errorCatCode = false;

        }
        if (data.FromTime == "" || data.FromTime == null) {
            $scope.errorFromTime = true;
            mess.Status = true;
        } else {
            $scope.errorFromTime = false;

        }
        if (data.ToTime == "" || data.ToTime == null) {
            $scope.errorToTime = true;
            mess.Status = true;
        } else {
            $scope.errorToTime = false;

        }
        return mess;
    }


    $scope.initData = function () {
        dataservice.getCurrency(function (rs) {rs=rs.data;
            $scope.listCurrency = rs;
        });
        dataservice.gettreedata({ IdI: null }, function (result) {result=result.data;
            $scope.listCat = result;
        });
    }
    $scope.initData();
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "CatCode" && $scope.model.CatCode != "") {
            $scope.errorCatCode = false;
        } else if (SelectType == "CatCode") {
            $scope.errorCatCode = true;
        }
        if (SelectType == "AETType" && $scope.model.AETType != "") {
            $scope.errorAETType = false;
        } else if (SelectType == "AETType") {
            $scope.errorAETType = true;
        }
        //if (SelectType == "employeekind" && $scope.model.employeekind != "") {
        //    $scope.errorEmployeekind = false;
        //}
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
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
    function initDateTime() {

    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //Yêu cầu từ ngày --> đến ngày
        $("#FromTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToTime').datepicker('setStartDate', maxDate);
            if ($('#FromTime .input-date').valid()) {
                $('#FromTime .input-date').removeClass('invalid').addClass('success');
            }
        });
        $("#ToTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTime').datepicker('setEndDate', maxDate);
            if ($('#ToTime .input-date').valid()) {
                $('#ToTime .input-date').removeClass('invalid').addClass('success');
            }
        });
        $('.end-date').click(function () {
            $('#FromTime').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            debugger
            $('#ToTime').datepicker('setStartDate', null);
        });
    });
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model = {
        Currency: 'VND'
    }
    $scope.listAetType = [
        {
            Code: "Receipt",
            Name: "Thu"
        }, {
            Code: "Expense",
            Name: "Chi"
        }];

    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        dataservice.getCurrency(function (rs) {rs=rs.data;
            $scope.listCurrency = rs;
        });
        dataservice.gettreedata({ IdI: null }, function (result) {result=result.data;
            $scope.listCat = result;
        });
        dataservice.getItem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
                setTimeout(function () {
                    loadDate();
                    validateDefault(rs.FromTime, rs.ToTime);
                }, 100);
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
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
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "CatCode" && $scope.model.CatCode != "") {
            $scope.errorCatCode = false;
        } else if (SelectType == "CatCode") {
            $scope.errorCatCode = true;
        }
        if (SelectType == "AETType" && $scope.model.AETType != "") {
            $scope.errorAETType = false;
        } else if (SelectType == "AETType") {
            $scope.errorAETType = true;
        }
    }
    function validateDefault(from, to) {
        setStartDate("#ToTime", from);
        setEndDate("#FromTime", to);
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.AETType == "" || data.AETType == null) {
            $scope.errorAETType = true;
            mess.Status = true;
        } else {
            $scope.errorAETType = false;
        }
        if (data.CatCode == "" || data.CatCode == null) {
            $scope.errorCatCode = true;
            mess.Status = true;
        } else {
            $scope.errorCatCode = false;

        }
        if (data.FromTime == "" || data.FromTime == null) {
            $scope.errorFromTime = true;
            mess.Status = true;
        } else {
            $scope.errorFromTime = false;
        }
        if (data.ToTime == "" || data.ToTime == null) {
            $scope.errorToTime = true;
            mess.Status = true;
        } else {
            $scope.errorToTime = false;
        }
        return mess;
    }
    function loadDate() {
        $("#FromTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToTime').datepicker('setStartDate', maxDate);
            if ($('#FromTime .input-date').valid()) {
                $('#FromTime .input-date').removeClass('invalid').addClass('success');
            }
        });
        $("#ToTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTime').datepicker('setEndDate', maxDate);
            if ($('#ToTime .input-date').valid()) {
                $('#ToTime .input-date').removeClass('invalid').addClass('success');
            }
        })
        $('.end-date').click(function () {
            $('#FromTime').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#ToTime').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        $("#FromTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToTime').datepicker('setStartDate', maxDate);
            if ($('#FromTime .input-date').valid()) {
                $('#FromTime .input-date').removeClass('invalid').addClass('success');
            }
        });
        $("#ToTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTime').datepicker('setEndDate', maxDate);
            if ($('#ToTime .input-date').valid()) {
                $('#ToTime .input-date').removeClass('invalid').addClass('success');
            }
        });
        $('.end-date').click(function () {
            $('#FromTime').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            debugger
            $('#ToTime').datepicker('setStartDate', null);
        });
    }, 200);
});
