var ctxfolderRQRaw = "/views/admin/orderRequestRaw";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_RQ_RAW', ["ui.bootstrap", "ngRoute", "pascalprecht.translate", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select']);
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
app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});
app.factory('dataserviceRQRaw', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        //var formData = new FormData();
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
            $http.post('/Admin/OrderRequestRaw/Insert/', data, {
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
        update: function (data, callback) {
            $http.post('/Admin/OrderRequestRaw/Update/', data, {
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
        updateStatus: function (data, callback) {
            $http.post('/Admin/OrderRequestRaw/UpdateStatus/', data, {
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
        delete: function (data, callback) {
            $http.post('/Admin/OrderRequestRaw/Delete/', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/OrderRequestRaw/GetItem/', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getListFile: function (data, callback) {
            $http.get('/Admin/OrderRequestRaw/GetListFile?id=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getItemFile: function (data, callback) {
            $http.post('/Admin/EDMSRepository/GetItem?id=' + data).then(callback);
        },
        getPathFile: function (data, callback) {
            $http.get('/Admin/OrderRequestRaw/GetPathFile?filePath=' + data).then(callback);
        },
        getAutocomplete: function (data, callback) {
            $http.get('/Admin/GalaxyKeyword/GetAutocomplete?key=' + data).then(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/OrderRequestRaw/UploadFile/', data, callback);
        },
    }
});
app.directive('customOnChange', function () {
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
app.controller('Ctrl_ESEIM_RQ_RAW', function ($scope, $rootScope, $filter, dataserviceRQRaw, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.permissionOrderRequest = PERMISSION_ORDER_REQUEST;
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });

        $rootScope.partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
        $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
        //Miêu tả có thể null, và có chứa được khoảng trắng
        $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
        $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
        $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
        $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
        $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
        $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0

        $rootScope.checkData = function (data) {
            var mess = { Status: false, Title: "" }
            if (!$rootScope.partternEmail.test(data.Email) && data.Email != '' && data.Email != null) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ORR_CURD_VALIDATE_MAIL, "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                },
                Content: {
                    required: true,
                },
                Phone: {
                    regx: /^(^0)+([0-9]){9,10}\b$/
                }

            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ORR_CURD_LBL_ORR_TITLE),
                },
                Content: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ORR_CURD_LBL_ORR_CONTENT),
                },
                Phone: {
                    regx: caption.ORR_VALIDATE_PHONE_NUMBER
                }
            }
        }
        $rootScope.IsTranslate = true;
    });
    $rootScope.statusData = [{
        Code: 'PENDING',
        Name: 'Đang chờ'
    }, {
        Code: 'DONE',
        Name: 'Hoàn thành'
    }]
});

app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/OrderRequestRaw/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderRQRaw + '/index.html',
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
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRQRaw, $filter, myService) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
        Title: '',
        Content: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/OrderRequestRaw/JTable",
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
                d.Title = $scope.model.Title;
                d.Content = $scope.model.Content;
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
            if ($rootScope.permissionOrderRequest.Update) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{ "ORR_LIST_COL_ORR_TITLE" | translate }}').withOption('sClass', 'w-20').renderWith(function (data, type, full) {
        var deadLine = '';
        if (full.RequestTime == '') {
            deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Không đặt thời hạn</span>'
        } else {
            var created = new Date(full.RequestTime);
            var diffMs = (created - new Date());
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else {
                deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            }
        }

        if (full.Priority == '0') {
            return '<span> ' + data + '</span>' +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9">&nbsp;Thấp</span>' + deadLine +
                '</div> ';
        } else if (full.Priority == '1') {
            return '<span> ' + data + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Trung bình</span>' + deadLine +
                '</div>';
        } else if (full.Priority == '2') {
            return '<span> ' + data + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-danger">&nbsp;Rất cao</span>' + deadLine +
                '</div>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Priority').withOption('sClass').withTitle('{{ "ORR_LIST_COL_ORR_PRIORITY" | translate }}').renderWith(function (data, type) {
        if (data == "0") {
            return '<span class="badge-customer badge-customer-success fs9">&nbsp;Thấp</span>';
        } else if (data == "1") {
            return '<span class="badge-customer badge-customer-warning">&nbsp;Trung bình</span>';
        } else if (data == "2") {
            return '<span class="badge-customer badge-customer-danger">&nbsp;Rất cao</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Phone').withTitle('{{  "ORR_LIST_COL_ORR_PHONE" | translate }}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{  "ORR_LIST_COL_ORR_EMAIL" | translate }}').renderWith(function (data, type, full) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('RequestTime').withTitle('{{  "ORR_LIST_COL_ORR_REQUESTTIME" | translate }}').notSortable().renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('File').withTitle('{{ "ORR_COL_EDIT" | translate }}').renderWith(function (data, type, full) {

        return '<a ng-click="getObjectFile(\'' + full.FilePath + '\')" title="{{&quot; Chỉnh sửa &quot; | translate}}"  style = " margin-left: 20px; width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45); color: green; border-color: green;" class="btn btn-icon-only btn-circle btn-outline green pt3"><i class="fa fa-edit"></i></a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('File_Code').withTitle('{{ "Log " | translate }}').renderWith(function (data, type, full) {
        return '<button title="{{&quot; Log change Document &quot; | translate}}" ng-click="readLogChange(\'' + full.FilePath + '\')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45); border-color: plum; color: plum;" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-user-edit"></i></button>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{ "ORR_COL_CREATE_BY" | translate }}').withOption('sClass', 'w-27').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').withOption('sClass', 'w-11').renderWith(function (data, type, full, meta) {
        var listButton = '';
        if ($rootScope.permissionOrderRequest.Update) {
            listButton += '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
        }
        if ($rootScope.permissionOrderRequest.Delete) {
            listButton += '<button ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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


    $scope.reload = function () {
        reloadData(true);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRQRaw + '/add.html',
            controller: 'add',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
        dataserviceRQRaw.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                myService.setData(rs.Object);
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderRQRaw + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '50'
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () { });
            }
        });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataserviceRQRaw.delete(id, function (rs) {
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
    };
    $scope.status = function (id) {
        dataserviceRQRaw.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderRQRaw + '/status.html',
                    controller: 'status',
                    size: '30',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                }, function () { });
            }
        });
    }
    $scope.viewFile = function (id) {
        dataserviceRQRaw.getListFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderRQRaw + '/viewFile.html',
                    controller: 'viewFile',
                    size: '35',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                }, function () { });
            }
        })
    }
    $scope.getObjectFile = function (source) {
        dataserviceRQRaw.getPathFile(source, function (rs) {
            var extension = source.substr(source.lastIndexOf('.') + 1);
            var word = ['DOCX', 'DOC'];
            var pdf = ['PDF'];
            var excel = ['XLS', 'XLSX'];
            if (word.indexOf(extension.toUpperCase()) !== -1) {
                window.open('/Admin/Docman/Index', '_blank')
            } else if (pdf.indexOf(extension.toUpperCase()) !== -1) {
                window.open('/Admin/PDF/Index', '_blank')
            } else if (excel.indexOf(extension.toUpperCase()) !== -1) {
                window.open('/Admin/Excel', '_blank')
            } else {
                window.open(source, '_blank')
            }
        })
    }
    $scope.readLogChange = function (path) {
        debugger
        var extension = "." + path.substr(path.lastIndexOf('.') + 1);
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        if (excel.indexOf(extension.toUpperCase()) !== -1) {
            App.toastrError(caption.ORR_NONE_LOG_EXCEL);
        } else if (word.indexOf(extension.toUpperCase()) !== -1) {
            $rootScope.FileCodeLog = path;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderRQRaw + '/logchange.html',
                controller: 'logchange',
                backdrop: 'false',
                size: '70',
                //resolve: {
                //    param: function () {
                //        return rs;
                //    }
                //}
            });
        } else if (pdf.indexOf(extension.toUpperCase()) !== -1) {
            App.toastrError(caption.ORR_NONE_LOG_PDF);
        }
        //dataserviceRQRaw.getItemLogchange(id, function (rs) {rs=rs.data;

        //});
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

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceRQRaw, $filter) {
    $scope.entities = [{
        name: caption.ORR_CURD_CHECK_PRIORITY_LOW,
        checked: true,
        value: 0,
    }, {
        name: caption.ORR_CURD_CHECK_PRIORITY_MEDIUM,
        checked: false,
        value: 1,
    }, {
        name: caption.ORR_CURD_CHECK_PRIORITY_VERYHIGH,
        checked: false,
        value: 2,
    }]
    $scope.key = '';
    var fileId = -1;
    $scope.model = {
        Title: '',
        Content: '',
        Phone: '',
        Email: '',
        Priority: '',
        RequestTime: '',
        Keyword: '',
        ListFile: [],
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.addKey = function () {
        var str = $("#key").val();
        if (str != '') {
            $("#key").val("");
            $('#Key input').val(str);

            e = jQuery.Event("keypress");
            e.which = 13;
            $("#Key input").keypress(function () {
            }).trigger(e);
        } else {
            //App.toastrError("Vui lòng nhập từ khóa");
            App.toastrError(caption.ORR_MSG_INPUT_INFOMATION);
        }
    }
    $scope.googleSearch = function (id) {
        dataserviceRQRaw.getAutocomplete($scope.key, function (rs) {
            rs = rs.data;
            if (rs.length != 0) {
                $('#' + id).autocomplete({
                    source: rs
                });
            } else {
                var str = document.getElementById(id).value;
                $.getJSON("http://suggestqueries.google.com/complete/search?callback=?",
                    {
                        "hl": "vi",
                        "q": str,
                        "client": "chrome"
                    }
                )
                    .done(function (data) {
                        data[1].length = 7;
                        $('#' + id).autocomplete({
                            source: data[1]
                        });
                    });
            }
        });
    }
    $scope.updateSelection = function (position, entities) {
        angular.forEach(entities, function (subscription, index) {
            if (position != index) {
                subscription.checked = false;
            }
        });
    }
    $scope.isMasterFile = function (position, files) {
        debugger
        angular.forEach(files, function (file, index) {
            if (position != index) {
                //file.checked = false;
                file.IsMaster = false;
                $scope.model.IsMaster = false;
                file.IsMaster = $scope.model.IsMaster;
            } else {
                //file.checked = true;
                file.IsMaster = true;
                $scope.model.IsMaster = true;
                file.IsMaster = $scope.model.IsMaster;
            }
        })
    }
    $scope.uploadFile = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var name = files[0].name.substr(0, idxDot - 1).toLowerCase();
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        var exist = false;
        for (var i = 0; i < $scope.model.ListFile.length; i++) {
            if ($scope.model.ListFile[i].FileName == name) {
                exist = true;
            }
        }
        if (exist) {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        } else {
            var formData = new FormData();
            formData.append("file", files[0]);
            dataserviceRQRaw.uploadFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var input = $("#File");
                    input.replaceWith(input.val('').clone(true));
                    $scope.file = {
                        Id: fileId++,
                        FileName: name,
                        FileType: extFile,
                        //User: rs.Object != null ? rs.Object.User : null,
                        //CreatedTime: new Date(),
                        FilePath: rs.Object != null ? rs.Object.Source : null
                    }
                    $scope.model.ListFile.push($scope.file);
                    App.toastrSuccess(rs.Title);
                }
            })
        }
    };
    $scope.deleteFile = function (index) {
        $scope.model.ListFile.splice(index, 1);
        App.toastrSuccess(caption.COM_MSG_DELETE_SUCCESS.replace('{0}', caption.COM_FILE));
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var getPriority = $scope.entities.find(function (element) {
                if (element.checked == true) return true;
            });
            if (getPriority) {
                $scope.model.Priority = getPriority.value;
            }
            //var getMasterFile = $scope.ListFile.find(function (element) {
            //    if (element.checked == true) return true;
            //});
            //if (getMasterFile) {
            //    $scope.model.IsMaster = getMasterFile.value;
            //}
            dataserviceRQRaw.insert($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    setTimeout(function () {
        $("#requestTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $('.tag-input').tagsinput();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Phone && !$rootScope.partternPhone.test(data.Phone)) {
            $scope.errorPhone = true;
            mess.Status = true;
        } else {
            $scope.errorPhone = false;
        }

        return mess;
    };
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceRQRaw, myService) {
    var fileId = -1;
    $scope.entities = [{
        name: caption.ORR_CURD_CHECK_PRIORITY_LOW,
        checked: false,
        value: 0,
    }, {
        name: caption.ORR_CURD_CHECK_PRIORITY_MEDIUM,
        checked: false,
        value: 1,
    }, {
        name: caption.ORR_CURD_CHECK_PRIORITY_VERYHIGH,
        checked: false,
        value: 2,
    }]
    $scope.key = '';
    $scope.initLoad = function () {
        debugger
        $scope.model = myService.getData();
        if ($scope.model.Priority == "0") {
            $scope.entities[0].checked = true;
        } else if ($scope.model.Priority == "1") {
            $scope.entities[1].checked = true;
        } else {
            $scope.entities[2].checked = true;
        }

    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.isMasterFile = function (position, files) {
        debugger
        // $scope.model.ListFile.splice(0);
        angular.forEach(files, function (file, index) {
            if (position != index) {
                //file.checked = false;
                file.IsMaster = false;
                $scope.model.IsMaster = false;
                file.IsMaster = $scope.model.IsMaster;
            } else {
                //file.checked = true;
                file.IsMaster = true;
                $scope.model.IsMaster = true;
                file.IsMaster = $scope.model.IsMaster;
            }
        })
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var getPriority = $scope.entities.find(function (element) {
                if (element.checked == true) return true;
            });
            if (getPriority) {
                $scope.model.Priority = getPriority.value;
            }

            //var getMasterFile = $scope.ListFile.find(function (element) {
            //    if (element.checked == true) return true;
            //});
            //if (getMasterFile) {
            //    $scope.model.IsMaster = getMasterFile.value;
            //}
            dataserviceRQRaw.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    $scope.addKey = function () {
        var str = $("#key").val();
        if (str != '') {
            $("#key").val("");
            $('#Key input').val(str);

            e = jQuery.Event("keypress");
            e.which = 13;
            $("#Key input").keypress(function () {
            }).trigger(e);
        } else {
            App.toastrError(caption.ORR_MSG_INPUT_INFOMATION);
        }
    }
    $scope.googleSearch = function (id) {
        dataserviceRQRaw.getAutocomplete($scope.key, function (rs) {
            rs = rs.data;
            if (rs.length != 0) {
                $('#' + id).autocomplete({
                    source: rs
                });
            } else {
                var str = document.getElementById(id).value;
                $.getJSON("http://suggestqueries.google.com/complete/search?callback=?",
                    {
                        "hl": "vi",
                        "q": str,
                        "client": "chrome"
                    }
                )
                    .done(function (data) {
                        data[1].length = 7;
                        $('#' + id).autocomplete({
                            source: data[1]
                        });
                    });
            }
        });
    }
    $scope.updateSelection = function (position, entities) {
        angular.forEach(entities, function (subscription, index) {
            if (position != index) {
                subscription.checked = false;
            }
        });
    }
    $scope.uploadFile = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var name = files[0].name.substr(0, idxDot - 1).toLowerCase();
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        var exist = false;
        for (var i = 0; i < $scope.model.ListFile.length; i++) {
            if ($scope.model.ListFile[i].FileName == name) {
                exist = true;
            }
        }
        if (exist) {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        } else {
            var formData = new FormData();
            formData.append("file", files[0]);
            dataserviceRQRaw.uploadFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var input = $("#File");
                    input.replaceWith(input.val('').clone(true));
                    $scope.file = {
                        Id: fileId++,
                        FileName: name,
                        FileType: extFile,
                        //User: rs.Object != null ? rs.Object.User : null,
                        //CreatedTime: new Date(),
                        FilePath: rs.Object != null ? rs.Object.Source : null
                    }
                    $scope.model.ListFile.push($scope.file);
                    App.toastrSuccess(rs.Title);
                }
            })
        }
    };
    $scope.deleteFile = function (index, id) {
        debugger
        if ($scope.model.ListFile[index].IsMaster == false) {
            $scope.model.ListFile.splice(index, 1);
            if (id > 0) {
                $scope.model.ListDeletedFile.push(id);
            }
            App.toastrSuccess(caption.COM_MSG_DELETE_SUCCESS.replace('{0}', caption.COM_FILE));
        } else {
            App.toastrError(caption.ORR_DENY_DELETE);
        }

    }
    setTimeout(function () {
        var numberPeriod = document.getElementById('Phone');
        numberPeriod.onkeydown = function (e) {
            if (!((e.keyCode > 95 && e.keyCode < 106)
                || (e.keyCode > 47 && e.keyCode < 58)
                || e.keyCode == 8)) {
                return false;
            }
        }
        $("#requestTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $('.tag-input').tagsinput();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Phone && !$rootScope.partternPhone.test(data.Phone)) {
            $scope.errorPhone = true;
            mess.Status = true;
        } else {
            $scope.errorPhone = false;
        }

        return mess;
    };
});

app.controller('viewFile', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceRQRaw, para) {
    $scope.initLoad = function () {
        $scope.listFile = para;
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
app.controller('status', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceRQRaw, para) {
    debugger
    $scope.model = {
        Id: para.Id,
        Status: para.Status,
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            dataserviceRQRaw.updateStatus($scope.model, function (result) {
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
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('logchange', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRQRaw, $filter, $translate) {
    var vm = $scope;
    debugger
    //$scope.model = param;
    $scope.model = {

    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {

            url: "/Admin/OrderRequestRaw/JTablLogchange",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                debugger
                d.FileCode = $rootScope.FileCodeLog;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })

        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "ORR_COL_FIX_TIME" | translate }}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{ "COM_NAME_FILE" | translate }}').withOption('sWidth', '25px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserID').withTitle('{{ "ORR_COL_FIX_ACCOUNT" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LogText').withTitle('{{ "ORR_COL_FIX_CONTENT" | translate }}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LogContent').withTitle('{{ "ORR_COL_TXT_FIX" | translate }}').renderWith(function (data, type, full) {
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
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.search = function (id) {
        reloadData(true);
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
