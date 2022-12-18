var ctxfolderUrencoCost = "/views/admin/urencoCost";
var ctxfolderRQMAIN = "/views/admin/assetRqMaintenanceRepair";
var ctxfolderInventory = "/views/admin/assetInventory";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCard = "/views/admin/cardJob";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_URENCO_COST', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor']);
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
app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 400) {
                App.toastrError(rejection.data);
            }
            return $q.reject(rejection);
        }
    };
}]);
app.directive('customOnChangeContract', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeContract);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});
app.filter("fomartDateTime", function ($filter) {
    return function (date) {
        var dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
        var createDate = $filter('date')(new Date(date), 'dd/MM/yyyy');
        if (dateNow == createDate) {
            var today = new Date();
            var created = new Date(date);
            var diffMs = (today - created);
            var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            if (diffHrs <= 0) {
                if (diffMins <= 0) {
                    return 'Vừa xong';
                } else {
                    return diffMins + ' phút trước';
                }
            } else {
                return diffHrs + ' giờ ' + diffMins + ' phút trước.';
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});
app.factory('dataserviceUrencoCost', function ($http) {
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
        //Header
        genCostCode: function (callback) {
            $http.get('/Admin/urencoCost/GenCostCode').then(callback);
        },
        getListCar: function (callback) {
            $http.get('/Admin/urencoCost/GetListCar').then(callback);
        },
        getListType: function (callback) {
            $http.post('/Admin/urencoCost/GetListType').then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/urencoCost/GetListStatus').then(callback);
        },
        getListCostCategory: function (callback) {
            $http.get('/Admin/urencoCost/GetListCostCategory').then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/contractPo/GetListUnit').then(callback);
        },
        getListService: function (callback) {
            $http.get('/Admin/urencoCost/GetListService').then(callback);
        },
        getServiceUnit: function (callback) {
            $http.post('/Admin/serviceCategory/GetServiceUnit').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/urencoCost/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/urencoCost/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/urencoCost/Delete?id=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/urencoCost/GetItem?id=' + data).then(callback);
        },
        //Detail material
        insertDetail: function (data, callback) {
            $http.post('/Admin/urencoCost/InsertDetail', data).then(callback);
        },
        updateDetail: function (data, callback) {
            $http.post('/Admin/urencoCost/UpdateDetail', data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/urencoCost/DeleteDetail?id=' + data).then(callback);
        },
        //Activity
        getCatObjActivity: function (callback) {
            $http.post('/Admin/UrencoCost/GetCatObjActivity').then(callback);
        },
        getListActivityAttrData: function (data, data1, data2, callback) {
            $http.post('/Admin/assetInventory/GetListActivityAttrData?objCode=' + data + '&&actCode=' + data1 + '&&objActCode=' + data2).then(callback);
        },
        deleteAttrData: function (data, callback) {
            $http.post('/Admin/AssetRqMaintenanceRepair/DeleteAttrData?id=' + data).then(callback);
        },
        getItemAttrSetup: function (data, callback) {
            $http.post('/Admin/AssetAllocation/GetItemAttrSetup/', data).then(callback);
        },
        updateAttrData: function (data, callback) {
            $http.post('/Admin/assetInventory/UpdateAttrData?id=' + data).then(callback);
        },
        deleteItemActivity: function (data, callback) {
            $http.post('/Admin/AssetRqMaintenanceRepair/DeleteItemActivity?id=' + data).then(callback);
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
        insertAttrData: function (data, callback) {
            $http.post('/Admin/assetInventory/InsertAttrData', data).then(callback);
        },
        insertLogData: function (data, callback) {
            $http.post('/Admin/urencoCost/InsertLogData', data).then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM_URENCO_COST', function ($scope, $rootScope, $cookies, $translate, dataserviceUrencoCost, $filter) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^đĐ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var partternVersion = /^\d+(\.\d+)*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ContractCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE), "<br/>");//"Mã hợp đồng không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }
            if (!partternVersion.test(data.Version) && data.Version != null) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Phiên bản nhập không đúng", "<br/>");//"Phiên bản phải là chữ số!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                CostCode: {
                    required: true,
                },
                Title: {
                    required: true,
                },
                Creator: {
                    required: true,
                },
                ApprovedBy: {
                    required: true,
                },
            },
            messages: {
                CostCode: {
                    required: caption.UC_ERR_CODE_REQUIRED,//'Mã phiếu yêu cầu bắt buộc',
                },
                Title: {
                    required: caption.UC_ERR_TITLE_REQUIRED,//'Tiêu đề phiếu yêu cầu bắt buộc',
                },
                Creator: {
                    required: caption.UC_ERR_CREATED_BY_REQUIRED,//'Người tạo yêu cầu bắt buộc',
                },
                ApprovedBy: {
                    required: caption.UC_ERR_APPROVED_BY_REQUIRED,//'Người duyệt yêu cầu bắt buộc',
                },
            }
        }
        $rootScope.validationItemOptions = {
            rules: {
                Cost: {
                    required: true,
                },
                Quantity: {
                    required: true,
                },
            },
            messages: {
                Cost: {
                    required: caption.UC_ERR_COST_REQUIRED,
                },
                Quantity: {
                    required: caption.UC_ERR_QUANTITY_REQUIRED,
                },
            }
        }
        $rootScope.validationOptionsDetail = {
            rules: {
                ItemCode: {
                    required: true,
                    maxlength: 100,
                },
                ItemName: {
                    required: true,
                    maxlength: 255,
                },
                Quatity: {
                    required: true,
                    maxlength: 18,
                },
                Cost: {
                    required: true,
                    maxlength: 18,
                }
            },
            messages: {
                ItemCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_CODE),//"Mã chi tiết yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_CODE).replace("{1}", "100")//"Không vượt quá 100 kí tự"
                },
                ItemName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_NAME),//"Tên chi tiết yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_NAME).replace("{1}", "255")//"Không vượt quá 255 kí tự"
                },
                Quatity: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_QUATITY),//"Số lượng yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_QUATITY).replace("{1}", "255")//"Số lượng không vượt quá 255 kí tự"
                },
                Cost: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_COST),//"Đơn giá yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_COST).replace("{1}", "18")//"Đơn giák hông vượt quá 18 kí tự"
                },
            }
        };
        $rootScope.validationOptionsResultAct = {
            rules: {
                Value: {
                    required: true
                }
            },
            messages: {
                Value: {
                    required: caption.ASSET_RMR_VALIDATE_REQ.replace("{0}", caption.ASSET_RMR_VL),// "Giá trị bắt buộc"
                }
            }
        }
    });
    $rootScope.CostCode = "";
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/UrencoCost/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderUrencoCost + '/index.html',
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
    $httpProvider.interceptors.push('interceptors');
    $httpProvider.interceptors.push('httpResponseInterceptor');
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceUrencoCost, $window, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
        CostCode: '',
        CarPlate: '',
    };
    $rootScope.ListCar = [];

    $scope.initData = function () {
        var date = new Date();
        var priorDate = new Date().setDate(date.getDate() - 30)
        $scope.model.ToDate = $filter('date')((date), 'dd/MM/yyyy')
        $scope.model.FromDate = $filter('date')((priorDate), 'dd/MM/yyyy')
    }
    $scope.initData();
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/urencoCost/JTable",
            beforeSend: function (jqXHR, settings) {
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
                d.CostCode = $scope.model.CostCode;
                d.CarPlate = $scope.model.CarPlate;
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
            $compile(angular.element(row))($scope);
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
                        $('#tblDataContractPO').DataTable().$('tr.selected').removeClass('selected');
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CostCode').withTitle('{{"UC_CURD_LBL_CODE" | translate}}').withOption('sClass', ' dataTable-pr0 w170').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"UC_CURD_LBL_TITLE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CarPlate').withTitle('{{"UC_CURD_LBL_CAR_PLATE" | translate}}').renderWith(function (data, type) {
        return '<span class="text-purple bold">' + data + '</span>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Gara').withTitle('{{"UC_CURD_LBL_GARA" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"UC_CURD_LBL_NOTE" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Creator').withTitle('{{"UC_CURD_LBL_CREATED_BY" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"UC_CURD_LBL_CREATED_TIME" | translate}}').withOption('sClass', 'tcenter dataTable-pr0 w70').notSortable().renderWith(function (data, type, full) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"COM_LIST_COL_ACTION"|translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    };
    function callback(json) {

    };
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    };
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
    };

    $scope.reload = function () {
        reloadData(true);
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        debugger
        reloadData(true);
    };
    $scope.initLoad = function () {
        dataserviceUrencoCost.getListCar(function (rs) {
            rs = rs.data;
            $rootScope.ListCar = rs;
        });
        dataserviceUrencoCost.getListType(function (rs) {
            rs = rs.data;
            $rootScope.ListType = rs;
        });
        dataserviceUrencoCost.getListStatus(function (rs) {
            rs = rs.data;
            $rootScope.ListStatus = rs;
        });
    };
    $scope.initLoad();
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceUrencoCost.delete(id, function (result) {
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    };
    $scope.edit = function (id) {
        dataserviceUrencoCost.getItem(id, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                var data = rs.Object;
                $rootScope.CostCode = data.CostCode;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderUrencoCost + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    windowClass: "modal-center",
                    size: '60',
                    resolve: {
                        para: function () {
                            return data;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    //$scope.reloadNoResetPage();
                }, function () { });
            } else {
                App.toastrError(rs.Title);
            }
        });
    };
    $scope.add = function () {
        $rootScope.CostCode = '';

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderUrencoCost + '/add.html',
            controller: 'add',
            backdrop: 'static',
            windowClass: "modal-center",
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 50);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceUrencoCost, $filter) {
    $scope.model = {
        CostCode: '',
        CarPlate: '',
        StartDate: '',
        EndDate: '',
        Note: '',
        Title: '',
        Gara: '',
        Creator: '',
        CreatedDate: '',
    };
    $scope.isTex = false;
    $rootScope.CostCode = '';
    $scope.isShowHeader = true;
    $scope.isShowDetail = false;
    $rootScope.isAdd = false;

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    function initData() {
        var date = new Date();
        var priorDate = new Date().setDate(date.getDate() + 30);
        $scope.model.CreatedDate = $filter('date')((date), 'dd/MM/yyyy');
        $scope.model.StartDate = $filter('date')((date), 'dd/MM/yyyy');
        $scope.model.EndDate = $filter('date')((priorDate), 'dd/MM/yyyy');

        dataserviceUrencoCost.genCostCode(function (rs) {
            rs = rs.data;
            $scope.model.CostCode = rs;
        });

        dataserviceUrencoCost.getCatObjActivity(function (rs) {
            rs = rs.data;
            $scope.listCatObjActivity = rs;
            if ($scope.listCatObjActivity.length == 1) {
                $scope.model.ObjActCode = $scope.listCatObjActivity[0].Code;
            }
        });
    }
    initData();

    $scope.changleSelect = function (SelectType, item) {
        if (SelectType === "CarPlate" && $scope.model.CarPlate !== "") {
            $scope.errorCarPlate = false;
        }
    };

    $scope.getInfo = function (item) {
        $scope.CarInfo = item.Info;
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.CarPlate === "" || data.CarPlate === null) {
            $scope.errorCarPlate = true;
            mess.Status = true;
        } else {
            $scope.errorCarPlate = false;
        }
        return mess;
    };


    $scope.submit = function () {
        $rootScope.CostCode = $scope.model.CostCode;
        validationSelect($scope.model);
        if ($scope.forms.addform.validate() && !validationSelect($scope.model).Status) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmAdd.html',
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.UC_CONFIRM_ADD_MSG;
                    $scope.ok = function () {
                        dataserviceUrencoCost.insert(para, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                $rootScope.IsDisableCostCode = true;
                                $rootScope.IsDisableType = true;
                                $rootScope.isAdd = true;
                                App.toastrSuccess(result.Title);
                                $rootScope.reloadNoResetPage();
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
                $rootScope.Object.CostCode = $scope.model.ContractCode;
                $rootScope.CostCode = $scope.model.CostCode;
            }, function () {
            });
        }
    };

    initData();

    setTimeout(function () {
        var startDate = new Date();
        setModalDraggable('.modal-dialog');
        $("#StartDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#StartDate').datepicker('setEndDate', maxDate);
        });

        $("#CreatedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
        $("#ApprovedTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });

        $('.end-date').click(function () {
            $('#StartDate').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#EndDate').datepicker('setStartDate', null);
        });
    }, 200);

    $scope.ShowHeader = function () {
        if ($scope.isTex !== false) {
            $scope.isShowHeader = true;
            $scope.isShowDetail = false;
            $('.switchCustom').removeClass('switchCustomActive');
        }
        else {
            $scope.isShowHeader = false;
            $scope.isShowDetail = true;
            $('.switchCustom').addClass('switchCustomActive');
        }
    };
});
app.controller('edit', function ($scope, $filter, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceUrencoCost, para) {
    $scope.isTex = false;
    $scope.isShowHeader = true;
    $scope.isShowDetail = false;
    $scope.checkRoleWf = false;
    $scope.forms = {};
    $scope.model = {};
    $scope.initData = function () {
        $scope.model = para;
    };
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    function initData() {
        dataserviceUrencoCost.getCatObjActivity(function (rs) {
            rs = rs.data;
            $scope.listCatObjActivity = rs;
            if ($scope.listCatObjActivity.length == 1) {
                $scope.model.ObjActCode = $scope.listCatObjActivity[0].Code;
            }
        });
        dataserviceUrencoCost.checkRoleUser($scope.model.ObjActCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                $scope.isDisabled = false;
                $scope.checkRoleWf = true;
            }
        })
        dataserviceUrencoCost.getCatActivityWorkFlow($scope.model.ObjActCode, function (rs) {
            rs = rs.data;
            $rootScope.listCatActivity = rs;
        });

        var car = $rootScope.ListCar.find(function (element) {
            if (element.Code === $scope.model.CarPlate) return true;
        });

        if (car !== undefined && car !== null)
            $scope.CarInfo = car.Info;
    }
    initData();
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType === "CarPlate" && $scope.model.CarPlate !== "") {
            $scope.errorCarPlate = false;
        }
        if (SelectType === "ActCode" && $scope.model.ActCode !== "") {
            $scope.model.ObjCode = $scope.model.CostCode;
            dataserviceUrencoCost.insertLogData($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                }
            });
            $scope.errorActCode = false;
        }
    };
    $scope.getInfo = function (item) {
        $scope.CarInfo = item.Info;
    };

    $scope.checkRole = function () {
        if ($scope.checkRoleWf == false) {
            App.toastrError("Bạn không có quyền thực hiện thao tác");
        }
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
                    var obj = { ObjActCode: $scope.model.ObjActCode, ObjCode: $scope.model.CostCode };
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.result = function () {
        if ($scope.model.ActCode !== '' && $scope.model.ActCode !== undefined && $scope.model.ActCode !== null) {
            $rootScope.ActCode = $scope.model.ActCode;
            $rootScope.ObjActCode = $scope.model.ObjActCode;
            $rootScope.ObjCode = $scope.model.CostCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderRQMAIN + '/resultActivity.html',
                controller: 'resultActivity',
                backdrop: true,
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
                // $scope.reloadNoResetPage5();
            }, function () { });
        }
        else {
            App.toastrError(caption.ASSET_RMR_CURD_VALIDATE_CHOOSE_ACT);
        }
    }

    $scope.tableActivity = function () {
        $rootScope.ActCode = $scope.model.ActCode;
        $rootScope.ObjActCode = $scope.model.ObjActCode;
        $rootScope.ObjCode = $scope.model.CostCode;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRQMAIN + '/tableActivity.html',
            controller: 'tableActivity',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.CarPlate === "" || data.CarPlate === null) {
            $scope.errorCarPlate = true;
            mess.Status = true;
        } else {
            $scope.errorCarPlate = false;
        }
        return mess;
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.forms.editform.validate() && !validationSelect($scope.model).Status) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.COM_MSG_EDIT_CONFIRM.replace("{0}", "");//"Bạn có chắc chắn muốn thay đổi ?";
                    $scope.ok = function () {
                        dataserviceUrencoCost.update(para, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                                $rootScope.reloadNoResetPage();
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

            }, function () {
            });
        }
    }

    setTimeout(function () {
        var startDate = new Date();
        setModalDraggable('.modal-dialog');
        $("#StartDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#StartDate').datepicker('setEndDate', maxDate);
        });

        $("#CreatedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
        $("#ApprovedTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });

        $('.end-date').click(function () {
            $('#StartDate').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#EndDate').datepicker('setStartDate', null);
        });
    }, 200);
    $scope.ShowHeader = function () {
        if ($scope.isTex !== false) {
            $scope.isShowHeader = true;
            $scope.isShowDetail = false;
        }
        else {
            $scope.isShowHeader = false;
            $scope.isShowDetail = true;
        }
    };
});
app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceUrencoCost, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Item: '',
        ItemType: '',
        Quantity: 1,
        Total: '',
        Unit: '',
        Note: '',
        Cost: '',
        CostCode: ''
    };
    $scope.isExtend = false;
    $scope.isAdd = true;
    $scope.isDisableItemCode = false;
    $scope.isDisableUnit = false;
    $scope.isDisableItemType = true;
    $scope.isDisableCatalogue = true;
    $scope.isDisableCurrency = false;

    $scope.errorPrice = false;
    $scope.errorQuantity = false;

    $scope.listRequestChoose = [];
    $scope.listRequest = [];
    $scope.listAllRequest = [];
    $scope.listItems = [];
    $scope.listItemsOld = [];
    $scope.listReqCode = [];
    $scope.forms = {};

    $scope.isCheckAll = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UrencoCost/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CostCode = $rootScope.CostCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ItemCode').withTitle('{{"UC_LIST_COL_MATERIAL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ItemName').withTitle('{{"UC_LIST_COL_MATERIAL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"UC_LIST_COL_MATERIAL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitName').withTitle('{{"UC_LIST_COL_MATERIAL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{"UC_LIST_COL_MATERIAL_COST" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        dt = "<span class = 'text-danger bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"UC_LIST_COL_MATERIAL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"UC_LIST_COL_MATERIAL_QUANTITY" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        dt = "<span class = 'text-primary bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Total').withTitle('{{"UC_LIST_COL_MATERIAL_TOTAL" | translate}}').renderWith(function (data, type, full) {
        var cost = full.Cost * full.Quantity;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        dt = "<span class = 'text-danger bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'class9'));
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
    $scope.search = function () {
    }
    $scope.add = function () {
        if ($scope.model.Cost === null && !$scope.errorPrice) {
            $scope.errorPrice = true;
            return false;
        }
        if ($rootScope.CostCode !== '') {
            validationSelect($scope.model);
            $scope.isAdd = true;
            $scope.model.CostCode = $rootScope.CostCode;
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                dataserviceUrencoCost.insertDetail($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.model.Currency = '';
                        $scope.model.Unit = '';
                        $scope.model.Cost = '';
                        $scope.model.Catalogue = '';
                        $scope.model.ItemTypeName = '';
                        $scope.model.ItemCode = '';
                        $scope.model.Quantity = 1;
                        $scope.reload();
                    }
                });
            }
        }
    }
    $scope.edit = function (id) {
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblDataItem').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (id == listdata[i].Id) {
                var count = 0;
                var data = listdata[i];

                $scope.model.Id = data.Id;
                $scope.model.CostCode = data.CostCode;
                $scope.model.ItemCode = data.ItemCode;
                $scope.model.Quantity = parseInt(data.Quantity);
                $scope.model.Cost = parseFloat(data.Cost);
                $scope.model.Unit = data.Unit;
                $scope.model.Note = data.Note;
                $scope.model.Currency = data.Currency;
                $scope.model.Catalogue = data.Catalogue;
                $scope.model.ItemType = data.ItemType;
                $scope.model.ItemTypeName = data.ItemTypeName;
                $scope.model.CreatedDate = data.CreatedDate;
                $scope.isDisableForm();
                break;
            }
        }
    };
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.editId = -1;
        $scope.removeDisableForm();
        $scope.model.Currency = '';
        $scope.model.Unit = '';
        $scope.model.Cost = '';
        $scope.model.Catalogue = '';
        $scope.model.ItemTypeName = '';
        $scope.model.ItemCode = '';
        //$scope.changeQuantityPrice();

    }
    $scope.save = function (id) {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataserviceUrencoCost.updateDetail($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $scope.isAdd = true;
                    $scope.removeDisableForm();
                    $scope.model.Currency = '';
                    $scope.model.Unit = '';
                    $scope.model.Cost = '';
                    $scope.model.Catalogue = '';
                    $scope.model.ItemTypeName = '';
                    $scope.model.ItemCode = '';
                    $scope.model.Quantity = 1;
                }
            });
        }
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceUrencoCost.deleteDetail(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(id);
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
            if ($scope.editId == d) {
                $scope.close();
            }

            $scope.reload();
        }, function () {
        });
    }

    $scope.isDisableForm = function () {
        $scope.isDisableItemCode = true;
    }
    $scope.removeDisableForm = function () {
        $scope.isDisableItemCode = false;
    }

    $scope.changeQuantityPrice = function () {
        if (($scope.model.Cost != '' && $scope.model.Cost != null && $scope.model.Cost != undefined) || $scope.model.Cost == 0) {
            if ($scope.model.Cost <= 0) {
                $scope.errorPrice = true;
            }
            else {
                $scope.errorPrice = false;
            }
        } else {
            $scope.errorPrice = false;
        }
        if (($scope.model.Quantity != '' && $scope.model.Quantity != null && $scope.model.Quantity != undefined) || $scope.model.Quantity == 0) {
            if ($scope.model.Quantity <= 0) {
                $scope.errorQuantity = true;
            } else {
                $scope.errorQuantity = false;
            }
        } else {
            $scope.errorQuantity = false;
        }
    }
    $scope.init = function () {
        dataserviceUrencoCost.getListCostCategory(function (rs) {
            rs = rs.data;
            $scope.listItem = rs;
        });
        dataserviceUrencoCost.getListUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
    }
    $scope.init();

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType === "ItemCode") {
            //$scope.model.Unit = item.Unit;
            //if (item.Unit !== '')
            //    $scope.errorUnit = false;
            $scope.model.UnitName = item.UnitName;
            $scope.model.ItemName = item.Name;
            $scope.model.ItemType = item.ProductType;
            $scope.model.ItemTypeName = item.ProductTypeName;
            $scope.model.Catalogue = item.Catalogue;
        }

        if (SelectType === "ItemCode" && $scope.model.ItemCode !== '' && $scope.model.ItemCode !== undefined && $scope.model.ItemCode !== null) {
            $scope.errorItemCode = false;
        }
        if (SelectType === "Currency" && $scope.model.Currency !== "") {
            $scope.errorCurrency = false;
        }
        if (SelectType === "Unit" && $scope.model.Unit !== "") {
            $scope.errorUnit = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ItemCode === '' || data.ItemCode === undefined || data.ItemCode === null) {
            $scope.errorItemCode = true;
            mess.Status = true;
        } else {
            $scope.errorItemCode = false;
        }
        if (data.Unit === "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        if (data.Cost === "") {
            $scope.errorPrice = true;
            mess.Status = true;
        } else {
            $scope.errorPrice = false;
        }
        if (data.Quantity === "") {
            $scope.errorQuantity = true;
            mess.Status = true;
        } else {
            $scope.errorQuantity = false;
        }
        return mess;
    };

    function loadDate() {
        $("#_CreatedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
        });
    }

    setTimeout(function () {
        loadDate();
        //setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 100);
});

