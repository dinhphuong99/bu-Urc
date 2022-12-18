var ctxfolder = "/views/admin/trashCar";
var ctxfolderCommonSetting = "/views/admin/trashCar";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'dynamicNumber', "ngCookies", "pascalprecht.translate", 'monospaced.qrcode']).
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
    var submitFormUploadHD = function (url, data, callback) {
        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        var formData = new FormData();
        angular.forEach(data, function (value, key) {
            if (value == 'undefined' || value == 'null') {
                data[key] = '';
            }
        });
        formData.append("id", data.id);
        formData.append("Insuarance", data.Insuarance);
        formData.append("Dates_of_pay", data.Dates_of_pay);
        formData.append("Place_Work", data.Place_Work);
        formData.append("Exp_time_work", data.Exp_time_work);
        formData.append("Salary_Ratio", data.Salary_Ratio);
        formData.append("Payment", data.Payment);
        formData.append("Contract_Type", data.Contract_Type);
        formData.append("Signer", data.Signer);
        formData.append("Salary", data.Salary);
        formData.append("Start_Time", data.Start_Time);
        formData.append("End_Time", data.End_Time);
        formData.append("DateOf_LaborBook", data.DateOf_LaborBook);
        formData.append("Work_Content", data.Work_Content);
        formData.append("Allowance", data.Allowance);
        formData.append("Contract_Code", data.Contract_Code);
        formData.append("LaborBook_Code", data.LaborBook_Code);
        formData.append("Other_Agree", data.Other_Agree);
        formData.append("Info_Insuarance", data.Info_Insuarance);
        formData.append("Bonus", data.Bonus);
        formData.append("Tools_Work", data.Tools_Work);
        formData.append("Active", data.Active);
        formData.append("Type_Money", data.Type_Money);
        formData.append("Value_time_work", data.Value_time_work);
        formData.append("Type_Money", data.Type_Money);
        formData.append("File", data.File);
        formData.append("Info_Contract", data.Info_Contract);

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }
        $http(req).then(callback);
    };
    var submitFormUploadFile = function (url, data, callback) {
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
            $http.post('/Admin/TrashCar/Insert', data).then(callback);
            //submitFormUpload1('/Admin/HREmployee/Insert', data, callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/TrashCar/Update', data).then(callback);
            //submitFormUpload('/Admin/HREmployee/Update', data, callback);
        },
        getListRoute: function (callback) {
            $http.post('/Admin/GarbagePoint/GetListRoute/').then(callback);
        },
        getUserDefaultCar: function (callback) {
            $http.post('/Admin/TrashCar/GetUserDefaultCar').then(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUploadFile('/Admin/TrashCar/UploadFile/', data, callback);
        },
        uploadImage: function (data, callback) {
            submitFormUploadFile('/Admin/TrashCar/UploadImage/', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/TrashCar/Delete?id=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/TrashCar/GetItem?id=' + data).then(callback);
        },
        getTypeCar: function (callback) {
            $http.post('/Admin/TrashCar/GetCarType').then(callback);
        },
        GetListCatObjectType: function (callback) {
            $http.post('/Admin/UrencoTypeCar/GetListCatObjectType').then(callback);
        },
        GetObjectForType: function (data, callback) {
            $http.post('/Admin/TrashCar/GetObjectForType?objType=' + data).then(callback);
        },
        InsertWorkSpace: function (data, callback) {
            $http.post('/Admin/TrashCar/InsertWorkSpace', data).then(callback);
        },
        DeleteWorkSpace: function (data, callback) {
            $http.post('/Admin/TrashCar/DeleteWorkSpace?id=', data).then(callback);
        },
        getUrencoData: function (callback) {
            $http.get('/Admin/UrencoMap/GetUrencoData').then(callback);
        },
        getBranchWorking: function (callback) {
            $http.post('/Admin/User/GetBranch').then(callback);
        }
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,

        });

        $rootScope.validationOptions = {
            rules: {
                fullname: {
                    required: true,
                    maxlength: 50
                },
                birthday: {
                    required: true,
                },
                nation: {
                    required: true,
                    maxlength: 50
                },
                phone: {
                    required: true,
                    maxlength: 50
                },
                permanentresidence: {
                    required: true,
                    maxlength: 200
                },
                phone: {
                    required: true,
                    maxlength: 50
                },
                health: {
                    required: true,
                    maxlength: 50
                },
                identitycard: {
                    required: true,
                    maxlength: 12
                },
                identitycardplace: {
                    maxlength: 100
                },
                socialinsurance: {
                    required: true,
                    maxlength: 12
                },

                identification: {
                    required: true,
                    maxlength: 100
                },


                taxcode: {
                    required: true,
                    maxlength: 50
                },



                bank: {
                    required: true,
                    maxlength: 100
                },

                accountnumber: {
                    required: true,
                    maxlength: 50
                },



                Permanent_Address: {
                    required: true,
                    maxlength: 250
                },
                Now_Address: {
                    required: true,
                    maxlength: 250
                },
            },
            messages: {
                //Permanent_Address: {
                //    required: captionTRC_VALIDATE_ENTER_RESIDENT,
                //    maxlength: caption.TRC_VALIDATE_CHARACTER_RESIDENT
                //},
                //birthday: {
                //    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_DATE_OF_BIRTH,
                //},
                Now_Address: {
                    required: caption.TRC_VALIDATE_ENTER_ADDRESS,
                    maxlength: caption.TRC_VALIDATE_CHARACTER_ADDRESS
                },

                fullname: {
                    required: caption.TRC_VALIDATE_ENTER_FULL_NAME,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_NAME
                },
                nation: {
                    required: caption.TRC_VALIDATE_ENTER_NATIONANITY,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_NATIONANITY
                },
                phone: {
                    required: caption.TRC_VALIDATE_ENTER_PHONE,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_PHONE
                },
                birthday: {
                    required: caption.TRC_VALIDATE_ENTER_DATE_OF_BIRTH,
                    maxlength: caption.TRC_VALIDATE_ERR_ENTER_BIRTHDAY
                },
                permanentresidence: {
                    required: caption.TRC_VALIDATE_ENTER__RESIDENT,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_RESIDENT
                },
                phone: {
                    required: caption.TRC_VALIDATE_ENTER_PHONE,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_PHONE
                },
                educationallevel: {
                    required: caption.TRC_VALIDATE_ENTER_EDUCATION_LEVEL,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_EDUCATIONAL_LEVEL
                },
                health: {
                    required: caption.TRC_VALIDATE_ENTER_HEALTH,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_HEALTH
                },
                identitycard: {
                    required: caption.TRC_VALIDATE_ENTER_PASSPORT,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_PASSPORT
                },
                identitycardplace: {
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_ISSUED
                },
                taxcode: {
                    required: caption.TRC_VALIDATE_ENTER_HEALTH,
                    maxlength: caption.TRC_VALIDATE_ERR_DAY_RANGE
                },
                bank: {
                    required: caption.TRC_VALIDATE_ENTER_BANK_ACCOUNT,
                    maxlength: caption.TRC_VALIDATE_LIMIT_BANK_ACCOUNT
                },
                accountnumber: {
                    required: caption.TRC_VALIDATE_ENTER_NUMBER_ACCOUNT,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_NUMBER_ACCOUNT
                },


            }
        }
        $rootScope.validationOptionsInfomation = {
            rules: {
                taxcode: {
                    digits: true,
                },
                accountnumber: {
                    digits: true,
                }
            },
            messages: {
                taxcode: {
                    digits: caption.TRC_VALIDATE_ENTER_ERR_TAX_CODE,
                },
                accountnumber: {
                    digits: caption.TRC_VALIDATE_ERR_NUMBER_ACCOUNT,
                }
            }
        }
        $rootScope.validationOptionsAddress = {
            rules: {
                Permanent_Address: {
                    required: true
                },
                Now_Address: {
                    required: true
                }
            },
            messages: {
                Permanent_Address: {
                    required: caption.TRC_VALIDATE_ENTER__RESIDENT
                },
                Now_Address: {
                    required: caption.TRC_VALIDATE_ENTER_ADDRESS
                }
            }
        }
        $rootScope.validationOptionsContact = {
            rules: {
                ContactName: {
                    required: true,
                    maxlength: 250
                },
                Relationship: {
                    required: true,
                    maxlength: 50
                },
            },
            messages: {

                ContactName: {
                    required: caption.TRC_VALIDATE_ENTER_CONTACT_FAMILY,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_NAME_RELATIVES
                },
                Relationship: {
                    required: caption.TRC_VALIDATE_ENTER_RELATIONSHIP,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_RELATIONSHIP
                },
            }
        }
        $rootScope.validationOptionsDegree = {
            rules: {
                Education_Name: {
                    required: true,
                    maxlength: 250
                },
                Result: {
                    required: true,
                    maxlength: 50
                },
            },
            messages: {
                Education_Name: {
                    required: caption.TRC_VALIDATE_ENTER_NAME_TRAINING,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_TRAINING_NAME
                },
                Result: {
                    required: caption.TRC_VALIDATE_ENTER_RESULT,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_RESULT
                },
            }
        }
        $rootScope.validationOptionsWorkProgress = {
            rules: {
                Start_Time_Workprocess: {
                    required: true,
                },
                End_Time_Workprocess: {
                    required: true,
                },
                Wage_Level: {
                    required: true,
                },
                Salary_Ratio: {
                    required: true,
                },
            },
            messages: {
                Start_Time_Workprocess: {
                    required: caption.TRC_VALIDATE_ENTER_START_DAY,
                },
                End_Time_Workprocess: {
                    required: caption.TRC_VALIDATE_ENTER_END_DAY,
                },
                Wage_Level: {
                    required: caption.TRC_VALIDATE_SALARY_LEVEL,
                },
                Salary_Ratio: {
                    required: caption.TRC_VALIDATE_RATIO_SALARY,
                },
            }
        }
        $rootScope.validationOptionsContract = {
            rules: {
                Contract_Code: {
                    required: true,
                    maxlength: 50
                },
                Salary: {
                    required: true,
                },
                Insuarance: {
                    required: true,
                },
                Start_Time: {
                    required: true,
                },

                End_Time: {
                    required: true,
                },


            },
            messages: {
                Contract_Code: {
                    required: caption.TRC_VALIDATE_CONTRACT_NUMBER,
                    maxlength: caption.TRC_VALIDATE_LIMIT_CHARACTER_CONTRACT_NUMBER
                },
                Salary: {
                    required: caption.TRC_VALIDATE_ENTER_SALALY,
                },
                Insuarance: {
                    required: caption.TRC_VALIDATE_ENTER_INSURRANCE_LEVEL,
                },
                Start_Time: {
                    required: caption.TRC_VALIDATE_ENTER_START_TIME,
                },
                End_Time: {
                    required: caption.TRC_VALIDATE_ENTER_END_TIME,
                },
            }
        }
        $rootScope.validationOptionsWorkflow = {
            rules: {
                Name_Job: {
                    required: true,
                    maxlength: 250
                },
                Working_Process: {
                    required: true,
                    maxlength: 250
                }
            },
            messages: {
                Name_Job: {
                    required: caption.TRC_VALIDATE_NAME_JOB,
                    maxlength: " "
                },
                Working_Process: {
                    required: caption.TRC_VALIDATE_PROCEDURE,
                    maxlength: " "
                }
            }
        }

        $rootScope.gioitinh = [
            { value: caption.HR_HR_MAN_CURD_TXT_MEN, gender: 1 },
            { value: caption.HR_HR_MAN_CURD_TXT_WOMEN, gender: 2 }
        ];
        $rootScope.partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
        //Miêu tả có thể null, và có chứa được khoảng trắng
        $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
        $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
        $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
        $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
        $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
        $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {

    $translateProvider.useUrlLoader('/Admin/TrashCar/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add_contract/', {
            templateUrl: ctxfolder + '/add_contract.html',
            controller: 'add_contract'
        })
        .when('/edit_contract/:id', {
            templateUrl: ctxfolder + '/edit_contract.html',
            controller: 'edit_contract'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $translate, $window, dataservice, $filter) {
    var mapGroup = {};
    mapGroup["G1"] = "Nhóm chở rác";
    mapGroup["G2"] = "Nhóm quét đường";
    mapGroup[undefined] = "Nhóm khác";
    $scope.flags = [{ Code: -1, Name: "Tất cả" }, { Code: 0, Name: "Khóa" }, { Code: 1, Name: "Đang kích hoạt" }];
    $scope.groups = [{ Code: "", Name: "Tất cả" }, { Code: "G1", Name: "Nhóm chở rác" }, { Code: "G2", Name: "Nhóm quét đường" }];
    $scope.groupsName = [{ Code: "G1", Name: "Lê Đức Phòng" }, { Code: "G2", Name: "Nguyễn Văn Huy" }, { Code: "G2", Name: "Trần Tuấn Anh" }, { Code: "G2", Name: "Đỗ Văn Quỳnh" }, { Code: "G2", Name: "Nguyễn Văn Hiệp" }];
    var mapStatus = {};
    mapStatus[0] = "Khóa";
    mapStatus[1] = "Đang kích hoạt";

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        CarCode: "",
        Group: "",
        Flag: -1
    }
    $scope.treeDataunit = [];
    $scope.positionData = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TrashCar/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CarCode = $scope.model.CarCode;
                d.Group = $scope.model.Group;
                d.Flag = $scope.model.Flag;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CarName').withTitle('{{"TRC_LIST_COL_LICENCES_PLATE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Generic').withTitle('{{"TRC_LIST_COL_MANUFACT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Origin').withTitle('{{"TRC_LIST_COL_MADE_FROM" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0  dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"TRC_LIST_COL_GROUP" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0  dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PositionText').withTitle('{{"TRC_LIST_COL_CURRENT_POSITION" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SumDistance').withTitle('{{"TRC_LIST_COL_TOTAL_DISTANCE" | translate}}').renderWith(function (data, type) {
        if (data == 'Nhân viên thử việc') {
            return '<span class="text-warning">' + data + '</span>';
        } else if (data == 'Nhân viên thực tập') {
            return '<span class="text-danger">' + data + '</span>';
        } else if (data == 'Nhân viên chính thức') {
            return '<span class="text-success">' + data + '</span>';
        } else if (data == 'Cộng tác viên') {
            return '<span class="text-info">' + data + '</span>';
        } else if (data == 'Đã nghỉ việc') {
            return '<span class="text-danger">' + data + '</span>';
        } else {
            return data;
        }
    }).withOption('sClass', 'nowrap dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sRegistryExpirationDate').withTitle('{{"Ngày hết hạn đăng kiểm" | translate}}').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0  dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sRoadExpirationDate').withTitle('{{"Ngày hết hạn phí đường bộ" | translate}}').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0  dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sMaintenanceNextDate').withTitle('{{"Ngày bảo dưỡng tiếp theo" | translate}}').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0  dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"TRC_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0  dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag').withTitle('{{"TRC_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return mapStatus[data];
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-w80'));

    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"TRC_LIST_COL_ACTION" | translate}}').notSortable().renderWith(function (data, type, full, meta) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'nowrap tcenter  dataTable-10per'));
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
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 80;
        } else {
            size = 70;
        }
        $rootScope.employeeId = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: 90
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 80;
        } else {
            size = 70;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: true,
            size: 90,
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
                    dataservice.delete(id, function (rs) {
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
    }
    function loadDate() {
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
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
        //showHideSearch();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $translate) {
    $scope.groups = [{ Code: "G1", Name: "Nhóm chở rác" }, { Code: "G2", Name: "Nhóm quét đường" }];
    $scope.groupsName = [{ Code: "G1", Name: "Lê Đức Phòng" }, { Code: "G2", Name: "Nguyễn Văn Huy" }, { Code: "G2", Name: "Trần Tuấn Anh" }, { Code: "G2", Name: "Đỗ Văn Quỳnh" }, { Code: "G2", Name: "Nguyễn Văn Hiệp" }];
    //$scope.types = [{ Code: "TAXI", Name: "Taxi" }, { Code: "KHACH", Name: "Xe khách" }, { Code: "NHO", Name: "Xe chở rác loại nhỏ" }];
    $scope.form = {};
    $scope.model = {
        QrCode: '',
    };
    $scope.initData = function () {
        //$scope.employeeId = para;
        dataservice.getListRoute(function (rs) {
            rs = rs.data;
            $scope.listRoute = rs;
        });
        dataservice.getUserDefaultCar(function (rs) {
            rs = rs.data;
            $scope.managers = rs;
        });
        dataservice.getTypeCar(function (rs) {
            rs = rs.data;
            console.log(rs);
            $scope.types = rs;
        });
        dataservice.getBranchWorking(function (rs) {
            rs = rs.data;
            $scope.listBranchWorking = rs;
        });
    };
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
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
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "gender" && ($scope.model.gender != "" || $scope.model.gender != null)) {
            $scope.errorGender = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "employeekind" && $scope.model.employeekind != "") {
            $scope.errorEmployeekind = false;
        }
        //if (SelectType == "employeegroup" && $scope.model.employeegroup != "") {
        //    $scope.errorEmployeegroup = false;
        //}
        if (SelectType == "employeetype" && $scope.model.employeetype != "") {
            $scope.errorEmployeetype = false;
        }

        if (SelectType == "phone" && $scope.model.phone && $rootScope.partternPhone.test($scope.model.phone)) {
            $scope.errorphone = false;
        } else if (SelectType == "phone") {
            $scope.errorphone = true;
        }
    };
    $scope.changeQRCode = function () {
        $scope.model.QrCode = $scope.model.LicensePlate + "/" + $scope.model.Type + "/" + $scope.model.WeightItself + "/" + $scope.model.sInsurranceDuration + "/" + $scope.model.Generic + "/" + $scope.model.sYearManufacture + "/" + $scope.model.Origin;
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.COM_MSG_MAXIMUM_FILE_SIZE);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataservice.uploadImage(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Image = '/uploads/images/' + rs.Object;
                                            dataservice.insert($scope.model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                            });
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                dataservice.insert($scope.model, function (rs) {
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
    };
    function convertDatetime(date) {
        if (date != null && date != '') {
            var array = date.split('/');
            var result = array[1] + '/' + array[0] + '/' + array[2];
            return result;
        } else {
            return '';
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.LicensePlate == "" || data.LicensePlate == null) {
            $scope.errorLicensePlate = true;
            mess.Status = true;
        } else {
            $scope.errorLicensePlate = false;

        }
        return mess;
    };
    setTimeout(function () {
        var dateBirthday = new Date();
        dateBirthday.setFullYear(dateBirthday.getFullYear() - 10);
        var dateidentitycard = new Date();
        $(".date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: "01/01/1960",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $('#date-birthday').datepicker('setEndDate', dateBirthday);
        $('#date-birthday2').datepicker('setEndDate', dateBirthday);
        $('#date-identitycard').datepicker('setEndDate', dateidentitycard);

        $("#dateRegistryExpirationDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });

        $("#dateRoadExpirationDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });

        $("#dateMaintenanceNextDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $translate, para) {
    $scope.groups = [{ Code: "G1", Name: "Nhóm chở rác" }, { Code: "G2", Name: "Nhóm quét đường" }];
    $scope.groupsName = [{ Code: "G1", Name: "Lê Đức Phòng" }, { Code: "G2", Name: "Nguyễn Văn Huy" }, { Code: "G2", Name: "Trần Tuấn Anh" }, { Code: "G2", Name: "Đỗ Văn Quỳnh" }, { Code: "G2", Name: "Nguyễn Văn Hiệp" }];
    //$scope.types = [{ Code: "TAXI", Name: "Taxi" }, { Code: "KHACH", Name: "Xe khách" }, { Code: "NHO", Name: "Xe chở rác loại nhỏ" }];

    $scope.form = {};
    $scope.model = {

    }
    $scope.changeQRCode = function () {
        $scope.model.QrCode = $scope.model.LicensePlate + "/" + $scope.model.Type + "/" + $scope.model.WeightItself + "/" + $scope.model.sInsurranceDuration + "/" + $scope.model.Generic + "/" + $scope.model.sYearManufacture + "/" + $scope.model.Origin;
    }
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
        });
        dataservice.getListRoute(function (rs) {
            rs = rs.data;
            $scope.listRoute = rs;
        });
        dataservice.getUserDefaultCar(function (rs) {
            rs = rs.data;
            $scope.managers = rs;
        });
        dataservice.getTypeCar(function (rs) {
            rs = rs.data;
            console.log(rs);
            $scope.types = rs;
        })
        dataservice.getBranchWorking(function (rs) {
            rs = rs.data;
            $scope.listBranchWorking = rs;
        })

    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
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
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "gender" && ($scope.model.gender != "" || $scope.model.gender != null)) {
            $scope.errorGender = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "employeekind" && $scope.model.employeekind != "") {
            $scope.errorEmployeekind = false;
        }
        //if (SelectType == "employeegroup" && $scope.model.employeegroup != "") {
        //    $scope.errorEmployeegroup = false;
        //}
        if (SelectType == "employeetype" && $scope.model.employeetype != "") {
            $scope.errorEmployeetype = false;
        }

        if (SelectType == "phone" && $scope.model.phone && $rootScope.partternPhone.test($scope.model.phone)) {
            $scope.errorphone = false;
        } else if (SelectType == "phone") {
            $scope.errorphone = true;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        //if ($scope.editform.validate() && validationSelect($scope.model).Status == false) {
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                } else {
                    var fileUpload = $("#file").get(0);
                    var reader = new FileReader();
                    reader.readAsDataURL(fileUpload.files[0]);
                    reader.onload = function (e) {
                        //Initiate the JavaScript Image object.
                        var image = new Image();
                        //Set the Base64 string return from FileReader as source.
                        image.src = e.target.result;
                        image.onload = function () {
                            //Determine the Height and Width.
                            var height = this.height;
                            var width = this.width;
                            if (width > 5000 || height > 5000) {
                                App.toastrError(caption.COM_MSG_MAXIMUM_FILE_SIZE);
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataservice.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        $scope.model.Image = '/uploads/images/' + rs.Object;
                                        dataservice.update($scope.model, function (rs) {
                                            rs = rs.data;
                                            if (rs.Error) {
                                                App.toastrError(rs.Title);
                                            } else {
                                                App.toastrSuccess(rs.Title);
                                                $uibModalInstance.close();
                                            }
                                        });
                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {
            dataservice.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
            //}
        }
    }
    function convertDatetime(date) {
        if (date != null && date != '') {
            var array = date.split('/');
            var result = array[1] + '/' + array[0] + '/' + array[2];
            return result;
        } else {
            return '';
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.LicensePlate == "" || data.LicensePlate == null) {
            $scope.errorLicensePlate = true;
            mess.Status = true;
        } else {
            $scope.errorLicensePlate = false;

        }
        return mess;
    };
    setTimeout(function () {
        var dateBirthday = new Date();
        dateBirthday.setFullYear(dateBirthday.getFullYear() - 10);
        var dateidentitycard = new Date();

        $(".date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: "01/01/1960",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $('#date-birthday').datepicker('setEndDate', dateBirthday);
        $('#date-birthday2').datepicker('setEndDate', dateBirthday);
        $('#date-identitycard').datepicker('setEndDate', dateidentitycard);
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);

});
app.controller('trashCarTabHistoryRun', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        //Tax: 0
    }
    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];

    $scope.priceOptionAgent = [
        { Code: "PRICE_COST_CATELOGUE", Name: "Giá đại lý catalogue" },
        { Code: "PRICE_COST_AIRLINE", Name: "Giá đại lý đường bay" },
        { Code: "PRICE_COST_SEA", Name: "Giá đại lý đường biển" }
    ];
    $scope.priceOptionRetail = [
        { Code: "PRICE_RETAIL_BUILD", Name: "Giá bán lẻ có thi công" },
        { Code: "PRICE_RETAIL_BUILD_AIRLINE", Name: "Giá bán lẻ có thi công bay" },
        { Code: "PRICE_RETAIL_BUILD_SEA", Name: "Giá bán lẻ có thi công kho,biển" },
        { Code: "PRICE_RETAIL_NO_BUILD", Name: "Giá bán lẻ không thi công" },
        { Code: "PRICE_RETAIL_NO_BUILD_AIRLINE", Name: "Giá bán lẻ không thi công bay" },
        { Code: "PRICE_RETAIL_NO_BUILD_SEA", Name: "Giá bán lẻ không thi công kho, biển" }
    ];
    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TrashCar/JTableHistoryRun",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                //d.ContractCode = $rootScope.ContractCode;
                d.Id = $rootScope.Id;

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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NameRoute').withTitle('{{"TRC_LIST_COL_ROUTE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeStart').withTitle('{{"TRC_LIST_COL_TIME_START" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeEnd').withTitle('{{"TRC_LIST_COL_END_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NameDriver').withTitle('{{"TRC_LIST_COL_DRIVER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Km').withTitle('{{"TRC_LIST_COL_KM" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"TRC_LIST_COL_STATUS" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Mass').withTitle('{{"TRC_LIST_COL_MASS" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"TRC_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Act').withTitle('{{"TRC_LIST_COL_ACT" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"TRC_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));
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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    }

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {

    }
    $scope.edit = function (id) {

    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservice.deleteProductInContract(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result.Object);
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
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.init = function () {

        $scope.model = $scope.ListHistoryRun;
    }
    $scope.init();
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
    }
    $scope.save = function (id) {

    }
});
app.controller('trashCarTabWarning', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        //Tax: 0
    }
    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];

    $scope.priceOptionAgent = [
        { Code: "PRICE_COST_CATELOGUE", Name: "Giá đại lý catalogue" },
        { Code: "PRICE_COST_AIRLINE", Name: "Giá đại lý đường bay" },
        { Code: "PRICE_COST_SEA", Name: "Giá đại lý đường biển" }
    ];
    $scope.priceOptionRetail = [
        { Code: "PRICE_RETAIL_BUILD", Name: "Giá bán lẻ có thi công" },
        { Code: "PRICE_RETAIL_BUILD_AIRLINE", Name: "Giá bán lẻ có thi công bay" },
        { Code: "PRICE_RETAIL_BUILD_SEA", Name: "Giá bán lẻ có thi công kho,biển" },
        { Code: "PRICE_RETAIL_NO_BUILD", Name: "Giá bán lẻ không thi công" },
        { Code: "PRICE_RETAIL_NO_BUILD_AIRLINE", Name: "Giá bán lẻ không thi công bay" },
        { Code: "PRICE_RETAIL_NO_BUILD_SEA", Name: "Giá bán lẻ không thi công kho, biển" }
    ];

    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TrashCar/JTableWarning",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Id = $rootScope.ContractCode;
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"TRC_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WarningType').withTitle('{{"TRC_LIST_COL_TYPE_WARNING" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').withTitle('{{"TRC_LIST_COL_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Driver').withTitle('{{"TRC_LIST_COL_DRIVER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GPS').withTitle('{{"TRC_LIST_COL_GPS_POINT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GPSText').withTitle('{{"TRC_LIST_COL_POINT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"TRC_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));

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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {

    }
    $scope.edit = function (id) {

    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservice.deleteProductInContract(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result.Object);
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
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.init = function () {

    }
    $scope.init();
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
    }
    $scope.save = function (id) {

    }
});
app.controller('trashCarTabQuota', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        //Tax: 0
    }
    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];

    $scope.priceOptionAgent = [
        { Code: "PRICE_COST_CATELOGUE", Name: "Giá đại lý catalogue" },
        { Code: "PRICE_COST_AIRLINE", Name: "Giá đại lý đường bay" },
        { Code: "PRICE_COST_SEA", Name: "Giá đại lý đường biển" }
    ];
    $scope.priceOptionRetail = [
        { Code: "PRICE_RETAIL_BUILD", Name: "Giá bán lẻ có thi công" },
        { Code: "PRICE_RETAIL_BUILD_AIRLINE", Name: "Giá bán lẻ có thi công bay" },
        { Code: "PRICE_RETAIL_BUILD_SEA", Name: "Giá bán lẻ có thi công kho,biển" },
        { Code: "PRICE_RETAIL_NO_BUILD", Name: "Giá bán lẻ không thi công" },
        { Code: "PRICE_RETAIL_NO_BUILD_AIRLINE", Name: "Giá bán lẻ không thi công bay" },
        { Code: "PRICE_RETAIL_NO_BUILD_SEA", Name: "Giá bán lẻ không thi công kho, biển" }
    ];

    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TrashCar/JTableQuota",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quota').withTitle('{{"TRC_LIST_COL_QUOTA" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"TRC_LIST_COL_VALUE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitPrice').withTitle('{{"TRC_LIST_COL_UNIT_PRICE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"TRC_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));

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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {

    }
    $scope.edit = function (id) {

    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservice.deleteProductInContract(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result.Object);
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
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.init = function () {

    }
    $scope.init();
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
    }
    $scope.save = function (id) {

    }
});
app.controller('trashCarTabActualCosts', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        //Tax: 0
    }
    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];

    $scope.priceOptionAgent = [
        { Code: "PRICE_COST_CATELOGUE", Name: "Giá đại lý catalogue" },
        { Code: "PRICE_COST_AIRLINE", Name: "Giá đại lý đường bay" },
        { Code: "PRICE_COST_SEA", Name: "Giá đại lý đường biển" }
    ];
    $scope.priceOptionRetail = [
        { Code: "PRICE_RETAIL_BUILD", Name: "Giá bán lẻ có thi công" },
        { Code: "PRICE_RETAIL_BUILD_AIRLINE", Name: "Giá bán lẻ có thi công bay" },
        { Code: "PRICE_RETAIL_BUILD_SEA", Name: "Giá bán lẻ có thi công kho,biển" },
        { Code: "PRICE_RETAIL_NO_BUILD", Name: "Giá bán lẻ không thi công" },
        { Code: "PRICE_RETAIL_NO_BUILD_AIRLINE", Name: "Giá bán lẻ không thi công bay" },
        { Code: "PRICE_RETAIL_NO_BUILD_SEA", Name: "Giá bán lẻ không thi công kho, biển" }
    ];

    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TrashCar/JTableActualCosts",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActualCosts').withTitle('{{"TRC_LIST_COL_QUOTA" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle('{{"TRC_LIST_COL_VALUE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').withTitle('{{"TRC_LIST_COL_DATE_WORKING" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Sender').withTitle('{{"TRC_LIST_COL_SENDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Receiver').withTitle('{{"TRC_LIST_COL_RECEIVER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"TRC_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"TRC_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));

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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {

    }
    $scope.edit = function (id) {

    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservice.deleteProductInContract(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result.Object);
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
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.init = function () {

    }
    $scope.init();
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
    }
    $scope.save = function (id) {

    }
});
app.controller('trashCarTabMaintenanceHistory', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        //Tax: 0
    }
    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];

    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TrashCar/JTableMaintenanceHistory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Maintenance').withTitle('{{"TRC_LIST_COL_QUOTA" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"TRC_LIST_COL_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"TRC_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').withTitle('{{"TRC_LIST_COL_DATE_WORKING" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"TRC_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Address').withTitle('{{"TRC_LIST_COL_PLACE_SCBD" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"TRC_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"TRC_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));

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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {

    }
    $scope.edit = function (id) {

    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservice.deleteProductInContract(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result.Object);
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
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.init = function () {

    }
    $scope.init();
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
    }
    $scope.save = function (id) {

    }
});
app.controller('trashCarAttribute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        AttrCode: '',
        AttrValue: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TrashCar/JTableAttribute",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AssetCode = $rootScope.AssetCode;
                d.AttrCode = $scope.model.AttrCode;
                d.AttrValue = $scope.model.AttrValue;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{"TRC_LIST_COL_ATTR_CODE" | translate}}').withOption('sClass', 'w25').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('value').withTitle('{{"TRC_LIST_COL_VALUE"| translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"TRC_LIST_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }

    $scope.reload = function () {
        reloadData(true);
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

    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addAssetAttribute.html',
            controller: 'addAssetAttribute',
            backdrop: true,
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/editAssetAttribute.html',
            controller: 'editAssetAttribute',
            backdrop: true,
            size: '35',
            resolve: {
                para: function () {
                    return id;
                }
            }

        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteAttr(id, function (rs) {
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
            $scope.reload();
        }, function () {
        });


    }
});
//app.controller('trashCarTabFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
//    var vm = $scope;
//    $scope.selected = [];
//    $scope.selectAll = false;
//    $scope.toggleAll = toggleAll;
//    $scope.toggleOne = toggleOne;
//    $scope.model = {
//        AttrCode: '',
//        AttrValue: ''
//    }
//    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
//    vm.dtOptions = DTOptionsBuilder.newOptions()
//        .withOption('ajax', {
//            url: "/Admin/Asset/JTableAttr",
//            beforeSend: function (jqXHR, settings) {
//                App.blockUI({
//                    target: "#contentMain",
//                    boxed: true,
//                    message: 'loading...'
//                });
//            },
//            type: 'POST',
//            data: function (d) {
//                d.AssetCode = $rootScope.AssetCode;
//                d.AttrCode = $scope.model.AttrCode;
//                d.AttrValue = $scope.model.AttrValue;
//            },
//            complete: function () {
//                App.unblockUI("#contentMain");
//            }
//        })
//        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
//        .withDataProp('data').withDisplayLength(5)
//        .withOption('order', [1, 'asc'])
//        .withOption('serverSide', true)
//        .withOption('headerCallback', function (header) {
//            if (!$scope.headerCompiled) {
//                $scope.headerCompiled = true;
//                $compile(angular.element(header).contents())($scope);
//            }
//        })
//        .withOption('initComplete', function (settings, json) {
//        })
//        .withOption('createdRow', function (row, data, dataIndex) {
//            const contextScope = $scope.$new(true);
//            contextScope.data = data;
//            contextScope.contextMenu = $scope.contextMenu;
//            $compile(angular.element(row))($scope);
//            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
//        });
//    vm.dtColumns = [];
//    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
//        $scope.selected[full.id] = false;
//        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractFileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
//    }).withOption('sClass', 'hidden'));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{"TRC_LIST_COL_FILE_NAME" | translate}}').renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"TRC_LIST_COL_DATE_CREATED" | translate}}').renderWith(function (data, type) {
//        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"TRC_LIST_COL_SAVE" | translate}}').renderWith(function (data, type, full) {
//        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{"TRC_LIST_COL_DESCRIPTION" | translate}}').notSortable().renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Url').withTitle('{{"TRC_LIST_COL_VIEW_ONL" | translate}}').renderWith(function (data, type, full) {
//        var idxDot = data.lastIndexOf(".") + 1;
//        var extFile = data.substr(idxDot, data.length).toLowerCase();
//        var file = ['XLSX', 'XLS', 'TXT', 'DOCX', 'DOC', 'PDF', 'PPS', 'PPTX', 'PPT',];
//        var image = ['JPG', 'PNG', 'TIF', 'TIFF'];
//        if (file.indexOf(extFile.toUpperCase()) != -1) {
//            return "<a ng-click='viewFile(" + full.Id + ")'>Xem trực tuyến</a>";

//        } else if (image.indexOf(extFile.toUpperCase()) != -1) {
//            return "<a ng-click='viewImage(" + full.Id + ")'>Xem trực tuyến</a>";
//        }
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{"TRC_LIST_COL_TYPE_FILE" | translate}}').renderWith(function (data, type, full) {
//        if (data == "SHARE") {
//            return "<label class='text-primary'>Tệp được chia sẻ</label>";
//        } else {
//            return "Tệp gốc";
//        }
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"TRC_LIST_COL_ACTION" | translate}}').withOption('sClass', 'w75').renderWith(function (data, type, full) {
//        if (full.TypeFile == "SHARE") {
//            return '<a href="' + full.Url + '" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
//        } else {
//            return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
//                '<a href="' + full.Url + '" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>' +
//                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
//        }
//    }));
//    vm.reloadData = reloadData;
//    vm.dtInstance = {};

//    function reloadData(resetPaging) {
//        vm.dtInstance.reloadData(callback, resetPaging);
//    }

//    $scope.reload = function () {
//        reloadData(true);
//    }
//    function toggleAll(selectAll, selectedItems) {
//        for (var id in selectedItems) {
//            if (selectedItems.hasOwnProperty(id)) {
//                selectedItems[id] = selectAll;
//            }
//        }
//    }
//    function toggleOne(selectedItems) {
//        for (var id in selectedItems) {
//            if (selectedItems.hasOwnProperty(id)) {
//                if (!selectedItems[id]) {
//                    vm.selectAll = false;
//                    return;
//                }
//            }
//        }
//        vm.selectAll = true;
//    }

//    function callback(json) {

//    }

//    $scope.search = function () {
//        reloadData(true);
//    }
//    $scope.add = function () {
//        var modalInstance = $uibModal.open({
//            animation: true,
//            templateUrl: ctxfolder + '/addAssetAttribute.html',
//            controller: 'addAssetAttribute',
//            backdrop: true,
//            size: '35'
//        });
//        modalInstance.result.then(function (d) {
//            $scope.reload()
//        }, function () { });
//    }
//    $scope.edit = function (id) {
//        var modalInstance = $uibModal.open({
//            animation: true,
//            templateUrl: ctxfolder + '/editAssetAttribute.html',
//            controller: 'editAssetAttribute',
//            backdrop: true,
//            size: '35',
//            resolve: {
//                para: function () {
//                    return id;
//                }
//            }

//        });
//        modalInstance.result.then(function (d) {
//            $scope.reload()
//        }, function () { });
//    }
//    $scope.delete = function (id) {
//        var modalInstance = $uibModal.open({
//            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
//            windowClass: "message-center",
//            controller: function ($scope, $uibModalInstance) {
//                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
//                $scope.ok = function () {
//                    dataservice.deleteAttr(id, function (rs) {rs=rs.data;
//                        if (rs.Error) {
//                            App.toastrError(rs.Title);
//                        } else {
//                            App.toastrSuccess(rs.Title);
//                            $uibModalInstance.close();
//                        }
//                    });
//                };

//                $scope.cancel = function () {
//                    $uibModalInstance.dismiss('cancel');
//                };
//            },
//            size: '25',
//        });
//        modalInstance.result.then(function (d) {
//            $scope.reload();
//        }, function () {
//        });


//    }
//});
app.controller('trashCarTabRegisterCars', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        //Tax: 0
    }
    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];

    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TrashCar/JTableRegisterCars",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Maintenance').withTitle('{{"TRC_LIST_COL_QUOTA" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"TRC_LIST_COL_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"TRC_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').withTitle('{{"TRC_LIST_COL_DATE_WORKING" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"TRC_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Address').withTitle('{{"TRC_LIST_COL_PLACE_SCBD" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"TRC_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"TRC_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));

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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {

    }
    $scope.edit = function (id) {

    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservice.deleteProductInContract(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result.Object);
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
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.init = function () {

    }
    $scope.init();
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
    }
    $scope.save = function (id) {

    }
});
app.controller('trashCarTabWorkSpace', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {

    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TrashCar/GetListWorkSpace/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CarCode = $rootScope.CarCode;
                //d.ActCode = $scope.model.ActCode;
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {

                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    //$scope.model.IdType = data.Id;
                    //$scope.model.Code = data.Code;
                    //$scope.model.Value = data.Value;
                    //for (var i = 0; i < $scope.ListActivityCar.length; i++) {
                    //    $scope.model.ActCode = $scope.ListActivityCar[i].ActCode;
                    //    $scope.model.Priority = $scope.ListActivityCar[i].Priority;
                    //}
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            //$scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected, $event)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjTypeName').withTitle('Kiểu đối tượng').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjectCode').withTitle('Mã đối tượng').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjectCodeName').withTitle('Tên đối tượng').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('').notSortable().renderWith(function (data, type, full, meta) {
        return '<button ng-click="deleteCode(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'nowrap tcenter  dataTable-10per'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {

        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataservice.GetListCatObjectType(function (rs) {
            rs = rs.data;
            $scope.listCatObjectType = rs;
        })
    }
    $scope.ChangObjType = function (data1) {
        console.log(data1)

        dataservice.GetObjectForType(data1, function (rs) {
            rs = rs.data;
            console.log(rs)
            $scope.listObj = rs.Object;
        })
    };
    $scope.addCode = function () {
        $scope.model.CarCode = $rootScope.CarCode;
        dataservice.InsertWorkSpace($scope.model, function (rs) {
            rs = rs.data;
            console.log(rs)
            if (rs.Error) {
                App.toastrError(rs.Title);
                reloadData(true);
                //$scope.reloadNoResetPage();
            }
            else {
                App.toastrSuccess(rs.Title);
                reloadData(true);
                //$scope.reloadNoResetPage();
            }
        })
    }
    $scope.deleteCode = function (id) {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {

                    dataservice.DeleteWorkSpace(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            $uibModalInstance.close();
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
            //$scope.reloadNoResetPage();
            reloadData(true);
        }, function () {
        });
    }
    $scope.init();
});


