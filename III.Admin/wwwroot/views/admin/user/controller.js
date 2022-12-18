var ctxfolder = "/views/admin/user";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
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

app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    };
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        };

        $http(req).then(callback);
    };
    return {
        insert: function (data, callback) {
            submitFormUpload('/Admin/User/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/User/Update', data, callback);
        },
        //deleteItems: function (data, callback) {
        //    $http.post('/Admin/User/deleteItems', data).then(callback);
        //},
        //delete: function (data, callback) {
        //    $http.post('/Admin/User/delete/', data).then(callback);
        //},
        getItem: function (data, callback) {
            $http.post('/Admin/User/Getitem/' + data).then(callback);
        },
        resort: function (data, callback) {
            $http.post('/Admin/User/Resort', data).then(callback);
        },
        getAll: function (callback) {
            $http.post('/Admin/User/GetAll/').then(callback);
        },
        loadGroupResource: function (callback) {
            $http.post('/Admin/User/GetGroupResource/').then(callback);
        },
        loadCompany: function (callback) {
            $http.post('/Admin/User/GetCompany/').then(callback);
        },
        loadOrganization: function (callback) {
            $http.post('/Admin/User/GetOrganization/').then(callback);
        },
        loadDepartment: function (callback) {
            $http.post('/Admin/User/GetDepartment/').then(callback);
        },
        loadRole: function (callback) {
            $http.post('/Admin/User/GetRole/').then(callback);
        },
        loadBranch: function (callback) {
            $http.post('/Admin/User/GetBranch/').then(callback);
        },
        loadProfitCenter: function (callback) {
            $http.post('/Admin/User/GetProfitCenter/').then(callback);
        },
        loadAccountExecutive: function (callback) {
            $http.post('/Admin/User/GetAccountExecutive/').then(callback);
        },
        deleteGUser: function (data, callback) {
            $http.post('/Admin/User/DeleteGUser', data).then(callback);
        },
        getListGroupRole: function (data, callback) {
            $http.get('/Admin/User/GetListGroupRole/' + data).then(callback);
        },
        deactive: function (data, callback) {
            $http.post('/Admin/User/Deactive', data).then(callback);
        },
        active: function (data, callback) {
            $http.post('/Admin/User/Active', data).then(callback);
        },
        checkUser: function (data, callback) {
            $http.get('/Admin/User/checkUser?userName=' + data).then(callback);
        },
        submitUpload: function (data, callback) {
            submitFormUpload('/Admin/User/UploadUser', data, callback);
        },
        submitInsertUser: function (data, callback) {
            $http.post('/Admin/User/InsertUsers', data).then(callback);
        },
        getAllApplication: function (callback) {
            $http.post('/Admin/PermissionResource/GetApplication/').then(callback);
        },
        getAllBranch: function (data, callback) {
            $http.post('/Admin/PermissionResource/GetAllBranch', data).then(callback);
        },
        getDepartmentByApp: function (data, callback) {
            $http.post('/Admin/User/GetDepartmentByApp', data).then(callback);
        },
        getResourceOfGroup: function (data, callback) {
            $http.post('/Admin/User/GetResourceOfGroup', data).then(callback);
        },
        updatePermission: function (data, callback) {
            $http.post('/Admin/User/UpdateUserPermission', data).then(callback);
        },
        getArea: function (callback) {
            $http.post('/Admin/User/GetArea/').then(callback);
        },
        getGroupUser: function (callback) {
            $http.post('/Admin/User/GetGroupUser/').then(callback);
        },
        //getAllStaff: function (callback) {
        //    $http.post('/Admin/User/GetAllStaff/').then(callback);
        //},
        getListEmployeeCode: function (data, callback) {
            $http.get('/Admin/User/GetListEmployeeCode?id=' + data).then(callback);
        },
        getListRoleCombination: function (callback) {
            $http.post('/Admin/User/GetListRoleCombination/').then(callback);
        },
        deleteUserGroupRole: function (data, callback) {
            $http.post('/Admin/User/DeleteUserGroupRole?id=' + data).then(callback);
        },
        insertUserGroupRole: function (data, callback) {
            $http.post('/Admin/User/InsertUserGroupRole', data).then(callback);
        },
        insertUserDepartmentRole: function (data, callback) {
            $http.post('/Admin/User/InsertUserDepartmentRole', data).then(callback);
        },
        deleteUserDepartmentRole: function (data, callback) {
            $http.post('/Admin/User/DeleteUserDepartmentRole?id=' + data).then(callback);
        },
        getHrEmployee: function (callback) {
            $http.get('/Admin/User/GetHrEmployee/').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
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

    var culture = $cookies.get('.AspNetCore.Culture') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
            var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            //var partternPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}/;
            var partternPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/;
            var partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            var mess = { Status: false, Title: "" }
            if (data.EmployeeCode != null && data.EmployeeCode != '' && !partternCode.test(data.EmployeeCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.VALIDATE_ITEM_CODE.replace('{0}', caption.EMPLOYEE_CODE), "<br/>");
            }
            if (!partternName.test(data.FullName)) {
                mess.Status = true;
                mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.USER_FULLNAME) + "<br/>";
            }
            if (!partternDescription.test(data.Note)) {
                mess.Status = true;
                mess.Title += " - " + caption.VALIDATE_ITEM.replace('{0}', caption.NOTE) + "<br/>";
            }
            if (data.Password != undefined && data.Password != "" && data.Password.length < 6) {
                mess.Status = true;
                mess.Title += "Mật khẩu phải có ít nhất 6 ký tự" + "<br/>";
            }
            if (data.Email != '' && data.Email != null && !partternEmail.test(data.Email)) {
                mess.Status = true;
                mess.Title += "Địa chỉ email nhập không đúng" + "<br/>";
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                UserName: {
                    required: true,
                    maxlength: 255,
                    regx: /^[a-zA-Z0-9]+[^êĂăĐđĨĩŨũƠơƯưẠ-ỹ!@#$%^&*<>?\s]*$/,
                },
                GivenName: {
                    required: true,
                    maxlength: 255
                },
                //Email: {
                //    required: true,
                //    maxlength: 255
                //},
                Note: {
                    maxlength: 2000
                },
                Reason: {
                    maxlength: 2000
                },
                Password: {
                    required: true,
                    maxlength: 50
                },
                //PhoneNumber: {
                //    required: true,
                //},
                //EmployeeCode: {
                //    required: true,
                //    maxlength: 50
                //},
                BranchId: {
                    required: true
                },
                DepartmentId: {
                    required: true
                }
                //ProfitCenterId: {
                //    required: true
                //},
                //AccountExecutiveId: {
                //    required: true
                //}
            },
            messages: {
                UserName: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_ACCOUNT_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_ACCOUNT_NAME).replace('{1}', '255'),
                    regx: "Tên tài khoản không bao gồm ký tự đặc biệt và ký tự có dấu !"
                },
                GivenName: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_NAME).replace('{1}', '255')
                },
                //Email: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_EMAIL),
                //    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_EMAIL).replace('{1}', '255')
                //},
                Note: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_NOTE).replace('{1}', '2000')
                },
                Reason: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_REASON).replace('{1}', '2000')
                },
                Password: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_PASSWORD),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_PASSWORD).replace('{1}', '50')
                },
                //OfficeNumber: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.PHONE_NUMBER),
                //    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.PHONE_NUMBER).replace('{1}', '10')
                //},
                //EmployeeCode: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_EMPLOYEES_CODE),
                //    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_EMPLOYEES_CODE).replace('{1}', '50')
                //},
                BranchId: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_BRANCH)
                },
                DepartmentId: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_DEPARTMENT)
                },
                //PhoneNumber: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_PHONE)
                //},
                //ProfitCenterId: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.PROFIT_CENTER)
                //},
                //AccountExecutiveId: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ACCOUNT_EXECUTIVE)
                //}
            }
        }
        $rootScope.StatusData = [
            { Value: null, Name: 'Tất cả' },
            {
                Value: true,
                Name: "Hoạt động"
            }, {
                Value: false,
                Name: "Không hoạt động"
            }];
        $rootScope.TypeStaffData = [{
            Code: 0,
            Name: "Nhân viên thị trường"
        }, {
            Code: 10,
            Name: "Cán bộ duyệt"
        }, {
            Code: 5,
            Name: "NPP/ĐLý/Cửa hàng"
        }];
        $rootScope.IsTranslate = true;
    });
    $rootScope.typeWork = [{
        Code: 'P',
        Name: 'PartTime'
    }, {
        Code: 'F',
        Name: 'FullTime'
    }]
    $rootScope.UserId = '';
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/User/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',//'/Admin/User/GetView/Index',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',//'/Admin/User/GetView/Edit',
            controller: 'edit'
        })
        .when('/groupRole/:id', {
            templateUrl: ctxfolder + '/groupRole.html',
            controller: 'groupRole'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',//'/Admin/User/GetView/Add',
            controller: 'add'
        })
        .when('/permission/:id', {
            templateUrl: ctxfolder + '/permission.html',
            controller: 'permission'
        });
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
app.controller('index', function ($scope, $rootScope, $filter, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    var vm = $scope;
    $scope.liAdd = [];
    $scope.model = {
        GroupUser: 0,
        Role: 0,
        Organizations: 0,
        UserName: '',
        Email: '',
        //EmployeeCode: '',
        Status: null,
        BranchId: "",
        DepartmentId: null,
        GivenName: ''
    };
    $scope.init = function () {
        dataservice.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listBranch.unshift(all)
        })
        //dataservice.loadGroupResource(function (rs) {rs=rs.data;
        //    if (rs.Error) { }
        //    else {
        //        $scope.liGroupResource = rs;
        //    }
        //});
        //dataservice.loadRole(function (rs) {rs=rs.data;
        //    if (rs.Error) { }
        //    else {
        //        $scope.liRole = rs;
        //    }
        //});
        //dataservice.loadOrganization(function (rs) {rs=rs.data;
        //    if (rs.Error) { }
        //    else {
        //        $scope.liOrganization = rs;
        //    }
        //});
        dataservice.loadDepartment(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liDepartment = rs;
            }
        });
        dataservice.loadBranch(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liBranch = rs;
            }
        });
        //dataservice.loadProfitCenter(function (rs) {rs=rs.data;
        //    if (rs.Error) { }
        //    else {
        //        $scope.liProfitCenter = rs;
        //    }
        //});
        //dataservice.loadAccountExecutive(function (rs) {rs=rs.data;
        //    if (rs.Error) { }
        //    else {
        //        $scope.liAccountExecutive = rs;
        //    }
        //});
    }
    $scope.init();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    //#region
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/User/JTableOfAdmin",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.DepartmentId = $scope.model.DepartmentId;
                d.BranchId = $scope.model.BranchId;
                d.Status = $scope.model.Status;
                d.UserName = $scope.model.UserName;
                d.Email = $scope.model.Email;
                d.GivenName = $scope.model.GivenName;
                //d.EmployeeCode = $scope.model.EmployeeCode;
                //d.GroupUser = $scope.model.GroupUser == 0 ? [] : ([$scope.model.GroupUser.Id]);
                //d.Role = $scope.model.Role == '' ? '' : ($scope.model.Role.Id);
                //d.Organization = $scope.model.Organizations == 0 ? 0 : ($scope.model.Organizations.Id);
                //$scope.liAdd = [];
            },
            complete: function (rs) {
                App.unblockUI("#contentMain");
                heightTableAuto();
                if (rs && rs.responseJSON && rs.responseJSON.Error) {
                    App.toastrError(rs.responseJSON.Title);
                }
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
                    $scope.selected[data._STT] = !$scope.selected[data._STT];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data._STT] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data._STT] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data._STT;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
            $scope.addId(full);
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedDate').withTitle('{{"CREATED_DATE" | translate}}').withOption('sClass', 'tcenter  hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserName').withTitle('{{"ADM_USER_LIST_COL_ACCOUNT_NAME" | translate}}').withOption('sClass', 'mw70'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').withTitle('{{"ADM_USER_LIST_COL_NAME" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{"ADM_USER_LIST_COL_EMAIL" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Branch').withTitle('{{"ADM_USER_LIST_COL_BRANCH" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('GroupUser').withTitle('{{"Nhóm người dùng" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Department').withTitle('{{"ADM_USER_LIST_COL_DEPARTMENT" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListGroup').withTitle('{{"ADM_USER_LIST_COL_LISTGROUP" | translate}}').renderWith(function (data, type, full) {
        debugger
        var listGroup = JSON.parse(full.ListGroup);
        var item = "";
        for (var i = 0; i < listGroup.length; i++) {
            item += "<span class='text-danger'>- " + listGroup[i].GroupName + "</span></br>";
        }
        return item;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Role').withTitle('{{"ADM_USER_LIST_COL_ROLE" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListRoleGroup').withTitle('{{"ADM_USER_LIST_COL_ROLE" | translate}}').renderWith(function (data, type, full) {
        var listGroup = JSON.parse(full.ListRoleGroup);
        var item = "";
        for (var i = 0; i < listGroup.length; i++) {
            item += "<span class='text-primary'>- " + listGroup[i].RoleName + "</span></br>";
        }
        return item;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Active').withTitle('{{"ADM_USER_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data == "True" ? '<span class="text-success">{{"ADM_USER_CURD_LBL_ACTIVE" | translate}}</span>' : '<span class="text-danger">{{"ADM_USER_CURD_LBL_INACTIVE" | translate}}</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Picture').withTitle('{{"ADM_USER_LIST_COL_AVATAR" | translate}}').renderWith(function (data, type, full, meta) {
        return data === "" ? "" : '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' class="img-responsive" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withTitle('{{"ADM_USER_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full._STT + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.addId = function (data) {
        for (var i = 0; i < $scope.liAdd.length; i++) {
            if ($scope.liAdd[i] == data.Id) {
                return;
            }
        }
        $scope.liAdd.push(data);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.reload = function () {
        reloadData(true);
    }
    //#endregion

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    //$scope.sort = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/sort.html',
    //        controller: 'sort',
    //        backdrop: 'static',
    //        size: '60'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () {
    //    });
    //}
    //$scope.delete = function (id) {
    //    $confirm({ text: "Bạn muốn xóa nhân viên?", title: "Xác nhận", ok: "Có", cancel: "Không" })
    //        .then(function () {
    //            App.blockUI({
    //                target: "#contentMain",
    //                boxed: true,
    //                message: 'loading...'
    //            });
    //        });
    //}
    //$scope.deleteChecked = function () {
    //    var deleteItems = [];
    //    for (var id in $scope.selected) {
    //        if ($scope.selected.hasOwnProperty(id)) {
    //            if ($scope.selected[id]) {
    //                deleteItems.push(id);
    //            }
    //        }
    //    }
    //    var deleteItemsId = [];
    //    for (var i = 0; i < deleteItems.length; i++) {
    //        deleteItemsId.push($scope.liAdd[parseInt(deleteItems[i]) - 1]);
    //    }
    //    if (deleteItemsId.length > 0) {
    //        $confirm({ text: caption.MSG_DELETE_LIST_CONFIRM.replace('{0}', caption.USER_USERNAME.toLowerCase()), title: caption.CONFIRM, ok: caption.CONFIRM_OK, cancel: caption.CONFIRM_CANCEL })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.deleteItems(deleteItemsId, function (result) {result=result.data;
    //                    if (result.Error) {
    //                        App.toastrError(result.Title);
    //                    } else {
    //                        App.toastrSuccess(result.Title);
    //                        $scope.reload();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });

    //            });
    //    } else {
    //        App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER.toLowerCase()));
    //    }
    //}

    $scope.edit = function (stt) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i]._STT == stt) {
                userModel = listdata[i];
                $rootScope.UserId = listdata[i].Id;
                break;
            }
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return userModel;
                }
            }

        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }


    //$scope.edit = function () {
    //    debugger
    //    var editItems = [];
    //    for (var id in $scope.selected) {
    //        if ($scope.selected.hasOwnProperty(id)) {
    //            if ($scope.selected[id]) {
    //                editItems.push(id);
    //            }
    //        }
    //    }
    //    if (editItems.length > 0) {
    //        if (editItems.length == 1) {
    //            var userModel = $scope.liAdd[parseInt(editItems[0]) - 1];
    //            var modalInstance = $uibModal.open({
    //                animation: true,
    //                templateUrl: ctxfolder + '/edit.html',
    //                controller: 'edit',
    //                backdrop: 'static',
    //                size: 'lg',
    //                resolve: {
    //                    para: function () {
    //                        return userModel;
    //                    }
    //                }
    //            });
    //            modalInstance.result.then(function (d) {
    //                $scope.reload();
    //            }, function () {
    //            });
    //        } else {
    //            App.toastrError(caption.ONLY_SELECT.replace('{0}', caption.USER));
    //        }
    //    } else {
    //        App.toastrWarning(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER));
    //    }
    //}
    //$scope.deactive = function () {
    //    var selectedItemsIndex = [];
    //    for (var id in $scope.selected) {
    //        if ($scope.selected.hasOwnProperty(id)) {
    //            if ($scope.selected[id]) {
    //                selectedItemsIndex.push(id);
    //            }
    //        }
    //    }
    //    var deactiveItemsId = [];
    //    var hasDeactiveItemsId = [];
    //    for (var i = 0; i < selectedItemsIndex.length; i++) {
    //        var user = $scope.liAdd[parseInt(selectedItemsIndex[i]) - 1];
    //        if (user.Active === "False") {
    //            hasDeactiveItemsId.push(user);
    //        } else {
    //            deactiveItemsId.push(user);
    //        }
    //    }
    //    if (hasDeactiveItemsId.length > 0) {
    //        if (hasDeactiveItemsId.length == 1 && selectedItemsIndex.length == 1) {
    //            App.toastrError("User has been deactivated!");
    //        } else {
    //            App.toastrError(caption.ERR_EXIST_DEACTIVE);
    //        }
    //    } else {
    //        var deactiveListId = [];
    //        for (var j = 0; j < deactiveItemsId.length; j++) {
    //            deactiveListId.push(deactiveItemsId[j].Id);
    //        }

    //        if (deactiveItemsId.length > 0) {
    //            var modalInstance = $uibModal.open({
    //                animation: true,
    //                templateUrl: ctxfolder + '/deactive.html',
    //                controller: 'deactive',
    //                backdrop: 'static',
    //                size: 'lg',
    //                resolve: {
    //                    para: function () {
    //                        return deactiveListId;
    //                    }
    //                }
    //            });
    //            modalInstance.result.then(function (d) {
    //                $scope.reload();
    //            }, function () {
    //            });
    //        } else {
    //            App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER.toLowerCase()));
    //        }
    //    }

    //}
    //$scope.active = function () {
    //    var selectedItemsIndex = [];
    //    for (var id in $scope.selected) {
    //        if ($scope.selected.hasOwnProperty(id)) {
    //            if ($scope.selected[id]) {
    //                selectedItemsIndex.push(id);
    //            }
    //        }
    //    }
    //    var activeItemsId = [];
    //    var hasActiveItemsId = [];
    //    for (var i = 0; i < selectedItemsIndex.length; i++) {
    //        var user = $scope.liAdd[parseInt(selectedItemsIndex[i]) - 1];
    //        if (user.Active === "True") {
    //            hasActiveItemsId.push(user);
    //        } else {
    //            activeItemsId.push(user);
    //        }
    //    }
    //    if (hasActiveItemsId.length > 0) {
    //        if (hasActiveItemsId.length == 1 && selectedItemsIndex.length == 1) {
    //            App.toastrError("User has been activated!");
    //        } else {
    //            App.toastrError(caption.ERR_EXIST_ACTIVE);
    //        }
    //    } else {
    //        var activeListId = [];
    //        for (var j = 0; j < activeItemsId.length; j++) {
    //            activeListId.push(activeItemsId[j].Id);
    //        }

    //        if (activeItemsId.length > 0) {
    //            var modalInstance = $uibModal.open({
    //                animation: true,
    //                templateUrl: ctxfolder + '/active.html',
    //                controller: 'active',
    //                backdrop: 'static',
    //                size: 'lg',
    //                resolve: {
    //                    para: function () {
    //                        return activeListId;
    //                    }
    //                }
    //            });
    //            modalInstance.result.then(function (d) {
    //                $scope.reload();
    //            }, function () {
    //            });
    //        } else {
    //            App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER.toLowerCase()));
    //        }
    //    }
    //}

    //$scope.import = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/import.html',
    //        controller: 'import',
    //        backdrop: 'static',
    //        size: '90'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}

    //$scope.contextMenu = [
    //    [function ($itemScope) {
    //        return "<i class='fa fa-edit'></i> " + caption.EDIT_ITEM.replace('{0}', caption.USER_USERNAME.toLowerCase());
    //    }, function ($itemScope, $event, model) {
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/edit.html',
    //            controller: 'edit',
    //            backdrop: 'static',
    //            size: 'lg',
    //            resolve: {
    //                para: function () {
    //                    return $itemScope.data;
    //                }
    //            }
    //        });
    //        modalInstance.result.then(function (d) {
    //            $scope.reload();
    //        }, function () {
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    //[function ($itemScope) {
    //    //    return '<i class="fa fa-remove"></i> ' + caption.DELETE_ITEM.replace('{0}', caption.USER_USERNAME.toLowerCase());
    //    //}, function ($itemScope, $event, model) {
    //    //    $confirm({ text: caption.MSG_DEL_CONFIRM_WITH_NAME.replace('{0}', caption.USER_USERNAME.toLowerCase()).replace('{1}', $itemScope.data.UserName), title: caption.CONFIRM, cancel: caption.CONFIRM_CANCEL })
    //    //        .then(function () {
    //    //            App.blockUI({
    //    //                target: "#contentMain",
    //    //                boxed: true,
    //    //                message: 'loading...'
    //    //            });

    //    //            //alert($itemScope.data.UserName);

    //    //            dataservice.delete($itemScope.data, function (result) {result=result.data;
    //    //                if (result.Error) {
    //    //                    App.toastrError(result.Title);
    //    //                } else {
    //    //                    App.toastrSuccess(result.Title);
    //    //                    $scope.reload();
    //    //                }
    //    //                App.unblockUI("#contentMain");
    //    //            });
    //    //        });
    //    //}, function ($itemScope, $event, model) {
    //    //    return true;
    //    //}],
    //    //[function ($itemScope) {
    //    //    return "<i class='fa fa-users'></i> " + caption.GROUP_ROLE_INFO;
    //    //}, function ($itemScope, $event, model) {
    //    //    var modalInstance = $uibModal.open({
    //    //        animation: true,
    //    //        templateUrl: ctxfolder + '/groupRole.html',
    //    //        controller: 'groupRole',
    //    //        backdrop: 'static',
    //    //        size: 'lg',
    //    //        resolve: {
    //    //            para: function () {
    //    //                return $itemScope.data;
    //    //            }
    //    //        }
    //    //    });
    //    //    modalInstance.result.then(function (d) {
    //    //        $scope.reload();
    //    //    }, function () {
    //    //    });
    //    //}, function ($itemScope, $event, model) {
    //    //    return true;
    //    //}]
    //];
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
    }, 50);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate) {
    $scope.model = {
        TempSub: {
            IdI: [],
            IdS: [],
        },
        VIBUserInGroups: [],
        AspNetUserRoles: [],
        Organizations: 0,
        ApplicationCode: 'ADMIN',
        RoleId: '',
        UserName: '',
        Password: '',
        GivenName: '',
        EmployeeCode: '',
        Email: '',
        PhoneNumber: '',
        BranchId: '',
        DepartmentId: '',
        UserType: '0',
        Picture: '',
        Active: true,
        Note: '',
        TypeStaff: '',
        //TypeWork: '',
        //Area: [],
        //GroupUserCode: []
    };
    $scope.liBranch = [];
    var allBranch = {
        OrgCode: "ALL",
        OrgName: "Tất cả",
        OrgAddonCode: "b_ALL"
    }
    $scope.liBranch.push(allBranch);

    $scope.initData = function () {
        dataservice.loadRole(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.listRoles = rs;
            }
        });
        dataservice.loadDepartment(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liDepartment = rs;
            }
        });
        dataservice.loadBranch(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liBranch = rs;
            }
        });
        dataservice.loadProfitCenter(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liProfitCenter = rs;
            }
        });
        dataservice.getAllApplication(function (rs1) {
            rs1 = rs1.data;
            if (rs1.Error) { }
            else {
                $scope.listApplication = rs1;
            }
        });
        dataservice.getArea(function (rs) {
            rs = rs.data;
            $scope.listArea = rs;
        });
        dataservice.getGroupUser(function (rs) {
            rs = rs.data;
            $scope.listGroupUser = rs;
        });
        //dataservice.getListEmployeeCode('', function (rs) {rs=rs.data;
        //    if (rs.Error) { }
        //    else {
        //        $scope.listEmployeeCode = rs.Object;
        //    }
        //});
        dataservice.getHrEmployee(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.listEmployeeCode = rs.Object;
            }
        });
        dataservice.getListRoleCombination(function (rs) {
            rs = rs.data;
            $scope.entities = rs;
        })
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {

            if ($scope.model.BranchId == null) {
                mess.Status = true;
                mess.Title += " - " + caption.ERR_REQUIRED.replace('{0}', caption.BRANCH) + "<br/>";
            }
            if ($scope.model.DepartmentId == null) {
                mess.Status = true;
                mess.Title += " - " + caption.ERR_REQUIRED.replace('{0}', caption.DEPARTMENT) + "<br/>";
            }
            var mess = { Status: false, Title: "" }
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }
            var formData = new FormData();
            formData.append("image", file != undefined ? file : null);

            formData.append("UserName", $scope.model.UserName);
            formData.append("Password", $scope.model.Password);
            formData.append("GivenName", $scope.model.GivenName);
            formData.append("Email", $scope.model.Email == null ? '' : $scope.model.Email);
            formData.append("PhoneNumber", $scope.model.PhoneNumber);
            formData.append("BranchId", $scope.model.BranchId);
            formData.append("DepartmentId", $scope.model.DepartmentId);
            formData.append("RoleId", $scope.model.RoleId);
            formData.append("ApplicationCode", $scope.model.ApplicationCode);
            formData.append("EmployeeCode", $scope.model.EmployeeCode);
            formData.append("UserType", $scope.model.UserType);
            formData.append("Active", $scope.model.Active);
            formData.append("Note", $scope.model.Note);
            formData.append("TypeStaff", $scope.model.TypeStaff == null ? '' : $scope.model.TypeStaff);
            //formData.append("Area", $scope.model.Area.length != 0 ? $scope.model.Area.join(';') : '');
            //formData.append("GroupUserCode", $scope.model.GroupUserCode.length != 0 ? $scope.model.GroupUserCode.join(';') : '');
            var roleCombination = [];
            for (var i = 0; i < $scope.entities.length; i++) {
                if ($scope.entities[i].Check) {
                    var obj = {
                        Code: $scope.entities[i].Code
                    }
                    roleCombination.push(obj);
                }
            }
            formData.append("RoleCombination", JSON.stringify(roleCombination));
            dataservice.insert(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    //if ($scope.model.BranchId == null || $scope.model.DepartmentId == null) {
                    //    App.toastrError(mess.Title);
                    //} else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                    //}
                }
            });
        }
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "Branch" && $scope.model.BranchId != "") {
            $scope.errorBranch = false;
        }
        if (selectType == "Department" && $scope.model.DepartmentId != "") {
            $scope.errorDepartment = false;
        }
        if (selectType == "ApplicationCode" && $scope.model.ApplicationCode != "") {
            $scope.errorApplicationCode = false;
        }
        if (selectType == "RoleId" && $scope.model.RoleId != "") {
            $scope.errorRoleId = false;
        }
        //if (selectType == "Area") {
        //    if ($scope.model.Area.length > 0) {
        //        $scope.errorArea = false;
        //    } else {
        //        $scope.errorArea = true;
        //    }
        //}
        //if (selectType == "GroupUserCode") {
        //    if ($scope.model.GroupUserCode.length > 0) {
        //        $scope.errorGroupUserCode = false;
        //    } else {
        //        $scope.errorGroupUserCode = true;
        //    }
        //}
        if ($scope.model.PhoneNumber != "") {
            if (selectType == "PhoneNumber" && $scope.model.PhoneNumber && $rootScope.partternPhone.test($scope.model.PhoneNumber)) {
                $scope.errorPhoneNumber = false;
            }
        } else {
            $scope.errorPhoneNumber = false;
        }
    }
    $scope.selectTypeStaff = function (type) {
        $scope.errorBranch = false;
        $scope.errorDepartment = false;
        $scope.errorRoleId = false;
        $scope.errorApplicationCode = false;
    }
    $scope.selectEmployeeCode = function (item) {
        if (item != null) {
            $scope.model.GivenName = item.Name;
            $scope.model.Email = item.Email;
            $scope.model.PhoneNumber = item.PhoneNumber;
            $scope.model.DepartmentId = item.DepartmentId;
            $scope.model.RoleId = item.RoleId;
        }
        else {
            $scope.model.GivenName = '';
            $scope.model.Email = '';
            $scope.model.PhoneNumber = '';
            $scope.model.DepartmentId = '';
            $scope.model.RoleId = '';
        }
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
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
    function showPassWord() {
        $(".toggle-password").click(function () {
            $(this).toggleClass("fa-eye fa-eye-slash");
            var input = $($(this).attr("toggle"));
            if (input.attr("type") == "password") {
                input.attr("type", "text");
            } else {
                input.attr("type", "password");
            }
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if ($scope.model.TypeStaff === "" || $scope.model.TypeStaff === null || $scope.model.TypeStaff === 10) {
            //Check null Branch
            if (data.BranchId == "" || data.BranchId == null) {
                $scope.errorBranch = true;
                mess.Status = true;
            } else {
                $scope.errorBranch = false;
            }
            //Check null Department
            if (data.DepartmentId == "" || data.DepartmentId == null) {
                $scope.errorDepartment = true;
                mess.Status = true;
            } else {
                $scope.errorDepartment = false;
            }
            //Check null Application
            if (data.ApplicationCode == "" || data.ApplicationCode == null) {
                $scope.errorApplicationCode = true;
                mess.Status = true;
            } else {
                $scope.errorApplicationCode = false;
            }
            //Check null role
            if (data.RoleId == "" || data.RoleId == null) {
                $scope.errorRoleId = true;
                mess.Status = true;
            } else {
                $scope.errorRoleId = false;
            }
        } else {
            $scope.errorBranch = false;
            $scope.errorDepartment = false;
            $scope.errorRoleId = false;
            $scope.errorApplicationCode = false;
        }
        //if ($scope.model.Area.length == 0) {
        //    $scope.errorArea = true;
        //    mess.Status = true;

        //}
        //if ($scope.model.GroupUserCode.length == 0) {
        //    $scope.errorGroupUserCode = true;
        //    mess.Status = true;
        //}
        if (data.PhoneNumber && !$rootScope.partternPhone.test(data.PhoneNumber)) {
            $scope.errorPhoneNumber = true;
            mess.Status = true;
        } else {
            $scope.errorPhoneNumber = false;
        }


        return mess;
    };
    function showPassWord() {
        $(".toggle-password").click(function () {
            $(this).toggleClass("fa-eye fa-eye-slash");
            var input = $($(this).attr("toggle"));
            if (input.attr("type") == "password") {
                input.attr("type", "text");
            } else {
                input.attr("type", "password");
            }
        });
    }
    setTimeout(function () {
        showPassWord();
        setModalDraggable('.modal-dialog');
    }, 200);
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, DTOptionsBuilder, DTColumnBuilder, $translate, $timeout, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.TempSub = {
        IdI: [],
        IdS: [],
    };
    $scope.TempSubTemp = {
        IdI: [],
        IdS: [],
    };
    $scope.model = {
        TempSub: {
            IdI: [],
            IdS: [],
        },
        OrgId: 0,
        VIBUserInGroups: [],
        AspNetUserRoles: [],
        Organizations: 0,
        Password: '',
    };
    $scope.liBranch = [];
    $scope.initData = function () {

        dataservice.getItem(para.Id, function (rs) {
            rs = rs.data;
            //$rootScope.UserId = '';
            //$rootScope.UserId = rs.Id;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                $scope.model.ApplicationCode = 'ADMIN';
                $scope.model.Password = '';
                $scope.model.Area = $scope.model.Area != '' && $scope.model.Area != null ? $scope.model.Area.split(';') : [];
                //$scope.model.GroupUserCode = $scope.model.GroupUserCode != null ? $scope.model.GroupUserCode : [];
                $scope.model.TempSub = {
                    IdI: [],
                    IdS: [],
                };
                dataservice.getListRoleCombination(function (rs) {
                    rs = rs.data;
                    var listRoleCombination = $scope.model.RoleCombination != null ? JSON.parse($scope.model.RoleCombination) : [];
                    for (var i = 0; i < rs.length; i++) {
                        for (var j = 0; j < listRoleCombination.length; j++) {
                            if (rs[i].Code == listRoleCombination[j].Code) {
                                rs[i].Check = true;
                                break;
                            }
                        }
                    }
                    $scope.entities = rs;
                })
                dataservice.loadRole(function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) { }
                    else {
                        $scope.listRoles = rs1;
                    }
                });
                dataservice.loadDepartment(function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) {
                        //App.toastrError(rs1.Title);
                    }
                    else {
                        $scope.liDepartment = rs1;
                    }
                });
                dataservice.loadBranch(function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) { }
                    else {
                        $scope.liBranch = rs1;
                        var allBranch = {
                            OrgCode: "ALL",
                            OrgName: "Tất cả",
                            OrgAddonCode: "b_ALL"
                        }
                        $scope.liBranch.push(allBranch);
                    }
                });
                dataservice.getListGroupRole(para.Id, function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) { }
                    else {
                        $scope.listGroupRole = rs1;
                    }
                });
                dataservice.getAllApplication(function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) { }
                    else {
                        $scope.listApplication = rs1;
                    }
                });
                dataservice.getArea(function (rs) {
                    rs = rs.data;
                    $scope.listArea = rs;
                });
                dataservice.getGroupUser(function (rs) {
                    rs = rs.data;
                    $scope.listGroupUser = rs;
                });
                $scope.model.EmployeeCode = $scope.model.EmployeeCode == null ? '' : $scope.model.EmployeeCode;
                //dataservice.getListEmployeeCode($scope.model.EmployeeCode, function (rs) {rs=rs.data;
                //    if (rs.Error) { }
                //    else {
                //        $scope.listEmployeeCode = rs.Object;
                //    }
                //});
            }
        });
        dataservice.getHrEmployee(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.listEmployeeCode = rs.Object;
            }
        });
    }
    $scope.initData();
    

    $scope.submit = function () {
        debugger
        $scope.model.ApplicationCode = 'ADMIN';
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }
            var formData = new FormData();
            formData.append("image", file != undefined ? file : null);
            formData.append("Id", $scope.model.Id);
            formData.append("UserName", $scope.model.UserName);
            formData.append("Password", $scope.model.Password);
            formData.append("GivenName", $scope.model.GivenName);
            formData.append("Email", $scope.model.Email == null ? '' : $scope.model.Email);
            formData.append("PhoneNumber", $scope.model.PhoneNumber == null ? '' : $scope.model.PhoneNumber);
            formData.append("BranchId", $scope.model.BranchId == null ? '' : $scope.model.BranchId);
            formData.append("DepartmentId", $scope.model.DepartmentId == null ? '' : $scope.model.DepartmentId);
            formData.append("RoleId", $scope.model.RoleId == null ? '' : $scope.model.RoleId);
            formData.append("ApplicationCode", $scope.model.ApplicationCode == null ? '' : $scope.model.ApplicationCode);
            formData.append("EmployeeCode", $scope.model.EmployeeCode == null ? '' : $scope.model.EmployeeCode);
            formData.append("UserType", $scope.model.UserType);
            formData.append("Active", $scope.model.Active);
            formData.append("Note", $scope.model.Note == null ? '' : $scope.model.Note);
            formData.append("TypeStaff", $scope.model.TypeStaff == null ? '' : $scope.model.TypeStaff);
            formData.append("Reason", $scope.model.Reason);
            formData.append("Area", $scope.model.Area.length != 0 ? $scope.model.Area.join(';') : '');
            //formData.append("GroupUserCode", $scope.model.GroupUserCode.length != 0 ? $scope.model.GroupUserCode.join(';') : '');
            var roleCombination = [];
            for (var i = 0; i < $scope.entities.length; i++) {
                if ($scope.entities[i].Check) {
                    var obj = {
                        Code: $scope.entities[i].Code
                    }
                    roleCombination.push(obj);
                }
            }
            formData.append("RoleCombination", JSON.stringify(roleCombination));
            dataservice.update(formData, function (rs) {
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
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Branch" && $scope.model.BranchId != "") {
            $scope.errorBranch = false;
        }
        //if (SelectType == "Department" && $scope.model.DepartmentId != "") {
        //    $scope.errorDepartment = false;
        //}
        if (SelectType == "ApplicationCode" && $scope.model.ApplicationCode != "") {
            $scope.errorApplicationCode = false;
        }
        if (SelectType == "RoleId" && $scope.model.RoleId != "") {
            $scope.errorRoleId = false;
        }
        if ($scope.model.PhoneNumber != "") {
            if (SelectType == "PhoneNumber" && $rootScope.partternPhone.test($scope.model.PhoneNumber)) {
                $scope.errorPhoneNumber = false;
            }
        } else {
            $scope.errorPhoneNumber = false;
        }
        if (SelectType == "Area") {
            if ($scope.model.Area.length > 0) {
                $scope.errorArea = false;
            } else {
                $scope.errorArea = true;
            }
        }
        //if (SelectType == "GroupUserCode") {
        //    if ($scope.model.GroupUserCode.length > 0) {
        //        $scope.errorGroupUserCode = false;
        //    } else {
        //        $scope.errorGroupUserCode = true;
        //    }
        //}
    }
    $scope.selectTypeStaff = function (type) {
        $scope.errorBranch = false;
        $scope.errorDepartment = false;
        $scope.errorRoleId = false;
        $scope.errorApplicationCode = false;
    }
    $scope.selectEmployeeCode = function (item) {
        debugger
        if (item != null) {
            $scope.model.GivenName = item.Name;
            $scope.model.Email = item.Email;
            $scope.model.PhoneNumber = item.PhoneNumber;
            $scope.model.DepartmentId = item.DepartmentId;
            $scope.model.RoleId = item.RoleId;
        }
        else {
            $scope.model.GivenName = '';
            $scope.model.Email = '';
            $scope.model.PhoneNumber = '';
            $scope.model.DepartmentId = '';
            $scope.model.RoleId = '';
        }
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
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
    //Validate UiSelect
    function validationSelect(data) {
        debugger
        var mess = { Status: false, Title: "" }
        if ($scope.model.TypeStaff === "" || $scope.model.TypeStaff === null || $scope.model.TypeStaff === 10) {
            //Check null Branch
            if (data.BranchId == "" || data.BranchId == null) {
                $scope.errorBranch = true;
                mess.Status = true;
            } else {
                $scope.errorBranch = false;
            }
            //Check null Department
            if (data.DepartmentId == "" || data.DepartmentId == null) {
                $scope.errorDepartment = true;
                mess.Status = true;
            } else {
                $scope.errorDepartment = false;
            }
            //Check null Application
            if (data.ApplicationCode == "" || data.ApplicationCode == null) {
                $scope.errorApplicationCode = true;
                mess.Status = true;
            } else {
                $scope.errorApplicationCode = false;
            }
            //Check null role
            if (data.RoleId == "" || data.RoleId == null) {
                $scope.errorRoleId = true;
                mess.Status = true;
            } else {
                $scope.errorRoleId = false;
            }
        } else {
            $scope.errorBranch = false;
            $scope.errorDepartment = false;
            $scope.errorRoleId = false;
            $scope.errorApplicationCode = false;
        }
        if ($scope.model.Area.length == 0) {
            $scope.errorArea = true;
            mess.Status = true;
        }
        //if ($scope.model.GroupUserCode.length == 0) {
        //    $scope.errorGroupUserCode = true;
        //    mess.Status = true;
        //}
        if (data.PhoneNumber && !$rootScope.partternPhone.test(data.PhoneNumber)) {
            $scope.errorPhoneNumber = true;
            mess.Status = true;
        } else {
            $scope.errorPhoneNumber = false;
        }
        return mess;
    };
    function showPassWord() {
        $(".toggle-password").click(function () {
            $(this).toggleClass("fa-eye fa-eye-slash");
            var input = $($(this).attr("toggle"));
            if (input.attr("type") == "password") {
                input.attr("type", "text");
            } else {
                input.attr("type", "password");
            }
        });
    }

    $scope.log = {};
    $scope.system = {};
    var vmLog = $scope.log;
    $scope.system = {
        DepartmentCode: '',
        GroupUserCode: '',
        UserName: '',
        FromDate: '',
        ToDate: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vmLog.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DashBoard/JTableSystemLog",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.DepartmentCode = $scope.system.DepartmentCode;
                d.GroupUserCode = $scope.system.GroupUserCode;
                d.UserName = para.UserName;
                d.FromDate = $scope.system.FromDate;
                d.ToDate = $scope.system.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain"); 
                heightTableManual(200, "#tblDataSystemLog");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {

                    var Id = data.Id;
                    $scope.openLog(Id);
                }
            });
        });

    vmLog.dtColumns = [];
    vmLog.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full._STT] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected,$event)"/><span></span></label>';
    }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('ID').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"ADM_USER_LIST_COL_OBJECT" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vmLog.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{"ADM_USER_LIST_COL_ACTION_LOG" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('RequestBody').withTitle('{{"DB_LIST_COL_REQUEST_BODY" | translate}}').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"ADM_USER_LIST_COL_USER_ACTION" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"ADM_USER_LIST_COL_TIME_LOG" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('IP').withTitle('{{"ADM_USER_LIST_COL_IP_LOG" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));

    vmLog.reloadData = reloadData;
    vmLog.dtInstance = {};
    function reloadData(resetPaging) {
        vmLog.dtInstance.reloadData(callback, resetPaging);
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
        $(evt.target).closest('tr').toggleClass('selected');
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vmLog.selectAll = false;
                    return;
                }
            }
        }
        vmLog.selectAll = true;
    }
    function resetCheckbox() {
        $scope.selected = [];
        vmLog.selectAll = false;
    }
    $scope.search = function () {
        reloadData(true);
    };
    $scope.reload = function () {
        reloadData(true);
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $timeout(function () {
        showPassWord();
        setModalDraggable('.modal-dialog');
    }, 100);
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.controller('groupUser', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.modelGroupUser = {
        UserId: $rootScope.UserId
    }
    $scope.initLoad = function () {
        dataservice.getGroupUser(function (rs) {
            rs = rs.data;
            $scope.groupUserList = rs;
        })
        dataservice.loadRole(function (rs) {
            rs = rs.data;
            $scope.roleList = rs;
        })
    }
    $scope.initLoad();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/User/JtableUserGroupRole",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.modelGroupUser.UserId;
            },
            complete: function () {
                App.unblockUI("#contentMain"); 
                heightTableManual(200, "#tblDataGroupUser");
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserName').withTitle($translate('ADM_USER_LIST_COL_USERNAME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GroupTitle').withTitle($translate('ADM_USER_LIST_COL_GROUP_USER')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RoleTitle').withTitle($translate('ADM_USER_LIST_COL_ROLE_USER')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle($translate('ADM_USER_LIST_COL_ACTION')).renderWith(function (data, type, full) {
        return '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadTabTicket = function () {
        reloadData(true);
    }
    $scope.addUserGroupRole = function () {
        validationSelect($scope.modelGroupUser);
        if (!validationSelect($scope.modelGroupUser).Status) {
            dataservice.insertUserGroupRole($scope.modelGroupUser, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $rootScope.reloadNoResetPage();
                }
            });
        }
    }
    $scope.delete = function (id) {
        dataservice.deleteUserGroupRole(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
                $rootScope.reloadNoResetPage();
            }
        })
    }
    $scope.changeSelect = function (selectType) {
        if (selectType == "GroupUserCode" && $scope.modelGroupUser.GroupUserCode != "") {
            $scope.errorGroupUserCode = false;
        }
        if (selectType == "RoleId" && $scope.modelGroupUser.RoleId != "") {
            $scope.errorRoleId = false;
        }
    }
    function validationSelect(data) {
        debugger
        var mess = { Status: false, Title: "" }
        //Check null Branch
        if (data.GroupUserCode == "" || data.GroupUserCode == null) {
            $scope.errorGroupUserCode = true;
            mess.Status = true;
        } else {
            $scope.errorGroupUserCode = false;
        }
        //Check null Department
        if (data.RoleId == "" || data.RoleId == null) {
            $scope.errorRoleId = true;
            mess.Status = true;
        } else {
            $scope.errorRoleId = false;
        }
        return mess;
    };
});

