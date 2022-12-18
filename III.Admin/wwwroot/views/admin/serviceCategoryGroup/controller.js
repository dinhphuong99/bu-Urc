var ctxfolderServiceCategoryGroup = "/views/admin/serviceCategoryGroup";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_SERVICE_CAT_GROUP', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataserviceServiceCatGroup', function ($http) {
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
            $http.post('/Admin/ServiceCategoryGroup/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/ServiceCategoryGroup/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Category/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/ServiceCategoryGroup/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/ServiceCategoryGroup/GetItem/' + data).then(callback);
        },
        //gettreedataCoursetype: function (callback) {
        //    $http.post('/Admin/ServiceCategoryGroup/gettreedataCoursetype/').then(callback);
        //},
        //gettreedataLevel: function (callback) {
        //    $http.post('/Admin/ServiceCategoryGroup/gettreedataLevel/').then(callback);
        //},
        //gettreedataedit: function (callback) {
        //    $http.post('/Admin/ServiceCategoryGroup/gettreedataLevel/').then(callback);
        //},
        //uploadImage: function (data, callback) {
        //    submitFormUpload('/EDMSCategory/UploadImage/', data, callback);
        //}
    }
});

app.controller('Ctrl_ESEIM_SERVICE_CAT_GROUP', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, $cookies, $translate, dataserviceServiceCatGroup) {
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
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SCG_CURD_TXT_CODE),
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SCG_CURD_LBL_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SCG_COL_CODE).replace("{1}", "50")
                },
                ProductName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SCG_CURD_TXT_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SCG_CURD_TXT_NAME).replace("{1}", "50")
                },

            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/ServiceCategoryGroup/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();


    $routeProvider
        .when('/', {
            templateUrl: ctxfolderServiceCategoryGroup + '/index.html',
            controller: 'index_service_cat_group'
        })
        .when('/add', {
            templateUrl: ctxfolderServiceCategoryGroup + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderServiceCategoryGroup + '/edit.html',
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


app.controller('index_service_cat_group', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceServiceCatGroup, $translate, $window) {
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
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsServiceCatGroup = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ServiceCategoryGroup/Jtable",
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumnsServiceCatGroup = [];
    vm.dtColumnsServiceCatGroup.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumnsServiceCatGroup.push(DTColumnBuilder.newColumn('Code').withTitle('{{"SCG_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsServiceCatGroup.push(DTColumnBuilder.newColumn('Name').withTitle('{{"SCG_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsServiceCatGroup.push(DTColumnBuilder.newColumn('Description').withTitle('{{"SCG_COL_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsServiceCatGroup.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"SCG_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Chỉnh sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45)" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadDataServiceCatGroup = reloadDataServiceCatGroup;
    vm.dt.dtInstanceServiceCatGroup = {};
    function reloadDataServiceCatGroup(resetPaging) {
        vm.dt.dtInstanceServiceCatGroup.reloadData(callback, resetPaging);
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
        reloadDataServiceCatGroup(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadDataServiceCatGroup(false);
    };
    $scope.initData = function () {
        //dataserviceServiceCatGroup.gettreedataLevel(function (result) {result=result.data;
        //    $scope.treedataLevel = result.Object;
        //});
    }
    $scope.initData();
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 35;
    } else if ($window.innerWidth > 1400) {
        size = 25;
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderServiceCategoryGroup + '/add.html',
            controller: 'add_service_cat_group',
            backdrop: 'static',
            //windowClass: "modal-center",
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (Id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderServiceCategoryGroup + '/edit.html',
            controller: 'edit_service_cat_group',
            backdrop: 'static',
            //windowClass: "modal-center",
            size: '30',
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
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceServiceCatGroup.delete(id, function (rs) {rs=rs.data;
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
app.controller('add_service_cat_group', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceServiceCatGroup, $filter) {
    $scope.model = {
        ParentID: '',
        Code: '',
        Name: '',
        Description: ''
    }
    $scope.initData = function () {
        //dataserviceServiceCatGroup.gettreedataCoursetype(function (result) {result=result.data;
        //    $scope.treedataCoursetype = result.Object;
        //});
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceServiceCatGroup.insert($scope.model, function (rs) {rs=rs.data;
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
app.controller('edit_service_cat_group', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceServiceCatGroup, para) {
    $scope.model = {
        FileName: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        //dataserviceServiceCatGroup.gettreedataedit(function (result) {result=result.data;
        //    $scope.treedataedit = result.Object;
        //});
        dataserviceServiceCatGroup.getItem(para, function (rs) {rs=rs.data;
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
            dataserviceServiceCatGroup.update($scope.model, function (rs) {rs=rs.data;
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

