var ctxfolder = "/views/admin/freeStorage";
var ctxfolderMessage = "/views/message-box";

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
        getProduct: function ( callback) {
            $http.post('/Admin/freeStorage/GetProduct',callback).then(callback);
        },
        getFloorInStoreByProductId: function (Id, callback) {
            $http.post('/Admin/freeStorage/GetFloorInStoreByProductId?Id='+Id, callback).then(callback);
        },
        getLineByFloor: function (data, callback) {
            $http.post('/Admin/freeStorage/GetLineByFloor?floorCode='+data, callback).then(callback);
        },
        getRackByLine: function (data, callback) {
            $http.post('/Admin/freeStorage/GetRackByLine?lineCode=' + data, callback).then(callback);
        },
        getItem: function (Id, callback) {
            $http.post('/Admin/freeStorage/GetItem?Id=' + Id, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/freeStorage/Update', data, callback).then(callback);
        },
        getQuantityEmptyInRack: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetQuantityEmptyInRack?rackCode=' + data, callback).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    //$rootScope.PERMISSION_FREE_STROEAGE = PERMISSION_FREE_STROEAGE;
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
                mess.Title = mess.Title.concat(" - ", caption.FREE_STORAGE_MSG_CODE_PRODUCT_NOBLANK_NOSPECIAL, "<br/>");
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
                    required: caption.FREE_STORAGE_MSG_ENTER_PRODUCT,
                    maxlength: caption.FREE_STORAGE_MSG_CODE_PRODUCT_CHAR
                },
                ProductName: {
                    required: caption.FREE_STORAGE_MSG_ENTER_NAME_PRODUCT,
                    maxlength: caption.FREE_STORAGE_MSG_NAME_PRODUCT_CHAR
                },
                Unit: {
                    required: caption.FREE_STORAGE_MSG_ENTER_UNIT,
                    maxlength: caption.FREE_STORAGE_MSG_UNIT_CHAR
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
            mess.Title = mess.Title.concat(" - ", caption.FREE_STORAGE_MSG_PHONENUMBER_NUMBER, "<br/>");
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
    $translateProvider.useUrlLoader('/Admin/freeStorage/Translation');
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
    $scope.model = {
        Id: '',
        Rack:'',
    }
    $scope.floors = [];
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/freeStorage/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Code = $scope.model.Code;
                d.Name = $scope.model.Name;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;

            //        public string Code { get; set; }
            //public string Name { get; set; }
            //public string FromTo { get; set; }
            //public string DateTo { get; set; }
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductQrCode').withTitle('{{"FREE_STORAGE_COL_PRODUCT_QR_CODE"|translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WHS_Name').withTitle('{{"FREE_STORAGE_COL_WHS_NAME"|translate}}').renderWith(function (data, type) {
        return data;
    }));
vm.dtColumns.push(DTColumnBuilder.newColumn('Position').withTitle('{{"FREE_STORAGE_COL_POSITION"|translate}}').renderWith(function (data, type) {
        return data;
    }));
