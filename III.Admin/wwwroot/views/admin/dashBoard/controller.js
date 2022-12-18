var ctxfolder = "/views/admin/dashBoard";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["App_ESEIM_CARD_JOB", 'App_ESEIM_ALLOCATION', 'App_ESEIM_BUY', 'App_ESEIM_CANCLE', 'App_ESEIM_IMPROVEMENT', 'App_ESEIM_MAINTENANCE', 'App_ESEIM_INVENTORY', 'App_ESEIM_RECALLED', 'App_ESEIM_RPT', 'App_ESEIM_RQMAIN', 'App_ESEIM_TRANSFER', 'App_ESEIM_LIQUIDATION', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber']).
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
        getCount: function (callback) {
            $http.post('/Admin/DashBoard/GetCount').then(callback);
        },
        AmchartCountBuy: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountBuy').then(callback);
        },
        AmchartCountSale: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountSale').then(callback);
        },
        AmchartPieBuy: function (data, callback) {
            $http.post('/Admin/DashBoard/AmchartPieBuy/', data).then(callback);
        },
        AmchartPieSale: function (data, callback) {
            $http.post('/Admin/DashBoard/AmchartPieSale/', data).then(callback);
        },
        AmchartCountCustomers: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountCustomers').then(callback);
        },
        AmchartCountSupplier: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountSupplier').then(callback);
        },
        AmchartPieCustomers: function (data, callback) {
            $http.post('/Admin/DashBoard/AmchartPieCustomers/', data).then(callback);
        },
        AmchartPieSupplier: function (data, callback) {
            $http.post('/Admin/DashBoard/AmchartPieSupplier/', data).then(callback);
        },
        AmchartCountProject: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountProject').then(callback);
        },
        AmchartPieProject: function (data, callback) {
            $http.post('/Admin/DashBoard/AmchartPieProject/', data).then(callback);
        },
        AmchartCountEmployees: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountEmployees').then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/DashBoard/GetWorkFlow').then(callback);
        },
        getCardInBoard: function (data, callback) {
            $http.post('/Admin/DashBoard/GetCardInBoard?ObjCode=' + data).then(callback);
        },
        getSystemLog: function (data, callback) {
            $http.get('/Admin/DashBoard/GetSystemLog?type=' + data).then(callback);
        },
        getStaffKeeping: function (data, callback) {
            $http.post('/Admin/MapOnline/GetStaffKeeping/', data).then(callback);
        },
        getObjTypeJC: function (callback) {
            $http.post('/Admin/CardJob/GetObjTypeJC').then(callback);
        },
        getObjTypeCode: function (data, callback) {
            $http.post('/Admin/CardJob/GetObjFromObjType?code=' + data).then(callback);
        },
        highchartFunds: function (callback) {
            $http.post('/Admin/DashBoard/HighchartFunds').then(callback);
        },
        highchartProds: function (callback) {
            $http.post('/Admin/DashBoard/HighchartProds').then(callback);
        },
        highchartAssets: function (data, callback) {
            $http.post('/Admin/DashBoard/highchartAssets', data).then(callback);
        },
        highchartPieAssets: function (data, callback) {
            $http.post('/Admin/DashBoard/highchartPieAssets', data).then(callback);
        },
        getAssetType: function (callback) {
            $http.post('/Admin/Asset/GetAssetType').then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/User/GetDepartment/').then(callback);
        },
        getGroupUser: function (callback) {
            $http.post('/Admin/User/GetGroupUser/').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/User/GetListUser/').then(callback);
        },
        getRouteInOut: function (data, callback) {
            $http.post('/Admin/DashBoard/GetRouteInOut/', data).then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.IsTranslate = true;
    });

    $rootScope.user = {
        UserOnline: 0,
        PercentUserOnline: 0,
        UserActive: 0
    };

    $rootScope.listDepartment = [];
    $rootScope.listGroupUser = [];
    $rootScope.listUser = [];

    dataservice.getGroupUser(function (rs) {
        rs = rs.data;
        $rootScope.listGroupUser = rs;
    });

    dataservice.getUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/DashBoard/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    $scope.countProject = '';
    $scope.countContractPO = '';
    $scope.AllCardJob = '';
    $scope.cardPending = '';
    $scope.cardDone = '';
    $scope.cardCancled = '';
    $scope.type = caption.DB_LBL_ALL_LOG;
    $scope.projectInsert = 0;
    $scope.projectUpdate = 0;
    $scope.projectDelete = 0;
    $scope.projectPeople = 0;
    $scope.poInsert = 0;
    $scope.poUpdate = 0;
    $scope.poDelete = 0;
    $scope.poPeople = 0;
    $scope.employeeInsert = 0;
    $scope.employeeUpdate = 0;
    $scope.employeeDelete = 0;
    $scope.employeePeople = 0;
    $scope.fundInsert = 0;
    $scope.fundUpdate = 0;
    $scope.fundDelete = 0;
    $scope.fundPeople = 0;
    $scope.custommerInsert = 0;
    $scope.custommerUpdate = 0;
    $scope.custommerDelete = 0;
    $scope.custommerPeople = 0;
    $scope.supplierInsert = 0;
    $scope.supplierUpdate = 0;
    $scope.supplierDelete = 0;
    $scope.supplierPeople = 0;
    $scope.productInsert = 0;
    $scope.productUpdate = 0;
    $scope.productDelete = 0;
    $scope.productPeople = 0;
    $scope.cardJobInsert = 0;
    $scope.cardJobUpdate = 0;
    $scope.cardJobDelete = 0;
    $scope.cardJobPeople = 0;
    $scope.countWork = countWork;
    $scope.countAsset = countAsset;
    $scope.countCMSItem = countCMSItem;
    $scope.setting = {
        ObjCode: ''
    };

    $scope.asset = {
        Type: '',
        Department: '',
        Year: '',
        PieYear: ''
    };

    $scope.getSystemLog = function (type) {
        dataservice.getSystemLog(type, function (rs) {
            rs = rs.data;
            $scope.projectInsert = rs.projectInsert;
            $scope.projectUpdate = rs.projectUpdate;
            $scope.projectDelete = rs.projectDelete;
            $scope.projectPeople = rs.projectPeople;
            $scope.poInsert = rs.poInsert;
            $scope.poUpdate = rs.poUpdate;
            $scope.poDelete = rs.poDelete;
            $scope.poPeople = rs.poPeople;
            $scope.employeeInsert = rs.employeeInsert;
            $scope.employeeUpdate = rs.employeeUpdate;
            $scope.employeeDelete = rs.employeeDelete;
            $scope.employeePeople = rs.employeePeople;
            $scope.fundInsert = rs.fundInsert;
            $scope.fundUpdate = rs.fundUpdate;
            $scope.fundDelete = rs.fundDelete;
            $scope.fundPeople = rs.fundPeople;
            $scope.custommerInsert = rs.custommerInsert;
            $scope.custommerUpdate = rs.custommerUpdate;
            $scope.custommerDelete = rs.custommerDelete;
            $scope.custommerPeople = rs.custommerPeople;
            $scope.supplierInsert = rs.supplierInsert;
            $scope.supplierUpdate = rs.supplierUpdate;
            $scope.supplierDelete = rs.supplierDelete;
            $scope.supplierPeople = rs.supplierPeople;
            $scope.productInsert = rs.productInsert;
            $scope.productUpdate = rs.productUpdate;
            $scope.productDelete = rs.productDelete;
            $scope.productPeople = rs.productPeople;
            $scope.cardJobInsert = rs.cardJobInsert;
            $scope.cardJobUpdate = rs.cardJobUpdate;
            $scope.cardJobDelete = rs.cardJobDelete;
            $scope.cardJobPeople = rs.cardJobPeople;
        });
    };
    $scope.drawChartProgress = function (code) {
        dataservice.getCardInBoard(code, function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                var listMonths = {
                    Month: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                    Total: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
                if (rs[i].data.length > 0) {
                    for (var j = 0; j < rs[i].data.length; j++) {
                        var nestedList = rs[i].data[j];
                        var check = false;
                        for (var k = 0; k < listMonths.Month.length; k++) {
                            if (nestedList.length > 0) {
                                for (var m = 0; m < nestedList.length; m++) {
                                    var progress = nestedList[m].Progress;
                                    var weightNum = nestedList[m].WeighNum;
                                    if (nestedList[m].Month == listMonths.Month[k]) {
                                        listMonths.Total[k] += (weightNum * progress) / 100;
                                        check = true;
                                    }
                                }
                            }
                            if (check == true)
                                break;
                        }
                    }
                }
                listData.push({
                    name: rs[i].name,
                    data: listMonths.Total
                });
            }

            $("#highchart_100").highcharts({
                chart: {
                    style: {
                        fontFamily: "Open Sans"
                    }
                },
                title: {
                    text: "",
                    x: -20
                },
                //subtitle: {
                //    text: "Source: WorldClimate.com",
                //    x: -20
                //},
                xAxis: {
                    categories: [caption.DB_LBL_MONTH_JAN, caption.DB_LBL_MONTH_FEB, caption.DBL_LBL_MONTH_MAR, caption.DB_LBL_MONTH_APR, caption.DB_LBL_MONTH_MAY, caption.DB_LBL_MONTH_JUN, caption.DB_LBL_MONTH_JULY, caption.DB_LBL_MONTH_AUG, caption.DB_LBL_MONTH_SEPT, caption.DB_LBL_MONTH_OCT, caption.DB_LBL_MONTH_NOV, caption.DB_LBL_MONTH_DEC]
                },
                yAxis: {
                    title: {
                        text: caption.DB_LBL_PROGRESS_JOB
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: "#808080"
                    }]
                },
                tooltip: {
                    valueSuffix: "%"
                },
                legend: {
                    layout: "vertical",
                    align: "right",
                    verticalAlign: "middle",
                    borderWidth: 0
                },
                series: listData,
            })
        })
    };

    $scope.highchartAssets = function () {
        dataservice.highchartAssets($scope.asset, function (rs) {
            rs = rs.data;
            var listData = [];
            var listMonthView = [caption.DB_LBL_MONTH_JAN, caption.DB_LBL_MONTH_FEB, caption.DBL_LBL_MONTH_MAR, caption.DB_LBL_MONTH_APR, caption.DB_LBL_MONTH_MAY, caption.DB_LBL_MONTH_JUN, caption.DB_LBL_MONTH_JULY, caption.DB_LBL_MONTH_AUG, caption.DB_LBL_MONTH_SEPT, caption.DB_LBL_MONTH_OCT, caption.DB_LBL_MONTH_NOV, caption.DB_LBL_MONTH_DEC];
            var listMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

            for (var i = 0; i < listMonth.length; i++) {
                for (var j = 0; j < rs.length; j++) {
                    var obj = {
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        name: ""
                    };
                    obj.name = rs[j].name;
                    for (var k = 0; k < rs[j].data.length; k++) {
                        if (rs[j].data[k].month === listMonth[i]) {
                            obj.data[i] = rs[j].data[k].value;

                            var result = listData.find(e => e.name === rs[j].name);
                            if (result !== null && result !== undefined) {
                                result.data[i] = rs[j].data[k].value;
                            } else {
                                listData.push(obj);
                            }
                        }
                    }
                }
            }

            if (rs.length === 0) {
                App.toastrError(caption.DB_MSG_NOT_FOUND_DATA);
                return;
            }

            Highcharts.setOptions({
                chart: {
                    style: {
                        fontFamily: 'Roboto Condensed'
                    }
                },
                lang: {
                    thousandsSep: ',',
                    numericSymbols: [" " + caption.DB_LBL_VND_CURRENCY, " " + caption.DB_LBL_MILLION, " " + caption.DB_LBL_BILLION]
                }
            });

            $("#hightchart_Asset").highcharts({
                title: {
                    text: caption.DB_LBL_CHART_ASSET,
                    style: {
                        color: "#20b2aa",
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: caption.DB_LBL_VALUE_VND
                    }
                },
                xAxis: {
                    categories: listMonthView,
                    crosshair: true
                },
                tooltip: {
                    valueSuffix: " " + caption.DB_LBL_VND_CURRENCY
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },
                plotOptions: {
                    series: {
                        label: {
                            connectorAllowed: false
                        },
                        pointStart: 0
                    }
                },
                series: listData,
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            legend: {
                                layout: 'horizontal',
                                align: 'center',
                                verticalAlign: 'bottom'
                            }
                        }
                    }]
                }
            });
        });
    };
    $scope.highchartPieAssets = function () {
        dataservice.highchartPieAssets($scope.asset, function (rs) {
            rs = rs.data;
            var listData = rs;
            if (listData.length === 0) {
                App.toastrError(caption.DB_MSG_NOT_FOUND_DATA);
                return;
            }

            $("#hightchart_PieAsset").highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: caption.DB_LBL_CHART_STATUS_ASSET,
                    style: {
                        color: "#20b2aa",
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        colors: ["#dd2c00", "#ffab00", "#00c853", "#006064", "#303f9f", "#7c4dff", "#558b2f", "#ffa000", "#bf360c", "#212121", "#ad1457", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65"],
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    }
                },
                series: [{
                    name: caption.DB_LBL_RATE,
                    data: listData
                }],
            });
        });
    };

    $scope.initDatePicker = function () {
        $("#TimeBuy").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "months",
            minViewMode: "months"
        });
        $("#TimeSale").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "months",
            minViewMode: "months"
        });
        $("#TimeCustomer").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "months",
            minViewMode: "months"
        });
        $("#TimeSupplier").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "months",
            minViewMode: "months"
        });
        $("#TimeProject").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "months",
            minViewMode: "months"
        });
        $("#assetYear").datepicker({
            inline: false,
            autoclose: true,
            format: "yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "years",
            minViewMode: "years",
        });
        $("#assetPieYear").datepicker({
            inline: false,
            autoclose: true,
            format: "yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "years",
            minViewMode: "years"
        });
    }
    $scope.initData = function () {
        var d = new Date();
        $scope.asset.Year = d.getFullYear();
        $scope.initDatePicker();
        dataservice.getSystemLog('', function (rs) {
            rs = rs.data;
            $scope.projectInsert = rs.projectInsert;
            $scope.projectUpdate = rs.projectUpdate;
            $scope.projectDelete = rs.projectDelete;
            $scope.projectPeople = rs.projectPeople;
            $scope.poInsert = rs.poInsert;
            $scope.poUpdate = rs.poUpdate;
            $scope.poDelete = rs.poDelete;
            $scope.poPeople = rs.poPeople;
            $scope.employeeInsert = rs.employeeInsert;
            $scope.employeeUpdate = rs.employeeUpdate;
            $scope.employeeDelete = rs.employeeDelete;
            $scope.employeePeople = rs.employeePeople;
            $scope.fundInsert = rs.fundInsert;
            $scope.fundUpdate = rs.fundUpdate;
            $scope.fundDelete = rs.fundDelete;
            $scope.fundPeople = rs.fundPeople;
            $scope.custommerInsert = rs.custommerInsert;
            $scope.custommerUpdate = rs.custommerUpdate;
            $scope.custommerDelete = rs.custommerDelete;
            $scope.custommerPeople = rs.custommerPeople;
            $scope.supplierInsert = rs.supplierInsert;
            $scope.supplierUpdate = rs.supplierUpdate;
            $scope.supplierDelete = rs.supplierDelete;
            $scope.supplierPeople = rs.supplierPeople;
            $scope.productInsert = rs.productInsert;
            $scope.productUpdate = rs.productUpdate;
            $scope.productDelete = rs.productDelete;
            $scope.productPeople = rs.productPeople;
            $scope.cardJobInsert = rs.cardJobInsert;
            $scope.cardJobUpdate = rs.cardJobUpdate;
            $scope.cardJobDelete = rs.cardJobDelete;
            $scope.cardJobPeople = rs.cardJobPeople;
        });
        dataservice.getWorkFlow(function (rs) {
            rs = rs.data;
            $scope.listWorkFlow = rs;
        });
        dataservice.getCount(function (rs) {
            rs = rs.data;
            $scope.countProject = rs.Project;
            $scope.countContractPO = rs.ContractPO;
            $scope.AllCardJob = rs.AllCard;
            $scope.cardPending = rs.CardPending;
            $scope.cardDone = rs.CardDone;
            $scope.cardCancled = rs.CardCancled
            $scope.totalUser = rs.TotalUser;
            $rootScope.user.UserActive = rs.TotalUser;
            $scope.contractPending = rs.ContractPending;
            $scope.projectPending = rs.ProjectPending;
            $scope.userOnline = rs.UserOnline;
            $rootScope.user.UserOnline = rs.UserOnline;
            $scope.progressPro = rs.ProgressPro;
            $scope.progressContract = rs.ProgressContract;
            $scope.progressCard = rs.ProgressCard;
            $scope.progressUser = rs.ProgressUser;
        });
        dataservice.getObjTypeJC(function (rs) {
            rs = rs.data;
            $scope.objTypeJC = rs;
        });
        dataservice.getAssetType(function (rs) {
            rs = rs.data;
            $scope.listAssetType = rs;
        });
        dataservice.getDepartment(function (rs) {
            rs = rs.data;
            $scope.listAssetDepartment = rs;
            $rootScope.listDepartment = rs;
        });

        var data = {
            TimePieBuy: null
        };
        //bieu do hop dong
        dataservice.AmchartCountBuy(function (rs) {
            rs = rs.data;
            var listDataincome = [];
            var listDataMonth = [];
            var listDataTotal = [];
            for (var i = 0; i < rs.length; i++) {
                switch (rs[i].Month) {
                    case (rs[i].Month = 1): {
                        listDataMonth.push(caption.DB_LBL_MONTH_JAN);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 2): {
                        listDataMonth.push(caption.DB_LBL_MONTH_FEB);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 3): {
                        listDataMonth.push(caption.DBL_LBL_MONTH_MAR);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 4): {
                        listDataMonth.push(caption.DB_LBL_MONTH_APR);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 5): {
                        listDataMonth.push(caption.DB_LBL_MONTH_MAY);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 6): {
                        listDataMonth.push(caption.DB_LBL_MONTH_JUN);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 7): {
                        listDataMonth.push(caption.DB_LBL_MONTH_JULY);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 8): {
                        listDataMonth.push(caption.DB_LBL_MONTH_AUG);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 9): {
                        listDataMonth.push(caption.DB_LBL_MONTH_SEPT);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 10): {
                        listDataMonth.push(caption.DB_LBL_MONTH_OCT);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 11): {
                        listDataMonth.push(caption.DB_LBL_MONTH_NOV);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 12): {
                        listDataMonth.push(caption.DB_LBL_MONTH_DEC);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                }
            }

            $("#amchart_CountBuy").highcharts({
                chart: {
                    type: 'column',
                    styledMode: true
                },

                title: {
                    text: caption.DB_LBL_CHART_SALES
                },
                xAxis: {
                    categories: listDataMonth
                },
                yAxis: [{
                    className: 'highcharts-color-0',
                    title: {
                        text: caption.DB_LBL_NUM_CONTRACT_SALE
                    }
                }, {
                    className: 'highcharts-color-1',
                    opposite: true,
                    title: {
                        text: caption.DB_LBL_MONEY
                    }
                }],
                colors: ['#c15954', '#09af6a'],
                plotOptions: {
                    column: {
                        borderRadius: 5
                    }
                },
                series: [{
                    name: caption.DB_LBL_NUM_CONTRACT_SALE,
                    data: listDataincome
                }, {
                    name: caption.DB_LBL_MONEY,
                    data: listDataTotal,
                    yAxis: 1
                }]

            });
        });
        dataservice.AmchartCountSale(function (rs) {
            rs = rs.data;
            var listDataincome = [];
            var listDataMonth = [];
            var listDataTotal = [];
            for (var i = 0; i < rs.length; i++) {
                switch (rs[i].Month) {
                    case (rs[i].Month = 1): {
                        listDataMonth.push(caption.DB_LBL_MONTH_JAN);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 2): {
                        listDataMonth.push(caption.DB_LBL_MONTH_FEB);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 3): {
                        listDataMonth.push(caption.DBL_LBL_MONTH_MAR);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 4): {
                        listDataMonth.push(caption.DB_LBL_MONTH_APR);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 5): {
                        listDataMonth.push(caption.DB_LBL_MONTH_MAY);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 6): {
                        listDataMonth.push(caption.DB_LBL_MONTH_JUN);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 7): {
                        listDataMonth.push(caption.DB_LBL_MONTH_JULY);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 8): {
                        listDataMonth.push(caption.DB_LBL_MONTH_AUG);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 9): {
                        listDataMonth.push(caption.DB_LBL_MONTH_SEPT);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 10): {
                        listDataMonth.push(caption.DB_LBL_MONTH_OCT);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 11): {
                        listDataMonth.push(caption.DB_LBL_MONTH_NOV);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }
                    case (rs[i].Month = 12): {
                        listDataMonth.push(caption.DB_LBL_MONTH_DEC);
                        listDataincome.push(rs[i].income);
                        listDataTotal.push(rs[i].Total);
                        break;
                    }

                }
            }
            $("#amchart_CountSale").highcharts({
                chart: {
                    type: 'column',
                    styledMode: true
                },

                title: {
                    text: caption.DB_LBL_CONTRACT_PO
                },
                xAxis: {
                    categories: listDataMonth
                },
                yAxis: [{
                    className: 'highcharts-color-0',
                    title: {
                        text: caption.DB_LBL_NUM_CONTRACT_SALE
                    }
                }, {
                    className: 'highcharts-color-1',
                    opposite: true,
                    title: {
                        text: caption.DB_LBL_MONEY
                    }
                }],
                colors: ['#c15954', '#09af6a'],
                plotOptions: {
                    column: {
                        borderRadius: 5
                    }
                },

                series: [{
                    name: caption.DB_LBL_NUM_CONTRACT_SALE,
                    data: listDataincome
                }, {
                    name: caption.DB_LBL_MONEY,
                    data: listDataTotal,
                    yAxis: 1
                }]

            });
        });
        dataservice.AmchartPieBuy(data, function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                listData.push({
                    name: rs[i].country,
                    y: rs[i].litres
                })
            }
            $("#amchart_PieBuy").highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: caption.DB_LBL_PIE_CONTRACT_PO,
                    style: {
                        color: "#0b6d68",
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        colors: ["#90a4ae", "#e53935", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65", "#e57373", "#ba68c8", "#7986cb", "#81d4fa", "#a5d6a7", "#e6ee9c", "#ffe082", "#ffb74d"],
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    }
                },
                series: [{
                    name: caption.DB_LBL_RATE,
                    data: listData
                }],
            });
        });
        dataservice.AmchartPieSale(data, function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                listData.push({
                    name: rs[i].country,
                    y: rs[i].litres
                })
            }
            $("#amchart_PieSale").highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: caption.DB_LBL_PIE_CONTRACT_SALE,
                    style: {
                        color: "#0d85a9",
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    }
                },
                series: [{
                    name: caption.DB_LBL_RATE,
                    data: listData
                }],
                colors: ["#bf360c", "#ad1457", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65", "#dd2c00", "#ffab00", "#00c853", "#006064", "#303f9f", "#7c4dff", "#558b2f", "#ffa000"],
            });
        });
        // bieu do khach hang nha cung cap
        dataservice.AmchartCountCustomers(function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                switch (rs[i].month) {
                    case (rs[i].month = 1): {
                        var data = [caption.DB_LBL_MONTH_JAN, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 2): {
                        var data = [caption.DB_LBL_MONTH_FEB, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 3): {
                        var data = [caption.DBL_LBL_MONTH_MAR, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 4): {
                        var data = [caption.DB_LBL_MONTH_APR, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 5): {
                        var data = [caption.DB_LBL_MONTH_MAY, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 6): {
                        var data = [caption.DB_LBL_MONTH_JUN, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 7): {
                        var data = [caption.DB_LBL_MONTH_JULY, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 8): {
                        var data = [caption.DB_LBL_MONTH_AUG, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 9): {
                        var data = [caption.DB_LBL_MONTH_SEPT, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 10): {
                        var data = [caption.DB_LBL_MONTH_OCT, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 11): {
                        var data = [caption.DB_LBL_MONTH_NOV, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 12): {
                        var data = [caption.DB_LBL_MONTH_DEC, rs[i].income]
                        listData.push(data);
                        break;
                    }

                }
            }
            $("#amchart_CountCustomers").highcharts({
                chart: {
                    type: 'column',
                },
                title: {
                    text: caption.DB_LBL_CHART_CUS,
                    style: {
                        color: "#81b999",
                    }
                },
                xAxis: {
                    type: 'category',
                    labels: {
                        rotation: -45,
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: caption.DB_LBL_HR_COUNT
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: caption.DB_LBL_HR_COUNT + ': <b>{point.y:.1f}</b>'
                },
                series: [{
                    name: caption.DB_LBL_NUM_CONTRACT,
                    data: listData,
                    dataLabels: {
                        enabled: true,
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.1f}', // one decimal
                        y: 10, // 10 pixels down from the top
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    },
                    color: "#81b999"
                }]
            });
        });
        dataservice.AmchartCountSupplier(function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                switch (rs[i].month) {
                    case (rs[i].month = 1): {
                        var data = [caption.DB_LBL_MONTH_JAN, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 2): {
                        var data = [caption.DB_LBL_MONTH_FEB, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 3): {
                        var data = [caption.DBL_LBL_MONTH_MAR, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 4): {
                        var data = [caption.DB_LBL_MONTH_APR, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 5): {
                        var data = [caption.DB_LBL_MONTH_MAY, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 6): {
                        var data = [caption.DB_LBL_MONTH_JUN, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 7): {
                        var data = [caption.DB_LBL_MONTH_JULY, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 8): {
                        var data = [caption.DB_LBL_MONTH_AUG, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 9): {
                        var data = [caption.DB_LBL_MONTH_SEPT, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 10): {
                        var data = [caption.DB_LBL_MONTH_OCT, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 11): {
                        var data = [caption.DB_LBL_MONTH_NOV, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 12): {
                        var data = [caption.DB_LBL_MONTH_DEC, rs[i].income]
                        listData.push(data);
                        break;
                    }

                }
            }
            $("#amchart_CountSupplier").highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: caption.DB_LBL_SUPP,
                    style: {
                        color: "#0c5b82",
                    }
                },
                xAxis: {
                    type: 'category',
                    labels: {
                        rotation: -45,
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: caption.DB_LBL_HR_COUNT
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: caption.DB_LBL_HR_COUNT + ': <b>{point.y:.1f}</b>'
                },
                series: [{
                    name: caption.DB_LBL_NUM_CONTRACT,
                    data: listData,
                    dataLabels: {
                        enabled: true,
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.1f}', // one decimal
                        y: 10, // 10 pixels down from the top
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    },
                    color: "#0c5b82",
                }]
            });
        });
        dataservice.AmchartPieCustomers(data, function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                listData.push({
                    name: rs[i].country,
                    y: rs[i].litres
                })
            }
            $("#amchart_PieCustomers").highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: caption.DB_LBL_PIE_CUS,
                    style: {
                        color: "#81b999",
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    }
                },
                series: [{
                    name: caption.DB_LBL_RATE,
                    data: listData
                }],
                colors: ["#dd2c00", "#ffab00", "#00c853", "#006064", "#303f9f", "#7c4dff", "#558b2f", "#ffa000", "#bf360c", "#212121", "#ad1457", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65"
                ],
            });
        });
        dataservice.AmchartPieSupplier(data, function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                listData.push({
                    name: rs[i].country,
                    y: rs[i].litres
                })
            }
            $("#amchart_PieSupplie").highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: caption.DB_LBL_PIE_SUPP,
                    style: {
                        color: "#0c5b82",
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    }
                },
                series: [{
                    name: caption.DB_LBL_RATE,
                    data: listData
                }],
                colors: ["#e57373", "#ba68c8", "#7986cb", "#81d4fa", "#a5d6a7", "#e6ee9c", "#ffe082", "#ffb74d", "#a1887f", "#90a4ae", "#e53935", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65"],
            });
        });
        // Dự án và gói thầu
        dataservice.AmchartCountProject(function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                switch (rs[i].month) {
                    case (rs[i].month = 1): {
                        var data = [caption.DB_LBL_MONTH_JAN, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 2): {
                        var data = [caption.DB_LBL_MONTH_FEB, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 3): {
                        var data = [caption.DBL_LBL_MONTH_MAR, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 4): {
                        var data = [caption.DB_LBL_MONTH_APR, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 5): {
                        var data = [caption.DB_LBL_MONTH_MAY, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 6): {
                        var data = [caption.DB_LBL_MONTH_JUN, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 7): {
                        var data = [caption.DB_LBL_MONTH_JULY, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 8): {
                        var data = [caption.DB_LBL_MONTH_AUG, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 9): {
                        var data = [caption.DB_LBL_MONTH_SEPT, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 10): {
                        var data = [caption.DB_LBL_MONTH_OCT, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 11): {
                        var data = [caption.DB_LBL_MONTH_NOV, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 12): {
                        var data = [caption.DB_LBL_MONTH_DEC, rs[i].income]
                        listData.push(data);
                        break;
                    }

                }
            }
            $("#amchart_CountProject").highcharts({
                chart: {
                    renderTo: 'container',
                    type: 'column',
                    options3d: {
                        enabled: true,
                        alpha: 15,
                        beta: 15,
                        depth: 50,
                        viewDistance: 25
                    }
                },
                title: {
                    text: caption.DB_LBL_CHART_PROJECT,
                    style: {
                        color: "#20b2aa",
                    }
                },
                xAxis: {
                    type: 'category',
                    labels: {
                        rotation: -45,
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: caption.DB_LBL_HR_COUNT
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: caption.DB_LBL_HR_COUNT + ': <b>{point.y:.1f}</b>'
                },
                series: [{
                    name: caption.DB_LBL_NUM_PROJECT,
                    data: listData,
                    dataLabels: {
                        enabled: true,
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.1f}', // one decimal
                        y: 10, // 10 pixels down from the top
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    },
                    color: "#20b2aa",
                }]
            });
        });
        dataservice.AmchartPieProject(data, function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                listData.push({
                    name: rs[i].country,
                    y: rs[i].litres
                })
            }
            $("#amchart_PieProject").highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: caption.DB_LBL_PIE_STATUS_PROJECT,
                    style: {
                        color: "#20b2aa",
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        colors: ["#90a4ae", "#e53935", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65", "#e57373", "#ba68c8", "#7986cb", "#81d4fa", "#a5d6a7", "#e6ee9c", "#ffe082", "#ffb74d"],
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    }
                },
                series: [{
                    name: caption.DB_LBL_RATE,
                    data: listData
                }],
                //colors: ["#dd2c00", "#ffab00", "#00c853", "#006064", "#303f9f", "#7c4dff", "#558b2f", "#ffa000", "#bf360c", "#212121", "#ad1457", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65"],
            });
        });
        // quan trị nhan su
        dataservice.AmchartCountEmployees(function (rs) {
            rs = rs.data;
            var listData = [];
            for (var i = 0; i < rs.length; i++) {
                switch (rs[i].month) {
                    case (rs[i].month = 1): {
                        var data = [caption.DB_LBL_MONTH_JAN, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 2): {
                        var data = [caption.DB_LBL_MONTH_FEB, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 3): {
                        var data = [caption.DBL_LBL_MONTH_MAR, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 4): {
                        var data = [caption.DB_LBL_MONTH_APR, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 5): {
                        var data = [caption.DB_LBL_MONTH_MAY, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 6): {
                        var data = [caption.DB_LBL_MONTH_JUN, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 7): {
                        var data = [caption.DB_LBL_MONTH_JULY, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 8): {
                        var data = [caption.DB_LBL_MONTH_AUG, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 9): {
                        var data = [caption.DB_LBL_MONTH_SEPT, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 10): {
                        var data = [caption.DB_LBL_MONTH_OCT, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 11): {
                        var data = [caption.DB_LBL_MONTH_NOV, rs[i].income]
                        listData.push(data);
                        break;
                    }
                    case (rs[i].month = 12): {
                        var data = [caption.DB_LBL_MONTH_DEC, rs[i].income]
                        listData.push(data);
                        break;
                    }

                }
            }
            $("#amchart_CountEmployees").highcharts({
                chart: {
                    renderTo: 'container',
                    type: 'column',
                    options3d: {
                        enabled: true,
                        alpha: 15,
                        beta: 15,
                        depth: 50,
                        viewDistance: 25
                    }
                },
                title: {
                    text: caption.DB_CHART_HR_EMPLOYEE,
                    style: {
                        color: "#20b2aa",
                    }
                },
                xAxis: {
                    type: 'category',
                    labels: {
                        rotation: -45,
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: caption.DB_LBL_HR_COUNT
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: caption.DB_LBL_HR_NEW_COUNT + ': <b>{point.y:.1f}</b>'
                },
                series: [{
                    name: caption.DB_LBL_HR_EMP_NEW,
                    data: listData,
                    dataLabels: {
                        enabled: true,
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.1f}', // one decimal
                        y: 10, // 10 pixels down from the top
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    },
                    color: "#20b2aa",
                }]
            });
        });

        // bieu do quy
        dataservice.highchartFunds(function (rs) {
            rs = rs.data;
            var listData = [];
            var listMonthView = [caption.DB_LBL_MONTH_JAN, caption.DB_LBL_MONTH_FEB, caption.DBL_LBL_MONTH_MAR, caption.DB_LBL_MONTH_APR, caption.DB_LBL_MONTH_MAY, caption.DB_LBL_MONTH_JUN, caption.DB_LBL_MONTH_JULY, caption.DB_LBL_MONTH_AUG, caption.DB_LBL_MONTH_SEPT, caption.DB_LBL_MONTH_OCT, caption.DB_LBL_MONTH_NOV, caption.DB_LBL_MONTH_DEC];
            var listMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

            for (var i = 0; i < listMonth.length; i++) {
                for (var j = 0; j < rs.length; j++) {
                    var obj = {
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        name: ""
                    };
                    obj.name = rs[j].name;
                    for (var k = 0; k < rs[j].data.length; k++) {
                        if (rs[j].data[k].month === listMonth[i]) {
                            obj.data[i] = rs[j].data[k].value;

                            var result = listData.find(e => e.name === rs[j].name);
                            if (result !== null && result !== undefined) {
                                result.data[i] = rs[j].data[k].value;
                            } else {
                                listData.push(obj);
                            }
                        }
                    }
                }
            }

            Highcharts.setOptions({
                chart: {
                    style: {
                        fontFamily: 'Roboto Condensed'
                    }
                },
                lang: {
                    thousandsSep: ',',
                    numericSymbols: [" " + caption.DB_LBL_VND_CURRENCY, " " + caption.DB_LBL_MILLION, " " + caption.DB_LBL_BILLION]
                }
            });

            $("#chart_fund").highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Quỹ',
                    style: {
                        color: "#3498db",
                    }
                },
                xAxis: {
                    categories: listMonthView,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: caption.DB_LBL_MONEY_VND
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y} VNĐ</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.1,
                        borderWidth: 0
                    }
                },
                series: listData,
                colors: ["#3498db", "#e67e22"],
            });
        });

        // bieu do san pham
        dataservice.highchartProds(function (rs) {
            rs = rs.data;
            var listData = [];
            var listMonthView = [caption.DB_LBL_MONTH_JAN, caption.DB_LBL_MONTH_FEB, caption.DBL_LBL_MONTH_MAR, caption.DB_LBL_MONTH_APR, caption.DB_LBL_MONTH_MAY, caption.DB_LBL_MONTH_JUN, caption.DB_LBL_MONTH_JULY, caption.DB_LBL_MONTH_AUG, caption.DB_LBL_MONTH_SEPT, caption.DB_LBL_MONTH_OCT, caption.DB_LBL_MONTH_NOV, caption.DB_LBL_MONTH_DEC];
            var listMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

            for (var i = 0; i < listMonth.length; i++) {
                for (var j = 0; j < rs.length; j++) {
                    var obj = {
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        name: ""
                    };
                    obj.name = rs[j].name;
                    for (var k = 0; k < rs[j].data.length; k++) {
                        if (rs[j].data[k].month === listMonth[i]) {
                            obj.data[i] = rs[j].data[k].value;
                            var result = listData.find(e => e.name === rs[j].name);
                            if (result !== null && result !== undefined) {
                                result.data[i] = rs[j].data[k].value;
                            } else {
                                listData.push(obj);
                            }
                        }
                    }
                }
            }


            $("#chart_prod").highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: caption.DB_LBL_MATERIAL,
                    style: {
                        color: "#44bd32",
                    }
                },
                xAxis: {
                    categories: listMonthView,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: caption.DB_LBL_NUM_MATERIAL
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y} Thiết bị</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.1,
                        borderWidth: 0
                    }
                },
                series: listData,
                colors: ["#44bd32", "#e1b12c"],
            });
        });
        $scope.drawChartProgress($scope.setting.ObjCode);
        $scope.highchartAssets();
        $scope.highchartPieAssets();

    };
    $scope.initData();
    $scope.objTypeChange = function (code) {
        dataservice.getObjTypeCode(code, function (rs) {
            rs = rs.data;
            $scope.listObjWithType = rs;
        });
    };
    $scope.objCodeChange = function (code) {
        $scope.drawChartProgress(code);
    };
    $scope.ChangeTimePieBuy = function (TimePieBuy) {
        var data = {
            TimePieBuy: TimePieBuy
        };
        dataservice.AmchartPieBuy(data, function (rs) {
            rs = rs.data;
            if (rs.length == 0) {
                App.toastrError(caption.DB_MSG_NOT_FOUND_CONTRACT + " " + TimePieBuy);
            }
            else {
                var listData = [];
                for (var i = 0; i < rs.length; i++) {
                    listData.push({
                        name: rs[i].country,
                        y: rs[i].litres
                    })
                }
                $("#amchart_PieBuy").highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: caption.DB_LBL_PIE_BUY,
                        style: {
                            color: "#0b6d68",
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    accessibility: {
                        point: {
                            valueSuffix: '%'
                        }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            colors: ["#90a4ae", "#e53935", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65", "#e57373", "#ba68c8", "#7986cb", "#81d4fa", "#a5d6a7", "#e6ee9c", "#ffe082", "#ffb74d"],
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                                distance: -50,
                                filter: {
                                    property: 'percentage',
                                    operator: '>',
                                    value: 4
                                }
                            }
                        }
                    },

                    series: [{
                        name: caption.DB_LBL_RATE,
                        data: listData
                    }],
                });
            }
        });
    };
    $scope.ChangeTimePieSale = function (TimePieSale) {
        var data = {
            TimePieBuy: TimePieSale
        };
        dataservice.AmchartPieSale(data, function (rs) {
            rs = rs.data;
            if (rs.length == 0) {
                App.toastrError(caption.DB_MSG_NOT_FOUND_CONTRACT_PO + " " + TimePieSale);
            }
            else {
                var listData = [];
                for (var i = 0; i < rs.length; i++) {
                    listData.push({
                        name: rs[i].country,
                        y: rs[i].litres
                    })
                }
                $("#amchart_PieSale").highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: caption.DB_LBL_PIE_BUY,
                        style: {
                            color: "#0d85a9",
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    accessibility: {
                        point: {
                            valueSuffix: '%'
                        }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            colors: pieColors,
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                                distance: -50,
                                filter: {
                                    property: 'percentage',
                                    operator: '>',
                                    value: 4
                                }
                            }
                        }
                    },
                    series: [{
                        name: caption.DB_LBL_RATE,
                        data: listData
                    }],
                    colors: ["#bf360c", "#ad1457", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65", "#dd2c00", "#ffab00", "#00c853", "#006064", "#303f9f", "#7c4dff", "#558b2f", "#ffa000"],
                });
            }
        });
    };
    $scope.ChangeTimePieCustomer = function (TimePieCustomer) {
        var data = {
            TimePieBuy: TimePieCustomer
        };
        dataservice.AmchartPieCustomers(data, function (rs) {
            rs = rs.data;
            if (rs.length == 0) {
                App.toastrError(caption.DB_MSG_NO_CUS_ADD_NEW + " " + TimePieCustomer);
            }
            else {
                var listData = [];
                for (var i = 0; i < rs.length; i++) {
                    listData.push({
                        name: rs[i].country,
                        y: rs[i].litres
                    })
                }
                $("#amchart_PieCustomers").highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: caption.DB_LBL_PIE_CUS,
                        style: {
                            color: "#9265b3",
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    accessibility: {
                        point: {
                            valueSuffix: '%'
                        }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                                distance: -50,
                                filter: {
                                    property: 'percentage',
                                    operator: '>',
                                    value: 4
                                }
                            }
                        }
                    },
                    series: [{
                        name: caption.DB_LBL_RATE,
                        data: listData
                    }],
                    colors: ["#dd2c00", "#ffab00", "#00c853", "#006064", "#303f9f", "#7c4dff", "#558b2f", "#ffa000", "#bf360c", "#212121", "#ad1457", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65"],
                });
            }
        });
    };
    $scope.ChangeTimePieSupplier = function (TimePieSupplier) {
        var data = {
            TimePieBuy: TimePieSupplier
        };
        dataservice.AmchartPieSupplier(data, function (rs) {
            rs = rs.data;
            if (rs.length == 0) {
                App.toastrError(caption.DB_MSG_NO_SUPP_ADD_NEW + " " + TimePieSupplier);
            }
            else {
                var listData = [];
                for (var i = 0; i < rs.length; i++) {
                    listData.push({
                        name: rs[i].country,
                        y: rs[i].litres
                    })
                }
                $("#amchart_PieSupplie").highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: caption.DB_LBL_PIE_SUPP,
                        style: {
                            color: "#0c5b82",
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    accessibility: {
                        point: {
                            valueSuffix: '%'
                        }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                                distance: -50,
                                filter: {
                                    property: 'percentage',
                                    operator: '>',
                                    value: 4
                                }
                            }
                        }
                    },
                    series: [{
                        name: caption.DB_LBL_RATE,
                        data: listData,
                    }],
                    colors: ["#e57373", "#ba68c8", "#7986cb", "#81d4fa", "#a5d6a7", "#e6ee9c", "#ffe082", "#ffb74d", "#a1887f", "#90a4ae", "#e53935", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65"],
                });
            }
        });

    };
    $scope.ChangeTimePieProject = function (TimePieProject) {
        var data = {
            TimePieBuy: TimePieProject
        };
        dataservice.AmchartPieProject(data, function (rs) {
            rs = rs.data;
            if (rs.length == 0) {
                App.toastrError(caption.DB_MSG_NO_PROJ_ADD_NEW + " " + TimePieProject);
            }
            else {
                var listData = [];
                for (var i = 0; i < rs.length; i++) {
                    listData.push({
                        name: rs[i].country,
                        y: rs[i].litres
                    })
                }
                $("#amchart_PieProject").highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: caption.DB_LBL_PIE_STATUS_PROJECT,
                        style: {
                            color: "#20b2aa",
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    accessibility: {
                        point: {
                            valueSuffix: '%'
                        }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                                distance: -50,
                                filter: {
                                    property: 'percentage',
                                    operator: '>',
                                    value: 4
                                }
                            }
                        }
                    },
                    series: [{
                        name: caption.DB_LBL_RATE,
                        data: listData
                    }],
                    //colors: ["#dd2c00", "#ffab00", "#00c853", "#006064", "#303f9f", "#7c4dff", "#558b2f", "#ffa000", "#bf360c", "#212121", "#ad1457", "#7b1fa2", "#1976d2", "#0288d1", "#009688", "#9ccc65"],
                });
            }
        });
    };
    $scope.changeAssetType = function (code) {
        $scope.highchartAssets();
    };
    $scope.changeAssetDepartment = function (code) {
        $scope.highchartAssets();
    };
    $scope.changeAssetYear = function (code) {
        $scope.highchartAssets();
    };
    $scope.changeAssetPieYear = function (code) {
        $scope.highchartPieAssets();
    };



    //Notification info
    $scope.info = {};
    var vmInfo = $scope.info;
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
    vmInfo.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DashBoard/JtableInfo",
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
            },
            complete: function () {
                App.unblockUI("#contentMain");
                var listInfo = $('#tblDataInfo').DataTable().data();
                $scope.countInfo = listInfo.count();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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

                }
            });
        });
    vmInfo.dtColumns = [];
    vmInfo.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vmInfo.dtColumns.push(DTColumnBuilder.newColumn('title').withTitle($translate('DB_LIST_COL_TITLE')).renderWith(function (data, type) {
        return data;
    }));
    vmInfo.dtColumns.push(DTColumnBuilder.newColumn('name').withTitle($translate('DB_LIST_COL_CATE')).renderWith(function (data, type) {
        return data;
    }));
    vmInfo.dtColumns.push(DTColumnBuilder.newColumn('created').withOption('sClass', 'dataTable-10per').withTitle($translate('DB_LIST_COL_DATE_POST')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vmInfo.dtColumns.push(DTColumnBuilder.newColumn('date_post').withOption('sClass', 'dataTable-10per').withTitle($translate('DB_LIST_COL_DATE_CREATE')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vmInfo.dtColumns.push(DTColumnBuilder.newColumn('modified').withOption('sClass', 'dataTable-10per').withTitle($translate('DB_LIST_COL_DATE_UPDATE')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vmInfo.reloadData = reloadData;
    vmInfo.dtInstance = {};
    function reloadData(resetPaging) {
        vmInfo.dtInstance.reloadData(callback, resetPaging);

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
                    vmInfo.selectAll = false;
                    return;
                }
            }
        }
        vmInfo.selectAll = true;
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
    setInterval(function () {
        //$("#highchart_100").highcharts().setSize(800,300);
        //$("#highchart_quantity").highcharts().reflow();
        //$("#highchart_result_maintenance").highcharts().reflow();
        //$("#highchart_plan_maintenance").highcharts().reflow();
    }, 1);
});

app.controller('maponline', function ($scope, $rootScope, $compile, $uibModal, $location, dataservice, $filter, DTOptionsBuilder, DTColumnBuilder) {
    var carSourceVector = new ol.source.Vector({
        features: []
    });
    var carSourceVectorStatus = new ol.source.Vector({
        features: []
    });
    var carSourceVectorTypeAndBranch = new ol.source.Vector({
        features: []
    });
    var map;
    // layer map
    var LayerMap;
    var layerGoogle = new ol.source.XYZ({
        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    })
    var OSM = new ol.source.OSM({
    })
    // mảng chứa id xe và x,y là kích thước xe
    var idCar = [];
    var x = 32;
    var y = 32;

    //mảng chứa layer tuyến đường
    var routeSources = new ol.source.Vector({
        features: []
    });
    var routeSourceVector = new ol.layer.Vector({
        source: routeSources,
        updateWhileAnimating: true
    });

    //Show or hide route when click on car
    var routeCarSources = new ol.source.Vector({
        features: []
    });
    var routeCarSourceVector = new ol.layer.Vector({
        source: routeCarSources,
        updateWhileAnimating: true
    });
    //mảng marker center park
    var parkCenterSourceVector = new ol.source.Vector({
        features: []
    });
    var parkCenterLayer = new ol.layer.Vector({
        source: parkCenterSourceVector,
        updateWhileAnimating: true
    });
    // mảng chứa layer điểm để rác
    var parkSources = new ol.source.Vector({
        features: [
        ]
    });
    var parkSourceVector = new ol.layer.Vector({
        source: parkSources,
        updateWhileAnimating: true
    });
    //Mảng chứa điểm rác được thêm mới khi vẽ bằng đa giác
    var drawSV = new ol.source.Vector({ wrapX: false });
    var drawLV = new ol.layer.Vector({
        source: drawSV
    });
    // mảng layer chứa route để thêm điểm
    var routeDrawSource = new ol.source.Vector({
        features: [
        ]
    });
    var routeDrawLayer = new ol.layer.Vector({
        source: routeDrawSource,
        updateWhileAnimating: true
    });
    // mảng layer chứa điểm mới vẽ
    var parkDrawSource = new ol.source.Vector({
        features: [
        ]
    });
    var parkDrawLayer = new ol.layer.Vector({
        source: parkDrawSource,
        updateWhileAnimating: true
    });
    $scope.map.UserName = userName;
    var date = new Date();
    $scope.model.FromDate = $filter('date')((date), 'dd/MM/yyyy')
    $scope.initData = function () {
        $scope.map.UserName = userName;
    }
    $scope.initData();
    drawMarkerExistRm = function () {
        try {
            var searchData = { FromDate: $scope.model.FromDate, ToDate: "", UserName: $scope.map.UserName }
            dataservice.getRouteInOut(searchData, function (rs) {
                rs = rs.data;
                carSourceVector.clear();
                rs.forEach(element => {
                    element.RouteInOuts.forEach(data => {
                        var icon = "";
                        if (data.Action == 'In') {
                            icon = '/images/map/pinmap_start.png';
                        }
                        else {
                            icon = '/images/map/pinmap_red.png';
                        }
                        if (data.LatLng != null) {
                            var a = JSON.parse(data.LatLng);
                            var styleFunction = new ol.style.Style({
                                image: new ol.style.Icon(({
                                    anchor: [0.5, 0.5],
                                    size: [33, 33],
                                    opacity: 6,
                                    scale: 1,
                                    src: icon,
                                })),
                                text: new ol.style.Text({
                                    text: "",
                                    fill: new ol.style.Fill({
                                        color: '#000000'
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: [156, 203, 227, 0.8],
                                        width: 10
                                    }),
                                    font: 'bold 12px "Helvetica Neue", Arial',
                                    textAlign: "bottom",
                                    offsetY: -18,
                                    offsetX: -38
                                }),
                            })
                            var lonlat3857 = new ol.geom.Point(ol.proj.transform([a[1], a[0]], 'EPSG:4326',
                                'EPSG:3857'));
                            var iconFeature = new ol.Feature({
                                geometry: lonlat3857,
                                name: "",
                                population: 4000,
                                rainfall: 500,
                                style: styleFunction
                            });
                            iconFeature.set("name", element.UserName)
                            iconFeature.set("time", data.Time)
                            var popup = new ol.Overlay.Popup;
                            iconFeature.set("popup", popup);
                            iconFeature.setStyle(styleFunction);
                            carSourceVector.addFeature(iconFeature);
                        }

                    })
                    if (element.DataGps != "") {
                        var dataGps = "[" + element.DataGps + "]"
                        var listDataGps = JSON.parse(dataGps);

                        var array = [];
                        for (var i = 0; i < listDataGps.length; i++) {
                            //Draw line
                            var a = ol.proj.transform([listDataGps[i].lng, listDataGps[i].lat], 'EPSG:4326', 'EPSG:3857');
                            array.push(a)

                            var styleFunction = new ol.style.Style({
                                image: new ol.style.Icon(({
                                    anchor: [0.5, 0.5],
                                    size: [33, 33],
                                    opacity: 6,
                                    scale: 1,
                                    src: "/images/map/pinmap_violet.png",
                                })),
                                text: new ol.style.Text({
                                    text: "",
                                    fill: new ol.style.Fill({
                                        color: '#000000'
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: [156, 203, 227, 0.8],
                                        width: 10
                                    }),
                                    font: 'bold 12px "Helvetica Neue", Arial',
                                    textAlign: "bottom",
                                    offsetY: -18,
                                    offsetX: -38
                                }),
                            })
                            var lonlat3857 = new ol.geom.Point(ol.proj.transform([listDataGps[i].lng, listDataGps[i].lat], 'EPSG:4326',
                                'EPSG:3857'));
                            var iconFeature = new ol.Feature({
                                geometry: lonlat3857,
                                name: "",
                                population: 4000,
                                rainfall: 500,
                                style: styleFunction
                            });
                            iconFeature.set("name", element.UserName)
                            iconFeature.set("time", listDataGps[i].Time)
                            var popup = new ol.Overlay.Popup;
                            iconFeature.set("popup", popup);
                            iconFeature.setStyle(styleFunction);
                            carSourceVector.addFeature(iconFeature);
                        }

                        //Draw line
                        var lineString = new ol.geom.LineString([]);
                        lineString.setCoordinates(array);
                        var styleLine = new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                width: 1.5, color: '#25B128'
                            }),
                            text: new ol.style.Text({
                                text: "",
                                fill: new ol.style.Fill({
                                    color: '#000000'
                                }),
                                stroke: new ol.style.Stroke({
                                    color: [156, 203, 227, 0.8],
                                    width: 5
                                }),
                                font: 'bold 12px "Helvetica Neue", Arial',
                                backgroundFill: new ol.style.Fill({
                                    color: '#D3D3D3',
                                }),
                                textAlign: "bottom",
                                offsetY: -18,
                                offsetX: -38
                            }),
                            zIndex: 2
                        })

                        var routeInOut = new ol.Feature({
                            geometry: lineString,
                            name: ""
                        });
                        routeInOut.setStyle(styleLine);
                        routeSources.addFeature(routeInOut);
                    }
                });
            })
        }
        catch (ex) {

        }
    };
    $scope.search = function () {
        drawMarkerExistRm();
    }

    $scope.listStaffOnline = [];
    var input = document.getElementById('autocomplete');
    var autocomplete = new google.maps.places.Autocomplete(input);
    var bounds = new google.maps.LatLngBounds();
    $scope.numLines = [{ Code: '', Name: "Tất cả" }, { Code: 1, Name: "1 Chiều" }, { Code: 2, Name: "2 Chiều" }];
    $scope.statuss = [{ Code: '', Name: "Tất cả" }, { Code: 1, Name: "Cấm đường" }, { Code: 2, Name: "Hoạt động" }];
    encodeStyle = function (styles) {
        let ret = "";

        const styleparse_types = { "all": "0", "administrative": "1", "administrative.country": "17", "administrative.land_parcel": "21", "administrative.locality": "19", "administrative.neighborhood": "20", "administrative.province": "18", "landscape": "5", "landscape.man_made": "81", "landscape.natural": "82", "poi": "2", "poi.attraction": "37", "poi.business": "33", "poi.government": "34", "poi.medical": "36", "poi.park": "40", "poi.place_of_worship": "38", "poi.school": "35", "poi.sports_complex": "39", "road": "3", "road.arterial": "50", "road.highway": "49", "road.local": "51", "transit": "4", "transit.line": "65", "transit.station": "66", "water": "6" };

        const styleparse_elements = { "all": "a", "geometry": "g", "geometry.fill": "g.f", "geometry.stroke": "g.s", "labels": "l", "labels.icon": "l.i", "labels.text": "l.t", "labels.text.fill": "l.t.f", "labels.text.stroke": "l.t.s" };

        const styleparse_stylers = { "color": "p.c", "gamma": "p.g", "hue": "p.h", "invert_lightness": "p.il", "lightness": "p.l", "saturation": "p.s", "visibility": "p.v", "weight": "p.w" };

        styles.forEach((style) => {
            if (style.featureType) ret += "s.t:" + styleparse_types[style.featureType] + "|";

            // if !styleparse_elements[style.elementType], the style element is unknown
            if (style.elementType) ret += "s.e:" + styleparse_elements[style.elementType] + "|";

            style.stylers.forEach((styler) => {
                let keys = [];
                for (var k in styler) {
                    if (k === "color" && styler[k].length === 7) styler[k] = "#ff" + styler[k].slice(1);
                    ret += styleparse_stylers[k] + ":" + styler[k] + "|";
                }
            });

            ret = ret.slice(0, ret.length - 1);
            ret += ","
        });

        return encodeURIComponent(ret.slice(0, ret.length - 1));
    };
    styles = [
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        }
    ];
    const apistyles = encodeStyle(styles);
    var googleLayer = new ol.source.XYZ({
        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=' + apistyles,
    })
    var config = {
        init: function () {
            config.loadMap();
            config.setHeightMap();
            config.mapClick();
            config.zoomMap();
            config.searchMap();
        },
        loadMap: function () {
            carLayerMarker = new ol.layer.Vector({
                source: carSourceVector
            });
            carLayerMarker.setZIndex(2);
            LayerMap = new ol.layer.Tile({
                source: googleLayer
            });
            map = new ol.Map({
                target: $('#mapEmployee')[0],
                layers: [
                    LayerMap,
                    carLayerMarker,
                    routeSourceVector,
                    routeCarSourceVector,
                ],
                view: new ol.View({
                    center: ol.proj.transform([105.805069, 20.991153], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 15
                }),
                controls: ol.control.defaults({
                    attribution: false,
                    zoom: false,
                })
            });
            drawMarkerExistRm();
        },
        setHeightMap: function () {
            var maxHeightMap = $(window).height() - $("#mapEmployee").position().top - 40;
            $("#mapEmployee").css({
                'height': maxHeightMap,
                'max-height': maxHeightMap,
                'overflow': 'auto',
            });
            config.mapReSize();
        },
        radians: function (n) {
            return n * (Math.PI / 180);
        },
        degrees: function (n) {
            return n * (180 / Math.PI);
        },
        mapClick: function () {
            map.on('click', function (evt) {
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature) {
                        return feature;
                    });

                if (feature) {
                    var name = feature.get("name");
                    var time = feature.get("time");
                    var coordinates = feature.getGeometry().getCoordinates();
                    var html = '<div id="content">' +
                        '<div id="siteNotice">' +
                        '</div>' +
                        '<b>Tài khoản : </b>' + '<span class="text-danger bold">' + name + '</span>' + '<br>' +
                        '<b>Thời gian : </b>' + '<span class="text-danger bold">' + time + '</span>' + '<br>' +
                        '</p>' +
                        '</div>' +
                        '</div>';
                    var popup = new ol.Overlay.Popup;
                    map.addOverlay(popup);
                    popup.show(coordinates, html);
                }
            });
        },
        mapReSize: function () {
            setTimeout(function () {
                map.updateSize();
            }, 600);
        },
        zoomMap: function () {

            var zzoom = 13;
            map.on('moveend', (function () {
                var zoom = map.getView().getZoom();
                if (idCar.length > 0) {
                    if (zoom > zzoom) {
                        var so = Math.abs(zoom - zzoom);
                        x = 10 + (2 * so);
                        y = 20 + (4 * so);

                        for (var i = 0; i < idCar.length; i++) {
                            var feature1 = carSourceVector.getFeatureById(idCar[i]);
                            var bear = feature1.get("bear");
                            var licensePlate = feature1.get("licensePlate");
                            var styleFunction = new ol.style.Style({
                                image: new ol.style.Icon(({
                                    anchor: [0.5, 0.5],
                                    size: [x, y],
                                    opacity: 6,
                                    scale: 0.7,
                                    rotation: bear,
                                    src: urlIcon
                                    //src: '/images/map/car.png'
                                })),
                                text: new ol.style.Text({
                                    text: licensePlate,
                                    fill: new ol.style.Fill({
                                        color: '#8B0000'
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: [141, 238, 238, 0.8],
                                        width: 10
                                    }),
                                    font: 'bold 11px "Helvetica Neue", Arial',
                                    textAlign: "bottom",
                                    offsetY: -18,
                                    offsetX: -38
                                }),
                            })
                            carSourceVector.getFeatureById(idCar[i]).setStyle(styleFunction);
                        }
                    } else {
                        var zoom = map.getView().getZoom();
                        var so2 = Math.abs(zoom - zzoom);
                        x = 10 - (2 * so2);
                        y = 20 - (4 * so2);

                        for (var i = 0; i < idCar.length; i++) {
                            var feature1 = carSourceVector.getFeatureById(idCar[i]);
                            var bear = feature1.get("bear");
                            var licensePlate = feature1.get("licensePlate");
                            var styleFunction = new ol.style.Style({
                                image: new ol.style.Icon(({
                                    anchor: [0.5, 0.5],
                                    size: [x, y],
                                    opacity: 6,
                                    scale: 0.7,
                                    rotation: bear,
                                    src: urlIcon
                                    //src: '/images/map/car.png'
                                })),
                                text: new ol.style.Text({
                                    text: licensePlate,
                                    fill: new ol.style.Fill({
                                        color: '#8B0000'
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: [141, 238, 238, 0.8],
                                        width: 10
                                    }),
                                    font: 'bold 11px "Helvetica Neue", Arial',
                                    textAlign: "bottom",
                                    offsetY: -18,
                                    offsetX: -38
                                }),
                            })
                            carSourceVector.getFeatureById(idCar[i]).setStyle(styleFunction);
                        }
                    }
                }

            }));
        },
        loadImage: function (src) {
            var image = new Image();
            image.src = src;
            return image;
        },
        getBearing: function (startLat, startLong, endLat, endLong) {
            startLat = config.radians(startLat);
            startLong = config.radians(startLong);
            endLat = config.radians(endLat);
            endLong = config.radians(endLong);
            var dLong = endLong - startLong;
            var dPhi = Math.log(Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0));
            if (Math.abs(dLong) > Math.PI) {
                if (dLong > 0.0)
                    dLong = -(2.0 * Math.PI - dLong);
                else
                    dLong = (2.0 * Math.PI + dLong);
            }
            return (config.degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
        },
        searchMap: function () {
            $('#TimKiem').click(function () {
                var place = autocomplete.getPlace();

                var a = bounds.extend(place.geometry.location);
                var lat = place.geometry.location.lat();
                var lng = place.geometry.location.lng();
                var point = new ol.geom.Point(ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'));
                map.setView(new ol.View({
                    center: ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 11
                }));
                map.getView().setZoom(15);
            });
            $scope.searchStaff = function () {
                $scope.initData();
            };
        },
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
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
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
    }
    setTimeout(function () {
        loadDate();
        config.init();
    }, 200);
    setInterval(function () {
        //drawMarkerExistRm();
    }, 60000)
});

