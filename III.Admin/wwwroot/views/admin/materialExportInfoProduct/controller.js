﻿var ctxfolder = "/views/admin/materialExportInfoProduct";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce']);
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
            $http.post('/Admin/materialProduct/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/materialProduct/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/materialProduct/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/materialProduct/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/materialProduct/GetItem?Id=' + data).then(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/materialProduct/GetItemDetail/' + data).then(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/materialProduct/GetProductGroup/').then(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/Admin/materialProduct/GetProductUnit/').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UploadImage/', data, callback);
        },

        getInheritances: function (data, callback) {
            $http.post('/Admin/materialProduct/GetInheritances?productCode=' + data).then(callback);
        },
        getProductCategoryTypes: function (callback) {
            $http.post('/Admin/materialProduct/GetProductCategoryTypes/').then(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/Admin/materialProduct/GetProductTypes/').then(callback);
        },
        insertProductAttribute: function (data, callback) {
            console.log(data);
            $http.post('/Admin/materialProduct/InsertProductAttribute', data).then(callback);
        },
        deleteExtend: function (id, callback) {
            $http.post('/Admin/materialProduct/DeleteAttribute?Id=' + id).then(callback);
        },
        updateAttribute: function (data, callback) {
            $http.post('/Admin/materialProduct/UpdateAttribute', data).then(callback);
        },
        getAttributeItem: function (id, callback) {
            $http.post('/Admin/materialProduct/GetAttributeItem?id=' + id).then(callback);
        },
        jtreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/JtreeRepository').then(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/InsertFile/', data, callback);
        },

        deleteFile: function (data, callback) {
            $http.post('/Admin/materialProduct/DeleteFile?id=' + data).then(callback);
        },
        updateFile: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UpdateFile/', data, callback);
        },
        getFile: function (data, callback) {
            $http.get('/Admin/materialProduct/GetFile?id=' + data).then(callback);
        },
        getQrCodeFromString: function (data, callback) {
            $http.post('/Admin/lotProduct/GetQrCodeFromString?content=' + data).then(callback);
        },
        getBarCodeFromString: function (data, callback) {
            $http.post('/Admin/lotProduct/GetBarCodeFromString?content=' + data).then(callback);
        },

        getListProductInStore: function (callback) {
            $http.get('/Admin/MaterialExportInfoProduct/GetListProductInStore').then(callback);
        },

        getInfoProductInStore: function (data, callback) {
            $http.get('/Admin/MaterialExportInfoProduct/GetInfoProductInStore?id='+data).then(callback);
        },
    }
});



app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ProductCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.MEXIP_MSG_CODE_PRODUCT_BLANK_SPECIAL, "<br/>");
            }
            return mess;
        }

        $rootScope.validationOptions = {
            rules: {
                ProductCode: {
                    required: true,
                    maxlength: 50
                },
                ProductName: {
                    required: true,
                    maxlength: 200
                },
                Unit: {
                    required: true,
                    maxlength: 100
                },


            },
            messages: {
                ProductCode: {
                    required: caption.MEXIP_MSG_ENTER_PRODUCT,
                    maxlength: caption.MEXIP_MSG_CODE_PRODUCT_CHAR
                },
                ProductName: {
                    required: caption.MEXIP_MSG_ENTE_PRODUCT_NAME,
                    maxlength: caption.MEXIP_MSG_ENTE_PRODUCT_NAME_CHAR
                },
                Unit: {
                    required: caption.MEXIP_MSG_ENTE_UNIT,
                    maxlength: caption.MEXIP_MSG_ENTE_UNIT_CHAR
                },

            }
        }
        $rootScope.IsTranslate = true;
    });
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
    $rootScope.checkData = function (data) {
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
        if (!partternCode.test(data.AttributeCode)) {
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
            mess.Title = mess.Title.concat(" - ", caption.MEXIP_MSG_PHONENUMBER_NONUMBER, "<br/>");
        }
        return mess;
    }
    $rootScope.StatusData = [{
        Code: true,
        Name: 'Hoạt động'
    }, {
        Code: false,
        Name: 'Không hoạt động'
    }]
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/MaterialExportInfoProduct/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    $scope.products = [];
    $scope.productInfo = {};
    $scope.showInfo = false;
    $scope.model = {
        Id:''
    }

    $scope.initData = function () {
        dataservice.getListProductInStore(function (result) {result=result.data;
            $scope.products = result;
        });
    }
    $scope.initData();

    $scope.search = function () {
        if ($scope.model.Id != '') {
            dataservice.getInfoProductInStore($scope.model.Id, function (result) {result=result.data;
                $scope.productInfo = result[0];
                $scope.showInfo = true;
            });
        } else {
            App.toastrError(caption.MEXIP_MSG_CHOOSE_ID)
        }
    }
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewerBase64.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.data = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    $scope.viewBarCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/brViewerBase64.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.data = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
});
//app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
//    $scope.cancel = function () {
//        //$uibModalInstance.dismiss('cancel');
//        $uibModalInstance.close();
//    }
//    $rootScope.ProductCode = '';
//    $scope.inheritances = [];
//    $scope.productCategoryTypes = [];
//    $scope.productTypes = [];
//    $rootScope.ProductID = '';
//    $scope.model = {
//        FileName: '',
//        ProductGroup: '',
//        unit: '',
//        ProductCode: ''
//    };
//    $scope.ImageBase1 = $rootScope.BarDefault;
//    $scope.initData = function () {
//        dataservice.gettreedataLevel(function (result) {result=result.data;
//            $scope.treedataLevel = result;
//        });
//        dataservice.getproductgroup(function (result) {result=result.data;
//            $scope.productgroup = result;
//        });
//        dataservice.getInheritances($scope.model.ProductCode, function (result) {result=result.data;
//            $scope.inheritances = result;
//        });