vm.dtColumns.push(DTColumnBuilder.newColumn('PositionOld').withTitle('{{"FREE_STORAGE_COL_POSITION_OLD"|translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PositionOld').withTitle('Vị trí cũ').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('Người tạo').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Ngày tạo').renderWith(function (data, type) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle('Tên tầng').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('L_Text').withTitle('Dãy').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('RackName').withTitle('Kệ').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('RackPosition').withTitle('Vị trí kệ').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"CATEGORY_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
    //    return '<button ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.getProduct(function (result) {result=result.data;
            $scope.products = result;
        });

    }
    $scope.initData();

    $scope.submit = function () {
        //console.log($scope.model);
        if (!validationSelect($scope.model).Status) {
            $scope.model.QuantityEmpty = parseInt($scope.QuantityEmpty);
            $scope.model.Quantity = $scope.modelView.Quantity;
            dataservice.update($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error == true) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);

                        dataservice.getItem($scope.model.Id, function (rs) {rs=rs.data;
                            $scope.modelView = rs;
                        });
                        dataservice.getQuantityEmptyInRack($scope.model.Rack, function (rs) {rs=rs.data;


                            $scope.QuantityEmpty = rs;
                        });
                        $scope.reload();
                    }
                });
            
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Id == "" || data.Id == null) {
            $scope.errorId = true;
            mess.Status = true;
        } else {
            $scope.errorId = false;

        }
        if (data.Floor == "" || data.Floor == null) {
            $scope.errorFloor = true;
            mess.Status = true;
        } else {
            $scope.errorFloor = false;

        }
        if (data.Line == "" || data.Line == null) {
            $scope.errorLine = true;
            mess.Status = true;
        } else {
            $scope.errorLine = false;

        }
        if (data.Rack == "" || data.Rack == null) {
            $scope.errorRack = true;
            mess.Status = true;
        } else {
            $scope.errorRack = false;

        }
        return mess;
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Line" && $scope.model.Line != "") {
            $scope.errorLine = false;
        }
        if (SelectType == "Rack" && $scope.model.Rack != "") {
            $scope.errorRack = false;
           
            dataservice.getQuantityEmptyInRack($scope.model.Rack, function (rs) {rs=rs.data;
               
               
                $scope.QuantityEmpty = rs;
            });
        }
        if (SelectType == "Floor" && $scope.model.Floor != "") {
            $scope.errorFloor = false;
        }
        if (SelectType == "Id" && $scope.model.Id != "") {
            $scope.errorId = false;
        }
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
        //$('#FromTo').datepicker('setEndDate', $rootScope.DateNow);
        //$('#DateTo').datepicker('setStartDate', $rootScope.DateBeforeSevenDay);
        //$('#FromTo').datepicker('update', $rootScope.DateBeforeSevenDay);
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
    }
    
    setTimeout(function () {
        loadDate();
    }, 50);
    $scope.getFloorInStore = function () {
        dataservice.getFloorInStoreByProductId($scope.model.Id, function (rs) {rs=rs.data;
            debugger
            if(rs!=null)
                $scope.floors = rs; 
            $scope.model.Floor = "";
            $scope.model.Line = "";
            $scope.model.Rack = "";
        });
        dataservice.getItem($scope.model.Id, function (rs) {rs=rs.data;
            $scope.modelView = rs;
        });
    }

    $scope.getLineByFloor = function () {
        dataservice.getLineByFloor($scope.model.Floor, function (rs) {rs=rs.data;
            if (rs != null)
                $scope.lines = rs;
            $scope.model.Line = "";
            $scope.model.Rack = "";
        });
    }
    $scope.getRackByLine = function () {
        dataservice.getRackByLine($scope.model.Line, function (rs) {rs=rs.data;
            
            if (rs != null)
                $scope.racks = rs;
            $scope.model.Rack = "";
        });
    }
   
    $scope.reset = function () {
        $scope.floors = [];
        $scope.lines = [];
        $scope.racks = [];
        $scope.model.Floor = "";
        $scope.model.Line = "";
        $scope.model.Rack = "";
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    $rootScope.ProductCode ='';
    $scope.inheritances = [];
    $scope.productCategoryTypes = [];
    $scope.productTypes = [];
    $rootScope.ProductID = '';
    $scope.model = {
        FileName: '',
        ProductGroup: '',
        unit: '',
        ProductCode:''
    };
    $scope.ImageBase1 = $rootScope.BarDefault;
    $scope.ImageBase = "";
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {result=result.data;
            $scope.treedataLevel = result;
        });
        dataservice.getproductgroup(function (result) {result=result.data;
            $scope.productgroup = result;
        });
        dataservice.getInheritances($scope.model.ProductCode,function (result) {result=result.data;
            $scope.inheritances = result;
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
        if (data.GroupCode == "") {
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
                                            $scope.model.Image = '/uploads/images/' + rs.Object;
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
    $scope.getQrCodeFromString = function () {
        dataservice.getQrCodeFromString($scope.model.ProductCode, function (rs) {rs=rs.data;
            console.log(rs);
            if (rs == null || rs == "")
                $scope.ImageBase = $rootScope.QrDefault;
            else
                $scope.ImageBase = rs;
        });
        dataservice.getBarCodeFromString($scope.model.ProductCode, function (rs) {rs=rs.data;
            console.log(rs);
            $scope.ImageBase1 = rs;
        });
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model = para;
    $scope.ImageBase = "";
    $scope.inheritances = [];
    $scope.productCategoryTypes = [];
    $scope.productTypes = [];
    $rootScope.ProductID = $scope.model.Id;
    
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {result=result.data;
            $scope.treedataLevel = result;
        });
        dataservice.getproductgroup(function (result) {result=result.data;
            $scope.productgroup = result;
        });
        dataservice.getInheritances($scope.model.ProductCode,function (result) {result=result.data;
            $scope.inheritances = result;
        });
     
        dataservice.getProductTypes(function (result) {result=result.data;
            $scope.productTypes = result;
        });

    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData1 = function () {
        dataservice.getItem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
                $rootScope.ProductID = $scope.model.Id;
                $rootScope.ProductCode = $scope.model.ProductCode;
            }
        });
    }
    //$scope.initData1();
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
        if ($scope.addform.validate()) {
            //console.log($scope.model);
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
                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXIMUM);
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
                                            $scope.model.Image = '/uploads/images/' + rs.Object;
                                            console.log($scope.model);
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
                console.log($scope.model);
                dataservice.update($scope.model, function (rs) {rs=rs.data;
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.getQrCodeFromString = function () {
        dataservice.getQrCodeFromString($scope.model.ProductCode, function (rs) {rs=rs.data;
            console.log(rs);
            if (rs == null || rs == "")
                $scope.ImageBase = $rootScope.QrDefault;
            else
                $scope.ImageBase = rs;
        });
        dataservice.getBarCodeFromString($scope.model.ProductCode, function (rs) {rs=rs.data;
            console.log(rs);
            $scope.ImageBase1 = rs;
        });
    }
    $scope.getQrCodeFromString();
});

