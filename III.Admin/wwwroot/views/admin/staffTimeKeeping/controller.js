var ctxfolder = "/views/admin/staffTimeKeeping";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", 'ngSanitize', "ngCookies"]);
app.factory('dataservice', function ($http) {
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
        checkIn: function (data, callback) {
            $http.post('/Admin/StaffTimeKeeping/CheckIn', data).then(callback);
        },
        checkOut: function (data, callback) {
            $http.post('/Admin/StaffTimeKeeping/CheckOut', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/StaffTimeKeeping/Delete', data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getLastInOut: function (callback) {
            $http.post('/Admin/StaffTimeKeeping/GetLastInOut').then(callback);
        }
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $filter, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;

    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                ActionTime: {
                    required: true,
                },
            },
            messages: {
                ActionTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.STK_LBL_TIME),
                },
            }
        }
    });
    $rootScope.dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
    $rootScope.statusData = [{
        Code: 'NOTWORK',
        Name: caption.STK_CURD_VALIDATE_NOT_WORK
    }, {
        Code: 'GOLATE',
        Name: caption.STK_CURD_VALIDATE_LATE
    }, {
        Code: 'CHECKIN',
        Name: caption.STK_CURD_VALIDATE_ATTENDANCE
    }]
    dataservice.getListUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
        var all = {
            UserName: '',
            GivenName: 'Tất cả'
        }
        $rootScope.listUser.unshift(all);
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/StaffTimeKeeping/Translation');
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        UserId: '',
        FromDate: '',
        ToDate: ''
    }
    $scope.initData = function () {
        dataservice.getLastInOut(function (rs) {
            rs = rs.data;
            $scope.model.ShiftCode = rs.Object.ShiftCode;
            $scope.IsCheckIn = rs.Object.IsCheckIn;
        })
    }
    $scope.initData();
    $scope.addTimekeeping = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addTimekeeping.html',
            controller: 'addTimekeeping',
            backdrop: 'static',
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadTimeKeeping();
        }, function () {
        });
    }
    $scope.export = function () {
        //var orderBy = 'Id DESC';
        //var exportType = 0;
        //var orderArr = $scope.dtInstance.DataTable.order();
        //var column;
        //if (orderArr.length == 2) {
        //    column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
        //    orderBy = column.mData + ' ' + orderArr[1];
        //} else if (orderArr.length > 0) {
        //    var order = orderArr[0];
        //    column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
        //    orderBy = column.mData + ' ' + order[1];
        //}
        //var page = vm.dtInstance.DataTable.page() + 1;
        //var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/StaffTimeKeeping/ExportExcel?"
            + "uId=" + $scope.model.UserId
            + "&fromDate=" + $scope.model.FromDate
            + "&toDate=" + $scope.model.ToDate
    }
    $scope.checkIn = function () {
        dataservice.checkIn($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.IsCheckIn = true;
                $scope.initData();
            }
        })
    }
    $scope.checkOut = function () {
        dataservice.checkOut($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.IsCheckIn = false;
            }
        })
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
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, fail);
        }
        else {
            alert("Trình duyệt không hỗ trợ");
        }
    }
    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&', { lat: lat, lon: lon }, function (data) {
            $scope.model.LocationText = data.display_name;
            $scope.model.Lat = lat;
            $scope.model.Lon = lon;
            $scope.$apply();
        });
        $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
            $scope.model.Ip = data.ip;
        });
    }
    function fail() {

    }
    setTimeout(function () {
        loadDate();
        //initGeolocation();
    }, 200);
});
app.controller('addTimekeeping', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance) {
    $scope.model = {
        UserId: '',
        Ip: '',
        Address: '',
        Lat: '',
        Lon: '',
        LocationText: '',
        Note: '',
        ShiftCode: ''
    }
    $scope.initData = function () {

    }
    $scope.checkIn = false;
    $scope.checkOut = false;
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
        if (SelectType == "Action" && $scope.model.Action != "") {
            $scope.errorAction = false;
        }
    }
    $scope.uploadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.STK_MSG_IMG_FORMAT);
                return;
            } else {
                $scope.model.Picture = files[0];
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.showCheckIn = function () {
        $("#checkIn").removeClass("hidden");
        $("#checkOut").addClass("hidden");
        $scope.checkIn = true;
        $scope.checkOut = false;
    }
    $scope.hideCheckIn = function () {
        $("#checkIn").addClass("hidden");
        $scope.checkIn = false;
    }
    $scope.showCheckOut = function () {
        $("#checkOut").removeClass("hidden");
        $("#checkIn").addClass("hidden");
        $scope.checkOut = true;
        $scope.checkIn = false;
    }
    $scope.hideCheckOut = function () {
        $("#checkOut").addClass("hidden");
        $scope.checkOut = false;
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.checkIn == false && $scope.checkOut == false) {
                App.toastrError(caption.STK_MSG_CHECKIN_CHECKOUT);
            } else {
                if ($scope.checkIn == true) {
                    dataservice.checkIn($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $rootScope.reloadTimeKeeping();
                        }
                    })
                } else {
                    dataservice.checkOut($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $rootScope.reloadTimeKeeping();
                        }
                    })
                }
            }
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    function loadDate() {
        $("#ActionTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ActionTo').datepicker('setStartDate', maxDate);
        });
        $("#ActionTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ActionTime').datepicker('setEndDate', maxDate);
        });
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
        $('.end-date').click(function () {
            $('#ActionTime').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#ActionTo').datepicker('setStartDate', null);
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            //dataservice.generateShiftCode($scope.model.UserId, function (rs) {rs=rs.data;
            //    $scope.model.ShiftCode = rs;
            //})
            $scope.errorUserId = false;
        }
    }


    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null user
        if (data.UserId == "") {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        return mess;
    };
    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, fail);
        }
        else {
            alert("Sorry, your browser does not support geolocation services.");
        }
    }
    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&', { lat: lat, lon: lon }, function (data) {
            $scope.model.LocationText = data.display_name;
            $scope.model.Lat = lat;
            $scope.model.Lon = lon;
            $scope.$apply();
        });
        $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
            $scope.model.Ip = data.ip;
        });
    }
    function fail() {

    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadDate();
        initGeolocation();
    }, 200);
});
app.controller('gridTimeKeeping', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffTimeKeeping/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.model.UserId;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate

            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
        .withOption('order', [4, 'desc'])
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
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ShiftCode').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_SHIFT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_CREATOR" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ChkInTime').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_TIME_IN" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ChkOutTime').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_TIME_OUT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ChkinLocationTxt').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_LOC_IN" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ChkoutLocationTxt').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_LOC_OUT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80').withTitle('{{"STK_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
    //    return '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="deleteTimekeeping(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadTimeKeeping = function () {
        reloadData(true);
        $rootScope.reloadWorkingTime();
    }

    $scope.editTimekeeping = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/editTimekeeping.html',
            controller: 'editTimekeeping',
            backdrop: 'static',
            size: '40',
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
    }

    $scope.deleteTimekeeping = function (id) {
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
                        }
                        else {
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
            $scope.reload();
        }, function () {
        });
    }
});
app.controller('gridWorkingTime', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    //Grid Time Working
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllContract(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsContract = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffTimeKeeping/JtableTimeWorking",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.model.UserId;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(500, "#tblDataTimeWorking")
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
            //contextScope.contextMenu = $scope.contextMenu4;
            $compile(angular.element(row))($scope);
            //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumnsContract = [];
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        //$scope.selected[full.ID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('UserName').withTitle('{{"STK_LIST_COL_ACCOUNT" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"STK_LIST_COL_STAFF" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('DateWorking').withTitle('{{"STK_LIST_COL_DATE_CREATED" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('TimeWorking').withTitle('{{"STK_LIST_COL_SUM_HOURS" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Detail').withTitle('{{"STK_LIST_COL_DETAILS" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.reloadDataContract = reloadDataContract;
    vm.dtInstanceContract = {};
    $rootScope.reloadWorkingTime = function () {
        reloadDataContract(true);
    }
    function reloadDataContract(resetPaging) {
        vm.dtInstanceContract.reloadData(callbackContract, resetPaging);
    }
    function callbackContract(json) {

    }
});