//        dataservice.getProductTypes(function (result) {result=result.data;
//            $scope.productTypes = result;
//        });
//    }
//    $scope.initData();
//    function validationSelect(data) {
//        var mess = { Status: false, Title: "" };

//        if (data.Unit == "") {
//            $scope.errorUnit = true;
//            mess.Status = true;
//        } else {
//            $scope.errorUnit = false;

//        }
//        if (data.GroupCode == "") {
//            $scope.errorProductGroup = true;
//            mess.Status = true;
//        } else {
//            $scope.errorProductGroup = false;

//        }
//        return mess;
//    };
//    $scope.changleSelect = function (SelectType) {
//        if (SelectType == "ProductGroup" && $scope.model.ProductGroup != "") {
//            $scope.errorProductGroup = false;
//        }
//        if (SelectType == "unit" && $scope.model.unit != "") {
//            $scope.errorUnit = false;
//        }
//    }
//    $scope.selectImage = function () {
//        var fileuploader = angular.element("#file");
//        fileuploader.on('click', function () {
//        });
//        fileuploader.on('change', function (e) {
//            var reader = new FileReader();
//            reader.onload = function () {
//                document.getElementById('imageId').src = reader.result;
//            }
//            var files = fileuploader[0].files;
//            var idxDot = files[0].name.lastIndexOf(".") + 1;
//            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
//            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
//                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
//                return;
//            }
//            reader.readAsDataURL(files[0]);
//        });
//        fileuploader.trigger('click');
//    }
//    $scope.submit = function () {
//        validationSelect($scope.model);

//        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
//            var msg = $rootScope.checkData($scope.model);
//            if (msg.Status) {
//                App.toastrError(msg.Title);
//                return;
//            }
//            var fileName = $('input[type=file]').val();
//            var idxDot = fileName.lastIndexOf(".") + 1;
//            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
//            //console.log('Name File: ' + extFile);
//            if (extFile !== "") {
//                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
//                    App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
//                } else {
//                    var fi = document.getElementById('file');
//                    var fsize = (fi.files.item(0).size) / 1024;
//                    if (fsize > 1024) {
//                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
//                    } else {
//                        var fileUpload = $("#file").get(0);
//                        var reader = new FileReader();
//                        reader.readAsDataURL(fileUpload.files[0]);
//                        reader.onload = function (e) {
//                            debugger
//                            //Initiate the JavaScript Image object.
//                            var image = new Image();
//                            //Set the Base64 string return from FileReader as source.
//                            image.src = e.target.result;
//                            image.onload = function () {
//                                //Determine the Height and Width.
//                                var height = this.height;
//                                var width = this.width;
//                                if (width > 5000 || height > 5000) {
//                                    App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
//                                } else {
//                                    var data = new FormData();
//                                    file = fileUpload.files[0];
//                                    data.append("FileUpload", file);
//                                    dataservice.uploadImage(data, function (rs) {rs=rs.data;
//                                        if (rs.Error) {
//                                            App.toastrError(rs.Title);
//                                            return;
//                                        }
//                                        else {
//                                            $scope.model.Image = '/uploads/images/' + rs.Object;
//                                            dataservice.insert($scope.model, function (rs) {rs=rs.data;
//                                                if (rs.Error) {
//                                                    App.toastrError(rs.Title);

