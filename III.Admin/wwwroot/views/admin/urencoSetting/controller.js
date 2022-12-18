var ctxfolderUrencoSetting = "/views/admin/urencoSetting";
var ctxfolderUrencoSettingMessage = "/views/message-box";

var app = angular.module('App_ESEIM_URENCO_SETTING', ["App_ESEIM_MATERIAL_PROD", "App_ESEIM_MATERIAL_PROD_GROUP", "App_ESEIM_MATERIAL_PROD_TYPE", "App_ESEIM_SVC", "App_ESEIM_SERVICE_CAT_GROUP", "App_ESEIM_SERVICE_CAT_TYPE", "App_ESEIM_URENCO_COST_CATEGORY", "App_ESEIM_URENCO_COST_GROUP", "App_ESEIM_URENCO_COST_TYPE", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
//var app = angular.module('App_ESEIM_URENCO_SETTING', ["App_ESEIM_MATERIAL_PROD", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
    .directive('customOnChange', function () {
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
app.factory('dataserviceUrencoSetting', function ($http) {
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
            submitFormUpload('/Admin/UrencoSetting/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/UrencoSetting/Update', data, callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/UrencoSetting/DeleteItems/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/UrencoSetting/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/UrencoSetting/Getitem?id='+data).then(callback);
        },
    }
   
});
app.controller('Ctrl_ESEIM_URENCO_SETTING', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataserviceUrencoSetting) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
 
    var culture = $cookies.get('_CULTURE') || 'en-US';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];

        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
            var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.Code)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.SET_IC_MAN_CURD_LBL_ICON_CODE), "<br/>");
            }
            if (!partternName.test(data.Title)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.SET_IC_MAN_CURD_LBL_ICON_NAME) + "<br/>";
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255
                },
                Code: {
                    required: true,
                    maxlength: 50
                },
            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.SET_IC_MAN_CURD_LBL_ICON_TITLE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.SET_IC_MAN_CURD_LBL_ICON_TITLE).replace('{1}', '255')
                },
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.SET_IC_MAN_CURD_LBL_ICON_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.SET_IC_MAN_CURD_LBL_ICON_CODE).replace('{1}', '50')
                },
            }
        }
    });
    $rootScope.StatusData = [{
        Value: true,
        Name: "Hoạt động"
    }, {
        Value: false,
        Name: "Không hoạt động"
    }];

});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/UrencoSetting/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderUrencoSetting + '/index.html',
            controller: 'index_urenco_setting'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolderUrencoSetting + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolderUrencoSetting + '/add.html',
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

app.controller('index_urenco_setting', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceUrencoSetting, $translate) {
    var vm = $scope;
    $scope.model = {
        Code: '',
        Name: '',
        Status: true
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liRole = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UrencoSetting/Jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                $scope.liRole = [];
            },
            type: 'POST',
            data: function (d) {
                d.IconCode = $scope.model.IconCode;
                d.IconTitle = $scope.model.IconTitle;
                d.ObjectCode = $scope.model.ObjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('serverSide', true)
        //.withOption('autoWidth', true)
        //.withOption('scrollY', $(window).height() - 220)
        //.withOption('scrollX', false)
        //.withOption('scrollCollapse', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            $scope.liRole.push(data);

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

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;

            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected, $event)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('IconCode').withTitle('{{"SET_IC_MAN_LIST_COL_ICON_CODE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('IconTitle').withTitle('{{"SET_IC_MAN_LIST_COL_ICON_TITLE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjectCode').withTitle('{{"SET_IC_MAN_LIST_COL_OBJ_CODE" | translate}}').renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EXPFilterSQL').withTitle('{{"SET_IC_MAN_LIST_COL_EXPFilterSQL" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('IconPath').withTitle('{{"SET_IC_MAN_LIST_COL_ICON_PATH" | translate}}').renderWith(function (data, type) {
                return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
            }).withOption('sWidth', '50px'));   
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"SET_IC_MAN_LIST_COL_IC_MAN_ACTION" | translate}}').notSortable().renderWith(function (data, type, full, meta) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sWidth', '50px').withOption('sClass', 'nowrap'));
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
    function toggleOne(selectedItems, evt) {
        //$(evt.target).closest('tr').toggleClass('selected');

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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.search = function () {
        //if ($scope.model.Name === '' || $scope.model.Name == null) {
        //    App.toastrWarning('Nhập điều kiện tìm kiếm');
        //} else {
        //    reloadData(true);
        //}
        reloadData(true);
    }

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderUrencoSetting + '/add.html',
            controller: 'add',
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
            templateUrl: ctxfolderUrencoSetting + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '40',
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
            templateUrl: ctxfolderUrencoSettingMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceUrencoSetting.delete(id, function (result) {result=result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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
    };
    //function showHideSearch() {
    //    $(".btnSearch").click(function () {
    //        $(".input-search").removeClass('hidden');
    //        $(".btnSearch").hide();
    //    });
    //    $(".close-input-search").click(function () {
    //        $(".input-search").addClass('hidden');
    //        $(".btnSearch").show();
    //    });
    //}
    //setTimeout(function () {
    //    showHideSearch();
    //}, 50);
});

