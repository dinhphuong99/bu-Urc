﻿var ctxfolder = "/views/admin/inventory";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce', 'monospaced.qrcode']);
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
            $http.post('/Admin/inventory/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/inventory/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/inventory/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/inventory/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/inventory/GetItem?Id=' + data).then(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/inventory/GetItemDetail/' + data).then(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/inventory/GetProductGroup/').then(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/Admin/inventory/GetProductUnit/').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/inventory/UploadImage/', data, callback);
        },
        getTotal: function (data, callback) {
            $http.post('/Admin/inventory/GetTotal', data).then(callback);
        },

        getInheritances: function (data, callback) {
            $http.post('/Admin/inventory/GetInheritances?productCode=' + data).then(callback);
        },
        getProductCategoryTypes: function (callback) {
            $http.post('/Admin/inventory/GetProductCategoryTypes/').then(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/Admin/inventory/GetProductTypes/').then(callback);
        },
        insertProductAttribute: function (data, callback) {
            console.log(data);
            $http.post('/Admin/inventory/InsertProductAttribute', data).then(callback);
        },
        deleteExtend: function (id, callback) {
            $http.post('/Admin/inventory/DeleteAttribute?Id=' + id).then(callback);
        },
        updateAttribute: function (data, callback) {
            $http.post('/Admin/inventory/UpdateAttribute', data).then(callback);
        },
        getAttributeItem: function (id, callback) {
            $http.post('/Admin/inventory/GetAttributeItem?id=' + id).then(callback);
        },
        jtreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/JtreeRepository').then(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/inventory/InsertFile/', data, callback);
        },

        deleteFile: function (data, callback) {
            $http.post('/Admin/inventory/DeleteFile?id=' + data).then(callback);
        },
        updateFile: function (data, callback) {
            submitFormUpload('/Admin/inventory/UpdateFile/', data, callback);
        },
        getFile: function (data, callback) {
            $http.get('/Admin/inventory/GetFile?id=' + data).then(callback);
        },
        getStores: function (callback) {
            $http.post('/Admin/inventory/GetStores').then(callback);
        },
        getListProductCode: function (callback) {
            $http.post('/Admin/inventory/GetListProductCode').then(callback);
        },
        getListLotProductCode: function (callback) {
            $http.post('/Admin/inventory/GetListLotProductCode').then(callback);
        },

        getListCoilByProdQrCode: function (data1, data2, data3, data4, callback) {
            $http.post('/Admin/MaterialExpStore/GetListCoilByProdQrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3 + '&productQrCode=' + data4).then(callback);
        },
        getListLotByProdQrCode: function (data1, data2, data3, data4, callback) {
            $http.post('/Admin/MaterialExpStore/GetListLotByProdQrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3 + '&productQrCode=' + data4).then(callback);
        },
        getListStore: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListStore').then(callback);
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
            // var partternCode = new RegExp("^[a-zA-Z0-9_äöüÄÖÜ]*$");
            //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ProductCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Mã sản phẩm không chứa ký tự đặc biệt hoặc khoảng trắng", "<br/>");
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
                    required: "Nhập sản phẩm!",
                    maxlength: "Mã sản phẩm không vượt quá 100 kí tự!"
                },
                ProductName: {
                    required: "Nhập tên sản phẩm!",
                    maxlength: "Tên sản phẩm không vượt quá 200 kí tự!"
                },
                Unit: {
                    required: "Nhập đơn vị!",
                    maxlength: "Đơn vị không vượt quá 200 kí tự!"
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
            mess.Title = mess.Title.concat(" - ", "Số điện thoại phải là chữ số [0-9]!", "<br/>");
        }
        return mess;
    }

    dataservice.getListStore(function (rs) {rs=rs.data;
        $rootScope.MapStores = {};
        for (var i = 0; i < rs.length; ++i) {
            $rootScope.MapStores[rs[i].Code] = rs[i];
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/inventory/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter, $window) {
    $scope.model = {
        ProductCode: '',
        StoreCode: '',
        LotProductCode: '',
        ProductQrCode: '',
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Inventory/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $scope.model.ProductCode;
                d.StoreCode = $scope.model.StoreCode;
                d.LotProductCode = $scope.model.LotProductCode;
                d.ProductQrCode = $scope.model.ProductQrCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [4, 'desc'])
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
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        //var Id = data.Id;
            //        $scope.edit(data);
            //    }
            //});
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"IN_LIST_COL_PRODUCT_CODE" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"IN_LIST_COL_PRODUCT_NAME" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketTitle').withTitle('{{"IN_LIST_COL_TICKET_TITLE" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeTicketCreate').withTitle('{{"IN_LIST_COL_TIME_TICKET_CREATE" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LotProductName').withTitle('{{"IN_LIST_COL_LOT_PRODUCT_NAME" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"IN_LIST_COL_QUANTITY" | translate}}').notSortable().renderWith(function (data, type) {
        if (data <= 100)
            return '<span class="text-success">' + $filter('currency')(data, '') + '</span>';
        else if (100 < data && data <= 500)
            return '<span class="text-warning"> ' + $filter('currency')(data, '') + '</span>';
        else
            return '<span class="text-danger"> ' + $filter('currency')(data, '') + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"IN_COL_QUANTITY_BOX" | translate}}').notSortable().renderWith(function (data, type, full) {
        return '<a class="text-success" ng-click="reportInStock(\'' + full.QrCode + '\')">Xem lượng tồn</a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"IN_COL_QUANTITY_LOT" | translate}}').notSortable().renderWith(function (data, type, full) {
        return '<a class="text-success" ng-click="reportLotInStock(\'' + full.QrCode + '\')">Xem lượng tồn</a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"IN_LIST_COL_UNIT" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{"IN_LIST_COL_STORE_NAME" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PathImg').withTitle('{{"IN_LIST_COL_PATH_IMG" | translate}}').notSortable().renderWith(function (data, type) {
        return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductGroup').withTitle('{{"IN_LIST_COL_PRODUCT_GROUP" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductType').withTitle('{{"IN_LIST_COL_PRODUCT_TYPE" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sQrCode').withTitle('{{"IN_LIST_COL_S_QR_CODE" | translate}}').notSortable().renderWith(function (data, type, full) {
        //return '<img class=" image-upload " style="width:50px; height:50px" role="button" src="data:image/png;base64, ' + data + '" />';
        return '<qrcode role="button" ng-click="viewQrCode(\'' + full.QrCode + '\')" data=' + full.QrCode + ' size="35"></qrcode>'
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"CATEGORY_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
    //    return '<button ng-click="edit()" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
    //}));

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
        $scope.getTotalValue();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
        $scope.getTotalValue();
    };
    $scope.search = function () {
        reloadData(true);
        $scope.getTotalValue();
    }
    $scope.initData = function () {
        //dataservice.gettreedataLevel(function (result) {result=result.data;
        //    $scope.treedataLevel = result;
        //});
        dataservice.getStores(function (result) {result=result.data;
            $scope.stores = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.stores.unshift(all)
        });
        dataservice.getListProductCode(function (result) {result=result.data;
            $scope.listProductCode = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listProductCode.unshift(all)
        });
        dataservice.getListLotProductCode(function (result) {result=result.data;
            $scope.listLotProductCode = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listLotProductCode.unshift(all)
        });

        setTimeout(function () {
            $scope.getTotalValue();
        }, 500);
    }
    $scope.initData();

    $scope.getTotalValue = function () {
        dataservice.getTotal($scope.model, function (result) {result=result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.sumQuantity = result.sumQuantity;
            }
        });
    };
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    //Thống kê lượng tồn cuộn/thùng theo sản phẩm
    $scope.reportInStock = function (productQrCode) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            ProductQrCode: productQrCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportInStock.html',
            controller: 'reportInStock',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });

    }

    //Thống kê lượng tồn cuộn/thùng theo Lot
    $scope.reportLotInStock = function (productQrCode) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            ProductQrCode: productQrCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportLotInStock.html',
            controller: 'reportLotInStock',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
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
    }, 50);

    //Export Excel
    $scope.export = function () {
        var orderBy = 'Id DESC';
        var exportType = 0;
        var orderArr = $scope.dtInstance.DataTable.order();
        var column;
        if (orderArr.length == 2) {
            column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
            orderBy = column.mData + ' ' + orderArr[1];
        } else if (orderArr.length > 0) {
            var order = orderArr[0];
            column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
            orderBy = column.mData + ' ' + order[1];
        }
        //var pageInfo = $scope.dtInstance.DataTable.page.info();
        //var obj = {
        //    start: pageInfo.row,
        //    length: pageInfo.length,
        //    //QueryOrderBy: orderBy,
        //    ExportType: exportType,
        //    Month: $scope.model.CustomerMonth,
        //    Packcode: $scope.model.PackCode,
        //    Cif: $scope.model.CustomerCif
        //};

        var page = vm.dtInstance.DataTable.page() + 1;
        var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/Inventory/ExportExcel?"
            //+ "page=" + page
            //+ "&row=" + length
            + "ProductCode=" + $scope.model.ProductCode
            + "&StoreCode=" + $scope.model.StoreCode
            + "&LotProductCode=" + $scope.model.LotProductCode
            + "&ProductQrCode=" + $scope.model.ProductQrCode
        //+ "&orderBy=" + orderBy
    }

    $scope.exportExcel = function () {
        var editItems = [];
        $scope.dataExport = "";
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            for (var j = 0; j < editItems.length; j++) {
                $scope.dataExport += editItems[j] + ",";
            }
            location.href = "/Admin/Inventory/Export?"
                + "listId=" + $scope.dataExport
        }
        else {
            App.toastrError("Không sản phẩm nào được chọn")
        }
    }

});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    $rootScope.ProductCode = '';
    $scope.inheritances = [];
    $scope.productCategoryTypes = [];
    $scope.productTypes = [];
    $rootScope.ProductID = '';
    $scope.model = {
        FileName: '',
        ProductGroup: '',
        unit: '',
        ProductCode: ''
    };
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {result=result.data;
            $scope.treedataLevel = result;
        });
        dataservice.getproductgroup(function (result) {result=result.data;
            $scope.productgroup = result;
        });
        dataservice.getInheritances($scope.model.ProductCode, function (result) {result=result.data;
            $scope.inheritances = result;
        });
        dataservice.getProductCategoryTypes(function (result) {result=result.data;

            $scope.productCategoryTypes = result;
        });
        dataservice.getProductTypes(function (result) {result=result.data;
            $scope.productTypes = result;
        });
    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;

        }
        if (data.ProductGroup == "") {
            $scope.errorProductGroup = true;
            mess.Status = true;
        } else {
            $scope.errorProductGroup = false;

        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ProductGroup" && $scope.model.ProductGroup != "") {
            $scope.errorProductGroup = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
            $scope.errorUnit = false;
        }
    }
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
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
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.submit = function () {
        validationSelect($scope.model);

        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            //console.log('Name File: ' + extFile);
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            debugger
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
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
                                            $scope.model.PathImg = '/uploads/images/' + rs.Object;
                                            dataservice.insert($scope.model, function (rs) {rs=rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);

                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $scope.model = rs.Object;
                                                    $rootScope.ProductID = $scope.model.Id;
                                                    $rootScope.ProductCode = $scope.model.ProductCode;
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
                        $scope.model = rs.Object;
                        $rootScope.ProductID = $scope.model.Id;
                        $rootScope.ProductCode = $scope.model.ProductCode;
                    }
                });
            }
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.tinymceOptions = {
        plugins: 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help',
        toolbar: "formatselect bold italic strikethrough forecolor link  alignleft aligncenter alignright alignjustify numlist bullist outdent indent removeformat fullscreen"
    };

});
app.controller('edit', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    $scope.model = {
        ProductCode: '',
        StoreCode: '',
        sQrCode: '',
    }
    $scope.model.ProductCode = para.ProductCode;
    $scope.model.StoreCode = para.StoreCode;
    $scope.model.sQrCode = para.sQrCode;
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Inventory/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $scope.model.ProductCode;
                d.StoreCode = $scope.model.StoreCode;
                //d.LotProductCode = $scope.model.LotProductCode;
                // d.ProductQrCode = $scope.model.sQrCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
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
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn("AccessLogId").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass'));


    //vm.dtColumns.push(DTColumnBuilder.newColumn('QrCode').withTitle('QrCode').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sQrCode').withTitle('{{"IN_LIST_COL_S_QR_CODE" | translate}}').notSortable().renderWith(function (data, type) {
        return '<img class=" image-upload " style="width:50px; height:50px" role="button" src="data:image/png;base64, ' + data + '" />';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"IN_CURD_LBL_SEARCH_PRODUCT_CODE" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"IN_LIST_COL_QUANTITY" | translate}}').notSortable().renderWith(function (data, type) {
        if (data <= 100)
            return '<span class="text-success">' + data + '</span>';
        else if (100 < data && data <= 500)
            return '<span class="text-warning"> ' + data + '</span>';
        else
            return '<span class="text-danger"> ' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"IN_LIST_COL_UNIT" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{"IN_LIST_COL_STORE_NAME" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PathImg').withTitle('{{"IN_LIST_COL_PATH_IMG" | translate}}').notSortable().renderWith(function (data, type) {
        return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductGroup').withTitle('{{"IN_LIST_COL_PRODUCT_GROUP" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductType').withTitle('{{"IN_LIST_COL_PRODUCT_TYPE" | translate}}').notSortable().renderWith(function (data, type) {
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('reportInStock', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, para) {
    var vm = $scope;
    $scope.model = {};

    $scope.listCoil = [];

    $scope.initLoad = function () {
        dataservice.getListCoilByProdQrCode('', '', '', para.ProductQrCode, function (rs) {rs=rs.data;
            $scope.listCoil = [];
            $scope.QuantityExpTotal = 0;
            $scope.RemainTotal = 0;
            if (rs.Object.length > 0) {
                for (var j = 0; j < rs.Object.length; j++) {
                    rs.Object[j].ValueCoil = rs.Object[j].Size;
                    rs.Object[j].QuantityExp = rs.Object[j].Size - rs.Object[j].Remain;
                    rs.Object[j].StoreCode = rs.Object[j].RackCode.split("_")[rs.Object[j].RackCode.split("_").length - 1];
                    var store = $rootScope.MapStores[rs.Object[j].StoreCode];
                    if (store != undefined) {
                        rs.Object[j].StoreName = store.Name;
                    }

                    var productCoil = rs.Object[j].ProductCoil;
                    rs.Object[j].RuleCoil = productCoil.split("_")[productCoil.split("_").length - 2];

                    $scope.QuantityExpTotal = $scope.QuantityExpTotal + rs.Object[j].QuantityExp;
                    $scope.RemainTotal = $scope.RemainTotal + rs.Object[j].Remain;

                    $scope.listCoil.push(rs.Object[j]);
                }
            }
        });
    }
    $scope.initLoad();
    //Hết khởi tạo

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadPoper();
    }, 200);
});

app.controller('reportLotInStock', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, para) {
    var vm = $scope;
    $scope.model = {};

    $scope.listLot = [];

    $scope.initLoad = function () {
        dataservice.getListLotByProdQrCode('', '', '', para.ProductQrCode, function (rs) {rs=rs.data;
            $scope.listLot = [];
            $scope.QuantityTotal = 0;
            $scope.QuantityUnitTotal = 0;
            if (rs.Object.length > 0) {
                for (var j = 0; j < rs.Object.length; j++) {
                    var store = $rootScope.MapStores[rs.Object[j].StoreCode];
                    if (store != undefined) {
                        rs.Object[j].StoreName = store.Name;
                    }

                    $scope.QuantityTotal = $scope.QuantityTotal + rs.Object[j].Quantity;
                    $scope.QuantityUnitTotal = $scope.QuantityUnitTotal + rs.Object[j].QuantityUnit;

                    $scope.listLot.push(rs.Object[j]);
                }
            }
        });
    }
    $scope.initLoad();
    //Hết khởi tạo

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadPoper();
    }, 200);
});