//                                                } else {
//                                                    App.toastrSuccess(rs.Title);
//                                                    $scope.model = rs.Object;
//                                                    $rootScope.ProductID = $scope.model.Id;
//                                                    $rootScope.ProductCode = $scope.model.ProductCode;
//                                                }
//                                            });
//                                        }
//                                    })
//                                }
//                            };
//                        }
//                    }
//                }
//            } else {
//                dataservice.insert($scope.model, function (rs) {rs=rs.data;
//                    if (rs.Error) {
//                        App.toastrError(rs.Title);
//                    } else {
//                        App.toastrSuccess(rs.Title);
//                        $scope.model = rs.Object;
//                        $rootScope.ProductID = $scope.model.Id;
//                        $rootScope.ProductCode = $scope.model.ProductCode;
//                    }
//                });
//            }
//        }
//    }
//    setTimeout(function () {
//        setModalDraggable('.modal-dialog');
//    }, 200);
//    $scope.tinymceOptions = {
//        plugins: 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help',
//        toolbar: "formatselect bold italic strikethrough forecolor link  alignleft aligncenter alignright alignjustify numlist bullist outdent indent removeformat fullscreen"
//    };
//    $scope.getQrCodeFromString = function () {
//        dataservice.getQrCodeFromString($scope.model.ProductCode, function (rs) {rs=rs.data;
//            console.log(rs);
//            if (rs == null || rs == "")
//                $scope.ImageBase = $rootScope.QrDefault;
//            else
//                $scope.ImageBase = rs;
//        });
//        dataservice.getBarCodeFromString($scope.model.ProductCode, function (rs) {rs=rs.data;
//            console.log(rs);
//            $scope.ImageBase1 = rs;
//        });
//    }
//});
//app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
//    $scope.model = para;
//    $scope.inheritances = [];
//    $scope.productCategoryTypes = [];
//    $scope.productTypes = [];
//    $rootScope.ProductID = $scope.model.Id;

//    $scope.initData = function () {
//        dataservice.gettreedataLevel(function (result) {result=result.data;
//            $scope.treedataLevel = result;
//        });
//        dataservice.getproductgroup(function (result) {result=result.data;
//            $scope.productgroup = result;
//        });
//        dataservice.getInheritances($scope.model.ProductCode, function (result) {result=result.data;
//            $scope.inheritances = result;
//        });

//        dataservice.getProductTypes(function (result) {result=result.data;
//            $scope.productTypes = result;
//        });

//    }
//    $scope.initData();
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    }
//    $scope.initData1 = function () {
//        dataservice.getItem(para, function (rs) {rs=rs.data;
//            if (rs.Error) {
//                App.toastrError(rs.Title);
//            }
//            else {
//                $scope.model = rs;
//                $rootScope.ProductID = $scope.model.Id;
//                $rootScope.ProductCode = $scope.model.ProductCode;
//            }
//        });
//    }
//    //$scope.initData1();
//    $scope.selectImage = function () {
//        var fileuploader = angular.element("#file");
//        fileuploader.on('click', function () {
//        });
//        fileuploader.on('change', function (e) {
//            var reader = new FileReader();
//            reader.onload = function () {
//                document.getElementById('imageId').src = reader.result;
//            }
//            var files = fileuploader[0].files;
//            var idxDot = files[0].name.lastIndexOf(".") + 1;
//            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
//            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
//                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
//                return;
//            }
//            reader.readAsDataURL(files[0]);
//        });
//        fileuploader.trigger('click');
//    }
//    $scope.submit = function () {
//        if ($scope.addform.validate()) {
//            //console.log($scope.model);
//            var fileName = $('input[type=file]').val();
//            var idxDot = fileName.lastIndexOf(".") + 1;
//            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
//            //console.log('Name File: ' + extFile);
//            if (extFile !== "") {
//                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
//                    App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
//                } else {
//                    var fi = document.getElementById('file');
//                    var fsize = (fi.files.item(0).size) / 1024;
//                    if (fsize > 1024) {
//                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXIMUM);
//                    } else {
//                        var fileUpload = $("#file").get(0);
//                        var reader = new FileReader();
//                        reader.readAsDataURL(fileUpload.files[0]);
//                        reader.onload = function (e) {
//                            //Initiate the JavaScript Image object.
//                            var image = new Image();
//                            //Set the Base64 string return from FileReader as source.
//                            image.src = e.target.result;
//                            image.onload = function () {
//                                //Determine the Height and Width.
//                                var height = this.height;
//                                var width = this.width;
//                                if (width > 5000 || height > 5000) {
//                                    App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
//                                } else {
//                                    var data = new FormData();
//                                    file = fileUpload.files[0];
//                                    data.append("FileUpload", file);
//                                    dataservice.uploadImage(data, function (rs) {rs=rs.data;
//                                        if (rs.Error) {
//                                            App.toastrError(rs.Title);
//                                            return;
//                                        }
//                                        else {
//                                            $scope.model.Image = '/uploads/images/' + rs.Object;
//                                            console.log($scope.model);
//                                            dataservice.update($scope.model, function (rs) {rs=rs.data;
//                                                if (rs.Error) {
//                                                    App.toastrError(rs.Title);
//                                                } else {
//                                                    App.toastrSuccess(rs.Title);
//                                                    $uibModalInstance.close();
//                                                }
//                                            });
//                                        }
//                                    })
//                                }
//                            };
//                        }
//                    }
//                }
//            } else {
//                console.log($scope.model);
//                dataservice.update($scope.model, function (rs) {rs=rs.data;
//                    if (rs.Error) {
//                        App.toastrError(rs.Title);
//                    } else {
//                        App.toastrSuccess(rs.Title);
//                        $uibModalInstance.close();
//                    }
//                });
//            }
//        }
//    }
//    setTimeout(function () {
//        setModalDraggable('.modal-dialog');
//    }, 200);
//    $scope.getQrCodeFromString = function () {
//        dataservice.getQrCodeFromString($scope.model.ProductCode, function (rs) {rs=rs.data;
//            console.log(rs);
//            if (rs == null || rs == "")
//                $scope.ImageBase = $rootScope.QrDefault;
//            else
//                $scope.ImageBase = rs;
//        });
//        dataservice.getBarCodeFromString($scope.model.ProductCode, function (rs) {rs=rs.data;
//            console.log(rs);
//            $scope.ImageBase1 = rs;
//        });
//    }
//    $scope.getQrCodeFromString();
//});

