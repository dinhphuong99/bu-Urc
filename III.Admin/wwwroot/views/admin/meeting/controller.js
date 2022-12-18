var ctxfolder = "/views/admin/meeting";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
    };
    var apiZoom = function (url, token, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            data: data
        };
        $http(req).then(callback);
    };
    return {
        getZoom: function (userId, token, data, callback) {
            apiZoom('https://api.zoom.us/v2/users/' + userId + '/meetings', token, data);
        },
        createZoom: function (data, callback) {
            $http.post('/Admin/Meeting/CreateZoom/', data).then(callback);
        },
        insertZoom: function (data, callback) {
            $http.post('/Admin/Meeting/Insert/', data).then(callback);
        },
        getListZoom: function (callback) {
            $http.post('/Admin/Meeting/GetListZoom/').then(callback);
        }
    };
});
app.directive('zoom', function (dataservice) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            console.log('checkSystemRequirements');
            console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

            ZoomMtg.preLoadWasm();
            ZoomMtg.prepareJssdk();

            //const API_KEY = 'Ur2bn1tnRR-XB2l6hyUmQA';
            //const API_SECRET = 'WVKeOq0kBZaDShXWDk7bYKOWqVjos61yOMx5';
            //const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IlVyMmJuMXRuUlItWEIybDZoeVVtUUEiLCJleHAiOjE5MjMyODIwMDAsImlhdCI6MTU4NTczOTYwMn0.43N9faiFKbrHKrhZF94J1jqoWWReGwTYpCHUA8S_u7Y';
            //var mid = 'jdirg5mAStutaqOITA8amA';

            //const API_KEY = 'AjfLvY45S62iTggkKDwwMQ';
            //const API_SECRET = 'P7ZcCyyiZhB620pAINa5Cek0OFMhQXEorkOa';
            //const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IkFqZkx2WTQ1UzYyaVRnZ2tLRHd3TVEiLCJleHAiOjE1ODU4MTg0MjEsImlhdCI6MTU4NTgxMzAyMH0.6VJyS2zvX2WH0RGbGpspeB5oCsjRjgSxeJLURa36Ayg';
            //var mid = '4N0k0DepQO2Oy3jxtcGQFg';

            //const API_KEY = 'Ur2bn1tnRR-XB2l6hyUmQA';
            //const API_SECRET = 'cLSCKhAbjdUIeQMreJXmhYjZ5WptSPWu5gqG';
            //const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IlVyMmJuMXRuUlItWEIybDZoeVVtUUEiLCJleHAiOjE1ODY0MjgwMzEsImlhdCI6MTU4NTgyMzIzNH0.RtNBbMoGQI1Vo9J0PljRupD0kZ4Qrgd0CN6EWALBMcA';
            //var mid = 'jdirg5mAStutaqOITA8amA';

            const API_KEY = 'o6EIJCatTZm3t4v0qThsoQ';
            const API_SECRET = 'qwfleud1ZHN6IjzkXoI8ce5Qfnx49zh2mRHE';
            const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6Im82RUlKQ2F0VFptM3Q0djBxVGhzb1EiLCJleHAiOjE1ODY1MDMwMjgsImlhdCI6MTU4NTg5ODIzMX0.bem_KsAtJnQuvX1Z3Cjckq4sOO7_isThA_WhKKXax1c';
            var mid = 'K8tvmoYzSr2OGRODSs_cEg';

            //var mid = '605-623-428';
            var mpas;
            var topic = 'Meeting 3i';
            var body = {
                topic: topic,
                type: 2,
                //start_time: "string [date-time]",
                //duration: "integer",
                //timezone: "string",
                password: '',
                //agenda: '',
                //recurrence: {
                //    type: "integer",
                //    repeat_interval: "integer",
                //    weekly_days: "string",
                //    monthly_day: "integer",
                //    monthly_week: "integer",
                //    monthly_week_day: "integer",
                //    end_times: "integer",
                //    end_date_time: "string [date-time]"
                //},
                settings: {
                    host_video: true,
                    participant_video: true,
                    //cn_meeting: '',
                    //in_meeting: '',
                    join_before_host: true,
                    //mute_upon_entry: '',
                    //watermark: '',
                    //use_pmi: '',
                    approval_type: 2,
                    //registration_type: 1,
                    //audio: '',
                    //auto_recording: '',
                    //enforce_login: false,
                    //enforce_login_domains: '',
                    //alternative_hosts: '',
                    //global_dial_in_countries: [

                    //],
                    //registrants_email_notification: ''
                }
            };
            var dataBody = JSON.stringify(body);
            var obj = {
                Token: TOKEN,
                Data: dataBody
            };

            //const meetConfig = {
            //    apiKey: API_KEY,
            //    apiSecret: API_SECRET,
            //    meetingNumber: 594896953,
            //    userName: 'dinh hiep',
            //    //passWord: rs.Object.encrypted_password,
            //    passWord: '',
            //    leaveUrl: '',
            //    role: 0
            //};
            ////console.log(rs.Object.id);
            //var sign = ZoomMtg.generateSignature({
            //    meetingNumber: 594896953,
            //    apiKey: meetConfig.apiKey,
            //    apiSecret: meetConfig.apiSecret,
            //    role: meetConfig.role,
            //    success(res) {
            //        console.log('signature', res.result);

            //        ZoomMtg.init({
            //            leaveUrl: '',
            //            success() {
            //                ZoomMtg.join(
            //                    {
            //                        meetingNumber: meetConfig.meetingNumber,
            //                        userName: meetConfig.userName,
            //                        signature: res.result,
            //                        apiKey: meetConfig.apiKey,
            //                        userEmail: 'iii.delphinus.com@gmail.com',
            //                        passWord: meetConfig.passWord,
            //                        success() {
            //                            console.log('join meeting success');
            //                        },
            //                        error(res) {
            //                            console.log(res);
            //                        }
            //                    }
            //                );
            //            },
            //            error(res) {
            //                console.log(res);
            //            }
            //        });
            //    }
            //});

            dataservice.createZoom(obj, function (rs) {
                rs = rs.data;
                const meetConfig = {
                    apiKey: API_KEY,
                    apiSecret: API_SECRET,
                    meetingNumber: rs.Object.id,
                    userName: 'dinh hiep',
                    //passWord: rs.Object.encrypted_password,
                    passWord: '',
                    leaveUrl: '/admin',
                    role: 0
                };
                console.log(rs.Object.id);
                var sign = ZoomMtg.generateSignature({
                    meetingNumber: meetConfig.meetingNumber,
                    apiKey: meetConfig.apiKey,
                    apiSecret: meetConfig.apiSecret,
                    role: meetConfig.role,
                    success(res) {
                        console.log('signature', res.result);
                    }
                });

                ZoomMtg.init({
                    leaveUrl: '/admin',
                    success() {
                        ZoomMtg.join(
                            {
                                meetingNumber: meetConfig.meetingNumber,
                                userName: meetConfig.userName,
                                signature: sign,
                                apiKey: meetConfig.apiKey,
                                userEmail: 'iii.delphinus.com@gmail.com',
                                passWord: meetConfig.passWord,
                                success() {
                                    console.log('join meeting success');
                                },
                                error(res) {
                                    console.log(res);
                                }
                            }
                        );
                    },
                    error(res) {
                        console.log(res);
                    }
                });
            });
        }
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
});

