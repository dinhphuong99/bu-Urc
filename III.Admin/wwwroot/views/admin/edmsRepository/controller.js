var ctxfolder = "/views/admin/edmsRepository";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput'])
    .directive('customOnChange', function () {
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
    })
    .directive('fileDropzone', function () {
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        var formData = new FormData();
        formData.append("FileUpload", data.FileUpload);
        formData.append("FileCode", data.FileCode);
        formData.append("FileName", data.FileName);
        formData.append("FileType", data.FileType);
        formData.append("CateRepoSettingId", data.CateRepoSettingId);
        formData.append("Tags", data.Tags);
        formData.append("Desc", data.Desc);
        formData.append("ReposCode", data.ReposCode);
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
            data: formData
        }
        $http(req).then(callback);
    };
    var submitFormUploadNew = function (url, data, callback) {
        var formData = new FormData();
        formData.append("CateRepoSettingId", data.CateRepoSettingId);
        formData.append("FileUpload", data.FileUpload);
        formData.append("FileName", data.FileName);
        formData.append("Desc", data.Desc);
        formData.append("Tags", data.Tags);
        formData.append("NumberDocument", data.NumberDocument);
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
            data: formData
        }
        $http(req).then(callback);
    };
    return {
        //category
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getTreeInNode: function (data, callback) {
            $http.post('/Admin/EDMSRepository/GetTreeInNode?parentId=' + data).then(callback);
        },
        getParentCategory: function (data, callback) {
            $http.post('/Admin/EDMSRepository/GetParentCategory', data).then(callback);
        },
        getItemCategory: function (data, callback) {
            $http.get('/Admin/EDMSRepository/GetItemCategory?id=' + data).then(callback);
        },
        insertCategory: function (data, callback) {
            $http.post('/Admin/EDMSRepository/InsertCategory', data).then(callback);
        },
        updateCategory: function (data, callback) {
            $http.post('/Admin/EDMSRepository/UpdateCategory', data).then(callback);
        },
        deleteCategory: function (data, callback) {
            $http.post('/Admin/EDMSRepository/DeleteCategory?catCode=' + data).then(callback);
        },

        //repository
        getTreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeRepository').then(callback);
        },
        getItemRepository: function (data, callback) {
            $http.get('/Admin/EDMSRepository/GetItemRepository?reposCode=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        insertRepository: function (data, callback) {
            $http.post('/Admin/EDMSRepository/InsertRepository', data).then(callback);
        },
        updateRepository: function (data, callback) {
            $http.post('/Admin/EDMSRepository/UpdateRepository', data).then(callback);
        },
        deleteRepository: function (data, callback) {
            $http.post('/Admin/EDMSRepository/DeleteRepository?respos=' + data).then(callback);
        },

        //file
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/EDMSRepository/InsertFile', data, callback);
        },
        deleteFile: function (data, callback) {
            $http.post('/Admin/EDMSRepository/DeleteFile', data).then(callback);
        },
        getContract: function (callback) {
            $http.post('/Admin/EDMSRepository/GetContract').then(callback);
        },
        getFileImage: function (data, callback) {
            $http.get('/Admin/EDMSRepository/GetFileImage?id=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getObjectsType: function (callback) {
            $http.post('/Admin/EDMSRepository/GetObjectsType').then(callback);
        },
        getListObject: function (data, callback) {
            $http.get('/Admin/EDMSRepository/GetListObject?objectType=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/EDMSRepository/GetItem?id=' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        //getAllContract: function (callback) {
        //    $http.post('/Admin/EDMSRepository/GetAllContract').then(callback);
        //},
        //getAllCustomer: function (callback) {
        //    $http.post('/Admin/EDMSRepository/GetAllCustomer').then(callback);
        //},
        //getAllSupplier: function (callback) {
        //    $http.post('/Admin/EDMSRepository/GetAllSupplier').then(callback);
        //},
        //getAllProject: function (callback) {
        //    $http.post('/Admin/EDMSRepository/GetAllProject').then(callback);
        //},

        jtableFileWithRepository: function (data, callback) {
            $http.post('/Admin/EDMSRepository/JtableFileWithRepository', data).then(callback);
        },
        getUsers: function (callback) {
            $http.post('/Admin/EDMSRepository/GetUsers').then(callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },
        getSupportCategory: function (data, callback) {
            $http.post('/Admin/EDMSRepository/GetSupportCategory?CatCode=' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
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
        $rootScope.validationOptionsCategory = {
            rules: {
                CatCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/,
                },
                CatName: {
                    required: true
                }
            },
            messages: {
                CatCode: {
                    required: caption.EDMSR_VALIDATE_RQ_CODE_CATE,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.EDMSR_CURD_LBL_CATEGORY_CODE),
                },
                CatName: {
                    required: caption.EDMSR_VALIDATE_RQ_CAT_NAME
                }
            }
        }
        $rootScope.validationOptionsRepository = {
            rules: {
                ReposName: {
                    required: true
                },
                Server: {
                    required: true
                },
                Account: {
                    required: true
                },
                PassWord: {
                    required: true
                }
            },
            messages: {
                ReposName: {
                    required: caption.EDMSR_VALIDATE_NAME_SERVER
                },
                Server: {
                    required: caption.EDMSR_VALIDATE_SERVER
                },
                Account: {
                    required: caption.EDMSR_VALIDATE_USER
                },
                PassWord: {
                    required: caption.EDMSR_VALIDATE_PASS
                }
            }
        }
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            //var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            //var partternNumber = /^\d+$/;
            //var partternPremiumTerm = /^\d+(\+)?/
            //var partternFloat = /^-?\d*(\.\d+)?$/;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ReposCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.EDMSR_VALIDATE_REPOS_CODE, "<br/>");
            }
            return mess;
        }
    });
    $scope.FileType = [{
        Code: 1,
        Name: 'Ảnh',
    }, {
        Code: 2,
        Name: 'Word'
    }, {
        Code: 3,
        Name: 'Excel'
    }, {
        Code: 4,
        Name: 'Powerpoint'
    }, {
        Code: 5,
        Name: 'Pdf'
    }, {
        Code: 6,
        Name: 'Tệp tin'
    }]
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/EDMSRepository/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    //.when('/pdfViewer', {
    //    templateUrl: ctxfolder + '/pdfViewer.html',
    //    controller: 'pdfViewer'
    //});
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window) {
    var vm = $scope;
    //$scope.objects = [];
    //$scope.objectDetails = [];
    //$scope.users = [];
    $scope.model = {
        ObjectType: 'All',
        ObjectCode: '',
        FromDate: '',
        ToDate: '',
        Name: '',
        FileType: '',
        Content: '',
        Tags: '',
        ListRepository: [],
        UserUpload: ''
        //ObjectDetailCode: '',
    };
    $scope.recentFile = false;
    $scope.currentPath = "";
    $scope.totalFile = 0;
    $scope.totalCapacity = "0M";
    $scope.isSearchContent = false;
    $scope.content = "";
    $scope.treeData = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JTableFile",
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
                d.ObjectType = $scope.model.ObjectType;
                d.ObjectCode = $scope.model.ObjectCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Name = $scope.model.Name;
                d.FileType = $scope.model.FileType;
                d.Content = $scope.model.Content;
                d.Tags = $scope.model.Tags;
                d.UserUpload = $scope.model.UserUpload;
                //d.TypeTab = type;
                d.ListRepository = $scope.model.ListRepository;
                d.RecentFile = $scope.recentFile;
                //d.ObjectType = $scope.model.ObjectType;
                //d.ContractCode = null;
                //d.CustomerCode = null;
                //d.SupplierCode = null;
                //d.ProjectCode = null;
                //if ($scope.model.ObjectCode == "FILE_OBJ_CONTRACT")
                //    d.ContractCode = $scope.model.ObjectDetailCode;
                //if ($scope.model.ObjectCode == "FILE_OBJ_CUSTOMMER")
                //    d.CustomerCode = $scope.model.ObjectDetailCode;
                //if ($scope.model.ObjectCode == "FILE_OBJ_SUPPLIER")
                //    d.SupplierCode = $scope.model.ObjectDetailCode;
                //if ($scope.model.ObjectCode == "FILE_OBJ_PROJECT")
                //    d.ProjectCode = $scope.model.ObjectDetailCode;
                if ($scope.model.Content != null && $scope.model.Content != "") {
                    $scope.isSearchContent = true;
                }
                else
                    $scope.isSearchContent = false;
                $scope.content = $scope.model.Content;
            },
            complete: function (json) {
                App.unblockUI("#contentMain");
                heightTableManual(613, "#tblData");
                var listdata = $('#tblData').DataTable().data();
                if (listdata.length > 0) {
                    var item = listdata[0];
                    var capacity = item.FileSize;
                    var kb = 1024;
                    var mb = 1024 * kb;
                    var gb = 1024 * mb;
                    var dt = capacity / gb;
                    if (capacity / gb > 1) {
                        $scope.totalCapacity = Math.floor(capacity / gb) + " GB";
                    }
                    else if (capacity / mb > 1) {
                        $scope.totalCapacity = Math.floor(capacity / mb) + " MB";
                    }
                    else if (capacity / kb > 1) {
                        $scope.totalCapacity = Math.floor(capacity / kb) + " KB";
                    }
                    else {
                        $scope.totalCapacity = capacity + " Byte";
                    }


                }
                else
                    $scope.totalCapacity = "0 byte";

                var files = [];
                for (var indx = 0; indx < listdata.length; ++indx) {
                    var item = listdata[indx];
                    console.log(item.Url);
                    var file = document.getElementById('id-' + item.FileID);
                    file.downloadUrl = item.Url;
                    file.downloadName = item.FileName;
                    file.downloadMimeType = item.MimeType;
                    file.addEventListener("dragstart", function (evt) {
                        //console.log('application/ pdf:HTML5CheatSheet.pdf:https://facco.s-work.vn/' + this.downloadUrl + '');
                        var url = window.location.origin + "/" + window.encodeURIComponent(this.downloadUrl);
                        evt.dataTransfer.setData("DownloadURL", this.downloadMimeType + ':' + this.downloadName + ':' + url);
                        console.log(this.downloadMimeType + ':' + this.downloadName + ':' + url);
                        //var a = document.createElement("a");
                        //a.href = this.downloadUrl;
                        //a.setAttribute("download", this.downloadName);
                        //a.click();
                        //return false;
                    }, false);
                    files.push(file);
                }
                $scope.totalFile = json.responseJSON.recordsTotal;
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(11)
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
            $compile(angular.element(row)
                .attr('context-menu', 'contextMenu')
                .attr('id', 'id-' + data.FileID)
                .attr('draggable', true)
                .attr('data-downloadurl', 'application/pdf:HTML5CheatSheet.pdf:http://www.thecssninja.com/demo/gmail_dragout/html5-cheat-sheet.pdf')
            )(contextScope);
            console.log('createdRow');
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle('{{"EDMSR_LIST_COL_FILE_NAME" |translate}}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>';
        }
        var downloadSearch = "/ &nbsp;<a ng-click='downloadSearch(" + full.Id + ")'> Search_" + data + "</a>\n";

        var updateTime = '';
        var fileSize = 0;
        if (full.SizeOfFile != null) {
            fileSize = (full.SizeOfFile / 1024000).toFixed(0);
            fileSize = '<div><span class="badge-customer badge-customer-success">' + fileSize + ' MB</span></div>';
        }

        if (full.UpdateTime != "" && full.UpdateTime != null && full.UpdateTime != undefined) {
            updateTime = '<div><span class="badge-customer badge-customer-black">' + full.UpdateTime + '</span></div>'
        }
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) != -1 || word.indexOf(full.FileTypePhysic.toUpperCase()) != -1
            || pdf.indexOf(full.FileTypePhysic.toUpperCase()) != -1 || powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'excel';
                var file = '<a ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isSearchContent)
                        file = file + downloadSearch;
                    var content = "<div>" + full.Content + "</div>";
                    return file + content + updateTime + fileSize;
                } else {
                    return '<a ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize;
                }
            } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'Syncfusion';
                var file = '<a ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isSearchContent)
                        file = file + downloadSearch;
                    var content = "<div>" + full.Content + "</div>";
                    return file + content + updateTime + fileSize;
                } else {
                    return '<a ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize;
                }
            } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'pdf';
                var file = '<a ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isSearchContent)
                        file = file + downloadSearch;
                    var content = "<div>" + full.Content + "</div>";
                    return file + content + updateTime;
                } else {
                    return '<a ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>' + updateTime + fileSize;
                }
            } else {
                return '<a ng-click="getObjectFile(0)">' + data + '</a>' + updateTime + fileSize;
            }
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                if ($scope.isSearchContent)
                    file = file + downloadSearch;
                var content = "<div>" + full.Content + "</div>";

                return file + content + updateTime + fileSize;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize;
            }
        }
        else if (document.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                var content = "<div>" + full.Content + "</div>";
                return file + content + updateTime + fileSize;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize;
            }
        }
        else if (image.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                var content = "<div>" + full.Content + "</div>";
                return file + content + updateTime + fileSize;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize;
            }
        } else {
            return data + updateTime + fileSize;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withOption('sClass', '').withTitle('{{"EDMSR_LIST_COL_SERVER" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withOption('sClass', '').withTitle('{{"EDMSR_LBL_PATH" | translate}}').renderWith(function (data, type, full) {
        var currentPath = "";
        if (full.CloudFileId != null && full.CloudFileId != "") {
            currentPath = full.CatName;
        }
        else {
            currentPath = full.CatName;
        }
        return currentPath;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSR_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle('{{ "EDMSR_BTN_EDIT_FILE" | translate }}').renderWith(function (data, type, full) {
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
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewExcel(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewWord(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewPDF(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle('{{"EDMSR_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        console.log('createdRow ***');
        return '<a ng-click="dowload(' + full.Id + ')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>' +
            '<button title="Xoá" ng-click="deleteFile(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.fileManage = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/fileManage.html',
            controller: 'fileManage',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.recentFileLoad = function () {
        $scope.recentFile = true;
        $scope.reload();
    }

    $scope.addFile = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addFile.html',
            controller: 'addFile',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {

                    return $scope.model.ListRepository;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.deleteFile = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.EDMSR_MSG_DELETE_FILE;
                $scope.ok = function () {
                    dataservice.deleteFile(id, function (rs) {
                        rs = rs.data;
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
    $scope.viewFile = function (id) {

        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].FileID == id) {
                userModel = listdata[i];
                break;
            }
        }
        var url = window.encodeURIComponent(userModel.Url);
        console.log(window.location.origin + '' + url);
        //window.open(url);
        window.open('https://docs.google.com/gview?url=' + window.location.origin + '' + url + ' & embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolder + '/imageViewer.html',
                controller: 'imageViewerFile',
                backdrop: 'static',
                size: '40',
                resolve: {
                    para: function () {
                        return myBase64;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () {
            });
        });
    }
    $scope.view_old = function (id) {
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.SizeOfFile < 20971520) {
            if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
                isImage = true;
                $scope.openViewer(rs.Object, isImage);
            }
            var dt = null;
            for (var i = 0; i < $scope.treeData.length; ++i) {
                var item = $scope.treeData[i];
                if (item.id == userModel.Category) {
                    dt = item;
                    break;
                }
            }
            if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
                if (dt != null)
                    $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
                else
                    $scope.currentPath = "Google Driver/" + userModel.FileName;
                //SHOW LÊN MÀN HÌNH LUÔN
                // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
                //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
                dataservice.createTempFile(id, $scope.isSearchContent, $scope.content, function (rs) {
                    rs = rs.data;
                    rs.Object = encodeURI(rs.Object);
                    if (rs.Error == false) {
                        if (isImage == false)
                            $scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                        else
                            $scope.openViewer(rs.Object, isImage);
                        //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                    }
                    else {

                    }
                });
            }
            else {
                if (dt != null)
                    $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
                else
                    $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
                dataservice.createTempFile(id, $scope.isSearchContent, $scope.content, function (rs) {
                    rs = rs.data;
                    rs.Object = encodeURI(rs.Object);
                    if (rs.Error == false) {
                        if (isImage == false)
                            $scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                        else
                            $scope.openViewer(rs.Object, isImage);
                        //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                    }
                    else {

                    }
                });
            }
        } else {
            App.toastrError(caption.EDMSR_MSG_FILE_SIZE_LIMIT_EDIT);
        }

    }
    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/viewer.html',
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
    $scope.addCategory = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addCategory.html',
            controller: 'addCategory',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $('#treeDiv').jstree(true).refresh();
            setTimeout(function () {
                $scope.readyCB();
            }, 200);
        }, function () {
        });
    }
    $scope.editCategory = function () {
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length == 0) {
            App.toastrError(caption.EDMSR_MSG_SELECT_CATEGORIES);
        } else if (listNoteSelect.length > 1) {
            App.toastrError(caption.EDMSR_MSG_SELECT_A_REPOSITORY);
        } else {
            dataservice.getItemCategory(listNoteSelect[0].original.catId, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/editCategory.html',
                        controller: 'editCategory',
                        backdrop: 'static',
                        size: '70',
                        resolve: {
                            para: function () {
                                return rs.Object;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                        $('#treeDiv').jstree(true).refresh();
                        setTimeout(function () {
                            $scope.readyCB();
                        }, 200);
                    }, function () {
                    });
                }
            })
        }
    }
    $scope.deleteCategory = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        for (var i = 0; i < listNoteSelect.length; i++) {
            listSelect.push(listNoteSelect[i].id);
        }
        if (listSelect.length == 0) {
            App.toastrError(caption.EDMSR_MSG_SELECT_CATEGORIES);
        } else if (listSelect.length > 1) {
            App.toastrError(caption.EDMSR_MSG_SELECT_A_CATEGORIES);
        } else {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                resolve: {
                    para: function () {
                        return listSelect[0];
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.EDMSR_MSG_DELETE_CATEGORIES;
                    $scope.ok = function () {
                        dataservice.deleteCategory(para, function (rs) {
                            rs = rs.data;
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
                $('#treeDiv').jstree(true).refresh();
                setTimeout(function () {
                    $scope.readyCB();
                    $scope.reload();
                }, 200);
            }, function () {
            });
        }
    }

    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataservice.getItemFile(id, true, function (rs) {
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
        var listdata = $('#tblData').DataTable().data();
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
                dataservice.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.EDMSR_MSG_FILE_SIZE_LIMIT_EDIT);
            }

        }
    };
    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
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
                dataservice.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.EDMSR_MSG_FILE_SIZE_LIMIT_EDIT);
            }
        }
    };
    $scope.viewPDF = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
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
                dataservice.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.EDMSR_MSG_FILE_SIZE_LIMIT_EDIT);
            }
        }
    };
    $scope.view = function (id) {

        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        var dt = null;
        for (var i = 0; i < $scope.treeData.length; ++i) {
            var item = $scope.treeData[i];
            if (item.id == userModel.Category) {
                dt = item;
                break;
            }
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            if (dt != null)
                $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            else
                $scope.currentPath = "Google Driver/" + userModel.FileName;
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataservice.createTempFile(id, $scope.isSearchContent, $scope.content, function (rs) {
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
            if (dt != null)
                $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
            else
                $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
            dataservice.createTempFile(id, $scope.isSearchContent, $scope.content, function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {

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
            templateUrl: ctxfolder + '/viewer.html',
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

    //treeview
    var nodeBefore = "";
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getTreeCategory(function (result) {
            result = result.data;
            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: caption.EDMSR_LBL_ALL_CATEGORY,//"Tất cả kho dữ liệu"
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeData.push(root);
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
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
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
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }
    $scope.selectNodeRepository = function (e, data) {
        debugger
        var listSelect = [];
        var idCurrentNode = data.node.id;
        if (nodeBefore != idCurrentNode) {
            $("#" + nodeBefore + "_anchor").removeClass('bold');

            nodeBefore = idCurrentNode;
            $scope.recentFile = false;
            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].id);
            }
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }
        else {
            $scope.recentFile = false;
            listSelect = [];
            $("#" + idCurrentNode + "_anchor").addClass('bold');
            listSelect.push(idCurrentNode);
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }
    }
    $scope.deselectNodeRepository = function (e, data) {
        $scope.recentFile = false;
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length > 0) {
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].id);
                dataservice.getTreeInNode(listNoteSelect[i].id, function (rs) {
                    rs = rs.data;
                    if (rs.length > 0) {
                        for (var i = 0; i < rs.length; i++) {
                            listSelect.push(rs[i].Code);
                        }
                    }
                    $scope.model.ListRepository = listSelect;
                    $scope.reload();
                })
            }
        } else {
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }


    }

    $scope.treeConfig = {
        core: {
            multiple: true,
            animation: true,
            error: function (error) {
                //$log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
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
        plugins: ['checkbox', 'types', 'contextmenu'],
        checkbox: {
            "three_state": true,
            "whole_node": false,
            "keep_selected_style": false,
            "cascade": "undetermined",
        },
        contextmenu: {
            items: customMenu
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'deselect_node': $scope.deselectNodeRepository,
    }
    $scope.ac = function () {
        return true;
    }

    function customMenu(node) {
        var items = {
            'item1': {
                'label': caption.COM_BTN_EDIT,
                'icon': "fa fa-edit",
                'action': function (data) {
                    dataservice.getItemCategory(node.original.catId, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolder + '/editCategory.html',
                                controller: 'editCategory',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return rs.Object;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                                $('#treeDiv').jstree(true).refresh();
                                setTimeout(function () {
                                    $scope.readyCB();
                                }, 200);
                            }, function () {
                            });
                        }
                    })
                }
            }
        }
        return items;
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.init = function () {
        dataservice.getObjectsType(function (rs) {
            rs = rs.data;
            $scope.objects = rs;
        });
        reloadObject('');
        dataservice.getUsers(function (rs) {
            rs = rs.data;
            $scope.users = rs;
            var all = {
                UserName: '',
                Name: caption.EDMSR_LBL_ALL
            }
            $scope.users.unshift(all)
        });
    }
    $scope.init();
    $scope.selectObjectType = function (objectType) {
        //$scope.objectDetails = [];
        //$scope.model.ObjectDetailCode = null;

        //if ($scope.model.ObjectCode == "FILE_OBJ_CONTRACT") {
        //    dataservice.getAllContract(function (rs) {rs=rs.data;
        //        $scope.objectDetails = rs.Object;
        //    });
        //}
        //if ($scope.model.ObjectCode == "FILE_OBJ_CUSTOMMER") {
        //    dataservice.getAllCustomer(function (rs) {rs=rs.data;
        //        $scope.objectDetails = rs.Object;
        //    });
        //}
        //if ($scope.model.ObjectCode == "FILE_OBJ_PROJECT") {
        //    dataservice.getAllProject(function (rs) {rs=rs.data;
        //        $scope.objectDetails = rs.Object;
        //    });

        //}
        //if ($scope.model.ObjectCode == "FILE_OBJ_SUPPLIER") {
        //    dataservice.getAllSupplier(function (rs) {rs=rs.data;
        //        $scope.objectDetails = rs.Object;
        //    });
        //}
        reloadObject(objectType);
        reloadData(true);
    }
    $scope.selectObjectCode = function (item) {
        $scope.model.ObjectType = item.ObjectType;
        reloadData(true);
    }
    $scope.resetObjectType = function () {
        reloadObject('');
        reloadData(true);
    }
    $scope.downloadSearch = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var dt = null;
        for (var i = 0; i < $scope.treeData.length; ++i) {
            var item = $scope.treeData[i];
            if (item.id == userModel.Category) {
                dt = item;
                break;
            }
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            if (dt != null)
                $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            else
                $scope.currentPath = "Google Driver/" + userModel.FileName;
        }
        else {

            if (dt != null)
                $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
            else
                $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
        }
        location.href = "/Admin/EDMSRepository/DownloadSearch?"
            + "Id=" + id + "&content=" + $scope.content;
    }
    $scope.dowload = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var dt = null;
        for (var i = 0; i < $scope.treeData.length; ++i) {
            var item = $scope.treeData[i];
            if (item.id == userModel.Category) {
                dt = item;
                break;
            }
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            if (dt != null)
                $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            else
                $scope.currentPath = "Google Driver/" + userModel.FileName;
        }
        else {

            if (dt != null)
                $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
            else
                $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
        }
        location.href = "/Admin/EDMSRepository/Download?"
            + "Id=" + id;
    }
    $scope.tabFileHistory = function (fileId) {
        if (fileId === 0) {
            App.toastrError(caption.COM_MSG_FILE_NOT_HISTORY);
            return null;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/tabFileHistory.html',
            controller: 'tabFileHistory',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return fileId;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () { });
    };

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
    function handlerFunction(event) {
        if (event != null) {
            event.preventDefault();
        }
        event.dataTransfer.effectAllowed = 'copy';
        console.log(event);
    }
    function handlerFunction1(event) {
        if (event != null) {
            event.preventDefault();
        }
        var file = event.dataTransfer.files;
        if ($scope.model.ListRepository.length == 0) {
            App.toastrError(caption.EDMSR_MSG_PLS_SELECT_CATE_ADD_FILE);
        }
        else if ($scope.model.ListRepository.length > 1) {
            App.toastrError(caption.EDMSR_MSG_PLS_ONLY_CATE_ADD_FILE);
        }
        else {
            dataservice.getSupportCategory($scope.model.ListRepository[0], function (rs) {
                rs = rs.data;
                if (rs.Error == true) {
                    App.toastrError(rs.Title);
                }
                else {
                    if (rs.Object != null) {
                        var obj = rs.Object;
                        for (var i = 0; i < file.length; ++i) {
                            var data = {};
                            data.CateRepoSettingId = obj.Id;
                            data.FileUpload = file[i];
                            data.FileName = file[i].name;
                            dataservice.insertFile(data, function (result) {
                                result = result.data;
                                if (result.Error) {
                                    App.toastrError(result.Title);
                                } else {
                                    App.toastrSuccess(result.Title);
                                    $scope.reload();
                                }
                            });
                        }
                    }
                    else {
                        App.toastrError(caption.EDMSR_MSG_NO_SUGGESST_FORDER);
                    }
                }
            });
        }

    }
    function reloadObject(objectType) {
        dataservice.getListObject(objectType, function (rs) {
            rs = rs.data;
            $scope.listObjects = rs;
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
        //showHideSearch();
        loadDate();
        let dropArea = document.getElementById('dropzone1')
        dropArea.addEventListener('dragover', handlerFunction, false)
        dropArea.addEventListener('dragenter', handlerFunction, false)
        dropArea.addEventListener('drop', handlerFunction1, false)
    }, 200);
});
//file
app.controller('addFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('{{"EDMSR_LIST_COL_FOLDER_SAVE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
                App.toastrError(caption.EDMSR_MSG_CHOOSE_DOC_SAVE);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.EDMSR_MSG_PLS_SELECT_A_FORDER);
                return;
            }

            if (($scope.file.size / 1048576) < 1000) {
                var data = {};
                data.CateRepoSettingId = itemSelect.length !== 0 ? itemSelect[0] : "";
                data.FileUpload = $scope.file;
                data.FileName = $scope.file.name;
                data.Desc = $scope.model.Desc;
                data.Tags = $scope.model.Tags;
                data.NumberDocument = $scope.model.NumberDocument;
                dataservice.insertFile(data, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            } else {
                App.toastrError(caption.EDMSR_MSG_FILE_SIZE_LIMIT_UPLOAD);
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
            dataservice.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.EDMSR_LBL_ALL_CATEGORY,//"Tất cả kho dữ liệu"
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
app.controller('imageViewerFile', function ($scope, $rootScope, $compile, $uibModal, dataservice, $filter, $uibModalInstance, para) {
    $scope.Image = para;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('fileViewer', function ($scope, $rootScope, $compile, $uibModal, dataservice, $filter, $uibModalInstance, para) {
    $scope.url = para;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});
app.controller('fileManage', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.breadcrumb = [];
    $scope.treeDataRepository = [];
    $scope.repository = {
        TypeRepos: '',
        ReposCode: '',
        Folder: '',
        ParentId: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFileWithRepository",
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
                d.ReposCode = $scope.repository.ReposCode;
                d.Folder = $scope.repository.Folder;
                d.ParentId = $scope.repository.ParentId;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "200px")
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    if (data.IsDirectory == 'True') {
                        $scope.breadcrumb.push({ Id: data.Id, Path: data.FileName, Name: data.FileName });
                        $scope.$apply();
                        //(2:Server, 1:Google driver)
                        if ($scope.repository.TypeRepos == 'SERVER') {
                            var folder = '';
                            for (var i = 0; i < $scope.breadcrumb.length; i++) {
                                if ($scope.breadcrumb[i].Path != '') {
                                    folder += "/" + $scope.breadcrumb[i].Path;
                                }
                            }
                            $scope.repository.Folder = folder;
                        } else if ($scope.repository.TypeRepos == 'DRIVER') {
                            $scope.repository.ParentId = data.Id;
                        }
                        $scope.reload();
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle($translate('EDMSR_LIST_COL_FILE_NAME')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        var dataSubstr = data.length > 35 ? data.substr(0, 35) + " ..." : data;
        if (full.IsDirectory == 'True') {
            return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + dataSubstr;
        } else {
            if ($scope.repository.TypeRepos == 'SERVER') {
                var idxDot = data.lastIndexOf(".") + 1;
                var extFile = data.substr(idxDot, data.length).toLowerCase();
                var excel = ['XLSM', 'XLSX', 'XLS'];
                var document = ['TXT'];
                var word = ['DOCX', 'DOC'];
                var pdf = ['PDF'];
                var powerPoint = ['PPS', 'PPTX', 'PPT'];
                var image = ['JPG', 'PNG', 'TIF', 'TIFF'];
                if (excel.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (word.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (document.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (pdf.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (powerPoint.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (image.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                }
            } else {
                var txtMimetypes = ["text/plain"];
                var wordMimetypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/vnd.google-apps.document"];
                var excelMimetypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.google-apps.spreadsheet"];
                var pdfMimetypes = ["application/pdf"];
                var powerPointMimetypes = ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
                var imageMimetypes = ["image/jpeg", "image/tiff", "image/ief", "image/png", "image/svg+xml", "image/webp", "image/vnd.microsoft.icon", "image/bmp"];
                if (excelMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (wordMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (txtMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (pdfMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (powerPointMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (imageMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                }
            }
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileSize').withTitle($translate('EDMSR_LIST_COL_SIZE')).withOption('sClass', 'nowrap dataTable-100').renderWith(function (data, type, full) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (data == '') {
            return '';
        } else if (data == 0) {
            return '0 Byte';
        } else {
            var i = parseInt(Math.floor(Math.log(data) / Math.log(1024)));
            return Math.round(data / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LastModifiedDate').withTitle($translate('EDMSR_LIST_COL_MODIFIED_DATE')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm') : null;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.addRepository = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addRepository.html',
            controller: 'addRepository',
            backdrop: 'static',
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $('#treeDivFileManage').jstree(true).refresh();
            setTimeout(function () {
                $scope.readyCB();
            }, 200);
        }, function () {
        });
    }
    $scope.editRepository = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        for (var i = 0; i < listNoteSelect.length; i++) {
            listSelect.push(listNoteSelect[i].id);
        }
        if (listSelect.length == 0) {
            App.toastrError(caption.EDMSR_MSG_PLS_SELECT_SERVER);
        } else if (listSelect.length > 1) {
            App.toastrError(caption.EDMSR_MSG_SELECT_A_SERVER);
        } else {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/editRepository.html',
                controller: 'editRepository',
                backdrop: 'static',
                size: '35',
                resolve: {
                    para: function () {
                        return listSelect[0];
                    }
                },
            });
            modalInstance.result.then(function (d) {
                $('#treeDivFileManage').jstree(true).refresh();
                setTimeout(function () {
                    $scope.readyCB();
                }, 200);
            }, function () {
            });
        }
    }
    $scope.deleteRepository = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        for (var i = 0; i < listNoteSelect.length; i++) {
            listSelect.push(listNoteSelect[i].id);
        }
        if (listSelect.length == 0) {
            App.toastrError(caption.EDMSR_MSG_PLS_SELECT_SERVER);
        } else if (listSelect.length > 1) {
            App.toastrError(caption.EDMSR_MSG_SELECT_A_SERVER);
        } else {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                resolve: {
                    para: function () {
                        return listSelect[0];
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.EDMSR_MSG_SURE_DEL_SERVER;
                    $scope.ok = function () {
                        dataservice.deleteRepository(para, function (rs) {
                            rs = rs.data;
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
                size: '20',
            });
            modalInstance.result.then(function (d) {
                $('#treeDivFileManage').jstree(true).refresh();
                setTimeout(function () {
                    $scope.readyCB();
                    $scope.reload();
                }, 200);
            }, function () {
            });
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getTreeRepository(function (result) {
            result = result.data;
            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: "Danh sách",
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeDataRepository.push(root);
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
                            resId: result[i].Id,
                            resCode: result[i].Code,
                            resName: result[i].Title,
                            resParent: result[i].ParentCode,
                            typeRepos: result[i].TypeRepos,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeDataRepository.push(data);
                    } else {
                        var data = {
                            id: result[i].Code,
                            parent: result[i].ParentCode,
                            text: result[i].Code + ' - ' + result[i].Title,
                            resId: result[i].Id,
                            resCode: result[i].Code,
                            resName: result[i].Title,
                            resParent: result[i].ParentCode,
                            typeRepos: result[i].TypeRepos,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeDataRepository.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }
    $scope.selectNodeFileManage = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        listSelect.push(listNoteSelect[0].id);
        $scope.breadcrumb = [];
        $scope.breadcrumb.push({ Id: "", Path: "", Name: listNoteSelect[0].original.resName });
        $scope.repository.ReposCode = listNoteSelect[0].original.resCode;
        $scope.repository.TypeRepos = listNoteSelect[0].original.typeRepos;
        $scope.repository.Folder = "";
        $scope.repository.ParentId = "";
        $scope.reload();
    }
    $scope.deselectNodeRepository = function () {
        $scope.breadcrumb = [];
        $scope.repository.ReposCode = '';
        $scope.repository.TypeRepos = '';
        $scope.repository.Folder = "";
        $scope.repository.ParentId = "";
        $scope.reload();
    }
    $scope.selectBreadcrumbRepository = function (index, listBreadcrumb) {
        var folder = '';
        for (var i = 0; i < listBreadcrumb.length; i++) {
            if (i == index) {
                folder += "/" + $scope.breadcrumb[i].Path;
                $scope.repository.ParentId = listBreadcrumb[i].Id;

            } else if (i > index) {
                listBreadcrumb.splice(i, 1);
                i--;
            } else if (i < index) {
                folder += "/" + $scope.breadcrumb[i].Path;
            }
        }
        $scope.repository.Folder = folder;
        $scope.reload();
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
                icon: 'fas fa-store',
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'search'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeFileManage,
        'deselect_node': $scope.deselectNodeRepository,
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('tabFileHistory', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    };
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JTableFileHistory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FileId = para;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
        });
    //end option table
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractFileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', 'w75').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_NAME" | translate}}').renderWith(function (data, type, full) {
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

        if (full.IsFileMaster == "False") {
            data = '<span class="text-warning">' + data + '<span>';
        } else {
            data = '<span class="text-primary">' + data + '<span>';
        }

        return icon + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_DESCRIPTION" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EditedFileTime').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_EDITED_TIME" | translate}}').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'HH:mm dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EditedFileBy').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_EDITED_BY" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"CONTRACT_CURD_TAB_FILE_COL_ACTION" | translate}}').withOption('sClass', 'w75 nowrap text-center').renderWith(function (data, type, full) {
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
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
        }

        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(' + full.Id + ')" target="_blank" href=' + typefile + ' title="{{&quot; Xem &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-eye pt5"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')"  style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>';
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
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolder + '/contractTabFileSearch.html',
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
            data.append("RequestCode", $rootScope.RequestCode);
            data.append("IsMore", false);
            dataservice.insertContractFile(data, function (result) {
                result = result.data;
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
        dataservice.getContractFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/tabFileEdit.html',
                    controller: 'tabFileEdit',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '55',
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
                    dataservice.deleteContractFile(id, function (result) {
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
            $scope.reload();
        }, function () {
        });
    }
    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'tabFileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataservice.getByteFile(id, function (rs) {rs=rs.data;
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
        dataservice.getSuggestionsContractFile($rootScope.RequestCode, function (rs) {
            rs = rs.data;
            var data = rs != '' ? rs : {};
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolder + '/tabFileAdd.html',
                controller: 'tabFileAdd',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '55',
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
        dataservice.getItemFile(id, false, 0);
    };

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
    setTimeout(function () {
        loadDate();
    }, 200);
});

//category
app.controller('addCategory', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.breadcrumb = [];
    $scope.treeDataRepository = [];
    $scope.model = {
        CatCode: '',
        CatName: '',
        CatParent: '',
        ListRepository: []
    };
    $scope.repository = {
        TypeRepos: '',
        ReposCode: '',
        Folder: '',
        ParentId: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderWithRepository",
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
                d.ReposCode = $scope.repository.ReposCode;
                d.Folder = $scope.repository.Folder;
                d.ParentId = $scope.repository.ParentId;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "50vh")
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    if (data.IsDirectory == 'True') {
                        $scope.breadcrumb.push({ Id: data.Id, Path: data.FileName, Name: data.FileName });
                        $scope.$apply();
                        //(2:Server, 1:Google driver)
                        if ($scope.repository.TypeRepos == 'SERVER') {
                            var folder = '';
                            for (var i = 0; i < $scope.breadcrumb.length; i++) {
                                if ($scope.breadcrumb[i].Path != '') {
                                    folder += "/" + $scope.breadcrumb[i].Path;
                                }
                            }
                            $scope.repository.Folder = folder;
                        } else if ($scope.repository.TypeRepos == 'DRIVER') {
                            $scope.repository.ParentId = data.Id;
                        }
                        $scope.reload();
                    }
                }
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    if (data.IsDirectory == 'True') {
                        var self = $(this).parent();
                        if ($(self).hasClass('selected')) {
                            $(self).removeClass('selected');
                            $scope.selected[data._STT] = false;
                        } else {
                            $(self).addClass('selected');
                            $scope.selected[data._STT] = true;
                        }
                    } else {
                        App.toastrError(caption.EDMSR_MSG_SELECT_FORDER)
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
            if (full.IsDirectory == 'True') {
                return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected,$event)"/><span></span></label>';
            }
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle($translate('EDMSR_LIST_COL_FILE_NAME')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        var dataSubstr = data.length > 35 ? data.substr(0, 35) + " ..." : data;
        if (full.IsDirectory == 'True') {
            return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + dataSubstr;
        } else {
            if ($scope.repository.TypeRepos == 'SERVER') {
                var idxDot = data.lastIndexOf(".") + 1;
                var extFile = data.substr(idxDot, data.length).toLowerCase();
                var excel = ['XLSM', 'XLSX', 'XLS'];
                var document = ['TXT'];
                var word = ['DOCX', 'DOC'];
                var pdf = ['PDF'];
                var powerPoint = ['PPS', 'PPTX', 'PPT'];
                var image = ['JPG', 'PNG', 'TIF', 'TIFF'];
                if (excel.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (word.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (document.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (pdf.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (powerPoint.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (image.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                }
            } else {
                var txtMimetypes = ["text/plain"];
                var wordMimetypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/vnd.google-apps.document"];
                var excelMimetypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.google-apps.spreadsheet"];
                var pdfMimetypes = ["application/pdf"];
                var powerPointMimetypes = ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
                var imageMimetypes = ["image/jpeg", "image/tiff", "image/ief", "image/png", "image/svg+xml", "image/webp", "image/vnd.microsoft.icon", "image/bmp"];
                if (excelMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (wordMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (txtMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (pdfMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (powerPointMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (imageMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                }
            }
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileSize').withTitle($translate('EDMSR_LIST_COL_SIZE')).withOption('sClass', 'nowrap dataTable-100').renderWith(function (data, type, full) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (data == '') {
            return '';
        } else if (data == 0) {
            return '0 Byte';
        } else {
            var i = parseInt(Math.floor(Math.log(data) / Math.log(1024)));
            return Math.round(data / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LastModifiedDate').withTitle($translate('EDMSR_LIST_COL_MODIFIED_DATE')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm') : null;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.init = function () {
        dataservice.getParentCategory({ IdI: null }, function (rs) {
            rs = rs.data;
            $scope.treeDataCategory = rs;
        });
    }
    $scope.init();
    $scope.submit = function () {
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length == 0) {
            App.toastrError(caption.EDMSR_MSG_PLS_SELECT_SERVER);
        } else {
            if ($scope.addformCategory.validate()) {
                var listRepository = [];
                var listdata = $('#tblDataDetailRepository').DataTable().data();
                var checkSelect = $scope.selected.find(function (element) {
                    if (element == true) return true;
                });
                if (checkSelect) {
                    for (var j = 1; j < $scope.selected.length; j++) {
                        if ($scope.selected[j] == true) {
                            var obj = {
                                Path: $scope.repository.Folder + "/" + listdata[j - 1].FileName,
                                FolderId: listdata[j - 1].Id,
                                FolderName: listdata[j - 1].FileName
                            }
                            listRepository.push(obj);
                        }
                    }
                    var obj = {
                        Category: $scope.model,
                        ReposCode: listNoteSelect[0].original.resCode,
                        TypeRepos: $scope.repository.TypeRepos,
                        ListRepository: listRepository
                    }
                    dataservice.insertCategory(obj, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                } else {
                    App.toastrError(caption.EDMSR_MSG_SELECT_FORDER_ABSO)
                }
            }
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getTreeRepository(function (result) {
            result = result.data;
            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: "Danh sách",
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeDataRepository.push(root);
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
                            resId: result[i].Id,
                            resCode: result[i].Code,
                            resName: result[i].Title,
                            resParent: result[i].ParentCode,
                            typeRepos: result[i].TypeRepos,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeDataRepository.push(data);
                    } else {
                        var data = {
                            id: result[i].Code,
                            parent: result[i].ParentCode,
                            text: result[i].Code + ' - ' + result[i].Title,
                            resId: result[i].Id,
                            resCode: result[i].Code,
                            resName: result[i].Title,
                            resParent: result[i].ParentCode,
                            typeRepos: result[i].TypeRepos,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeDataRepository.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }
    $scope.selectNodeFileManage = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        listSelect.push(listNoteSelect[0].id);
        $scope.breadcrumb = [];
        $scope.breadcrumb.push({ Id: "", Path: "", Name: listNoteSelect[0].original.resName });
        $scope.repository.ReposCode = listNoteSelect[0].original.resCode;
        $scope.repository.TypeRepos = listNoteSelect[0].original.typeRepos;
        $scope.repository.Folder = "";
        $scope.repository.ParentId = "";
        $scope.reload();
    }
    $scope.deselectNodeRepository = function () {
        $scope.breadcrumb = [];
        $scope.repository.ReposCode = '';
        $scope.repository.TypeRepos = '';
        $scope.repository.Folder = "";
        $scope.repository.ParentId = "";
        $scope.reload();
    }
    $scope.selectBreadcrumbRepository = function (index, listBreadcrumb) {
        var folder = '';
        for (var i = 0; i < listBreadcrumb.length; i++) {
            if (i == index) {
                folder += "/" + $scope.breadcrumb[i].Path;
                $scope.repository.ParentId = listBreadcrumb[i].Id;

            } else if (i > index) {
                listBreadcrumb.splice(i, 1);
                i--;
            } else if (i < index) {
                folder += "/" + $scope.breadcrumb[i].Path;
            }
        }
        $scope.repository.Folder = folder;
        $scope.reload();
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
                icon: 'fas fa-store',
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'search'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeFileManage,
        'deselect_node': $scope.deselectNodeRepository,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('editCategory', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, $filter, $translate, para) {
    var vm = $scope;
    $scope.breadcrumb = [];
    $scope.treeDataRepository = [];
    $scope.repository = {
        TypeRepos: '',
        ReposCode: para.ReposCode,
        Folder: '',
        ParentId: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderWithRepository",
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
                d.ReposCode = $scope.repository.ReposCode;
                d.Folder = $scope.repository.Folder;
                d.ParentId = $scope.repository.ParentId;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "50vh")
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
            var checkExist = para.ListRepository.find(function (element) {
                if (element.Path == $scope.repository.Folder.concat("/").concat(data.FileName)) return true;
            });
            if (checkExist) {
                angular.element(row).addClass('selected');
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    if (data.IsDirectory == 'True') {
                        $scope.breadcrumb.push({ Id: data.Id, Path: data.FileName, Name: data.FileName });
                        $scope.$apply();
                        //(2:Server, 1:Google driver)
                        if ($scope.repository.TypeRepos == 'SERVER') {
                            var folder = '';
                            for (var i = 0; i < $scope.breadcrumb.length; i++) {
                                if ($scope.breadcrumb[i].Path != '') {
                                    folder += "/" + $scope.breadcrumb[i].Path;
                                }
                            }
                            $scope.repository.Folder = folder;
                        } else if ($scope.repository.TypeRepos == 'DRIVER') {
                            $scope.repository.ParentId = data.Id;
                        }
                        $scope.reload();
                    }
                }
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    if (data.IsDirectory == 'True') {
                        var self = $(this).parent();
                        if ($(self).hasClass('selected')) {
                            $(self).removeClass('selected');
                            $scope.selected[data._STT] = false;
                        } else {
                            $(self).addClass('selected');
                            $scope.selected[data._STT] = true;
                        }
                    } else {
                        App.toastrError(caption.EDMSR_MSG_SELECT_FORDER)
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            var checkExist = para.ListRepository.find(function (element) {
                if (element.Path == $scope.repository.Folder.concat("/").concat(full.FileName)) return true;
            });
            if (checkExist) {
                $scope.selected[full._STT] = true;
            } else {
                $scope.selected[full._STT] = false;
            }
            if (full.IsDirectory == 'True') {
                return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected,$event)"/><span></span></label>';
            }
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle($translate('EDMSR_LIST_COL_FILE_NAME')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        var dataSubstr = data.length > 35 ? data.substr(0, 35) + " ..." : data;
        if (full.IsDirectory == 'True') {
            return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + dataSubstr;
        } else {
            if ($scope.repository.TypeRepos == 'SERVER') {
                var idxDot = data.lastIndexOf(".") + 1;
                var extFile = data.substr(idxDot, data.length).toLowerCase();
                var excel = ['XLSM', 'XLSX', 'XLS'];
                var document = ['TXT'];
                var word = ['DOCX', 'DOC'];
                var pdf = ['PDF'];
                var powerPoint = ['PPS', 'PPTX', 'PPT'];
                var image = ['JPG', 'PNG', 'TIF', 'TIFF'];
                if (excel.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (word.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (document.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (pdf.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (powerPoint.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (image.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                }
            } else {
                var txtMimetypes = ["text/plain"];
                var wordMimetypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/vnd.google-apps.document"];
                var excelMimetypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.google-apps.spreadsheet"];
                var pdfMimetypes = ["application/pdf"];
                var powerPointMimetypes = ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
                var imageMimetypes = ["image/jpeg", "image/tiff", "image/ief", "image/png", "image/svg+xml", "image/webp", "image/vnd.microsoft.icon", "image/bmp"];
                if (excelMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (wordMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (txtMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (pdfMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (powerPointMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (imageMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                }
            }
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileSize').withTitle($translate('EDMSR_LIST_COL_SIZE')).withOption('sClass', 'nowrap dataTable-100').renderWith(function (data, type, full) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (data == '') {
            return '';
        } else if (data == 0) {
            return '0 Byte';
        } else {
            var i = parseInt(Math.floor(Math.log(data) / Math.log(1024)));
            return Math.round(data / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LastModifiedDate').withTitle($translate('EDMSR_LIST_COL_MODIFIED_DATE')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm') : null;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.initLoad = function () {
        $scope.model = para.Category;
        $scope.repository.TypeRepos = para.TypeRepos;
        dataservice.getParentCategory({ IdI: [para.Category.Id] }, function (rs) {
            rs = rs.data;
            $scope.treeDataCategory = rs;
        });
    }
    $scope.initLoad();
    $scope.submit = function () {
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length == 0) {
            App.toastrError(caption.EDMSR_MSG_PLS_SELECT_SERVER);
        } else {
            if ($scope.editformCategory.validate()) {
                var listRepository = [];
                var listdata = $('#tblDataDetailRepository').DataTable().data();
                var checkSelect = $scope.selected.find(function (element) {
                    if (element == true) return true;
                });
                if (checkSelect) {
                    for (var j = 1; j < $scope.selected.length; j++) {
                        if ($scope.selected[j] == true) {
                            var obj = {
                                Path: $scope.repository.Folder + "/" + listdata[j - 1].FileName,
                                FolderId: listdata[j - 1].Id,
                                FolderName: listdata[j - 1].FileName
                            }
                            listRepository.push(obj);
                        }
                    }
                    var obj = {
                        Category: $scope.model,
                        ReposCode: listNoteSelect[0].original.resCode,
                        TypeRepos: $scope.repository.TypeRepos,
                        ListRepository: listRepository
                    }
                    dataservice.updateCategory(obj, function (rs) {
                        rs = rs.data;
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
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainFileManage",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getTreeRepository(function (result) {
            result = result.data;
            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: "Danh sách",
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeDataRepository.push(root);
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
                            resId: result[i].Id,
                            resCode: result[i].Code,
                            resName: result[i].Title,
                            resParent: result[i].ParentCode,
                            typeRepos: result[i].TypeRepos,
                            state: { selected: para.ReposCode == result[i].Code ? true : false, opened: true }
                        }
                        $scope.treeDataRepository.push(data);
                    } else {
                        var data = {
                            id: result[i].Code,
                            parent: result[i].ParentCode,
                            text: result[i].Code + ' - ' + result[i].Title,
                            resId: result[i].Id,
                            resCode: result[i].Code,
                            resName: result[i].Title,
                            resParent: result[i].ParentCode,
                            typeRepos: result[i].TypeRepos,
                            state: { selected: para.ReposCode == result[i].Code ? true : false, opened: true }
                        }
                        $scope.treeDataRepository.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }
    $scope.selectNodeFileManage = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        listSelect.push(listNoteSelect[0].id);
        $scope.breadcrumb = [];
        $scope.breadcrumb.push({ Id: "", Path: "", Name: listNoteSelect[0].original.resName });
        $scope.repository.ReposCode = listNoteSelect[0].original.resCode;
        $scope.repository.TypeRepos = listNoteSelect[0].original.typeRepos;
        $scope.repository.Folder = "";
        $scope.repository.ParentId = "";
        $scope.reload();;
    }
    $scope.deselectNodeRepository = function () {
        $scope.breadcrumb = [];
        $scope.repository.ReposCode = '';
        $scope.repository.TypeRepos = '';
        $scope.repository.Folder = "";
        $scope.repository.ParentId = "";
        $scope.reload();
    }
    $scope.selectBreadcrumbRepository = function (index, listBreadcrumb) {
        var folder = '';
        for (var i = 0; i < listBreadcrumb.length; i++) {
            if (i == index) {
                folder += "/" + $scope.breadcrumb[i].Path;
                $scope.repository.ParentId = listBreadcrumb[i].Id;

            } else if (i > index) {
                listBreadcrumb.splice(i, 1);
                i--;
            } else if (i < index) {
                folder += "/" + $scope.breadcrumb[i].Path;
            }
        }
        $scope.repository.Folder = folder;
        $scope.reload();
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
                icon: 'fas fa-store',
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'search'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeFileManage,
        'deselect_node': $scope.deselectNodeRepository,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

//repository
app.controller('addRepository', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter) {
    $scope.model = {
        ReposName: '',
        Server: '',
        Account: '',
        PassWord: '',
        Token: '',
        Desc: ''
    };
    $scope.init = function () {
        dataservice.getParentCategory({ IdI: null }, function (rs) {
            rs = rs.data;
            $scope.treeData = rs;
        });
    }
    $scope.init();
    $scope.submit = function () {
        if ($scope.addformRepository.validate()) {
            dataservice.insertRepository($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('editRepository', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, para) {
    $scope.init = function () {
        dataservice.getParentCategory({ IdI: null }, function (rs) {
            rs = rs.data;
            $scope.treeData = rs;
        });
        dataservice.getItemRepository(para, function (rs) {
            rs = rs.data;
            $scope.model = rs.Object;
            console.log($scope.model);
        });
    }
    $scope.init();
    $scope.submit = function () {
        if ($scope.editformRepository.validate()) {
            dataservice.updateRepository($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('viewer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, para, $sce) {

    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
    console.log($scope.currentProjectUrl);
    console.log(data);
});