//app.controller('more', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
//    var vm = $scope;
//    $scope.selected = [];
//    $scope.selectAll = false;
//    $scope.toggleAll = toggleAll;
//    $scope.toggleOne = toggleOne;
//    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
//    vm.dtOptions = DTOptionsBuilder.newOptions()
//        .withOption('ajax', {
//            url: "/Admin/MaterialProduct/JTableExtend",
//            beforeSend: function (jqXHR, settings) {
//                App.blockUI({
//                    target: "#contentMain",
//                    boxed: true,
//                    message: 'loading...'
//                });
//            },
//            type: 'POST',
//            data: function (d) {
//                d.ProductCode = $rootScope.ProductCode;
//            },
//            complete: function () {
//                App.unblockUI("#contentMain");
//                $scope.$apply();
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
//    //end option table
//    //.Id,
//    //                            a.AttributeCode,
//    //                            a.AttributeName,
//    //                            a.Value,
//    //                            a.Note,
//    //                            a.CreatedTime
//    //Tạo các cột của bảng để đổ dữ liệu vào
//    vm.dtColumns = [];
//    //vm.dtColumns.push(DTColumnBuilder.newColumn("check").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
//    //    $scope.selected[full.id] = false;
//    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
//    //}).withOption('sClass', ''));
//    //vm.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('ID').renderWith(function (data, type) {
//    //    return data;
//    //}));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeCode').withTitle("Mã thuộc tính").renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeName').withTitle("Tên thuộc tính").renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle("Giá trị").renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle("Ghi chú").renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle("Ngày thêm").renderWith(function (data, type) {
//        //return data;
//        return $filter("date")(new Date(data), "dd/MM/yyyy");
//    }));

//    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
//        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
//            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
//    }));
//    vm.reloadData = reloadData;
//    vm.dtInstance = {};

//    function reloadData(resetPaging) {
//        vm.dtInstance.reloadData(callback, resetPaging);
//    }

//    function callback(json) {

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
//    $scope.reload = function () {
//        reloadData(true);
//    }
//    $scope.add = function () {
//        if ($rootScope.ProductID != '') {
//            var modalInstance = $uibModal.open({
//                animation: true,
//                templateUrl: ctxfolder + '/moreAdd.html',
//                controller: 'moreAdd',
//                backdrop: 'static',
//                size: '40'
//            });
//            modalInstance.result.then(function (d) {
//                $scope.reload()
//            }, function () { });
//        }
//    }

