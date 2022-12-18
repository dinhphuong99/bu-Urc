var ctxfolderProject = "/views/admin/project";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderImpProduct = "/views/admin/sendRequestImportProduct";
var app = angular.module('App_ESEIM_PROJECT', ['App_ESEIM_CARD_JOB', 'App_ESEIM_CUSTOMER', 'App_ESEIM_SUPPLIER', 'App_ESEIM_ATTR_MANAGER', 'App_ESEIM_MATERIAL_PROD', "ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", "pascalprecht.translate", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngTagsInput', 'dynamicNumber', 'ui.tab.scroll']);
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

app.directive('customOnChangeProject', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeProject);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});
app.factory('dataserviceProject', function ($http) {
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
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        getTotalReceipt: function (fromTime, toTime, aetType, status, isplan, callback) {
            $http.post('/Admin/FundAccEntry/Total?fromDatePara=' + fromTime + "&&toDatePara=" + toTime + "&&aetType=" + aetType + "&&status=" + status + "&&isPlan=" + isplan).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getObjDependency: function (callback) {
            $http.post('/Admin/CardJob/GetObjDependency').then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/GetTreeData', data).then(callback);
        },
        getGetCatName: function (callback) {
            $http.post('/Admin/FundAccEntry/GetCatName').then(callback);
        },
        getListTitle: function (callback) {
            $http.post('/Admin/FundAccEntry/GetListTitle').then(callback);
        },
        getGetAetRelative: function (callback) {
            $http.post('/Admin/FundAccEntry/GetAetRelative').then(callback);
        },
        getGenAETCode: function (type, catCode, callback) {
            $http.post('/admin/FundAccEntry/GenAETCode?type=' + type + "&&catCode=" + catCode).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/MaterialPaymentTicket/GetUnit').then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        getListCustomers: function (callback) {
            $http.post('/Admin/Project/GetListCustomers/').then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/Project/GetListSupplier/').then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/Project/GetStatus/').then(callback);
        },
        getListProject: function (callback) {
            $http.post('/Admin/Project/GetListProject/').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },

        //payment
        getItemPayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetItem/', data).then(callback);
        },
        insertPayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Insert/', data).then(callback);
        },
        updatePayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Update/', data).then(callback);
        },
        deletePayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Delete/' + data).then(callback);
        },
        getTotalPayment: function (data, callback) {
            $http.post('/Admin/Project/GetTotalPayment', data).then(callback);
        },
        insertAccEntryTracking: function (aetCode, status, note, aetRelative, callback) {
            $http.post('/admin/FundAccEntry/InsertAccEntryTracking?aetCode=' + aetCode + "&&status=" + status + "&&note=" + note + "&&aetRelative=" + aetRelative).then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/FundAccEntry/GetListCurrency/').then(callback);
        },
        getCurrencyDefaultPayment: function (callback) {
            $http.post('/Admin/FundAccEntry/GetCurrencyDefaultPayment').then(callback);
        },

        //project
        insert: function (data, callback) {
            $http.post('/Admin/Project/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Project/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/Project/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/Project/GetItem/' + data).then(callback);
        },
        getProjectType: function (callback) {
            $http.post('/Admin/Project/GetProjectType/').then(callback);
        },
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).then(callback);
        },
        checkPlan: function (data, callback) {
            $http.post('/Admin/FundAccEntry/CheckPlan?aetCode=' + data).then(callback);
        },
        getListFundFiles: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetListFundFiles?aetCode=' + data).then(callback);
        },
        getAetRelativeChil: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetAetRelativeChil?aetCode=' + data).then(callback);
        },

        //attribute
        getItemProjectTabAttribute: function (data, callback) {
            $http.post('/Admin/Project/GetItemProjectTabAttribute/', data).then(callback);
        },
        insertProjectTabAttribute: function (data, callback) {
            $http.post('/Admin/Project/InsertProjectTabAttribute/', data).then(callback);
        },
        updateProjectTabAttribute: function (data, callback) {
            $http.post('/Admin/Project/UpdateProjectTabAttribute/', data).then(callback);
        },
        deleteProjectTabAttribute: function (data, callback) {
            $http.post('/Admin/Project/DeleteProjectTabAttribute/', data).then(callback);
        },


        //Member
        getMember: function (data, callback) {
            $http.get('/Admin/Project/GetMember/' + data).then(callback);
        },
        insertProjectTabMember: function (data, callback) {
            $http.post('/Admin/Project/InsertProjectTabMember/', data).then(callback);
        },
        updateProjectTabMember: function (data, callback) {
            $http.post('/Admin/Project/UpdateProjectTabMember/', data).then(callback);
        },
        deleteProjectTabMember: function (data, callback) {
            $http.post('/Admin/Project/DeleteProjectTabMember/' + data).then(callback);
        },

        //Note
        getNote: function (data, callback) {
            $http.get('/Admin/Project/GetNote/' + data).then(callback);
        },
        insertProjectTabNote: function (data, callback) {
            $http.post('/Admin/Project/InsertProjectTabNote/', data).then(callback);
        },
        deleteprojectTabNote: function (data, callback) {
            $http.post('/Admin/Project/DeleteprojectTabNote/' + data).then(callback);
        },
        updateProjectTabNote: function (data, callback) {
            $http.post('/Admin/Project/UpdateProjectTabNote/', data).then(callback);
        },

        //File
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getProjectFile: function (data, callback) {
            $http.post('/Admin/Project/GetProjectFile/' + data).then(callback);
        },
        insertProjectFile: function (data, callback) {
            submitFormUpload('/Admin/Project/InsertProjectFile/', data, callback);
        },
        updateProjectFile: function (data, callback) {
            submitFormUpload('/Admin/Project/UpdateProjectFile/', data, callback);
        },
        deleteProjectFile: function (data, callback) {
            $http.post('/Admin/Project/DeleteProjectFile/' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        getSuggestionsProjectFile: function (data, callback) {
            $http.get('/Admin/Project/GetSuggestionsProjectFile?projectCode=' + data).then(callback);
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
            $http.post('/Admin/Project/InsertContact/', data).then(callback);
        },
        deleteContact: function (data, callback) {
            $http.post('/Admin/Project/DeleteContact/' + data).then(callback);
        },
        updateContact: function (data, callback) {
            $http.post('/Admin/Project/UpdateContact/', data).then(callback);
        },
        getContact: function (data, callback) {
            $http.get('/Admin/Project/GetContact/' + data).then(callback);
        },

        //tab teams
        getAllTeam: function (callback) {
            $http.post('/Admin/Project/GetAllTeam').then(callback);
        },
        addTeam: function (data, callback) {
            $http.post('/Admin/Project/AddTeam/', data).then(callback);
        },
        deleteTeam: function (data, callback) {
            $http.post('/Admin/Project/DeleteTeam/', data).then(callback);
        },
        getTeamInProject: function (projectId, callback) {
            $http.post('/Admin/Project/GetTeamInProject?projectId=' + projectId).then(callback);
        },

        //product
        getProduct: function (callback) {
            $http.post('/Admin/Project/GetProduct').then(callback);
        },
        getProductUnit: function (callback) {
            $http.post('/Admin/Contract/GetProductUnit').then(callback);
        },
        getPriceOption: function (data, callback) {
            $http.get('/Admin/Project/GetPriceOption?customerCode=' + data).then(callback);
        },
        getItemPrice: function (data, callback) {
            $http.get('/Admin/Project/GetItemPrice?productCode=' + data).then(callback);
        },
        insertProduct: function (data, callback) {
            $http.post('/Admin/Project/InsertProduct', data).then(callback);
        },
        updateProduct: function (data, callback) {
            $http.post('/Admin/Project/UpdateProduct', data).then(callback);
        },
        deleteProduct: function (data, callback) {
            $http.post('/Admin/Project/DeleteProduct/' + data).then(callback);
        },
        getProductInProject: function (data, callback) {
            $http.post('/Admin/Project/GetProductInProject?projectCode=' + data).then(callback);
        },

        //service
        getService: function (callback) {
            $http.get('/Admin/Project/GetService').then(callback);
        },
        getServiceLevel: function (callback) {
            $http.get('/Admin/Project/GetServiceLevel').then(callback);
        },
        getServiceDuration: function (callback) {
            $http.get('/Admin/Project/GetServiceDuration').then(callback);
        },
        insertService: function (data, callback) {
            $http.post('/Admin/Project/InsertService', data).then(callback);
        },
        updateService: function (data, callback) {
            $http.post('/Admin/Project/UpdateService', data).then(callback);
        },
        deleteService: function (data, callback) {
            $http.post('/Admin/Project/DeleteService/' + data).then(callback);
        },

        getCustomers: function (callback) {
            $http.post('/Admin/Contract/GetCustomers/').then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListSupplier/').then(callback);
        },
        getProjectCode: function (data1, callback) {
            $http.get('/Admin/Contract/GetProjectCode/' + data1).then(callback);
        },
        //getContractFromProject: function (data1, callback) {
        //    $http.get('/Admin/Contract/GetContractFromProject/?projectCode=' + data1).then(callback);
        //},
        chkExistRequestImp: function (data1, callback) {
            $http.get('/Admin/Contract/ChkExistRequestImp/?poCode=' + data1).then(callback);
        },
        getListPoProduct: function (data, callback) {
            $http.get('/Admin/SendRequestImportProduct/GetListPoProduct?contractCode=' + data).then(callback);
        },
        getImpStatus: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/getImpStatus/').then(callback);
        },
        genReqCode: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/GenReqCode').then(callback);
        },
        genTitle: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/GenTitle?poCode=' + data).then(callback);
        },
        insertImpProduct: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/Insert/', data).then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/GetListUnit').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetListCurrency').then(callback);
        },
        insertDetail: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/InsertDetail', data).then(callback);
        },
        updateDetail: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/UpdateDetail', data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/DeleteDetail?id=' + data).then(callback);
        },
        getListProduct: function (poCode, callback) {
            $http.get('/Admin/Project/GetListProduct?projectCode=' + poCode).then(callback);
        },
        jTableDetail: function (reqCode, callback) {
            $http.get('/Admin/SendRequestImportProduct/JTableDetail?reqCode=' + reqCode).then(callback);
        },


        //Request Import Product
        getContractPoBuyer: function (callback) {
            $http.post('/Admin/Project/GetContractPoBuyer/').then(callback);
        },
        getContractSale: function (callback) {
            $http.post('/Admin/Project/GetContractSale/').then(callback);
        },
        getRqImpProduct: function (callback) {
            $http.post('/Admin/Project/GetRqImpProduct/').then(callback);
        },
        getObjectRelative: function (callback) {
            $http.get('/Admin/Project/GetObjectRelative').then(callback);
        },

        insertRequestImportProduct: function (data, callback) {
            $http.post('/Admin/Project/InsertRequestImportProduct/', data).then(callback);
        },
        updateRequestImportProduct: function (data, callback) {
            $http.post('/Admin/Project/UpdateRequestImportProduct/', data).then(callback);
        },
        deleteRequestImportProduct: function (data, callback) {
            $http.post('/Admin/Project/DeleteRequestImportProduct?id=' + data).then(callback);
        },

        //Contract Po Buyer
        insertContractPoBuyer: function (data, callback) {
            $http.post('/Admin/Project/InsertContractPoBuyer/', data).then(callback);
        },
        updateContractPoBuyer: function (data, callback) {
            $http.post('/Admin/Project/UpdateContractPoBuyer/', data).then(callback);
        },
        deleteContractPoBuyer: function (data, callback) {
            $http.post('/Admin/Project/DeleteContractPoBuyer?id=' + data).then(callback);
        },

        //Contract sale
        insertContractSale: function (data, callback) {
            $http.post('/Admin/Project/InsertContractSale/', data).then(callback);
        },
        updateContractSale: function (data, callback) {
            $http.post('/Admin/Project/UpdateContractSale/', data).then(callback);
        },
        deleteContractSale: function (data, callback) {
            $http.post('/Admin/Project/DeleteContractSale?id=' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM_PROJECT', function ($scope, $rootScope, $cookies, $filter, dataserviceProject, $translate) {
    $rootScope.IsTranslate = false;
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
        //Miêu tả có thể null, và có chứa được khoảng trắng
        $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
        $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
        $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
        $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
        $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
        $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0

        $rootScope.checkDataProject = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.PROJECT_CURD_VALIDATE_CHARACTERS_SPACE, "<br/>");
            }

            return mess;
        }
        $rootScope.checkDataProjectFile = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.PROJECT_CURD_TAB_FILE_VALIDATE_CHARACTERS_SPACE, "<br/>");
            }

            return mess;
        }
        $rootScope.checkDataProjectPayment = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;

            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.PayCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.PROJECT_CURD_TAB_PAYMENT_VALIDATE_CHARACTERS_SPACE, "<br/>");
            }

            return mess;
        }
        $rootScope.validationOptionsProject = {
            rules: {
                ProjectCode: {
                    required: true,
                    maxlength: 100
                },
                ProjectTitle: {
                    required: true,
                    maxlength: 255
                },
                Budget: {
                    required: true
                },
                FromTo: {
                    required: true
                },
                DateTo: {
                    required: true
                }
            },
            messages: {
                ProjectCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_CODE_PROJECT),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_CODE_PROJECT).replace("{1}", "255")
                },
                ProjectTitle: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_NAME_PROJECT),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_NAME_PROJECT).replace("{1}", "255")
                },
                Budget: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_BUDGET),
                },
                FromTo: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_STARTTIME),
                },
                DateTo: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_ENDTIME),
                }
            }
        }
        $rootScope.validateOptionsProjectMember = {
            rules: {
                Position: {
                    required: true
                },

            },
            messages: {
                Position: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_TAB_MEMBER_LBL_POSITION),
                },

            }
        }
        $rootScope.validationOptionsProjectFile = {
            rules: {
                FileName: {
                    required: true
                },

            },
            messages: {
                FileName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_TAB_FILE_NAME),
                },

            }
        }
        $rootScope.validateOptionProjectNote = {
            rules: {
                Note: {
                    required: true,
                    maxlength: 500
                },
                Title: {
                    required: true,
                    maxlength: 100
                },

            },
            messages: {
                Note: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_TAB_NOTE_CURD_LBL_NOTE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.PROJECT_CURD_TAB_NOTE_CURD_LBL_NOTE).replace("{1}", "500")
                },
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_TAB_NOTE_CURD_LBL_TITLE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.PROJECT_CURD_TAB_NOTE_CURD_LBL_TITLE).replace("{1}", "100")
                },

            }
        }
        $rootScope.validationOptionsProjectAttr = {
            rules: {
                AttrCode: {
                    required: true
                },
                AttrValue: {
                    required: true
                }
            },
            messages: {
                AttrCode: {
                    required: caption.PROJECT_CURD_ATTRIBUTE_CODE_VALIDATE
                },
                AttrValue: {
                    required: caption.PROJECT_CURD_ATTR_VALUE
                }
            }
        }
        $rootScope.validationOptionsProjectPayment = {
            rules: {
                Title: {
                    required: true,
                },
                DeadLine:
                {
                    required: true,
                },
                Total: {
                    regx: /^$|^[0-9,]+$/
                }
            },
            messages: {
                Title: {
                    required: caption.PROJECT_VALIDATE_TITLE,
                },
                DeadLine:
                {
                    required: caption.PROJECT_VALIDATE_DATE_FUND,
                },
                Total: {
                    regx: caption.PROJECT_VALIDATE_MONEY
                }

            }
        }
        $rootScope.zoomMapDefault = 16;
        $rootScope.latCustomerDefault = 21.0277644;
        $rootScope.lngCustomerDefault = 105.83415979999995;
        $rootScope.addressCustomerDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    });
    dataserviceProject.getCustomers(function (rs) {
        rs = rs.data;
        $rootScope.Customers = rs;
        $rootScope.MapCustomerRole = [];
        $rootScope.MapCustomer = [];
        for (var i = 0; i < rs.length; ++i) {
            $rootScope.MapCustomerRole[rs[i].Code] = rs[i].Role;
            $rootScope.MapCustomer[rs[i].Code] = rs[i];
        }
    })
    //$rootScope.validationOptionsTabProduct = {
    //    rules: {
    //        Quantity: {
    //            required: true,
    //        },
    //        UnitPrice: {
    //            required: true,
    //        },
    //        Tax: {
    //            required: true,
    //        },
    //    },
    //    messages: {
    //        Quantity: {
    //            required: caption.CONTRACT_CURD_VALIDATE_QUANTITY_NO_BLANK,
    //        },
    //        UnitPrice: {
    //            required: caption.CONTRACT_CURD_VALIDATE_PRICE_NO_BLANK,
    //        },
    //        Tax: {
    //            required: caption.CONTRACT_CURD_VALIDATE_TAX_NO_BLANK,
    //        }
    //    }

    //}
    $rootScope.listManagerStatus = [
        {
            Code: "APPROVED",
            Name: "Duyệt"
        },
        {
            Code: "REFUSE",
            Name: "Từ chối"
        },
    ];
    $rootScope.listStatus = [
        {
            Code: "CREATED",
            Name: "Khởi tạo"
        },
        {
            Code: "CANCEL",
            Name: "Hủy bỏ"
        },
        {
            Code: "PENDING",
            Name: "Chờ xử lý"
        },
        //{
        //    Code: "APPROVED",
        //    Name: "Duyệt"
        //},
        //{
        //    Code: "REFUSE",
        //    Name: "Từ chối"
        //},
    ];
    dataserviceProject.getCurrency(function (rs) {
        rs = rs.data;
        $rootScope.currencyProject = rs;
    });
    dataserviceProject.getProjectType(function (rs) {
        rs = rs.data;
        $rootScope.projectType = rs;
        var all = {
            Code: "",
            Name: caption.PROJECT_TXT_ALL
        }
        $rootScope.projectType.push(all);
    });
    //Lưu ý không tạo các biến chung ở đây(nếu tạo thêm tiền tố PROJECT)
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Project/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderProject + '/index.html',
            controller: 'indexProject'
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('indexProject', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter, $window) {
    var vm = $scope;
    $scope.model = {
        ProjectCode: '',
        ProjectTitle: '',
        ProjectType: '',
        BudgetStart: '',
        BudgetEnd: '',
        StartTime: '',
        EndTime: '',
        BranchId: ''
    }
    $scope.initData = function () {
        dataserviceProject.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: "",
                Name: caption.PROJECT_TXT_ALL
            }
            $scope.listBranch.push(all);
        })
        var date = new Date();
        var priorDate = new Date().setDate(date.getDate() - 30)
        $scope.model.StartTime = $filter('date')((priorDate), 'dd/MM/yyyy')
        $scope.model.EndTime = $filter('date')((date), 'dd/MM/yyyy')
    }
    $scope.initData();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $scope.model.ProjectCode;
                d.ProjectTitle = $scope.model.ProjectTitle;
                d.ProjectType = $scope.model.ProjectType;
                d.BudgetStart = $scope.model.BudgetStart;
                d.BudgetEnd = $scope.model.BudgetEnd;
                d.StartTime = $scope.model.StartTime;
                d.EndTime = $scope.model.EndTime;
                d.BranchId = $scope.model.BranchId;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [8, 'asc'])
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
                    $scope.edit(data.Code, data.CustomerCode, data.Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{ "PROJECT_LIST_COL_PROJECT_CODE_PROJECT" | translate }}').renderWith(function (data, type, full) {
        if (full.SetPriority == '1') {
            return '<span> ' + data + '</span>&nbsp;&nbsp;' +
                '<span class="pt5"><span class="badge-customer badge-customer-danger  fs9">&nbsp;Cao</span></span>';
        } else if (full.SetPriority == '2') {
            return '<span> ' + data + '</span>&nbsp;&nbsp;' +
                '<span class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Trung bình</span></span>';
        } else if (full.SetPriority == '3') {
            return '<span> ' + data + '</span>&nbsp;&nbsp;' +
                '<span class="pt5"><span class="badge-customer badge-customer-success">&nbsp;Thấp</span></span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "PROJECT_LIST_COL_PROJECT_NAME_PROJECT" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Budget').withTitle('{{ "PROJECT_LIST_COL_PROJECT_BUDGET" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        var budget = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + budget + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{ "PROJECT_LIST_COL_PROJECT_CURRENCY" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Progress').withTitle('{{ "PROJECT_LIST_COL_PROGRESS" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type, full) {
        return '<span class="pt5"><span role="button" ng-click=progress(\'' + full.Code + '\')>&nbsp;' + data + '</span></span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{ "PROJECT_LIST_COL_PROJECT_STARTTIME" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        var date = $filter('date')(new Date(data), 'MM/dd/yyyy');
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{ "PROJECT_LIST_COL_PROJECT_ENDTIME" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SetPriority').withTitle('PROJECT_LIST_COL_PRIORITY').withOption('sClass', 'hidden').renderWith(function (data, type) {
        if (data == '1') {
            return '<span class="badge-customer badge-customer-success fs9">&nbsp;Thấp</span>';
        } else if (data == '2') {
            return '<span class="badge-customer badge-customer-warning">&nbsp;Trung bình</span>';
        } else if (data == '3') {
            return '<span class="badge-customer badge-customer-danger">&nbsp;Cao</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpirationDate').withTitle('{{ "ATTRM_LIST_COL_EXPIRATION_DATE" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            data = convertDatetime(data);
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RenewalDate').withTitle('{{ "ATTRM_LIST_COL_RENEWAL_DATE" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            data = convertDatetime(data);
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PaymentNextDate').withTitle('{{ "ATTRM_LIST_COL_PAYMENT_DATE" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            data = convertDatetime(data);
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{ "PROJECT_CURD_COMBO_PROJECT_STATUS" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(\'' + full.Code + '\',\'' + full.CustomerCode + '\',' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>' +
            '<button title="{{&quot;YC đặt hàng&quot; | translate}}" ng-click="impProduct(\'' + full.Code + '\',\'' + full.CustomerCode + '\')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-plus"></i></button>';
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

    $scope.search = function () {
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            reloadData(true);
        }
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.add = function () {
        $rootScope.ProjectCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/add.html',
            controller: 'addProject',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (projectCode, customerCode, id) {
        $rootScope.ProjectCode = projectCode;
        $rootScope.CustomerCode = customerCode;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/edit.html',
            controller: 'editProject',
            backdrop: 'static',
            size: '60',
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
                    dataserviceProject.delete(id, function (rs) {
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
                    if (listdata[i].Id == editItems[0]) {
                        userModel = listdata[i];
                        break;
                    }
                }
                var obj = {
                    Code: userModel.Code,
                    Name: userModel.Name,
                    TabBoard: 5
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
                App.toastrError(caption.PROJECT_MSG_SELECT_PRO)
            }
        } else {
            // App.toastrError("Không có dự án nào được chọn!")
            App.toastrError(caption.PROJECT_MSG_NO_PROJECTS_SELECTED);
        }
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Budget" && ($scope.model.Budget == "" || $scope.model.Budget && $rootScope.partternFloat.test($scope.model.Budget))) {
            $scope.errorBudget = false;
        } else if (SelectType == "Budget") {
            $scope.errorBudget = true;
        }
    }
    $scope.progress = function (projectCode) {
        window.location = "/Admin/ProjectProgress?projectCode=" + projectCode;
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        debugger
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    $scope.impProduct = function (projectCode, customerCode) {
        $rootScope.CustomerCode = customerCode;
        //dataserviceProject.getProjectCode(id, function (rsCode) {
        dataserviceProject.chkExistRequestImp(projectCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                App.toastrError(caption.PROJECT_MSG_EXIST_RQ_IMP);
            }
            else {
                dataserviceProject.getProductInProject(projectCode, function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.length > 0) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderProject + '/addImpProduct.html',
                            controller: 'addImpProduct',
                            backdrop: 'static',
                            size: '60',
                            resolve: {
                                para: function () {
                                    return projectCode;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                        }, function () { });
                    } else {
                        App.toastrError(caption.PROJECT_MSG_ADD_PRODUCT_TO_PRO);
                    }
                })
            }
        });
        //});
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
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.Budget && !$rootScope.partternFloat.test(data.Budget)) {
            $scope.errorBudget = true;
            mess.Status = true;
        } else {
            $scope.errorBudget = false;
        }
        return mess;
    };
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('addProject', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $rootScope.ProjectCode = '';
    $scope.listSetPriority = [
        {
            Code: 3,
            Name: "Thấp"
        },
        {
            Code: 2,
            Name: "Trung bình"
        },
        {
            Code: 1,
            Name: "Cao"
        },
    ];
    $scope.model = {
        ProjectCode: '',
        ProjectTitle: '',
        PrjType: $rootScope.projectType.length != 0 ? $rootScope.projectType[0].Code : '',
        Currency: $rootScope.currencyProject[1].Code,
        Budget: '',
        PrjMode: '',
        SetPriority: $scope.listSetPriority[0].Code,
        CaseWorker: '',
        StartTime: '',
        EndTime: '',
        CustomerCode: '',
        SupplierCode: '',
        GoogleMap: '',
        Address: '',
        Currency: 'VND',
        PrjStatus: 'ACTIVE',

    }
    $scope.initData = function () {
        dataserviceProject.getListCustomers(function (rsCus) {
            rsCus = rsCus.data;
            $scope.Customers = rsCus;
        })
        dataserviceProject.getListSupplier(function (rsSup) {
            rsSup = rsSup.data;
            $scope.Suppliers = rsSup;
        })
        dataserviceProject.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        })
        $scope.model.StartTime = $rootScope.dateNow;
        dataserviceProject.getStatus(function (rs) {
            rs = rs.data;
            $scope.listStatusPro = rs;
            $scope.model.Status = $scope.listStatusPro[0].Code
        })
    }
    $scope.initData();
    $scope.addCommonSettingProjectType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRO_TYPE',
                        GroupNote: 'Loại dự án',
                        AssetCode: 'PROJECT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getProjectType(function (rs) {
                rs = rs.data;
                $rootScope.projectType = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingSetPriority = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRO_SET_PRIORITY',
                        GroupNote: 'Thiết lập ưu tiên',
                        AssetCode: 'PROJECT'
                    }
                }
            }
        });
    }
    $scope.chkProject = function () {
        if ($rootScope.ProjectCode == '') {
            App.toastrError(caption.PROJECT_CHECK_CLICK_OPEN_TAB);
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var msg = $rootScope.checkDataProject($scope.model.ProjectCode);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($rootScope.ProjectCode == '') {
                dataserviceProject.insert($scope.model, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $rootScope.ProjectCode = $scope.model.ProjectCode;
                        $rootScope.CustomerCode = $scope.model.CustomerCode;
                        $rootScope.ObjCode = $scope.model.ProjectCode;
                        $rootScope.initPrice();
                    }
                });
            } else {
                dataserviceProject.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                });
            }
        }
    }
    $scope.addCustomer = function () {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getListCustomers(function (rsCus) {
                rsCus = rsCus.data;
                $scope.Customers = rsCus;
            })
        }, function () {
        });
    }
    $scope.addSupplier = function () {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderSupplier + '/add.html',
            controller: 'add',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getListSupplier(function (rsSup) {
                rsSup = rsSup.data;
                $scope.Suppliers = rsSup;
            })
        }, function () {
        });
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCustomer + '/google-map.html',
            controller: 'googleMapCustomer',
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
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
        if (SelectType == "PrjStatus" && $scope.model.PrjStatus != "") {
            $scope.errorPrjStatus = false;
        }
        if (SelectType == "CustomerCode" && $scope.model.CustomerCode != "") {
            $scope.errorCustomer = false;
        }
    }

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
            $scope.model.GoogleMap = lat + ',' + lng;
            $scope.model.Address = document.getElementById('textAreaAddress').value;
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Currency == "" || data.Currency == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CustomerCode == "" || data.CustomerCode == null) {
            $scope.errorCustomer = true;
            mess.Status = true;
        } else {
            $scope.errorCustomer = false;
        }
        return mess;
    };
    function initDateTime() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
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
    setTimeout(function () {
        //initAutocomplete();
        initDateTime();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('editProject', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
    $scope.listSetPriority = [
        {
            Code: 3,
            Name: "Thấp"
        },
        {
            Code: 2,
            Name: "Trung bình"
        },
        {
            Code: 1,
            Name: "Cao"
        },
    ];
    $scope.initData = function () {
        dataserviceProject.getItem(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                $rootScope.ObjCode = $scope.model.ProjectCode;
                validateDefault();
            }
        });
        dataserviceProject.getListCustomers(function (rsCus) {
            rsCus = rsCus.data;
            $scope.Customers = rsCus;
        })
        dataserviceProject.getListSupplier(function (rsSup) {
            rsSup = rsSup.data;
            $scope.Suppliers = rsSup;
        })
        dataserviceProject.getStatus(function (rs) {
            rs = rs.data;
            $scope.listStatusPro = rs;
        })
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataserviceProject.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
        if (SelectType == "PrjStatus" && $scope.model.PrjStatus != "") {
            $scope.errorPrjStatus = false;
        }
        if (SelectType == "CustomerCode" && $scope.model.CustomerCode != "") {
            $scope.errorCustomer = false;
        }
        //if (SelectType == "SupplierCode" && $scope.model.SupplierCode != "") {
        //    $scope.errorSupplier = false;
        //}
        if (SelectType == "CaseWorker" && $scope.model.CaseWorker != "") {
            $scope.errorCaseWorker = false;
        }
    }
    $scope.addCardJob = function () {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id === para) {
                userModel = listdata[i];
                break;
            }
        }
        var obj = {
            Code: userModel.Code,
            Name: userModel.Name,
            TabBoard: 5
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: "/views/admin/cardJob/add-card.html",
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
    };
    $scope.addCommonSettingProjectType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRO_TYPE',
                        GroupNote: 'Loại dự án',
                        AssetCode: 'PROJECT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getProjectType(function (rs) {
                rs = rs.data;
                $rootScope.projectType = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingSetPriority = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRO_SET_PRIORITY',
                        GroupNote: 'Thiết lập ưu tiên',
                        AssetCode: 'PROJECT'
                    }
                }
            }
        });

    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCustomer + '/google-map.html',
            controller: 'googleMapCustomer',
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
    $scope.addCustomer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getListCustomers(function (rsCus) {
                rsCus = rsCus.data;
                $scope.Customers = rsCus;
            })
        }, function () {
        });
    }
    $scope.addSupplier = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderSupplier + '/add.html',
            controller: 'add',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getListSupplier(function (rsSup) {
                rsSup = rsSup.data;
                $scope.Suppliers = rsSup;
            })
        }, function () {
        });
    }
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
            $scope.model.GoogleMap = lat + ',' + lng;
            $scope.model.Address = document.getElementById('textAreaAddress').value;
        });
    }
    function validateDefault() {
    }
    function initDateTime() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
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
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
            if ($('#DateTo').valid()) {
                $('#DateTo').removeClass('invalid').addClass('success');
            }
        });
        validateDefault();
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });

        $('#FromTo').datepicker('setEndDate', $scope.model.EndTime);
        $('#DateTo').datepicker('setStartDate', $scope.model.StartTime);
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Currency == "" || data.Currency == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CustomerCode == "" || data.CustomerCode == null) {
            $scope.errorCustomer = true;
            mess.Status = true;
        } else {
            $scope.errorCustomer = false;
        }
        //if (data.SupplierCode == "") {
        //    $scope.errorSupplier = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorSupplier = false;
        //}
        return mess;
    };

    $scope.impProduct = function () {
        dataserviceProject.chkExistRequestImp($rootScope.ProjectCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                App.toastrError(caption.PROJECT_MSG_PRO_EXIST_RQ_IMP);
            }
            else {
                dataserviceProject.getProductInProject($rootScope.ProjectCode, function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.length > 0) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderProject + '/addImpProduct.html',
                            controller: 'addImpProduct',
                            backdrop: 'static',
                            size: '60',
                            resolve: {
                                para: function () {
                                    return $rootScope.ProjectCode;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                        }, function () { });
                    } else {
                        App.toastrError(caption.PROJECT_MSG_ADD_PRODUCT_TO_PRO);
                    }
                })



                //var check = false;
                //dataserviceProject.getListPoProduct(function (result) {result=result.data;
                //    $scope.listPo = result;
                //    for (var i = 0; i < $scope.listPo.length; i++) {
                //        if ($rootScope.ProjectCode == $scope.listPo[i].Code) {
                //            check = true;
                //            break;
                //        }
                //    }

                //    if (check) {
                //        var modalInstance = $uibModal.open({
                //            animation: true,
                //            templateUrl: ctxfolderProject + '/addImpProduct.html',
                //            controller: 'addImpProduct',
                //            backdrop: 'static',
                //            size: '70',
                //            resolve: {
                //                para: function () {
                //                    return $rootScope.ProjectCode;
                //                }
                //            }
                //        });
                //        modalInstance.result.then(function (d) {
                //        }, function () { });
                //    } else {
                //        App.toastrError("Dự án này đã hết hạn hoặc không có sản phẩm cần đặt hàng ");
                //    };
                //});
            }
        });
    }
    setTimeout(function () {
        //initAutocomplete();
        initDateTime();
        setModalDraggable('.modal-dialog');
    }, 100);
});

