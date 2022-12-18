var ctxfolder = "/views/admin/workBookSalary";
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
        getEmployee: function (callback) {
            $http.post('/Admin/WorkBookSalary/GetEmployee').then(callback);
        },
        calSalary: function (month, user, callback) {
            $http.post('/Admin/WorkBookSalary/CalSalary?month=' + month + '&user=' + user).then(callback);
        },
        insertExcelDataDB: function (monthSalary, callback) {
            $http.post('/Admin/WorkBookSalary/InsertExcelDataDB?monthSalary=' + monthSalary).then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, dataservice, $cookies, $translate) {
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
                ActionBegin: {
                    required: true,
                },
                ActionTo: {
                    required: true,
                }
            },
            messages: {
                ActionTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.STL_CURD_LBL_TIME),
                },
                ActionBegin: {
                    required: 'Từ ngày yêu cầu bắt buộc'
                },
                ActionTo: {
                    required: 'Đến ngày yêu cầu bắt buộc'
                }
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    $translateProvider.useUrlLoader('/Admin/WorkBookSalary/Translation');
    caption = $translateProvider.translations();
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
        Month: '',
        Employee: ''
    }
    $scope.initData = function () {
        dataservice.getEmployee(function (rs) {
            rs = rs.data;
            $scope.listEmployee = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listEmployee.unshift(all);
        })
    };
    $scope.initData();
    $scope.calSalary = function () {
        dataservice.calSalary($scope.model.Month, $scope.model.Employee, function (rs) {
            rs = rs.data;
            onCreated(rs);
        });
    };
    $scope.exportExcel = function () {

    };

    $scope.saveDB = function () {
        dataservice.insertExcelDataDB($scope.model.Month, function (rs) {
            rs = rs.data;
        });
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    };

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }
    function onCreated(file) {
        var spreadsheetObj = ej.base.getComponent(document.getElementById('spreadsheet'), 'spreadsheet');
        var request = new XMLHttpRequest();
        request.responseType = "blob";
        request.onload = () => {
            var file = new File([request.response], "excel.xlsx");
            spreadsheetObj.open({ file: file });
        };
        request.open("GET", file);
        request.send();
    }
    function loadDate() {
        //$("#monthSalary").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    })
        $("#monthSalary").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "months",
            minViewMode: "months"
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {

    };

    $scope.initLoad = function () {

    };
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($rootScope.ServiceCode == '') {
                dataserviceSVC.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.ServiceCode = $scope.model.ServiceCode;
                        $rootScope.reload();
                    }
                });
            } else {
                dataserviceSVC.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reload();
                    }
                });
            }
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ServiceType" && $scope.model.ServiceType != "") {
            $scope.errorServiceType = false;
        }
        if (SelectType == "ServiceGroup" && $scope.model.ServiceGroup != "") {
            $scope.errorServiceGroup = false;
        }
        //if (SelectType == "Unit" && $scope.model.Unit != "") {
        //    $scope.errorUnit = false;
        //}
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ServiceType == "") {
            $scope.errorServiceType = true;
            mess.Status = true;
        } else {
            $scope.errorServiceType = false;
        }
        if (data.ServiceGroup == "") {
            $scope.errorServiceGroup = true;
            mess.Status = true;
        } else {
            $scope.errorServiceGroup = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