//    $scope.edit = function (id) {
//        var modalInstance = $uibModal.open({
//            animation: true,
//            templateUrl: ctxfolder + '/moreEdit.html',
//            controller: 'moreEdit',
//            backdrop: 'static',
//            size: '40',
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
//                $scope.message = "Bạn có chắc chắn muốn xóa ?";
//                $scope.ok = function () {
//                    dataservice.deleteExtend(id, function (rs) {rs=rs.data;
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
//app.controller('moreAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    };
//    $scope.model = {
//    }
//    $scope.submit = function () {
//        if ($scope.addform.validate()) {
//            var msg = $rootScope.checkDataMore($scope.model);
//            if (msg.Status) {
//                App.toastrError(msg.Title);
//                return;
//            }
//            if ($rootScope.ProductID == '') {
//                App.toastrError("Vui lòng thêm sản phẩm trước");
//            }
//            $scope.model.ProductCode = $rootScope.ProductCode;
//            dataservice.insertProductAttribute($scope.model, function (result) {result=result.data;
//                if (result.Error) {
//                    App.toastrError(result.Title);
//                } else {
//                    App.toastrSuccess(result.Title);
//                    $uibModalInstance.close();
//                }
//                App.unblockUI("#contentMain");
//            });
//        }
//    }
//    setTimeout(function () {
//        setModalDraggable('.modal-dialog');
//    }, 200);
//    var init = function () {
//        dataservice.gettreedataLevel(function (result) {result=result.data;
//            $scope.treedataLevel = result;
//        });
//    }
//    init();
//});
//app.controller('moreEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    };
//    $scope.initData = function () {
//        dataservice.getAttributeItem(para, function (rs) {rs=rs.data;
//            if (rs.Error) {
//                App.toastrError(rs.Title);
//            } else {
//                $scope.model = rs.Object;
//            }
//        });
//    }
//    $scope.initData();

//    $scope.submit = function () {
//        if ($scope.addform.validate()) {
//            dataservice.updateAttribute($scope.model, function (rs) {rs=rs.data;
//                if (rs.Error) {
//                    App.toastrError(rs.Title);
//                } else {
//                    App.toastrSuccess(rs.Title);
//                    $uibModalInstance.close();
//                }
//            });
//        }
//    }
//    setTimeout(function () {
//        setModalDraggable('.modal-dialog');
//    }, 200);
//    var init = function () {
//        dataservice.gettreedataLevel(function (result) {result=result.data;
//            $scope.treedataLevel = result;
//        });
//    }
//    init();
//});

//app.controller('file', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
//    var vm = $scope;
//    $scope.selected = [];
//    $scope.selectAll = false;
//    $scope.toggleAll = toggleAll;
//    $scope.toggleOne = toggleOne;
//    $scope.model = {
//        FromDate: '',
//        ToDate: '',
//    }

//    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
//    vm.dtOptions = DTOptionsBuilder.newOptions()
//        .withOption('ajax', {
//            url: "/Admin/materialProduct/JTableFile",
//            beforeSend: function (jqXHR, settings) {
//                App.blockUI({
//                    target: "#contentMain",
//                    boxed: true,
//                    message: 'loading...'
//                });
//            },
//            type: 'POST',
//            data: function (d) {

//                d.ProductCode = $rootScope.ProductCode;
//                d.FromDate = $scope.model.FromDate;
//                d.ToDate = $scope.model.ToDate;
//                console.log(d);
//            },
//            complete: function () {
//                App.unblockUI("#contentMain");
//                $scope.$apply();
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
//        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
//    }).withOption('sClass', 'hidden'));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle($translate('SUP_CURD_TAB_FILE_LIST_COL_TITLE')).renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('FileTypePhysic').withTitle($translate('SUP_CURD_TAB_FILE_LIST_COL_TYPE')).renderWith(function (data, type) {
//        var excel = ['.xlsm', '.xlsx', '.xlsb', '.xltx', '.xltm', '.xls', '.xlt', '.xls', '.xml', '.xml', '.xlam', '.xla', '.xlw', '.xlr'];
//        var document = ['.txt'];
//        var word = ['.docx', '.doc'];
//        var pdf = ['.pdf'];
//        var powerPoint = ['.pps', '.pptx'];
//        var image = ['.jpg', '.png', '.PNG'];

