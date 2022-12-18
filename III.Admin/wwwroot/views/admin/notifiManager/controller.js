var ctxfolderProjectManagement = "/views/admin/notifiManager";
var ctxfolderMessage = "/views/message-box";
var appProjectManagement = angular.module('App_ESEIM_NOTIFIMANAGER', ['App_ESEIM_CARD_JOB', 'App_ESEIM_ATTR_MANAGER', "ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", "pascalprecht.translate", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
appProjectManagement.factory('dataserviceNotifiManager', function ($http) {
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
        getStatus: function (callback) {
            $http.post('/Admin/CardJob/GetStatus/').then(callback);
        },
    };
});
appProjectManagement.controller('Ctrl_ESEIM_NOTIFIMANAGER', function ($scope, $rootScope, $compile, $cookies, $translate, dataserviceNotifiManager, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
    });
});
appProjectManagement.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ProjectManagement/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderProjectManagement + '/index.html',
            controller: 'indexNotifiManager'
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
appProjectManagement.controller('indexNotifiManager', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceNotifiManager, $filter) {
    $scope.initData = function () {
        dataserviceNotifiManager.getStatus(function (rs) {
            rs = rs.data;
            $scope.CardStatus = rs;
            var all = {
                Code: '',
                Value: 'Tất cả'
            }
            $scope.CardStatus.unshift(all)
        })
    }
    $scope.initData();
    var vm = $scope;
    $scope.model = {
        Code: '',
        Name: '',
        Status: '',
        DueDate: '',
        FromDate: '',
        ToDate: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/NotifiManager/JTable",
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
                d.Status = $scope.model.Status;
                d.DueDate = $scope.model.DueDate;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.UserId = userId;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
        .withOption('order', [0, 'asc'])
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
                        size: '80',
                        backdrop: 'static',
                        resolve: {
                            para: function () {
                                return data.CardCode;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                        $scope.reload();
                    }, function () { });
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("CardID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardName').withTitle('<i class="fa fa-paper-plane mr5"></i>{{"CJ_COL_CARD_NAME" | translate}}').renderWith(function (data, type, full) {
        var deadLine = '';
        var workType = "";
        var priority = "";
        var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
        debugger
        if (full.UpdateTime != null && full.UpdateTime != "" && full.UpdateTime != undefined) {
            var updated = new Date(full.UpdateTime);
            var currentTime = new Date();
            var diffMsUpdate = (updated - currentTime);
            var diffDayUpdated = Math.floor((diffMsUpdate / 86400000));
            if (diffDayUpdated == -1) {
                var diffHrsUpdate = Math.floor((diffMsUpdate % 86400000) / 3600000);
                if (diffHrsUpdate < 10) {
                    cardName = '<span style = "color: #9406b7">' + cardName + '</span>'
                }
            }
        }

        if (full.WorkType != "") {
            workType = '<span class="badge-customer badge-customer-success ml-1">' + full.WorkType + '</span>'
        } else {
            workType = '<span class="badge-customer badge-customer-danger ml-1">Chưa có kiểu công việc</span>'
        }
        if (full.Priority != "") {
            priority = '<span class="badge-customer badge-customer-success ml-1">' + full.Priority + '</span>'
        } else {
            priority = '<span class="badge-customer badge-customer-danger ml-1">Chưa có độ ưu tiên</span>'
        }

        if (full.EndTime == '') {
            deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Không đặt thời hạn</span>'
        } else {
            var created = new Date(full.EndTime);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }

        if (full.Status == 'Hoàn thành') {
            //var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9">&nbsp;Hoàn thành</span>' +
                workType + priority
            '</div';
            //'<span class="badge-customer badge-customer-success fs9 ml5"> ' + $filter('currency')(full.Completed, '', 0) + '%</span></div>';
        } else if (full.Status == 'Đang triển khai') {
            //var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                '<span> ' + cardName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Đang triển khai</span>' + deadLine + workType + priority
            //'<span class="badge-customer badge-customer-warning fs9 ml5"> ' + $filter('currency')(full.Completed, '', 0) + '%</span></div>' +
            '</div>';
        } else if (full.Status == 'Bị hủy') {
            //var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Bị hủy</span>' + workType + priority
            //'<span class="badge-customer badge-customer-warning fs9 ml5" > ' + $filter('currency')(full.Completed, '', 0) + '%</span>' +
            '</div>';
        }
        else if (full.Status == 'Mới tạo') {
            //var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9">&nbsp;Mới tạo</span>' + deadLine + workType + priority
            //'<span class="badge-customer badge-customer-danger fs9 ml5" > ' + $filter('currency')(full.Completed, '', 0) + '%</span>' +
            '</div>';
        } else if (full.Status == 'Thẻ rác') {
            //var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9">&nbsp;Thẻ rác</span>' + deadLine + workType + priority
            '</div>';
        } else if (full.Status == 'Đóng') {
            //var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9">&nbsp;Đóng</span>' + deadLine + workType + priority
            '</div>';
        }
    }).withOption('sClass', 'nowrap'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_START" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Deadline').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_DEADLINE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_END" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('<i class="fa fa-user-o mr5"></i>{{"Người tạo" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"Ngày tạo" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UpdatedTimeTxt').withTitle('<i class="fa fa-calendar mr5"></i>{{"Ngày cập nhật" | translate}}').renderWith(function (data, type) {
        return '<span class ="bold" style ="color: #9406b7;">' + data + '</span>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withTitle('<i class="fa fa-recycle mr5"></i>{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'dataTable-pr0  d-flex w250').renderWith(function (data, type, full, meta) {
    //    return '<div class="pr5"><button title= "Nhóm" ng-click="cardMember(\'' + full.CardCode + '\')" style = "width: 25px; height: 25px; padding: 0px;background: #009432;border-color: #009432;" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-users white fs10"></i></button><p class="fs8 text-underline">{{"CJ_BTN_GROUP" | translate}}</p></div>' +
    //        '<div class="pr5 text-center"><button title="Phòng ban" ng-click="cardGroupUser(\'' + full.CardCode + '\')" style = "width: 25px; height: 25px; padding: 0px;background: #3598dc;border-color: #3598dc;" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-warehouse white fs10"></i></button><p class="fs8 text-underline nowrap">{{"CJ_BTN_DEPARTMENT" | translate}}</p></div>' +
    //        '<div class="pr5"><button title="Liên kết" ng-click="cardRelative(\'' + full.CardCode + '\')" style = "width: 25px; height: 25px; padding: 0px;background: #009432;border-color: #009432;" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-link white fs10"></i></button><p class="fs8 text-underline nowrap">{{"CJ_BTN_LINK" | translate}}</p></div>' +
    //        '<div class="pr5"><button title="Copy" ng-click="cardCopy(\'' + full.CardCode + '\')" style = "width: 25px; height: 25px; padding: 0px;background: #8e44ad;border-color: #8e44ad;" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-percent white fs10"></i></button><p class="fs8 text-underline">{{"CJ_BTN_COPY" | translate}}</p></div>' +
    //        '<div class="pr5 text-center"><button title="Sửa" ng-click="edit(\'' + full.CardCode + '\')" style = "width: 25px; height: 25px; padding: 0px;background: #3598dc;border-color: #3598dc;" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit white fs10"></i></button><p class="fs8 text-underline">{{"CJ_BTN_EDIT" | translate}}</p></div>' +
    //        '<div class="text-center"><button title="Xoá" ng-click="delete(' + full.CardID + ')" style="width: 25px; height: 25px; padding: 0px;background: #e7505a;border-color: ##e7505a;" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash white fs10"></i></button><p class="fs8 text-underline">{{"COM_BTN_DELETE" | translate}}</p></div>';
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
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
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
        $("#DueDate").datepicker({
            inline: false,
            autoclose: true,
            todayHighlight: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
