var ctxfolderSupplier = "/views/admin/supplier";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var app = angular.module('App_ESEIM_SUPPLIER', ['App_ESEIM_CARD_JOB', "ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "pascalprecht.translate", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ui.tinymce', 'dynamicNumber', 'ngTagsInput']);

app.directive('number', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$parsers.push(function (input) {
                if (input == undefined) return ''
                var inputNumber = input.toString().replace(/[^0-9]/g, '');
                if (inputNumber != input) {
                    ctrl.$setViewValue(inputNumber);
                    ctrl.$render();
                }
                return inputNumber;
            });
        }
    };
});
app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);
app.directive('customOnChangeSupplier', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeSupplier);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});
app.factory('dataserviceSupplier', function ($http) {
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
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: data
        }

        $http(req).then(callback);
    };
    return {
        //common
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getSupplierArea: function (callback) {
            $http.post('/Admin/Supplier/getListSupplierArea').then(callback);
        },
        getSupplierType: function (callback) {
            $http.post('/Admin/Supplier/getListSupplierType').then(callback);
        },
        getSupplierRole: function (callback) {
            $http.post('/Admin/Supplier/getListSupplierRole').then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/CardJob/GetCurrency').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/Supplier/UploadImage/', data, callback);
        },
        getSupplierGroup: function (callback) {
            $http.post('/Admin/Supplier/GetSupplierGroup/').then(callback);
        },
        getSupplierStatus: function (callback) {
            $http.post('/Admin/Supplier/GetSupplierStatus/').then(callback);
        },

        //supplier
        insert: function (data, callback) {
            $http.post('/Admin/Supplier/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Supplier/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/Supplier/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/Supplier/GetItem/' + data).then(callback);
        },
        getItemAdd: function (data, callback) {
            $http.get('/Admin/Supplier/GetItemAdd?code=' + data).then(callback);
        },
        getListSupplierArea: function (callback) {
            $http.get('/Admin/Supplier/GetListSupplierArea').then(callback);
        },
        getInfoWithTaxCode: function (data, callback) {
            $http.get('/Admin/Customer/GetInfoWithTaxCode?taxCode=' + data).then(callback);
        },

        //file
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getSupplierFile: function (data, callback) {
            $http.post('/Admin/Supplier/GetSupplierFile/' + data).then(callback);
        },
        insertSupplierFile: function (data, callback) {
            submitFormUpload('/Admin/Supplier/InsertSupplierFile/', data, callback);
        },
        updateSupplierFile: function (data, callback) {
            submitFormUpload('/Admin/Supplier/UpdateSupplierFile/', data, callback);
        },
        deleteSupplierFile: function (data, callback) {
            $http.post('/Admin/Supplier/DeleteSupplierFile/' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        getSuggestionsSupplierFile: function (data, callback) {
            $http.get('/Admin/Supplier/GetSuggestionsSupplierFile?supplierCode=' + data).then(callback);
        },
        getListObjectTypeShare: function (callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectTypeShare/').then(callback);
        },
        getListObjectCode: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectCode?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListFileWithObject: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileWithObject?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListObjectShare: function (objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectShare?objectCodeShared=' + objectCodeShared + '&objectTypeShared=' + objectTypeShared + '&objectCode=' + objectCode + '&objectType=' + objectType + '&fileCode=' + fileCode).then(callback);
        },
        insertFileShare: function (data, callback) {
            $http.post('/Admin/FileObjectShare/InsertFileShare/', data).then(callback);
        },
        deleteObjectShare: function (data, callback) {
            $http.get('/Admin/FileObjectShare/DeleteObjectShare?id=' + data).then(callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },

        //contact
        insertContact: function (data, callback) {
            $http.post('/Admin/Supplier/InsertContact/', data).then(callback);
        },
        deleteContact: function (data, callback) {
            $http.post('/Admin/Supplier/DeleteContact/' + data).then(callback);
        },
        updateContact: function (data, callback) {
            $http.post('/Admin/Supplier/UpdateContact/', data).then(callback);
        },
        getContact: function (data, callback) {
            $http.get('/Admin/Supplier/GetContact/' + data).then(callback);
        },

        //extend
        insertExtend: function (data, callback) {
            $http.post('/Admin/Supplier/InsertExtend/', data).then(callback);
        },
        deleteExtend: function (data, callback) {
            $http.post('/Admin/Supplier/DeleteExtend/' + data).then(callback);
        },
        updateExtend: function (data, callback) {
            $http.post('/Admin/Supplier/UpdateExtend/', data).then(callback);
        },
        getExtend: function (data, callback) {
            $http.get('/Admin/Supplier/GetExtend/' + data).then(callback);
        },

        //CommonSetting
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
    }
});