app.controller('systemLog', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
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
    vm.dtOptions = DTOptionsBuilder.newOptions()
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
                d.UserName = $scope.system.UserName;
                d.FromDate = $scope.system.FromDate;
                d.ToDate = $scope.system.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full._STT] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected,$event)"/><span></span></label>';
    }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"DB_LIST_COL_ID" | translate}}').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"DB_LIST_COL_OBJECT" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{"DB_LIST_COL_ACTION" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RequestBody').withTitle('{{"DB_LIST_COL_REQUEST_BODY" | translate}}').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"DB_LIST_COL_CREATED_BY" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"DB_LIST_COL_CREATED_TIME" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('IP').withTitle('{{"DB_LIST_COL_IP_ACCESS" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
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
    function toggleOne(selectedItems, evt) {
        $(evt.target).closest('tr').toggleClass('selected');
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
    $scope.search = function () {
        reloadData(true);
    };
    $scope.reload = function () {
        reloadData(true);
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.openLog = function (id) {

        var userModel = {};
        var listdata = $('#tblDataSystemLog').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/showLog.html',
            controller: 'showLog',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return userModel.RequestBody;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    };
    $scope.initDatePicker = function () {
        $("#sysFromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        });
        $("#sysToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        });
    };
    setTimeout(function () {
        $scope.initDatePicker();
    }, 50);
});

app.controller('showLog', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, $timeout, para) {
    var data = '';
    if (para !== '' && para !== null && para !== undefined) {
        data = JSON.parse(para);
    }
    $scope.obj = { data: data, options: { mode: 'code' } };
    //$scope.onLoad = function (instance) {
    //    instance.expandAll();
    //};

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 1);
});

app.controller('card-notifi', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    //Datatable Job Card
    $scope.job = {};
    var vmJob = $scope.job;
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
    vmJob.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DashBoard/JTable",
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
            },
            complete: function () {
                App.unblockUI("#contentMain");
                var listdata = $('#tblDataJob').DataTable().data();

                $rootScope.countJob = listdata.count();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(4)
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
                        size: '70',
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
    vmJob.dtColumns = [];
    vmJob.dtColumns.push(DTColumnBuilder.newColumn("CardID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.CardID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vmJob.dtColumns.push(DTColumnBuilder.newColumn('CardName').withTitle($translate('DB_LIST_COL_CARD_NAME')).renderWith(function (data, type, full) {
        var deadLine = '';
        var workType = "";
        var priority = "";
        var updateTimeTxt = "";
        var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;

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
            workType = '<span class="badge-customer badge-customer-success ml-1">Chưa có kiểu công việc</span>'
        }
        if (full.Priority != "") {
            priority = '<span class="badge-customer badge-customer-success">' + full.Priority + '</span>'
        } else {
            priority = '<span class="badge-customer badge-customer-success">Chưa có độ ưu tiên</span>'
        }

        if (full.UpdatedTimeTxt != "") {
            updateTimeTxt = '<span class="badge-customer badge-customer-black ml-1">' + full.UpdatedTimeTxt + '</span>'
        }

        if (full.EndTime == '') {
            deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Không đặt thời hạn</span>'
        } else {
            var created = new Date(full.EndTime);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                var diffMsOutTime = (now - created);
                var diffDayOutTime = Math.floor((diffMsOutTime / 86400000));
                deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn ' + diffDayOutTime + ' ngày</span>';
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
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9">&nbsp;Hoàn thành</span>' +
                workType +
                '</div>' + '<div class= "pt5">' + priority + updateTimeTxt + '</div>';

        } else if (full.Status == 'Đang triển khai') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                '<span> ' + cardName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Đang triển khai</span>' + deadLine + workType +
                '</div>' + '<div class ="pt5">' + priority + updateTimeTxt + '</div>';
        } else if (full.Status == 'Bị hủy') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Bị hủy</span>' + workType +
                '</div>' + '<div class ="pt5">' + priority + updateTimeTxt + '</div>';
        }
        else if (full.Status == 'Mới tạo') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9">&nbsp;Mới tạo</span>' + deadLine + workType +
                '</div>' + '<div class ="pt5">' + priority + updateTimeTxt + '</div>';
        } else if (full.Status == 'Thẻ rác') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9">&nbsp;Thẻ rác</span>' + deadLine + workType +
                '</div>' + '<div class ="pt5">' + priority + updateTimeTxt + '</div>';
        } else if (full.Status == 'Đóng') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9">&nbsp;Đóng</span>' + deadLine + workType +
                '</div>' + '<div class ="pt5">' + priority + updateTimeTxt + '</div>';
        }
    }).withOption('sClass', 'nowrap'));
    vmJob.dtColumns.push(DTColumnBuilder.newColumn('ContractName').withTitle($translate('DB_LIST_COL_CONTRACT')).renderWith(function (data, type) {
        return data;
    }));
    vmJob.dtColumns.push(DTColumnBuilder.newColumn('ProjectName').withTitle($translate('DB_LIST_COL_PROJECT')).renderWith(function (data, type) {
        return data;
    }));
    vmJob.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withTitle($translate('DB_LIST_COL_START_DATE')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vmJob.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle($translate('DB_LIST_COL_END_DATE')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vmJob.dtColumns.push(DTColumnBuilder.newColumn('ListName').withTitle($translate('DB_LIST_COL_LIST_NAME')).renderWith(function (data, type) {
        return data;
    }));
    vmJob.dtColumns.push(DTColumnBuilder.newColumn('BoardName').withTitle($translate('DB_LIST_COL_BOARD_NAME')).renderWith(function (data, type) {
        return data;
    }));
    vmJob.reloadData = reloadData;
    vmJob.dtInstance = {};
    function reloadData(resetPaging) {
        vmJob.dtInstance.reloadData(callback, resetPaging);

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
                    vmJob.selectAll = false;
                    return;
                }
            }
        }
        vmJob.selectAll = true;
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
});