//        if (excel.indexOf(data) !== -1) {
//            return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>';
//        } else if (word.indexOf(data) !== -1) {
//            return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>';
//        } else if (document.indexOf(data) !== -1) {
//            return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>';
//        } else if (pdf.indexOf(data) !== -1) {
//            return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>';
//        } else if (powerPoint.indexOf(data) !== -1) {
//            return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>';
//        } else if (image.indexOf(data) !== -1) {
//            return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>';
//        } else {
//            return data;
//        }
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle($translate('SUP_CURD_TAB_FILE_LIST_COL_NOTE')).renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle($translate('SUP_CURD_TAB_FILE_LIST_COL_CREATETIME')).renderWith(function (data, type) {
//        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
//        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
//            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
//    }));
//    vm.reloadData = reloadData;
//    vm.dtInstance = {};

//    function reloadData(resetPaging) {
//        vm.dtInstance.reloadData(callback, resetPaging);
//    }

//    function callback(json) {

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
//    function loadDate() {
//        $("#FromTo").datepicker({
//            inline: false,
//            autoclose: true,
//            format: "dd/mm/yyyy",
//            fontAwesome: true,
//        }).on('changeDate', function (selected) {
//            var maxDate = new Date(selected.date.valueOf());
//            $('#DateTo').datepicker('setStartDate', maxDate);
//        });
//        $("#DateTo").datepicker({
//            inline: false,
//            autoclose: true,
//            format: "dd/mm/yyyy",
//            fontAwesome: true,
//        }).on('changeDate', function (selected) {
//            var maxDate = new Date(selected.date.valueOf());
//            $('#FromTo').datepicker('setEndDate', maxDate);
//        });
//        $('.end-date').click(function () {
//            $('#FromTo').datepicker('setEndDate', null);
//        });
//        $('.start-date').click(function () {
//            $('#DateTo').datepicker('setStartDate', null);
//        });
//    }
//    $scope.reload = function () {
//        reloadData(true);
//    }
//    $scope.search = function () {
//        if ($rootScope.ProductID != '') {
//            vm.dtInstance.reloadData();
//        }
//    }
//    $scope.add = function () {
//        if ($rootScope.ProductID != '') {
//            var modalInstance = $uibModal.open({
//                animation: true,
//                templateUrl: ctxfolder + '/fileAdd.html',
//                controller: 'fileAdd',
//                backdrop: 'static',
//                size: '50',
//            });
//            modalInstance.result.then(function (d) {
//                reloadData()
//            }, function () { });
//        }
//    }

//    $scope.edit = function (id) {
//        var modalInstance = $uibModal.open({
//            animation: true,
//            templateUrl: ctxfolder + '/fileEdit.html',
//            controller: 'fileEdit',
//            backdrop: 'static',
//            size: '50',
//            resolve: {
//                para: function () {
//                    return id;
//                }
//            }
//        });
//        modalInstance.result.then(function (d) {
//            reloadData()
//        }, function () { });
//    }
//    $scope.delete = function (id) {
//        var modalInstance = $uibModal.open({
//            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
//            windowClass: "message-center",
//            controller: function ($scope, $uibModalInstance) {
//                $scope.message = "Bạn có chắc chắn muốn xóa ?";
//                $scope.ok = function () {
//                    dataservice.deleteFile(id, function (rs) {rs=rs.data;
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
//    function loadDate() {
//        $("#FromDate").datepicker({
//            inline: false,
//            autoclose: true,
//            format: "dd/mm/yyyy",
//            fontAwesome: true,
//        }).on('changeDate', function (selected) {
//            var maxDate = new Date(selected.date.valueOf());
//            $('#ToDate').datepicker('setStartDate', maxDate);
//        });
//        $("#ToDate").datepicker({
//            inline: false,
//            autoclose: true,
//            format: "dd/mm/yyyy",
//            fontAwesome: true,
//        }).on('changeDate', function (selected) {
//            var maxDate = new Date(selected.date.valueOf());
//            $('#FromDate').datepicker('setEndDate', maxDate);
//        });
//        //$('.end-date').click(function () {
//        //    $('#DateFrom').datepicker('setEndDate', null);
//        //});
//        //$('.start-date').click(function () {
//        //    $('#DateTo').datepicker('setStartDate', null);
//        //});
//    }
//    loadDate();
//    setTimeout(function () {
//        loadDate();
//    }, 200);
//});
//app.controller('fileAdd', function ($scope, $rootScope, $compile, $uibModalInstance, dataservice) {
//    $scope.treeData = [];
//    $scope.model = {
//        FileName: '',
//        Desc: '',
//        RepoCode: '',
//        SupplierId: '',
//    };
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    };
//    $scope.readyCB = function () {
//        App.blockUI({
//            target: "#contentMainRepository",
//            boxed: true,
//            message: 'loading...'
//        });
//        dataservice.jtreeRepository(function (result) {result=result.data;
//            var root = {
//                id: 'root',
//                parent: "#",
//                text: "Tất cả kho dữ liệu",
//                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
//            }
//            $scope.treeData.push(root);
//            for (var i = 0; i < result.length; i++) {
//                if (result[i].Parent == '#') {
//                    var data = {
//                        id: result[i].ReposID,
//                        reposCode: result[i].ReposCode,
//                        parent: 'root',
//                        text: result[i].ReposName,
//                        state: { selected: false, opened: true }
//                    }
//                    $scope.treeData.push(data);
//                } else {
//                    var data = {
//                        id: result[i].ReposID,
//                        reposCode: result[i].ReposCode,
//                        parent: result[i].Parent,
//                        text: result[i].ReposName,
//                        state: { selected: false, opened: true }
//                    }
//                    $scope.treeData.push(data);
//                }
//            }
//            App.unblockUI("#contentMainRepository");
//        });
//    }
//    $scope.searchRepository = function (search) {
//        if (search != '' && search != undefined) {
//            $("#treeDiv").jstree("close_all");
//            $('#treeDiv').jstree(true).search(search);
//        }
//    }
//    $scope.searchTreeRepository = function (e, data) {
//        if (data.res.length === 0) {
//            App.toastrWarning('Không tìm thấy kho lưu trữ');
//        };
//    }
//    $scope.selectNodeRepository = function (node, selected, event) {
//        $scope.model.Category = selected.node.original.id;
//    }
//    $scope.treeConfig = {
//        core: {
//            multiple: false,
//            animation: true,
//            error: function (error) {
//                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
//            },
//            check_callback: true,
//            worker: true,

//        },
//        types: {
//            default: {
//                icon: 'fa fa-folder icon-state-warning'
//            }
//        },
//        version: 1,
//        plugins: ['checkbox', 'types', 'search', 'state'],
//        checkbox: {
//            "three_state": false,
//            "whole_node": true,
//            "keep_selected_style": true,
//            "cascade": "undetermined",
//        },
//        types: {
//            valid_children: ["selected"],
//            types: {
//                "selected": {
//                    "select_node": false
//                }
//            },
//            "default": {
//                "icon": "fa fa-folder icon-state-warning icon-lg"
//            },
//            "file": {
//                "icon": "fa fa-file icon-state-warning icon-lg"
//            }
//        },
//    };
//    $scope.treeEvents = {
//        'ready': $scope.readyCB,
//        'select_node': $scope.selectNodeRepository,
//        'search': $scope.searchTreeRepository,
//    }
//    $scope.submit = function () {
//        var file = document.getElementById("File").files[0];
//        if (file == null || file == undefined) {
//            App.toastrError("Vui lòng chọn tệp tin");
//        } else {
//            if ($scope.addformfile.validate()) {
//                var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
//                if (listNoteSelect.length == 0) {
//                    App.toastrError("Vui lòng chọn kho dữ liệu");
//                } else {
//                    debugger
//                    var data = new FormData();
//                    data.append("FileUpload", file);
//                    data.append("FileName", $scope.model.FileName);
//                    data.append("Desc", $scope.model.Desc);
//                    data.append("RepoCode", listNoteSelect[0].original.reposCode);
//                    data.append("ProductCode", $rootScope.ProductCode);
//                    dataservice.insertFile(data, function (result) {result=result.data;
//                        if (result.Error) {
//                            App.toastrError(result.Title);
//                        } else {
//                            App.toastrSuccess(result.Title);
//                            $uibModalInstance.close();
//                        }
//                    });
//                }
//            }
//        }
//    };

//    setTimeout(function () {
//        setModalDraggable('.modal-dialog');
//    }, 200);
//});
//app.controller('fileEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
//    $scope.treeData = [];
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    };
//    $scope.initData = function () {
//        dataservice.getFile(para, function (rs) {rs=rs.data;
//            if (rs.Error) {
//                App.toastrError(rs.Title);
//            } else {
//                $scope.model = rs.Object;
//            }
//        });
//    }
//    $scope.initData();
//    $scope.readyCB = function () {
//        App.blockUI({
//            target: "#contentMainRepository",
//            boxed: true,
//            message: 'loading...'
//        });
//        dataservice.jtreeRepository(function (result) {result=result.data;
//            var root = {
//                id: 'root',
//                parent: "#",
//                text: "Tất cả kho dữ liệu",
//                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
//            }
//            $scope.treeData.push(root);
//            for (var i = 0; i < result.length; i++) {
//                if (result[i].Parent == '#') {
//                    var data = {
//                        id: result[i].ReposID,
//                        parent: 'root',
//                        text: result[i].ReposName,
//                        reposCode: result[i].ReposCode,
//                        state: { selected: true ? result[i].ReposCode == $scope.model.RepoCode : false, opened: true }
//                    }
//                    $scope.treeData.push(data);
//                } else {
//                    var data = {
//                        id: result[i].ReposID,
//                        parent: result[i].Parent,
//                        text: result[i].ReposName,
//                        reposCode: result[i].ReposCode,
//                        state: { selected: true ? result[i].ReposCode == $scope.model.RepoCode : false, opened: true }
//                    }
//                    $scope.treeData.push(data);
//                }
//            }
//            App.unblockUI("#contentMainRepository");
//        });
//    }

