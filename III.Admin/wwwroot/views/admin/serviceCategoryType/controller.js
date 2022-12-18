﻿var ctxfolderServiceCatType = "/views/admin/serviceCategoryType";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_SERVICE_CAT_TYPE', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataserviceServiceCatType', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getAllType: function (callback) {
            $http.post('/Admin/ServiceCategoryType/GetAllData').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/ServiceCategoryType/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/ServiceCategoryType/Update/', data).then(callback);
        },
        getData: function (data, callback) {
            $http.post('/Admin/ServiceCategoryType/GetData/' + data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/ServiceCategoryType/Delete/' + data).then(callback);
        }
    }
});
app.controller('Ctrl_ESEIM_SERVICE_CAT_TYPE', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceServiceCatType, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    }; 
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.validationOptions = {
            rules: {
                Code: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 255
                }
            },
            messages: {
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SCT_CURD_LBL_CODE),
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SCT_CURD_LBL_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SCT_CURD_LBL_CODE).replace("{1}", "100")
                },
                Name: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SCT_CURD_LBL_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SCT_CURD_LBL_NAME).replace("{1}", "255")
                }
            }
        }
    });
    
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ServiceCategoryType/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderServiceCatType + '/index.html',
            controller: 'index_service_cat_type'
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
app.controller('index_service_cat_type', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceServiceCatType, $translate, $window) {
    var vm = $scope;
    vm.dt = {};
    $scope.model = {
        MaterialCode: '',
        MaterialName: '',
        MaterialParent: '',
        ParentId: '',
        TypeCode: '',
        TypeName: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    dataserviceServiceCatType.getAllType(function (rs) {rs=rs.data;
        $scope.Types = rs;
    })


    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsServiceCatType = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ServiceCategoryType/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.MaterialCode = $scope.model.TypeCode;
                d.MaterialName = $scope.model.TypeName;
                d.MaterialParent = $scope.model.ParentId.Id == undefined ? '' : $scope.model.ParentId.Id;
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
                    $scope.selected[data.id] = !$scope.selected[data.id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.id] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumnsServiceCatType = [];
    vm.dtColumnsServiceCatType.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumnsServiceCatType.push(DTColumnBuilder.newColumn('code').withTitle('{{"SCT_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsServiceCatType.push(DTColumnBuilder.newColumn('name').withTitle('{{"SCT_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsServiceCatType.push(DTColumnBuilder.newColumn('description').withTitle('{{"SCT_COL_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsServiceCatType.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"SCT_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';

    }));
    vm.reloadDataServiceCatType = reloadDataServiceCatType;
    vm.dt.dtInstanceServiceCatType = {};
    function reloadDataServiceCatType(resetPaging) {
        vm.dt.dtInstanceServiceCatType.reloadData(callback, resetPaging);
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
        reloadDataServiceCatType(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadDataServiceCatType(false);
    };
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 35;
    } else if ($window.innerWidth > 1400) {
        size = 25;
    } 
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderServiceCatType + '/add.html',
            controller: 'add_service_cat_type',
            backdrop: 'static',
            //windowClass: "modal-center",
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderServiceCatType + '/edit.html',
            controller: 'edit_service_cat_type',
            backdrop: 'static',
            //windowClass: "modal-center",
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceServiceCatType.delete(id, function (rs) {rs=rs.data;
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
    }, 200);
});

app.controller('add_service_cat_type', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceServiceCatType) {
    $scope.model = {
        ParentId: ''
    }

    $scope.initData = function () {
        dataserviceServiceCatType.getAllType(function (rs) {rs=rs.data;
            $scope.Types = rs;
        })
    }
    $scope.initData();

    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceServiceCatType.insert($scope.model, function (rs) {rs=rs.data;
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit_service_cat_type', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceServiceCatType, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.listParent = [];
    $scope.initData = function () {
        var listParent = [];
        dataserviceServiceCatType.getAllType(function (rs) {rs=rs.data;
            $scope.Types = rs;
        })

        dataserviceServiceCatType.getData(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
                //angular.forEach(listParent, function (value) {
                //    if (rs.ParentId == value.Id) {
                //        $scope.model.ParentId = value;
                //    }
                //})
            }
        });

    }
    $scope.initData();

    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceServiceCatType.update($scope.model, function (rs) {rs=rs.data;
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});