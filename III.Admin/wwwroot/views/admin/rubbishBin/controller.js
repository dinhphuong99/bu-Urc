﻿var ctxfolder = "/views/admin/RubbishBin";
var ctxfolderCommonSetting = "/views/admin/RubbishBin";
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
            debugger
            $http.post('/Admin/RubbishBin/Insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/RubbishBin/Update', data).then(callback);
        },

        uploadFile: function (data, callback) {
            submitFormUploadFile('/Admin/RubbishBin/UploadFile/', data, callback);
        },
        uploadImage: function (data, callback) {
            submitFormUploadFile('/Admin/RubbishBin/UploadImage/', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RubbishBin/Delete?id=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/RubbishBin/GetItem?id=' + data).then(callback);
        },
        getBinStatus: function (callback) {
            $http.post('/Admin/RubbishBin/GetBinStatus').then(callback);
        },
        getBinType: function (callback) {
            $http.post('/Admin/RubbishBin/GetBinType').then(callback);
        },
        getBinMaterial: function (callback) {
            $http.post('/Admin/RubbishBin/GetBinMaterial').then(callback);
        },
        getBinStatus: function (callback) {
            $http.post('/Admin/RubbishBin/GetBinStatus').then(callback);
        },
        getCreatedUser: function (callback) {
            $http.post('/Admin/RubbishBin/GetCreatedUser').then(callback);
        },
        getManageUser: function (callback) {
            $http.post('/Admin/RubbishBin/GetManageUser').then(callback);
        },
        getNode: function (callback) {
            $http.post('/Admin/RubbishBin/GetNode').then(callback);
        },
        getRoute: function (callback) {
            $http.post('/Admin/RubbishBin/GetRoute').then(callback);
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
                Permanent_Address: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RESIDENT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_RESIDENT
                },
                //birthday: {
                //    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_DATE_OF_BIRTH,
                //},
                Now_Address: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_ADDRESS,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_ADDRESS
                },

                fullname: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_FULL_NAME,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_NAME
                },
                nation: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_NATIONANITY,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_NATIONANITY
                },
                phone: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_PHONE,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_PHONE
                },
                birthday: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_DATE_OF_BIRTH,
                    maxlength: caption.HR_HR_MAN_CURD_ERR_HR_MAN_BIRTHDAY
                },
                permanentresidence: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RESIDENT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_RESIDENT
                },
                phone: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_PHONE,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_PHONE
                },
                educationallevel: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_EDUCATION_LEVEL,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_CHARACTER_EDUCATIONAL_LEVEL
                },
                health: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_HEALTH,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_HEALTH
                },
                identitycard: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_PASSPORT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_PASSPORT
                },
                identitycardplace: {
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_ISSUED
                },
                taxcode: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_HEALTH,
                    maxlength: caption.HR_HR_MAN_CURD_ERR_HR_MAN_DAY_RANGE
                },
                bank: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_BANK_ACCOUNT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_BANK_ACCOUNT
                },
                accountnumber: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_NUMBER_ACCOUNT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_NUMBER_ACCOUNT
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
                    digits: caption.HR_HR_MAN_CURD_ERR_HR_MAN_TAX_CODE,
                },
                accountnumber: {
                    digits: caption.HR_HR_MAN_CURD_ERR_HR_MAN_NUMBER_ACCOUNT,
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
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RESIDENT
                },
                Now_Address: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_ADDRESS
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
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CONTRACTNAME,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_NAME_RELATIVES
                },
                Relationship: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RELATIONSHIP,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_RELATIONSHIP
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
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_NAME_TRAINING,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_TRAINING_NAME
                },
                Result: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RESULT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_RESULT
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
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_START_DAY,
                },
                End_Time_Workprocess: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_END_DAY,
                },
                Wage_Level: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_SALARY_LEVEL,
                },
                Salary_Ratio: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_COEFFICIENTS,
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
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CONTRACT_NUMBER,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_CONTRACT_NUMBER
                },
                Salary: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_SALALY,
                },
                Insuarance: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_INSURRANCE_LEVEL,
                },
                Start_Time: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_SART_TIME,
                },
                End_Time: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_END_TIME,
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
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_NAME_JOB,
                    maxlength: " "
                },
                Working_Process: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_PROCEDURE,
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

    $translateProvider.useUrlLoader('/Admin/RubbishBin/Translation');
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
    $scope.binStatuss = [];
    $scope.binTypes = [];
    $scope.binMaterials = [];
    $scope.createdUsers = [];
    $scope.manageUsers = [];
    $scope.nodes = [];
    $scope.routes = [];
    $scope.model = {
        Name:"",
        Material:"",
        Status:"",
        BinType:"",
        CreatedBy:"",
        WorkerManage:null
    };
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.treeDataunit = [];
    $scope.positionData = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RubbishBin/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.BinCode = $scope.model.BinCode;
                d.Status = $scope.model.Status;
                d.WorkerManage = $scope.model.WorkerManage;
                d.RouteCode = $scope.model.RouteCode;
                d.NodeCode = $scope.model.NodeCode;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('BinName').withTitle('{{"RB_LIST_COL_BIN_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BinType').withTitle('{{"RB_LIST_COL_TYPE_RUB" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0  dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Material').withTitle('{{"RB_LIST_COL_MATERIAL" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"RB_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'nowrap dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PercentageUsed').withTitle('{{"RB_LIST_COL_PERCENT_USE" | translate}} (%)').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-w80'));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('Volume').withTitle('{{"RB_LIST_COL_VOLUME" | translate}}(m3)').renderWith(function (data, type) {
        //return data;
        return data != "" ? $filter('currency')(data, '', 2) : null;
    }).withOption('sClass', 'dataTable-pr0  dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Structure').withTitle('{{"RB_LIST_COL_STRUCTURE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0  dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Manager').withTitle('{{"RB_LIST_COL_MANAGER" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-w80'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LastGps').withTitle('{{"RB_LIST_COL_LAST_GPS" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CurGps').withTitle('{{"RB_LIST_COL_CURRENT_GPS" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"RB_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-w80'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"RB_LIST_COL_ACTION" | translate}}').notSortable().renderWith(function (data, type, full, meta) {
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
            windowClass: 'top-10',
            size: 45,
            resolve: {
                para: function () {
                    return '';
                }
            }
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
            windowClass:'top-10',
            size: 45,
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
        loadDate();
        showHideSearch();
        dataservice.getBinStatus(function (rs) {rs=rs.data;
            $scope.binStatuss = rs;
        });
        dataservice.getBinType(function (rs) {rs=rs.data;
            $scope.binTypes = rs;
        });
        dataservice.getBinMaterial(function (rs) {rs=rs.data;
            $scope.binMaterials = rs;
        });
        dataservice.getCreatedUser(function (rs) {rs=rs.data;
            $scope.createdUsers = rs;
        });
        dataservice.getManageUser(function (rs) {rs=rs.data;
            $scope.manageUsers = rs;
        });
        dataservice.getNode(function (rs) {rs=rs.data;
            $scope.nodes = rs;
        });
        dataservice.getRoute(function (rs) {rs=rs.data;
            $scope.routes = rs;
        });
    }, 200);
   
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $translate) {
    $scope.binStatuss = [];
    $scope.binTypes = [];
    $scope.binMaterials = [];
    $scope.manageUsers = [];

    $scope.model = {
        Status: "BIN_STATUS_GOOG",
        BinType: "BIN_TYPE_VERTICAL",
        Material: "BIN_MATERIAL_PLASTIC",
        QrCode:'',
    }
    $scope.initData = function () {
        dataservice.getBinStatus(function (rs) {rs=rs.data;
            $scope.binStatuss = rs;
        });
        dataservice.getBinType(function (rs) {rs=rs.data;
            $scope.binTypes = rs;
        });
        dataservice.getBinMaterial(function (rs) {rs=rs.data;
            $scope.binMaterials = rs;
        });
        dataservice.getCreatedUser(function (rs) {rs=rs.data;
            $scope.createdUsers = rs;
        });
        dataservice.getManageUser(function (rs) {rs=rs.data;
            $scope.manageUsers = rs;
        });
        dataservice.getNode(function (rs) {rs=rs.data;
            $scope.nodes = rs;
        });
        dataservice.getRoute(function (rs) {rs=rs.data;
            $scope.routes = rs;
        });
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
        debugger
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
                                    dataservice.uploadImage(data, function (rs) {rs=rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Image = '/uploads/images/' + rs.Object;
                                            dataservice.insert($scope.model, function (rs) {rs=rs.data;
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
                dataservice.insert($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
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
        if (data.BinCode == "" || data.BinCode == null) {
            $scope.errorBinCode = true;
            mess.Status = true;
        } else {
            $scope.errorBinCode = false;

        }
        if (data.BinName == "" || data.BinName == null) {
            $scope.errorBinName = true;
            mess.Status = true;
        } else {
            $scope.errorBinName = false;
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
    $scope.change = function (type) {
        if (type == "binCode") {
            if ($scope.model.BinCode == null || $scope.model.BinCode == "" || $scope.model.BinCode == undefined)
                $scope.errorBinCode = true;
            else
                $scope.errorBinCode = false;

        }
        if (type == "binName") {
            if ($scope.model.BinName == null || $scope.model.BinName == "" || $scope.model.BinName == undefined)
                $scope.errorBinName = true;
            else
                $scope.errorBinName = false;
        }
    }
    $scope.changeQRCode = function () {
        $scope.model.QrCode = $scope.model.Material + "/" + $scope.model.WorkerManage + "/" + $scope.model.BinType + "/" + $scope.model.Volume + "/" + $scope.model.Structure + "/" + $scope.model.Status;
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $translate, para) {
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {rs=rs.data;
            debugger
            $scope.model = rs;
        });
        dataservice.getBinStatus(function (rs) {rs=rs.data;
            $scope.binStatuss = rs;
        });
        dataservice.getBinType(function (rs) {rs=rs.data;
            $scope.binTypes = rs;
        });
        dataservice.getBinMaterial(function (rs) {rs=rs.data;
            $scope.binMaterials = rs;
        });
        dataservice.getCreatedUser(function (rs) {rs=rs.data;
            $scope.createdUsers = rs;
        });
        dataservice.getManageUser(function (rs) {rs=rs.data;
            $scope.manageUsers = rs;
        });
        dataservice.getNode(function (rs) {rs=rs.data;
            $scope.nodes = rs;
        });
        dataservice.getRoute(function (rs) {rs=rs.data;
            $scope.routes = rs;
        });
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
                                    dataservice.uploadImage(data, function (rs) {rs=rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Image = '/uploads/images/' + rs.Object;
                                            dataservice.update($scope.model, function (rs) {rs=rs.data;
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
                dataservice.update($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
                //}
            }
        
        //var fileName = $('input[type=file]').val();
        //var idxDot = fileName.lastIndexOf(".") + 1;
        //var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        //if (extFile !== "") {
        //    if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
        //        App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
        //    } else {
        //        var fi = document.getElementById('file');
        //        var fsize = (fi.files.item(0).size) / 1024;
        //        if (fsize > 1024) {
        //            App.toastrError(caption.HR_HR_MAN_CURD_VALIDATE_SIZE_FILE_MAX);
        //        } else {
        //            var fileUpload = $("#file").get(0);
        //            var reader = new FileReader();
        //            reader.readAsDataURL(fileUpload.files[0]);
        //            reader.onload = function (e) {
        //                //Initiate the JavaScript Image object.
        //                var image = new Image();
        //                //Set the Base64 string return from FileReader as source.
        //                image.src = e.target.result;
        //                image.onload = function () {
        //                    //Determine the Height and Width.
        //                    var height = this.height;
        //                    var width = this.width;
        //                    if (width > 5000 || height > 5000) {
        //                        App.toastrError(caption.HR_HR_MAN_CURD_VALIDATE_SIZE_IMG_MAX);
        //                    } else {
        //                        var data = new FormData();
        //                        file = fileUpload.files[0];
        //                        data.append("FileUpload", file);
        //                        dataservice.uploadImage(data, function (rs) {rs=rs.data;
        //                            if (rs.Error) {
        //                                App.toastrError(rs.Title);
        //                                return;
        //                            }
        //                            else {
        //                                $scope.model.Image = '/uploads/images/' + rs.Object;
        //                                dataservice.update($scope.model, function (rs) {rs=rs.data;
        //                                    if (rs.Error) {
        //                                        App.toastrError(rs.Title);
        //                                    } else {
        //                                        App.toastrSuccess(rs.Title);
        //                                        $uibModalInstance.close();
        //                                    }
        //                                });
        //                            }
        //                        })
        //                    }
        //                };
        //            }
        //        }
        //    }
        //} else {
        //    dataservice.update($scope.model, function (rs) {rs=rs.data;
        //        if (rs.Error) {
        //            App.toastrError(rs.Title);
        //        } else {
        //            App.toastrSuccess(rs.Title);
        //            $uibModalInstance.close();
        //        }
        //    });
        //    //}
        //}
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
        if (data.BinCode == "" || data.BinCode == null) {
            $scope.errorBinCode = true;
            mess.Status = true;
        } else {
            $scope.errorBinCode = false;

        }
        if (data.BinName == "" || data.BinName == null) {
            $scope.errorBinName = true;
            mess.Status = true;
        } else {
            $scope.errorBinName = false;
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
    $scope.changeQRCode = function () {
        $scope.model.QrCode = $scope.model.Material + "/" + $scope.model.WorkerManage + "/" + $scope.model.BinType + "/" + $scope.model.Volume + "/" + $scope.model.Structure + "/" + $scope.model.Status;
    }
});