app.controller('userDepartment', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.modelDepartmentUser = {
        UserId: $rootScope.UserId
    }
    $scope.initLoad = function () {
        dataservice.loadDepartment(function (rs) {
            rs = rs.data;
            $scope.departmentList = rs;
        })
        dataservice.loadRole(function (rs) {
            rs = rs.data;
            $scope.roleList = rs;
        })
    }
    $scope.initLoad();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/User/JtableUserDepartmentRole",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $rootScope.UserId;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataDepartment");
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserName').withTitle($translate('ADM_USER_LIST_COL_USERNAME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DepartmentTitle').withTitle($translate('ADM_USER_CURD_TAP_DEPARTMENT')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RoleTitle').withTitle($translate('ADM_USER_LIST_COL_ROLE')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle($translate('ADM_USER_LIST_COL_ACTION')).renderWith(function (data, type, full) {
        return '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadTabTicket = function () {
        reloadData(true);
    }
    $scope.addUserDepartRole = function () {
        validationSelect($scope.modelDepartmentUser);
        if (!validationSelect($scope.modelDepartmentUser).Status) {
            dataservice.insertUserDepartmentRole($scope.modelDepartmentUser, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $rootScope.reloadNoResetPage();
                }
            });
        }
    }
    $scope.delete = function (id) {
        dataservice.deleteUserDepartmentRole(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
                $rootScope.reloadNoResetPage();
            }
        })
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "DepartmentCode" && $scope.modelDepartmentUser.DepartmentCode != "") {
            $scope.errorDepartmentCode = false;
        }
        if (selectType == "RoleId" && $scope.modelDepartmentUser.RoleId != "") {
            $scope.errorRoleId = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null Branch
        if (data.DepartmentCode == "" || data.DepartmentCode == null) {
            $scope.errorDepartmentCode = true;
            mess.Status = true;
        } else {
            $scope.errorDepartmentCode = false;
        }
        //Check null Department
        if ($scope.modelDepartmentUser.RoleId == "" || $scope.modelDepartmentUser.RoleId == null) {
            $scope.errorRoleId = true;
            mess.Status = true;
        } else {
            $scope.errorRoleId = false;
        }
        return mess;
    };
});






