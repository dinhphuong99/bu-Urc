var ctxfolderMaterialProductType = "/views/admin/materialsType";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_MATERIAL_PROD_TYPE', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataserviceMaterialProductType', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getAllType: function (callback) {
            $http.post('/Admin/MaterialsType/GetAllData').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/MaterialsType/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/MaterialsType/Update/', data).then(callback);
        },
        getData: function (data, callback) {
            $http.post('/Admin/MaterialsType/GetData/' + data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/MaterialsType/Delete/' + data).then(callback);
        }
    }
});
app.controller('Ctrl_ESEIM_MATERIAL_PROD_TYPE', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterialProductType, $cookies, $translate) {
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
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            var mess = { Status: false }
            if (!partternCode.test(data)) {
                mess.Status = true;
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Code: {
                    required: true,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 255
                }
            },
            messages: {
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MT_CURD_LBL_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MT_CURD_LBL_CODE).replace("{1}", "100")
                },
                Name: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MT_CURD_LBL_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MT_CURD_LBL_NAME).replace("{1}", "255")
                }
            }
        }
    });
    
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/MaterialsType/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderMaterialProductType + '/index.html',
            controller: 'index_material_type'
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
app.controller('index_material_type', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterialProductType, $translate) {
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

    dataserviceMaterialProductType.getAllType(function (rs) {rs=rs.data;
        $scope.Types = rs;
        var all = {
            Id: '', 
            Name:'Tất cả'
        }
        $scope.Types.unshift(all)
    })


    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsMaterialProductType = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialsType/Jtable",
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumnsMaterialProductType = [];
    vm.dtColumnsMaterialProductType.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumnsMaterialProductType.push(DTColumnBuilder.newColumn('code').withTitle('{{"MT_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsMaterialProductType.push(DTColumnBuilder.newColumn('name').withTitle('{{"MT_LIST_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsMaterialProductType.push(DTColumnBuilder.newColumn('description').withTitle('{{"MT_LIST_COL_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsMaterialProductType.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withOption('sWidth', '40px').withTitle('{{"MT_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="{{&quot;MT_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;MT_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';

    }));
    vm.reloadDataMaterialProductType = reloadDataMaterialProductType;
    vm.dt.dtInstanceMaterialProductType = {};
    function reloadDataMaterialProductType(resetPaging) {
        vm.dt.dtInstanceMaterialProductType.reloadData(callback, resetPaging);
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
        reloadDataMaterialProductType(true);
    }
    $scope.reloadNoResetPageMaterialProductType = function () {
        reloadDataMaterialProductType(false);
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaterialProductType + '/add.html',
            controller: 'add_material_type',
            backdrop: 'static',
            size: '40'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaterialProductType + '/edit.html',
            controller: 'edit_material_type',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPageMaterialProductType();
        }, function () {
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "panel-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataserviceMaterialProductType.delete(id, function (rs) {rs=rs.data;
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
                $scope.reloadNoResetPageMaterialProductType();
            else
                $scope.reload();
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

app.controller('add_material_type', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceMaterialProductType) {
    $scope.model = {
        ParentId: ''
    }

    $scope.initData = function () {
        dataserviceMaterialProductType.getAllType(function (rs) {rs=rs.data;
            $scope.Types = rs;
        })
    }
    $scope.initData();

    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var msg = $rootScope.checkData($scope.model.Code);
            if (msg.Status) {
                App.toastrError(caption.COM_VALIDATE_ITEM.replace('{0}', caption.MT_CURD_LBL_CODE));
                return;
            }
            dataserviceMaterialProductType.insert($scope.model, function (rs) {rs=rs.data;
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
app.controller('edit_material_type', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceMaterialProductType, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.listParent = [];
    $scope.initData = function () {
        var listParent = [];
        dataserviceMaterialProductType.getAllType(function (rs) {rs=rs.data;
            $scope.Types = rs;
        })

        dataserviceMaterialProductType.getData(para, function (rs) {rs=rs.data;
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
            dataserviceMaterialProductType.update($scope.model, function (rs) {rs=rs.data;
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