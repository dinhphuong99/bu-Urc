var ctxfolder = "/views/admin/urencoMaterialProductGroup";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
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
    return {
        insert: function (data, callback) {
            $http.post('/Admin/UrencoMaterialProductGroup/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/UrencoMaterialProductGroup/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Category/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/UrencoMaterialProductGroup/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/UrencoMaterialProductGroup/GetItem/' + data).then(callback);
        },
        gettreedataCoursetype: function (callback) {
            $http.post('/Admin/UrencoMaterialProductGroup/gettreedataCoursetype/').then(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/Admin/UrencoMaterialProductGroup/gettreedataLevel/').then(callback);
        },
        gettreedataedit: function (callback) {
            $http.post('/Admin/UrencoMaterialProductGroup/gettreedataLevel/').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/EDMSCategory/UploadImage/', data, callback);
        }
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, $cookies, $translate, dataservice) {
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
                ProductCode: {
                    required: true,
                    maxlength: 50
                },
                ProductName: {
                    required: true,
                    maxlength: 50
                },

            },
            messages: {
                ProductCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MPG_CURD_LBL_MPG_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MPG_CURD_LBL_MPG_CODE).replace("{1}", "50")
                },
                ProductName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MPG_CURD_LBL_MPG_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MPG_CURD_LBL_MPG_NAME).replace("{1}", "50")
                },

            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/UrencoMaterialProductGroup/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();


    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })


    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
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


app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        para: '',
        code: '',
        name: '',
        parenid: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UrencoMaterialProductGroup/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.code = $scope.model.code;
                d.name = $scope.model.name;
                d.parenid = $scope.model.parenid;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('Mã nhóm tài sản').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('Tên nhóm tài sản').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"MPG_LIST_COL_MPG_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MPG_LIST_COL_MPG_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Chỉnh sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45)" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    };
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {result=result.data;
            $scope.treedataLevel = result.Object;
        });
    }
    $scope.initData();
    var size = 0;
    if ($window.innerWidth < 1400 ) {
        size = 50;
    } else if ($window.innerWidth > 1400 ) {
        size = 40;
    } 
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: size,

        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (Id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: true,
            size: size,
            resolve: {
                para: function () {
                    return Id;
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
            windowClass: "panel-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn xóa ?";
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
            var list = $('#tblData').DataTable().data();
            if (list.length > 1)
                $scope.reloadNoResetPage();
            else
                $scope.reload();
        }, function () {
        });
    }
    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });
    }
    setTimeout(function () {
        showHideSearch();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        ParentID: '',
        Code: '',
        Name: '',
        Description: ''
    }
    $scope.initData = function () {
        dataservice.gettreedataCoursetype(function (result) {result=result.data;
            $scope.treedataCoursetype = result.Object;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.insert($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.model = {
        FileName: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.gettreedataedit(function (result) {result=result.data;
            $scope.treedataedit = result.Object;
        });
        dataservice.getItem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.addform.validate()) {
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