//app.controller('deactive', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    }
//    $scope.model = {
//        //Reason: ''
//    };
//    var userDeactive = {
//        ListId: para,
//        Reason: ''
//    }
//    $scope.submit = function () {
//        if ($scope.deactiveform.validate()) {
//            userDeactive.Reason = $scope.model.Reason;
//            dataservice.deactive(userDeactive,
//                function (rs) {rs=rs.data;
//                    if (rs.Error) {
//                        App.toastrError(rs.Title);
//                    } else {
//                        App.toastrSuccess(rs.Title);
//                        $uibModalInstance.close();
//                    }
//                });
//        }
//    }
//});
////-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//app.controller('active', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    }
//    $scope.model = {
//        //Reason: ''
//    };
//    var userActive = {
//        ListId: para,
//        Reason: ''
//    }
//    $scope.submit = function () {
//        if ($scope.activeform.validate()) {
//            userActive.Reason = $scope.model.Reason;
//            dataservice.active(userActive,
//                function (rs) {rs=rs.data;
//                    if (rs.Error) {
//                        App.toastrError(rs.Title);
//                    } else {
//                        App.toastrSuccess(rs.Title);
//                        $uibModalInstance.close();
//                    }
//                });
//        }
//    }
//});
////-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//app.controller('import', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate) {
//    $scope.model = {
//        Active: true
//    };
//    $scope.listUsers = [];
//    $scope.selected = [];
//    $scope.selectAll = false;

