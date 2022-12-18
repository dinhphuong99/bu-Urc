var ctxfolderUrencoCostCategory = "/views/admin/urencoCostCategory";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_URENCO_COST_CATEGORY', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce']);
app.factory('dataserviceUrencoCostCategory', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload2 = function (url, data, callback) {

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
        //commomsetting
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/UrencoCostCategory/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/UrencoCostCategory/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/UrencoCostCategory/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/UrencoCostCategory/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/UrencoCostCategory/GetItem/' + data).then(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/UrencoCostCategory/GetItemDetail/' + data).then(callback);
        },
        getUrencoCostCategoryParent: function (callback) {
            $http.post('/Admin/UrencoCostCategory/GetUrencoCostCategoryParent').then(callback);
        },
        getServiceUnit: function (callback) {
            $http.post('/Admin/UrencoCostCategory/GetServiceUnit').then(callback);
        },
        gettreedataCoursetype: function (callback) {
            $http.post('/Admin/UrencoCostCategory/gettreedataCoursetype/').then(callback);
        },
        getUrencoCostCategoryGroup: function (callback) {
            $http.post('/Admin/UrencoCostCategory/GetUrencoCostCategoryGroup').then(callback);
        },
        getUrencoCostCategoryType: function (callback) {
            $http.post('/Admin/UrencoCostCategory/GetUrencoCostCategoryType').then(callback);
        },

        insertAttributeMore: function (data, callback) {
            $http.post('/Admin/UrencoCostCategory/InsertAttributeMore', data).then(callback);
        },
        updateAttributeMore: function (data, callback) {
            $http.post('/Admin/UrencoCostCategory/UpdateAttributeMore', data).then(callback);
        },
        deleteAttributeMore: function (data, callback) {
            $http.post('/Admin/UrencoCostCategory/DeleteAttributeMore/' + data).then(callback);
        },
        getDetailAttributeMore: function (data, callback) {
            $http.post('/Admin/UrencoCostCategory/GetDetailAttributeMore?Id=' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM_URENCO_COST_CATEGORY', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataserviceUrencoCostCategory, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                ServiceCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 255
                },
                ServiceName: {
                    required: true,
                    maxlength: 255
                },
            },
            messages: {
                ServiceCode: {
                    required: caption.UCC_MSG_NOT_CODE,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.UCC_CURD_LBL_SERVICE_CODE),
                    maxlength: caption.UCC_MSG_NOT_CODE_CHARACTER_255
                },
                ServiceName: {
                    required: caption.UCC_MSG_NOT_NAME,
                    maxlength: caption.UCC_MSG_NOT_NAME_CHARACTER
                },
            }
        }
        $rootScope.validationAttributeOptions = {
            rules: {
                AttributeCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/
                },
                AttributeName: {
                    required: true,
                },
                Note: {
                    maxlength: 300
                },
                FieldType: {
                    required: true,
                },
                AttributeValue: {
                    required: true,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption.UCC_MSG_CODE_NOT_BLANK,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.UCC_CURD_TAB_ATTRIBUTE_LBL_CODE),
                },
                AttributeName: {
                    required: caption.UCC_MSG_NAME_NOT_BLANK,
                },
                Note: {
                    maxlength: caption.UCC_MSG_NOT_ACTION_CHARACTER
                },
                FieldType: {
                    required: caption.UCC_MSG_VALUE_TYPE_NOT_BLANK,
                },
                AttributeValue: {
                    required: caption.UCC_MSG_TYPE_NOT_BLANK
                }
            }
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/UrencoCostCategory/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderUrencoCostCategory + '/index.html',
            controller: 'index_urenco_cost_category'
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
app.controller('index_urenco_cost_category', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceUrencoCostCategory, $translate, $window) {
    var vm = $scope;
    vm.dt = {};
    $scope.model = {
        servicecode: '',
        servicename: '',
        unit: '',
        servicegroup: ''
    }
    $scope.UrencoCostCategoryGroup = [];
    $scope.UrencoCostCategoryParent = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsUrencoCostCategory = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UrencoCostCategory/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.servicecode = $scope.model.servicecode;
                d.servicename = $scope.model.servicename;
                d.unit = $scope.model.unit;
                d.servicegroup = $scope.model.servicegroup;
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.ServiceCatID] = !$scope.selected[data.ServiceCatID];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.ServiceCatID] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.ServiceCatID] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ServiceCatID;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumnsUrencoCostCategory = [];

    vm.dtColumnsUrencoCostCategory.push(DTColumnBuilder.newColumn("ServiceCatID").withTitle(titleHtml)
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ServiceCatID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ServiceCatID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    vm.dtColumnsUrencoCostCategory.push(DTColumnBuilder.newColumn('ServiceCode').withTitle('{{"UCC_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsUrencoCostCategory.push(DTColumnBuilder.newColumn('ServiceName').withTitle('{{"UCC_LIST_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsUrencoCostCategory.push(DTColumnBuilder.newColumn('ServiceGroup').withTitle('{{"UCC_LIST_COL_GROUP" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsUrencoCostCategory.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"UCC_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumnsUrencoCostCategory.push(DTColumnBuilder.newColumn('Note').withTitle('{{"UCC_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsUrencoCostCategory.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"UCC_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.ServiceCatID + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.ServiceCatID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadDataUrencoCostCategory = reloadDataUrencoCostCategory;
    vm.dt.dtInstanceUrencoCostCategory = {};
    function reloadDataUrencoCostCategory(resetPaging) {
        vm.dt.dtInstanceUrencoCostCategory.reloadData(callback, resetPaging);
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
    $scope.search = function () {
        reloadDataUrencoCostCategory(true);
    }
    $rootScope.reloadUrencoCostCategory = function () {
        reloadDataUrencoCostCategory(true);
    }
    $scope.reload = function () {
        reloadDataUrencoCostCategory(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadDataUrencoCostCategory(false);
    };
    $scope.initData = function () {
        $rootScope.ServiceCode == '';
        dataserviceUrencoCostCategory.getUrencoCostCategoryParent(function (rs) {rs=rs.data;
            $scope.UrencoCostCategoryParent = rs;
        });
        dataserviceUrencoCostCategory.getServiceUnit(function (rs) {rs=rs.data;
            $rootScope.ServiceUnitData = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.ServiceUnitData.unshift(all)
        });
        dataserviceUrencoCostCategory.getUrencoCostCategoryGroup(function (rs) {rs=rs.data;
            $scope.UrencoCostCategoryGroup = rs;
            var all = {
                Code: '',
                Name:'Tất cả'
            }
            $scope.UrencoCostCategoryGroup.unshift(all)
        });
    }
    $scope.initData();

    //$scope.detail = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderUrencoCostCategory + '/detail.html',
    //        controller: 'detail',
    //        backdrop: 'static',
    //        size: '30',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 60;
    } else if ($window.innerWidth > 1400) {
        size = 50;
    } 
    $scope.add = function () {
        $rootScope.ServiceCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderUrencoCostCategory + '/add.html',
            controller: 'add_urenco_cost_category',
            backdrop: 'static',
            size: '50',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderUrencoCostCategory + '/edit.html',
            controller: 'edit_urenco_cost_category',
            backdrop: 'static',
            size: '50',
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
                    dataserviceUrencoCostCategory.delete(id, function (rs) {rs=rs.data;
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
    setTimeout(function () {

    }, 50);
});
app.controller('add_urenco_cost_category', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceUrencoCostCategory) {
    $scope.model = {
        ServiceGroup: '',
        ServiceType: '',
        Unit: ''
    }

    $scope.UrencoCostCategoryParent = [];
    $scope.UrencoCostCategoryGroup = [];
    $scope.UrencoCostCategoryType = [];

    $scope.initLoad = function () {
        $rootScope.ServiceCode = '';
        dataserviceUrencoCostCategory.getUrencoCostCategoryParent(function (rs) {rs=rs.data;
            $scope.UrencoCostCategoryParent = rs;
        });
        dataserviceUrencoCostCategory.getServiceUnit(function (rs) {rs=rs.data;
            $rootScope.ServiceUnitData = rs;
            $scope.model.Unit = rs.length != 0 ? rs[0].Code : '';
        });
        dataserviceUrencoCostCategory.getUrencoCostCategoryGroup(function (rs) {rs=rs.data;
            $scope.UrencoCostCategoryGroup = rs;
        });
        dataserviceUrencoCostCategory.getUrencoCostCategoryType(function (rs) {rs=rs.data;
            $scope.UrencoCostCategoryType = rs;
        });
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            debugger
            if ($rootScope.ServiceCode == '') {
                dataserviceUrencoCostCategory.insert($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.ServiceCode = $scope.model.ServiceCode;
                        $rootScope.reloadUrencoCostCategory();
                    }
                });
            } else {
                dataserviceUrencoCostCategory.update($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadUrencoCostCategory();
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
    $scope.addCommonSettingUnit = function () {
        debugger
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SERVICE_UNIT',
                        GroupNote: 'Đơn vị dịch vụ',
                        AssetCode: 'SERVICE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceUrencoCostCategory.getServiceUnit(function (rs) {rs=rs.data;
                $rootScope.ServiceUnitData = rs;
            });
        }, function () { });
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
        //if (data.Unit == "") {
        //    $scope.errorUnit = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorUnit = false;
        //}
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit_urenco_cost_category', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceUrencoCostCategory, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.addCommonSettingUnit = function () {
        debugger
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SERVICE_UNIT',
                        GroupNote: 'Đơn vị dịch vụ',
                        AssetCode: 'SERVICE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceUrencoCostCategory.getServiceUnit(function (rs) {rs=rs.data;
                $rootScope.ServiceUnitData = rs;
            });
        }, function () { });
    }

    $scope.UrencoCostCategoryParent = [];
    $scope.UrencoCostCategoryGroup = [];
    $scope.UrencoCostCategoryType = [];

    $scope.initData = function () {
        dataserviceUrencoCostCategory.getUrencoCostCategoryParent(function (rs) {rs=rs.data;
            $scope.UrencoCostCategoryParent = rs;
        });
        dataserviceUrencoCostCategory.getServiceUnit(function (rs) {rs=rs.data;
            $rootScope.ServiceUnitData = rs;
        });
        dataserviceUrencoCostCategory.getItem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
                if ($scope.model.PathImg == '/images/default/no_image.png') {
                    $scope.model.PathImg = '/images/default/uploadimg.png';
                }

                $rootScope.ServiceCode = $scope.model.ServiceCode;
            }
        });
        dataserviceUrencoCostCategory.getUrencoCostCategoryGroup(function (rs) {rs=rs.data;
            $scope.UrencoCostCategoryGroup = rs;
        });
        dataserviceUrencoCostCategory.getUrencoCostCategoryType(function (rs) {rs=rs.data;
            $scope.UrencoCostCategoryType = rs;
        });
    }
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataserviceUrencoCostCategory.update($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadUrencoCostCategory();
                }
            });
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
        //if (data.Unit == "") {
        //    $scope.errorUnit = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorUnit = false;
        //}
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('tabAttribute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceUrencoCostCategory, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {};
    $rootScope.isEditAttribute = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UrencoCostCategory/JTableAttributeMore",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ServiceCode = $rootScope.ServiceCode;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeCode').withTitle('{{"UCC_CURD_TAB_ATTRIBUTE_COL_ATTRIBUTE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeName').withTitle('{{"UCC_CURD_TAB_ATTRIBUTE_COL_ATTRIBUTE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeValue').withTitle('{{"UCC_CURD_TAB_ATTRIBUTE_COL_ATTRIBUTE_VALUE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FieldType').withTitle('{{"UCC_CURD_TAB_ATTRIBUTE_COL_FIELD_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"UCC_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"UCC_CURD_TAB_ATTRIBUTE_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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
    function callback(json) {

    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadUrencoCostCategoryAttribute = function () {
        $scope.reload();
    }
    $scope.add = function () {
        if ($scope.addform.validate()) {
            $scope.model.ServiceCode = $rootScope.ServiceCode;
            dataserviceUrencoCostCategory.insertAttributeMore($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadUrencoCostCategoryAttribute();
                }
            })
        }
    }
    $scope.edit = function (id) {
        dataserviceUrencoCostCategory.getDetailAttributeMore(id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object;
                $rootScope.isEditAttribute = true;
            }
        })
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            $scope.model.ServiceCode = $rootScope.ServiceCode;
            dataserviceUrencoCostCategory.updateAttributeMore($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.isEditAttribute = false;
                    $rootScope.reloadUrencoCostCategoryAttribute();
                    $uibModalInstance.close(rs.Object);
                }
            })
        }
    }
    $scope.cancel = function () {
        $rootScope.isEditAttribute = false;
        $scope.model = '';
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceUrencoCostCategory.deleteAttributeMore(id, function (result) {result=result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $rootScope.reloadUrencoCostCategoryAttribute();
                            $rootScope.isEditAttribute = false;
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
            $scope.reload();
        }, function () {
        });
    }
});
app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceUrencoCostCategory, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',
        AssetCode: para.AssetCode,
        Group: para.Group,
        GroupNote: para.GroupNote
    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CommonSetting/JTableDetail/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SettingGroup = para.Group;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.CodeSet = data.CodeSet;
                    $scope.model.ValueSet = data.ValueSet;
                    $scope.model.Type = data.Type;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"UCC_LIST_COL_INDEX" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"UCC_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"UCC_LIST_COL_DATA_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"UCC_LIST_COL_DATE_CREATED" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"UCC_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataserviceUrencoCostCategory.getDataType(function (rs) {rs=rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.UCC_CURD_MSG_SETTING_NOT_BLANK);
        } else {
            dataserviceUrencoCostCategory.insertCommonSetting($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.CodeSet == '') {
            App.toastrError(caption.UCC_CURD_MSG_DATA_NOT_BLANK)
        } else {
            dataserviceUrencoCostCategory.updateCommonSetting($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataserviceUrencoCostCategory.deleteCommonSetting(id, function (rs) {rs=rs.data;
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
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
