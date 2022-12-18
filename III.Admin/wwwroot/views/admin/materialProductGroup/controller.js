var ctxfolderMaterialProductGroup = "/views/admin/MaterialProductGroup";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_MATERIAL_PROD_GROUP', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataserviceMaterialGroup', function ($http) {
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
            $http.post('/Admin/MaterialProductGroup/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/MaterialProductGroup/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Category/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/MaterialProductGroup/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/MaterialProductGroup/GetItem/' + data).then(callback);
        },
        gettreedataCoursetype: function (callback) {
            $http.post('/Admin/MaterialProductGroup/gettreedataCoursetype/').then(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/Admin/MaterialProductGroup/gettreedataLevel/').then(callback);
        },
        gettreedataedit: function (callback) {
            $http.post('/Admin/MaterialProductGroup/gettreedataLevel/').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/EDMSCategory/UploadImage/', data, callback);
        }
    }
});

app.controller('Ctrl_ESEIM_MATERIAL_PROD_GROUP', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, $cookies, $translate, dataserviceMaterialGroup) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.PERMISSION_MATERIAL_PRODUCT_GROUP = PERMISSION_MATERIAL_PRODUCT_GROUP;
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
                ProductCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
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
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.MPG_CURD_LBL_MPG_CODE),
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
    $translateProvider.useUrlLoader('/Admin/MaterialProductGroup/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderMaterialProductGroup + '/index.html',
            controller: 'index_material_group'
        })
        .when('/add', {
            templateUrl: ctxfolderMaterialProductGroup + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderMaterialProductGroup + '/edit.html',
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


app.controller('index_material_group', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterialGroup, $translate, $window) {
    var vm = $scope;
    vm.dt = {};
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
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsMaterialProdGroup = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialProductGroup/Jtable",
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
            if ($rootScope.PERMISSION_MATERIAL_PRODUCT_GROUP.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var Id = data.Id;
                        $scope.edit(Id);
                    }
                });
            }
        });

    vm.dtColumnsMaterialProdGroup = [];
    vm.dtColumnsMaterialProdGroup.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass'));
    vm.dtColumnsMaterialProdGroup.push(DTColumnBuilder.newColumn('Code').withTitle('{{"MPG_LIST_COL_MPG_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsMaterialProdGroup.push(DTColumnBuilder.newColumn('Name').withTitle('{{"MPG_LIST_COL_MPG_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsMaterialProdGroup.push(DTColumnBuilder.newColumn('Description').withTitle('{{"MPG_LIST_COL_MPG_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsMaterialProdGroup.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MPG_LIST_COL_MPG_ACTION" | translate}}').renderWith(function (data, type, full) {
        var listButton = '';
        if ($rootScope.PERMISSION_MATERIAL_PRODUCT_GROUP.Update) {
            listButton += '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
        }
        if ($rootScope.PERMISSION_MATERIAL_PRODUCT_GROUP.Delete) {
            listButton += '<button ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }
        return listButton;
    }));
    vm.reloadDataMaterialProdGroup = reloadDataMaterialProdGroup;
    vm.dt.dtInstanceMaterialProdGroup = {};
    function reloadDataMaterialProdGroup(resetPaging) {
        vm.dt.dtInstanceMaterialProdGroup.reloadData(callback, resetPaging);
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
        reloadDataMaterialProdGroup(true);
    };
    $scope.reloadNoResetPageMaterialGroup = function () {
        reloadDataMaterialProdGroup(false);
    };
    $scope.initData = function () {
        dataserviceMaterialGroup.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result.Object;
            var all = {
                Id: '',
                Name: caption.MPG_TXT_ALL
            }
            $scope.treedataLevel.unshift(all)
        });
    }
    $scope.initData();
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaterialProductGroup + '/add.html',
            controller: 'add_material_group',
            backdrop: 'static',
            size: '40',

        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (Id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaterialProductGroup + '/edit.html',
            controller: 'edit_material_group',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return Id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPageMaterialGroup();
        }, function () {
        });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "panel-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaterialGroup.delete(id, function (rs) {
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
            var list = $('#tblData').DataTable().data();
            if (list.length > 1)
                $scope.reloadNoResetPageMaterialGroup();
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
app.controller('add_material_group', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceMaterialGroup, $filter) {
    $scope.model = {
        ParentID: '',
        Code: '',
        Name: '',
        Description: ''
    }
    $scope.initData = function () {
        dataserviceMaterialGroup.gettreedataCoursetype(function (result) {
            result = result.data;
            $scope.treedataCoursetype = result.Object;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceMaterialGroup.insert($scope.model, function (rs) {
                rs = rs.data;
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
app.controller('edit_material_group', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceMaterialGroup, para) {
    $scope.model = {
        FileName: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataserviceMaterialGroup.gettreedataedit(function (result) {
            result = result.data;
            $scope.treedataedit = result.Object;
        });
        dataserviceMaterialGroup.getItem(para, function (rs) {
            rs = rs.data;
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
            dataserviceMaterialGroup.update($scope.model, function (rs) {
                rs = rs.data;
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