app.controller('more', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/freeStorage/JTableExtend",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $rootScope.ProductCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
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
    //end option table
//.Id,
//                            a.AttributeCode,
//                            a.AttributeName,
//                            a.Value,
//                            a.Note,
//                            a.CreatedTime
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("check").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //}).withOption('sClass', ''));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('ID').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeCode').withTitle("{{ 'FREE_STORAGE_VALIDATE_CODE_PROPERTIES' | translate }}").renderWith(function (data, type) {
        return data;
    }));
vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeName').withTitle("{{ 'FREE_STORAGE_VALIDATE_NAME_PROPERTIES' | translate }}").renderWith(function (data, type) {
        return data;
    }));
vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle("{{ 'FREE_STORAGE_VALIDATE_VALUE' | translate }}").renderWith(function (data, type) {
        return data;
    }));
vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle("{{ 'FREE_STORAGE_VALIDATE_NOTE' | translate }}").renderWith(function (data, type) {
        return data;
    }));
vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle("{{ 'FREE_STORAGE_VALIDATE_DAYPLUS' | translate }}").renderWith(function (data, type) {
        //return data;
        return $filter("date")(new Date(data), "dd/MM/yyyy");
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('{{"COM_LIST_COL_ACTION" | translate}}')).renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.add = function () {
        if ($rootScope.ProductID != '') {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/moreAdd.html',
                controller: 'moreAdd',
                backdrop: 'static',
                size: '40'
            });
            modalInstance.result.then(function (d) {
                $scope.reload()
            }, function () { });
        }
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/moreEdit.html',
            controller: 'moreEdit',
            backdrop: 'static',
            size: '40',
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
                    dataservice.deleteExtend(id, function (rs) {rs=rs.data;
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
app.controller('moreAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var msg = $rootScope.checkDataMore($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($rootScope.ProductID == '') {
                App.toastrError(caption.COM_MSG_ADD_BEFORE);
            }
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataservice.insertProductAttribute($scope.model, function (result) {result=result.data;
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
    var init = function () {
        dataservice.gettreedataLevel(function (result) {result=result.data;
            $scope.treedataLevel = result;
        });
    }
    init();
});
app.controller('moreEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataservice.getAttributeItem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs.Object;
            }
        });
    }
    $scope.initData();

    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.updateAttribute($scope.model, function (rs) {rs=rs.data;
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
    var init = function () {
        dataservice.gettreedataLevel(function (result) {result=result.data;
            $scope.treedataLevel = result;
        });
    }
    init();
});