//    $scope.toggleAll = toggleAll;
//    function toggleAll() {
//        angular.forEach($scope.listUsers, function (item) {
//            item.Checked = $scope.selectAll;
//        });
//    }

//    $scope.toggleOne = toggleOne;
//    function toggleOne() {
//        $scope.selectAll = true;
//        angular.forEach($scope.listUsers, function (item) {
//            if (!item.Checked && !item.Error) {
//                $scope.selectAll = false;
//                return;
//            }
//        });
//    }

//    $scope.uploadUser = function () {
//        if ($scope.model.FileUpload != null && $scope.model.FileUpload.length > 0) {
//            var formData = new FormData();
//            formData.append("FileUpload", $scope.model.FileUpload[0]);

//            App.blockUI({
//                target: "#modal-body",
//                boxed: true,
//                message: 'loading...'
//            });

//            dataservice.submitUpload(formData, function (rs) {rs=rs.data;
//                if (rs.Error) {
//                    App.toastrError(rs.Title);
//                } else {
//                    $scope.listUsers = rs.Object;
//                    $scope.selectAll = true;
//                }
//                App.unblockUI("#modal-body");
//            });
//        } else {
//            App.toastrError("Please choose file to upload");
//        }
//    }
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    }
//    $scope.submit = function () {
//        var listUser = [];
//        angular.forEach($scope.listUsers, function (item) {
//            if (item.Checked && !item.Error) {
//                listUser.push(item);
//            }
//        });
//        if (listUser.length > 0) {
//            dataservice.submitInsertUser(listUser, function (rs) {rs=rs.data;
//                if (rs.Error) {
//                    App.toastrError(rs.Title);
//                } else {
//                    App.toastrSuccess(rs.Title);
//                    //$uibModalInstance.close();
//                }
//            });
//        } else {
//            App.toastrError(caption.MSG_IMPORT_USER_EMPTY);
//        }
//    }
//    $scope.ExportExcel = function () {
//        location.href = "/in/User/ExportExcelFailed";
//    }
//});
//app.controller('permission', function ($scope, $rootScope, $compile, $confirm, dataservice, $translate, $location, $routeParams) {
//    var vm = $scope;
//    vm.span = function (item) { return '<span title="' + item + '">'; }
//    vm.spans = function () { return '</span>'; }