app.controller('projectTabProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    
    $scope.model = {
        Id: '',
        ProductCode: '',
        Cost: '',
        Quantity: '',
        Unit: '',
        Tax: '',
        PriceOption: '',
        Note: ''
    }
    $scope.modelView = {
        TaxMoney: ''
    }
    
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.Cost = $rootScope.Cost;
                d.Quantity = $rootScope.Quantity;
                d.Unit = $rootScope.Unit;
                d.Tax = $rootScope.Tax;
                d.Note = $rootScope.Note;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProductProject");
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
                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
                    var Id = row.find('td:eq(1)').text();
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblDataProductDetail').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;

                        var objPara = {
                            ProductCode: data.ProductCode,
                            ProductType: data.ProductType,
                            ContractCode: $rootScope.ContractCode,
                        }
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderContract + '/contractTabProductDetail.html',
                            controller: 'contractTabProductDetail',
                            backdrop: 'static',
                            size: '40',
                            resolve: {
                                para: function () {
                                    return objPara;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $scope.reload();
                        }, function () {
                        });
                    }
                    $scope.$apply();
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{"PROJECT_TAB_PRODUCT_COL_UNIT_PRICE" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + dt + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        return dt;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitName').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_S_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Tax').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_TAX" | translate}}').renderWith(function (data, type) {
        return '<span class="bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TaxMoney').withTitle('{{"PROJECT_LIST_COL_TAX_MONEY" | translate}}').renderWith(function (data, type, full) {
        var cost = ((full.Quantity * full.Cost) * full.Tax) / 100;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        return '<span class="text-danger bold">' + dt + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPrice').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_TOTAL_PRICE" | translate}}').renderWith(function (data, type, full) {
        var cost = (full.Quantity * full.Cost) + ((full.Quantity * full.Cost) * full.Tax) / 100;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        return '<span class="text-danger bold">' + dt + '</span>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_AFTER_TAX" | translate}}').renderWith(function (data, type, full) {
    //    var cost = full.Quantity * full.UnitPrice + (full.Quantity * full.UnitPrice) * full.Tax / 100;
    //    var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
    //    return dt;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="getItem(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.init = function () {
        $rootScope.initPrice();
        dataserviceProject.getProduct(function (rs) {
            rs = rs.data;
            $scope.products = rs;
        });
        dataserviceProject.getProductUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
    }
    $rootScope.initPrice = function () {
        //
        dataserviceProject.getPriceOption($rootScope.CustomerCode, function (rs) {
            rs = rs.data;
            $scope.priceOption = rs.Object;
        })
    }
    $scope.init();
    $scope.calTax = function () {
        $scope.modelView.TaxMoney = Math.round(($scope.model.Tax * $scope.model.Cost * $scope.model.Quantity) / 100);
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ProductCode" && $scope.model.ProductCode != "") {
            $scope.errorProductCode = false;
        }
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "Tax" && ($scope.model.Tax != null && $scope.model.Tax != undefined && $scope.model.Tax < 0)) {
            $scope.errorTax = true;
            $scope.calTax();
        }
        else {
            $scope.errorTax = false;
            if ($scope.model.Tax == null || $scope.model.Tax == undefined) {
                $scope.model.Tax = 0;
            }
            $scope.calTax();
        }

        if (SelectType == "UnitPrice" && ($scope.model.Cost != null && $scope.model.Cost != undefined && $scope.model.Cost >= 0)) {
            $scope.errorUnitPrice = false;
            $scope.calTax();
        }

        if (SelectType == "Quantity" && ($scope.model.Quantity != null && $scope.model.Quantity != undefined && $scope.model.Quantity >= 0)) {
            $scope.errorQuantity = false;
            $scope.calTax()
        }
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.selectProduct = function (item) {
        $scope.model.Unit = item.Unit;
        $scope.model.Tax = 0;
        $scope.productType = item.ProductType;
        $scope.currentSelectedProduct = item;
        $scope.filterPrice();
        validationselectTabProject($scope.model);
    }
    $scope.filterPrice = function () {
        if ($scope.model.ProductCode != '' && $scope.model.PriceOption != '' && $scope.currentSelectedProduct != null) {
            var price = 0;
            if ($scope.model.PriceOption == "PRICE_COST_CATELOGUE")
                price = $scope.currentSelectedProduct.PriceCostCatelogue;
            if ($scope.model.PriceOption == "PRICE_COST_AIRLINE")
                price = $scope.currentSelectedProduct.PriceCostAirline;
            if ($scope.model.PriceOption == "PRICE_COST_SEA")
                price = $scope.currentSelectedProduct.PriceCostSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD")
                price = $scope.currentSelectedProduct.PriceRetailBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_AIRLINE")
                price = $scope.currentSelectedProduct.PriceRetailBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_SEA")
                price = $scope.currentSelectedProduct.PriceRetailBuildSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD")
                price = $scope.currentSelectedProduct.PriceRetailNoBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_AIRLINE")
                price = $scope.currentSelectedProduct.PriceRetailNoBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_SEA")
                price = $scope.currentSelectedProduct.PriceRetailNoBuildSea;
            $scope.model.Cost = price;
        }
    }
    $scope.validator = function (data) {

        var msg = { Error: false, Title: null };
        if (data.ProductCode == null || data.ProductCode == '' || data.ProductCode == undefined) {
            msg.Error = true;
            msg.Title = "Vui lòng chọn sản phẩm";
        }
        //if (data.Quantity == null || data.Quantity == '' || data.Quantity == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập số lượng";
        //    else
        //        msg.Title = "Vui lòng nhập số lượng";
        //}
        //if (data.UnitPrice == null) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == '') {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.Tax == null || data.Tax == '' || data.Tax == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập thuế";
        //    else
        //        msg.Title = "Vui lòng nhập thuế";
        //}
        return msg;
    }
    $scope.getItem = function (id) {
        var listdata = $('#tblDataProductProject').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].Id == id) {
                var item = listdata[i];
                $scope.model.Id = item.Id;
                $scope.model.ProductCode = item.ProductCode;
                $scope.model.Quantity = item.Quantity;
                $scope.model.Unit = item.Unit;
                $scope.model.Cost = item.Cost;
                $scope.model.Tax = ((item.Tax != null && item.Tax != '') ? '' + item.Tax : '10');
                $scope.model.Note = item.Note;
                $scope.model.PriceOption = item.PriceType;
                $scope.calTax();

                break;
            }
        }
    }
    $scope.add = function () {
        var obj = {
            ProjectCode: $rootScope.ProjectCode,
            ProductCode: $scope.model.ProductCode,
            ProductType: $scope.productType,
            Quantity: $scope.model.Quantity,
            Cost: $scope.model.Cost,
            Unit: $scope.model.Unit,
            Tax: ($scope.model.Tax == null || $scope.model.Tax == '') ? 0 : $scope.model.Tax,
            Note: $scope.model.Note,
            PriceType: $scope.model.PriceOption,
        }
        validationselectTabProject($scope.model);
        if (validationselectTabProject($scope.model).Status == false) {
            dataserviceProject.insertProduct(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.update = function () {
        validationselectTabProject($scope.model);
        if (validationselectTabProject($scope.model).Status == false) {
            dataserviceProject.updateProduct($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reset();
                    $scope.reload();
                }
            });
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceProject.deleteProduct(id, function (result) {
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
    $scope.reset = function () {
        $scope.model = {
            Id: '',
            ProductCode: '',
            Cost: '',
            Quantity: '',
            Unit: '',
            Tax: '',
            Note: ''
        };
        $scope.modelView.TaxMoney = "";
    }

    //Add material product
    $scope.addMaterialProd = function () {
        $rootScope.ProductCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaterialProd + '/add.html',
            controller: 'addMaterialProd',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return null;
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getProduct(function (rs) {
                rs = rs.data;
                $scope.products = rs;
            });
        }, function () {
        });
    }

    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        if (data.Cost == undefined || data.Cost == null || data.Cost <= 0) {
            $scope.errorUnitPrice = true;
            mess.Status = true;
        } else {
            $scope.errorUnitPrice = false;
        }
        if (data.Tax != null && data.Tax != undefined && data.Tax < 0) {
            $scope.errorTax = true;
            mess.Status = true;
        } else {
            $scope.errorTax = false;
        }
        if (data.Quantity == null || data.Quantity == undefined || data.Quantity <= 0) {
            $scope.errorQuantity = true;
            mess.Status = true;
        } else {
            $scope.errorQuantity = false;
        }
        return mess;
    }
});
app.controller('projectTabService', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Id: '',
        ServiceCode: '',
        ProjectCode: $rootScope.ProjectCode,
        Level: '',
        Quantity: '',
        DurationTime: '',
        Unit: '',
        Note: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableService",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataServiceProject");
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
                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
                    var Id = row.find('td:eq(1)').text();
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblDataProductDetail').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;

                        var objPara = {
                            ProductCode: data.ProductCode,
                            ProductType: data.ProductType,
                            ContractCode: $rootScope.ContractCode,
                        }
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderContract + '/contractTabProductDetail.html',
                            controller: 'contractTabProductDetail',
                            backdrop: 'static',
                            size: '40',
                            resolve: {
                                para: function () {
                                    return objPara;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $scope.reload();
                        }, function () {
                        });
                    }
                    $scope.$apply();
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceCode').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_SERVICE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceName').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_SERVICE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LevelName').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_LEVEL" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DurationTime').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_DURATION_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitName').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_UNIT" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="getItem(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.init = function () {
        dataserviceProject.getService(function (rs) {
            rs = rs.data;
            $scope.services = rs;
        });
        dataserviceProject.getServiceLevel(function (rs) {
            rs = rs.data;
            $scope.serviceLevel = rs;
            $scope.model.Level = $scope.serviceLevel.length != 0 ? $scope.serviceLevel[0].Code : '';
        })
        dataserviceProject.getServiceDuration(function (rs) {
            rs = rs.data;
            $scope.serviceDurationUnit = rs;
            $scope.model.Unit = $scope.serviceDurationUnit.length != 0 ? $scope.serviceDurationUnit[0].Code : '';
        })
    }
    $scope.init();
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ServiceCode" && $scope.model.ServiceCode != "") {
            $scope.errorServiceCode = false;
        }
        if (SelectType == "Level" && $scope.model.Level != "") {
            $scope.errorLevel = false;
        }
        if (SelectType == "Quantity" && ($scope.model.Quantity != null && $scope.model.Quantity != '' && $scope.model.Quantity > 0)) {
            $scope.errorQuantity = false;
        }
        if (SelectType == "DurationTime" && ($scope.model.DurationTime != null && $scope.model.DurationTime != '' && $scope.model.DurationTime > 0)) {
            $scope.errorDurationTime = false;
        }
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.getItem = function (id) {
        var listdata = $('#tblDataServiceProject').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].Id == id) {
                var item = listdata[i];

                $scope.model.Id = item.Id;
                $scope.model.ServiceCode = item.ServiceCode;
                $scope.model.Level = item.Level;
                $scope.model.Quantity = item.Quantity;
                $scope.model.DurationTime = item.DurationTime;
                $scope.model.Unit = item.Unit;
                $scope.model.Note = item.Note;
                break;
            }
        }
    }
    $scope.add = function () {
        var obj = {
            ServiceCode: $scope.model.ServiceCode,
            Level: $scope.model.Level,
            Quantity: $scope.model.Quantity,
            DurationTime: $scope.model.DurationTime,
            Unit: $scope.model.Unit,
            Note: $scope.model.Note,
            ProjectCode: $rootScope.ProjectCode,
        }
        if (validationselectTabService($scope.model).Status == false) {
            dataserviceProject.insertService(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.update = function () {
        if (validationselectTabService($scope.model).Status == false) {
            dataserviceProject.updateService($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceProject.deleteService(id, function (result) {
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
    $scope.reset = function () {
        $scope.model.Id = '';
        $scope.model.ServiceCode = '';
        $scope.model.Level = '';
        $scope.model.Quantity = '';
        $scope.model.DurationTime = '';
        $scope.model.Note = '';
    }
    function validationselectTabService(data) {
        var mess = { Status: false, Title: "" }
        if (data.ServiceCode == "" || data.ServiceCode == null) {
            $scope.errorServiceCode = true;
            mess.Status = true;
        } else {
            $scope.errorServiceCode = false;
        }
        if (data.Level == "" || data.Level == null) {
            $scope.errorLevel = true;
            mess.Status = true;
        } else {
            $scope.errorLevel = false;
        }
        if (data.Quantity == '' || data.Quantity == null || data.Quantity <= 0) {
            $scope.errorQuantity = true;
            mess.Status = true;
        } else {
            $scope.errorQuantity = false;
        }
        if (data.DurationTime == "" || data.DurationTime == null) {
            $scope.errorDurationTime = true;
            mess.Status = true;
        } else {
            $scope.errorDurationTime = false;
        }
        return mess;
    }
});

app.controller('projectTabMember', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Fullname: '',
        Position: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableMember",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.Fullname = $scope.model.Fullname;
                d.Position = $scope.model.Position;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
    }).withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "PROJECT_CURD_TAB_MEMBER_LIST_COL_FULLNAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position').withTitle('{{ "PROJECT_CURD_TAB_MEMBER_LIST_COL_POSITION" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{ "PROJECT_CURD_TAB_MEMBER_LIST_COL_EMAIL" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Active').withTitle('{{ "PROJECT_CURD_TAB_MEMBER_LIST_COL_STATUS" | translate }}').renderWith(function (data, type) {
        return data == "True" ? '<span class="text-success">Hoạt động</span>' : '<span class="text-danger">Không hoạt động</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').notSortable().withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabMemberAdd.html',
            controller: 'projectTabMemberAdd',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    }
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabMemberEdit.html',
            controller: 'projectTabMemberEdit',
            backdrop: 'static',
            size: '30',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData();
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;     //Bạn có chắc chắn muốn xóa
                $scope.ok = function () {
                    dataserviceProject.deletePayment(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                        App.unblockUI("#contentMain");
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
app.controller('projectTabMemberAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
        Position: '',
        ProjectId: '',
    };
    $scope.initLoad = function () {
        dataserviceProject.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
    }
    $scope.initLoad();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.MemberCode == "" || data.MemberCode == null) {
            $scope.errorMemberCode = true;
            mess.Status = true;
        } else {
            $scope.errorMemberCode = false;
        }
        return mess;
    };

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "MemberCode" && $scope.model.MemberCode != "") {
            $scope.errorMemberCode = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.insertProjectTabMember($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        };
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('projectTabMemberEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceProject, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataserviceProject.getMember(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                $scope.model.Member = $scope.model.MemberCode;
            }
        });
        dataserviceProject.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };


        if (data.MemberCode == "" || data.MemberCode == null) {
            $scope.errorMemberCode = true;
            mess.Status = true;
        } else {
            $scope.errorMemberCode = false;

        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "MemberCode" && $scope.model.MemberCode != "") {
            $scope.errorMemberCode = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.updateProjectTabMember($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        };
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('projectTabFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FileName: '',
        FromDate: '',
        ToDate: '',
    }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.FileName = $scope.model.FileName;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProjectFile");
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_FILENAME" | translate }}').renderWith(function (data, type, full) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_REPOSNAME" | translate }}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle("{{'PROJECT_LIST_COL_VIEW_CONTENT' | translate}}").renderWith(function (data, type, full) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_NOTE" | translate }}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_CREATETIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_TYPE_FILE" | translate }}').renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<button title="Sửa" ng-click="edit(\'' + full.FileName + '\',' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
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
    $scope.reload = function () {
        reloadData(true);
    }

    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderProject + '/projectTabFileSearch.html',
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
            data.append("ProjectCode", $rootScope.ProjectCode);
            data.append("IsMore", false);
            dataserviceProject.insertProjectFile(data, function (result) {
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
        dataserviceProject.getProjectFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderProject + '/projectTabFileEdit.html',
                    controller: 'projectTabFileEdit',
                    windowClass: 'modal-file',
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
                    dataserviceProject.deleteProjectFile(id, function (result) {
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
            controller: 'projectTabFileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataserviceProject.getByteFile(id, function (rs) {rs=rs.data;
        //    //
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFileProject').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        ////
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        var userModel = {};
        var listdata = $('#tblDataFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
            var modalInstance = $uibModal.open({
                templateUrl: '/views/admin/edmsRepository/imageViewer.html',
                controller: 'projectTabFileimageViewer',
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
    $scope.dowload = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        dataserviceProject.getSuggestionsProjectFile($rootScope.ProjectCode, function (rs) {
            rs = rs.data;
            var data = rs != '' ? rs : {};
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderProject + '/projectTabFileAdd.html',
                controller: 'projectTabFileAdd',
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
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceProject.getItemFile(id, true, function (rs) {
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
        var listdata = $('#tblDataProjectFile').DataTable().data();
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
                dataserviceProject.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.PROJECT_MSG_FILE_SIZE_LIMIT);
            }

        }
    };
    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataProjectFile').DataTable().data();
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
                dataserviceProject.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.PROJECT_MSG_FILE_SIZE_LIMIT);
            }
        }
    };
    $scope.viewPDF = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataProjectFile').DataTable().data();
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
                dataserviceProject.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.PROJECT_MSG_FILE_SIZE_LIMIT);
            }
        }
    };
    $scope.view = function (id) {
        debugger
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataProjectFile').DataTable().data();
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
            dataserviceProject.createTempFile(id, false, "", function (rs) {
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
            dataserviceProject.createTempFile(id, false, "", function (rs) {
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
            templateUrl: ctxfolderProject + '/viewer.html',
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
    function loadDate() {
        $("#FromToProject").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateToProject').datepicker('setStartDate', maxDate);
        });
        $("#DateToProject").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromToProject').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromToProject').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateToProject').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('projectTabFileAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('{{"PROJECT_LIST_COL_FORDER_SAVE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
                App.toastrError(caption.PROJECT_MSG_SELECT_FORDER);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.PROJECT_MSG_SELECT_FORDER);
                return;
            }
            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("ProjectCode", $rootScope.ProjectCode);
            data.append("IsMore", true);
            dataserviceProject.insertProjectFile(data, function (result) {
                result = result.data;
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
            dataserviceProject.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.PROJECT_LBL_ALL_CATE,//"Tất cả kho dữ liệu"
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
app.controller('projectTabFileEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{"PROJECT_LIST_COL_FORDER" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
            App.toastrError(caption.PROJECT_MSG_SELECT_FORDER);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.PROJECT_MSG_SELECT_FORDER);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("ProjectCode", $rootScope.ProjectCode);
                dataserviceProject.updateProjectFile(data, function (result) {
                    result = result.data;
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
            dataserviceProject.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.PROJECT_LBL_ALL_CATE,//"Tất cả kho dữ liệu"
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
app.controller('projectTabFileimageViewer', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataserviceProject, $filter, $uibModalInstance, para) {
    $scope.Image = para;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('projectTabFileShare', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceProject) {
    $scope.model = {
        ObjectCodeShared: $rootScope.ProjectCode,
        ObjectTypeShared: 'PROJECT',
        ObjectType: '',
        ObjectCode: '',
        FileCode: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataserviceProject.getListObjectTypeShare(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceProject.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {
            rs = rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceProject.getListObjectCode($rootScope.ProjectCode, ObjType, function (rs) {
            rs = rs.data;
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
        dataserviceProject.deleteObjectShare(id, function (rs) {
            rs = rs.data;
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
            dataserviceProject.insertFileShare($scope.model, function (rs) {
                rs = rs.data;
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
            App.toastrError(caption.PROJECT_MSG_NO_OBJ_SELECT)
            error = true;
            return error;
        }
        if (($scope.model.ObjectCode == "" || $scope.model.ObjectCode == undefined)) {
            App.toastrError(caption.PROJECT_MSG_NO_OBJ_CODE)
            error = true;
            return error;
        }
        if (($scope.model.FileCode == "" || $scope.model.FileCode == undefined)) {
            App.toastrError(caption.PROJECT_MSG_NO_FILE_SELECT)
            error = true;
            return error;
        }
    }
    function reloadListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode) {
        dataserviceProject.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {
            rs = rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('projectTabNote', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.model = {
        Title: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableProjectNote",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.Title = $scope.model.Title;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataNoteProject");
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
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{ "PROJECT_CURD_TAB_NOTE_LIST_COL_ADDRESS" | translate }}').renderWith(function (data, type) {
        return '<span  class="btn btn-success" style="height: 20px; font-size: 5; padding: 0">Tags</button>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{ "PROJECT_CURD_TAB_NOTE_LIST_COL_TITLE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "PROJECT_CURD_TAB_NOTE_LIST_COL_TAGS" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{ "PROJECT_CURD_TAB_NOTE_LIST_COL_NOTE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "PROJECT_CURD_TAB_NOTE_LIST_COL_CREATETIME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabNoteAdd.html',
            controller: 'projectTabNoteAdd',
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
            templateUrl: ctxfolderProject + '/projectTabNoteEdit.html',
            controller: 'projectTabNoteEdit',
            backdrop: 'static',
            size: '30',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData();
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceProject.deleteprojectTabNote(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                        App.unblockUI("#contentMain");
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
app.controller('projectTabNoteAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.model = {
        Position: '',
        ProjectId: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.addform.validate()) {

            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.insertProjectTabNote($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
                App.unblockUI("#contentMain");
            });
        };
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('projectTabNoteEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
        Title: '',
        Note: '',
    };
    $scope.initData = function () {
        dataserviceProject.getNote(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceProject.updateProjectTabNote($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        };
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});


app.controller('projectTabPayment', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {

        FromDate: '',
        ToDate: '',
        ProjectId: '',
        PaymentType: '',
        ProjectCode: $rootScope.ProjectCode,
    }

    //$scope.model = {
    //    ContractCode: ''
    //}
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableProjectTabPayment",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.PaymentType = $scope.model.PaymentType;
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataPayment");
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
        })
        .withOption('footerCallback', function (tfoot, data) {
            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.getTotalPayment($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    $scope.totalReceipts = Math.round(result.totalReceipts);
                    $scope.totalPaymentSlip = Math.round(result.totalExpense);
                    $scope.totalMoney = Math.round($scope.totalReceipts - $scope.totalPaymentSlip);
                    $scope.isVND = result.isVND;
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DeadLine').withTitle('{{"PROJECT_LIST_COL_DEAD_LINE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withTitle('{{"PROJECT_LIST_COL_CAT_NAME" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"PROJECT_LIST_COL_TITLE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Total').withTitle('{{"PROJECT_LIST_COL_TOTAL" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return '<span class="text-danger bold">' + $filter('currency')(data, '', 0) + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"PROJECT_LIST_COL_STATUS" | translate}}').withOption('sClass', 'dataTable-pr0 nowrap').renderWith(function (data, type) {
        switch (data) {
            case "CREATED":
                data = "Khởi tạo";
                return '<span class="text-success">' + data + '</span>';
                break;
            case "PENDING":
                data = "Chờ xử lý";
                return '<span class="text-warning"> ' + data + '</span>';
                break;
            case "APPROVED":
                data = "Đã duyệt";
                return '<span class="text-primary"> ' + data + '</span>';
                break;
            case "REFUSE":
                data = "Từ chối";
                return '<span class="text-danger"> ' + data + '</span>';
                break;
            case "CANCEL":
                data = "Hủy bỏ";
                return '<span class="text-danger"> ' + data + '</span>';
                break;
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Payer').withTitle('{{"PROJECT_LIST_COL_PAYER" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Receiptter').withTitle('{{"PROJECT_LIST_COL_RECEIPTTER" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xóa" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.searchPayment = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabPaymentAdd.html',
            controller: 'projectTabPaymentAdd',
            backdrop: 'static',
            windowClass: "modal-funAccEntry",
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (PaymentTickitId) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabPaymentEdit.html',
            controller: 'projectTabPaymentEdit',
            backdrop: 'static',
            windowClass: "modal-funAccEntry",
            size: '70',
            resolve: {
                para: function () {
                    return PaymentTickitId;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData();
        }, function () { });
    };
    $scope.delete = function (PaymentTickitId) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceProject.deletePayment(PaymentTickitId, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                        App.unblockUI("#contentMain");
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
        $("#datefromPayment").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datetoPayment').datepicker('setStartDate', maxDate);
        });
        $("#datetoPayment").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefromPayment').datepicker('setEndDate', maxDate);
        });
    }, 200);
});
app.controller('projectTabPaymentAdd', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceProject) {
    $scope.model = {
        AetCode: '',
        GoogleMap: '',
        AetCode: '',
        Title: '',
        AetType: '',
        AetDescription: '',
        Currency: 'VND',
        ObjType: 'PROJECT',
        ObjCode: $rootScope.ProjectCode,
    }
    dataserviceProject.getCurrencyDefaultPayment(function (rs) {
        rs = rs.data;
        $scope.model.Currency = rs;
    });
    //$scope.AetCode = [];
    $scope.listFundFile = [];
    $scope.listFundFileRemove = [];
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/googleMap.html',
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
    $scope.model1 = {
        listMember: []
    }
    $scope.listAetType = [
        {
            Code: "Receipt",
            Name: "Thu"
        }, {
            Code: "Expense",
            Name: "Chi"
        }];
    $scope.listAetRelativeType = [
        {
            Code: "Vay",
            Name: "Vay"
        },
        {
            Code: "Trả",
            Name: "Trả"
        }];
    $scope.initData = function () {
        //dataserviceProject.getGetCurrency(function (rs) {rs=rs.data;
        //    $rootScope.listCurrency = rs;
        //})
        dataserviceProject.getGetAetRelative(function (rs) {
            rs = rs.data;
            $rootScope.AetRelative = rs;
        })
        dataserviceProject.getGetCatName(function (rs) {
            rs = rs.data;
            $rootScope.listCatName = rs;
        });
        dataserviceProject.getListTitle(function (rs) {
            rs = rs.data;
            $rootScope.listTitle = rs;
        })
        dataserviceProject.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
        });
        dataserviceProject.getObjDependency(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceProject.getObjCode("PROJECT", function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });
        dataserviceProject.getListCurrency(function (rs) {
            rs = rs.data;

            $scope.listCurrency = rs;
        });
    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.AetType == "" || data.AetType == null) {
            $scope.errorAetType = true;
            mess.Status = true;
        } else {
            $scope.errorAetType = false;
        }
        if (data.Currency == "" || data.Currency == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CatCode == "" || data.CatCode == null) {
            $scope.errorCatCode = true;
            mess.Status = true;
        } else {
            $scope.errorCatCode = false;
        }
        if (data.Total == null || data.Total == undefined) {
            $scope.errorTotal = true;
            mess.Status = true;
        } else {
            $scope.errorTotal = false;
        }

        return mess;
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        dataserviceProject.getGenAETCode($scope.model.AetType, $scope.model.CatCode, function (rs) {
            rs = rs.data;
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;
            $scope.model.AetCode = rs;
            validationSelect($scope.model);
            if ($scope.addformpayment.validate() && validationSelect($scope.model).Status == false) {
                dataserviceProject.insertPayment($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }

        });
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
    function validateDefault() {
        setEndDate("#DeadLine", new Date());
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //initAutocomplete();

        //Yêu cầu từ ngày --> đến ngày
        $("#DeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#DeadLine .input-date').valid()) {
                $('#DeadLine .input-date').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#DeadLine').datepicker('setEndDate', null);
            }
        });
        //$('#DeadLine').datepicker('setEndDate', new Date());
    });
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "CatCode" && $scope.model.CatCode != "") {
            $scope.errorCatCode = false;
        } else if (SelectType == "CatCode") {
            $scope.errorCatCode = true;
        }
        if (SelectType == "AetType" && $scope.model.AetType != "") {
            $scope.errorAetType = false;
        } else if (SelectType == "AetType") {
            $scope.errorAetType = true;
        }

        if (SelectType == "ObjType" && $scope.model.ObjType != "") {
            dataserviceProject.getObjCode(item.Code, function (rs) {
                rs = rs.data;
                $scope.listObjCode = rs;
            });
        }
        if (SelectType == "Total" && ($scope.model.Total == null || $scope.model.Total == undefined)) {
            $scope.errorTotal = true;
        } else {
            $scope.errorTotal = false;
        }
        if (SelectType == "Currency" && ($scope.model.Currency == null || $scope.model.Currency == undefined)) {
            $scope.errorCurrency = true;
        } else {
            $scope.errorCurrency = false;
        }
    }
    $scope.IsHide = false;
    //bảng file
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.changeAetRelative = function () {
        dataserviceProject.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;
            $scope.isPlanRelative = rs.IsPlan;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;
                $scope.IsHide = true;
                $scope.model.Currency = rs.Currency
            }

        });
    }
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
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.listFundFile.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);
            dataserviceProject.uploadFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $('#btn-upload-file').replaceWith($('#btn-upload-file').val('').clone(true));
                    App.toastrSuccess(rs.Title);
                    $scope.listFundFile.push(rs.Object);
                }
            });
        } else {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        }
    }
    $scope.removeFileReq = function (index) {
        var itemRemove = $scope.listFundFile[index];

        if (itemRemove.Id != null) {
            $scope.listFundFileRemove.push(itemRemove);
        }
        $scope.listFundFile.splice(index, 1);
    }
});
app.controller('projectTabPaymentEdit', function ($scope, $rootScope, $uibModal, $uibModalInstance, dataserviceProject, para) {
    $scope.model = {
        ListFileAccEntry: [],
        ObjCode: $rootScope.ProjectCode,
        AetCode: '',
    }
    $scope.listFundFile = [];
    $scope.listFundFileRemove = [];

    $scope.listAetType = [
        {
            Code: "Receipt",
            Name: "Thu"
        },
        {
            Code: "Expense",
            Name: "Chi"
        }];
    $scope.listAetRelativeType = [
        {
            Code: "Vay",
            Name: "Vay"
        },
        {
            Code: "Trả",
            Name: "Trả"
        }];
    $scope.IsPermission = false;
    $scope.IsPermissionManager = false;
    $scope.IsShow = true;
    $scope.addObj = function () {
        if ($scope.IsPermission == false) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/add-object-relative.html',
                controller: 'add-object-relative',
                size: '50',
                resolve: {
                    AetCode: function () {
                        return $scope.model.AetCode;
                    }
                }

            });
            modalInstance.result.then(function (d) {
                $scope.initCardRelative(AetCode);
            }, function () {
            });
        }
    };
    $scope.disableAetRelative = false;
    $scope.changeAetRelative = function () {

        dataserviceProject.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;

            $scope.isPlanRelative = rs.IsPlan;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;
                $scope.hide = true;
                $scope.model.Currency = rs.Currency
            }

        });



    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "CatCode" && $scope.model.CatCode != "") {
            $scope.errorCatCode = false;
        } else if (SelectType == "CatCode") {
            $scope.errorCatCode = true;
        }
        if (SelectType == "AetType" && $scope.model.AetType != "") {
            $scope.errorAetType = false;
        } else if (SelectType == "AetType") {
            $scope.errorAetType = true;
        }
        if (SelectType == "ObjType" && $scope.model.ObjType != "") {
            dataserviceProject.getObjCode(item.Code, function (rs) {
                rs = rs.data;
                $scope.listObjCode = rs;
            });
        }
        if (SelectType == "Total" && ($scope.model.Total == null || $scope.model.Total == undefined)) {
            $scope.errorTotal = true;
        } else {
            $scope.errorTotal = false;
        }
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/googleMap.html',
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
    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $scope.model.AetCode;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.AetType == "" || data.AetType == null) {
            $scope.errorAetType = true;
            mess.Status = true;
        } else {
            $scope.errorAetType = false;

        }
        if (data.Currency == "" || data.Currency == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;

        }
        if (data.CatCode == "" || data.CatCode == null) {
            $scope.errorCatCode = true;
            mess.Status = true;
        } else {
            $scope.errorCatCode = false;

        }
        if (data.Total == null || data.Total == undefined) {
            $scope.errorTotal = true;
            mess.Status = true;
        } else {
            $scope.errorTotal = false;
        }

        return mess;
    }
    function validationManager(data) {
        var mess = { Status: false, Title: "" }
        if (data == "" || data == null) {
            $scope.errorAction = true;
            mess.Status = true;
        }
        else {
            $scope.errorAction = false;

        }
        return mess;
    }
    function callback(json) {

    }
    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.listFundFile.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);
            dataserviceProject.uploadFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.listFundFile.push(rs.Object);
                    $('#btn-upload-file').replaceWith($('#btn-upload-file').val('').clone(true));
                }
            });
        } else {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        }
    }
    $scope.removeFileReq = function (index) {
        if (!$scope.IsPermission) {
            var itemRemove = $scope.listFundFile[index];

            if (itemRemove.Id != null) {
                $scope.listFundFileRemove.push(itemRemove);
            }
            $scope.listFundFile.splice(index, 1);
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        dataserviceProject.getItemPayment(para, function (rs) {
            rs = rs.data;

            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs[0];
                $scope.IsPermission = rs[0].IsPermission;
                $scope.IsShow = rs[0].IsShow;
                if ($scope.IsPermission) {
                    $scope.IsPermission = false;


                    if ((rs[0].Action == "APPROVED" || rs[0].Action == "REFUSE")) {
                        $scope.IsPermissionManager = true;

                    }
                    if ($scope.model.IsPlan == false && (rs[0].Action == "APPROVED" || rs[0].Action == "REFUSE")) {
                        $scope.IsPermission = true;
                    }
                    if ($scope.model.IsPlan == true && (rs[0].Action == "APPROVED" || rs[0].Action == "REFUSE")) {
                        $scope.IsPermission = false;
                    }
                } else {
                    if (rs[0].Action != null) {
                        $scope.IsPermissionManager = false;
                        $scope.IsPermission = true;
                    } else {
                        $scope.IsPermission = true;
                    }
                }


                dataserviceProject.getListFundFiles($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    $scope.listFundFile = rs;
                });
                dataserviceProject.getAetRelativeChil($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    var list = [];
                    for (var i = 0; i < rs.length; i++) {
                        list.push(rs[i].Total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    }
                    $scope.totalChild = list.join(" - ");
                });

                if ($scope.model.ObjType != "") {
                    dataserviceProject.getObjCode($scope.model.ObjType, function (rs) {
                        rs = rs.data;
                        $scope.listObjCode = rs;
                    });
                }
            }
            if ($scope.IsPermission == true || rs[0].IsPlan == true) {

                $scope.disableAetRelative = true;
            }
        });

        dataserviceProject.getGetCatName(function (rs) {
            rs = rs.data;
            $rootScope.listCatName = rs;
        });

        dataserviceProject.getListTitle(function (rs) {
            rs = rs.data;
            $rootScope.listTitle = rs;
        });
        dataserviceProject.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
        });
        dataserviceProject.getObjDependency(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceProject.getObjCode("PROJECT", function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });
        dataserviceProject.getListCurrency(function (rs) {
            rs = rs.data;

            $scope.listCurrency = rs;
        });
    }

    $scope.isTotal = false;
    $scope.openLog = function () {
        dataserviceProject.getUpdateLog($scope.model.AetCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/showLog.html',
                controller: 'showLog',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () { });
        });
    }
    $scope.initData();
    $scope.updateAccTracking = function () {
        if (validationManager($scope.model.Action).Status == false) {
            dataserviceProject.insertAccEntryTracking($scope.model.AetCode, $scope.model.Action, $scope.model.Note, $scope.model.AetRelative, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
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
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editformpayment.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;
            dataserviceProject.updatePayment($scope.model, function (rs) {
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
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "CatCode" && $scope.model.CatCode != "") {
            $scope.errorCatCode = false;
        } else if (SelectType == "CatCode") {
            $scope.errorCatCode = true;
        }
        if (SelectType == "AetType" && $scope.model.AetType != "") {
            $scope.errorAetType = false;
        } else if (SelectType == "AetType") {
            $scope.errorAetType = true;
        }

        if (SelectType == "ObjType" && $scope.model.ObjType != "") {
            dataserviceProject.getObjCode(item.Code, function (rs) {
                rs = rs.data;
                $scope.listObjCode = rs;
            });
        }
    }
    $scope.deleteObjType = function () {
        $scope.model.ObjType = null;
        $scope.model.ObjCode = null;
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //initAutocomplete();
        //Yêu cầu từ ngày --> đến ngày
        $("#DeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#DeadLine .input-date').valid()) {
                $('#DeadLine .input-date').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#DeadLine').datepicker('setEndDate', null);
            }
        });
        //$('#DeadLine').datepicker('setEndDate', new Date());
    });
});
app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
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

            dataserviceProject.getAddress(point.lat, point.lng, function (rs) {
                rs = rs.data;
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

app.controller('projectTabTeam', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.model = {
        TeamCode: ''
    }

    $scope.errorTeamCode = false;
    $scope.teams = [];
    $scope.AddTeams = [];
    $scope.initLoad = function () {
        dataserviceProject.getAllTeam(function (rs) {
            rs = rs.data;
            $scope.teams = rs;
        });
        dataserviceProject.getTeamInProject($rootScope.ProjectCode, function (rs) {
            rs = rs.data;
            $scope.AddTeams = rs;
        });
    }
    $scope.initLoad();

    $scope.add = function () {
        if (!$scope.changeSelect()) {
            var index = -1;
            for (indx = 0; indx < $scope.AddTeams.length; ++indx) {
                if ($scope.AddTeams[indx].TeamCode == $scope.model.TeamCode) {
                    index = indx;
                    break;
                }
            }
            if (index > -1) {
                App.toastrError(caption.PROJECT_MSG_TEAM_EXIST);
            }
            else {
                for (indx = 0; indx < $scope.teams.length; ++indx) {
                    if ($scope.teams[indx].TeamCode == $scope.model.TeamCode) {
                        var data = $scope.teams[indx];
                        data.ProjectCode = $rootScope.ProjectCode;
                        dataserviceProject.addTeam(data, function (rs) {
                            rs = rs.data;
                            if (rs.Error == false) {
                                $scope.AddTeams.push($scope.teams[indx]);
                            }
                            else {
                                App.toastrError(rs.Title);
                            }
                        });
                        break;
                    }
                }
            }
        }
    }
    $scope.changeSelect = function () {
        var error = false;

        if ($scope.model.TeamCode == '') {
            $scope.errorTeamCode = true;
            error = true;
        } else {
            $scope.errorTeamCode = false;
        }

        return error;
    }
    $scope.removeTeam = function (indx) {
        var data = {
            ProjectCode: $rootScope.ProjectCode,
            TeamCode: $scope.AddTeams[indx].TeamCode
        }
        dataserviceProject.deleteTeam(data, function (rs) {
            rs = rs.data;
            if (rs.Error == false) {
                $scope.AddTeams.splice(indx, 1);
            }
            else {
                App.toastrError(msg.Title);
            }
        });

    }
});

app.controller('projectTabCardJob', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter, $confirm) {
    var vm = $scope;
    $scope.model = {
        ProjectId: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableCardJob",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contact-main",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;

            },
            complete: function () {
                App.unblockUI("#contact-main");
                heightTableManual(250, "#tblDataCardJobProject");
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
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("CardID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.CardID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.CardID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardCode').withTitle('{{ "PROJECT_LIST_COL_TAB_CARDJOB_CARD_CODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardName').withTitle('{{ "PROJECT_LIST_COL_TAB_CARDJOB_CARD_NAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withTitle('{{ "PROJECT_LIST_COL_TAB_CARDJOB_BEGIN_TIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{ "PROJECT_LIST_COL_TAB_CARDJOB_END_TIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{ "PROJECT_LIST_COL_TAB_CARDJOB_STATUS" | translate }}').renderWith(function (data, type) {
        if (data == '') {
            return '<span class="text-danger">Đang chờ</span>';
        } else {
            return '<span class="text-success">' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Completed').withTitle('{{ "PROJECT_LIST_COL_TAB_CARDJOB_COMPLATED" | translate }}').renderWith(function (data, type) {
        if (data == '0.00') {
            return '<span class="text-danger">' + data + '</span>';
        } else {
            return '<span class="text-success">' + data != "" ? $filter('currency')(data, '', 0) : null + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{ "PROJECT_LIST_COL_TAB_CARDJOB_COST" | translate }}').renderWith(function (data, type) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListName').withTitle('{{ "PROJECT_LIST_COL_TAB_CARDJOB_LIST_NAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoardName').withTitle('{{ "PROJECT_LIST_COL_TAB_CARDJOB_BOARD_NAME" | translate }}').renderWith(function (data, type) {
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

app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"PROJECT_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"PROJECT_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"PROJECT_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"PROJECT_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"PROJECT_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"PROJECT_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
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
        dataserviceProject.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.PROJECT_CURD_MSG_SETTING_NOT_BLANK);
        } else {
            dataserviceProject.insertCommonSetting($scope.model, function (rs) {
                rs = rs.data;
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
            App.toastrError(caption.PROJECT_CURD_MSG_DATA_NOT_BLANK)
        } else {
            dataserviceProject.updateCommonSetting($scope.model, function (rs) {
                rs = rs.data;
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
                    dataserviceProject.deleteCommonSetting(id, function (rs) {
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

app.controller('add_group_or_team', function ($scope, $rootScope, $cookies, $compile, $uibModal, $filter, dataserviceProject) {
    $scope.model = {};
    var id = -1;
    var obj = {
        CardCode: 975,
        Type: 1
    };

    $scope.cardMember = {
        listObj: [],
        listMember: []
    };
    $scope.listTeamAndGroupUser = [];
    $scope.listDeleteObj = [];
    $scope.listDeleteMember = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataserviceProject.getTeamAndGroupUserAssign(obj.CardCode, function (rs) {
            rs = rs.data;
            $scope.cardMember.listObj = rs;
        });
        dataserviceProject.getMemberAssign(obj.CardCode, function (rs) {
            rs = rs.data;
            $scope.cardMember.listMember = rs;
        });
        dataserviceProject.getListTeams(function (team) {
            dataserviceProject.getGroupUser(function (groupUser) {
                var all = {
                    Code: 'All',
                    Name: 'Tất cả người dùng',
                    Type: 3,
                    Group: 'Người dùng'
                }
                $scope.listTeamAndGroupUser.push(all);
                var listTeamAndGroupUser = obj.Type == 1 ? team.concat(groupUser) : groupUser.concat(team);
                for (var i = 0; i < listTeamAndGroupUser.length; i++) {
                    $scope.listTeamAndGroupUser.push(listTeamAndGroupUser[i]);
                }
            })
        });
        dataserviceProject.getActivityAssign(obj.CardCode, function (rs) {
            rs = rs.data;
            $scope.ActivityData = rs;
        });
    };
    $scope.initData();

    $scope.teamOrGroupSelect = function (obj) {
        if (obj.Type == 1) {
            dataserviceProject.getMemberInTeam(obj.Code, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        } else if (obj.Type == 2) {
            dataserviceProject.getListUserInGroupUser(obj.Code, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        } else {
            dataserviceProject.getListUser(function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        }
        $scope.isCheckAll = false;
        ////check Exist
        //for (var i = 0; i < $scope.cardMember.listTeam.length; i++) {
        //    if ($scope.cardMember.listTeam[i].TeamCode === item.TeamCode) {
        //        App.toastrError(caption.CJ_CURD_MSG_TEAM_EXITED);//Team đã tồn tại!
        //        return;
        //    }
        //}

        //check exist user in team
        //var listMemberInTeam = item.Members.split(',');
        //for (var i = 0; i < listMemberInTeam.length; i++) {
        //    for (var j = 0; j < $scope.cardMember.listMember.length; j++) {
        //        if ($scope.cardMember.listMember[j].UserId == listMemberInTeam[i]) {
        //            $scope.cardMember.listMember.splice(j, 1);
        //            break;
        //        }
        //    }
        //}
        //var obj = {
        //    Id: id--,
        //    TeamCode: item.Code,
        //    TeamName: item.Name,
        //    //Members: item.Members,
        //    CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
        //}
        //$scope.cardMember.listTeam.push(obj);

        ////remove member in list
        //for (var i = 0; i < $scope.listTeam.length; i++) {
        //    if ($scope.listTeam[i].TeamCode === item.TeamCode) {
        //        $scope.listTeam.splice(i, 1);
        //        break;
        //    }
        //}
    };

    $scope.teamOrGroupSelectAll = function (isCheck, obj) {
        if (isCheck) {
            if (obj.Type == 1 || obj.Type == 2) {
                var checkExist = $scope.cardMember.listObj.filter(function (objObject, index) { return objObject.Code == obj.Code; });
                if (checkExist.length != 0) {
                    App.toastrError(checkExist[0].Name + caption.PROJECT_MSG_ASSIGNED_WORK);
                    return;
                }
                var item = {
                    Id: id--,
                    Code: obj.Code,
                    Name: obj.Name,
                    Type: obj.Type,
                    CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
                }
                $scope.cardMember.listObj.push(item);
                if (obj.Type == 1) {
                    App.toastrSuccess(caption.PROJECT_MSG_ADD_GROUP_SUCCESS);
                } else {
                    App.toastrSuccess(caption.PROJECT_MSG_ADD_DEPART_SUCCESS);
                }
            } else {
                for (var i = 0; i < $scope.listUser.length; i++) {
                    //add member
                    var obj = {
                        Id: id--,
                        UserId: $scope.listUser[i].UserId,
                        GivenName: $scope.listUser[i].GivenName,
                        CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
                    }
                    $scope.cardMember.listMember.push(obj);
                }
                App.toastrSuccess(caption.PROJECT_MSG_ADD_EMP_SUCCESS);
            }
        } else {

        }

        //check exist user in team
        //var listMemberInTeam = item.Members.split(',');



        ////remove member in list
        //for (var i = 0; i < $scope.listTeam.length; i++) {
        //    if ($scope.listTeam[i].TeamCode === item.TeamCode) {
        //        $scope.listTeam.splice(i, 1);
        //        break;
        //    }
        //}
    };
    $scope.memberSelect = function (item) {
        //check Exist member
        for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
            if ($scope.cardMember.listMember[i].UserId === item.UserId) {
                App.toastrError(caption.PROJECT_MSG_MEMBER_ASSIGNED);//Thành viên đã tồn tại!
                return;
            }
        }

        ////check member exist in team
        //for (var i = 0; i < $scope.cardMember.listTeam.length; i++) {
        //    var listMember = $scope.cardMember.listTeam[i].Members.split(',');
        //    var checkExistUser = listMember.find(function (element) {
        //        if (element == item.UserId) return true;
        //    });
        //    if (checkExistUser) {
        //        App.toastrError("Thành viên đã giao trong nhóm");
        //        return;
        //    }
        //}
        //add member
        var obj = {
            Id: id--,
            UserId: item.UserId,
            GivenName: item.GivenName,
            CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
        }
        $scope.cardMember.listMember.push(obj);
        for (var i = 0; i < $scope.listUser.length; i++) {
            if ($scope.listUser[i].UserId == item.UserId) {
                $scope.listUser.splice(i, 1);
                break;
            }
        }
    };
    $scope.removeMember = function (userId, id) {
        for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
            if ($scope.cardMember.listMember[i].UserId == userId) {
                $scope.cardMember.listMember.splice(i, 1);
                if (id > 0) {
                    $scope.listDeleteMember.push(id);
                }
                break;
            }
        }
    };
    $scope.removeObj = function (code, id) {
        for (var i = 0; i < $scope.cardMember.listObj.length; i++) {
            if ($scope.cardMember.listObj[i].Code == code) {
                $scope.cardMember.listObj.splice(i, 1);
                $scope.isCheckAll = false;
                if (id > 0) {
                    $scope.listDeleteObj.push(id);
                }
                break;
            }
        }
    }

    $scope.submit = function () {
        var data = { cardcode: obj.CardCode, listObj: $scope.cardMember.listObj, listDeletedObj: $scope.listDeleteObj, listmember: $scope.cardMember.listMember, listDeleteMember: $scope.listDeleteMember };
        console.log(data);
        dataserviceProject.assignGroupOrTeam(data, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.cancel();
            }
        });
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('googleMapCustomer', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
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
        var center = ol.proj.transform([$rootScope.lngCustomerDefault, $rootScope.latCustomerDefault], 'EPSG:4326', 'EPSG:3857');
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
    function initData() {
        //init
        if (para) {
            lat = para.lt != '' ? para.lt : $rootScope.latCustomerDefault;
            lng = para.lg != '' ? para.lg : $rootScope.lngCustomerDefault;
            address = para.lg != '' ? para.address : $rootScope.addressCustomerDefault;
            document.getElementById("startPlace").value = address;
        } else {
            lat = $rootScope.latCustomerDefault;
            lng = $rootScope.lngCustomerDefault;
            address = $rootScope.addressCustomerDefault;
            document.getElementById("startPlace").value = $rootScope.addressCustomerDefault;
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

            dataserviceProject.getAddress(point.lat, point.lng, function (rs) {
                rs = rs.data;
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
    setTimeout(function () {
        initData();
        setHeightMap();
        setModalDraggable('.modal-dialog');
    }, 200)
});


app.controller('addImpProduct', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
    $scope.model = {
        CusCode: '',
        SupCode: '',
        PoCode: '',
        ReqCode: '',
        ProjectCode: '',
        ListProductDetail: []
    }
    //
    $scope.isTex = false;
    $rootScope.PoSupCode = '';
    $rootScope.listProducts = [];
    $scope.IsDisablePoCode = true;
    $scope.isShowHeader = true;
    $scope.isShowDetailProject = false;
    $rootScope.customerType = "LE";
    $rootScope.Budget = 0;
    $rootScope.RealBudget = 0;
    $rootScope.ContractId = -1;
    //$rootScope.ContractCode = "";
    $scope.products = [];
    $scope.ListPoCus = [];
    $scope.forms = {};
    $scope.status = [];
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.changeCustomer = function () {
        $scope.model.CusAddress = "";
        $scope.model.CusZipCode = "";
        $scope.model.CusMobilePhone = "";
        $scope.model.CusPersonInCharge = "";
        $scope.model.CusEmail = "";

        var customer = $rootScope.MapCustomer[$scope.model.CusCode];
        if (customer != undefined) {
            $scope.model.CusAddress = customer.Address;
            $scope.model.CusZipCode = customer.ZipCode;
            $scope.model.CusMobilePhone = customer.MobilePhone;
            $scope.model.CusPersonInCharge = customer.PersonInCharge;
            $scope.model.CusEmail = customer.Email;
        }
    }

    $scope.changeSupplier = function () {
        $scope.model.SupAddress = "";
        $scope.model.SupEmail = "";
        $scope.model.SupZipCode = "";
        $scope.model.SupMobilePhone = "";
        $scope.model.SupPersonInCharge = "";

        var supplier = $rootScope.MapSupplier[$scope.model.SupCode];
        //console.log(supplier);
        if (supplier != undefined) {
            $scope.model.SupAddress = supplier.Address;
            $scope.model.SupMobilePhone = supplier.MobilePhone;
            $scope.model.SupEmail = supplier.Email;
            var list = supplier.ListExtend;
            if (list != null) {
                for (var i in list) {
                    var item = list[i];
                    if (item.ext_code == "ZIP_CODE") {
                        $scope.model.SupZipCode = item.ext_value;
                    }
                    if (item.ext_code == "PERSON_IN_CHARGE") {
                        $scope.model.SupPersonInCharge = item.ext_value;
                    }
                }
            }
        }
    }

    function initData() {
        dataserviceProject.getImpStatus(function (rs) {
            rs = rs.data;
            $scope.status = rs;
            $scope.model.Status = $scope.status[0].Code;
        });

        dataserviceProject.getListPoProduct('', function (result) {
            result = result.data;
            $scope.ListPoCus = result;
        });
        dataserviceProject.genReqCode(function (result) {
            result = result.data;
            $scope.model.ReqCode = result;
            $rootScope.ReqCode = result;
        });
        dataserviceProject.genTitle(para, function (result) {
            result = result.data;
            $scope.model.Title = result;
        });
        var today = new Date(new Date());
        $scope.model.sCreatedTime = $filter('date')(new Date(today), 'dd/MM/yyyy hh:mm:ss');
        $rootScope.CreatedTime = $scope.model.sCreatedTime;
        $scope.model.ProjectCode = para;

        $scope.model.CusCode = $rootScope.CustomerCode;

        if ($scope.model.CusCode != '' || $scope.model.CusCode != null)
            $scope.changeCustomer();

        //dataserviceProject.getContractFromProject($scope.model.ProjectCode, function (result) {result=result.data;
        //    $scope.model.PoCode = result;
        //});
        dataserviceProject.getListProduct($scope.model.ProjectCode, function (result) {
            result = result.data;
            $rootScope.listProducts = result;
        });
        dataserviceProject.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
        });
    }
    initData();

    $scope.chkContract = function () {
        if ($rootScope.ContractCode == '') {
            App.toastrError(caption.PROJECT_MSG_CREATE_CONTRACT_FIRST);//Vui lòng tạo trước hợp đồng!
        }
    }

    $scope.changleSelect = function (SelectType, Item) {
        if (SelectType == "PoCode" && $scope.model.PoCode != "") {
            $scope.errorPoCode = false;

            setTimeout(function () {
                $rootScope.loadDateJTable();
            }, 200);

            $scope.model.CusCode = Item.CusCode;
            if ($scope.model.CusCode != '' || $scope.model.CusCode != null)
                $scope.changeCustomer();
            dataserviceProject.getListProduct($scope.model.PoCode, function (result) {
                result = result.data;
                $rootScope.listProducts = result;
            });
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        //if (data.PoCode == "" || data.PoCode == null) {
        //    $scope.errorPoCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorPoCode = false;
        //}
        return mess;
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.forms.addform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.ListProductDetail = $rootScope.listProducts;
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmAdd.html',
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.PROJECT_MSG_ADD_RQ_IMP_PORD
                    $scope.ok = function () {
                        dataserviceProject.insertImpProduct(para, function (result) {
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
                $rootScope.ReqCode = $scope.model.ReqCode;
            }, function () {
            });
        }
    }

    $rootScope.amountbudget = function (objInput) {
        $scope.model.Budget = objInput.Budget;
        $scope.modelView.BudgetTotalDetail = objInput.RealBudget;
        $scope.modelView.TaxTotalDetail = objInput.TaxDetail;
    }

    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $scope.model.PoSupCode;
                }
            },
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.resetCustomer = function () {
        $scope.model.CusAddress = "";
        $scope.model.CusZipCode = "";
        $scope.model.CusMobilePhone = "";
        $scope.model.CusPersonInCharge = "";
        $scope.model.CusEmail = "";
    }
    $scope.resetSupplier = function () {
        $scope.model.SupAddress = "";
        $scope.model.SupMobilePhone = "";
        $scope.model.SupEmail = "";
        $scope.model.SupZipCode = "";
        $scope.model.SupPersonInCharge = "";
    }
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        $("#DateOfOrder").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#EstimateTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            $scope.model.sEstimateTime = new Date(selected.date.valueOf());
            if ($scope.model.sEstimateTime == "" || $scope.model.sEstimateTime == null || $scope.model.sEstimateTime == undefined) {
                $scope.errorsEstimateTime = true;
            } else {
                $scope.errorsEstimateTime = false;
            }
        });

        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
        });
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.ShowHeader = function () {
        if ($scope.isTex == false) {
            $scope.isShowHeader = true
            $scope.isShowDetailProject = false;
        }
        else {
            $scope.isShowHeader = false
            $scope.isShowDetailProject = true;

            setTimeout(function () {
                $rootScope.loadDateJTable();
            }, 200);
        }
    }
    $scope.openAttributeFormManager = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/attributeManager.html',
            controller: 'attributeManager',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return $scope.model.PoSupCode;
                }
            },
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    }
    $scope.addCommonSettingWHStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'IMP_STATUS',
                        GroupNote: 'Trạng thái Y/C đặt hàng',
                        AssetCode: 'WAREHOUSE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getImpStatus(function (rs) {
                rs = rs.data;
                $rootScope.status = rs;
            });
        }, function () { });
    }
});
app.controller('addProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.model = {
        ProductCode: '',
        ProductType: '',
        ProductTypeName: '',
        Catalogue: '',
        Quantity: 1,
        Unit: '',
        Currency: 'CURRENCY_VND',
        UnitPrice: 0,
        PoSupCode: '',
        ListProductDetail: [],
        ListDelProduct: []
    }
    $scope.listPoProduct = [];
    $scope.isExtend = false;
    $scope.isAdd = true;
    $scope.errorRateConversion = false;
    $scope.errorRateLoss = false;
    $scope.errorSupCode = false;
    $scope.isDisableProductCode = false;
    $scope.isDisableUnit = false;
    $scope.isDisableProductType = true;
    $scope.isDisableCatalogue = true;
    $scope.isDisableCurrency = false;
    //khách lẻ
    $scope.currencys = [
        {
            Code: 'JPY',
            Name: 'Yên'
        },
        {
            Code: 'VND',
            Name: 'VNĐ'
        },
        {
            Code: 'USD',
            Name: 'USD'
        }

    ];
    $scope.services = [];
    $rootScope.serviceCost = [];
    $scope.serviceCost = [];
    $scope.serviceTotalCost = [];
    $scope.serviceDetails = [];
    $rootScope.serviceJtable = {};
    $rootScope.map = {};
    $rootScope.excludeCondition = {};
    $scope.editId = -1;
    $rootScope.unExcludeCondition = {};
    $scope.add = function () {
        if ($rootScope.ReqCode != '') {
            $scope.isAdd = true;
            $scope.model.ReqCode = $rootScope.ReqCode;
            $scope.model.ListProductDetail = $rootScope.listProducts;
            dataserviceProject.insertDetail($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }
    $scope.edit = function (id) {
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (id == listdata[i].Id) {
                var count = 0;
                var data = listdata[i];

                $scope.model.Id = data.Id;
                $scope.model.ReqCode = data.ReqCode;
                $scope.model.ProductCode = data.ProductCode;
                $scope.model.Quantity = parseInt(data.Quantity);
                $scope.model.Unit = data.Unit;
                $scope.model.RateConversion = parseInt(data.RateConversion);
                $scope.model.RateLoss = parseInt(data.RateLoss);
                $scope.model.PoCount = data.PoCount;
                $scope.model.Note = data.Note;
                $scope.isDisableForm();
                break;
            }
        }
    }
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.editId = -1;
        $scope.removeDisableForm();
        $scope.model.Currency = '';
        $scope.model.Unit = '';
        $scope.model.UnitPrice = '';
        $scope.model.Catalogue = '';
        $scope.model.ProductTypeName = '';
        $scope.model.ProductCode = '';

    }
    $scope.save = function () {
        $scope.model.ReqCode = $rootScope.ReqCode;
        $scope.model.ListProductDetail = $rootScope.listProducts;
        for (var i = 0; i < $scope.model.ListProductDetail.length; i++) {
            if ($scope.model.ListProductDetail[i].SupCode == '' || $scope.model.ListProductDetail[i].SupCode == null || $scope.model.ListProductDetail[i].SupCode == undefined) {
                $scope.errorSupCode = true;
                break;
            } else {
                $scope.errorSupCode = false;
            }

            if ($scope.model.ListProductDetail[i].RateLoss == '' || $scope.model.ListProductDetail[i].RateLoss <= 0) {
                $scope.errorRateLoss = true;
                break;
            }
        }
        if (!$scope.errorRateConversion && !$scope.errorRateLoss && !$scope.errorSupCode) {

            dataserviceProject.updateDetail($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        } else {
            if ($scope.errorSupCode) {
                App.toastrError(caption.PROJECT_MSG_SELECT_SUPP_FOR_PROD);
                return;
            } else {
                if ($scope.errorRateConversion && $scope.errorRateLoss) {
                    App.toastrError(caption.PROJECT_MSG_RATE);
                    return;
                } else if ($scope.errorRateConversion) {
                    App.toastrError(caption.PROJECT_MSG_RATE_TRANSFER);
                    return;
                } else if ($scope.errorRateLoss) {
                    App.toastrError(caption.PROJECT_MSG_RATE_LOST);
                    return;
                }
            }
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceProject.deleteDetail(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(id);
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
            if ($scope.editId == d) {
                $scope.close();
            }

            $scope.reload();
        }, function () {
        });
    }
    $scope.changeService = function () {
        for (var i = 0; i < $scope.services.length; ++i) {
            if ($scope.services[i].Code == $scope.model.ServiceCode) {
                $scope.model.Unit = $scope.services[i].Unit;
                break;
            }
        }
        if ($scope.isExtend == true) {

            //lọc ra condition từ $rootScope.serviceCost
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            $scope.model.ServiceCondition = "";
            $scope.serviceCost = [];
            $scope.model.Range = "";
            $scope.model.UnitPrice = "";
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var data = $rootScope.serviceCost[i];
                    if (data.ServiceCode == $scope.model.ServiceCode && data.Condition != null && data.Condition != '' && data.Condition != undefined) {
                        var it = $rootScope.excludeCondition[data.Condition];
                        if (it == undefined) {
                            $scope.serviceConditions.push(data);

                        }
                    }
                }
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    $scope.serviceConditions[i].Code = $scope.serviceConditions[i].Condition;
                    $scope.serviceConditions[i].Name = $scope.serviceConditions[i].ConditionName;
                }
                console.log($scope.serviceConditions);
                var hasMap = {};
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    var item = $scope.serviceConditions[i];
                    hasMap[item.Code] = item;
                }
                $scope.serviceConditions = [];
                for (var i in hasMap) {
                    $scope.serviceConditions.push(hasMap[i]);
                }

            }
            if ($scope.serviceConditions.length == 0 && $scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                App.toastrWarning(caption.PROJECT_MSG_SERVICE_NO_CONDITION);
            }
        }
        else {
            //chưa làm
            $scope.changeExtend();
        }
    }
    $scope.changeCondition = function () {
        if ($rootScope.customerType == "LE") {
            var le = $scope.unExcludeCondition[1];
            if ($rootScope.ServiceConditionOld == "SERVICE_CONDITION_000") {
                if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                $scope.serviceDetails = [];
                $scope.model.UnitPrice = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.UnitPrice = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
        else if ($rootScope.customerType == "DAILY") {
            var daily = $scope.unExcludeCondition[3];
            if ($rootScope.ServiceConditionOld == daily) {
                if ($scope.model.ServiceCondition != daily) {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == daily) {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == daily) {
                $scope.serviceDetails = [];
                $scope.model.UnitPrice = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.UnitPrice = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
    }

    $scope.init = function () {
        dataserviceProject.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.currencys = rs;
        });
        dataserviceProject.getListUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceProject.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
        });
        dataserviceProject.getListProject(function (rs) {
            rs = rs.data;
            $scope.ListProjectCode = rs;
        });
    }
    $scope.filterCost = function () {
        if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
            if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                var data = null;
                if ($scope.serviceCost != null) {
                    for (var i = 0; i < $scope.serviceCost.length; ++i) {
                        var item = $scope.serviceCost[i];
                        if (item.Id == $scope.model.Range) {
                            data = item;
                            break;
                        }
                    }
                }
                if (data != null) {
                    console.log(data);
                    //if (data.Price >= 0) {
                    //    $scope.model.UnitPrice = data.Price;
                    //}

                    var isCheck = false;
                    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                        var item = $scope.serviceDetails[i];
                        if (item.ConditionName == data.ConditionName && item.ConditionRange == data.ConditionRange) {
                            isCheck = true;
                            break;
                        }
                    }
                    if (isCheck == false) {
                        $scope.serviceDetails.push(data);
                    }
                    else {
                        //App.toastrWarning("Bạn đã thêm ");
                    }

                    //    Condition: "SERVICE_CONDITION_002"
                    //ConditionName: "Khách hàng thi công"
                    //ConditionRange: "12 năm -> 25 năm"
                    $scope.operationCost();
                    console.log($scope.serviceDetails);
                }
                else {
                    App.toastrWarning(caption.PROJECT_MSG_NO_FILTER_COST);
                    $scope.model.UnitPrice = '';
                }

            }
            else {

            }
        }
    }
    $scope.operationCost = function () {
        $scope.model.UnitPrice = 0;
        // $scope.model.UnitPrice = data.Price;
        for (var i = 0; i < $scope.serviceDetails.length; ++i) {
            try {
                var item = $scope.serviceDetails[i];
                $scope.model.UnitPrice = $scope.model.UnitPrice + item.Price;
            }
            catch (ex) {

            }
        }
        // giảm giá

    }
    $scope.init();
    $scope.removeserviceDetails = function (indx) {
        $scope.serviceDetails.splice(indx, 1);
        $scope.operationCost();
    }
    $scope.getDescription = function () {
        var des = "";
        if ($scope.isExtend == false) {
            for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                var item = $rootScope.serviceCost[i];
                if ($rootScope.customerType == "LE") {
                    var code = $rootScope.unExcludeCondition[1];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
                else if ($rootScope.customerType == "DAILY") {
                    var code = $rootScope.unExcludeCondition[3];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
            }
        }
        else {
            for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
            }
        }
        //if ($scope.serviceDetails.length == 0) {
        //    for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
        //        var item = $rootScope.serviceCost[i];
        //        if (item.Condition == "SERVICE_CONDITION_000") {
        //            return item.Condition + "|";
        //        }
        //    }

        //}
        //else {
        //    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
        //        des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
        //    }
        //}
        return des;
    }

    $scope.changeExtend = function () {
        if ($scope.isExtend == true) {
            $scope.changeService();
        } else {
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i in $rootScope.excludeCondition) {
                    var item = $rootScope.excludeCondition[i];
                    if ($rootScope.customerType == "LE") {
                        if (item == 1) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.UnitPrice = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                    else if ($rootScope.customerType == "DAILY") {
                        if (item == 3) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.UnitPrice = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                }

            }
        }
    }
    $scope.selectProject = function () {
        $scope.listProduct = [];
        dataserviceProject.getListProduct($scope.model.ProjectCode, function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
    }
    var id = -1;
    $scope.addProduct = function () {
        var isProduct = false;
        if ($scope.model.ProductCode != "") {

            var obj = {
                Id: id--,
                ProductCode: $scope.model.ProductCode,
                ProductName: $scope.model.ProductName,
            }
            for (var i = 0; i < $rootScope.listProducts.length; i++) {
                if ($rootScope.listProducts[i].ProductCode == obj.ProductCode) {
                    App.toastrError(caption.PROJECT_MSG_PROD_IN_PRO);
                    isProduct = true;
                    break;
                }
            }
            if (isProduct == false) {
                $rootScope.listProducts.push(obj);
                for (var i = 0; i < $scope.model.ListDelProduct.length; i++) {
                    if (obj.ProductCode == $scope.model.ListDelProduct[i].ProductCode) {
                        $scope.model.ListDelProduct.splice(i, 1);
                    }
                }
            }
        } else {
            App.toastrError(caption.PROJECT_MSG_VALIDATE_CHOSE_PRODUCT);
        }

    }
    $scope.removeProduct = function (item) {
        for (var i = 0; i < $rootScope.listProducts.length; i++) {
            if ($rootScope.listProducts[i].ProductCode == item.ProductCode) {
                $rootScope.listProducts.splice(i, 1);
                App.toastrSuccess(caption.PROJECT_MSG_DEL_PROD_SUCCESS);
                var objDel = {
                    Id: id--,
                    ProductCode: item.ProductCode,
                    ProductName: item.ProductName,
                }
                $scope.model.ListDelProduct.push(objDel);
            }
        }
    }
    $scope.isDisableForm = function () {
        $scope.isDisableProductCode = true;
    }
    $scope.removeDisableForm = function () {
        $scope.isDisableProductCode = false;
    }
    //Action khi chọn 1 combobox
    $scope.changeRate = function (item) {
        var msg = { error: false, title: '' };

        if (item.RateConversion != '' && item.RateConversion > 0) {
            $scope.errorRateConversion = false;
        } else {
            msg.error = true;
            $scope.errorRateConversion = true;
            msg.title += "- Tỉ lệ quy đổi nhập số dương<br/>";
        }

        if (item.RateLoss != '' && item.RateLoss > 0) {
            $scope.errorRateLoss = false;
        } else {
            msg.error = true;
            $scope.errorRateLoss = true;
            msg.title += "- Tỉ lệ hao hụt nhập số dương<br/>";
        }

        if (!msg.error) {
            item.Quantity = Math.ceil(item.PoCount / item.RateConversion * item.RateLoss);
        } else {
            App.toastrError(msg.title);
        }
    }
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "ProductCode" && $scope.model.ProductCode != "") {
            if (SelectType == "ProductCode") {
                $scope.model.Unit = item.Unit;
                if (item.Unit != '')
                    $scope.errorUnit = false;
                $scope.model.UnitName = item.UnitName;
                $scope.model.ProductName = item.ProductName;
                $scope.model.ProductType = item.ProductType;
                $scope.model.ProductTypeName = item.ProductTypeName;
                $scope.model.Catalogue = item.Catalogue;
            }
            $scope.errorProductCode = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "") {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    };

    $rootScope.loadDateJTable = function () {
        var createdDate = $filter('date')($rootScope.CreatedTime, 'dd/MM/yyyy');
        $(".datePicker").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            startDate: createdDate,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
        });
    }

    setTimeout(function () {
        $rootScope.loadDateJTable();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('projectTabRequestAskPrice', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        //CustomerCode: '',
        Title: '',
        ContractCode: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableContract/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.ContractCode = $scope.model.ContractCode;
                d.ContractNo = $scope.model.ContractNo;
                d.Title = $scope.model.Title;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
    //.withOption('footerCallback', function (tfoot, data) {
    //    if (data.length > 0) {
    //        $scope.$apply(function () {
    //            $scope.totalBudgets = 0;
    //            $scope.currency = data[0].currency;
    //            $scope.totalBudgets = parseFloat(data[0].totalContract);
    //        });
    //    }
    //});
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_CONTRACTCODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('no').withTitle('{{ "PROJECT_LIST_COL_NUM_CONTRACT" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusName').withTitle('{{ "PROJECT_LIST_COL_CUS" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('title').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_TITLE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('effectiveDate').withTitle('{{"PROJECT_LIST_COL_DATE_EFFECT" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_BUDGET" | translate }}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data, '', 0) + "</span>" : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('currency').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_CURRENCY" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budget').withTitle('{{"PROJECT_LIST_COL_TRANSFER_VND" | translate}}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data, '', 0) + "</span>" : null;
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
    //$scope.initLoad = function () {
    //    var userModel = {};
    //    var listdata = $('#tblDataIndex').DataTable().data();
    //    for (var i = 0; i < listdata.length; i++) {
    //        if (listdata[i].id == $rootScope.Object.SupplierId) {
    //            userModel = listdata[i];
    //            break;
    //        }
    //    }
    //    $scope.model.CustomerCode = userModel.cusCode;
    //}
    //$scope.initLoad();
});

app.controller('contract', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        //CustomerCode: '',
        Title: '',
        ContractCode: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableContract/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.ContractCode = $scope.model.ContractCode;
                d.ContractNo = $scope.model.ContractNo;
                d.Title = $scope.model.Title;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
    //.withOption('footerCallback', function (tfoot, data) {
    //    if (data.length > 0) {
    //        $scope.$apply(function () {
    //            $scope.totalBudgets = 0;
    //            $scope.currency = data[0].currency;
    //            $scope.totalBudgets = parseFloat(data[0].totalContract);
    //        });
    //    }
    //});
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_CONTRACTCODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('no').withTitle('{{ "PROJECT_LIST_COL_NUM_CONTRACT" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusName').withTitle('{{ "PROJECT_LIST_COL_CUS" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('title').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_TITLE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('effectiveDate').withTitle('{{"PROJECT_LIST_COL_DATE_EFFECT" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_BUDGET" | translate }}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data, '', 0) + "</span>" : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('currency').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_CURRENCY" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budget').withTitle('{{"PROJECT_LIST_COL_TRANSFER_VND" | translate}}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data, '', 0) + "</span>" : null;
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
    //$scope.initLoad = function () {
    //    var userModel = {};
    //    var listdata = $('#tblDataIndex').DataTable().data();
    //    for (var i = 0; i < listdata.length; i++) {
    //        if (listdata[i].id == $rootScope.Object.SupplierId) {
    //            userModel = listdata[i];
    //            break;
    //        }
    //    }
    //    $scope.model.CustomerCode = userModel.cusCode;
    //}
    //$scope.initLoad();
});

app.controller('projectTabRequestImportProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.model = {
        Id: 0,
        ObjCode: '',
        ObjRelative: '',
        ObjNote: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JtableRequestImportProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProjectRQImportProduct");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                    $scope.model.Id = 0;
                    $scope.resetSelect();
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                        $scope.model.Id = 0;
                        $scope.resetSelect();
                    } else {
                        $('#tblDataProjectRQImportProduct').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                        $scope.getItem(data);
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjCode').withTitle('{{"PROJECT_LIST_COL_RQ_CODE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"PROJECT_CURD_TAB_CONTRACT_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"PROJECT_LIST_COL_CUS_BUILD" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"PROJECT_LIST_COL_SENDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"PROJECT_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="Xóa" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.init = function () {
        dataserviceProject.getRqImpProduct(function (rs) {
            rs = rs.data;
            $scope.listRqImpProduct = rs;
        })
        dataserviceProject.getObjectRelative(function (rs) {
            rs = rs.data;
            $scope.listRelative = rs;
        })
    }
    $scope.init();
    $scope.changleSelect = function (selectType) {
        if (selectType == "ObjCode" && $scope.model.ObjCode != "") {
            $scope.errorObjCode = false;
        }
        if (selectType == "ObjRelative" && $scope.model.ObjRelative != "") {
            $scope.errorObjRelative = false;
        }
    }
    $scope.add = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.insertRequestImportProduct($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.getItem = function (item) {
        $scope.model.Id = item.Id;
        $scope.model.ObjCode = item.ObjCode;
        $scope.model.ObjRelative = item.ObjRelative;
        $scope.model.ObjNote = item.ObjNote;
    }
    $scope.update = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.updateRequestImportProduct($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    $scope.resetSelect();
                }
            })
        }
    }
    $scope.delete = function (id) {
        dataserviceProject.deleteRequestImportProduct(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadData(true);
                $scope.resetSelect();
            }
        })
    }
    $scope.resetSelect = function () {
        $scope.model.Id = 0;
        $scope.model.ObjCode = '';
        $scope.model.ObjRelative = '';
        $scope.model.ObjNote = '';
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.ObjCode == "") {
            $scope.errorObjCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjCode = false;
        }
        if (data.ObjRelative == "") {
            $scope.errorObjRelative = true;
            mess.Status = true;
        } else {
            $scope.errorObjRelative = false;
        }
        return mess;
    }
});