app.controller('file', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
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
            url: "/Admin/freeStorage/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
            
                d.ProductCode = $rootScope.ProductCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                console.log(d);
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle($translate('{{"SUP_CURD_TAB_FILE_LIST_COL_TITLE" | translate}}')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileTypePhysic').withTitle($translate('{{"SUP_CURD_TAB_FILE_LIST_COL_TYPE" | translate}}')).renderWith(function (data, type) {
        var excel = ['.xlsm', '.xlsx', '.xlsb', '.xltx', '.xltm', '.xls', '.xlt', '.xls', '.xml', '.xml', '.xlam', '.xla', '.xlw', '.xlr'];
        var document = ['.txt'];
        var word = ['.docx', '.doc'];
        var pdf = ['.pdf'];
        var powerPoint = ['.pps', '.pptx'];
        var image = ['.jpg', '.png', '.PNG'];

        if (excel.indexOf(data) !== -1) {
            return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>';
        } else if (word.indexOf(data) !== -1) {
            return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>';
        } else if (document.indexOf(data) !== -1) {
            return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>';
        } else if (pdf.indexOf(data) !== -1) {
            return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>';
        } else if (powerPoint.indexOf(data) !== -1) {
            return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>';
        } else if (image.indexOf(data) !== -1) {
            return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle($translate('{{"SUP_CURD_TAB_FILE_LIST_COL_NOTE" | translate}}')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle($translate('{{"SUP_CURD_TAB_FILE_LIST_COL_CREATETIME" | translate}}')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('{{"COM_LIST_COL_ACTION" | translate}}')).renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.search = function () {
        if ($rootScope.ProductID != '') {
            vm.dtInstance.reloadData();
        }
    }
    $scope.add = function () {
        if ($rootScope.ProductID != '') {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/fileAdd.html',
                controller: 'fileAdd',
                backdrop: 'static',
                size: '50',
            });
            modalInstance.result.then(function (d) {
                reloadData()
            }, function () { });
        }
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/fileEdit.html',
            controller: 'fileEdit',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteFile(id, function (rs) {rs=rs.data;
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
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        });
        //$('.end-date').click(function () {
        //    $('#DateFrom').datepicker('setEndDate', null);
        //});
        //$('.start-date').click(function () {
        //    $('#DateTo').datepicker('setStartDate', null);
        //});
    }
    loadDate();
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('fileAdd', function ($scope, $rootScope, $compile, $uibModalInstance, dataservice) {
    $scope.treeData = [];
    $scope.model = {
        FileName: '',
        Desc: '',
        RepoCode: '',
        SupplierId: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.jtreeRepository(function (result) {result=result.data;
            var root = {
                id: 'root',
                parent: "#",
                text: "Tất cả kho dữ liệu",
                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
            }
            $scope.treeData.push(root);
            for (var i = 0; i < result.length; i++) {
                if (result[i].Parent == '#') {
                    var data = {
                        id: result[i].ReposID,
                        reposCode: result[i].ReposCode,
                        parent: 'root',
                        text: result[i].ReposName,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeData.push(data);
                } else {
                    var data = {
                        id: result[i].ReposID,
                        reposCode: result[i].ReposCode,
                        parent: result[i].Parent,
                        text: result[i].ReposName,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeData.push(data);
                }
            }
            App.unblockUI("#contentMainRepository");
        });
    }
    $scope.searchRepository = function (search) {
        if (search != '' && search != undefined) {
            $("#treeDiv").jstree("close_all");
            $('#treeDiv').jstree(true).search(search);
        }
    }
    $scope.searchTreeRepository = function (e, data) {
        if (data.res.length === 0) {
            App.toastrWarning(caption.FREE_STORAGE_MSG_NOFIND_STORAGE);
        };
    }
    $scope.selectNodeRepository = function (node, selected, event) {
        $scope.model.Category = selected.node.original.id;
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
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        },
        types: {
            valid_children: ["selected"],
            types: {
                "selected": {
                    "select_node": false
                }
            },
            "default": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "file": {
                "icon": "fa fa-file icon-state-warning icon-lg"
            }
        },
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'search': $scope.searchTreeRepository,
    }
    $scope.submit = function () {
        var file = document.getElementById("File").files[0];
        if (file == null || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            if ($scope.addformfile.validate()) {
                var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
                if (listNoteSelect.length == 0) {
                    App.toastrError(caption.COM_VALIDATE_CHOOSE_DATA);
                } else {
                    debugger
                    var data = new FormData();
                    data.append("FileUpload", file);
                    data.append("FileName", $scope.model.FileName);
                    data.append("Desc", $scope.model.Desc);
                    data.append("RepoCode", listNoteSelect[0].original.reposCode);
                    data.append("ProductCode", $rootScope.ProductCode);
                    dataservice.insertFile(data, function (result) {result=result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            }
        }
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('fileEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.treeData = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataservice.getFile(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs.Object;
            }
        });
    }
    $scope.initData();
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.jtreeRepository(function (result) {result=result.data;
            var root = {
                id: 'root',
                parent: "#",
                text: "Tất cả kho dữ liệu",
                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
            }
            $scope.treeData.push(root);
            for (var i = 0; i < result.length; i++) {
                if (result[i].Parent == '#') {
                    var data = {
                        id: result[i].ReposID,
                        parent: 'root',
                        text: result[i].ReposName,
                        reposCode: result[i].ReposCode,
                        state: { selected: true ? result[i].ReposCode == $scope.model.RepoCode : false, opened: true }
                    }
                    $scope.treeData.push(data);
                } else {
                    var data = {
                        id: result[i].ReposID,
                        parent: result[i].Parent,
                        text: result[i].ReposName,
                        reposCode: result[i].ReposCode,
                        state: { selected: true ? result[i].ReposCode == $scope.model.RepoCode : false, opened: true }
                    }
                    $scope.treeData.push(data);
                }
            }
            App.unblockUI("#contentMainRepository");
        });
    }

    $scope.searchRepository = function () {
        $("#treeDiv").jstree("close_all");
        $('#treeDiv').jstree(true).search($scope.model.Name);
    }
    $scope.searchTreeRepository = function (e, data) {
        if (data.res.length === 0) {
            App.toastrWarning(caption.FREE_STORAGE_MSG_NOFIND_STORAGE);
        };
    }
    $scope.selectNodeRepository = function (node, selected, event) {
        $scope.model.Category = selected.node.original.id;
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
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        },
        types: {
            valid_children: ["selected"],
            types: {
                "selected": {
                    "select_node": false
                }
            },
            "default": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "file": {
                "icon": "fa fa-file icon-state-warning icon-lg"
            }
        },
    };
    $scope.treeEvents = {
        //'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'search': $scope.searchTreeRepository,
    }
    $scope.submit = function () {
        var files = $("#File").get(0);
        var file = files.files[0];
        var fileName = '';
        if ($scope.editformfile.validate()) {
            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
            if (listNoteSelect.length == 0) {
                App.toastrError(caption.CUS_CURD_VALIDATE_REPOSITORY);
            } else {
                var data = new FormData();
                data.append("Id", $scope.model.Id);
                data.append("FileUpload", file);
                data.append("FileName", $scope.model.FileName);
                data.append("Desc", $scope.model.Desc);
                data.append("RepoCode", listNoteSelect[0].original.reposCode);
                dataservice.updateFile(data, function (result) {result=result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
        //var fileName = '';

        //if (file == null) {
        //    $scope.model.SupplierId = $rootScope.Object.SupplierId;
        //    dataservice.updateFile($scope.model, function (result) {result=result.data;
        //        if (result.Error) {
        //            App.toastrError(result.Title);
        //        } else {
        //            App.toastrSuccess(result.Title);
        //            $uibModalInstance.close();
        //        }
        //    });
        //}
        //else {
        //    data.append("FileUpload", file);
        //    dataservice.uploadFile(data, function (rs) {rs=rs.data;
        //        if (rs.Error) {
        //            App.toastrError(result.Title);
        //            return;
        //        }
        //        else {
        //            $scope.model.SupplierId = $rootScope.Object.SupplierId;
        //            $scope.model.FileName = rs.Object;
        //            //$scope.model.CustomerID = $rootScope.CustomerId;
        //            $scope.model.FileUrl = '/uploads/files/' + $scope.model.FileName;
        //            $scope.model.FilePath = '~/upload/files/' + $scope.model.FileName;
        //            dataservice.updateFile($scope.model, function (result) {result=result.data;
        //                if (result.Error) {
        //                    App.toastrError(result.Title);
        //                } else {
        //                    App.toastrSuccess(result.Title);
        //                    $uibModalInstance.close();
        //                }
        //            });
        //        }
        //    });
        //}
    }
    setTimeout(function () {
        $scope.readyCB();
        setModalDraggable('.modal-dialog');
    }, 200);
});