//    $scope.model = {
//        UserId: $routeParams.id,
//        RoleId: '',
//        GroupCode: '',
//        AppCode: '',
//        GroupUsers: [],
//        Resources: [],
//        BranchRefs: [],
//    };
//    $scope.UserInfo = {};
//    $scope.listRoles = [];
//    $scope.listApplication = [];
//    $scope.listGroupUsers = [];
//    $scope.listGroupUsersCopy = [];
//    $scope.listResources = [];
//    $scope.listResourcesCopy = [];
//    $scope.listBranchs = [];

//    $scope.backToList = function () {
//        $location.path('/');
//    }

//    $scope.initData = function () {
//        dataservice.getItem($scope.model.UserId, function (rs) {rs=rs.data;
//            if (rs.Error) {
//                App.toastrError(rs.Title);
//                $location.path('/');
//            } else {
//                $scope.UserInfo = rs;

//                dataservice.getAllApplication(function (rs1) {rs1=rs1.data;
//                    if (rs1.Error) { }
//                    else {
//                        $scope.listApplication = rs1;
//                    }
//                });
//                dataservice.loadRole(function (rs1) {rs1=rs1.data;
//                    if (rs1.Error) { }
//                    else {
//                        $scope.listRoles = rs1;
//                    }
//                });
//                //dataservice.loadBranch(function (rs1) {rs1=rs1.data;
//                //    if (rs1.Error) { }
//                //    else {
//                //        $scope.listBranchs = rs1;
//                //    }
//                //});
//                $scope.loadGroupUser();
//            }
//        });
//    }
//    $scope.initData();