app.controller('projectTabContractPo', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.model = {
        Id: 0,
        ObjCode: '',
        ObjRelative: '',
        ObjNote: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JtableContractPoBuyer",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProjectContractPo");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                    $scope.model.Id = 0;
                    $scope.resetSelect();
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                        $scope.model.Id = 0;
                        $scope.resetSelect();
                    } else {
                        $('#tblDataProjectContractPo').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                        $scope.getItem(data);
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjCode').withTitle('{{"PROJECT_MSG_LIST_COL_TICKETCODE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"PROJECT_LIST_COL_TYPE" | translate}}').renderWith(function (data, type) {
        if (data == "STORAGE") {
            return "Lưu kho";
        } else {
            return "Đơn hàng theo khách hàng";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrderBy').withTitle('{{"PROJECT_LIST_COL_CUS_RQ_PROD" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Consigner').withTitle('{{"PROJECT_LIST_COL_SENDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"PROJECT_LIST_COL_SUPP" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"PROJECT_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="Xóa" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.init = function () {
        dataserviceProject.getContractPoBuyer(function (rs) {
            rs = rs.data;
            $scope.listContractBuy = rs;
        })
        dataserviceProject.getObjectRelative(function (rs) {
            rs = rs.data;
            $scope.listRelative = rs;
        })
    }
    $scope.init();
    $scope.changleSelect = function (selectType) {
        if (selectType == "ObjCode" && $scope.model.ObjCode != "") {
            $scope.errorObjCode = false;
        }
        if (selectType == "ObjRelative" && $scope.model.ObjRelative != "") {
            $scope.errorObjRelative = false;
        }
    }
    $scope.add = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.insertContractPoBuyer($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }

    }
    $scope.getItem = function (item) {
        $scope.model.Id = item.Id;
        $scope.model.ObjCode = item.ObjCode;
        $scope.model.ObjRelative = item.ObjRelative;
        $scope.model.ObjNote = item.ObjNote;
    }
    $scope.update = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.updateContractPoBuyer($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    $scope.resetSelect();
                }
            })
        }
    }
    $scope.delete = function (id) {
        dataserviceProject.deleteContractPoBuyer(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadData(true);
                $scope.resetSelect();
            }
        })
    }
    $scope.resetSelect = function () {
        $scope.model.Id = 0;
        $scope.model.ObjCode = '';
        $scope.model.ObjRelative = '';
        $scope.model.ObjNote = '';
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.ObjCode == "") {
            $scope.errorObjCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjCode = false;
        }
        if (data.ObjRelative == "") {
            $scope.errorObjRelative = true;
            mess.Status = true;
        } else {
            $scope.errorObjRelative = false;
        }
        return mess;
    }
});