app.controller('Ctrl_ESEIM_SUPPLIER', function ($scope, $rootScope, $compile, $uibModal, dataserviceSupplier, $translate, $cookies) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    //$rootScope.permissionSupplier = PERMISSION_SUPPLIER;
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        //caption = caption[culture];
        //$.extend($.validator.messages, {
        //    min: caption.COM_VALIDATE_VALUE_MIN,
        //    //max: 'Max some message {0}'
        //});
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
        $rootScope.checkDataSupplier = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            var partternTelephone = /[0-9]/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.SupCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_SUPCODE, "<br/>");
            }
            return mess;
        }
        $rootScope.checkDataMore = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ext_code)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
            }
            return mess;
        }
        $rootScope.checkDataContact = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ext_code)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
            }
            return mess;
        }
        $rootScope.checkTelephone = function (data) {
            var partternTelephone = /[0-9]/g;
            var mess = { Status: false, Title: "" };
            if (!partternTelephone.test(data) && data != null) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Số điện thoại phải là chữ số [0-9]!", "<br/>");
            }
            return mess;
        }
        jQuery.extend(jQuery.validator.messages, {
            email: caption.SUP_CURD_VALIDATE_EMAIL,
        });
        $rootScope.validationOptionsSupp = {
            rules: {
                SupCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 100
                },
                SupName: {
                    required: true,
                    maxlength: 255
                },
                Email: {
                    required: true,
                },

                Mobile: {
                    required: true,
                },
                Address: {
                    required: true
                },
                //TaxCode: {
                //    required: true
                //}
            },
            messages: {
                SupCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_LBL_CODE),
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SUP_CURD_LBL_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_LBL_CODE).replace("{1}", "100")
                },
                SupName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_LBL_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_LBL_NAME).replace("{1}", "255")
                },
                Email: {
                    required: caption.SUP_VALIDATE_EMAIL,
                },

                Mobile: {
                    required: caption.SUP_VALIDATE_MOBILE,
                },
                Address: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_LBL_ADDRESS),
                },
                //TaxCode: {
                //    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_LBL_TAX_CODE),
                //}

            }
        }
        $rootScope.validationOptionsmore = {
            rules: {
                ext_code: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 100
                },
                ext_value: {
                    required: true,
                    maxlength: 500
                },

            },
            messages: {
                ext_code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_TAB_MORE_CURD_LBL_CODE),
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SUP_CURD_TAB_MORE_CURD_LBL_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_MORE_CURD_LBL_CODE).replace("{1}", "100")
                },
                ext_value: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_TAB_MORE_CURD_LBL_VALUE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_MORE_CURD_LBL_VALUE).replace("{1}", "500")
                },


            }
        }
        $rootScope.validationOptionsContact = {
            rules: {
                ContactName: {
                    required: true,
                    maxlength: 255
                },
                Email: {
                    required: true
                },
                Mobile: {
                    required: true,
                    maxlength: 100,
                    //minlength: 10,
                },
                Title: {
                    maxlength: 1000
                },
                InChargeOf: {
                    maxlength: 1000
                },
                Address: {
                    maxlength: 500
                },
                Telephone: {
                    maxlength: 100
                },
                Fax: {
                    maxlength: 100
                },
                Facebook: {
                    maxlength: 100
                },
                GooglePlus: {
                    maxlength: 100
                },
                Twitter: {
                    maxlength: 100
                },
                Skype: {
                    maxlength: 100
                },
                Note: {
                    maxlength: 1000
                },
            },
            messages: {
                ContactName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_CONTACTNAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_CONTACTNAME).replace("{1}", "255")
                },
                Email: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_EMAIL),
                },
                Mobile: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_MOBIEPHONE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_MOBIEPHONE).replace("{1}", "100")
                    //minlength: "Số di động phải có 10 số trở lên!"
                },
                Title: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_POSITION).replace("{1}", "1000")
                },
                InChargeOf: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_INCHARGEOF).replace("{1}", "1000")
                },
                Address: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_ADDRESS).replace("{1}", "500")
                },
                Telephone: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_TELEPHONE).replace("{1}", "100")
                },
                Fax: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_FAX).replace("{1}", "100")
                },
                Facebook: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_FACEBOOK).replace("{1}", "100")
                },
                GooglePlus: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_GOOGLEPLUS).replace("{1}", "100")
                },
                Twitter: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_TWITTER).replace("{1}", "100")
                },
                Skype: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_SKYPE).replace("{1}", "100")
                },
                Note: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SUP_CURD_TAB_CONTACT_CURD_LBL_NOTE).replace("{1}", "1000")
                },
            }
        }
        $rootScope.validationOptionsAttr = {
            rules: {
                Code: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                },
                Value: {
                    required: true,

                }
            },
            messages: {
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_TAB_MORE_CURD_LBL_CODE),
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SUP_CURD_TAB_MORE_CURD_LBL_CODE),
                },
                Value: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SUP_CURD_TAB_MORE_CURD_LBL_NAME),
                }
            }
        }
        $rootScope.validationOptionsFile = {
            rules: {
                FileName: {
                    required: true,
                },
            },
            messages: {
                FileName: {
                    required: caption.SUP_VALIDATE_TITLE
                },
            }
        }
    });


    //Khởi tạo các mảng dùng chung
    $rootScope.ObjectSupplier = {
        SupplierId: '',
        SupplierCode:''
    }
    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';

    dataserviceSupplier.getCurrency(function (rs) {rs=rs.data;
        $rootScope.currencyData = rs;
    });
    dataserviceSupplier.getSupplierGroup(function (rs) {rs=rs.data;
        $rootScope.SupplierGroup = rs;
        var all = {
            Code: '',
            Name: caption.SUP_TXT_ALL
        }
        $rootScope.SupplierGroup.unshift(all)
    })
    dataserviceSupplier.getSupplierStatus(function (rs) {rs=rs.data;
        $rootScope.StatusData = rs;
        //$rootScope.StatusData.unshift(all)
    })
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Supplier/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderSupplier + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolderSupplier + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderSupplier + '/edit.html',
            controller: 'edit'
        })
        .when('/contactAdd', {
            templateUrl: ctxfolderSupplier + '/contactAdd.html',
            controller: 'contactAdd'
        })
        .when('/fileAdd', {
            templateUrl: ctxfolderSupplier + '/fileAdd.html',
            controller: 'fileAdd'
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter) {
    var vm = $scope;
    $scope.model = {
        Suppliername: '',
        Supplieremail: '',
        SupplierGroup: '',
        Status: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Supplier/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SupplierCode = $scope.model.SupplierCode;
                d.SupplierName = $scope.model.SupplierName;
                d.SupplierEmail = $scope.model.SupplierEmail;
                d.Address = $scope.model.Address;
                d.Phone = $scope.model.Phone;
                d.SupplierGroup = $scope.model.SupplierGroup;
                d.Status = $scope.model.Status;
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
                    $scope.selected[data.SupID] = !$scope.selected[data.SupID];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.SupID] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.SupID] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            //if ($rootScope.permissionSupplier.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var Id = data.SupID;
                        $scope.edit(data.Code, Id);
                    }
                });
            //}
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SupID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.SupID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SupID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{ "SUP_LIST_COL_SUP_CODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "SUP_LIST_COL_SUP_NAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Mobile').withTitle('{{ "SUP_LIST_COL_SUP_PHONE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupGroup').withTitle('{{ "SUP_LIST_COL_SUP_GROUP" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'dataTable-10per').withTitle('{{ "SUP_LIST_COL_SUP_STATUS" | translate }}').notSortable().renderWith(function (data, type) {
        if (data == "Đang hợp tác") {
            return '<span class="text-success">' + data + '</span>';
        } else if (data == "Không hợp tác") {
            return '<span class="text-danger">' + data + '</span>';
        } else {
            return '<span class="text-warning">' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'tcenter dataTable-w80').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        var listButton = '';
        //if ($rootScope.permissionSupplier.Update) {
            listButton += '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(\'' + full.Code + '\',' + full.SupID + ')" ng-click="edit(' + full.SupID + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
        //}
        //if ($rootScope.permissionSupplier.Delete) {
            listButton += '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.SupID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        //}
        return listButton;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    };


    function callback(json) {

    };
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    };
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
    };

    $scope.search = function () {
        reloadData(true);
    };
    $scope.reload = function () {
        reloadData(true);
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSupplier + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            reloadData(true);
        }, function () { });
    };
    $scope.edit = function (suppCode, id) {
        $rootScope.ObjectSupplier.SupplierId = id;
        $rootScope.ObjectSupplier.SupplierCode = suppCode;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSupplier + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceSupplier.delete(id, function (rs) {rs=rs.data;
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
    };
    $scope.addCardJob = function () {
        var userModel = {};
        var editItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            if (editItems.length == 1) {
                var listdata = $('#tblData').DataTable().data();
                for (var i = 0; i < listdata.length; i++) {
                    if (listdata[i].SupID == editItems[0]) {
                        userModel = listdata[i];
                        break;
                    }
                }
                var obj = {
                    Code: userModel.Code,
                    Name: userModel.Name,
                    TabBoard: 8
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderCardJob + "/add-card.html",
                    controller: 'add-cardCardJob',
                    backdrop: 'static',
                    size: '80',
                    resolve: {
                        para: function () {
                            return obj;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                }, function () { });
            } else {
                App.toastrError(caption.SUP_MSG_PLS_SELECT_SUPP)
            }
        } else {
            App.toastrError(caption.SUP_MSG_NO_SUPP_SELECTED)
        }
    };
    $rootScope.reloadSupplier = function (resetPage) {
        reloadData(resetPage);
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };

        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('Address'), options);
    }
    setTimeout(function () {
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter, $window) {
    $scope.model = {
        GoogleMap: '',
        SupGroup: '',
        Status: '',
        Address: '',
        CusType: '',
        Role: '',
        Area: ''
    }
    $scope.initLoad = function () {
        $rootScope.ObjectSupplier.SupplierId = '';
        $rootScope.ObjectSupplier.SupplierCode = '';
        dataserviceSupplier.getSupplierArea(function (rs) {rs=rs.data;
            $rootScope.SupplierAreas = rs.Object;
            $scope.model.Area = rs.Object.length != 0 ? rs.Object[0].Code : '';
        });
        dataserviceSupplier.getSupplierType(function (rs) {rs=rs.data;
            $rootScope.SupplierTypes = rs.Object;
            $scope.model.CusType = rs.Object.length != 0 ? rs.Object[0].Code : '';
        });
        dataserviceSupplier.getSupplierRole(function (rs) {rs=rs.data;
            $rootScope.SupplierRoles = rs.Object;
            $scope.model.Role = rs.Object.length != 0 ? rs.Object[0].Code : '';
        });
        dataserviceSupplier.getSupplierGroup(function (rs) {rs=rs.data;
            $rootScope.SupplierGroup = rs;
            $scope.model.SupGroup = rs.length != 0 ? rs[0].Code : '';
        });
        dataserviceSupplier.getSupplierStatus(function (rs) {rs=rs.data;
            $scope.SupplierStatus = rs;
            $rootScope.StatusData = rs;
            $scope.model.Status = rs.length != 0 ? rs[0].Code : '';
        });
    }
    $scope.initLoad();
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSupplier + '/googleMap.html',
            controller: 'googleMap',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    if ($scope.model.GoogleMap != '') {
                        return {
                            lt: parseFloat($scope.model.GoogleMap.split(',')[0]),
                            lg: parseFloat($scope.model.GoogleMap.split(',')[1]),
                            address: $scope.model.Address,
                        };
                    } else {
                        return '';
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.GoogleMap = d.lat + ',' + d.lng;
                $scope.model.Address = d.address;
            }
        }, function () { });
    }
    $scope.tinymceOptions = {
        plugins: 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help',
        toolbar: "formatselect bold italic strikethrough forecolor link  alignleft aligncenter alignright alignjustify numlist bullist outdent indent removeformat fullscreen"
    };
    $scope.taxCodeChange = function (taxCode) {
        dataserviceSupplier.getInfoWithTaxCode(taxCode, function (rs) {rs=rs.data;
            if (rs.Title != null) {
                $scope.model.SupName = rs.Title;
                $scope.model.Fax = rs.NoiDangKyQuanLy_Fax;
                $scope.model.Address = rs.DiaChiCongTy;
                $scope.model.Mobile = rs.NoiDangKyQuanLy_DienThoai;
            }
        })
    }
    $scope.addCommonSettingArea = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'AREA',
                        GroupNote: 'Khu vực nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierArea(function (rs) {rs=rs.data;
                $rootScope.SupplierAreas = rs.Object;
            });
        }, function () { });
    }
    $scope.addCommonSettingSupplierGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SUPPLIER_GROUP',
                        GroupNote: 'Nhóm nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierGroup(function (rs) {rs=rs.data;
                $rootScope.SupplierGroup = rs;
            })
        }, function () { });
    }
    $scope.addCommonSettingSupplierRole = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SUPPLIER_ROLE',
                        GroupNote: 'Vai trò nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierRole(function (rs) {rs=rs.data;
                $rootScope.SupplierRoles = rs.Object;
            });
        }, function () { });
    }
    $scope.addCommonSettingSupplierType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SUPPLIER_TYPE',
                        GroupNote: 'Loại nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierType(function (rs) {rs=rs.data;
                $rootScope.SupplierTypes = rs.Object;
            });
        }, function () { });
    }
    $scope.addCommonSettingSupplierStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SUPPLIER_STATUS',
                        GroupNote: 'Trạng thái nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierStatus(function (rs) {rs=rs.data;
                $rootScope.StatusData = rs;
            })
        }, function () { });
    }
    $scope.chkSubTab = function () {
        if ($rootScope.ObjectSupplier.SupplierId == '') {
            App.toastrError(caption.SUP_CURD_VALIDATE_TAB_CLICK);
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Area" && $scope.model.Area != "") {
            $scope.errorArea = false;
        }
        if (SelectType == "SupGroup" && $scope.model.SupGroup != "") {
            $scope.errorSupGroup = false;
        }
        if (SelectType == "Role" && $scope.model.Role != "") {
            $scope.errorRole = false;
        }
        if (SelectType == "CusType" && $scope.model.CusType != "") {
            $scope.errorCusType = false;
        }

        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "Mobile" && $scope.model.Mobile && $rootScope.partternPhone.test($scope.model.Mobile)) {
            $scope.errorMobile = false;
        } else if (SelectType == "Mobile") {
            $scope.errorMobile = true;
        }
        if (SelectType == "TaxCode" && $scope.model.TaxCode && $rootScope.partternNumber.test($scope.model.TaxCode) || $scope.model.TaxCode == "") {
            $scope.errorTaxCode = false;
        } else if (SelectType == "TaxCode") {
            $scope.errorTaxCode = true;
        }

        if (SelectType == "Fax" && $scope.model.Fax && $rootScope.partternPhone.test($scope.model.Fax)) {
            $scope.errorFax = false;
        } else if (SelectType == "Fax") {
            $scope.errorFax = true;
        }
    }
    $scope.submit = function () {
        debugger
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkDataSupplier($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var mmsg = $rootScope.checkTelephone($scope.model.Mobile);
            if (mmsg.Status) {
                App.toastrError(mmsg.Title);
                return;
            }
            var mmsg1 = $rootScope.checkTelephone($scope.model.Telephone);
            if (mmsg1.Status) {
                App.toastrError(mmsg1.Title);
                return;
            }
            if ($rootScope.ObjectSupplier.SupplierId == '') {
                dataserviceSupplier.insert($scope.model, function (result) {result=result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $rootScope.ObjectSupplier.SupplierId = result.ID;
                        $rootScope.ObjectSupplier.SupplierCode = $scope.model.SupCode;
                        $rootScope.reloadSupplier(true);
                    }
                });
            } else {
                dataserviceSupplier.update($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadSupplier(false);
                    }
                });
            }
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Area == "") {
            $scope.errorArea = true;
            mess.Status = true;
        } else {
            $scope.errorArea = false;

        }
        if (data.SupGroup == "") {
            $scope.errorSupGroup = true;
            mess.Status = true;
        } else {
            $scope.errorSupGroup = false;

        }
        if (data.Role == "") {
            $scope.errorRole = true;
            mess.Status = true;
        } else {
            $scope.errorRole = false;

        }
        if (data.CusType == "") {
            $scope.errorCusType = true;
            mess.Status = true;
        } else {
            $scope.errorCusType = false;

        }
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }

        if (data.Mobile && !$rootScope.partternPhone.test(data.Mobile)) {
            $scope.errorMobile = true;
            mess.Status = true;
        } else {
            $scope.errorMobile = false;
        }
        if (data.TaxCode && !$rootScope.partternNumber.test(data.TaxCode)) {
            $scope.errorTaxCode = true;
            mess.Status = true;
        } else {
            $scope.errorTaxCode = false;
        }
        if (data.Fax && !$rootScope.partternPhone.test(data.Fax)) {
            $scope.errorFax = true;
            mess.Status = true;
        } else {
            $scope.errorFax = false;
        }

        return mess;
    };
    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };

        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('textAreaAddress'), options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            $("#locationGPS").val(lat + ',' + lng);
            $scope.model.GoogleMap = lat + ',' + lng
            $scope.model.Address = document.getElementById('textAreaAddress').value;
            console.log(lat + ',' + lng);
        });
    }
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        //initAutocomplete();
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceSupplier, para) {
    $scope.initData = function () {
        $scope.initLoad = function () {
            dataserviceSupplier.getSupplierArea(function (rs) {rs=rs.data;
                $rootScope.SupplierAreas = rs.Object;
            });
            dataserviceSupplier.getSupplierType(function (rs) {rs=rs.data;
                $rootScope.SupplierTypes = rs.Object;
            });
            dataserviceSupplier.getSupplierRole(function (rs) {rs=rs.data;
                $rootScope.SupplierRoles = rs.Object;
            });
        }
        $scope.initLoad();
        dataserviceSupplier.getItem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                $rootScope.ObjectSupplier.SupplierCode = $scope.model.SupCode;
            }
        });
    }
    $scope.initData();
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSupplier + '/googleMap.html',
            controller: 'googleMap',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return {
                        lt: $scope.model.GoogleMap != null && $scope.model.GoogleMap != '' ? parseFloat($scope.model.GoogleMap.split(',')[0]) : '',
                        lg: $scope.model.GoogleMap != null && $scope.model.GoogleMap != '' ? parseFloat($scope.model.GoogleMap.split(',')[1]) : '',
                        address: $scope.model.GoogleMap != null && $scope.model.GoogleMap != '' ? $scope.model.Address : '',
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.GoogleMap = d.lat + ',' + d.lng;
                $scope.model.Address = d.address;
            }
        }, function () { });
    }
    $scope.tinymceOptions = {
        plugins: 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help',
        toolbar: "formatselect bold italic strikethrough forecolor link  alignleft aligncenter alignright alignjustify numlist bullist outdent indent removeformat fullscreen"
    };
    $scope.taxCodeChange = function (taxCode) {
        dataserviceSupplier.getInfoWithTaxCode(taxCode, function (rs) {rs=rs.data;
            if (rs.Title != null) {
                $scope.model.SupName = rs.Title;
                $scope.model.Fax = rs.NoiDangKyQuanLy_Fax;
                $scope.model.Address = rs.DiaChiCongTy;
                $scope.model.Mobile = rs.NoiDangKyQuanLy_DienThoai;
            }
        })
    }
    $scope.addCommonSettingArea = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'AREA',
                        GroupNote: 'Khu vực nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierArea(function (rs) {rs=rs.data;
                $rootScope.SupplierAreas = rs.Object;
            });
        }, function () { });
    }
    $scope.addCommonSettingSupplierGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SUPPLIER_GROUP',
                        GroupNote: 'Nhóm nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierGroup(function (rs) {rs=rs.data;
                $rootScope.SupplierGroup = rs;
            })
        }, function () { });
    }
    $scope.addCommonSettingSupplierRole = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SUPPLIER_ROLE',
                        GroupNote: 'Vai trò nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierRole(function (rs) {rs=rs.data;
                $rootScope.SupplierRoles = rs.Object;
            });
        }, function () { });
    }
    $scope.addCommonSettingSupplierType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SUPPLIER_TYPE',
                        GroupNote: 'Loại nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierType(function (rs) {rs=rs.data;
                $rootScope.SupplierTypes = rs.Object;
            });
        }, function () { });
    }
    $scope.addCommonSettingSupplierStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SUPPLIER_STATUS',
                        GroupNote: 'Trạng thái nhà cung cấp',
                        AssetCode: 'SUPPLIER'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceSupplier.getSupplierStatus(function (rs) {rs=rs.data;
                $rootScope.StatusData = rs;
            })
        }, function () { });
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Area" && $scope.model.Area != "") {
            $scope.errorArea = false;
        }
        if (SelectType == "SupGroup" && $scope.model.SupGroup != "") {
            $scope.errorSupGroup = false;
        }
        if (SelectType == "Role" && $scope.model.Role != "") {
            $scope.errorRole = false;
        }
        if (SelectType == "CusType" && $scope.model.CusType != "") {
            $scope.errorCusType = false;
        }

        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }

        if (SelectType == "Mobile" && $scope.model.Mobile && $rootScope.partternPhone.test($scope.model.Mobile)) {
            $scope.errorMobile = false;
        } else if (SelectType == "Mobile") {
            $scope.errorMobile = true;
        }
        if (SelectType == "Fax" && $scope.model.Fax && $rootScope.partternPhone.test($scope.model.Fax)) {
            $scope.errorFax = false;
        } else if (SelectType == "Fax") {
            $scope.errorFax = true;
        }
        if (SelectType == "TaxCode" && $scope.model.TaxCode && $rootScope.partternNumber.test($scope.model.TaxCode) || $scope.model.TaxCode == "") {
            $scope.errorTaxCode = false;
        } else if (SelectType == "TaxCode") {
            $scope.errorTaxCode = true;
        }

    }
    $scope.addCardJob = function () {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].SupID == para) {
                userModel = listdata[i];
                break;
            }
        }
        var obj = {
            Code: userModel.Code,
            Name: userModel.Name,
            TabBoard: 8
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + "/add-card.html",
            controller: 'add-cardCardJob',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () { });
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkDataSupplier($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            dataserviceSupplier.update($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadSupplier(false);
                }
            });
        }

    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Area == "") {
            $scope.errorArea = true;
            mess.Status = true;
        } else {
            $scope.errorArea = false;

        }
        if (data.SupGroup == "") {
            $scope.errorSupGroup = true;
            mess.Status = true;
        } else {
            $scope.errorSupGroup = false;

        }
        if (data.Role == "") {
            $scope.errorRole = true;
            mess.Status = true;
        } else {
            $scope.errorRole = false;

        }
        if (data.CusType == "") {
            $scope.errorCusType = true;
            mess.Status = true;
        } else {
            $scope.errorCusType = false;

        }
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }

        if (data.Mobile && !$rootScope.partternPhone.test(data.Mobile)) {
            $scope.errorMobile = true;
            mess.Status = true;
        } else {
            $scope.errorMobile = false;
        }
        if (data.TaxCode && !$rootScope.partternNumber.test(data.TaxCode)) {
            $scope.errorTaxCode = true;
            mess.Status = true;
        } else {
            $scope.errorTaxCode = false;
        }
        if (data.Fax && !$rootScope.partternPhone.test(data.Fax)) {
            $scope.errorFax = true;
            mess.Status = true;
        } else {
            $scope.errorFax = false;
        }

        return mess;
    };
    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };

        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('textAreaAddress'), options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            $("#locationGPS").val(lat + ',' + lng);
            $scope.model.GoogleMap = lat + ',' + lng
            $scope.model.Address = document.getElementById('textAreaAddress').value;
            console.log(lat + ',' + lng);
        });
    }
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        //initAutocomplete();
    }, 200);
});