//    // Application
//    $scope.changeApplication = function () {
//        //$scope.loadGroupUser();
//    }
//    $scope.clearApplication = function () {
//        $scope.model.AppCode = '';
//    }

//    // Group user
//    $scope.searchGroupUser = function () {
//        $scope.listGroupUsers = $scope.listGroupUsersCopy.filter(function (group, key) {
//            var index = group.GroupCode.indexOf($scope.txtGroupUserName);
//            var index1 = group.Title.indexOf($scope.txtGroupUserName);
//            return index > -1 || index1 > -1;
//        });
//        if ($scope.listGroupUsers.length == 0) {
//            App.toastrWarning('No data available');
//        }
//    }
//    $scope.clearSearchGroupUser = function () {
//        $scope.txtGroupUserName = '';
//        $scope.listGroupUsers = angular.copy($scope.listGroupUsersCopy);
//    }
//    $scope.selectAllGroup = false;
//    $scope.selectOneGroup = [];
//    $scope.selectedGroup = [];
//    $scope.loadGroupUser = function () {
//        //App.blockUI({
//        //    target: "#contentMainTree2",
//        //    boxed: true,
//        //    message: 'loading...'
//        //});
//        var model = {
//            AppCode: $scope.model.AppCode,
//            UserId: $scope.model.UserId,
//        }
//        dataservice.getDepartmentByApp(model, function (rs) {rs=rs.data;
//            if (rs.Error) { }
//            else {
//                $scope.listGroupUsers = rs;
//                $scope.listGroupUsersCopy = angular.copy(rs);
//                $scope.model.GroupUsers = $scope.listGroupUsersCopy
//                    .filter(function (e, index) { return e.IsChecked; })
//                    .map(function (e, index) { return e.GroupCode; });
//            }
//            //App.unblockUI("#contentMainTree2");
//        });
//    }
//    $scope.clickSelectAllGroup = function (selectAllGroup) {
//        if (selectAllGroup) {
//            $scope.model.GroupUsers = $scope.listGroupUsers.map(function (e, index) {
//                $scope.listGroupUsers[index].IsChecked = selectAllGroup;
//                var index1 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(e.GroupCode);
//                if (index1 > -1) $scope.listGroupUsersCopy[index1].IsChecked = selectAllGroup;