app.controller('projectTabContractSale', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.model = {
        Id: 0,
        ObjCode: '',
        ObjRelative: '',
        ObjNote: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JtableContractSale",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProjectContractSale");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                    $scope.model.Id = 0;
                    $scope.resetSelect();
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                        $scope.model.Id = 0;
                        $scope.resetSelect();
                    } else {
                        $('#tblDataProjectContractSale').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                        $scope.getItem(data);
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"PROJECT_CURD_TAB_CUSTOMER_LIST_COL_CUSNAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractNo').withTitle('{{"PROJECT_LIST_COL_NUM_CONTRACT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndDate').withTitle('{{"PROJECT_LIST_COL_CONTRACT_DEADLINE" | translate}}').renderWith(function (data, type) {
        var deadLine = '';
        if (data == '') {
            deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Không đặt thời hạn</span>'
        } else {
            var created = new Date(data);
            var diffMs = (created - new Date());
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5 bold">Đã quá hạn</span>';
            } else if ((diffDay + 1) < 8) {
                deadLine = '<span class="badge-customer badge-customer-warning">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else if ((diffDay + 1) < 16) {
                deadLine = '<span class="badge-customer badge-customer-success">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                deadLine = '<span class="badge-customer badge-customer-success fs9">Còn ' + (diffDay + 1) + ' ngày</span>'
            }
        }
        return '<div class="pt5">' + deadLine +
            '</div> ';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"PROJECT_LIST_COL_CONTENT_CONTRACT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BudgetExcludeTax').withTitle('{{"PROJECT_LIST_COL_VALUE" | translate}}').renderWith(function (data, type) {
        var exTax = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + exTax + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BudgetExcludeTax').withTitle('{{"PROJECT_LIST_COL_TRANSFER_VND" | translate}}').renderWith(function (data, type, full) {
        if (data != "" && full.ExchangeRate != "") {
            var rs = data * full.ExchangeRate;
            var tax = data != "" && full.ExchangeRate != "" ? $filter('currency')(rs, '', 0) : null;
            return '<span class="text-danger bold">' + tax + '</span>';
        }
        else {
            return null;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="Xóa" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.init = function () {
        dataserviceProject.getContractSale(function (rs) {
            rs = rs.data;
            $scope.listContractSale = rs;
        })
        dataserviceProject.getObjectRelative(function (rs) {
            rs = rs.data;
            $scope.listRelative = rs;
        })
    }
    $scope.init();
    $scope.changleSelect = function (selectType) {
        if (selectType == "ObjCode" && $scope.model.ObjCode != "") {
            $scope.errorObjCode = false;
        }
        if (selectType == "ObjRelative" && $scope.model.ObjRelative != "") {
            $scope.errorObjRelative = false;
        }
    }
    $scope.add = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.insertContractSale($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.getItem = function (item) {
        $scope.model.Id = item.Id;
        $scope.model.ObjCode = item.ObjCode;
        $scope.model.ObjRelative = item.ObjRelative;
        $scope.model.ObjNote = item.ObjNote;
    }
    $scope.update = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.updateContractSale($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    $scope.resetSelect();
                }
            })
        }
    }
    $scope.delete = function (id) {
        dataserviceProject.deleteContractSale(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadData(true);
                $scope.resetSelect();
            }
        })
    }
    $scope.resetSelect = function () {
        $scope.model.Id = 0;
        $scope.model.ObjCode = '';
        $scope.model.ObjRelative = '';
        $scope.model.ObjNote = '';
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.ObjCode == "") {
            $scope.errorObjCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjCode = false;
        }
        if (data.ObjRelative == "") {
            $scope.errorObjRelative = true;
            mess.Status = true;
        } else {
            $scope.errorObjRelative = false;
        }
        return mess;
    }
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