var ctxfolder = "/views/admin/staffLate";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", 'ngSanitize', "ngCookies"]);

app.factory('dataservice', function ($http) {
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
        add: function (data, callback) {
            submitFormUpload('/Admin/StaffLate/Add/', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/StaffLate/update/', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/StaffLate/Delete', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/StaffLate/GetItem/', data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getStaffLateOfUser: function (data, callback) {
            $http.get('/Admin/StaffLate/GetStaffLateOfUser?').then(callback);
        },
        getAddressForCoordinates: function (latitude, longitude, callback) {
            $http.get('/Admin/StaffLate/GetAddressForCoordinates?latitude=' + latitude + '&longitude=' + longitude).then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/StaffLate/GetListStatus').then(callback);
        },
        eventCalendar: function (data, memberId, callback) {
            $http.post('/Admin/StaffLate/EventCalendar?dateSearch=' + data + '&memberId=' + memberId).then(callback);
        },
        getAllTotal: function (memberId, month, year, from, to, callback) {
            $http.get('/Admin/StaffLate/GetAllTotal?memberId=' + memberId + '&month=' + month + '&year=' + year + '&from=' + from + '&to=' + to).then(callback);
        },
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
                ActionTime: {
                    required: true,
                },
                ActionBegin: {
                    required: true,
                },
                ActionTo: {
                    required: true,
                }
            },
            messages: {
                ActionTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.STL_CURD_LBL_TIME),
                },
                ActionBegin: {
                    required: 'Từ ngày yêu cầu bắt buộc'
                },
                ActionTo: {
                    required: 'Đến ngày yêu cầu bắt buộc'
                }
            }
        }
    });
    $rootScope.dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
    dataservice.getListUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    $translateProvider.useUrlLoader('/Admin/StaffLate/Translation');
    caption = $translateProvider.translations();
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

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        UserId: '',
        FromDate: '',
        ToDate: '',
        Status: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffLate/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.model.UserId;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Status = $scope.model.Status;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(6)
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
                    var UserId = data.UserId;
                    $scope.edit(Id, UserId);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Picture').withOption('sClass', 'tcenter dataTable-pr5').withTitle('{{"STL_LIST_COL_IMAGE" | translate}}').renderWith(function (data, type) {
        return data === "" ? "" : '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_user.png' + '"' + "'" + ' class="img-responsive" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').withOption('sClass', 'dataTable-pr5').withTitle('{{"STL_LIST_COL_FULL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'dataTable-10per').withTitle('{{"STL_LIST_COL_STATUS" | translate}}').withOption('sClass', 'dataTable-w120').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActionTime').withOption('sClass', 'dataTable-pr0').withTitle('{{"STL_LIST_COL_TIME" | translate}}').withOption('sClass', 'dataTable-pl0').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LocationText').withOption('sClass', 'dataTable-20per').withTitle('{{"STL_LIST_COL_PLACE" | translate}}').withOption('sClass', 'dataTable-20per').renderWith(function (data, type, full) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withOption('sClass', 'dataTable-20per').withTitle('{{"STL_LIST_COL_DESCRIPTION" | translate}}').withOption('sClass', 'dataTable-25per').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"STL_LIST_COL_ACTION" | translate}}').withOption('sClass', 'dataTable-w80').renderWith(function (data, type, full) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ',\'' + full.UserId + '\')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $rootScope.reloadIndex = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $scope.ListStatus = rs;
        });
    }
    $scope.initData();

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }
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
    $scope.edit = function (id, userId) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return {
                        Id: id,
                        UserId: userId
                    };
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
                    dataservice.delete(id, function (result) {
                        result = result.data;
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    };
    function loadDate() {
        var dt = new Date();
        $("#From").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#To').datepicker('setStartDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#To').datepicker('setStartDate', null);
            }
        });
        $("#To").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#From').datepicker('setEndDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#From').datepicker('setEndDate', null);
            }
        });
        $('.end-date').click(function () {
            $('#From').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#To').datepicker('setStartDate', null);
        });
        $('#From').datepicker('setEndDate', dt);
        $('#To').datepicker('setStartDate', dt);
    }

    function loadCalendar(id) {
        $('#' + id).fullCalendar({
            defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: true,
            header: {
                left: 'prev,next,today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            dayNames: [caption.STL_COL_DATE_SUNDAY, caption.STL_COL_DATE_MONDAY, caption.STL_COL_DATE_TUESDAY, caption.STL_COL_DATE_WEDNESDAY, caption.STL_COL_DATE_THUSDAY, caption.STL_COL_DATE_FRIDAY, caption.STL_COL_DATE_STATURDAY],
            monthNames: [caption.STL_MONTH_JANUARY + ' - ', caption.STL_MONTH_FEBRUARY + ' - ', caption.STL_MONTH_MARCH + ' - ', caption.STL_MONTH_APRIL + ' - ', caption.STL_MONTH_MAY + ' - ', caption.STL_MONTH_JUNE + ' - ', caption.STL_MONTH_JULY + ' - ', caption.STL_MONTH_AUGUST + ' - ', caption.STL_MONTH_SEPTEMBER + ' - ', caption.STL_MONTH_OCTOBER + ' - ', caption.STL_MONTH_NOVEMBER + ' - ', caption.STL_MONTH_DECEMBER + ' - '],
            monthNamesShort: [caption.STL_MONTH_JAN + ' - ', caption.STL_MONTH_FEB + ' - ', caption.STL_MONTH_MAR + ' - ', caption.STL_MONTH_APR + ' - ', caption.STL_MONTH_MA + ' - ', caption.STL_MONTH_JUN + ' - ', caption.STL_MONTH_JUL + ' - ', caption.STL_MONTH_AUG + ' - ', caption.STL_MONTH_SEPT + ' - ', caption.STL_MONTH_OCT + ' - ', caption.STL_MONTH_NOV + ' - ', caption.STL_MONTH_DEC + ' - '],
            dayNamesShort: [caption.STL_COL_DATE_SUN, caption.STL_COL_DATE_MON, caption.STL_COL_DATE_TUE, caption.STL_COL_DATE_WED, caption.STL_COL_DATE_THUS, caption.STL_COL_DATE_FRI, caption.STL_COL_DATE_SAT],

            buttonText: {
                today: caption.STL_BTN_TODAY,
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                var month = $('#calendar').fullCalendar('getDate').format('MM');
                var year = $('#calendar').fullCalendar('getDate').format('YYYY');
                dataservice.getAllTotal($scope.model.UserId, month, year, $scope.model.FromDate, $scope.model.ToDate, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        //select all member
                        if (rs.Object.All) {
                            var event = [];
                            angular.forEach(rs.Object.ListTotal, function (value, key) {
                                var userLate = {
                                    title: caption.STL_LBL_LATE_OR_QUIT + ": " + value.CountLate,
                                    start: value.Date,
                                    className: 'fc-event-event-orange',
                                    date: value.Date,
                                    displayEventTime: false,
                                    numLate: value.CountLate,
                                }
                                event.push(userLate);
                            })
                            callback(event);
                            if ($scope.model.FromDate != '' || $scope.model.ToDate != '') {
                                gotoDate(rs.Object.ListTotal[rs.Object.ListTotal.length - 1].Date);
                            }
                        }
                    }
                })
            },
            eventClick: function (calEvent) {
                var date = $filter('date')(new Date(calEvent.date), 'dd/MM/yyyy');
                var numLate = calEvent.numLate;
                dataservice.eventCalendar(date, $scope.model.UserId, function (rs) {
                    rs = rs.data;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/listUserLate.html',
                        controller: 'listUserLate',
                        backdrop: 'static',
                        size: '50',
                        resolve: {
                            para: function () {
                                return {
                                    listMember: rs,
                                    date: date,
                                }
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {

                    }, function () {
                    });
                })
            },
        })
    }
    function gotoDate(date) {
        if (!$rootScope.isNext) {
            $('#calendar').fullCalendar('gotoDate', date);
        }
    }

    setTimeout(function () {
        loadCalendar("calendar");
        $('.fc-prev-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-next-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-today-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-prevYear-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-nextYear-button').click(function () {
            $rootScope.isNext = true;
        });
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, dataservice, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $filter, $translate, $uibModalInstance) {
    $scope.model = {
        Ip: '',
        Address: '',
        UserId: '',
        Action: '',
        ActionTime: '',
        ActionTo: '',
        Note: '',
        Lat: '',
        Lon: '',
        LocationText: '',
        Picture: ''
    }
    $scope.image = "";
    $scope.goLate = true;
    $scope.notWork = false;
    $scope.quitWork = false;
    $scope.listWorkUser = [];
    $scope.entities = [{
        name: caption.STL_CURD_LBL_LATE,
        checked: true,
        value: 0,
    }, {
        name: caption.STL_CURD_LBL_NOT_WORK,
        checked: false,
        value: 1,
    }, {
        name: caption.STL_CURD_LBL_LEAVE,
        checked: false,
        value: 2,
    }]
    var vm = $scope;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffLate/GetJtableUserLate/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.model.UserId;
            },
            complete: function (data) {
                if (data.status === 401) {
                    var url = "/Home/Logout";
                    location.href = url;
                }
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataUserLate");
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
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataUserLate').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    if (data.Action == 'GOLATE') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy HH:mm');
                        $scope.entities[0].checked = true;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = false;
                        $scope.goLate = true;
                        $scope.notWork = false;
                        $scope.quitWork = false;
                        setTimeout(function () {
                            loadDateLate();
                        }, 200);
                    } else if (data.Action == 'NOTWORK') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy');

                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = true;
                        $scope.entities[2].checked = false;
                        $scope.goLate = false;
                        $scope.notWork = true;
                        $scope.quitWork = false;
                        setTimeout(function () {
                            loadDateNoWork();
                        }, 200);
                    } else if (data.Action == 'QUITWORK') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = true;
                        $scope.goLate = false;
                        $scope.notWork = false;
                        $scope.quitWork = true;
                        setTimeout(function () {
                            loadDateQuitWork();
                        }, 200);
                    }
                    $scope.model.Id = data.Id;
                    $scope.model.Note = data.Note;
                    $scope.image = data.Picture;
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').notSortable().withOption('sWidth', '30px').withTitle($translate('STL_LIST_COL_STATUS')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').notSortable().withOption('sWidth', '30px').withTitle($translate('STL_LIST_COL_USERID')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').notSortable().withOption('sClass', ' dataTable-pr0').withTitle($translate('STL_LIST_COL_TIME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LocationText').notSortable().withTitle($translate('STL_LIST_COL_PLACE')).renderWith(function (data, type, full) {
        return data
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').notSortable().withTitle($translate('STL_LIST_COL_DESCRIPTION')).renderWith(function (data, type, full) {
        return data
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.initload = function () {
        initGeolocation();
    }
    $scope.initload();

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
        if (SelectType == "Action" && $scope.model.Action != "") {
            $scope.errorAction = false;
        }
    }
    $scope.selectUser = function (userId) {
        var getUser = $scope.listUser.find(function (element) {
            if (element.Id == userId) return true;
        });
        if (getUser) {
            $scope.GiveName = getUser.GivenName;
        }
        reloadData(true);
    }
    $scope.updateSelection = function (position, entities) {
        angular.forEach(entities, function (subscription, index) {
            debugger
            if (position != index) {
                subscription.checked = false;
            } else {
                subscription.checked = true;
            }
        });
        var isValied = false;
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                $scope.goLate = true;
                $scope.notWork = false;
                $scope.quitWork = false;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                isValied = true;
                setTimeout(function () {
                    loadDateLate();
                }, 500);
                break;
            }
            if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                $scope.notWork = true;
                $scope.goLate = false;
                $scope.quitWork = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                setTimeout(function () {
                    loadDateNoWork();
                }, 500);
                break;
            }
            if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                $scope.quitWork = true;
                $scope.notWork = false;
                $scope.goLate = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                setTimeout(function () {
                    loadDateQuitWork();
                }, 500);
                break;
            }
        }
        if (isValied == false) {
            $scope.entities[0].checked = true;
        }
    }

    $scope.add = function () {
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "GOLATE";
            } else if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "NOTWORK";
            } else if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "QUITWORK";
            }
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.model.Lat == '' && $scope.model.Lon == '') {
                App.toastrError(caption.STL_MSG_GPS);
            } else {
                var formData = new FormData();
                formData.append("Picture", $scope.model.Picture);
                formData.append("UserId", $scope.model.UserId);
                formData.append("Action", $scope.model.Action);
                formData.append("ActionTime", $scope.model.ActionTime);
                formData.append("ActionTo", $scope.model.ActionTo);
                formData.append("LocationText", $scope.model.LocationText);
                formData.append("Lat", $scope.model.Lat);
                formData.append("Lon", $scope.model.Lon);
                formData.append("Ip", $scope.model.Ip);
                formData.append("Note", $scope.model.Note)
                dataservice.add(formData, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $rootScope.reloadIndex();
                    }
                })
            }
        }
    }
    $scope.update = function () {
        if ($scope.model.Id == '') {
            App.toastrError(caption.COM_MSG_UNSELECTED_RECORD);
        } else {
            for (var i = 0; i < $scope.entities.length; i++) {
                if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "GOLATE";
                } else if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "NOTWORK";
                } else if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "QUITWORK";
                }
            }
            var formData = new FormData();
            formData.append("Picture", $scope.model.Picture);
            formData.append("Id", $scope.model.Id);
            formData.append("UserId", $scope.model.UserId);
            formData.append("Action", $scope.model.Action);
            formData.append("ActionTime", $scope.model.ActionTime);
            formData.append("ActionTo", $scope.model.ActionTo);
            formData.append("Note", $scope.model.Note)
            dataservice.update(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $rootScope.reloadIndex();
                    resetInput();
                }
            })
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
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
                App.toastrError(caption.STL_CURD_VALIDATE_IMG_FORMAT);
                return;
            } else {
                $scope.model.Picture = files[0];
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    function loadDateNoWork() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            startDate: new Date(),
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
            if ($('#FromTo').valid()) {
                $('#FromTo').removeClass('invalid').addClass('success');
            }
        });

        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            startDate: new Date(),
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
            if ($('#DateTo').valid()) {
                $('#DateTo').removeClass('invalid').addClass('success');
            }
        });

        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    function loadDateLate() {
        $("#ActionTime").datetimepicker({
            startDate: new Date(),
            useCurrent: false,
            autoclose: true,
            keepOpen: false,
            format: 'dd/mm/yyyy hh:ii',
        }).on('changeDate', function () {
            if ($('#ActionTime').valid()) {
                $('#ActionTime').removeClass('invalid').addClass('success');
            }
        });
    };
    function loadDateQuitWork() {
        $("#ActionDate").datepicker({
            inline: false,
            startDate: new Date(),
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#ActionDate').valid()) {
                $('#ActionDate').removeClass('invalid').addClass('success');
            }
        });
    };
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null user
        if (data.UserId == "") {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        ////Check null status
        //if (data.Action == "") {
        //    $scope.errorAction = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorAction = false;
        //}
        return mess;
    };
    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, fail);
        }
        else {
            alert("Sorry, your browser does not support geolocation services.");
        }
    }
    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&', { lat: lat, lon: lon }, function (data) {
            $scope.model.LocationText = data.display_name;
            $scope.model.Lat = lat;
            $scope.model.Lon = lon;
            $scope.$apply();
        });
        $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
            $scope.model.Ip = data.ip;
        });
    }
    function fail() {

    }
    function resetInput() {
        $scope.model.Id = '';
        $scope.model.ActionTime = '';
        $scope.model.Note = '';
        $scope.model.Picture = '';
        $scope.entities[0].checked = true;
        $scope.entities[1].checked = false;
        $scope.entities[2].checked = false;
        $scope.goLate = true;
        $scope.notWork = false;
        $scope.quitWork = false;
        setTimeout(function () {
            $scope.updateSelection();
            loadDateLate();
        }, 200);
    }
    setTimeout(function () {
        $scope.updateSelection();
        setModalDraggable('.modal-dialog');
        loadDateLate();
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, dataservice, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $filter, $translate, $uibModalInstance, para) {
    $scope.model = {
        Ip: '',
        Address: '',
        UserId: para.UserId,
        Action: '',
        ActionTime: '',
        ActionTo: '',
        Note: '',
        Lat: '',
        Lon: '',
        LocationText: '',
        Picture: ''
    }
    $scope.image = "";
    $scope.goLate = true;
    $scope.notWork = false;
    $scope.quitWork = false;
    $scope.listWorkUser = [];
    $scope.entities = [{
        name: caption.STL_CURD_LBL_LATE,
        checked: true,
        value: 0,
    }, {
        name: caption.STL_CURD_LBL_NOT_WORK,
        checked: false,
        value: 1,
    }, {
        name: caption.STL_CURD_LBL_LEAVE,
        checked: false,
        value: 2,
    }]
    var vm = $scope;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffLate/GetJtableUserLate/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.model.UserId;
            },
            complete: function (data) {
                if (data.status === 401) {
                    var url = "/Home/Logout";
                    location.href = url;
                }
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataUserLate")
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
            if (data.Id == para.Id) {
                angular.element(row).addClass('selected');
                if (data.Action == 'GOLATE') {
                    $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy HH:mm');
                    $scope.entities[0].checked = true;
                    $scope.entities[1].checked = false;
                    $scope.entities[2].checked = false;
                    $scope.goLate = true;
                    $scope.notWork = false;
                    $scope.quitWork = false;
                    setTimeout(function () {
                        loadDateLate();
                    }, 200);
                } else if (data.Action == 'NOTWORK') {
                    $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                    $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy');

                    $scope.entities[0].checked = false;
                    $scope.entities[1].checked = true;
                    $scope.entities[2].checked = false;
                    $scope.goLate = false;
                    $scope.notWork = true;
                    $scope.quitWork = false;
                    setTimeout(function () {
                        loadDateNoWork();
                    }, 200);
                } else if (data.Action == 'QUITWORK') {
                    $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                    $scope.entities[0].checked = false;
                    $scope.entities[1].checked = false;
                    $scope.entities[2].checked = true;
                    $scope.goLate = false;
                    $scope.notWork = false;
                    $scope.quitWork = true;
                    setTimeout(function () {
                        loadDateQuitWork();
                    }, 200);
                }
                $scope.model.Id = data.Id;
                $scope.model.Note = data.Note;
                $scope.image = data.Picture;
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataUserLate').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    if (data.Action == 'GOLATE') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy HH:mm');
                        $scope.entities[0].checked = true;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = false;
                        $scope.goLate = true;
                        $scope.notWork = false;
                        $scope.quitWork = false;
                        setTimeout(function () {
                            loadDateLate();
                        }, 200);
                    } else if (data.Action == 'NOTWORK') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy');

                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = true;
                        $scope.entities[2].checked = false;
                        $scope.goLate = false;
                        $scope.notWork = true;
                        $scope.quitWork = false;
                        setTimeout(function () {
                            loadDateNoWork();
                        }, 200);
                    } else if (data.Action == 'QUITWORK') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = true;
                        $scope.goLate = false;
                        $scope.notWork = false;
                        $scope.quitWork = true;
                        setTimeout(function () {
                            loadDateQuitWork();
                        }, 200);
                    }
                    $scope.model.Id = data.Id;
                    $scope.model.Note = data.Note;
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').notSortable().withOption('sWidth', '30px').withTitle($translate('STL_LIST_COL_STATUS')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').notSortable().withOption('sWidth', '30px').withTitle($translate('STL_LIST_COL_USERID')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').notSortable().withOption('sClass', ' dataTable-pr0').withTitle($translate('STL_LIST_COL_TIME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LocationText').notSortable().withTitle($translate('STL_LIST_COL_PLACE')).renderWith(function (data, type, full) {
        return data
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').notSortable().withTitle($translate('STL_LIST_COL_DESCRIPTION')).renderWith(function (data, type, full) {
        return data
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.initload = function () {
        initGeolocation();
    }
    $scope.initload();

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
        if (SelectType == "Action" && $scope.model.Action != "") {
            $scope.errorAction = false;
        }
    }
    $scope.selectUser = function (userId) {
        var getUser = $scope.listUser.find(function (element) {
            if (element.Id == userId) return true;
        });
        if (getUser) {
            $scope.GiveName = getUser.GivenName;
        }
        reloadData(true);
    }
    $scope.updateSelection = function (position, entities) {
        angular.forEach(entities, function (subscription, index) {
            if (position != index) {
                subscription.checked = false;
            } else {
                subscription.checked = true;
            }
        });
        var isValied = false;
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                $scope.goLate = true;
                $scope.notWork = false;
                $scope.quitWork = false;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                isValied = true;
                setTimeout(function () {
                    loadDateLate();
                }, 200);
                break;
            }
            if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                $scope.notWork = true;
                $scope.goLate = false;
                $scope.quitWork = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                setTimeout(function () {
                    loadDateNoWork();
                }, 200);
                break;
            }
            if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                $scope.quitWork = true;
                $scope.notWork = false;
                $scope.goLate = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                setTimeout(function () {
                    loadDateQuitWork();
                }, 200);
                break;
            }
        }
        if (isValied == false) {
            $scope.entities[0].checked = true;
        }
    }

    $scope.add = function () {
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "GOLATE";
            } else if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "NOTWORK";
            } else if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "QUITWORK";
            }
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.model.Lat == '' && $scope.model.Lon == '') {
                App.toastrError(caption.STL_MSG_GPS);
            } else {
                var formData = new FormData();
                formData.append("Picture", $scope.model.Picture);
                formData.append("UserId", $scope.model.UserId);
                formData.append("Action", $scope.model.Action);
                formData.append("ActionTime", $scope.model.ActionTime);
                formData.append("ActionTo", $scope.model.ActionTo);
                formData.append("LocationText", $scope.model.LocationText);
                formData.append("Lat", $scope.model.Lat);
                formData.append("Lon", $scope.model.Lon);
                formData.append("Ip", $scope.model.Ip);
                formData.append("Note", $scope.model.Note)
                dataservice.add(formData, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $rootScope.reloadIndex();
                    }
                })
            }
        }
    }
    $scope.update = function () {
        if ($scope.model.Id == '') {
            App.toastrError(caption.COM_MSG_UNSELECTED_RECORD);
        } else {
            for (var i = 0; i < $scope.entities.length; i++) {
                if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "GOLATE";
                } else if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "NOTWORK";
                } else if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "QUITWORK";
                }
            }
            var formData = new FormData();
            formData.append("Picture", $scope.model.Picture);
            formData.append("Id", $scope.model.Id);
            formData.append("UserId", $scope.model.UserId);
            formData.append("Action", $scope.model.Action);
            formData.append("ActionTime", $scope.model.ActionTime);
            formData.append("ActionTo", $scope.model.ActionTo);
            formData.append("Note", $scope.model.Note)
            dataservice.update(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $rootScope.reloadIndex();
                    resetInput();
                }
            })
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
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
                App.toastrError(caption.STL_CURD_VALIDATE_IMG_FORMAT);
                return;
            } else {
                $scope.model.Picture = files[0];
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    function loadDateNoWork() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            startDate: new Date(),
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
            if ($('#FromTo').valid()) {
                $('#FromTo').removeClass('invalid').addClass('success');
            }
        });

        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            startDate: new Date(),
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
            if ($('#DateTo').valid()) {
                $('#DateTo').removeClass('invalid').addClass('success');
            }
        });
    }
    function loadDateLate() {
        $("#ActionTime").datetimepicker({
            startDate: new Date(),
            useCurrent: false,
            autoclose: true,
            keepOpen: false,
            format: 'dd/mm/yyyy hh:ii',
        }).on('changeDate', function () {
            if ($('#ActionTime').valid()) {
                $('#ActionTime').removeClass('invalid').addClass('success');
            }
        });
    }
    function loadDateQuitWork() {
        $("#ActionDate").datepicker({
            inline: false,
            startDate: new Date(),
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null user
        if (data.UserId == "") {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        ////Check null status
        //if (data.Action == "") {
        //    $scope.errorAction = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorAction = false;
        //}
        return mess;
    };
    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, fail);
        }
        else {
            alert("Sorry, your browser does not support geolocation services.");
        }
    }
    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&', { lat: lat, lon: lon }, function (data) {
            $scope.model.LocationText = data.display_name;
            $scope.model.Lat = lat;
            $scope.model.Lon = lon;
            $scope.$apply();
        });
        $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
            $scope.model.Ip = data.ip;
        });
    }
    function fail() {

    }
    function resetInput() {
        $scope.model.Id = '';
        $scope.model.ActionTime = '';
        $scope.model.Note = '';

        $scope.entities[0].checked = true;
        $scope.entities[1].checked = false;
        $scope.entities[2].checked = false;
        $scope.goLate = true;
        $scope.notWork = false;
        $scope.quitWork = false;
        setTimeout(function () {
            loadDateLate();
        }, 200);
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadDateLate();
    }, 200);
});
app.controller('listUserLate', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        debugger
        $scope.listUserLate = para.listMember;
        $scope.date = para.date;
    }
    $scope.init();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});