//                return e.GroupCode;
//            });
//        } else {
//            $scope.model.GroupUsers = [];
//            $scope.listGroupUsers.forEach(function (e, index) {
//                $scope.listGroupUsers[index].IsChecked = selectAllGroup;

//                var index1 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(e.GroupCode);
//                if (index1 > -1) $scope.listGroupUsersCopy[index1].IsChecked = selectAllGroup;
//            });
//        }
//    }
//    $scope.clickSelectOneGroup = function (index, item) {
//        if ($scope.listGroupUsers[index].IsChecked) {
//            $scope.model.GroupUsers.push(item.GroupCode);

//            var index1 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(item.GroupCode);
//            if (index1 > -1) $scope.listGroupUsersCopy[index1].IsChecked = true;
//        } else {
//            var index2 = $scope.model.GroupUsers.map(function (e) { return e; }).indexOf(item.GroupCode);
//            $scope.model.GroupUsers.splice(index2, 1);

//            var index3 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(item.GroupCode);
//            if (index3 > -1) $scope.listGroupUsersCopy[index3].IsChecked = false;
//        }
//        $scope.selectAllGroup = $scope.listGroupUsers.length == $scope.model.GroupUsers.length;
//    }
//    $scope.changeRoleOfGroup = function (item) {
//        // Set role in copy
//        var index1 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(item.GroupCode);
//        if (index1 > -1) {
//            $scope.listGroupUsersCopy[index1].RoleId = item.RoleId;
//            // Reload resource
//            if ($scope.model.GroupCode == item.GroupCode) {
//                $scope.model.RoleId = item.RoleId;
//                $scope.getResourceApi(0);
//            } else {
//                $scope.listGroupUsersCopy[index1].Resources = [];
//            }
//        }
//    }
//    $scope.showUserPermission = function (group, index) {
//        $scope.model.GroupCode = group.GroupCode;
//        $scope.model.RoleId = group.RoleId;
//        // Get resource
//        $scope.getResourceApi(1);
//    }
//    $scope.getResourceApi = function (type) {
//        if ($scope.model.AppCode == null || $scope.model.AppCode == '') {
//            App.toastrWarning('Application is required! Please select application!');
//        } else if ($scope.model.RoleId == null || $scope.model.RoleId == '') {
//            App.toastrWarning('Role is required! Please select role of departmenr / profit center.');
//        } else {
//            $scope.txtResourceApi = '';
//            //var index = $scope.listGroupUsers.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
//            var index = $scope.listGroupUsersCopy.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
//            if (index > -1) {
//                // Set class selected
//                $scope.selectedGroup.forEach(function (e, index1) {
//                    $scope.selectedGroup[index1] = false;
//                });
//                $scope.selectedGroup[index] = true;
//                // Get and show resource
//                if (type == 1
//                    && $scope.listGroupUsersCopy[index].Resources != undefined
//                    && $scope.listGroupUsersCopy[index].Resources.length > 0) {
//                    $scope.model.Resources = $scope.listGroupUsersCopy[index].Resources;
//                    // Check all resource api
//                    var countPermission = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
//                    $scope.selectAll = countPermission == $scope.model.Resources.length;
//                } else {
//                    //App.blockUI({
//                    //    target: "#contentMainTree3",
//                    //    boxed: true,
//                    //    message: 'loading...'
//                    //});
//                    var model = {
//                        AppCode: $scope.model.AppCode,
//                        UserId: $scope.model.UserId,
//                        GroupCode: $scope.model.GroupCode,
//                        RoleId: $scope.model.RoleId,
//                    }
//                    dataservice.getResourceOfGroup(model, function (rs) {rs=rs.data;
//                        if (rs.Error) { }
//                        else {
//                            $scope.model.Resources = rs;
//                            $scope.listGroupUsersCopy[index].Resources = $scope.model.Resources;
//                            // Check all resource api
//                            var countPermission1 = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
//                            $scope.selectAll = countPermission1 == $scope.model.Resources.length;
//                        }
//                        //App.unblockUI("#contentMainTree3");
//                    });
//                }
//            }
//        }
//    }