app.controller('contact', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ContactName: '',
        ContactEmail: '',
        ContactTelephone: '',
        ContactMobilePhone: '',
    }


    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Supplier/JTableContact",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contact-main",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SupplierId = $rootScope.ObjectSupplier.SupplierId;
                d.ContactName = $scope.model.ContactName;
                d.ContactEmail = $scope.model.ContactEmail;
                d.ContactTelephone = $scope.model.ContactTelephone;
                d.ContactMobilePhone = $scope.model.ContactMobilePhone;
            },
            complete: function () {
                App.unblockUI("#contact-main");
                heightTableManual(250, "#tblDataContact");
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contactName').withTitle('{{ "SUP_CURD_TAB_CONTACT_LIST_COL_CONTACTNAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contactEmail').withTitle('{{ "SUP_CURD_TAB_CONTACT_LIST_COL_CONTACTEMAIL" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contactAddress').withTitle('{{ "SUP_CURD_TAB_CONTACT_LIST_COL_CONTACTADDRESS" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contactTelephone').withTitle('{{ "SUP_CURD_TAB_CONTACT_LIST_COL_CONTACTTELEPHONE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contactMobilePhone').withTitle('{{ "SUP_CURD_TAB_CONTACT_LIST_COL_CONTACTMOBIPHONE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSupplier + '/contactAdd.html',
            controller: 'contactAdd',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            reloadData();
        }, function () { });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSupplier + '/contactEdit.html',
            controller: 'contactEdit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData();
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
                    dataserviceSupplier.deleteContact(id, function (rs) {rs=rs.data;
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
app.controller('contactAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter) {
    $scope.model = {
        FileName: ''
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "MobilePhone" && $scope.model.MobilePhone && $rootScope.partternPhone.test($scope.model.MobilePhone) || $scope.model.MobilePhone == "") {
            $scope.errorMobilePhone = false;
        } else if (SelectType == "MobilePhone") {
            $scope.errorMobilePhone = true;
        }
        if (SelectType == "Fax" && $scope.model.Fax && $rootScope.partternPhone.test($scope.model.Fax) || $scope.model.Fax == "") {
            $scope.errorFax = false;
        } else if (SelectType == "Fax") {
            $scope.errorFax = true;
        }
        if (SelectType == "Telephone" && $scope.model.Telephone && $rootScope.partternNumber.test($scope.model.Telephone) || $scope.model.Telephone == "") {
            $scope.errorTelephone = false;
        } else if (SelectType == "Telephone") {
            $scope.errorTelephone = true;
        }
        if (SelectType == "Email" && $scope.model.Email && $rootScope.partternEmail.test($scope.model.Email)) {
            $scope.errorEmail = false;
        } else if (SelectType == "Email") {
            $scope.errorEmail = true;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addForm.validate() && validationSelect($scope.model).Status == false) {
            var files = $('#File').get(0);
            var file = files.files[0];
            var data = new FormData();
            var fileName = '';
            data.append("FileUpload", file);
            dataserviceSupplier.uploadImage(data, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return;
                }
                else {
                    $scope.model.FilePath = '/uploads/images/' + rs.Object;
                    if ($scope.model.FilePath == '/images/default/uploadimg.png' || $scope.model.FilePath == '') {
                        $scope.model.FilePath = '/images/default/no_image.png';
                    }
                    $scope.model.SuppId = $rootScope.ObjectSupplier.SupplierId;
                    dataserviceSupplier.insertContact($scope.model, function (result) {result=result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            });
        }
    };
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('image').src = reader.result;
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.MobilePhone && !$rootScope.partternPhone.test(data.MobilePhone)) {
            $scope.errorMobilePhone = true;
            mess.Status = true;
        } else {
            $scope.errorMobilePhone = false;
        }
        if (data.Fax && !$rootScope.partternPhone.test(data.Fax)) {
            $scope.errorFax = true;
            mess.Status = true;
        } else {
            $scope.errorFax = false;
        }
        if (data.Telephone && !$rootScope.partternNumber.test(data.Telephone)) {
            $scope.errorTelephone = true;
            mess.Status = true;
        } else {
            $scope.errorTelephone = false;
        }
        if (data.Email && !$rootScope.partternEmail.test(data.Email)) {
            $scope.errorEmail = true;
            mess.Status = true;
        } else {
            $scope.errorEmail = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('contactEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceSupplier, para) {
    $scope.model = {
        FileName: ''
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.changleSelect = function (SelectType) {

        if (SelectType == "MobilePhone" && $scope.model.MobilePhone && $rootScope.partternPhone.test($scope.model.MobilePhone) || $scope.model.MobilePhone == "") {
            $scope.errorMobilePhone = false;
        } else if (SelectType == "MobilePhone") {
            $scope.errorMobilePhone = true;
        }
        if (SelectType == "Fax" && $scope.model.Fax && $rootScope.partternPhone.test($scope.model.Fax) || $scope.model.Fax == "") {
            $scope.errorFax = false;
        } else if (SelectType == "Fax") {
            $scope.errorFax = true;
        }
        if (SelectType == "Telephone" && $scope.model.Telephone && $rootScope.partternNumber.test($scope.model.Telephone) || $scope.model.Telephone == "") {
            $scope.errorTelephone = false;
        } else if (SelectType == "Telephone") {
            $scope.errorTelephone = true;
        }
        if (SelectType == "Email" && $scope.model.Email && $rootScope.partternEmail.test($scope.model.Email)) {
            $scope.errorEmail = false;
        } else if (SelectType == "Email") {
            $scope.errorEmail = true;
        }
    }
    $scope.initData = function () {
        dataserviceSupplier.getContact(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                if ($scope.model.FilePath == '' || $scope.model.FilePath == '/uploads/images/null') {
                    $scope.model.FilePath = '/images/default/uploadimg.png';
                }
            }
        });
    }
    $scope.initData();
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('image').src = reader.result;
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
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addForm.validate() && validationSelect($scope.model).Status == false) {
            var files = $('#File').get(0);
            var file = files.files[0];
            var data = new FormData();
            var fileName = '';
            if (file == null) {
                dataserviceSupplier.updateContact($scope.model, function (result) {result=result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
            else {
                data.append("FileUpload", file);
                dataserviceSupplier.uploadImage(data, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(result.Title);
                        return;
                    }
                    else {
                        $scope.model.FilePath = '/uploads/images/' + rs.Object;
                        dataserviceSupplier.updateContact($scope.model, function (result) {result=result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                            }
                        });
                    }
                });
            }
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.MobilePhone && !$rootScope.partternPhone.test(data.MobilePhone)) {
            $scope.errorMobilePhone = true;
            mess.Status = true;
        } else {
            $scope.errorMobilePhone = false;
        }
        if (data.Fax && !$rootScope.partternPhone.test(data.Fax)) {
            $scope.errorFax = true;
            mess.Status = true;
        } else {
            $scope.errorFax = false;
        }
        if (data.Telephone && !$rootScope.partternNumber.test(data.Telephone)) {
            $scope.errorTelephone = true;
            mess.Status = true;
        } else {
            $scope.errorTelephone = false;
        }
        if (data.Email && !$rootScope.partternEmail.test(data.Email)) {
            $scope.errorEmail = true;
            mess.Status = true;
        } else {
            $scope.errorEmail = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});


app.controller('file', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Supplier/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SupplierCode = $rootScope.ObjectSupplier.SupplierCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataSupplierFile");
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{ "SUP_CURD_TAB_FILE_LIST_COL_TITLE" | translate }}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;';
        }
        return icon + data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"SUP_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle("{{'SUP_LIST_COL_VIEW_CONTENT' | translate}}").renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        var typefile = "#";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
            return '<a ng-click="viewExcel(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="viewWord(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="viewPDF(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{ "SUP_CURD_TAB_FILE_LIST_COL_NOTE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "SUP_CURD_TAB_FILE_LIST_COL_CREATETIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{"SUP_LIST_COL_FILE_TYPE" | translate}}').renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<button title="Sửa" ng-click="edit(\'' + full.FileName + '\',' + full.Id + ')"  style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }
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
    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadFile = function () {
        $scope.reload();
    }
    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderSupplier + '/fileSearch.html',
            windowClass: 'modal-file',
            backdrop: 'static',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.add = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("SupplierCode", $rootScope.ObjectSupplier.SupplierCode);
            data.append("IsMore", false);
            dataserviceSupplier.insertSupplierFile(data, function (result) {result=result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.edit = function (fileName, id) {
        dataserviceSupplier.getSupplierFile(id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderSupplier + '/fileEdit.html',
                    controller: 'fileEdit',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    reloadData()
                }, function () { });
            }
        })
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceSupplier.deleteSupplierFile(id, function (result) {result=result.data;
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
    }
    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'fileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataserviceSupplier.getByteFile(id, function (rs) {rs=rs.data;
        //    
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/views/admin/edmsRepository/imageViewer.html',
        //        controller: 'contractTabFileImageViewer',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return myBase64;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //    }, function () {
        //    });
        //});
    }
    $scope.dowload = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        dataserviceSupplier.getSuggestionsSupplierFile($rootScope.ObjectSupplier.SupplierCode, function (rs) {rs=rs.data;
            var data = rs != '' ? rs : {};
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderSupplier + '/fileAdd.html',
                controller: 'fileAdd',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData()
            }, function () { });
        })
    }
    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }

    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceSupplier.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return null;
                }
            });
        }
    };
    $scope.viewExcel = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataSupplierFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceSupplier.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/Excel#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/Excel#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.SUP_MSG_FILE_SIZE_LIMIT);
            }

        }
    };
    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataSupplierFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        debugger
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            debugger
            if (userModel.SizeOfFile < 20971520) {
                dataserviceSupplier.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/Docman#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/Docman#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.SUP_MSG_FILE_SIZE_LIMIT);
            }
        }
    };
    $scope.viewPDF = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataSupplierFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceSupplier.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/PDF#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/PDF#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.SUP_MSG_FILE_SIZE_LIMIT);
            }
        }
    };
    $scope.view = function (id) {
        debugger
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataSupplierFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceSupplier.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        window.open(rs.Object, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    } else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
        else {
            dataserviceSupplier.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        debugger
                        var url = window.location.origin + '/' + rs.Object;
                        window.open(url, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    }
                    else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
    }
    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSupplier + '/viewer.html',
            controller: 'viewer',
            backdrop: 'false',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('fileAdd', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceSupplier, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.CatCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (data.FolderId == '' || data.FolderId == null) {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (full.FolderId == '' || full.FolderId == null) {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            } else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }

            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('{{"SUP_LIST_COL_FODER" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
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
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var itemSelect = [];
            for (var id in $scope.selected) {
                if ($scope.selected.hasOwnProperty(id)) {
                    if ($scope.selected[id]) {
                        itemSelect.push(id);
                    }
                }
            }
            if (itemSelect.length == 0) {
                App.toastrError(caption.SUP_PLS_SELECT_FORDER_SAVE);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.SUP_PLS_SELECT_ONE_FORDER);
                return;
            }
            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("SupplierCode", $rootScope.ObjectSupplier.SupplierCode);
            data.append("IsMore", true);
            dataserviceSupplier.insertSupplierFile(data, function (result) {result=result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    };

    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceSupplier.getTreeCategory(function (result) {result=result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.SUP_LBL_ALL_CATE,//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('fileEdit', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceSupplier, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.CateRepoSettingCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: '',
        FileName: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (para.Path != null && para.Path != "") {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (para.Path != null && para.Path != "") {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{"SUP_LIST_COL_CATE_FODER" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        if (selectAll)
            $('#tblDataDetailRepository').DataTable().$('tr:not(.selected)').addClass('selected');
        else
            $('#tblDataDetailRepository').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.init = function () {
        $scope.model.FileName = para.FileName;
        $scope.model.NumberDocument = para.NumberDocument;
        $scope.model.Tags = (para.Tags != '' && para.Tags != null) ? para.Tags.split(',') : [];
        $scope.model.Desc = para.Desc;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        var itemSelect = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    itemSelect.push(id);
                }
            }
        }
        if (itemSelect.length == 0) {
            App.toastrError(caption.SUP_PLS_SELECT_FORDER_SAVE);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.SUP_PLS_SELECT_ONE_FORDER);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("SupplierCode", $rootScope.ObjectSupplier.SupplierCode);
                dataserviceSupplier.updateSupplierFile(data, function (result) {result=result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    };
    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceSupplier.getTreeCategory(function (result) {result=result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.SUP_LBL_ALL_CATE,//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                    console.log($scope.treeDataCategory);
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //setModalMaxHeight('.modal-file');
    }, 200);
});
app.controller('fileImageViewer', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataserviceSupplier, $filter, $uibModalInstance, para) {
    $scope.Image = para;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('fileShare', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceSupplier) {
    $scope.model = {
        ObjectCodeShared: $rootScope.ObjectSupplier.SupplierCode,
        ObjectTypeShared: 'SUPPLIER',
        ObjectType: '',
        ObjectCode: '',
        FileCode: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataserviceSupplier.getListObjectTypeShare(function (rs) {rs=rs.data;
            $scope.listObjType = rs;
        });
        dataserviceSupplier.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {rs=rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceSupplier.getListObjectCode($rootScope.ObjectSupplier.ContractCode, ObjType, function (rs) {rs=rs.data;
            $scope.listObjCode = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, ObjType, $scope.model.FileCode);
    }
    $scope.changeObjCode = function (objectCode) {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, objectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.selectFile = function (fileCode) {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, fileCode);
    }
    $scope.reloadListObjectShare = function () {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.removeObjectShare = function (id) {
        dataserviceSupplier.deleteObjectShare(id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
            }
        });
    }
    $scope.share = function () {
        if (!$scope.validate()) {
            dataserviceSupplier.insertFileShare($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
                }
            });
        }
    }
    $scope.validate = function () {
        var error = false;
        if (($scope.model.ObjectType == "" || $scope.model.ObjectType == undefined)) {
            App.toastrError(caption.SUPP_MSG_NO_OBJ_SELECTED)
            error = true;
            return error;
        }
        if (($scope.model.ObjectCode == "" || $scope.model.ObjectCode == undefined)) {
            App.toastrError(caption.SUP_MSG_NO_OBJ_CODE_SELECTED)
            error = true;
            return error;
        }
        if (($scope.model.FileCode == "" || $scope.model.FileCode == undefined)) {
            App.toastrError(caption.SUP_MSG_NO_FILE_SELECTED)
            error = true;
            return error;
        }
    }
    function reloadListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode) {
        dataserviceSupplier.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {rs=rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('viewer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, para, $sce) {
    debugger
    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
    console.log($scope.currentProjectUrl);
    console.log(data);
});

app.controller('contract', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        //CustomerCode: '',
        Title: '',
        ContractCode: '',
        FromDate: '',
        ToDate: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Supplier/JTableContract/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

                d.SupplierID = $rootScope.ObjectSupplier.SupplierId;
                d.ContractCode = $scope.model.ContractCode;
                d.Title = $scope.model.Title;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataContract");
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
            $compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        })
        .withOption('footerCallback', function (tfoot, data) {
            if (data.length > 0) {
                $scope.$apply(function () {
                    $scope.totalBudgets = 0;
                    $scope.currency = data[0].currency;
                    $scope.totalBudgets = parseFloat(data[0].totalContract);
                });
            } else {
                $scope.$apply(function () {
                    $scope.totalBudgets = 0;
                    //$scope.currency = data[0].currency;
                    //$scope.totalBudgets = parseFloat(data[0].totalContract);
                });
            }
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{ "SUP_CURD_TAB_CONTRACT_LIST_COL_CONTRACTCODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('title').withTitle('{{ "CUS_CURD_TAB_CONTRACT_LIST_COL_TITLE" | translate }}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('createdTime').withTitle('{{ "SUP_CURD_TAB_CONTRACT_LIST_COL_CREATED_TIME" | translate }}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('dateOfOrder').withTitle('{{ "SUP_CURD_TAB_CONTRACT_LIST_COL_DATEOFODER" | translate }}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budget').withTitle('{{ "SUP_CURD_TAB_CONTRACT_LIST_COL_BUDGET" | translate }}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger bold'>" + $filter('currency')(data, '', 0) + "</span>" : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('currency').withTitle('{{ "SUP_CURD_TAB_CONTRACT_LIST_COL_CURRENCY" | translate }}').renderWith(function (data, type) {
        return data;
    }));
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
    $scope.search = function () {
        reloadData(true);
    }
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ToDate').datepicker('setStartDate', null);
            }
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#FromDate').datepicker('setEndDate', null);
            }
        });
        $('.end-date').click(function () {
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#ToDate').datepicker('setStartDate', date);
            }
            $('#FromDate').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromDate').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#ToDate').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
    //$scope.initLoad = function () {
    //    var userModel = {};
    //    var listdata = $('#tblDataIndex').DataTable().data();
    //    for (var i = 0; i < listdata.length; i++) {
    //        if (listdata[i].id == $rootScope.ObjectSupplier.SupplierId) {
    //            userModel = listdata[i];
    //            break;
    //        }
    //    }
    //    $scope.model.CustomerCode = userModel.cusCode;
    //}
    //$scope.initLoad();
});
app.controller('projectCustomer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter) {
    var vm = $scope;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        CustomerCode: '',
        Title: '',
        ProjectCode: '',
        ProjectType: 'SUPPLIER',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Customer/JTableProject/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

                d.CustomerID = $rootScope.ObjectSupplier.SupplierId;
                d.ProjectCode = $scope.model.ProjectCode;
                d.Title = $scope.model.Title;
                d.ProjectType = $scope.model.ProjectType;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProject");
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
            $compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        })
        .withOption('footerCallback', function (tfoot, data) {
            if (data.length > 0) {
                $scope.$apply(function () {
                    $scope.totalBudgets = parseFloat(data[0].SumBudget);
                });
            }
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProjectCode').withTitle('{{ "SUP_LIST_COL_PROJECT_CODE_PROJECT" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProjectTitle').withTitle('{{ "SUP_LIST_COL_PROJECT_NAME_PROJECT" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Budget').withTitle('{{ "SUP_LIST_COL_PROJECT_BUDGET" | translate }}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger bold'>" + $filter('currency')(data, '', 0) + "</span>" : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{ "SUP_LIST_COL_PROJECT_CURRENCY" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('Quy đổi (VNĐ)').withOption('sClass', ' ').renderWith(function (data, type, full) {
    //    if (data != "" && full.exchangeRate != "") {
    //        var rs = data * full.exchangeRate;
    //        return data != "" && full.exchangeRate != "" ? "<span class='text-danger'>" + $filter('currency')(rs, '', 0) + "</span>" : null;
    //    }
    //    else {
    //        return null;
    //    }
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{ "SUP_LIST_COL_PROJECT_STARTTIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{ "SUP_LIST_COL_PROJECT_ENDTIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

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
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initLoad = function () {
        var userModel = {};
        var listdata = $('#tblDataIndex').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].id == $rootScope.ObjectSupplier.SupplierId) {
                userModel = listdata[i];
                break;
            }
        }
        $scope.model.CustomerCode = userModel.cusCode;
    }
    $scope.initLoad();
});


app.controller('more', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter, $window) {
    var vm = $scope;
    $scope.model = {
        SupplierId: '',
        Extvalue: '',
        FromDate: '',
        ToDate: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Supplier/JTableExtend",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SupplierId = $rootScope.ObjectSupplier.SupplierId;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.ExtCode = $scope.model.ExtCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataMore");
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('ID').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{ "SUP_CURD_TAB_MORE_LIST_COL_CODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('value').withTitle('{{ "SUP_CURD_TAB_MORE_LIST_COL_VALUE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('createdTime').withTitle('{{ "SUP_CURD_TAB_MORE_LIST_COL_CREATETIME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.search = function () {
        reloadData(true);
    }

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSupplier + '/moreAdd.html',
            controller: 'moreAdd',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSupplier + '/moreEdit.html',
            controller: 'moreEdit',
            backdrop: 'static',
            size: '30',
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
                    dataserviceSupplier.deleteExtend(id, function (rs) {rs=rs.data;
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
    setTimeout(function () {
        $("#datefrommore").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datetomore').datepicker('setStartDate', maxDate);
        });
        $("#datetomore").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrommore').datepicker('setEndDate', maxDate);
        });

        $('.end-date').click(function () {
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#datetomore').datepicker('setStartDate', date);
            }
            $('#datefrommore').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#datefrommore').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#datetomore').datepicker('setStartDate', null);
        });
    }, 200);
});
app.controller('moreAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
        ext_code: '',
        ext_value: '',
        supplier_code: '',
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var msg = $rootScope.checkDataMore($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            $scope.model.supplier_code = $rootScope.ObjectSupplier.SupplierId;
            dataserviceSupplier.insertExtend($scope.model, function (result) {result=result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
                App.unblockUI("#contentMain");
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('moreEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceSupplier, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataserviceSupplier.getExtend(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
    }
    $scope.initData();

    $scope.submit = function () {
        if ($scope.editform.validate()) {
            dataserviceSupplier.updateExtend($scope.model, function (rs) {rs=rs.data;
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
app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter, para) {
    var lat = '';
    var lng = '';
    var address = '';
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        var obj = {
            lat: lat,
            lng: lng,
            address: address,
        }
        $uibModalInstance.close(obj);
    }
    $scope.initMap = function () {
        fields_vector_source = new ol.source.Vector({});
        var center = ol.proj.transform([$rootScope.lngDefault, $rootScope.latDefault], 'EPSG:4326', 'EPSG:3857');
        map = new ol.Map({
            target: $('#map')[0],

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'


                    })
                }),
                new ol.layer.Vector({
                    source: fields_vector_source
                })
            ],

            view: new ol.View({
                center: center,
                zoom: 15

            }),

            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            })
        });
        var pathGG = $('#pathGG').html();
        var id = $("#ID").html();
        var aaa = parseInt(id);
        if (pathGG != "" && pathGG != null) {
            pathSourceVector = new ol.source.Vector({
                features: []
            });
            pathLayerMarker = new ol.layer.Vector({
                source: pathSourceVector
            });
            var path = polyline.decode(pathGG);

            pathLayerMarker = renderLinePathLayer(path);
            map.addLayer(pathLayerMarker);

            var styles3 = [

                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#64c936',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(100, 201, 54,1)'
                    })
                }),
            ];

            var iconStyleStart = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/pjZYQLJ.png'
                })),
                zIndex: 11
            });
            var iconStyleEnd = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/3g07NhB.png'
                })),
                zIndex: 11
            });

            var pathLenght = path.length - 1;
            var iconFeatureStart = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[0][1]), parseFloat(path[0][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });

            iconFeatureStart.setId(1);
            iconFeatureStart.setStyle(iconStyleStart);
            var iconFeatureEnd = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[pathLenght][1]), parseFloat(path[pathLenght][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });
            iconFeatureEnd.setId(2);
            iconFeatureEnd.setStyle(iconStyleEnd);
            var vectorIcon = new ol.source.Vector({});
            vectorIcon.addFeature(iconFeatureStart);
            vectorIcon.addFeature(iconFeatureEnd);

            var vectorLayer = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            map.addLayer(vectorLayer);


            //pathSource = new ol.source.Vector({});


            pathSource.addFeature(renderLineStringFeature(path))
            var field_location = pathSource.getFeatureById(aaa).getProperties();
            var field_extent = field_location.geometry.getExtent();
            map.getView().fit(field_extent, map.getSize());
            map.getView().setZoom(12);
        }
    }
    $scope.initMap();
    function initData() {
        //init
        if (para) {
            lat = para.lt != '' ? para.lt : $rootScope.latDefault;
            lng = para.lg != '' ? para.lg : $rootScope.lngDefault;
            address = para.lg != '' ? para.address : $rootScope.addressDefault;
            document.getElementById("startPlace").value = address;
        } else {
            lat = $rootScope.latDefault;
            lng = $rootScope.lngDefault;
            address = $rootScope.addressDefault;
            document.getElementById("startPlace").value = $rootScope.addressDefault;
        }

        var centerPoint = { lat: lat, lng: lng };
        var infowindow = new google.maps.InfoWindow({
            content: '<b>Thông tin</b> <br/>' + address,
        });
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: $rootScope.zoomMapDefault, center: centerPoint });
        maps.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('startPlace'));
        var marker = new google.maps.Marker({
            zoom: 12,
            position: centerPoint,
            map: maps,
        });
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };




        //Autocomplete
        var input = document.getElementById('startPlace');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        var service = new google.maps.places.PlacesService(maps);



        //Map change
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                maps.fitBounds(place.geometry.viewport);
            } else {
                maps.setCenter(place.geometry.location);
                maps.setZoom(17);
            }
            marker.setIcon(({
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            var html = "<b>" + place.name + "</b> <br/>" + place.formatted_address;
            infowindow.setContent(html);
            infowindow.open(maps, marker);
            address = place.formatted_address;
            $scope.$apply();
        });



        //Map click
        infowindow.open(map, marker);
        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            lat = point.lat;
            lng = point.lng;

            dataserviceSupplier.getAddress(point.lat, point.lng, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var html = "<b>Thông tin</b> <br/>" + rs.Object;
                    infowindow.setContent(html);
                    infowindow.open(map, marker, html);
                    document.getElementById("startPlace").value = rs.Object;
                    address = rs.Object;
                }
            })
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps,
                });
            }
            maps.setZoom($rootScope.zoomMapDefault);
        })
    }
    function setHeightMap() {
        var maxHeightMap = $(window).height() - $("#map").position().top - 200;
        $("#map").css({
            'max-height': maxHeightMap,
            'height': maxHeightMap,
            'overflow': 'auto',
        });
        mapReSize();
    }
    function mapReSize() {
        setTimeout(function () {
            map.updateSize();
        }, 600);
    }
    setTimeout(function () {
        initData();
        setHeightMap();
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('cardJob', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Supplier/JTableCardJob",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contact-main",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SupplierId = $rootScope.ObjectSupplier.SupplierId;
            },
            complete: function () {
                App.unblockUI("#contact-main");
                heightTableManual(250, "#tblDataCard");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderCardJob + "/edit-card.html",
                        controller: 'edit-cardCardJob',
                        size: '65',
                        backdrop: 'static',
                        resolve: {
                            para: function () {
                                return data.CardCode;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                        reloadData(true);
                    }, function () { });
                }
            });
        });
    //vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //}).withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Supplier').withTitle('{{ "SUP_CURD_TAB_CARD_JOB_LIST_COL_SUPPLIER" | translate }}').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CardCode').withTitle('{{ "SUP_CURD_TAB_CARD_JOB_LIST_COL_CARDCODE" | translate }}').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CardName').withTitle('{{ "SUP_CURD_TAB_CARD_JOB_LIST_COL_CARDNAME" | translate }}').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.reloadData = reloadData;
    //vm.dtInstance = {};
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("CardID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.CardID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.CardID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardCode').withTitle('{{ "SUP_CURD_TAB_CARDJOB_COL_CARDCODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardName').withTitle('{{ "SUP_CURD_TAB_CARDJOB_COL_CARDNAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withTitle('{{ "SUP_CURD_TAB_CARDJOB_COL_BEGINTIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{ "SUP_CURD_TAB_CARDJOB_COL_ENDTIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{ "SUP_CURD_TAB_CARDJOB_COL_STATUS" | translate }}').renderWith(function (data, type) {
        if (data == '') {
            return '<span class="text-danger">Đang chờ</span>';
        } else {
            return '<span class="text-success">' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Completed').withTitle('{{ "SUP_CURD_TAB_CARDJOB_COL_COMPLETED" | translate }}').renderWith(function (data, type) {
        if (data == '0.00') {
            return '<span class="text-danger">' + data + '</span>';
        } else {
            return '<span class="text-success">' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{ "SUP_CURD_TAB_CARDJOB_COL_COST" | translate }}').renderWith(function (data, type) {
        if (data == '0.0000') {
            return '<span class="text-danger">' + data + '</span>';
        } else {
            return '<span class="text-success">' + $filter('currency')(data, '', 0) + '</span>';
        }
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('LocationText').withTitle('Địa chỉ').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Quantitative').withTitle('Định lượng/Đơn vị').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListName').withTitle('{{ "SUP_CURD_TAB_CARDJOB_COL_LISTNAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoardName').withTitle('{{ "SUP_CURD_TAB_CARDJOB_COL_BOARDNAME" | translate }}').renderWith(function (data, type) {
        return data;
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
    $rootScope.reloadCardJob = function () {
        reloadData(true);
    };
});


app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSupplier, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"SUP_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"SUP_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"SUP_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"SUP_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"SUP_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
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
        dataserviceSupplier.getDataType(function (rs) {rs=rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {

        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.SUP_CURD_MSG_SETTING_NOT_BLANK);
        } else {
            dataserviceSupplier.insertCommonSetting($scope.model, function (rs) {rs=rs.data;
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
            App.toastrError(caption.SUP_CURD_MSG_DATA_NOT_BLANK)
        } else {
            dataserviceSupplier.updateCommonSetting($scope.model, function (rs) {rs=rs.data;
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceSupplier.deleteCommonSetting(id, function (rs) {rs=rs.data;
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