//    $scope.searchRepository = function () {
//        $("#treeDiv").jstree("close_all");
//        $('#treeDiv').jstree(true).search($scope.model.Name);
//    }
//    $scope.searchTreeRepository = function (e, data) {
//        if (data.res.length === 0) {
//            App.toastrWarning('Không tìm thấy kho lưu trữ');
//        };
//    }
//    $scope.selectNodeRepository = function (node, selected, event) {
//        $scope.model.Category = selected.node.original.id;
//    }
//    $scope.treeConfig = {
//        core: {
//            multiple: false,
//            animation: true,
//            error: function (error) {
//                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
//            },
//            check_callback: true,
//            worker: true,

//        },
//        types: {
//            default: {
//                icon: 'fa fa-folder icon-state-warning'
//            }
//        },
//        version: 1,
//        plugins: ['checkbox', 'types', 'search', 'state'],
//        checkbox: {
//            "three_state": false,
//            "whole_node": true,
//            "keep_selected_style": true,
//            "cascade": "undetermined",
//        },
//        types: {
//            valid_children: ["selected"],
//            types: {
//                "selected": {
//                    "select_node": false
//                }
//            },
//            "default": {
//                "icon": "fa fa-folder icon-state-warning icon-lg"
//            },
//            "file": {
//                "icon": "fa fa-file icon-state-warning icon-lg"
//            }
//        },
//    };
//    $scope.treeEvents = {
//        //'ready': $scope.readyCB,
//        'select_node': $scope.selectNodeRepository,
//        'search': $scope.searchTreeRepository,
//    }
//    $scope.submit = function () {
//        var files = $("#File").get(0);
//        var file = files.files[0];
//        var fileName = '';
//        if ($scope.editformfile.validate()) {
//            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
//            if (listNoteSelect.length == 0) {
//                App.toastrError(caption.CUS_CURD_VALIDATE_REPOSITORY);
//            } else {
//                var data = new FormData();
//                data.append("Id", $scope.model.Id);
//                data.append("FileUpload", file);
//                data.append("FileName", $scope.model.FileName);
//                data.append("Desc", $scope.model.Desc);
//                data.append("RepoCode", listNoteSelect[0].original.reposCode);
//                dataservice.updateFile(data, function (result) {result=result.data;
//                    if (result.Error) {
//                        App.toastrError(result.Title);
//                    } else {
//                        App.toastrSuccess(result.Title);
//                        $uibModalInstance.close();
//                    }
//                });
//            }
//        }
//        //var fileName = '';

