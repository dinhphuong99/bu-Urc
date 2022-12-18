﻿var ctxfolder = "/views/admin/edmsWareHouseReceipt";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput']);
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
app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 401) {
                var url = "/Home/Logout";
                location.href = url;
            }
            return $q.reject(rejection);
        }
    };
}]);
app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
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
            beforeSend: function () {
                App.blockUI({
                    target: "#contentFile",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#contentFile");
            },
            data: data
        }
        $http(req).success(callback);
    };

    return {
        //Danh sách Y/C nhập kho ở trạng thái đang chờ
        getListRequestProfile: function (callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetListRequestProfile', callback).success(callback);
        },
        //Danh sách kho
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListWareHouse?type=' + 'RV', callback).success(callback);
        },
        //Danh sách chi nhánh
        loadBranch: function (callback) {
            $http.post('/Admin/User/GetBranch/').success(callback);
        },
        //Danh sách người dùng theo chi nhánh
        getListUserByBranchCode: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetListUserByBranchCode?branchCode=' + data, callback).success(callback);
        },
        //List danh sách người dùng thuộc Kho
        getListWareHouseUser: function (callback) {
            $http.post('/Admin/EDMSWareHouseBill/GetListWareHouseUser/', callback).success(callback);
        },
        //List danh sách nhân viên
        getListStaffBranch: function (callback) {
            $http.post('/Admin/EDMSWareHouseBill/GetListStaffBranch/', callback).success(callback);
        },
        //Lấy thông tin tên Kho,Tầng,Dãy,Kệ từ code
        getNameObjectType: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetNameObjectType', data).success(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManager/GetListFloorByWareHouseCode?wareHouseCode=' + data).success(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManager/GetListLineByFloorCode?floorCode=' + data).success(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManager/GetListRackByLineCode?lineCode=' + data).success(callback);
        },
        getPosition: function (data, callback) {
            $http.get('/Admin/EDMSWareHouseReceipt/GetPosition?wareHouseCode=' + data).success(callback);
        },

        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GeneratorQRCode?code=' + data).success(callback);
        },
        genBoxCode: function (boxNumber, branchCode, docType, userId, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GenBoxCode?boxNumber=' + boxNumber + '&branchCode=' + branchCode + '&docType=' + docType + '&userId=' + userId, callback).success(callback);
        },
        getListDocumentType: function (callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetListDocumentType').success(callback);
        },
        getIdMax: function (callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetIdMax').success(callback);
        },
        getRequestInputStoreDetail: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetRequestInputStoreDetail?id=' + data).success(callback);
        },
        getReceiptInputStoreDetail: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetReceiptInputStoreDetail?id=' + data).success(callback);
        },
        getBoxDetail: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetBoxDetail?id=' + data).success(callback);
        },
        insertReceiptInputStore: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/InsertReceiptInputStore', data, callback).success(callback);
        },
        updateReceiptInputStore: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/UpdateReceiptInputStore', data, callback).success(callback);
        },
        deleteReceiptInputStore: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/DeleteReceiptInputStore?id=' + data, callback).success(callback);
        },
        insertBox: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/InsertBox', data, callback).success(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/EDMSWareHouseReceipt/UploadFile', data, callback);
        },
        removeFileRec: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/RemoveFileReceipt?fileId=' + data, callback).success(callback);
        },
        removeFileBox: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/RemoveFileBox?fileId=' + data, callback).success(callback);
        },
        //Lấy ra thời gian lưu trữ quy định
        getStorageTimeLimit: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetStorageTimeLimit/' + data).success(callback);
        },
        //Lấy ra thùng số
        getNumBoxth: function (data, data1, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetNumBoxth?brCode=' + data + '&whCode=' + data1).success(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $translate, $cookies, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.listSercurity = [
        {
            Code: "1",
            Value: "Thấp"
        }, {
            Code: "2",
            Value: "Trung bình"
        }, {
            Code: "3",
            Value: "Cao"
        }];
    $rootScope.isTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $rootScope.validationOptions = {
            rules: {
                FromDate: {
                    required: true,
                },
                ToDate: {
                    required: true,
                },
            },
            messages: {
                FromDate: {
                    //required: "Từ ngày y/c bắt buộc",
                    required: (caption.EDWHR_VALIDATE_FORM_DATE),

                },
                ToDate: {
                    // required: "Đến ngày y/c bắt buộc",
                    required: (caption.EDWHR_VALIDATE_TO_DATE),
                },
            }
        }
        $rootScope.validationOptionsOrderBox = {
            rules: {
                RackPosition: {
                    required: true,
                },
            },
            messages: {
                RackPosition: {
                    required: 'Vị trí yêu cầu bắt buộc',
                },
            }
        }
        $rootScope.isTranslate = true;
    });
    $rootScope.showListFloor = true;
    $rootScope.showListLine = false;
    $rootScope.showListRack = false;

    $rootScope.listWareHouse = [];
    $rootScope.listFloor = [];
    $rootScope.listLine = [];
    $rootScope.listRack = [];

    $rootScope.wareHouseID = null;
    $rootScope.floorID = null;
    $rootScope.lineID = null;
    $rootScope.rackID = null;

    $rootScope.wareHouseCode = 0;
    $rootScope.floorCode = 0;
    $rootScope.lineCode = 0;
    $rootScope.rackCode = 0;

    $rootScope.positionBox = 'Chưa có vị trí';
    $rootScope.cntBox = null;
    $rootScope.chooseBoxObj = {};
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/pdfViewer', {
            templateUrl: ctxfolder + '/pdfViewer.html',
            controller: 'pdfViewer'
        });

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
    $httpProvider.interceptors.push('interceptors');
    $httpProvider.interceptors.push('httpResponseInterceptor');
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService, $window) {
    var vm = $scope;
    $scope.model = {
        RcTicketCode: '',
        BrCode: '',
        WHS_Code: '',
        WHS_User: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.listBranch = [];
    $scope.listWareHouse = [];
    $scope.listWareHouseUser = [];
    $scope.listStaffBranch = [];

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWareHouseReceipt/JTable",
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
                d.RcTicketCode = $scope.model.RcTicketCode;
                d.BrCode = $scope.model.BrCode;
                d.WHS_Code = $scope.model.WHS_Code;
                d.WHS_User = $scope.model.WHS_User;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Staff = $scope.model.Staff;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        .withOption('stateSave', true)
        .withOption('stateSaveCallback', function (settings, data) {
            sessionStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
        })
        .withOption('stateLoadCallback', function (settings) {
            if ($rootScope.savePageState) {
                return JSON.parse(sessionStorage.getItem('DataTables_' + settings.sInstance));
            } else {
                return settings.sInstance;
            }
        })
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
            $rootScope.savePageState = true;
        })
        .withOption('createdRow', function (row, data, dataIndex) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RcTicketCode').withTitle('{{"EDWHR_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrgName').withTitle('{{"EDWHR_LIST_COL_BRANCH" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"EDWHR_LIST_COL_ENTER_PEOPLE"|translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"EDWHR_LIST_COL_SENDER"|translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"EDWHR_LIST_COL_DAY_SEND" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WHS_Name').withTitle('{{"EDWHR_LIST_COL_WARE_HOUSE_SEND" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('{{"EDWHR_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
    //    return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 60;
    } else if ($window.innerWidth > 1400) {
        size = 50;
    }
    $scope.search = function () {
        reloadData(true);
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
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#DateTo').datepicker('setStartDate', date);
            }
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    $scope.reload = function () {
        reloadData(false);
    }
    $scope.initLoad = function () {
        dataservice.loadBranch(function (rs) {
            if (!rs.Error) {
                $scope.listBranch = rs;
            }
        });
        dataservice.getListWareHouse(function (rs) {
            $scope.listWareHouse = rs;
        });
        dataservice.getListWareHouseUser(function (rs) {
            $scope.listWareHouseUser = rs.Object;
        });
        dataservice.getListStaffBranch(function (rs) {
            $scope.listStaffBranch = rs.Object;
        });
    }
    $scope.initLoad();
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var model = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].id == id) {
                model = listdata[i];
                break;
            }
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return {
                        id
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadData();
        }, function () { });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteReceiptInputStore(id, function (rs) {
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
            $scope.reloadData();
        }, function () {
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
    }, 50);
});
app.directive('customOnChange', function () {
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

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout) {
    $scope.NumBoxthStart = null;
    //Start Khởi tạo
    $scope.modelDisable = {
        BrCode: false,
        WHS_Code: false,
    };

    $scope.errorBrCode = false;
    $scope.errorWHSUser = false;
    $scope.errorWHSCode = false;
    $scope.errorPersonSender = false;

    $scope.IsEnabledRequest = false;
    $scope.listRequest = [];
    $scope.listBranch = [];
    $scope.listWareHouse = [];
    $scope.listWareHouseUser = [];
    $scope.listStaffBranch = [];
    $scope.listDocumentType = [];
    $scope.listBoxTemp = [];
    $scope.listBoxIdDelete = [];
    $scope.listFileBox = [];
    $scope.modelShow = {};

    $scope.no = 1;
    $scope.branch = '';
    $scope.type = '';
    $scope.user = '';
    $scope.statusEditBox = false;
    $scope.isEditBox = false;

    $scope.boxNumber = '';
    $scope.branchCode = '';
    $scope.docType = '';
    $scope.userId = '';

    $scope.branchName = '';
    $scope.typeProfileName = '';
    $scope.RcTicketCodeUpdate = '';

    $scope.QR_Code_Box = '';
    $scope.QR_Code_Req = '';
    $scope.Item = '';

    $scope.listDocTypes = [];
    $scope.listUsers = [];
    $scope.listDocTypeAll = [];

    $scope.obj = {
        WareHouseCode: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        WareHouseName: '',
        FloorName: '',
        LineName: '',
        RackName: '',
    }

    $scope.model = {
        Id: 0,
        RqId: '',
        RcTicketCode: '',
        BrCode: '',
        WHS_Code: '',
        WHS_User: '',
        NumBox: 0,
        DocType: '',
        FromDate: '',
        ToDate: '',
        Note: '',
        QR_Code: '',
        RcStatus: '',
        RcSupport: '',
        PersonSender: '',
        ListBox: [],
        ListBoxIDDelete: [],
        ListFileReceipt: [],
        ListFileReceiptRemove: [],
        Box: {
            Id: 0,
            BoxCode: '',
            TypeProfile: '',
            LstTypeProfileId: '',
            DepartCode: '',
            NumBoxth: '',
            PackingStaff: '',
            StartTime: '',
            EndTime: '',
            StorageTime: '',
            StatusSecurity: '',
            StoragePeriod: '',
            LstMemberId: '',
            ListFileBox: [],
            ListFileBoxRemove: [],
            RcCode: ''
        }
    };
    //End Khởi tạo
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.orderBox = function () {
        if ($scope.model.ListBox.length == 0) {
            App.toastrError("Danh sách thùng đang trống. Vui lòng thêm thùng trước khi xếp");
            return;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/orderBox.html',
            controller: 'orderBox',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return $scope.model.ListBox;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    }

    $scope.initLoad = function () {
        dataservice.getListRequestProfile(function (result) {
            $scope.listRequest = result;
        });

        dataservice.loadBranch(function (rs) {
            if (!rs.Error) {
                $scope.listBranch = rs;
            }
        });

        dataservice.getListWareHouse(function (rs) {
            $scope.listWareHouse = rs;
        });

        dataservice.getListDocumentType(function (result) {
            $scope.listDocumentType = result;
        });

        dataservice.getIdMax(function (rs) {
            $scope.no = rs;
        });

        dataservice.getListWareHouseUser(function (rs) {
            $scope.listWareHouseUser = rs.Object;
        });
        dataservice.getListStaffBranch(function (rs) {
            $scope.listStaffBranch = rs.Object;
        });
    }
    $scope.initLoad();

    $scope.createRecCode = function (no, branch, type, user) {
        var result = "";
        var date = new Date();
        var time = (date.getMonth() + 1) + '' + date.getDate() + '' + date.getFullYear();
        var today = moment().format('DDMMYYYY');
        result = "rci." + no + "_b." + branch + "_v." + type + "_u." + user + "_t." + today;
        $scope.model.RcTicketCode = result;
        dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };
    $scope.removeUser = function (index) {
        if ($scope.listUsers[index].Code == $scope.model.Box.PackingStaff)
            $scope.model.Box.PackingStaff = '';

        $scope.listUsers.splice(index, 1);
        if ($scope.listUsers.length == 0)
            $scope.model.Box.PackingStaff = '';
    }
    $scope.removeDocType = function (index) {
        if ($scope.listDocTypes[index].id == $scope.model.Box.TypeProfile) {
            $scope.model.Box.TypeProfile = '';
            $scope.model.Box.StoragePeriod = '';
            $scope.modelShow.StoragePeriod = '';
        }

        $scope.listDocTypes.splice(index, 1);
        if ($scope.listDocTypes.length == 0) {
            $scope.model.Box.TypeProfile = '';
            $scope.model.Box.StoragePeriod = '';
            $scope.modelShow.StoragePeriod = '';
        }
    }
    $scope.removeItem = function (index, item) {

        var idDelete = $scope.listBoxTemp[index].Id;
        $scope.listBoxIdDelete.push(idDelete);
        $scope.listBoxTemp.splice(index, 1);

        //$scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
        //Lấy thùng số theo thùng số vừa xóa
        $scope.model.Box.NumBoxth = item.NumBoxth;
        $scope.model.NumBox = $scope.listBoxTemp.length;
        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
        //Mở chọn chi nhánh & kho nếu xóa hết thùng
        if ($scope.listBoxTemp.length == 0) {
            $scope.modelDisable = {
                BrCode: false,
                WHS_Code: false,
            };
        }
    }
    $scope.removeFileRec = function (index) {
        var itemRemove = $scope.model.ListFileReceipt[index];

        if (itemRemove.FileId != null) {
            $scope.model.ListFileReceiptRemove.push(itemRemove);
        }
        $scope.model.ListFileReceipt.splice(index, 1);
    }
    $scope.removeFileBox = function (index) {
        var itemRemove = $scope.listFileBox[index];

        if (itemRemove.FileId != null) {
            $scope.Item.ListFileBoxRemove.push(itemRemove);
        }
        $scope.listFileBox.splice(index, 1);
    }

    $scope.changeRequest = function (rqId) {
        if (rqId != '') {
            switch ($scope.IsEnabledRequest) {
                case true:
                    $scope.initDataChooseRequest(rqId);
                    break;
                case false:
                    App.toastrError(caption.EDWHR_MSG_CHOSE_REQUEST_WARE_HOUSE)
                    break;
            }
        } else {
            if ($scope.IsEnabledRequest)
                App.toastrError(caption.EDWHR_CHOSE_CODE_WAREHOUSE)
        }
    }

    //Khi tích chọn Y/C nhập
    $scope.checkedRequest = function (rqId) {
        if (rqId != '') {
            switch ($scope.IsEnabledRequest) {
                case true:
                    $scope.initDataChooseRequest(rqId);
                    break;
                case false:
                    $scope.clearDataUnCheckedRequest();
                    break;
            }
        } else {
            if ($scope.IsEnabledRequest)
                App.toastrError("Vui lòng chọn 1 mã Y/C nhập kho !")
        }
    }

    //Gán dữ liệu vào các ô theo mã Y/C
    $scope.initDataChooseRequest = function (rqId) {
        dataservice.getRequestInputStoreDetail(rqId, function (rs) {
            $scope.model = rs;
            $scope.model.WHS_User = '';
            $scope.model.RqId = rs.Id;
            $scope.model.ListFileReceipt = rs.ListFileRequest;
            $scope.listBoxTemp = rs.ListBox;

            //Gán mã Y/C Trước khi có sự thay đổi
            $scope.RcTicketCodeUpdate = $scope.model.RcTicketCode;

            var a = $scope.listBranch.filter(k => k.OrgAddonCode === $scope.model.BrCode);
            $scope.branch = change_alias(a[0].OrgName);
            $scope.branchName = a[0].OrgName;
            $scope.branchCode = $scope.model.BrCode;

            //Hiển thị QR_Code
            dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
                $scope.QR_Code_Req = result;
            });

            //Lấy danh sách loại chứng từ hiển thị lên
            var listDocTypeID = $scope.model.DocType.split(',');
            if (listDocTypeID.length > 0) {
                $scope.listDocTypeAll = [];
                for (var i = 0; i < listDocTypeID.length; i++) {

                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(listDocTypeID[i]));
                    if (a.length > 0) {
                        $scope.type = change_alias(a[0].Code);
                        $scope.typeProfileName = a[0].ValueSet;
                        var obj = { id: a[0].SettingID, text: a[0].ValueSet };

                        var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                        if (checkExits.length === 0) {
                            $scope.listDocTypeAll.push(obj);
                        }
                    }
                }
            }

            $scope.user = $scope.model.WHS_User;
            $rootScope.wareHouseCode = $scope.model.WHS_Code;
            //Tạo mã cho phiếu nhập kho
            $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
        });
    }

    $scope.clearDataUnCheckedRequest = function () {
        $scope.model.RqId = '';
    }

    $scope.changeSelect = function (type, id) {
        switch (type) {
            case "BRANCH":
                $scope.errorBrCode = false;
                var a = $scope.listBranch.filter(k => k.OrgAddonCode === id);
                $scope.branch = change_alias(a[0].OrgName);
                $scope.branchName = a[0].OrgName;
                $scope.branchCode = id;

                //Lấy ra số thùng tiếp theo
                if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
                    && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.BrCode, $scope.model.WHS_Code, function (rs) {
                        $scope.model.Box.NumBoxth = rs;
                        $scope.NumBoxthStart = rs;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
                    });
                }

                //Tạo mã phiếu Y/C
                $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
                break;
            case "WAREHOUSE_USER":
                $scope.errorWHSUser = false;
                var a = $scope.listWareHouseUser.filter(k => k.Code === id);
                $scope.user = change_alias(a[0].Code);
                //Tạo mã phiếu Y/C
                $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
                break;

            case "WAREHOUSE":
                $scope.errorWHSCode = false;
                //Lấy ra số thùng tiếp theo
                if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
                    && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.BrCode, $scope.model.WHS_Code, function (rs) {
                        $scope.model.Box.NumBoxth = rs;
                        $scope.NumBoxthStart = rs;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
                    });
                }

                $rootScope.wareHouseCode = id;
                break;

            case "PERSONSENDER":
                $scope.errorPersonSender = false;
            case "DOCUMENTTYPE":
                var a = $scope.listDocumentType.filter(k => k.SettingID === id);
                if (a.length > 0) {
                    $scope.type = change_alias(a[0].Code);
                    $scope.typeProfileName = a[0].ValueSet;
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                    if (checkExits.length === 0) {
                        $scope.listDocTypes = [];
                        $scope.listDocTypes.push(obj);
                        //Lấy thời gian lưu trữ
                        dataservice.getStorageTimeLimit(id, function (rs) {
                            $scope.model.Box.StoragePeriod = rs;
                            if (rs == 1000) {
                                $scope.modelShow.StoragePeriod = 'Vĩnh viễn';
                            } else if (rs == 500) {
                                $scope.modelShow.StoragePeriod = 'Đến khi văn bản hết hiệu lực thi hành';
                            } else if (rs == 200) {
                                $scope.modelShow.StoragePeriod = 'Theo tuổi thọ công trình, thiết bị';
                            } else {
                                $scope.modelShow.StoragePeriod = rs;
                            }
                        });
                    }
                    $scope.docType = id;
                }

                //Tạo mã phiếu Y/C
                $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);

                //Tạo Mã cho thùng
                dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                    $scope.model.Box.BoxCode = rs;

                    dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                        $scope.QR_Code_Box = result;
                    });
                });
                break;
            case "PACKING_STAFF":
                var a = $scope.listStaffBranch.filter(k => k.Code === id);
                $scope.userId = id;
                //var obj = { text: a[0].UserName };
                var obj = { Code: a[0].Code, text: a[0].Name };
                var checkExits = $scope.listUsers.filter(k => k.Code === a[0].Code);
                if (checkExits.length === 0) {
                    $scope.listUsers.push(obj);
                }
                //Tạo Mã cho thùng
                dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                    $scope.model.Box.BoxCode = rs;

                    dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                        $scope.QR_Code_Box = result;
                    });
                });
                break;
        }
    };
    $scope.changeBoxNumber = function (boxNumber) {
        $scope.boxNumber = boxNumber;
        dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
            $scope.model.Box.BoxCode = rs;

            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.QR_Code_Box = result;
            });
        });
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.BrCode == "" || data.BrCode == null || data.BrCode == undefined) {
            $scope.errorBrCode = true;
            mess.Status = true;
        } else {
            $scope.errorBrCode = false;
        }
        if (data.WHS_User == "" || data.WHS_User == null || data.WHS_User == undefined) {
            $scope.errorWHSUser = true;
            mess.Status = true;
        } else {
            $scope.errorWHSUser = false;
        }
        if (data.WHS_Code == "" || data.WHS_Code == null || data.WHS_Code == undefined) {
            $scope.errorWHSCode = true;
            mess.Status = true;
        } else {
            $scope.errorWHSCode = false;
        }
        if (data.PersonSender == "" || data.PersonSender == null || data.PersonSender == undefined) {
            $scope.errorPersonSender = true;
            mess.Status = true;
        } else {
            $scope.errorPersonSender = false;
        }
        return mess;
    };

    $scope.getValueStaff = function (listMemberId) {
        var arrMemberId = listMemberId.split(',');
        $scope.listUsers = [];
        for (var i = 0; i < arrMemberId.length; i++) {
            $scope.model.Box.PackingStaff = arrMemberId[i];

            //var a = $scope.listWareHouseUser.filter(k => k.Code === arrMemberId[i]);
            var a = $scope.listStaffBranch.filter(k => k.Code === arrMemberId[i]);
            //var obj = { text: a[0].UserName };
            if (a.length > 0) {
                //var obj = { Code: a[0].Code, text: a[0].GivenName };
                var obj = { Code: a[0].Code, text: a[0].Name };
                var checkExits = $scope.listUsers.filter(k => k.Code === a[0].Code);
                if (checkExits.length === 0) {
                    $scope.listUsers.push(obj);
                }
            }
        }

        $scope.boxNumber = $scope.model.Box.NumBoxth;
        $scope.branchCode = $scope.model.Box.DepartCode;
        $scope.docType = $scope.model.Box.TypeProfile;
        $scope.userId = $scope.model.Box.PackingStaff;
    };
    $scope.getValueProfileType = function (typeProfile) {
        var arrTypeProfile = typeProfile.split(',');
        $scope.listDocTypes = [];
        for (var i = 0; i < arrTypeProfile.length; i++) {
            $scope.model.Box.TypeProfile = parseInt(arrTypeProfile[i]);

            var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(arrTypeProfile[i]));
            if (a.length > 0) {
                $scope.typeProfileName = a[0].ValueSet;
                var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                if (checkExits.length === 0) {
                    $scope.listDocTypes = [];
                    $scope.listDocTypes.push(obj);
                    //Lấy thời gian lưu trữ
                    dataservice.getStorageTimeLimit(obj.id, function (rs) {
                        $scope.model.Box.StoragePeriod = rs;
                        if (rs == 1000) {
                            $scope.modelShow.StoragePeriod = 'Vĩnh viễn';
                        } else if (rs == 500) {
                            $scope.modelShow.StoragePeriod = 'Đến khi văn bản hết hiệu lực thi hành';
                        } else if (rs == 200) {
                            $scope.modelShow.StoragePeriod = 'Theo tuổi thọ công trình, thiết bị';
                        } else {
                            $scope.modelShow.StoragePeriod = rs;
                        }
                    });
                }
            }
        }
    };

    $scope.setValueListStaff = function () {
        if ($scope.listUsers.length > 0) {
            $scope.listUserId = [];
            for (var i = 0; i < $scope.listUsers.length; i++) {
                $scope.listUserId.push($scope.listUsers[i].Code);
            }
            if ($scope.listUserId.length > 0)
                $scope.model.Box.LstMemberId = $scope.listUserId.join();
        }
    }
    $scope.setValueListDocType = function () {

        if ($scope.listDocTypes.length > 0) {
            $scope.listDocTypeId = [];
            //$scope.model.Box.LstTypeProfileId = '';
            for (var i = 0; i < $scope.listDocTypes.length; i++) {
                $scope.listDocTypeId.push($scope.listDocTypes[i].id);
            }
            if ($scope.listDocTypeId.length > 0)
                $scope.model.Box.LstTypeProfileId = $scope.listDocTypeId.join();
        }
    }

    $scope.addBox = function () {
        if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
            && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
            if ($scope.model.Box.TypeProfile != undefined && $scope.model.Box.TypeProfile != null && $scope.model.Box.TypeProfile != ''
                && $scope.model.Box.PackingStaff != undefined && $scope.model.Box.PackingStaff != null && $scope.model.Box.PackingStaff != ''
                && $scope.model.Box.StorageTime != undefined && $scope.model.Box.StorageTime != null && $scope.model.Box.StorageTime != ''
            ) {
                $scope.setValueListStaff();
                $scope.setValueListDocType();
                var modelBox = $scope.model.Box;
                $scope.model.Box.DepartCode = $scope.model.BrCode;

                dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                    $scope.model.Box.QR_Code = result;

                    var obj = {
                        BoxCode: modelBox.BoxCode,
                        QR_Code: $scope.model.Box.QR_Code,
                        TypeProfile: modelBox.TypeProfile,
                        TypeProfileName: $scope.typeProfileName,
                        DepartCode: modelBox.DepartCode,
                        BranchName: $scope.branchName,
                        NumBoxth: modelBox.NumBoxth,
                        PackingStaff: modelBox.PackingStaff,
                        StartTime: modelBox.StartTime,
                        EndTime: modelBox.EndTime,
                        StorageTime: modelBox.StorageTime,
                        StatusSecurity: modelBox.StatusSecurity,
                        StoragePeriod: modelBox.StoragePeriod,
                        LstMemberId: modelBox.LstMemberId,
                        RcCode: $scope.model.RcTicketCode,
                        LstTypeProfileId: modelBox.LstTypeProfileId,
                        ListFileBox: $scope.listFileBox
                    }

                    var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode);

                    debugger
                    if (checkExits.length == 0) {
                        $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                        $scope.listBoxTemp.push(obj);
                        $scope.model.ListBox = $scope.listBoxTemp;

                        $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
                        $scope.model.NumBox = $scope.listBoxTemp.length;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
                        App.toastrSuccess("Thêm thùng thành công!");
                    } else {
                        App.toastrError("Mã thùng đã tồn tại!");
                    }
                    $scope.modelDisable = {
                        BrCode: true,
                        WHS_Code: true,
                    };
                });
            }
            else {
                App.toastrError('Nhập các thông tin bắt buộc');
            }
        }
        else {
            App.toastrError(caption.EDWHR_CHOSE_BRANCH_WAREHOUSE);
        }
    }
    $scope.editItem = function (x) {
        $scope.isEditBox = true;

        $rootScope.chooseBoxObj = x;
        $scope.listFileBox = [];
        $scope.Item = x;
        var obj = x;
        $scope.model.Box = {
            Id: obj.Id,
            BoxCode: obj.BoxCode,
            TypeProfile: obj.TypeProfile,
            LstTypeProfileId: obj.LstTypeProfileId,
            DepartCode: obj.DepartCode,
            NumBoxth: obj.NumBoxth,
            PackingStaff: obj.PackingStaff,
            StartTime: obj.StartTime,
            EndTime: obj.EndTime,
            StorageTime: obj.StorageTime,
            StatusSecurity: obj.StatusSecurity,
            StoragePeriod: obj.StoragePeriod,
            LstMemberId: obj.LstMemberId,
            ListFileBox: obj.ListFileBox,
            ListFileBoxRemove: obj.ListFileBoxRemove,
            RcCode: obj.RcCode,
        };

        dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
            $scope.QR_Code_Box = result;
        });

        $scope.getValueStaff($scope.model.Box.LstMemberId);

        $scope.getValueProfileType($scope.model.Box.LstTypeProfileId);

        $scope.model.Box.DepartCode = $scope.model.BrCode;

        $scope.listFileBox = obj.ListFileBox;

        $scope.statusEditBox = true;
    }
    $scope.editBox = function () {
        var modelBox = $scope.model.Box;
        var listUsers = $scope.listUsers;
        var listDocType = $scope.listDocTypes;
        $scope.setValueListStaff();
        $scope.setValueListDocType();

        var b = $scope.listBoxTemp.indexOf($scope.Item);
        if ($scope.Item.BoxCode === $scope.model.Box.BoxCode) {//Trường hợp không thay đổi BoxCode
            $scope.listBoxTemp[b].Id = modelBox.Id;
            $scope.listBoxTemp[b].BoxCode = modelBox.BoxCode;
            $scope.listBoxTemp[b].TypeProfile = modelBox.TypeProfile;
            $scope.listBoxTemp[b].TypeProfileName = $scope.typeProfileName;
            $scope.listBoxTemp[b].DepartCode = modelBox.DepartCode;
            $scope.listBoxTemp[b].BranchName = $scope.branchName;
            $scope.listBoxTemp[b].NumBoxth = modelBox.NumBoxth;
            $scope.listBoxTemp[b].PackingStaff = modelBox.PackingStaff;
            $scope.listBoxTemp[b].StartTime = modelBox.StartTime;
            $scope.listBoxTemp[b].EndTime = modelBox.EndTime;
            $scope.listBoxTemp[b].StorageTime = modelBox.StorageTime;
            $scope.listBoxTemp[b].StatusSecurity = modelBox.StatusSecurity;
            $scope.listBoxTemp[b].StoragePeriod = modelBox.StoragePeriod;
            $scope.listBoxTemp[b].LstMemberId = modelBox.LstMemberId;
            $scope.listBoxTemp[b].LstTypeProfileId = modelBox.LstTypeProfileId;
            $scope.listBoxTemp[b].ListFileBox = modelBox.ListFileBox;
            $scope.listBoxTemp[b].ListFileBoxRemove = modelBox.ListFileBoxRemove;
            $scope.listBoxTemp[b].RcCode = $scope.model.RcTicketCode;

            //Cập nhật lại QR_Code cho mảng tạm
            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.listBoxTemp[b].QR_Code = result;
            });

            $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

            $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
            $scope.model.NumBox = $scope.listBoxTemp.length;
            $scope.changeBoxNumber($scope.model.Box.NumBoxth);


            App.toastrSuccess(caption.EDWHR_MSG_EDIT_SUCCESS);
            $scope.isEditBox = false;

        } else {//Trường hợp thay đổi BoxCode
            var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode);

            if (checkExits.length > 0) {//Trường hợp sửa BoxCode lại trùng với 1 mã trong Danh sách
                App.toastrError(caption.EDWHR_MSG_CODE_BOX_EXITS);
            } else {
                $scope.listBoxTemp[b].Id = modelBox.Id;
                $scope.listBoxTemp[b].BoxCode = modelBox.BoxCode;
                $scope.listBoxTemp[b].TypeProfile = modelBox.TypeProfile;
                $scope.listBoxTemp[b].TypeProfileName = $scope.typeProfileName;
                $scope.listBoxTemp[b].DepartCode = modelBox.DepartCode;
                $scope.listBoxTemp[b].BranchName = $scope.branchName;
                $scope.listBoxTemp[b].NumBoxth = modelBox.NumBoxth;
                $scope.listBoxTemp[b].PackingStaff = modelBox.PackingStaff;
                $scope.listBoxTemp[b].StartTime = modelBox.StartTime;
                $scope.listBoxTemp[b].EndTime = modelBox.EndTime;
                $scope.listBoxTemp[b].StorageTime = modelBox.StorageTime;
                $scope.listBoxTemp[b].StatusSecurity = modelBox.StatusSecurity;
                $scope.listBoxTemp[b].StoragePeriod = modelBox.StoragePeriod;
                $scope.listBoxTemp[b].LstMemberId = modelBox.LstMemberId;
                $scope.listBoxTemp[b].LstTypeProfileId = modelBox.LstTypeProfileId;
                $scope.listBoxTemp[b].ListFileBox = modelBox.ListFileBox;
                $scope.listBoxTemp[b].ListFileBoxRemove = modelBox.ListFileBoxRemove;
                $scope.listBoxTemp[b].RcCode = $scope.model.RcTicketCode;

                $scope.model.Box.DepartCode = $scope.model.BrCode;
                //Cập nhật lại QR_Code cho mảng tạm
                dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                    $scope.listBoxTemp[b].QR_Code = result;
                });

                $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
                $scope.model.NumBox = $scope.listBoxTemp.length;
                $scope.changeBoxNumber($scope.model.Box.NumBoxth);


                App.toastrSuccess(caption.EDWHR_MSG_EDIT_SUCCESS);
                $scope.isEditBox = false;
            }
        }
    }

    $scope.updateListDocTypeAll = function (listTemp, listDocType) {
        //TH1: Chưa thêm mới thùng nào
        if (listTemp.length == 0 && listDocType.length > 0) {
            listDocType.forEach(function (element) {
                $scope.listDocTypeAll.push(element);
            });
        }

        //TH2: Đã có danh sách thùng và chưa chỉnh sửa lại danh sách loại chứng từ
        if (listTemp.length > 0 && listDocType.length == 0) {
            $scope.listDocTypeAll = [];
            listTemp.forEach(function (element) {
                var listTypeProfileId = element.LstTypeProfileId.split(',');
                listTypeProfileId.forEach(function (e) {
                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(e));
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                });
            });
        }

        //TH3: Đã có danh sách thùng và chỉnh sửa
        if (listTemp.length > 0 && listDocType.length > 0) {
            listDocType.forEach(function (element) {
                $scope.listDocTypeAll.push(element);
            });

            listTemp.forEach(function (element) {
                var listTypeProfileId = element.LstTypeProfileId.split(',');
                listTypeProfileId.forEach(function (e) {
                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(e));
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                });
            });
        }
    }

    $scope.loadFileRec = function (event) {
        var files = event.target.files;
        var checkExits = $scope.model.ListFileReceipt.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                var input = $("#FileRec");
                input.replaceWith(input.val('').clone(true));
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.ListFileReceipt.push(rs.Object);
                }
            });
        } else {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        }
    }
    $scope.loadFileBox = function (event) {
        var files = event.target.files;

        var checkExits = $scope.listFileBox.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                var input = $("#FileBox");
                input.replaceWith(input.val('').clone(true));
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.listFileBox.push(rs.Object);
                }
            });
        } else {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        }

    }

    $scope.viewFile = function (url) {
        var view = false;
        var viewImage = false;
        var idxDot = url.lastIndexOf(".") + 1;
        var extFile = url.substr(idxDot, url.length).toLowerCase();
        var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr'];
        var document = ['txt'];
        var word = ['docx', 'doc'];
        var pdf = ['pdf'];
        var powerPoint = ['pps', 'pptx'];
        var image = ['jpg', 'png', 'PNG'];
        if (excel.indexOf(extFile) != -1) {
            view = true;
        } else if (word.indexOf(extFile) != -1) {
            view = true;
        } else if (document.indexOf(extFile) != -1) {
            view = true;
        } else if (pdf.indexOf(extFile) != -1) {
            view = true;
        } else if (powerPoint.indexOf(extFile) != -1) {
            view = true;
        } else if (image.indexOf(extFile) != -1) {
            view = true;
            viewImage = true;
        } else {
            view = false;
        }

        if (view) {
            url = url.replace(" ", "%20");
            switch (viewImage) {
                case true:
                    window.open('' + window.location.origin + '' + url + '', '_blank');
                    break;
                case false:
                    window.open('https://docs.google.com/gview?url=' + window.location.origin + '' + url + ' & embedded=true', '_blank');
                    break;
            }
        } else {
            App.toastrError(caption.EDWHR_MSG_NO_SUPPORT_FILE);
        }
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            if ($scope.listBoxTemp.length > 0) {
                if ($scope.listDocTypeAll.length > 0) {
                    $scope.listDocTypeId = [];
                    for (var i = 0; i < $scope.listDocTypeAll.length; i++) {
                        $scope.listDocTypeId.push($scope.listDocTypeAll[i].id);
                    }
                    if ($scope.listDocTypeId.length > 0)
                        $scope.model.DocType = $scope.listDocTypeId.join();
                } else {
                    $scope.model.DocType = '';
                }
                if ($scope.listBoxTemp.length > 0)
                    $scope.model.ListBox = $scope.listBoxTemp;
                if ($scope.listBoxIdDelete.length > 0)
                    $scope.model.ListBoxIDDelete = $scope.listBoxIdDelete;
                dataservice.insertReceiptInputStore($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            } else {
                App.toastrError(caption.EDWHR_MSG_ADD_BOX_DOCUMENT_BEFORE_WARE_HOUSE);
            }
        }
    }

    function change_alias(alias) {
        var str = alias;
        str = str.toLowerCase();
        str = str.replace(/ /g, "");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, "");
        str = str.replace(/ + /g, "");
        str = str.trim();
        return str;
    }
    function loadDate() {
        //Yêu cầu từ ngày --> đến ngày
        $("#dateFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateTo').datepicker('setStartDate', maxDate);
            if ($('#dateFrom .form-control').valid()) {
                $('#dateFrom .form-control').removeClass('invalid').addClass('success');
            }
        });
        $("#dateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateFrom').datepicker('setEndDate', maxDate);
            if ($('#dateTo .form-control').valid()) {
                $('#dateTo .form-control').removeClass('invalid').addClass('success');
            }
        });

        //Hộp tài liệu thời gian phát sinh từ -> đến, Ngày lưu kho
        $("#dateArisesFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesTo').datepicker('setStartDate', maxDate);
        });
        $("#dateArisesTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesFrom').datepicker('setEndDate', maxDate);
        });

        $("#dateStorage ").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
    }

    setTimeout(function () {
        $("#tblBoxRequest").on("click", "tr", function () {
            var id = $(this).attr('id');
            $('#tblBoxRequest .active').removeClass('active');
            $(this).addClass("active");
        });

        loadDate();
        setModalDraggable('.modal-dialog');
    }, 50);

    $scope.print = function (qrCode) {
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT)
        }
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout, para) {
    $scope.NumBoxthStart = null;
    $scope.NumBoxthCurrent = null;
    //Start Khởi tạo
    $scope.modelDisable = {
        BrCode: false,
        WHS_Code: false,
    };

    $scope.errorBrCode = false;
    $scope.errorWHSUser = false;
    $scope.errorWHSCode = false;
    $scope.errorPersonSender = false;

    $scope.IsEnabledRequest = false;
    $scope.listRequest = [];
    $scope.listBranch = [];
    $scope.listWareHouse = [];
    $scope.listWareHouseUser = [];
    $scope.listStaffBranch = [];
    $scope.listDocumentType = [];
    $scope.listBoxTemp = [];
    $scope.listBoxIdDelete = [];
    $scope.listFileBox = [];
    $scope.modelShow = {};

    $scope.no = 1;
    $scope.branch = '';
    $scope.type = '';
    $scope.user = '';
    $scope.statusEditBox = false;
    $scope.isEditBox = false;

    $scope.boxNumber = '';
    $scope.branchCode = '';
    $scope.docType = '';
    $scope.userId = '';

    $scope.branchName = '';
    $scope.typeProfileName = '';
    $scope.RcTicketCodeUpdate = '';

    $scope.QR_Code_Box = '';
    $scope.QR_Code_Req = '';
    $scope.Item = '';

    $scope.listDocTypes = [];
    $scope.listUsers = [];
    $scope.listDocTypeAll = [];

    $scope.obj = {
        WareHouseCode: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        WareHouseName: '',
        FloorName: '',
        LineName: '',
        RackName: '',
    }

    $scope.model = {
        Id: 0,
        RqId: '',
        RcTicketCode: '',
        BrCode: '',
        WHS_Code: '',
        WHS_User: '',
        NumBox: 0,
        DocType: '',
        FromDate: '',
        ToDate: '',
        Note: '',
        QR_Code: '',
        RcStatus: '',
        RcSupport: '',
        PersonSender: '',
        ListBox: [],
        ListBoxIDDelete: [],
        ListFileReceipt: [],
        ListFileReceiptRemove: [],
        Box: {
            Id: 0,
            BoxCode: '',
            TypeProfile: '',
            LstTypeProfileId: '',
            DepartCode: '',
            NumBoxth: '',
            PackingStaff: '',
            StartTime: '',
            EndTime: '',
            StorageTime: '',
            StatusSecurity: '',
            StoragePeriod: '',
            LstMemberId: '',
            ListFileBox: [],
            ListFileBoxRemove: [],
            RcCode: ''
        }
    };
    //End Khởi tạo
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.orderBox = function () {
        if ($scope.model.ListBox.length == 0) {
            App.toastrError("Danh sách thùng đang trống. Vui lòng thêm thùng trước khi xếp");
            return;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/orderBox.html',
            controller: 'orderBox',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return $scope.model.ListBox;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    }

    $scope.initLoad = function () {
        dataservice.getListRequestProfile(function (result) {
            $scope.listRequest = result;
        });

        dataservice.loadBranch(function (rs) {
            if (!rs.Error) {
                $scope.listBranch = rs;
            }
        });

        dataservice.getListWareHouse(function (rs) {
            $scope.listWareHouse = rs;
        });

        dataservice.getListDocumentType(function (result) {
            $scope.listDocumentType = result;
        });

        dataservice.getIdMax(function (rs) {
            $scope.no = rs;
        });

        dataservice.getListWareHouseUser(function (rs) {
            $scope.listWareHouseUser = rs.Object;
        });
        dataservice.getListStaffBranch(function (rs) {
            $scope.listStaffBranch = rs.Object;
        });

        dataservice.getReceiptInputStoreDetail(para.id, function (rs) {

            $scope.model = rs;
            $scope.listBoxTemp = rs.ListBox;
            if ($scope.model.RqId != null)
                $scope.IsEnabledRequest = true;

            //Ẩn hiện chọn chi nhánh & kho
            if ($scope.listBoxTemp.length == 0) {
                $scope.modelDisable = {
                    BrCode: false,
                    WHS_Code: false,
                };
            } else {
                $scope.modelDisable = {
                    BrCode: true,
                    WHS_Code: true,
                };
            }

            //Lấy ra số thùng tiếp theo
            if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
                && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
                dataservice.getNumBoxth($scope.model.BrCode, $scope.model.WHS_Code, function (rs) {
                    $scope.model.Box.NumBoxth = rs;
                    $scope.NumBoxthStart = rs;
                    $scope.NumBoxthCurrent = rs;
                    $scope.changeBoxNumber($scope.model.Box.NumBoxth);
                });
            }

            //Gán mã Y/C Trước khi có sự thay đổi
            $scope.RcTicketCodeUpdate = $scope.model.RcTicketCode;

            var a = $scope.listBranch.filter(k => k.OrgAddonCode === $scope.model.BrCode);
            $scope.branch = change_alias(a[0].OrgName);
            $scope.branchName = a[0].OrgName;
            $scope.branchCode = $scope.model.BrCode;

            //Hiển thị QR_Code
            dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
                $scope.QR_Code_Req = result;
            });

            //Lấy danh sách loại chứng từ hiển thị lên
            var listDocTypeID = $scope.model.DocType.split(',');
            if (listDocTypeID.length > 0) {
                $scope.listDocTypeAll = [];
                for (var i = 0; i < listDocTypeID.length; i++) {

                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(listDocTypeID[i]));
                    if (a.length > 0) {
                        $scope.type = change_alias(a[0].Code);
                        $scope.typeProfileName = a[0].ValueSet;
                        var obj = { id: a[0].SettingID, text: a[0].ValueSet };

                        var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                        if (checkExits.length === 0) {
                            $scope.listDocTypeAll.push(obj);
                        }
                    }
                }
            }
            $scope.user = $scope.model.WHS_User;
            $rootScope.wareHouseCode = $scope.model.WHS_Code;
            //Tạo mã cho phiếu nhập kho
            //$scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
        });
    }
    $scope.initLoad();

    $scope.createRecCode = function (no, branch, type, user) {
        var result = "";
        var date = new Date();
        var time = (date.getMonth() + 1) + '' + date.getDate() + '' + date.getFullYear();
        var today = moment().format('DDMMYYYY');
        result = "rci." + no + "_b." + branch + "_v." + type + "_u." + user + "_t." + today;
        $scope.model.RcTicketCode = result;
        dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };
    $scope.removeUser = function (index) {
        if ($scope.listUsers[index].Code == $scope.model.Box.PackingStaff)
            $scope.model.Box.PackingStaff = '';

        $scope.listUsers.splice(index, 1);
        if ($scope.listUsers.length == 0)
            $scope.model.Box.PackingStaff = '';
    }
    $scope.removeDocType = function (index) {
        if ($scope.listDocTypes[index].id == $scope.model.Box.TypeProfile) {
            $scope.model.Box.TypeProfile = '';
            $scope.model.Box.StoragePeriod = '';
            $scope.modelShow.StoragePeriod = '';
        }

        $scope.listDocTypes.splice(index, 1);
        if ($scope.listDocTypes.length == 0) {
            $scope.model.Box.TypeProfile = '';
            $scope.model.Box.StoragePeriod = '';
            $scope.modelShow.StoragePeriod = '';
        }
    }
    $scope.removeItem = function (index, item) {

        var idDelete = $scope.listBoxTemp[index].Id;
        $scope.listBoxIdDelete.push(idDelete);
        $scope.listBoxTemp.splice(index, 1);
        $scope.NumBoxthCurrent = $scope.NumBoxthCurrent - 1;

        //$scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
        //Lấy thùng số theo thùng số vừa xóa
        $scope.model.Box.NumBoxth = item.NumBoxth;
        $scope.model.NumBox = $scope.listBoxTemp.length;
        $scope.changeBoxNumber($scope.model.Box.NumBoxth);

        //Mở chọn chi nhánh & kho nếu xóa hết thùng
        if ($scope.listBoxTemp.length == 0) {
            $scope.modelDisable = {
                BrCode: false,
                WHS_Code: false,
            };
        }
    }
    $scope.removeFileRec = function (index) {
        var itemRemove = $scope.model.ListFileReceipt[index];

        if (itemRemove.FileId != null) {
            $scope.model.ListFileReceiptRemove.push(itemRemove);
        }
        $scope.model.ListFileReceipt.splice(index, 1);
    }
    $scope.removeFileBox = function (index) {
        var itemRemove = $scope.listFileBox[index];

        if (itemRemove.FileId != null) {
            $scope.Item.ListFileBoxRemove.push(itemRemove);
        }
        $scope.listFileBox.splice(index, 1);
    }

    $scope.changeRequest = function (rqId) {
        if (rqId != '') {
            switch ($scope.IsEnabledRequest) {
                case true:
                    $scope.initDataChooseRequest(rqId);
                    break;
                case false:
                    App.toastrError(caption.EDWHR_MSG_CHOSE_REQUEST_WARE_HOUSE)
                    break;
            }
        } else {
            if ($scope.IsEnabledRequest)
                App.toastrError(caption.EDWHR_CHOSE_CODE_WAREHOUSE)
        }
    }

    //Khi tích chọn Y/C nhập
    $scope.checkedRequest = function (rqId) {
        if (rqId != '') {
            switch ($scope.IsEnabledRequest) {
                case true:
                    $scope.initDataChooseRequest(rqId);
                    break;
                case false:
                    $scope.clearDataUnCheckedRequest();
                    break;
            }
        } else {
            if ($scope.IsEnabledRequest)
                App.toastrError(caption.EDWHR_CHOSE_CODE_WAREHOUSE)
        }
    }

    //Gán dữ liệu vào các ô theo mã Y/C
    $scope.initDataChooseRequest = function (rqId) {
        dataservice.getRequestInputStoreDetail(rqId, function (rs) {
            $scope.model = rs;
            $scope.model.WHS_User = '';
            $scope.model.RqId = rs.Id;
            $scope.model.ListFileReceipt = rs.ListFileRequest;
            $scope.listBoxTemp = rs.ListBox;

            //Gán mã Y/C Trước khi có sự thay đổi
            $scope.RcTicketCodeUpdate = $scope.model.RcTicketCode;

            var a = $scope.listBranch.filter(k => k.OrgAddonCode === $scope.model.BrCode);
            $scope.branch = change_alias(a[0].OrgName);
            $scope.branchName = a[0].OrgName;
            $scope.branchCode = $scope.model.BrCode;

            //Hiển thị QR_Code
            dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
                $scope.QR_Code_Req = result;
            });

            //Lấy danh sách loại chứng từ hiển thị lên
            var listDocTypeID = $scope.model.DocType.split(',');
            if (listDocTypeID.length > 0) {
                $scope.listDocTypeAll = [];
                for (var i = 0; i < listDocTypeID.length; i++) {

                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(listDocTypeID[i]));
                    $scope.type = change_alias(a[0].ValueSet);
                    $scope.typeProfileName = a[0].ValueSet;
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };

                    var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                }
            }
            $scope.user = $scope.model.WHS_User;

            //Tạo mã cho phiếu nhập kho
            //$scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
        });
    }

    $scope.clearDataUnCheckedRequest = function () {
        $scope.model.RqId = '';
    }

    $scope.changeSelect = function (type, id) {
        switch (type) {
            case "BRANCH":
                $scope.errorBrCode = false;
                var a = $scope.listBranch.filter(k => k.OrgAddonCode === id);
                $scope.branch = change_alias(a[0].OrgName);
                $scope.branchName = a[0].OrgName;
                $scope.branchCode = id;

                //Lấy ra số thùng tiếp theo
                if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
                    && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.BrCode, $scope.model.WHS_Code, function (rs) {
                        $scope.model.Box.NumBoxth = rs;
                        $scope.NumBoxthStart = rs;
                        $scope.NumBoxthCurrent = rs;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
                    });
                }

                //Tạo mã phiếu Y/C
                $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
                break;
            case "WAREHOUSE_USER":
                $scope.errorWHSUser = false;
                var a = $scope.listWareHouseUser.filter(k => k.Code === id);
                $scope.user = change_alias(a[0].Code);
                //Tạo mã phiếu Y/C
                $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
                break;

            case "WAREHOUSE":
                $scope.errorWHSCode = false;
                //Lấy ra số thùng tiếp theo
                if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
                    && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.BrCode, $scope.model.WHS_Code, function (rs) {
                        $scope.model.Box.NumBoxth = rs;
                        $scope.NumBoxthStart = rs;
                        $scope.NumBoxthCurrent = rs;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
                    });
                }

                $rootScope.wareHouseCode = id;
                break;

            case "PERSONSENDER":
                $scope.errorPersonSender = false;

            case "DOCUMENTTYPE":
                var a = $scope.listDocumentType.filter(k => k.SettingID === id);
                if (a.length > 0) {
                    $scope.type = change_alias(a[0].Code);
                    $scope.typeProfileName = a[0].ValueSet;
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                    if (checkExits.length === 0) {
                        $scope.listDocTypes = [];
                        $scope.listDocTypes.push(obj);
                        //Lấy thời gian lưu trữ
                        dataservice.getStorageTimeLimit(id, function (rs) {
                            $scope.model.Box.StoragePeriod = rs;
                            if (rs == 1000) {
                                $scope.modelShow.StoragePeriod = 'Vĩnh viễn';
                            } else if (rs == 500) {
                                $scope.modelShow.StoragePeriod = 'Đến khi văn bản hết hiệu lực thi hành';
                            } else if (rs == 200) {
                                $scope.modelShow.StoragePeriod = 'Theo tuổi thọ công trình, thiết bị';
                            } else {
                                $scope.modelShow.StoragePeriod = rs;
                            }
                        });
                    }
                    $scope.docType = id;
                    //Tạo mã phiếu Y/C
                    $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);

                    //Tạo Mã cho thùng
                    dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                        $scope.model.Box.BoxCode = rs;

                        dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                            $scope.QR_Code_Box = result;
                        });
                    });
                }

                break;
            case "PACKING_STAFF":
                var a = $scope.listStaffBranch.filter(k => k.Code === id);
                $scope.userId = id;
                //var obj = { text: a[0].UserName };
                var obj = { Code: a[0].Code, text: a[0].Name };
                var checkExits = $scope.listUsers.filter(k => k.Code === a[0].Code);
                if (checkExits.length === 0) {
                    $scope.listUsers.push(obj);
                }
                //Tạo Mã cho thùng
                dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                    $scope.model.Box.BoxCode = rs;

                    dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                        $scope.QR_Code_Box = result;
                    });
                });
                break;
        }
    };
    $scope.changeBoxNumber = function (boxNumber) {
        $scope.boxNumber = boxNumber;
        dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
            $scope.model.Box.BoxCode = rs;

            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.QR_Code_Box = result;
            });
        });
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.BrCode == "" || data.BrCode == null || data.BrCode == undefined) {
            $scope.errorBrCode = true;
            mess.Status = true;
        } else {
            $scope.errorBrCode = false;
        }
        if (data.WHS_User == "" || data.WHS_User == null || data.WHS_User == undefined) {
            $scope.errorWHSUser = true;
            mess.Status = true;
        } else {
            $scope.errorWHSUser = false;
        }
        if (data.WHS_Code == "" || data.WHS_Code == null || data.WHS_Code == undefined) {
            $scope.errorWHSCode = true;
            mess.Status = true;
        } else {
            $scope.errorWHSCode = false;
        }
        if (data.PersonSender == "" || data.PersonSender == null || data.PersonSender == undefined) {
            $scope.errorPersonSender = true;
            mess.Status = true;
        } else {
            $scope.errorPersonSender = false;
        }
        return mess;
    };

    $scope.getValueStaff = function (listMemberId) {
        var arrMemberId = listMemberId.split(',');
        $scope.listUsers = [];
        for (var i = 0; i < arrMemberId.length; i++) {
            $scope.model.Box.PackingStaff = arrMemberId[i];

            //var a = $scope.listWareHouseUser.filter(k => k.Code === arrMemberId[i]);
            var a = $scope.listStaffBranch.filter(k => k.Code === arrMemberId[i]);
            //var obj = { text: a[0].UserName };
            if (a.length > 0) {
                //var obj = { Code: a[0].Code, text: a[0].GivenName };
                var obj = { Code: a[0].Code, text: a[0].Name };
                var checkExits = $scope.listUsers.filter(k => k.Code === a[0].Code);
                if (checkExits.length === 0) {
                    $scope.listUsers.push(obj);
                }
            }
        }

        $scope.boxNumber = $scope.model.Box.NumBoxth;
        $scope.branchCode = $scope.model.Box.DepartCode;
        $scope.docType = $scope.model.Box.TypeProfile;
        $scope.userId = $scope.model.Box.PackingStaff;
    };
    $scope.getValueProfileType = function (typeProfile) {
        var arrTypeProfile = typeProfile.split(',');
        $scope.listDocTypes = [];
        for (var i = 0; i < arrTypeProfile.length; i++) {
            $scope.model.Box.TypeProfile = parseInt(arrTypeProfile[i]);

            var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(arrTypeProfile[i]));
            if (a.length > 0) {
                $scope.typeProfileName = a[0].ValueSet;
                var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                if (checkExits.length === 0) {
                    $scope.listDocTypes = [];
                    $scope.listDocTypes.push(obj);
                    //Lấy thời gian lưu trữ
                    dataservice.getStorageTimeLimit(obj.id, function (rs) {
                        $scope.model.Box.StoragePeriod = rs;
                        if (rs == 1000) {
                            $scope.modelShow.StoragePeriod = 'Vĩnh viễn';
                        } else if (rs == 500) {
                            $scope.modelShow.StoragePeriod = 'Đến khi văn bản hết hiệu lực thi hành';
                        } else if (rs == 200) {
                            $scope.modelShow.StoragePeriod = 'Theo tuổi thọ công trình, thiết bị';
                        } else {
                            $scope.modelShow.StoragePeriod = rs;
                        }
                    });
                }
            }
        }
    };

    $scope.setValueListStaff = function () {
        if ($scope.listUsers.length > 0) {
            $scope.listUserId = [];
            for (var i = 0; i < $scope.listUsers.length; i++) {
                $scope.listUserId.push($scope.listUsers[i].Code);
            }
            if ($scope.listUserId.length > 0)
                $scope.model.Box.LstMemberId = $scope.listUserId.join();
        }
    }
    $scope.setValueListDocType = function () {
        if ($scope.listDocTypes.length > 0) {
            $scope.listDocTypeId = [];
            for (var i = 0; i < $scope.listDocTypes.length; i++) {
                $scope.listDocTypeId.push($scope.listDocTypes[i].id);
            }
            if ($scope.listDocTypeId.length > 0)
                $scope.model.Box.LstTypeProfileId = $scope.listDocTypeId.join();
        }
    }

    $scope.addBox = function () {
        if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
            && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {

            if ($scope.model.Box.TypeProfile != undefined && $scope.model.Box.TypeProfile != null && $scope.model.Box.TypeProfile != ''
                && $scope.model.Box.PackingStaff != undefined && $scope.model.Box.PackingStaff != null && $scope.model.Box.PackingStaff != ''
                && $scope.model.Box.StorageTime != undefined && $scope.model.Box.StorageTime != null && $scope.model.Box.StorageTime != ''
            ) {
                $scope.setValueListStaff();
                $scope.setValueListDocType();
                var modelBox = $scope.model.Box;
                $scope.model.Box.DepartCode = $scope.model.BrCode;

                dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                    $scope.model.Box.QR_Code = result;

                    var obj = {
                        BoxCode: modelBox.BoxCode,
                        QR_Code: $scope.model.Box.QR_Code,
                        TypeProfile: modelBox.TypeProfile,
                        TypeProfileName: $scope.typeProfileName,
                        DepartCode: modelBox.DepartCode,
                        BranchName: $scope.branchName,
                        NumBoxth: modelBox.NumBoxth,
                        PackingStaff: modelBox.PackingStaff,
                        StartTime: modelBox.StartTime,
                        EndTime: modelBox.EndTime,
                        StorageTime: modelBox.StorageTime,
                        StatusSecurity: modelBox.StatusSecurity,
                        StoragePeriod: modelBox.StoragePeriod,
                        LstMemberId: modelBox.LstMemberId,
                        RcCode: $scope.model.RcTicketCode,
                        LstTypeProfileId: modelBox.LstTypeProfileId,
                        ListFileBox: $scope.listFileBox
                    }

                    var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode);

                    if (checkExits.length == 0) {
                        $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                        $scope.listBoxTemp.push(obj);

                        //$scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
                        $scope.NumBoxthCurrent = $scope.NumBoxthCurrent + 1;
                        $scope.model.Box.NumBoxth = $scope.NumBoxthCurrent;
                        $scope.model.NumBox = $scope.listBoxTemp.length;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);

                        App.toastrSuccess("Thêm thùng thành công!");
                    } else {
                        App.toastrError("Mã thùng đã tồn tại!");
                    }
                    $scope.modelDisable = {
                        BrCode: true,
                        WHS_Code: true,
                    };
                });
            }
            else {
                App.toastrError('Nhập các thông tin bắt buộc');
            }
        } else {
            App.toastrError(caption.EDWHR_CHOSE_BRANCH_WAREHOUSE);
        }
    }
    $scope.editItem = function (x) {
        $scope.isEditBox = true;

        $rootScope.chooseBoxObj = x;
        $scope.listFileBox = [];
        $scope.Item = x;
        var obj = x;
        $scope.model.Box = {
            Id: obj.Id,
            BoxCode: obj.BoxCode,
            TypeProfile: obj.TypeProfile,
            LstTypeProfileId: obj.LstTypeProfileId,
            DepartCode: obj.DepartCode,
            NumBoxth: obj.NumBoxth,
            PackingStaff: obj.PackingStaff,
            StartTime: obj.StartTime,
            EndTime: obj.EndTime,
            StorageTime: obj.StorageTime,
            StatusSecurity: obj.StatusSecurity,
            StoragePeriod: obj.StoragePeriod,
            LstMemberId: obj.LstMemberId,
            ListFileBox: obj.ListFileBox,
            ListFileBoxRemove: obj.ListFileBoxRemove,
            RcCode: obj.RcCode,
        };

        dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
            $scope.QR_Code_Box = result;
        });

        $scope.getValueStaff($scope.model.Box.LstMemberId);

        $scope.getValueProfileType($scope.model.Box.LstTypeProfileId);

        $scope.model.Box.DepartCode = $scope.model.BrCode;

        $scope.listFileBox = obj.ListFileBox;

        $scope.statusEditBox = true;
    }
    $scope.editBox = function () {

        var modelBox = $scope.model.Box;
        var listUsers = $scope.listUsers;
        var listDocType = $scope.listDocTypes;
        $scope.setValueListStaff();
        $scope.setValueListDocType();

        var b = $scope.listBoxTemp.indexOf($scope.Item);
        if ($scope.Item.BoxCode === $scope.model.Box.BoxCode) {//Trường hợp không thay đổi BoxCode
            $scope.listBoxTemp[b].Id = modelBox.Id;
            $scope.listBoxTemp[b].BoxCode = modelBox.BoxCode;
            $scope.listBoxTemp[b].TypeProfile = modelBox.TypeProfile;
            $scope.listBoxTemp[b].TypeProfileName = $scope.typeProfileName;
            $scope.listBoxTemp[b].DepartCode = modelBox.DepartCode;
            $scope.listBoxTemp[b].BranchName = $scope.branchName;
            $scope.listBoxTemp[b].NumBoxth = modelBox.NumBoxth;
            $scope.listBoxTemp[b].PackingStaff = modelBox.PackingStaff;
            $scope.listBoxTemp[b].StartTime = modelBox.StartTime;
            $scope.listBoxTemp[b].EndTime = modelBox.EndTime;
            $scope.listBoxTemp[b].StorageTime = modelBox.StorageTime;
            $scope.listBoxTemp[b].StatusSecurity = modelBox.StatusSecurity;
            $scope.listBoxTemp[b].StoragePeriod = modelBox.StoragePeriod;
            $scope.listBoxTemp[b].LstMemberId = modelBox.LstMemberId;
            $scope.listBoxTemp[b].LstTypeProfileId = modelBox.LstTypeProfileId;
            $scope.listBoxTemp[b].ListFileBox = modelBox.ListFileBox;
            $scope.listBoxTemp[b].ListFileBoxRemove = modelBox.ListFileBoxRemove;
            $scope.listBoxTemp[b].RcCode = $scope.model.RcTicketCode;

            //Cập nhật lại QR_Code cho mảng tạm
            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.listBoxTemp[b].QR_Code = result;
            });

            $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

            //$scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
            $scope.model.Box.NumBoxth = $scope.NumBoxthCurrent;
            $scope.model.NumBox = $scope.listBoxTemp.length;
            $scope.changeBoxNumber($scope.model.Box.NumBoxth);


            App.toastrSuccess(caption.EDWHR_MSG_EDIT_SUCCESS);
            $scope.isEditBox = false;

        } else {//Trường hợp thay đổi BoxCode
            var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode);

            if (checkExits.length > 0) {//Trường hợp sửa BoxCode lại trùng với 1 mã trong Danh sách
                App.toastrError(caption.EDWHR_MSG_CODE_BOX_EXITS);
            } else {
                $scope.listBoxTemp[b].Id = modelBox.Id;
                $scope.listBoxTemp[b].BoxCode = modelBox.BoxCode;
                $scope.listBoxTemp[b].TypeProfile = modelBox.TypeProfile;
                $scope.listBoxTemp[b].TypeProfileName = $scope.typeProfileName;
                $scope.listBoxTemp[b].DepartCode = modelBox.DepartCode;
                $scope.listBoxTemp[b].BranchName = $scope.branchName;
                $scope.listBoxTemp[b].NumBoxth = modelBox.NumBoxth;
                $scope.listBoxTemp[b].PackingStaff = modelBox.PackingStaff;
                $scope.listBoxTemp[b].StartTime = modelBox.StartTime;
                $scope.listBoxTemp[b].EndTime = modelBox.EndTime;
                $scope.listBoxTemp[b].StorageTime = modelBox.StorageTime;
                $scope.listBoxTemp[b].StatusSecurity = modelBox.StatusSecurity;
                $scope.listBoxTemp[b].StoragePeriod = modelBox.StoragePeriod;
                $scope.listBoxTemp[b].LstMemberId = modelBox.LstMemberId;
                $scope.listBoxTemp[b].LstTypeProfileId = modelBox.LstTypeProfileId;
                $scope.listBoxTemp[b].ListFileBox = modelBox.ListFileBox;
                $scope.listBoxTemp[b].ListFileBoxRemove = modelBox.ListFileBoxRemove;
                $scope.listBoxTemp[b].RcCode = $scope.model.RcTicketCode;

                $scope.model.Box.DepartCode = $scope.model.BrCode;
                //Cập nhật lại QR_Code cho mảng tạm
                dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                    $scope.listBoxTemp[b].QR_Code = result;
                });

                $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
                $scope.model.Box.NumBoxth = $scope.NumBoxthCurrent;
                $scope.model.NumBox = $scope.listBoxTemp.length;
                $scope.changeBoxNumber($scope.model.Box.NumBoxth);


                App.toastrSuccess(caption.EDWHR_MSG_EDIT_SUCCESS);
                $scope.isEditBox = false;
            }
        }
    }

    $scope.updateListDocTypeAll = function (listTemp, listDocType) {
        //TH1: Chưa thêm mới thùng nào
        if (listTemp.length == 0 && listDocType.length > 0) {
            listDocType.forEach(function (element) {
                $scope.listDocTypeAll.push(element);
            });
        }

        //TH2: Đã có danh sách thùng và chưa chỉnh sửa lại danh sách loại chứng từ
        if (listTemp.length > 0 && listDocType.length == 0) {
            $scope.listDocTypeAll = [];
            listTemp.forEach(function (element) {
                var listTypeProfileId = element.LstTypeProfileId.split(',');
                listTypeProfileId.forEach(function (e) {
                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(e));
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                });
            });
        }

        //TH3: Đã có danh sách thùng và chỉnh sửa
        if (listTemp.length > 0 && listDocType.length > 0) {
            listDocType.forEach(function (element) {
                $scope.listDocTypeAll.push(element);
            });

            listTemp.forEach(function (element) {
                var listTypeProfileId = element.LstTypeProfileId.split(',');
                listTypeProfileId.forEach(function (e) {
                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(e));
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                });
            });
        }
    }

    $scope.loadFileRec = function (event) {
        var files = event.target.files;
        var checkExits = $scope.model.ListFileReceipt.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                var input = $("#FileRec");
                input.replaceWith(input.val('').clone(true));
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.ListFileReceipt.push(rs.Object);
                }
            });
        } else {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        }
    }
    $scope.loadFileBox = function (event) {
        var files = event.target.files;

        var checkExits = $scope.listFileBox.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                var input = $("#FileBox");
                input.replaceWith(input.val('').clone(true));
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.listFileBox.push(rs.Object);
                }
            });
        } else {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        }

    }

    $scope.viewFile = function (url) {
        var view = false;
        var viewImage = false;
        var idxDot = url.lastIndexOf(".") + 1;
        var extFile = url.substr(idxDot, url.length).toLowerCase();
        var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr'];
        var document = ['txt'];
        var word = ['docx', 'doc'];
        var pdf = ['pdf'];
        var powerPoint = ['pps', 'pptx'];
        var image = ['jpg', 'png', 'PNG'];
        if (excel.indexOf(extFile) != -1) {
            view = true;
        } else if (word.indexOf(extFile) != -1) {
            view = true;
        } else if (document.indexOf(extFile) != -1) {
            view = true;
        } else if (pdf.indexOf(extFile) != -1) {
            view = true;
        } else if (powerPoint.indexOf(extFile) != -1) {
            view = true;
        } else if (image.indexOf(extFile) != -1) {
            view = true;
            viewImage = true;
        } else {
            view = false;
        }

        if (view) {
            url = url.replace(" ", "%20");
            switch (viewImage) {
                case true:
                    window.open('' + window.location.origin + '' + url + '', '_blank');
                    break;
                case false:
                    window.open('https://docs.google.com/gview?url=' + window.location.origin + '' + url + ' & embedded=true', '_blank');
                    break;
            }
        } else {
            App.toastrError(caption.EDWHR_MSG_NO_SUPPORT_FILE);
        }
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && validationSelect($scope.model).Status == false) {
            if ($scope.listBoxTemp.length > 0) {
                if ($scope.listDocTypeAll.length > 0) {
                    $scope.listDocTypeId = [];
                    for (var i = 0; i < $scope.listDocTypeAll.length; i++) {
                        $scope.listDocTypeId.push($scope.listDocTypeAll[i].id);
                    }
                    if ($scope.listDocTypeId.length > 0)
                        $scope.model.DocType = $scope.listDocTypeId.join();
                } else {
                    $scope.model.DocType = '';
                }
                if ($scope.listBoxTemp.length > 0)
                    $scope.model.ListBox = $scope.listBoxTemp;
                if ($scope.listBoxIdDelete.length > 0)
                    $scope.model.ListBoxIDDelete = $scope.listBoxIdDelete;

                dataservice.updateReceiptInputStore($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            } else {
                App.toastrError(caption.EDWHR_MSG_ADD_BOX_DOCUMENT_BEFORE_WARE_HOUSE);
            }
        }
    }

    function change_alias(alias) {
        var str = alias;
        str = str.toLowerCase();
        str = str.replace(/ /g, "");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, "");
        str = str.replace(/ + /g, "");
        str = str.trim();
        return str;
    }
    function loadDate() {
        //Yêu cầu từ ngày --> đến ngày
        $("#dateFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateTo').datepicker('setStartDate', maxDate);
            if ($('#dateFrom .form-control').valid()) {
                $('#dateFrom .form-control').removeClass('invalid').addClass('success');
            }
        });
        $("#dateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateFrom').datepicker('setEndDate', maxDate);
            if ($('#dateTo .form-control').valid()) {
                $('#dateTo .form-control').removeClass('invalid').addClass('success');
            }
        });

        //Hộp tài liệu thời gian phát sinh từ -> đến, Ngày lưu kho
        $("#dateArisesFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesTo').datepicker('setStartDate', maxDate);
        });
        $("#dateArisesTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesFrom').datepicker('setEndDate', maxDate);
        });

        $("#dateStorage ").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
    }

    setTimeout(function () {
        $("#tblBoxRequest").on("click", "tr", function () {
            var id = $(this).attr('id');
            $('#tblBoxRequest .active').removeClass('active');
            $(this).addClass("active");
        });

        loadDate();
        setModalDraggable('.modal-dialog');
    }, 50);

    $scope.print = function (qrCode) {
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT)
        }
    }
});