//    // Resource API
//    $scope.selectAllResource = selectAllResource;
//    function selectAllResource(selectAll) {
//        if ($scope.model.Resources != null) {
//            if (selectAll == true) {
//                angular.forEach($scope.model.Resources, function (value, key) {
//                    value.HasPermission = true;
//                });
//            } else {
//                angular.forEach($scope.model.Resources, function (value, key) {
//                    value.HasPermission = false;
//                });
//            }
//        }
//    }
//    $scope.selectOneResource = function (item) {
//        item.HasPermission = !item.HasPermission;

//        var countPermission = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
//        $scope.selectAll = countPermission == $scope.model.Resources.length;
//    }
//    $scope.searchResource = function () {
//        var index = $scope.listGroupUsersCopy.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
//        if (index > -1) {
//            $scope.model.Resources = $scope.listGroupUsersCopy[index].Resources.filter(function (obj, index1) {
//                var index2 = obj.Title.indexOf($scope.txtResourceApi);
//                var index3 = obj.Api.indexOf($scope.txtResourceApi);

//                return index2 > -1 || index3 > -1;
//            });

//            var countPermission = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
//            $scope.selectAll = countPermission == $scope.model.Resources.length;

//            if ($scope.model.Resources.length == 0) {
//                App.toastrWarning('No data available');
//            }
//        }
//    }
//    $scope.clearSearchResource = function () {
//        $scope.txtResourceApi = '';
//        var index = $scope.listGroupUsersCopy.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
//        if (index > -1) {
//            $scope.model.Resources = angular.copy($scope.listGroupUsersCopy[index].Resources);

//            var countPermission = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
//            $scope.selectAll = countPermission == $scope.model.Resources.length;
//        }
//    }

//    // Branch Reference
//    $scope.searchBranch = function () {
//        $('#treeDivBranch').jstree(true).search($scope.txtBranchName);
//    }
//    $scope.clearSearchBranch = function () {
//        $scope.txtBranchName = '';
//        $('#treeDivBranch').jstree(true).search($scope.txtBranchName);
//    }
//    $scope.treeDataBranch = [];
//    $scope.treeConfigBranch = {
//        core: {
//            multiple: true,
//            animation: true,
//            error: function (error) {
//                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
//            },
//            check_callback: true,
//            worker: true
//        },
//        plugins: ['checkbox', 'types', 'state', 'search'],
//        checkbox: {
//            "three_state": true,
//            "whole_node": false,
//            "keep_selected_style": true,
//            "cascade": "undetermined",
//        },
//        search: {
//            "case_insensitive": false,
//            "show_only_matches": true,
//        },
//        types: {
//            valid_children: ["selected"],
//            types: {
//                "selected": {
//                    "select_node": false
//                }
//            }
//        },
//    };
//    $('#treeDivBranch').jstree({});
//    $scope.searchTreeBranch = function (e, data) {
//        if (data.res.length === 0) {
//            App.toastrWarning('No data available');
//        };
//    }

//    $scope.readyCBBranch = function () {
//        //App.blockUI({
//        //    target: "#contentMainTreeBranch",
//        //    boxed: true,
//        //    message: 'loading...'
//        //});
//        var paraSearch = {
//            UserId: $scope.model.UserId,
//            Name: $scope.txtBranchName,
//        }
//        dataservice.getAllBranch(paraSearch, function (rs) {rs=rs.data;
//            if (rs.Error) {
//                App.toastrError(rs.Title);
//            } else {
//                $scope.listBranchs = angular.copy(rs);

//                for (var j = 0; j < rs.length; j++) {
//                    rs[j] = { Id: rs[j].OrgAddonCode, Title: rs[j].OrgName, ParentId: rs[j].OrgParentCode, IsChecked: rs[j].IsChecked, DisabledCheck: rs[j].DisabledCheck };
//                }
//                //var data = recuNew(rs);
//                for (var i = 0; i < rs.length; i++) {
//                    $scope.treeEnd = [];
//                    vm.jdata = rs[i];
//                    if (vm.jdata.ParentId == undefined || vm.jdata.ParentId == null) {
//                        vm.jdata.ParentId = '#';
//                        vm.treeDataBranch.push({ id: vm.jdata.Id, parent: vm.jdata.ParentId, text: vm.span(vm.jdata.Title) + vm.jdata.Title + vm.spans(), state: { "opened": true, "selected": vm.jdata.IsChecked, "checkbox_disabled": vm.jdata.DisabledCheck/*, "disabled": vm.jdata.DisabledCheck*/ } });
//                    } else {
//                        vm.treeDataBranch.push({ id: vm.jdata.Id, parent: vm.jdata.ParentId, text: vm.span(vm.jdata.Title) + vm.jdata.Title + vm.spans(), state: { "opened": false, "selected": vm.jdata.IsChecked, "checkbox_disabled": vm.jdata.DisabledCheck/*, "disabled": vm.jdata.DisabledCheck*/ } });
//                    }
//                    if (i == rs.length - 1) {
//                        vm.treeDataBranch.push($scope.treeEnd);
//                    }
//                };
//                $("#treeDivBranch").bind("select_node.jstree", function (evt, data1) {
//                    //$scope.eventTreeSelected(1);
//                });
//                $("#treeDivBranch").bind("deselect_node.jstree", function (e, data1) {
//                    //$scope.eventTreeSelected(0);
//                });
//            }
//            //App.unblockUI("#contentMainTreeBranch");
//        });
//    }
//    $scope.eventTreeSelected = function (checkType) {
//        var listBranchChecked = [];
//        var checkedIds = $('#treeDivBranch').jstree("get_checked", null, true);
//        var indexAll = checkedIds.map(function (e) { return e; }).indexOf('b_000');
//        if (indexAll > -1) {
//            listBranchChecked.push('b_000');
//        } else {
//            angular.forEach($scope.listBranchs, function (val, key) {
//                var index = checkedIds.map(function (e) { return e; }).indexOf(val.OrgAddonCode);
//                if (index > -1 && val.OrgAddonCode.indexOf('d_') < 0) {
//                    listBranchChecked.push(val.OrgAddonCode);
//                }
//            });
//        }

//        $scope.model.BranchRefs = listBranchChecked;
//    }

//    // Save and refresh action
//    $scope.refreshResource = function () {
//        $scope.getResourceApi(0);
//    }
//    $scope.clearAllResource = function () {
//        var index = $scope.listGroupUsersCopy.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
//        if (index > -1) {
//            $scope.listGroupUsersCopy[index].Resources = [];
//            $scope.model.Resources = [];
//            $scope.selectedGroup[index] = false;
//            $scope.selectAll = false;
//        }
//    }
//    $scope.saveResource = function () {
//        // Get all group selected
//        $scope.GroupUsersSelected = [];
//        var roleCount = 0;
//        angular.forEach($scope.listGroupUsersCopy, function (value, key) {
//            var index = $scope.model.GroupUsers.map(function (e) { return e; }).indexOf(value.GroupCode);
//            if (index > -1) {
//                $scope.GroupUsersSelected.push(value);
//                if (value.RoleId != null && value.RoleId != '' && value.RoleId != '--- Role ---') roleCount++;
//            }
//        });
//        // Get all Branch reference
//        $scope.eventTreeSelected(0);
//        // Validate input
//        if ($scope.model.AppCode == null || $scope.model.AppCode == '') {
//            App.toastrWarning('Application is required!Please select application!');
//        } else if (roleCount < $scope.GroupUsersSelected.length) {
//            App.toastrWarning('Role is required! Please select role for each department or profit center.');
//        } else {
//            var data = {
//                UserId: $scope.model.UserId,
//                AppCode: $scope.model.AppCode,
//                GroupUsers: $scope.GroupUsersSelected,
//                BranchRefs: $scope.model.BranchRefs,
//            };

//            dataservice.updatePermission(data, function (rs) {rs=rs.data;
//                if (rs.Error) {
//                    App.toastrError(rs.Title);
//                }
//                else {
//                    App.toastrSuccess(rs.Title);
//                }
//            });
//        }
//    }

//});
