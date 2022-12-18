var ctxfolder = "/views/admin/activity";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']).
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
            $http.post('/Admin/Activity/Insert', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/Activity/GetItem?id=' + data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Activity/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/Activity/Delete?id=' + data).then(callback);
        },
        getActivity: function (callback) {
            $http.post('/Admin/Activity/GetActivity').then(callback);
        },
        getPriority: function (callback) {
            $http.post('/Admin/Activity/GetPriority').then(callback);
        },
        getObjActivity: function (data, callback) {
            $http.post('/Admin/Activity/GetObjActivity?code=' + data).then(callback);
        },
        insertActivity: function (data, callback) {
            $http.post('/Admin/Activity/InsertObjActivity', data).then(callback);
        },
        updateActivity: function (data, callback) {
            $http.post('/Admin/Activity/UpdatedObjActivity', data).then(callback);
        },
        deleteActivity: function (data, callback) {
            $http.post('/Admin/Activity/DeleteActivity?id=' + data).then(callback);
        },
        getRolesWorkFlow: function (callback) {
            $http.post('/Admin/WorkflowActivityRole/GetRoles').then(callback);
        },
        getDepartmentWorkFlow: function (callback) {
            $http.post('/Admin/WorkflowActivityRole/GetDepartment').then(callback);
        },
        getBranchWorkFlow: function (callback) {
            $http.post('/Admin/WorkflowActivityRole/GetBranch').then(callback);
        },
        //getBranchWorkFlow: function (callback) {
        //    $http.post('/Admin/WorkflowActivityRole/GetBranch').then(callback);
        //},
        insertWorkFlow: function (data, callback) {
            $http.post('/Admin/Activity/InsertWorkflowActRole', data).then(callback);
        },
        getWorkFlow: function (data, callback) {
            $http.post('/Admin/Activity/GetWorkFlow?code=' + data).then(callback);
        },
        deleteWorkflowActRole: function (data, callback) {
            $http.post('/Admin/Activity/DeleteWorkflowActRole?id=' + data).then(callback);
        },
        getProperties: function (data, callback) {
            $http.post('/Admin/Activity/GetProperties?ActCode=' + data).then(callback);
        },
        getItemActivity: function (data, callback) {
            $http.post('/Admin/Activity/GetItemActivity?id=' + data).then(callback);
        },
        getUnit: function (callback) {
            $http.post('/Admin/Activity/GetUnit').then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
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
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                WorkFlowCode: {
                    required: true,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                WorkFlowCode: {
                    required: caption.ACT_VALIDATE_ACTIVITY_CODE_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_CODE_SIZE
                },
                Name: {
                    required: caption.ACT_VALIDATE_ACTIVITY_NAME_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_NAME_SIZE
                },
            }
        }

        $rootScope.validationOptionsAct = {
            rules: {
                LimitTime: {
                    required: true,
                    maxlength: 100
                },
                UnitTime: {
                    required: true,
                    maxlength: 100
                },
                Priority: {
                    required: true,
                },
            },
            messages: {
                LimitTime: {
                    required: caption.ACT_VALIDATE_TIME_LIMIT,
                    maxlength: caption.ACT_VALIDATE_TIME_LIMIT_SIZE
                },
                UnitTime: {
                    required: caption.ACT_VALIDATE_UNIT,
                    maxlength: caption.ACT_VALIDATE_TIME_LIMIT_SIZE
                },
                Priority: {
                    required: caption.ACT_VALIDATE_PRIORITY_NOT_NULL,
                },
            }
        }
        $rootScope.IsAdd = false;
    });
    $rootScope.WorkFlowCode = '';
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Activity/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        WorkFlowCode: '',
        Name: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Activity/JTableActivity",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.WorkFlowCode = $scope.model.WorkFlowCode;
                d.Name = $scope.model.Name;

            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
        .withOption('order', [1, 'asc'])
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ID;
                    $scope.edit(Id);
                }
            });
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    //vm.dtcolumns.push(dtcolumnbuilder.newcolumn("check").withtitle(titlehtml).notsortable().renderwith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleone(selected)"/><span></span></label>';
    //}).withoption('sclass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WorkFlowCode').withTitle('{{"ACT_LBL_CATEGORY_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"ACT_LBL_CATEGORY_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ACT_LBL_CATEGORY_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ACT_COL_CATEGORY_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.ID + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $rootScope.reloadActivity = function () {
        reloadData(false);
    }
    $scope.initLoad = function () {

    }
    $scope.initLoad();
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadActivity();
        }, function () { });
    }
    $scope.addcatactivity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addCatActivity.html',
            controller: 'addCatActivity',
            backdrop: true,
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    }
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            debugger
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: 'static',
                size: '50',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $rootScope.reloadActivity();
            }, function () {
            });
        });
    }
    $scope.delete = function (id) {
        var list = [];
        list.push(id);
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return list;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(para, function (rs) {
                        if (rs.data.Error) {
                            App.toastrError(rs.data.Title);
                        } else {
                            App.toastrSuccess(rs.data.Title);
                            $uibModalInstance.close();
                        }
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadActivity();
        }, function () {
        });
    }
    function loadDate() {
        $("#fromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $("#toDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

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
        loadDate();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {

    }
    $scope.modelFolw = {
        ActCode: '',
        Role: '',
        DepartCode: '',
        BranchCode: '',
    }
    $scope.modelObj = {
        ActCode: '',
        Priority: '',
        LimitTime: '',
        UnitTime: ''
    }
    $scope.listWorkFlow = [];
    $scope.initLoad = function () {
        dataservice.getActivity(function (rs) {
            $scope.listAct = rs.data;
        });
        dataservice.getPriority(function (rs) {
            $scope.listPrio = rs.data;
        });
        dataservice.getRolesWorkFlow(function (rs) {
            $scope.listRoles = rs.data;
        });
        dataservice.getDepartmentWorkFlow(function (rs) {
            $rootScope.listDepartment = rs.data;
        });
        dataservice.getBranchWorkFlow(function (rs) {
            $rootScope.listBranch = rs.data;
        });
        dataservice.getProperties(function (rs) {
            $scope.listWorkFlowProperty = rs.data;
        });
        dataservice.getUnit(function (rs) {
            $scope.listUnit = rs.data;
        });
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $rootScope.WorkFlowCode = '';
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.insert($scope.model, function (result) {
                if (result.data.Error) {
                    App.toastrError(result.data.Title);
                } else {
                    App.toastrSuccess(result.data.Title);
                    $rootScope.WorkFlowCode = $scope.model.WorkFlowCode;
                    $rootScope.reloadActivity();
                }
            });
        }
    }
    $scope.addWorkFlow = function () {
        validationSelectFlow($scope.modelFolw);
        if (!validationSelectFlow($scope.modelFolw).Status) {
            var temp = $rootScope.checkData($scope.modelFolw);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            $scope.modelFolw.WorkFlowCode = $rootScope.WorkFlowCode;
            dataservice.insertWorkFlow($scope.modelFolw, function (result) {
                var rs = result.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    dataservice.getWorkFlow($scope.modelFolw.WorkFlowCode, function (rs) {
                        rs = rs.data;
                        $scope.listWorkFlow = rs;
                    });
                }
            });
        }
    }
    $scope.addActiviy = function () {
        validationSelect($scope.modelObj);
        $scope.modelObj.WorkFlowCode = $rootScope.WorkFlowCode;
        if ($scope.activity.validate() && !validationSelect($scope.modelObj).Status) {
            dataservice.insertActivity($scope.modelObj, function (result) {
                if (result.data.Error) {
                    App.toastrError(result.data.Title);
                } else {
                    App.toastrSuccess(result.data.Title);
                    dataservice.getObjActivity($rootScope.WorkFlowCode, function (rs) {
                        $scope.listObjAct = rs.data;
                    });
                }
            });
        }
    }
    $scope.delete = function (id) {
        dataservice.deleteActivity(id, function (rs) {
            if (rs.data.Error) {
                App.toastrError(rs.data.Title);
            } else {
                App.toastrSuccess(rs.data.Title);
                dataservice.getObjActivity($rootScope.WorkFlowCode, function (rs) {
                    rs = rs.data;
                    $scope.modelAct.listObjAct = rs;
                });
            }
        });
    }
    $scope.deleteWorkFlow = function (id) {
        dataservice.deleteWorkflowActRole(id, function (rs) {
            if (rs.data.Error) {
                App.toastrError(rs.data.Title);
            } else {
                App.toastrSuccess(rs.data.Title);
                dataservice.getWorkFlow($rootScope.WorkFlowCode, function (rs) {
                    rs = rs.data;
                    $scope.listWorkFlow = rs;
                });
            }
        });
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "ActCode" && $scope.modelAct.ActCode != "") {
            $scope.errorActCode = false;
        }
        if (SelectType == "Priority" && $scope.modelAct.Priority != "") {
            $scope.errorPriority = false;
        }

        debugger
        if (SelectType == "ActCodeFlow" && $scope.modelFolw.ActCode != "") {
            $scope.errorActCodeFlow = false;
        }
        if (SelectType == "BranchCode" && $scope.modelFolw.BranchCode != "") {
            $scope.errorBranchCode = false;
        }
        if (SelectType == "DepartCode" && $scope.modelFolw.DepartCode != "") {
            $scope.errorDepartCode = false;
        }
        if (SelectType == "Role" && $scope.modelFolw.Role != "") {
            $scope.errorRole = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.ActCode == "") {
            $scope.errorActCode = true;
            mess.Status = true;
        } else {
            $scope.errorActCode = false;
        }
        return mess;
    };
    function validationSelectFlow(data) {
        var mess = { Status: false, Title: "" }
        //Check null 


        if (data.ActCode == "") {
            $scope.errorActCodeFlow = true;
            mess.Status = true;
        } else {
            $scope.errorActCodeFlow = false;
        }

        if (data.BranchCode == "") {
            $scope.errorBranchCode = true;
            mess.Status = true;
        } else {
            $scope.errorBranchCode = false;
        }

        if (data.DepartCode == "") {
            $scope.errorDepartCode = true;
            mess.Status = true;
        } else {
            $scope.errorDepartCode = false;
        }

        if (data.Role == "") {
            $scope.errorRole = true;
            mess.Status = true;
        } else {
            $scope.errorRole = false;
        }


        return mess;
    };
    setTimeout(function () {
        initDateTime();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, para) {
    $scope.model = {

    }
    $scope.modelFolw = {
        ActCode: '',
        Role: '',
        DepartCode: '',
        BranchCode: '',
    }
    $scope.modelObj = {
        ActCode: '',
        Priority: '',
        LimitTime: '',
        UnitTime: ''
    }
    $scope.cancel = function () {
        $rootScope.WorkFlowCode = '';
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        $scope.model = para;
        $rootScope.WorkFlowCode = $scope.model.WorkFlowCode;
        dataservice.getObjActivity($scope.model.WorkFlowCode, function (rs) {
            $scope.listObjAct = rs.data;
        });
        dataservice.getWorkFlow($scope.model.WorkFlowCode, function (rs) {
            $scope.listWorkFlow = rs.data;
        });
        dataservice.getActivity(function (rs) {
            rs = rs.data;
            $scope.listAct = rs;
        });
        dataservice.getPriority(function (rs) {
            $scope.listPrio = rs.data;
        });
        dataservice.getRolesWorkFlow(function (rs) {
            $scope.listRoles = rs.data;
        });
        dataservice.getDepartmentWorkFlow(function (rs) {
            $rootScope.listDepartment = rs.data;
        });
        dataservice.getBranchWorkFlow(function (rs) {
            $rootScope.listBranch = rs.data;
        });
        dataservice.getProperties(function (rs) {
            $scope.listWorkFlowProperty = rs.data;
        });
        dataservice.getUnit(function (rs) {
            $scope.listUnit = rs.data;
        });
    };
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            dataservice.update($scope.model, function (result) {
                //rs = rs.data;
                if (result.Error) {
                    App.toastrError(result.data.Title);
                } else {
                    App.toastrSuccess(result.data.Title);
                    $uibModalInstance.close();
                    $rootScope.reloadActivity();
                }
            });
        }
    }

    $scope.addWorkFlow = function () {
        validationSelectFlow($scope.modelFolw);

        if (!validationSelectFlow($scope.modelFolw).Status) {
            var temp = $rootScope.checkData($scope.modelFolw);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            $scope.modelFolw.WorkFlowCode = $rootScope.WorkFlowCode;
            dataservice.insertWorkFlow($scope.modelFolw, function (result) {
                var rs = result.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    dataservice.getWorkFlow($scope.modelFolw.WorkFlowCode, function (rs) {
                        rs = rs.data;
                        $scope.listWorkFlow = rs;
                    });
                }
            });
        }
    }
    $scope.addActiviy = function () {
        validationSelect($scope.modelObj);
        $scope.modelObj.WorkFlowCode = $rootScope.WorkFlowCode;

        if ($scope.activity.validate() && !validationSelect($scope.modelObj).Status) {
            dataservice.insertActivity($scope.modelObj, function (result) {
                //rs = rs.data;
                if (result.data.Error) {
                    App.toastrError(result.data.Title);
                } else {
                    App.toastrSuccess(result.data.Title);
                    dataservice.getObjActivity($scope.model.WorkFlowCode, function (rs) {
                        rs = rs.data;
                        $scope.listObjAct = rs;
                    });
                }
            });
        }
    }
    $scope.delete = function (id) {
        dataservice.deleteActivity(id, function (rs) {
            if (rs.data.Error) {
                App.toastrError(rs.data.Title);
            } else {
                App.toastrSuccess(rs.data.Title);
                dataservice.getObjActivity($rootScope.WorkFlowCode, function (rs) {
                    rs = rs.data;
                    $scope.listObjAct = rs;
                });
            }
        });
    }
    $scope.deleteWorkFlow = function (id) {
        dataservice.deleteWorkflowActRole(id, function (rs) {
            if (rs.data.Error) {
                App.toastrError(rs.data.Title);
            } else {
                App.toastrSuccess(rs.data.Title);
                dataservice.getWorkFlow($rootScope.WorkFlowCode, function (rs) {
                    rs = rs.data;
                    $scope.listWorkFlow = rs;
                });
            }
        });
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "ActCode" && $scope.modelAct.ActCode != "") {
            $scope.errorActCode = false;
        }
        if (SelectType == "Priority" && $scope.modelAct.Priority != "") {
            $scope.errorPriority = false;
        }

        if (SelectType == "ActCodeFlow" && $scope.modelFolw.ActCode != "") {
            $scope.errorActCodeFlow = false;
        }
        if (SelectType == "BranchCode" && $scope.modelFolw.BranchCode != "") {
            $scope.errorBranchCode = false;
        }
        if (SelectType == "DepartCode" && $scope.modelFolw.DepartCode != "") {
            $scope.errorDepartCode = false;
        }
        if (SelectType == "Role" && $scope.modelFolw.Role != "") {
            $scope.errorRole = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.ActCode == "") {
            $scope.errorActCode = true;
            mess.Status = true;
        } else {
            $scope.errorActCode = false;
        }
        return mess;
    };
    function validationSelectFlow(data) {
        var mess = { Status: false, Title: "" }
        //Check null 


        if (data.ActCode == "") {
            $scope.errorActCodeFlow = true;
            mess.Status = true;
        } else {
            $scope.errorActCodeFlow = false;
        }

        if (data.BranchCode == "") {
            $scope.errorBranchCode = true;
            mess.Status = true;
        } else {
            $scope.errorBranchCode = false;
        }

        if (data.DepartCode == "") {
            $scope.errorDepartCode = true;
            mess.Status = true;
        } else {
            $scope.errorDepartCode = false;
        }

        if (data.Role == "") {
            $scope.errorRole = true;
            mess.Status = true;
        } else {
            $scope.errorRole = false;
        }


        return mess;
    };
    setTimeout(function () {
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
            //var maxDate = new Date(selected.date.valueOf());
            //$('#datefrom').datepicker('setEndDate', maxDate);
        });
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 100);
});