//        //if (file == null) {
//        //    $scope.model.SupplierId = $rootScope.Object.SupplierId;
//        //    dataservice.updateFile($scope.model, function (result) {result=result.data;
//        //        if (result.Error) {
//        //            App.toastrError(result.Title);
//        //        } else {
//        //            App.toastrSuccess(result.Title);
//        //            $uibModalInstance.close();
//        //        }
//        //    });
//        //}
//        //else {
//        //    data.append("FileUpload", file);
//        //    dataservice.uploadFile(data, function (rs) {rs=rs.data;
//        //        if (rs.Error) {
//        //            App.toastrError(result.Title);
//        //            return;
//        //        }
//        //        else {
//        //            $scope.model.SupplierId = $rootScope.Object.SupplierId;
//        //            $scope.model.FileName = rs.Object;
//        //            //$scope.model.CustomerID = $rootScope.CustomerId;
//        //            $scope.model.FileUrl = '/uploads/files/' + $scope.model.FileName;
//        //            $scope.model.FilePath = '~/upload/files/' + $scope.model.FileName;
//        //            dataservice.updateFile($scope.model, function (result) {result=result.data;
//        //                if (result.Error) {
//        //                    App.toastrError(result.Title);
//        //                } else {
//        //                    App.toastrSuccess(result.Title);
//        //                    $uibModalInstance.close();
//        //                }
//        //            });
//        //        }
//        //    });
//        //}
//    }
//    setTimeout(function () {
//        $scope.readyCB();
//        setModalDraggable('.modal-dialog');
//    }, 200);
//});