app.controller('resultActivity', function ($scope, $rootScope, $confirm, $compile, $uibModalInstance, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceUrencoCost, $filter, $translate) {
    $scope.model = {
        AttrCode: '',
        AttrDataType: '',
        AttrUnit: '',
    }
    $scope.cancel = function () {

        $uibModalInstance.dismiss('cancel');
    }
    $scope.initLoad = function () {
        $scope.model.ActCode = $rootScope.ActCode;
        $scope.model.ObjCode = $rootScope.ObjCode;
        $scope.model.WorkFlowCode = $rootScope.ObjActCode;
        var obj = { WorkFlowCode: $scope.model.WorkFlowCode, ActCode: $scope.model.ActCode };
        dataserviceUrencoCost.getItemAttrSetup(obj, function (rs) {
            rs = rs.data;
            $scope.model.listAttrData = rs;
        });
        dataserviceUrencoCost.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
            rs = rs.data;
            $scope.model.listAttrDataSetUp = rs;
        });
    }
    $scope.initLoad();
    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.resultActivity.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);

            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            else {
                dataserviceUrencoCost.insertAttrData($scope.model, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        dataserviceUrencoCost.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
                            rs = rs.data;
                            $scope.model.listAttrDataSetUp = rs;
                        });
                    }
                });
            }
        }
    }
    $scope.updateStatus = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.ASSET_INVENTORY_MSG_YN_CHANGE_STATUS;
                $scope.ok = function () {
                    dataserviceUrencoCost.updateAttrData(id, function (rs) {
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
            dataserviceUrencoCost.getListActivityAttrData($rootScope.ObjCode, $rootScope.ActCode, $rootScope.ObjActCode, function (rs) {
                rs = rs.data;
                $scope.model.listAttrDataSetUp = [];
                $scope.model.listAttrDataSetUp = rs;
            });
        }, function () {
        });
    }
    $scope.delete = function (id) {
        dataserviceUrencoCost.deleteAttrData(id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataserviceUrencoCost.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listAttrDataSetUp = rs;
                });
            }
        });
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "AttrCode" && $scope.model.AttrCode != "") {

            for (var i = 0; i < $scope.model.listAttrData.length; i++) {
                $scope.model.AttrUnit = $scope.model.listAttrData[i].UnitCode;
                $scope.model.AttrDataType = $scope.model.listAttrData[i].DataTypeCode;
            }
            $scope.errorAttrCode = false;
        }

        if (SelectType == "AttrDataType" && $scope.model.AttrDataType != "") {
            $scope.errorAttrDataType = false;
        }

        if (SelectType == "AttrUnit" && $scope.model.AttrUnit != "") {
            $scope.errorAttrUnit = false;
        }
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

        //if (data.AttrDataType == "") {
        //    $scope.errorAttrDataType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorAttrDataType = false;
        //}

        if (data.AttrUnit == "") {
            $scope.errorAttrUnit = true;
            mess.Status = true;
        } else {
            $scope.errorAttrUnit = false;
        }

        if (data.AttrUnit == "") {
            $scope.errorAttrUnit = true;
            mess.Status = true;
        } else {
            $scope.errorAttrUnit = false;
        }


        return mess;
    };
    setTimeout(function () {

    }, 200);
});
app.controller('tableActivity', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceUrencoCost, $filter) {
    $scope.model = {
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model.ActCode = $rootScope.ActCode;
    $scope.model.ObjActCode = $rootScope.ObjActCode;
    $scope.model.TicketCode = $rootScope.ObjCode;
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetRqMaintenanceRepair/JTableActivity",
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActName').withTitle('{{"ASSET_RMR_ACT_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<span>' + data + '</span></br>' + '<span class="badge-customer badge-customer-success"> ' + full.Time + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActType').withTitle('{{"ASSET_RMR_ACT_TYPE" | translate}}').withOption('sClass', 'w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserAct').withTitle('{{"ASSET_RMR_ACT_USER" | translate}}').withOption('sClass', 'w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Result').withTitle('{{"ASSET_RMR_ACT_RESULT" | translate}}').withOption('sClass', 'w350').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ASSET_RMR_LIST_COL_ACTION" | translate}}').withOption('sClass', 'w20').renderWith(function (data, type, full) {
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
        dataserviceUrencoCost.getItemRqMaintenance(id, function (rs) {
            rs = rs.data;

            $rootScope.TicketCode = rs.Object.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderRQMAIN + '/edit.html',
                controller: 'editRqMaintenance',
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
                    dataserviceUrencoCost.deleteItemActivity(para, function (rs) {
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
app.controller('statusObjAct', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceUrencoCost, $filter, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ObjActCode = '';
    $scope.remainMinute = "";
    $scope.listStatusObj = [];
    $scope.initLoad = function () {
        var obj = para;
        dataserviceUrencoCost.getStausObjStream(obj, function (rs) {
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



