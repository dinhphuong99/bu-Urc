var ctxfolder = "/views/admin/Route";
var ctxfolderCommonSetting = "/views/admin/Route";
var ctxfolderMessage = "/views/message-box";
var map;
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'dynamicNumber', "ngCookies", "pascalprecht.translate", 'monospaced.qrcode']).
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUploadHD = function (url, data, callback) {
        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        var formData = new FormData();
        angular.forEach(data, function (value, key) {
            if (value == 'undefined' || value == 'null') {
                data[key] = '';
            }
        });
        formData.append("id", data.id);
        formData.append("Insuarance", data.Insuarance);
        formData.append("Dates_of_pay", data.Dates_of_pay);
        formData.append("Place_Work", data.Place_Work);
        formData.append("Exp_time_work", data.Exp_time_work);
        formData.append("Salary_Ratio", data.Salary_Ratio);
        formData.append("Payment", data.Payment);
        formData.append("Contract_Type", data.Contract_Type);
        formData.append("Signer", data.Signer);
        formData.append("Salary", data.Salary);
        formData.append("Start_Time", data.Start_Time);
        formData.append("End_Time", data.End_Time);
        formData.append("DateOf_LaborBook", data.DateOf_LaborBook);
        formData.append("Work_Content", data.Work_Content);
        formData.append("Allowance", data.Allowance);
        formData.append("Contract_Code", data.Contract_Code);
        formData.append("LaborBook_Code", data.LaborBook_Code);
        formData.append("Other_Agree", data.Other_Agree);
        formData.append("Info_Insuarance", data.Info_Insuarance);
        formData.append("Bonus", data.Bonus);
        formData.append("Tools_Work", data.Tools_Work);
        formData.append("Active", data.Active);
        formData.append("Type_Money", data.Type_Money);
        formData.append("Value_time_work", data.Value_time_work);
        formData.append("Type_Money", data.Type_Money);
        formData.append("File", data.File);
        formData.append("Info_Contract", data.Info_Contract);

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }
        $http(req).then(callback);
    };
    var submitFormUploadFile = function (url, data, callback) {
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
            $http.post('/Admin/Route/Insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Route/Update', data).then(callback);
            //submitFormUpload('/Admin/HREmployee/Update', data, callback);
        },
        uploadFile: function (data, callback) {
            submitFormUploadFile('/Admin/Route/UploadFile/', data, callback);
        },
        uploadImage: function (data, callback) {
            submitFormUploadFile('/Admin/Route/UploadImage/', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/Route/Delete?id=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/Route/GetItem?id=' + data).then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/Route/GetStatus').then(callback);
        },
        getEmployee: function (callback) {
            $http.post('/Admin/Route/GetEmployee').then(callback);
        },
        insertDriverMapping: function (data, callback) {
            $http.post('/Admin/Route/InsertDriverMapping', data).then(callback);
        },
        deleteDriverMapping: function (data, callback) {
            $http.post('/Admin/Route/DeleteDriverMapping?id=' + data).then(callback);
        },
        insertNode: function (data, callback) {
            $http.post('/Admin/Route/InsertNode', data).then(callback);
        },
        deleteNode: function (data, callback) {
            $http.post('/Admin/Route/DeleteNode?id=' + data).then(callback);
        },
        getListNode: function (callback) {
            $http.post('/Admin/Route/GetListNode').then(callback);
        },
        getListCar: function (callback) {
            $http.post('/Admin/Route/GetListCar').then(callback);
        },
    }
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
                RouteCode: {
                    required: true,

                },
                RouteName: {
                    required: true,
                },
                NumLength: {
                    required: true,

                },
                RouteDataGps: {
                    required: true,

                }
            },
            messages: {
                RouteCode: {
                    //required: "Mã tuyến không được để trống",
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ROUTE_VALIDATE_ROUTE_CODE)

                },
                RouteName: {
                    //required: "Tên tuyến không được để trống",
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ROUTE_VALIDATE_ROUTE_NAME)
                },
                NumLength: {
                    //required: "Chiều dài tuyến không được để trống",
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ROUTE_VALIDATE_NUM_LENGTH)
                },
                RouteDataGps: {
                    //required: "Dữ liệu GPS tuyến không được để trống",
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ROUTE_VALIDATE_GPS_DATA)
                }
            }
        }

    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {

    $translateProvider.useUrlLoader('/Admin/Route/Translation');
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
        .when('/add_contract/', {
            templateUrl: ctxfolder + '/add_contract.html',
            controller: 'add_contract'
        })
        .when('/edit_contract/:id', {
            templateUrl: ctxfolder + '/edit_contract.html',
            controller: 'edit_contract'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $translate, $window, dataservice) {
    $scope.routeLevels = [{ Code: '', Name: "Tất cả" }, { Code: 0, Name: "Cao" }, { Code: 1, Name: "Thấp" }, { Code: 2, Name: "Trung bình" }];
    $scope.routeType = [{ Code: 0, Name: "Lớn" }, { Code: 1, Name: "Nhỏ" }];
    $scope.routePrioritys = [{ Code: '', Name: "Tất cả" }, { Code: 0, Name: "Cao" }, { Code: 1, Name: "Thấp" }, { Code: 2, Name: "Trung bình" }];
    $scope.managers = [{ Code: '', Name: "Tất cả" }];
    $scope.numLines = [{ Code: '', Name: "Tất cả" }, { Code: 1, Name: "1 Chiều" }, { Code: 2, Name: "2 Chiều" }];
    $scope.statuss = [{ Code: '', Name: "Tất cả" }, { Code: "1", Name: "Cấm đường" }, { Code: "1", Name: "Hoạt động" }];

    $scope.model = {
        Status: '',
        NumLine: '',
        Manager: '',
        RoutePriority: '',
        RouteLevel: '',
        RouteType: ''
    }

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.treeDataunit = [];
    $scope.positionData = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Route/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.RouteName = $scope.model.RouteName;
                d.RouteLevel = $scope.model.RouteLevel;
                d.RoutePriority = $scope.model.RoutePriority
                d.Manager = $scope.model.Manager;
                d.NumLine = $scope.model.NumLine;
                d.Status = $scope.model.Status;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RouteName').withTitle('{{"ROUTE_LIST_COL_ROUTE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumLine').withTitle('{{"ROUTE_LIST_COL_NUM_LINE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('NumLength').withTitle('{{"ROUTE_LIST_COL_NUM_LENGTH" | translate}}(m)').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Manager').withTitle('{{"ROUTE_LIST_COL_MANAGER" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0  dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RouteLevel').withTitle('{{"ROUTE_LIST_COL_LEVEL" | translate}}').renderWith(function (data, type) {
        if (data != "")
            for (var i = 0; i < $scope.routeLevels.length; ++i) {
                if (data == $scope.routeLevels[i].Code)
                    return $scope.routeLevels[i].Name;
            }
        return "";
    }).withOption('sClass', 'dataTable-pr0  dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RoutePriority').withTitle('{{"ROUTE_LIST_COL_PRIORITY" | translate}}').renderWith(function (data, type) {
        if (data != "")
            for (var i = 0; i < $scope.routePrioritys.length; ++i) {
                if (data == $scope.routePrioritys[i].Code)
                    return $scope.routePrioritys[i].Name;
            }
        return "";
    }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"ROUTE_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0  dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ROUTE_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0  dataTable-10per'));

    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"ROUTE_LIST_COL_ACTION" | translate}}').notSortable().renderWith(function (data, type, full, meta) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'nowrap tcenter  dataTable-10per'));
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
    $rootScope.reloadRoute = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 80;
        } else {
            size = 70;
        }
        $rootScope.employeeId = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: 50
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 80;
        } else {
            size = 70;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: true,
            size: 50,
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
        dataservice.getStatus(function (rs) {rs=rs.data;
            $scope.statuss = rs;
        });
        dataservice.getEmployee(function (rs) {rs=rs.data;
            $scope.managers = rs;
        });
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $translate) {
    $scope.routeLevels = [{ Code: 0, Name: "Cao" }, { Code: 1, Name: "Thấp" }, { Code: 2, Name: "Trung bình" }];
    $scope.routeType = [{ Code: 0, Name: "Lớn" }, { Code: 1, Name: "Nhỏ" }];
    $scope.routePrioritys = [{ Code: 0, Name: "Cao" }, { Code: 1, Name: "Thấp" }, { Code: 2, Name: "Trung bình" }];
    $scope.managers = [];
    $scope.numLines = [{ Code: 1, Name: "1 Chiều" }, { Code: 2, Name: "2 Chiều" }];
    $scope.statuss = [];
    $scope.model = {
        Status: '',
        NumLine: 1,
        Manager: '',
        RoutePriority: 0,
        RouteLevel: 0,
        QrCode: '',
        RouteDataGps: '',
        routeType: 0
    }
    $rootScope.RouteCode = '';
    $scope.IsDisable = true;
    $scope.chkDisable = function () {
        if ($scope.IsDisable == true) {
            App.toastrError(caption.ROUTE_MSG_PLS_ADD_ROUTE);
        }
    };
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/googleMap.html',
            controller: 'googleMap',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return $scope.model.RouteDataGps;
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d) {
                $scope.model.RouteDataGps = d;
            }
        }, function () { });
    }

    //$rootScope.RouteCode = $scope.model.RouteCode;
    $scope.changeQRCode = function () {
        $scope.model.QrCode = $scope.model.RouteName + "/" + $scope.model.NumLine + "/" + $scope.model.NumLength + "/" + $scope.model.Manager + "/" + $scope.model.Status + "/" + $scope.model.RouteLevel + "/" + $scope.model.RoutePriority;
    }
    $scope.initData = function () {
        dataservice.getStatus(function (rs) {rs=rs.data;
            $scope.statuss = rs;
            if ($scope.statuss.length > 0) {
                $scope.model.Status = $scope.statuss[0].Code;
            }
        });
        dataservice.getEmployee(function (rs) {rs=rs.data;
            $scope.managers = rs;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "gender" && ($scope.model.gender != "" || $scope.model.gender != null)) {
            $scope.errorGender = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "employeekind" && $scope.model.employeekind != "") {
            $scope.errorEmployeekind = false;
        }
        //if (SelectType == "employeegroup" && $scope.model.employeegroup != "") {
        //    $scope.errorEmployeegroup = false;
        //}
        if (SelectType == "employeetype" && $scope.model.employeetype != "") {
            $scope.errorEmployeetype = false;
        }

        if (SelectType == "phone" && $scope.model.phone && $rootScope.partternPhone.test($scope.model.phone)) {
            $scope.errorphone = false;
        } else if (SelectType == "phone") {
            $scope.errorphone = true;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataservice.uploadImage(data, function (rs) {rs=rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Images = '/uploads/images/' + rs.Object;
                                            dataservice.insert($scope.model, function (rs) {rs=rs.data;
                                                debugger
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $rootScope.RouteCode = $scope.model.RouteCode;
                                                    $scope.IsDisable = false;
                                                }
                                            });
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                dataservice.insert($scope.model, function (rs) {rs=rs.data;
                    debugger
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        $rootScope.reloadRoute();
                    } else {
                        $rootScope.RouteCode = $scope.model.RouteCode;
                        $rootScope.reloadRoute();
                        App.toastrSuccess(rs.Title);
                        $scope.IsDisable = false;
                        //$uibModalInstance.close();
                    }
                });
            }
        }
    }
    function convertDatetime(date) {
        if (date != null && date != '') {
            var array = date.split('/');
            var result = array[1] + '/' + array[0] + '/' + array[2];
            return result;
        } else {
            return '';
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.NumLine == "" || data.NumLine == null) {
            $scope.errorNumLine = true;
            mess.Status = true;
        } else {
            $scope.errorNumLine = false;

        }
        if (data.Manager == "" || data.Manager == null) {
            $scope.errorManager = true;
            mess.Status = true;
        } else {
            $scope.errorManager = false;

        }
        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }

        return mess;
    }

    setTimeout(function () {
        var dateBirthday = new Date();
        dateBirthday.setFullYear(dateBirthday.getFullYear() - 10);
        var dateidentitycard = new Date();

        $(".date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: "01/01/1960",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $('#date-birthday').datepicker('setEndDate', dateBirthday);
        $('#date-birthday2').datepicker('setEndDate', dateBirthday);
        $('#date-identitycard').datepicker('setEndDate', dateidentitycard);
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);

});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $translate, para) {
    $scope.routeLevels = [{ Code: 0, Name: "Cao" }, { Code: 1, Name: "Thấp" }, { Code: 2, Name: "Trung bình" }];
    $scope.routeType = [{ Code: 0, Name: "Lớn" }, { Code: 1, Name: "Nhỏ" }];
    $scope.routePrioritys = [{ Code: 0, Name: "Cao" }, { Code: 1, Name: "Thấp" }, { Code: 2, Name: "Trung bình" }];
    $scope.managers = [];
    $scope.numLines = [{ Code: 1, Name: "1 Chiều" }, { Code: 2, Name: "2 Chiều" }];
    $scope.statuss = [];
    $scope.model = {
        Status: '',
        NumLine: 1,
        Manager: '',
        RoutePriority: 0,
        RouteLevel: 0
    }
    $scope.openMap = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/googleMap.html',
            controller: 'googleMap',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return $scope.model.RouteDataGps;
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d) {
                $scope.model.RouteDataGps = d;
            }
        }, function () { });
    }
    $scope.changeQRCode = function () {
        $scope.model.QrCode = $scope.model.RouteName + "/" + $scope.model.NumLine + "/" + $scope.model.NumLength + "/" + $scope.model.Manager + "/" + $scope.model.Status + "/" + $scope.model.RouteLevel + "/" + $scope.model.RoutePriority;
    }
    $scope.initData = function () {
        dataservice.getStatus(function (rs) {rs=rs.data;
            $scope.statuss = rs;
            if ($scope.statuss.length > 0) {
                $scope.model.Status = $scope.statuss[0].Code;
            }
        });
        dataservice.getEmployee(function (rs) {rs=rs.data;
            $scope.managers = rs;
        });
        dataservice.getItem(para, function (rs) {rs=rs.data;
            debugger
            $scope.model = rs;
            $rootScope.RouteCode = $scope.model.RouteCode;
            //$scope.routeType = 
            //$rootScope.RouteType = $scope.model.RouteType;
            //$rootScope.reloadDriver();
            //$rootScope.reloadNode();
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "gender" && ($scope.model.gender != "" || $scope.model.gender != null)) {
            $scope.errorGender = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "employeekind" && $scope.model.employeekind != "") {
            $scope.errorEmployeekind = false;
        }
        //if (SelectType == "employeegroup" && $scope.model.employeegroup != "") {
        //    $scope.errorEmployeegroup = false;
        //}
        if (SelectType == "employeetype" && $scope.model.employeetype != "") {
            $scope.errorEmployeetype = false;
        }

        if (SelectType == "phone" && $scope.model.phone && $rootScope.partternPhone.test($scope.model.phone)) {
            $scope.errorphone = false;
        } else if (SelectType == "phone") {
            $scope.errorphone = true;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataservice.uploadImage(data, function (rs) {rs=rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Images = '/uploads/images/' + rs.Object;
                                            dataservice.update($scope.model, function (rs) {rs=rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                            });
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
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

        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
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
    function convertDatetime(date) {
        if (date != null && date != '') {
            var array = date.split('/');
            var result = array[1] + '/' + array[0] + '/' + array[2];
            return result;
        } else {
            return '';
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.NumLine == "" || data.NumLine == null) {
            $scope.errorNumLine = true;
            mess.Status = true;
        } else {
            $scope.errorNumLine = false;

        }
        if (data.Manager == "" || data.Manager == null) {
            $scope.errorManager = true;
            mess.Status = true;
        } else {
            $scope.errorManager = false;

        }
        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }
        return mess;
    }

    setTimeout(function () {
        var dateBirthday = new Date();
        dateBirthday.setFullYear(dateBirthday.getFullYear() - 10);
        var dateidentitycard = new Date();

        $(".date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: "01/01/1960",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $('#date-birthday').datepicker('setEndDate', dateBirthday);
        $('#date-birthday2').datepicker('setEndDate', dateBirthday);
        $('#date-identitycard').datepicker('setEndDate', dateidentitycard);
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('driver', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.modelDriver = {
        CarCode: '',
        Note: '',
        Driver: '',
        RouteCode: $rootScope.RouteCode,
    };
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Route/JTableDriver",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.RouteCode = $scope.model.RouteCode;
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
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fullname').withTitle('{{"ROUTE_LIST_COL_DRIVER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CarCode').withTitle('{{"ROUTE_LIST_COL_TRASH_CAR" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-10per').withTitle('{{"ROUTE_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="Delete" ng-click="deleteDriver(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    })); vm.reloadData = reloadData;
    vm.dtInstance = {};
    $scope.initData = function () {

        dataservice.getEmployee(function (rs) {rs=rs.data;
            $scope.managers = rs;
        });
        dataservice.getListCar(function (rs) {rs=rs.data;
            $scope.listCar = rs;
        });
    }
    $scope.initData();
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadDriver = function () {
        $scope.reload();
    }
    $scope.search = function () {
        vm.dtInstance.reloadData();
    }
    $scope.addDriver = function () {
        dataservice.insertDriverMapping($scope.modelDriver, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reloadDriver();
            }
        });
    }
    $scope.deleteDriver = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.ROUTE_MSG_SURE_DELETE;
                $scope.ok = function () {
                    dataservice.deleteDriverMapping(id, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $scope.reloadDriver();
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

    }
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
});
app.controller('node', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.modelNode = {
        NodeCode: '',
        RouteCode: $rootScope.RouteCode,
        Note: '',
    };
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Route/JTableNode",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.RouteCode = $scope.model.RouteCode;
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
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NodeName').withTitle('{{"ROUTE_LIST_COL_NODE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ROUTE_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-10per').withTitle('{{"ROUTE_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="Delete" ng-click="deleteNode(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    $scope.initData = function () {
        dataservice.getListNode(function (rs) {rs=rs.data;
            debugger
            $scope.ListNode = rs;

        });

    }
    $scope.initData();
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadNode = function () {
        $scope.reload();
    }

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
    $scope.addNode = function () {
        dataservice.insertNode($scope.modelNode, function (rs) {rs=rs.data;
            debugger
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        });
    }
    $scope.deleteNode = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.ROUTE_MSG_SURE_DELETE_NODE;
                $scope.ok = function () {
                    dataservice.deleteNode(id, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $scope.reloadNode();
                        }
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });

    }

    $scope.search = function () {
        vm.dtInstance.reloadData();
    }

});
app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, para) {
    $scope.listParkingTemp = [];
    $scope.lisPicture = [
        {
            'name': 'pinmap_red',
            'url': '/images/map/pinmap_red.png'
        },
        {
            'name': 'pinmap_start',
            'url': '/images/map/pinmap_start.png'
        }, {
            'name': 'pinmap_orange',
            'url': '/images/map/pinmap_orange.png'
        }, {
            'name': 'pinmap_violet',
            'url': '/images/map/pinmap_violet.png'
        }
    ];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    console.log(para);
    //------*** KHAI BÁO CÁC BIẾN CẦN THIẾT cho map ol ***-----------------
    
    var listPolyline = [];
    var listMarker = [];
    var DataPolyline = {};
    // layer map
    var LayerMap;
    var layerGoogle = new ol.source.XYZ({
        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    })
    var OSM = new ol.source.OSM({
        
    })
    //code hide future 
    encodeStyle = function (styles) {
        let ret = "";

        const styleparse_types = { "all": "0", "administrative": "1", "administrative.country": "17", "administrative.land_parcel": "21", "administrative.locality": "19", "administrative.neighborhood": "20", "administrative.province": "18", "landscape": "5", "landscape.man_made": "81", "landscape.natural": "82", "poi": "2", "poi.attraction": "37", "poi.business": "33", "poi.government": "34", "poi.medical": "36", "poi.park": "40", "poi.place_of_worship": "38", "poi.school": "35", "poi.sports_complex": "39", "road": "3", "road.arterial": "50", "road.highway": "49", "road.local": "51", "transit": "4", "transit.line": "65", "transit.station": "66", "water": "6" };

        const styleparse_elements = { "all": "a", "geometry": "g", "geometry.fill": "g.f", "geometry.stroke": "g.s", "labels": "l", "labels.icon": "l.i", "labels.text": "l.t", "labels.text.fill": "l.t.f", "labels.text.stroke": "l.t.s" };

        const styleparse_stylers = { "color": "p.c", "gamma": "p.g", "hue": "p.h", "invert_lightness": "p.il", "lightness": "p.l", "saturation": "p.s", "visibility": "p.v", "weight": "p.w" };

        styles.forEach((style) => {
            if (style.featureType) ret += "s.t:" + styleparse_types[style.featureType] + "|";

            // if !styleparse_elements[style.elementType], the style element is unknown
            if (style.elementType) ret += "s.e:" + styleparse_elements[style.elementType] + "|";

            style.stylers.forEach((styler) => {
                let keys = [];
                for (var k in styler) {
                    if (k === "color" && styler[k].length === 7) styler[k] = "#ff" + styler[k].slice(1);
                    ret += styleparse_stylers[k] + ":" + styler[k] + "|";
                }
            });

            ret = ret.slice(0, ret.length - 1);
            ret += ","
        });

        return encodeURIComponent(ret.slice(0, ret.length - 1));
    };
    //layer hide fure 
    styles = [
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        }
    ];
    const apistyles = encodeStyle(styles);
    var googleLayer = new ol.source.XYZ({
        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=' + apistyles,
    })

    //mảng chứa layer tuyến đường
    var routeSources = new ol.source.Vector({
        features: [
        ]
    });
    var routeSourceVector = new ol.layer.Vector({
        source: routeSources,
    });
    //mảng chứa layer Marker
    var routeMarkerSources = new ol.source.Vector({
        features: [
        ]
    });
    var routeMarkerLayer = new ol.layer.Vector({
        source: routeMarkerSources,
    });
    //---------*** END ***------------------------------------------
    
    var config = {
        init: function () {
            config.loadMap();
            config.hideMenuRight();
            config.loadOldRoute();
            config.resetDrag();
            config.save();
            config.draw();
            config.drawPoint();
            config.setHeightMap();
            config.mapReSize();
        },
        //load map
        loadMap: function () {
            var styles = {
                default: null,
                hide: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ "visibility": "off" }]
                    },
                    {
                        featureType: "transit",
                        elementType: "labels",
                        stylers: [{ "visibility": "off" }]
                    }
                ]
            };

            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 20.996721, lng: 105.808515 },
                zoom: 13,
                mapTypeControl: false
            });
            map.setOptions({ styles: styles['hide'] });
            LayerMap = new ol.layer.Tile({
                source: googleLayer
            });

            //loadmap
            map = new ol.Map({
                target: $('#map')[0], 
                layers: [
                    LayerMap,
                    //routeSourceVector,
                    //routeMarkerLayer
                ],
                view: new ol.View({
                    center: ol.proj.transform([105.805069, 20.991153], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 15
                }),
                controls: ol.control.defaults({
                    attribution: false,
                    zoom: false,
                })
            });
            //map = new google.maps.map(document.getelementbyid('map'), {
            //    center: { lat: 20.996721, lng: 105.808515 },
            //    zoom: 13,
            //    maptypecontrol: false
            //});
            //map = viewMap;
            // autocomplete
            var input = document.getElementById('autocomplete');
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);
            // Set the data fields to return when the user selects a place.
            autocomplete.setFields(
                ['address_components', 'geometry', 'icon', 'name']);

            var infowindow = new google.maps.InfoWindow();
            var infowindowContent = document.getElementById('infowindow-content');
            infowindow.setContent(infowindowContent);
            var marker = new google.maps.Marker({
                map: map,
                anchorPoint: new google.maps.Point(0, -29)
            });

            autocomplete.addListener('place_changed', function () {
                infowindow.close();
                marker.setVisible(false);
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);  // Why 17? Because it looks good.
                }
                marker.setPosition(place.geometry.location);
                marker.setVisible(true);

                var address = '';
                if (place.address_components) {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                    ].join(' ');
                }

                infowindowContent.children['place-icon'].src = place.icon;
                infowindowContent.children['place-name'].textContent = place.name;
                infowindowContent.children['place-address'].textContent = address;
                infowindow.open(map, marker);
            });
            //option ve Polyline
            poly = new google.maps.Polyline({
                strokeColor: '#8A2BE2',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            poly.setMap(map);
            //hide and show icon 
            document.getElementById('hide-poi').addEventListener('click', function () {
                LayerMap.setSource(googleLayer);
            });
            document.getElementById('show-poi').addEventListener('click', function () {
                LayerMap.setSource(layerGoogle);
            });
            // chuyeern map gg vaf osm
            document.getElementById('show-OSM').addEventListener('click', function osm() {
                console.log("trtysadf");
                LayerMap.setSource(OSM);
            });
            document.getElementById('show-gg').addEventListener('click', function googleMap() {
                console.log("gg Layer");
                LayerMap.setSource(googleLayer);
            });

            // chuyển view map và draw
            document.getElementById('view-map').addEventListener('click', function () {
                config.init();
            });
            document.getElementById('draw-map').addEventListener('click', function () {
                configDraw.init();
            });
            //document.getElementById('draw-gg').addEventListener('click', function googleMap() {
            //    console.log("gg Layer");
            //    LayerMap.setSource(googleLayer);
            //    map = drawMap;
            //});
        },
        save: function () {
            $('#save').click(function () {
                DataPolyline = {
                    gis_data: listPolyline,
                    properties: {
                        fill_color: "#FF0000",
                        font_size: 12
                    }
                }
                var a = JSON.stringify(DataPolyline)
                console.log(a);
                $uibModalInstance.close(a);
            });
        },
        addPolyline: function (event) {
            var path = poly.getPath();
            var object = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            listPolyline.push(object);
            path.push(event.latLng);
            console.log(path)
            console.log(listPolyline)
            var imgMaker = {
                url: '/images/map/iconFlag.png',
                labelOrigin: new google.maps.Point(18, -8),
                anchor: new google.maps.Point(1, 24),
                strokeWeight: 0,
                scale: .1,
                rotation: 0
            }
            var marker = new google.maps.Marker({
                icon: imgMaker,
                position: event.latLng,
                title: '#' + path.getLength(),
                map: map
            });
            listMarker.push(marker);
        },
        addPoint: function (event) {
            var imgMaker = {
                url: '/images/map/iconBin.png',
                labelOrigin: new google.maps.Point(18, -8),
                anchor: new google.maps.Point(1, 24),
                strokeWeight: 0,
                scale: .1,
                rotation: 0
            }
            var marker = new google.maps.Marker({
                icon: imgMaker,
                position: event.latLng,
                map: map
            });
            marker.addListener('click', function () {
                marker.setMap(null);
            });
        },
        //Ve Polyline
        draw: function () {
            $('#draw').click(function () {
                google.maps.event.clearListeners(map, 'click');
                map.addListener('click', config.addPolyline);

                map.on('click', function (evt) {
                    listPolyline.push([evt.coordinate[0], evt.coordinate[1]]); 
                    var routePolyLine = new ol.geom.LineString([]);
                    routePolyLine.setCoordinates(listPolyline);
                    var styleLine = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            width: 1, color: '#8A2BE2'
                        }),
                        fill: new ol.style.Fill({
                            color: '#00FFFF'
                        }),
                        zIndex: 2
                    })
                    var aaaa = new ol.Feature({
                        geometry: routePolyLine,
                        style: styleLine
                    });
                    aaaa.setStyle(styleLine);
                    routeSources.addFeature(aaaa);

                    // vẽ marker
                    var styleFunction = new ol.style.Style({
                        image: new ol.style.Icon(({
                            anchor: [0.06, 0.7],
                            size: [32, 32],
                            opacity: 6,
                            scale: 0.7,
                            src: '/images/map/iconFlag.png',
                            //src: '/images/map/xeracX.png'
                            //src: '/images/map/car.png'
                        })),
                        text: new ol.style.Text({
                            //text: result[i].NodeName,
                            fill: new ol.style.Fill({
                                color: '#8B0000'
                            }),
                            stroke: new ol.style.Stroke({
                                color: [141, 238, 238, 0.8],
                                width: 10
                            }),
                            font: 'bold 11px "Helvetica Neue", Arial',
                            backgroundFill: new ol.style.Fill({
                                color: 'black',
                            }),
                            textAlign: "bottom",
                            offsetY: -24,
                            offsetX: -4
                        })
                    })
                    var lonlat3857 = new ol.geom.Point(evt.coordinate);
                    var iconFeature = new ol.Feature({
                        geometry: lonlat3857,
                        style: styleFunction
                    });
                    routeMarkerSources.addFeature(iconFeature)
                });
            });
        },
        //vẽ điểm trên polyline
        drawPoint: function () {
            $('#drawPoint').click(function () {
                google.maps.event.clearListeners(map, 'click');
                debugger
                map.addListener('click', config.addPoint);
            });
        },
        //xóa Polyline
        resetDrag: function () {
            $('#refresh').click(function () {
                var a = poly.getPath();
                console.log(a);
                poly.getPath().removeAt(listPolyline.length - 1, listPolyline[listPolyline.length - 1]);
                listMarker[listPolyline.length - 1].setMap(null);
                listMarker.splice(listPolyline.length - 1, 1);
                listPolyline.splice(listPolyline.length - 1, 1);
            });
        },
        loadOldRoute: function () {

            debugger
            if (para != null && para != '') {
                var a = JSON.parse(para);
                listPolyline = a.gis_data;
                if (listPolyline.length > 1) {
                    for (var i = 0; i < listPolyline.length; i++) {
                        var imgMaker = {
                            url: '/images/map/iconFlag.png',
                            labelOrigin: new google.maps.Point(18, -8),
                            anchor: new google.maps.Point(1, 24),
                            strokeWeight: 0,
                            scale: .1,
                            rotation: 0
                        }
                        var marker = new google.maps.Marker({
                            icon: imgMaker,
                            position: listPolyline[i],
                            map: map
                        });
                        listMarker.push(marker);
                    }

                }
                poly = new google.maps.Polyline({
                    path: listPolyline,
                    strokeColor: '#8A2BE2',
                    strokeOpacity: 1.0,
                    strokeWeight: 3
                });
                poly.setMap(map);
            }
        },
        //hide menu
        hideMenuRight: function () {
            $('.mini-submenu').on('click', function () {
                if ($('.tab-content-map').hasClass("hidden")) {
                    $(".tab-content-map").removeClass("hidden");
                } else {
                    $(".tab-content-map").addClass("hidden");
                }
            });

        },
        //set height map
        loadImage: function (src) {
            var image = new Image();
            image.src = src;
            return image;
        },
        //set height map
        setHeightMap: function () {
            var maxHeightMap = $(window).height() - $("#map").position().top - 150;
            $("#map").css({
                'height': maxHeightMap,
                'max-height': maxHeightMap,
                'overflow': 'auto',
            });
            config.mapReSize();
        },
        //set map resize
        mapReSize: function () {
            setTimeout(function () {
                //map.updateSize();
            }, 600);
        }
    }

    var configDraw = {
        init: function () {
            configDraw.loadMap();
            configDraw.hideMenuRight();
            configDraw.loadOldRoute();
            configDraw.resetDrag();
            configDraw.save();
            configDraw.draw();
            configDraw.drawPoint();
            configDraw.setHeightMap();
            configDraw.mapReSize();
        },
        //load map
        loadMap: function () {
            var styles = {
                default: null,
                hide: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ "visibility": "off" }]
                    },
                    {
                        featureType: "transit",
                        elementType: "labels",
                        stylers: [{ "visibility": "off" }]
                    }
                ]
            };

            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 20.996721, lng: 105.808515 },
                zoom: 13,
                mapTypeControl: false,
                layers: [
                    LayerMap,
                    routeSourceVector,
                    routeMarkerLayer
                ],

                attribution: false,
            });
            //map.setOptions({ styles: styles['hide'] });
            //LayerMap = new ol.layer.Tile({
            //    source: googleLayer
            //});
            //loadmap
            //map = new ol.Map({
            //    target: $('#map')[0], 
            //    layers: [
            //        LayerMap,
            //        routeSourceVector,
            //        routeMarkerLayer
            //    ],
            //    view: new ol.View({
            //        center: ol.proj.transform([105.805069, 20.991153], 'EPSG:4326', 'EPSG:3857'),
            //        zoom: 15
            //    }),
            //    controls: ol.control.defaults({
            //        attribution: false,
            //        zoom: false,
            //    })
            //});

            // autocomplete
            var input = document.getElementById('autocomplete');
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);
            // Set the data fields to return when the user selects a place.
            autocomplete.setFields(
                ['address_components', 'geometry', 'icon', 'name']);

            var infowindow = new google.maps.InfoWindow();
            var infowindowContent = document.getElementById('infowindow-content');
            infowindow.setContent(infowindowContent);
            var marker = new google.maps.Marker({
                map: map,
                anchorPoint: new google.maps.Point(0, -29)
            });

            autocomplete.addListener('place_changed', function () {
                infowindow.close();
                marker.setVisible(false);
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);  // Why 17? Because it looks good.
                }
                marker.setPosition(place.geometry.location);
                marker.setVisible(true);

                var address = '';
                if (place.address_components) {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                    ].join(' ');
                }

                infowindowContent.children['place-icon'].src = place.icon;
                infowindowContent.children['place-name'].textContent = place.name;
                infowindowContent.children['place-address'].textContent = address;
                infowindow.open(map, marker);
            });
            //option ve Polyline
            poly = new google.maps.Polyline({
                strokeColor: '#8A2BE2',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            poly.setMap(map);
            //hide and show icon 
            
            // chuyển view map và draw
            document.getElementById('view-map').addEventListener('click', function () {
                config.init();
                document.getElementById('view-map').checked(true);
                document.getElementById('draw-map').checked(false);
            });
            document.getElementById('draw-map').addEventListener('click', function () {
                configDraw.init();
                document.getElementById('view-map').checked(false);
                document.getElementById('draw-map').checked(true);
            });
        },
        save: function () {
            $('#save').click(function () {
                DataPolyline = {
                    gis_data: listPolyline,
                    properties: {
                        fill_color: "#FF0000",
                        font_size: 12
                    }
                }
                var a = JSON.stringify(DataPolyline)
                console.log(a);
                $uibModalInstance.close(a);
            });
        },
        addPolyline: function (event) {
            var path = poly.getPath();
            var object = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            listPolyline.push(object);
            path.push(event.latLng);
            console.log(path)
            console.log(listPolyline)
            var imgMaker = {
                url: '/images/map/iconFlag.png',
                labelOrigin: new google.maps.Point(18, -8),
                anchor: new google.maps.Point(1, 24),
                strokeWeight: 0,
                scale: .1,
                rotation: 0
            }
            var marker = new google.maps.Marker({
                icon: imgMaker,
                position: event.latLng,
                title: '#' + path.getLength(),
                map: map
            });
            listMarker.push(marker);
        },
        addPoint: function (event) {
            var imgMaker = {
                url: '/images/map/iconBin.png',
                labelOrigin: new google.maps.Point(18, -8),
                anchor: new google.maps.Point(1, 24),
                strokeWeight: 0,
                scale: .1,
                rotation: 0
            }
            var marker = new google.maps.Marker({
                icon: imgMaker,
                position: event.latLng,
                map: map
            });
            marker.addListener('click', function () {
                marker.setMap(null);
            });
        },
        //Ve Polyline
        draw: function () {
            $('#draw').click(function () {
                //google.maps.event.clearListeners(map, 'click');
                map.addListener('click', configDraw.addPolyline);

                //map.on('click', function (evt) {
                //    listPolyline.push([evt.coordinate[0], evt.coordinate[1]]); 
                //    var routePolyLine = new ol.geom.LineString([]);
                //    routePolyLine.setCoordinates(listPolyline);
                //    var styleLine = new ol.style.Style({
                //        stroke: new ol.style.Stroke({
                //            width: 1, color: '#8A2BE2'
                //        }),
                //        fill: new ol.style.Fill({
                //            color: '#00FFFF'
                //        }),
                //        zIndex: 2
                //    })
                //    var aaaa = new ol.Feature({
                //        geometry: routePolyLine,
                //        style: styleLine
                //    });
                //    aaaa.setStyle(styleLine);
                //    routeSources.addFeature(aaaa);

                //    // vẽ marker
                //    var styleFunction = new ol.style.Style({
                //        image: new ol.style.Icon(({
                //            anchor: [0.06, 0.7],
                //            size: [32, 32],
                //            opacity: 6,
                //            scale: 0.7,
                //            src: '/images/map/iconFlag.png',
                //            //src: '/images/map/xeracX.png'
                //            //src: '/images/map/car.png'
                //        })),
                //        text: new ol.style.Text({
                //            //text: result[i].NodeName,
                //            fill: new ol.style.Fill({
                //                color: '#8B0000'
                //            }),
                //            stroke: new ol.style.Stroke({
                //                color: [141, 238, 238, 0.8],
                //                width: 10
                //            }),
                //            font: 'bold 11px "Helvetica Neue", Arial',
                //            backgroundFill: new ol.style.Fill({
                //                color: 'black',
                //            }),
                //            textAlign: "bottom",
                //            offsetY: -24,
                //            offsetX: -4
                //        })
                //    })
                //    var lonlat3857 = new ol.geom.Point(evt.coordinate);
                //    var iconFeature = new ol.Feature({
                //        geometry: lonlat3857,
                //        style: styleFunction
                //    });
                //    routeMarkerSources.addFeature(iconFeature)
                //});
            });
        },
        //vẽ điểm trên polyline
        drawPoint: function () {
            $('#drawPoint').click(function () {
                google.maps.event.clearListeners(map, 'click');
                debugger
                map.addListener('click', configDraw.addPoint);
            });
        },
        //xóa Polyline
        resetDrag: function () {
            $('#refresh').click(function () {
                var a = poly.getPath();
                console.log(a);
                poly.getPath().removeAt(listPolyline.length - 1, listPolyline[listPolyline.length - 1]);
                listMarker[listPolyline.length - 1].setMap(null);
                listMarker.splice(listPolyline.length - 1, 1);
                listPolyline.splice(listPolyline.length - 1, 1);
            });
        },
        loadOldRoute: function () {

            debugger
            if (para != null && para != '') {
                var a = JSON.parse(para);
                listPolyline = a.gis_data;
                if (listPolyline.length > 1) {
                    for (var i = 0; i < listPolyline.length; i++) {
                        var imgMaker = {
                            url: '/images/map/iconFlag.png',
                            labelOrigin: new google.maps.Point(18, -8),
                            anchor: new google.maps.Point(1, 24),
                            strokeWeight: 0,
                            scale: .1,
                            rotation: 0
                        }
                        var marker = new google.maps.Marker({
                            icon: imgMaker,
                            position: listPolyline[i],
                            map: map
                        });
                        listMarker.push(marker);
                    }

                }
                poly = new google.maps.Polyline({
                    path: listPolyline,
                    strokeColor: '#8A2BE2',
                    strokeOpacity: 1.0,
                    strokeWeight: 3
                });
                poly.setMap(map);
            }
        },
        //hide menu
        hideMenuRight: function () {
            $('.mini-submenu').on('click', function () {
                if ($('.tab-content-map').hasClass("hidden")) {
                    $(".tab-content-map").removeClass("hidden");
                } else {
                    $(".tab-content-map").addClass("hidden");
                }
            });

        },
        //set height map
        loadImage: function (src) {
            var image = new Image();
            image.src = src;
            return image;
        },
        //set height map
        setHeightMap: function () {
            var maxHeightMap = $(window).height() - $("#map").position().top - 150;
            $("#map").css({
                'height': maxHeightMap,
                'max-height': maxHeightMap,
                'overflow': 'auto',
            });
            configDraw.mapReSize();
        },
        //set map resize
        mapReSize: function () {
            setTimeout(function () {
                //map.updateSize();
            }, 600);
        }
    }
    function hexToRgbA(hex, opacity) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
        }
        throw new Error('Bad Hex');
    }
    function hexToRgb(hex, a) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            r = parseInt(result[1], 16);
            g = parseInt(result[2], 16);
            b = parseInt(result[3], 16);
            var mess = 'rgba(' + r + ', ' + g + ', ' + b + ',' + a + ')';
            return mess
        }

    }
    setTimeout(function () {
        config.init();
    }, 200);
});