app.controller('orderBox', function ($scope, $rootScope, $confirm, $compile, $uibModal, dataservice, $location, $uibModalInstance, para) {
    $scope.model = {
        FloorCode: '',
        LineCode: '',
        RackCode: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initLoad = function () {
        $scope.listBox = para;
        dataservice.getListFloorByWareHouseCode($rootScope.wareHouseCode, function (rs) {
            $scope.listFoor = rs;
        })
        dataservice.getListLineByFloorCode('', function (rs) {
            $scope.listLine = rs;
        })
        dataservice.getListRackByLineCode('', function (rs) {
            $scope.listRack = rs;
        })
        dataservice.getPosition($rootScope.wareHouseCode, function (rs) {
            $scope.listPosion = rs;
        })
    }
    $scope.initLoad();
    $scope.selectFloor = function (floorCode) {
        dataservice.getListLineByFloorCode(floorCode, function (rs) {
            $scope.listLine = rs;
        })
    }
    $scope.selectLine = function (lineCode) {
        dataservice.getListRackByLineCode(lineCode, function (rs) {
            $scope.listRack = rs;
        })
    }
    $scope.selectRack = function () {
        if ($scope.model.FloorCode != '' && $scope.model.LineCode != '' && $scope.model.RackCode != '') {
            for (var i = 0; i < $scope.listPosion.length; i++) {
                if ($scope.listPosion[i].FloorCode == $scope.model.FloorCode && $scope.listPosion[i].LineCode == $scope.model.LineCode && $scope.listPosion[i].RackCode == $scope.model.RackCode) {
                    $scope.searchPosition = $scope.listPosion[i].RackCode;
                    break;
                }
            }
        }
    }
    $scope.selectBox = function (item) {
        if (item.IsCheck) {
            item.IsCheck = false;
        } else {
            item.IsCheck = true;
        }
    }
    $scope.selectPosition = function (item) {
        $scope.model.FloorCode = item.FloorCode;
        $scope.model.LineCode = item.LineCode;
        $scope.model.RackCode = item.RackCode;
        $scope.selectFloor($scope.model.FloorCode);
        $scope.selectLine($scope.model.LineCode);
    }
    $scope.orderBox = function () {
        validationSelect($scope.model);
        if ($scope.orderform.validate() && validationSelect($scope.model).Status == false) {
            var listSelect = $scope.listBox.filter(function (obj, index) { return obj.IsCheck; });
            if (listSelect.length > 0) {
                for (var i = 0; i < listSelect.length; i++) {
                    listSelect[i].WHS_Code = $rootScope.wareHouseCode;
                    listSelect[i].FloorCode = $scope.model.FloorCode;
                    listSelect[i].LineCode = $scope.model.LineCode;
                    listSelect[i].RackCode = $scope.model.RackCode;
                    listSelect[i].IsStored = true;
                }
                App.toastrSuccess("Xếp kho thành công!");
            } else {
                App.toastrError("Vui lòng chọn thùng để xếp!");
            }
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "FloorCode" && $scope.model.FloorCode != "") {
            $scope.errorFloorCode = false;
        }
        if (SelectType == "LineCode" && $scope.model.LineCode != "") {
            $scope.errorLineCode = false;
        }
        if (SelectType == "RackCode" && $scope.model.RackCode != "") {
            $scope.errorRackCode = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.FloorCode == "" || data.FloorCode == null) {
            $scope.errorFloorCode = true;
            mess.Status = true;
        } else {
            $scope.errorFloorCode = false;
        }
        if (data.LineCode == "" || data.LineCode == null) {
            $scope.errorLineCode = true;
            mess.Status = true;
        } else {
            $scope.errorLineCode = false;
        }
        if (data.RackCode == "" || data.RackCode == null) {
            $scope.errorRackCode = true;
            mess.Status = true;
        } else {
            $scope.errorRackCode = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);
});

//app.controller('listFloor', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $location) {
//    var vm = $scope;
//    $scope.selected = [];
//    $scope.selectAll = false;
//    $scope.toggleAll = toggleAll;
//    $scope.toggleOne = toggleOne;
//    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
//    vm.dtOptions = DTOptionsBuilder.newOptions()
//        .withOption('ajax', {
//            url: "/Admin/EDMSWarehouseManager/JTableFloor",
//            beforeSend: function (jqXHR, settings) {
//                resetCheckbox();
//                App.blockUI({
//                    target: "#contentMain",
//                    boxed: true,
//                    message: 'loading...'
//                });
//            },
//            type: 'POST',
//            data: function (d) {
//                d.WareHouseCode = $rootScope.wareHouseCode;
//            },
//            complete: function (data) {
//                $rootScope.listFloor = data.responseJSON.data;
//                App.unblockUI("#contentMain");
//                $scope.$apply();
//            }
//        })
//        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
//        .withDataProp('data').withDisplayLength(pageLength)
//        .withOption('order', [2, 'asc'])
//        .withOption('scrollY', "110px")
//        .withOption('scrollCollapse', false)
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
//            $compile(angular.element(row).contents())($scope);
//            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
//            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
//                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

//                } else {
//                    var Id = data.Id;
//                    var floorCode = data.FloorCode;
//                    $rootScope.floorID = Id;
//                    $rootScope.floorCode = floorCode;
//                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
//                        $scope.selected[data.Id] = !$scope.selected[data.Id];
//                    } else {
//                        var self = $(this).parent();
//                        $('#tblDataFloor').DataTable().$('tr.selected').removeClass('selected');
//                        $('#tblDataFloor').DataTable().$('tr>td.fa-check').removeClass('fa-check');
//                        $(self).addClass('selected');
//                    }
//                }
//            });
//        });

//    vm.dtColumns = [];
//    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
//        .renderWith(function (data, type, full, meta) {
//            $scope.selected[full.Id] = false;
//            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
//        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle($translate('EDMSWM_COL_QR_CODE')).renderWith(function (data, type) {
//        //return '<img src="data:image/png;base64,' + data + '" height="40" width="40">';
//        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
//        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle($translate('EDMSWM_COL_WHS_NAME')).renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle($translate('EDMSWM_COL_NOTE')).renderWith(function (data, type, full) {
//        //return '<img src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('EDMSWM_COL_ACTION')).renderWith(function (data, type, full) {
//        return '<button title="Chọn" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
//            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
//    function resetCheckbox() {
//        $scope.selected = [];
//        vm.selectAll = false;
//    }
//    $scope.reload = function () {
//        reloadData(true);
//    }
//    $scope.reloadNoResetPage = function () {
//        reloadData(false);
//    }
//    $scope.add = function () {
//        alert(111);
//        var modalInstance = $uibModal.open({
//            animation: true,
//            templateUrl: ctxfolder + '/addFloor.html',
//            controller: 'addFloor',
//            backdrop: 'static',
//            size: '65'
//        });
//        modalInstance.result.then(function (d) {

//        }, function () {
//        });
//    }
//    $scope.edit = function (id) {
//        var model = {};
//        var listdata = $('#tblDataFloor').DataTable().data();
//        for (var i = 0; i < listdata.length; i++) {
//            if (listdata[i].Id == id + "") {
//                model = listdata[i];
//                break;
//            }
//        }
//        $rootScope.floorID = id;
//        $rootScope.floorCode = model.FloorCode;
//        $rootScope.showListFloor = true;
//        $rootScope.showListLine = true;
//        $rootScope.showListRack = false;
//        if ($rootScope.lineReload)
//            $rootScope.reloadLine();
//        if ($rootScope.rackReload)
//            $rootScope.reloadRack();
//    }

//    $rootScope.reloadFloor = function () {
//        reloadData(false);
//    }

//    $rootScope.floorReload = true;
//});
//app.controller('listLine', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $translate) {
//    var vm = $scope;
//    $scope.selected = [];
//    $scope.selectAll = false;
//    $scope.toggleAll = toggleAll;
//    $scope.toggleOne = toggleOne;
//    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
//    vm.dtOptions = DTOptionsBuilder.newOptions()
//        .withOption('ajax', {
//            url: "/Admin/EDMSWarehouseManager/JTableLine",
//            beforeSend: function (jqXHR, settings) {
//                resetCheckbox();
//                App.blockUI({
//                    target: "#contentMain",
//                    boxed: true,
//                    message: 'loading...'
//                });
//            },
//            type: 'POST',
//            data: function (d) {
//                d.FloorCode = $rootScope.floorCode;
//            },
//            complete: function (data) {
//                $rootScope.listLine = data.responseJSON.data;
//                App.unblockUI("#contentMain");
//                $scope.$apply();
//            }
//        })
//        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
//        .withDataProp('data').withDisplayLength(pageLength)
//        .withOption('order', [2, 'asc'])
//        .withOption('scrollY', "110px")
//        //.withOption('scrollCollapse', true)
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
//            $compile(angular.element(row).contents())($scope);
//            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
//            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
//                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

//                } else {
//                    var Id = data.Id;
//                    var lineCode = data.LineCode;
//                    $rootScope.lineID = Id;
//                    $rootScope.lineCode = lineCode;
//                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
//                        $scope.selected[data.Id] = !$scope.selected[data.Id];
//                    } else {
//                        var self = $(this).parent();
//                        $('#tblDataLine').DataTable().$('tr.selected').removeClass('selected');
//                        $('#tblDataLine').DataTable().$('tr>td.fa-check').removeClass('fa-check');
//                        $(self).addClass('selected');
//                    }
//                }
//            });
//        });

//    vm.dtColumns = [];
//    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
//        .renderWith(function (data, type, full, meta) {
//            $scope.selected[full.FileID] = false;
//            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
//        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle($translate('EDMSWM_COL_QR_CODE')).renderWith(function (data, type) {
//        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
//        //return '<img src="' + qrCode + '" height="40" width="40">';
//        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('L_Text').withTitle($translate('EDMSWM_COL_L_TEXT')).renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle($translate('EDMSWM_COL_NOTE')).renderWith(function (data, type, full) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('EDMSWM_COL_ACTION')).renderWith(function (data, type, full) {
//        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
//            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
//    function resetCheckbox() {
//        $scope.selected = [];
//        vm.selectAll = false;
//    }
//    $scope.reload = function () {
//        reloadData(true);
//    }
//    $scope.reloadNoResetPage = function () {
//        reloadData(false);
//    }
//    $scope.add = function () {
//        //var modalInstance = $uibModal.open({
//        //    animation: true,
//        //    templateUrl: ctxfolder + '/add.html',
//        //    controller: 'add',
//        //    backdrop: 'static',
//        //    size: '65'
//        //});
//        //modalInstance.result.then(function (d) {

//        //}, function () {
//        //});
//    }
//    $scope.edit = function (id) {

//        var model = {};
//        var listdata = $('#tblDataLine').DataTable().data();
//        for (var i = 0; i < listdata.length; i++) {
//            if (listdata[i].Id == id + "") {
//                model = listdata[i];
//                break;
//            }
//        }

//        $rootScope.lineID = id;
//        $rootScope.lineCode = model.LineCode;
//        $rootScope.showListFloor = true;
//        $rootScope.showListLine = true;
//        $rootScope.showListRack = true;

//        if ($rootScope.rackReload)
//            $rootScope.reloadRack();
//    }

//    $rootScope.reloadLine = function () {
//        reloadData(false);
//    }
//    $rootScope.lineReload = true;
//});
//app.controller('listRack', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $translate) {
//    var vm = $scope;
//    $scope.selected = [];
//    $scope.selectAll = false;
//    $scope.toggleAll = toggleAll;
//    $scope.toggleOne = toggleOne;
//    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
//    vm.dtOptions = DTOptionsBuilder.newOptions()
//        .withOption('ajax', {
//            url: "/Admin/EDMSWarehouseManager/JTableRack",
//            beforeSend: function (jqXHR, settings) {
//                resetCheckbox();
//                App.blockUI({
//                    target: "#contentMain",
//                    boxed: true,
//                    message: 'loading...'
//                });
//            },
//            type: 'POST',
//            data: function (d) {
//                d.LineCode = $rootScope.lineCode;
//            },
//            complete: function (data) {
//                $rootScope.listRack = data.responseJSON.data;
//                App.unblockUI("#contentMain");
//            }
//        })
//        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
//        .withDataProp('data').withDisplayLength(pageLength)
//        .withOption('order', [2, 'asc'])
//        .withOption('scrollY', "110px")
//        //.withOption('scrollCollapse', true)
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
//            $compile(angular.element(row).contents())($scope);
//            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
//            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
//                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

//                } else {
//                    var Id = data.Id;
//                    var rackCode = data.RackCode;
//                    $rootScope.rackID = Id;
//                    $rootScope.rackCode = rackCode;
//                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
//                        $scope.selected[data.Id] = !$scope.selected[data.Id];
//                    } else {
//                        var self = $(this).parent();
//                        $('#tblDataRack').DataTable().$('tr.selected').removeClass('selected');
//                        $('#tblDataRack').DataTable().$('tr>td.fa-check').removeClass('fa-check');
//                        $(self).addClass('selected');
//                    }
//                }
//            });
//        });

//    vm.dtColumns = [];
//    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
//        .renderWith(function (data, type, full, meta) {
//            $scope.selected[full.FileID] = false;
//            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
//        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle($translate('EDMSWM_COL_QR_CODE')).renderWith(function (data, type) {
//        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
//        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('RackName').withTitle($translate('EDMSWM_COL_RACK_NAME')).renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle($translate('EDMSWM_COL_NOTE')).renderWith(function (data, type, full) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('EDMSWM_COL_ACTION')).renderWith(function (data, type, full) {
//        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
//            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
//    function resetCheckbox() {
//        $scope.selected = [];
//        vm.selectAll = false;
//    }
//    $scope.reload = function () {
//        reloadData(true);
//    }
//    $scope.reloadNoResetPage = function () {
//        reloadData(false);
//    }
//    $scope.add = function () {
//        //var modalInstance = $uibModal.open({
//        //    animation: true,
//        //    templateUrl: ctxfolder + '/add.html',
//        //    controller: 'add',
//        //    backdrop: 'static',
//        //    size: '65'
//        //});
//        //modalInstance.result.then(function (d) {

//        //}, function () {
//        //});
//    }

//    $scope.edit = function (id) {
//        $rootScope.rackID = id;
//        var modalInstance = $uibModal.open({
//            animation: true,
//            templateUrl: ctxfolder + '/detail.html',
//            controller: 'detail',
//            backdrop: 'static',
//            size: '50',
//            resolve: {
//                para: function () {
//                    return id;
//                }
//            }
//        });
//        modalInstance.result.then(function (d) {
//            $scope.reloadNoResetPage();
//        }, function () {
//        });
//    }

//    $rootScope.reloadRack = function () {
//        reloadData(false);
//    }

//    $rootScope.rackReload = true;
//});