app.controller('asset-manager', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    // Datatable Asset workflow
    $scope.asset = {};
    var vmAsset = $scope.asset;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vmAsset.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DashBoard/JtableAsset",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

            },
            complete: function () {
                App.unblockUI("#contentMain");
                var listAsset = $('#tblDataAset').DataTable().data();
                //$scope.countAsset = listAsset.count();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(8)
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
                    switch (data.TypeCode) {
                        case "ALLOCATE":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderAllocation + '/edit.html',
                                controller: 'editAllocate',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                            }, function () {
                            });
                            break;
                        case "LIQUIDATION":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderLiquidation + '/edit.html',
                                controller: 'editLiquidation',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                            }, function () {
                            });
                            break;
                        case "BUY":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderBuy + '/edit.html',
                                controller: 'editBuy',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                            }, function () {
                            });
                            break;
                        case "CANCLED":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderCancle + '/edit.html',
                                controller: 'editCancle',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {

                            }, function () {
                            });
                            break;
                        case "IMPROVEMENT":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderImprovement + '/edit.html',
                                controller: 'editImprovement',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                            }, function () {
                            });
                            break;
                        case "INVENTORY":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderInventory + '/edit.html',
                                controller: 'editInventory',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                            }, function () {
                            });
                            break;
                        case "MAINTENANCE":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderMaintenance + '/edit.html',
                                controller: 'editMaintenance',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                            }, function () {
                            });
                            break;
                        case "RECALLED":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderRecall + '/edit.html',
                                controller: 'editRecalled',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                            }, function () {
                            });
                            break;
                        case "RPTBROKEN":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderRPT + '/edit.html',
                                controller: 'editRPT',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                            }, function () {
                            });
                            break;
                        case "RQMAINTENACE_REPAIR":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderRQMAIN + '/edit.html',
                                controller: 'edit',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                            }, function () {
                            });
                            break;
                        case "TRANSFER":
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderTransfer + '/edit.html',
                                controller: 'editTransfer',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return data.ID;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                                $scope.reload();
                            }, function () {
                            });
                            break;
                    }
                }
            });
        });
    vmAsset.dtColumns = [];
    vmAsset.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.ID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vmAsset.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle($translate('DB_LIST_COL_TICKET_CODE')).renderWith(function (data, type, full) {
        return data;
    }).withOption('sClass', 'nowrap'));
    vmAsset.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle($translate('DB_LIST_COL_TITLE')).renderWith(function (data, type) {
        return data;
    }));
    vmAsset.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle($translate('DB_LISTC_COL_STATUS')).renderWith(function (data, type) {
        return data;
    }));
    vmAsset.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle($translate('DB_LIST_COL_TYPE')).renderWith(function (data, type) {
        return data;
    }));
    vmAsset.reloadData = reloadData;
    vmAsset.dtInstance = {};
    function reloadData(resetPaging) {
        vmAsset.dtInstance.reloadData(callback, resetPaging);

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
                    vmAsset.selectAll = false;
                    return;
                }
            }
        }
        vmAsset.selectAll = true;
    }

});