app.config(function ($routeProvider, $validatorProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
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

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.ZoomActive = false;
    $scope.ListZoomActive = [];

    var API_KEY = 'o6EIJCatTZm3t4v0qThsoQ';
    var API_SECRET = 'qwfleud1ZHN6IjzkXoI8ce5Qfnx49zh2mRHE';
    var TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6Im82RUlKQ2F0VFptM3Q0djBxVGhzb1EiLCJleHAiOjE1ODY1MDMwMjgsImlhdCI6MTU4NTg5ODIzMX0.bem_KsAtJnQuvX1Z3Cjckq4sOO7_isThA_WhKKXax1c';
    var USER_ID = 'K8tvmoYzSr2OGRODSs_cEg';

    $scope.init = function () {
        dataservice.getListZoom(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                debugger
                $scope.ListZoomActive = rs.Object;
            }
        });
    };
    $scope.init();

    $scope.initZoom = function (topic) {
        if (topic === undefined || topic === '')
            topic = 'Meeting 3i';

        
        var mpas;
        var body = {
            topic: topic,
            type: 2,
            //start_time: "string [date-time]",
            //duration: "integer",
            //timezone: "string",
            password: '',
            //agenda: '',
            //recurrence: {
            //    type: "integer",
            //    repeat_interval: "integer",
            //    weekly_days: "string",
            //    monthly_day: "integer",
            //    monthly_week: "integer",
            //    monthly_week_day: "integer",
            //    end_times: "integer",
            //    end_date_time: "string [date-time]"
            //},
            settings: {
                host_video: true,
                participant_video: true,
                //cn_meeting: '',
                //in_meeting: '',
                join_before_host: true,
                //mute_upon_entry: '',
                //watermark: '',
                //use_pmi: '',
                approval_type: 2,
                //registration_type: 1,
                //audio: '',
                //auto_recording: '',
                //enforce_login: false,
                //enforce_login_domains: '',
                //alternative_hosts: '',
                //global_dial_in_countries: [

                //],
                //registrants_email_notification: ''
            }
        };
        var dataBody = JSON.stringify(body);
        var obj = {
            Token: TOKEN,
            Data: dataBody
        };

        dataservice.createZoom(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modelZoom = {
                    Id: 0,
                    ZoomId: rs.Object.id,
                    ZoomName: rs.Object.topic,
                    ZoomPassword: '',
                    IsDeleted: false
                };
                dataservice.insertZoom(modelZoom, function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) {
                        App.toastrError(rs1.Title);
                    } else {
                        $scope.init();
                    }
                });
            }
        });
    };
    $scope.joinZoom = function (zoom) {
        window.open('https://supportcenter.s-work.vn/?userName=' + zoom.UserName + '&&meetingID=' + zoom.RoomID + '&&passWord=' + zoom.RoomPassWord, '_blank');
    };

    $scope.joinZoom2 = function (zoom) {
        console.log('checkSystemRequirements');
        console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

        ZoomMtg.setZoomJSLib('https://source.zoom.us/1.7.4/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareJssdk();

        zoom.RoomID = parseInt(zoom.RoomID);
        const meetConfig = {
            apiKey: API_KEY,
            apiSecret: API_SECRET,
            meetingNumber: zoom.RoomID,
            userName: zoom.UserName,
            passWord: zoom.RoomPassWord,
            leaveUrl: '/admin/meeting',
            role: zoom.Role
        };

        console.log(zoom.RoomID);

        var sign = ZoomMtg.generateSignature({
            meetingNumber: meetConfig.meetingNumber,
            apiKey: meetConfig.apiKey,
            apiSecret: meetConfig.apiSecret,
            role: meetConfig.role,
            success(res) {
                console.log('signature', res.result);
            }
        });

        $scope.ZoomActive = true;

        ZoomMtg.init({
            leaveUrl: '/admin/meeting',
            success() {
                ZoomMtg.join(
                    {
                        meetingNumber: meetConfig.meetingNumber,
                        userName: meetConfig.userName,
                        signature: sign,
                        apiKey: meetConfig.apiKey,
                        userEmail: 'vietnamtopapp.com@gmail.com',
                        passWord: meetConfig.passWord,
                        success() {
                            console.log('join meeting success');
                        },
                        error(res) {
                            console.log(res);
                        }
                    }
                );
            },
            error(res) {
                console.log(res);
            }
        });
    }

    $scope.showListZoom = false;
    $scope.hideListZoom = function () {
        if ($scope.showListZoom === false) {
            $scope.showListZoom = true;
            $('#icon-zoom').addClass('margin-right-zoom-icon');
        } else {
            $scope.showListZoom = false;
            $('#icon-zoom').removeClass('margin-right-zoom-icon');
        }
    };
});