app.controller('activity', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.modelObj = {
        ActCode: '',
        UnitTime: ''
    };
    $scope.IDCheck = 0;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Activity/JTableActivityFlow",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.WorkFlowCode = $rootScope.WorkFlowCode;

            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataDetail");
            }
        })

        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(3)
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActCode').withTitle('{{"ACT_LBL_ACTIVITY" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Priority').withTitle('{{"ACT_LBL_PRIORITY" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LimitTime').withTitle('{{"ACT_LBL_TIME_LIMIT" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitTime').withTitle('{{"ACT_LBL_UNIT" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Branch').withTitle('{{"Chi nhánh" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        if (data != null) {
            var list_Branch = "";
            var list = data.split(',');
            for (var i = 0; i < list.length; i++) {
                for (var j = 0; j < $rootScope.listBranch.length; j++) {
                    if (list[i] == $rootScope.listBranch[j].Code) {
                        list_Branch += $rootScope.listBranch[j].Name;
                        if (list.length - i > 1) {
                            list_Branch += ", ";
                        }
                        break;
                    }
                }
            }
            return list_Branch;
        } else {
            return '';
        }
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Department').withTitle('{{"Phòng ban" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
    //    if (data != null) {
    //        var list_Depart = "";
    //        var list = data.split(',');
    //        for (var i = 0; i < list.length; i++) {
    //            for (var j = 0; j < $rootScope.listDepartment.length; j++) {
    //                if (list[i] == $rootScope.listDepartment[j].Code) {
    //                    list_Depart += $rootScope.listDepartment[j].Name;
    //                    if (list.length - i > 1) {
    //                        list_Depart += ", ";
    //                    }
    //                    break;
    //                }
    //            }
    //        }
    //        return list_Depart;
    //    } else {
    //        return '';
    //    }
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ACT_LBL_CATEGORY_GC" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"Tác vụ" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="Mở rộng" ng-click="extend(' + full.ID + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-trello"></i></button>' +
            //'<button title="Sửa" ng-click="edit(' + full.ID + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadActivity = function () {
        reloadData(false);
    };
    $scope.extend = function (id) {
        dataservice.getItemActivity(id, function (rs) {
            var rss = rs.data.Object;
            $rootScope.ActCode = rss.ActCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/extend.html',
                controller: 'extend',
                backdrop: true,
                size: '50',
                resolve: {
                    para: function () {
                        return rss;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $rootScope.reloadActivity();
            }, function () { });
        });

    }
    $scope.edit = function (id) {
        dataservice.getItemActivity(id, function (rs) {
            $scope.modelObj = rs.data.Object;
        });

    }
    $scope.refresh = function () {
        $scope.IDCheck = 0;
        $scope.modelObj.ActCode = '';
        $scope.modelObj.Priority = '';
        $scope.modelObj.LimitTime = '';
        $scope.modelObj.UnitTime = '';
        $scope.modelObj.Note = '';
    };
    $scope.addActiviy = function () {
        validationSelect($scope.modelObj);
        $scope.modelObj.WorkFlowCode = $rootScope.WorkFlowCode;
        if ($scope.activity.validate() && !validationSelect($scope.modelObj).Status) {
            if ($scope.IDCheck == 0) {
                dataservice.insertActivity($scope.modelObj, function (result) {
                    if (result.data.Error) {
                        App.toastrError(result.data.Title);
                    } else {
                        App.toastrSuccess(result.data.Title);
                        $scope.IDCheck = 1;
                        $scope.reload();
                    }
                });
            } else {
                //dataservice.updateActivity($scope.modelObj, function (result) {
                //    if (result.data.Error) {
                //        App.toastrError(result.data.Title);
                //    } else {
                //        App.toastrSuccess(result.data.Title);
                //        $scope.reload();
                //    }
                //});
                dataservice.insertActivity($scope.modelObj, function (result) {
                    if (result.data.Error) {
                        App.toastrError(result.data.Title);
                    } else {
                        App.toastrSuccess(result.data.Title);
                        $scope.IDCheck = 1;
                        $scope.reload();
                    }
                });
            }

        }
    }
    $scope.delete = function (id) {
        dataservice.deleteActivity(id, function (rs) {
            if (rs.data.Error) {
                App.toastrError(rs.data.Title);
            } else {
                App.toastrSuccess(rs.data.Title);
                $scope.reload();
            }
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ActCode" && $scope.modelObj.ActCode != "") {
            $scope.errorActCode = false;
        }
        if (SelectType == "UnitTime" && $scope.modelObj.UnitTime != "") {
            $scope.errorUnitTime = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.ActCode == "") {
            $scope.errorActCode = true;
            mess.Status = true;
        } else {
            $scope.errorActCode = false;
        }

        if (data.UnitTime == "") {
            $scope.errorUnitTime = true;
            mess.Status = true;
        } else {
            $scope.errorUnitTime = false;
        }
        return mess;
    };
    setTimeout(function () {
    }, 200);
});

app.controller('extend', function ($scope, $rootScope, $confirm, $compile, $uibModalInstance, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, para) {
    var vm = $scope;

    $scope.modelFolw = {
        ActCode: '',
        Role: '',
        DepartCode: '',
        BranchCode: '',
        WorkFlowProperty : ''
    }
    $scope.IDCheck = 0;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Activity/JTableWorkFlow",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.WorkFlowCode = $rootScope.WorkFlowCode;
                d.ActCode = $rootScope.ActCode;

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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActName').withTitle('{{"Hoạt động" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BranchName').withTitle('{{"Chi nhánh" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DepartmentName').withTitle('{{"Phòng ban" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Role').withTitle('{{"Vai trò" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Property').withTitle('{{"Thuộc tính" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"Tác vụ" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadNoResetPage5 = function () {
        reloadData(false);
    };

    $scope.initData = function () {
        $scope.model = para;
        debugger
        $scope.modelFolw.WorkFlowCode = $scope.model.WorkFlowCode;
        $scope.modelFolw.ActCode = $scope.model.ActCode;
        dataservice.getRolesWorkFlow(function (rs) {
            $scope.listRoles = rs.data;
        });
        dataservice.getDepartmentWorkFlow(function (rs) {
            $scope.listDepartment = rs.data;
        });
        dataservice.getBranchWorkFlow(function (rs) {
            $scope.listBranch = rs.data;
        });
        dataservice.getProperties(para.ActCode, function (rs) {
            $scope.listWorkFlowProperty = rs.data;
        });

    };
    $scope.initData();
    $scope.refresh = function () {
        $scope.IDCheck = 0;
        $scope.modelFolw.Role = '';
        $scope.modelFolw.DepartCode = '';
        $scope.modelFolw.BranchCode = '';
        $scope.modelFolw.WorkFlowProperty = '';

    };
    $scope.addWorkFlow = function () {
        validationSelectFlow($scope.modelFolw);

        if (!validationSelectFlow($scope.modelFolw).Status) {
            var temp = $rootScope.checkData($scope.modelFolw);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            if ($scope.IDCheck = 0) {
                dataservice.insertWorkFlow($scope.modelFolw, function (result) {
                    var rs = result.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $rootScope.reloadActivity();
                    }
                });
            } else {
                dataservice.insertWorkFlow($scope.modelFolw, function (result) {
                    var rs = result.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $rootScope.reloadActivity();
                    }
                });
            }
            
        }
    }

    $scope.delete = function (id) {
        dataservice.deleteWorkflowActRole(id, function (rs) {
            if (rs.data.Error) {
                App.toastrError(rs.data.Title);
            } else {
                App.toastrSuccess(rs.data.Title);
                $scope.reload();
                $rootScope.reloadActivity();
            }
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.changeSelect = function (SelectType) {

        if (SelectType == "BranchCode" && $scope.modelFolw.BranchCode != "") {
            $scope.errorBranchCode = false;
        }
        if (SelectType == "DepartCode" && $scope.modelFolw.DepartCode != "") {
            $scope.errorDepartCode = false;
        }
        if (SelectType == "Role" && $scope.modelFolw.Role != "") {
            $scope.errorRole = false;
        }
    }
    function validationSelectFlow(data) {
        var mess = { Status: false, Title: "" }
        //Check null 


        if (data.ActCode == "") {
            $scope.errorActCodeFlow = true;
            mess.Status = true;
        } else {
            $scope.errorActCodeFlow = false;
        }

        if (data.BranchCode == "") {
            $scope.errorBranchCode = true;
            mess.Status = true;
        } else {
            $scope.errorBranchCode = false;
        }

        if (data.DepartCode == "") {
            $scope.errorDepartCode = true;
            mess.Status = true;
        } else {
            $scope.errorDepartCode = false;
        }

        if (data.Role == "") {
            $scope.errorRole = true;
            mess.Status = true;
        } else {
            $scope.errorRole = false;
        }


        return mess;
    };
    setTimeout(function () {
    }, 200);
});
