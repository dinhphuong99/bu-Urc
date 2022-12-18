var ctxfolder = "/views/admin/CardJob";
var app = angular.module('App_ESEIM', ["ui.sortable", "my.popover", "my.tooltip", "ngCookies", "ngSanitize", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate", 'dynamicNumber']).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        };
    });
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
    };
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        $http(req).success(callback);
    };
    return {
        getBoardsType: function (callback) {
            $http.post('/Admin/CardJob/GetBoardsType/').success(callback);
        },
        getBoards: function (callback) {
            $http.post('/Admin/CardJob/GetBoards/').success(callback);
        },
        insertBoard: function (data, callback) {
            $http.post('/Admin/CardJob/InsertBoard/', data).success(callback);
        },
        getBoardDetail: function (data, callback) {
            $http.post('/Admin/CardJob/GetBoardDetail/?BoardCode=' + data).success(callback);
        },
        deleteBoard: function (data, callback) {
            $http.post('/Admin/CardJob/DeleteBoard/' + data).success(callback)
        },
        updateBoard: function (data, callback) {
            $http.post('/Admin/CardJob/EditBoard/', data).success(callback);
        },
        getLists: function (data, callback) {
            $http.post('/Admin/CardJob/GetLists/?BoardCode=' + data).success(callback);
        },
        insertList: function (data, callback) {
            $http.post('/Admin/CardJob/InsertList/', data).success(callback);
        },
        deleteList: function (data, callback) {
            $http.post('/Admin/CardJob/DeleteList/' + data).success(callback);
        },
        updateListName: function (listId, newName, callback) {
            $http.post('/Admin/CardJob/UpdateListName/?ListID=' + listId + '&NewName=' + newName).success(callback);
        },
        updateOrder: function (Orther, Entry, callback) {
            $http.post('/Admin/CardJob/UpdateOrder/?Orther=' + Orther + '&Entry=' + Entry).success(callback);
        },
        changeListStatus: function (listID, statusCode, callback) {
            $http.post('/Admin/CardJob/ChangeListStatus/?ListID=' + listID + '&Status=' + statusCode).success(callback);
        },
        changeListBackground: function (data, callback) {
            $http.post('/Admin/CardJob/ChangeListBackground', data).success(callback);
        },
        changeListWeightNum: function (data, callback) {
            $http.post('/Admin/CardJob/ChangeListWeightNum', data).success(callback);
        },
        changeBoard: function (listID, boardCode, callback) {
            $http.post('/Admin/CardJob/ChangeBoard/?ListID=' + listID + '&BoardCode=' + boardCode).success(callback);
        },

        getProjectContract: function (type, callback) {
            $http.post('/Admin/CardJob/GetContractProject/?Type=' + type).success(callback);
        },
        getExecutiveObjective: function (listCode, callback) {
            $http.post('/Admin/CardJob/GetExecutiveRelative/?ListCode=' + listCode).success(callback);
        },

        insertExecuteRelative: function (data, callback) {
            $http.post('/Admin/CardJob/InsertExecuteRelative/', data).success(callback);
        },

        addTeam: function (data, callback) {
            $http.post('/Admin/CardJob/InsertTeam/', data).success(callback);
        },
        getTeams: function (callback) {
            $http.post('/Admin/CardJob/GetTeams/').success(callback);
        },
        getTeam: function (TeamCode, callback) {
            $http.post('/Admin/CardJob/GetTeam/?TeamCode=' + TeamCode).success(callback);
        },
        deleteTeam: function (TeamCode, callback) {
            $http.post('/Admin/CardJob/DeleteTeam/?TeamCode=' + TeamCode).success(callback);
        },
        getTeamMember: function (TeamCode, callback) {
            $http.post('/Admin/CardJob/GetTeamMember/?TeamCode=' + TeamCode).success(callback);
        },
        editTeam: function (data, callback) {
            $http.post('/Admin/CardJob/EditTeam/', data).success(callback);
        },

        getCards: function (data, callback) {
            $http.post('/Admin/CardJob/GetCards/?BoardCode=' + data).success(callback);
        },
        getCardsByList: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardsByList/?ListCode=' + data).success(callback);
        },
        getCardDetail: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardDetail/?CardCode=' + data).success(callback);
        },
        insertCard: function (data, callback) {
            $http.post('/Admin/CardJob/InsertCard/', data).success(callback);
        },
        deleteCard: function (id, callback) {
            $http.post('/Admin/CardJob/DeleteCard/' + id).success(callback);
        },
        getLevels: function (callback) {
            $http.post('/Admin/CardJob/GetLevels/').success(callback);
        },
        getCardMember: function (CardCode, callback) {
            $http.post('/Admin/CardJob/GetCardMember/?CardCode=' + CardCode).success(callback);
        },
        getCardTeam: function (CardCode, callback) {
            $http.post('/Admin/CardJob/GetCardTeam/?CardCode=' + CardCode).success(callback);
        },
        changeWorkType: function (cardCode, type, callback) {
            $http.post('/Admin/CardJob/ChangeWorkType/?CardCode=' + cardCode + '&Type=' + type).success(callback);
        },
        changeCardStatus: function (cardCode, status, callback) {
            $http.post('/Admin/CardJob/ChangeCardStatus/?CardCode=' + cardCode + '&Status=' + status).success(callback);
        },
        changeCardLevel: function (cardCode, level, callback) {
            $http.post('/Admin/CardJob/ChangeCardLevel/?CardCode=' + cardCode + '&Level=' + level).success(callback);
        },
        changeCheckTitle: function (checkCode, title, callback) {
            $http.post('/Admin/CardJob/ChangeCheckTitle/?CheckCode=' + checkCode + '&Title=' + title).success(callback);
        },
        sortListByStatus: function (boardCode, orther, callback) {
            $http.post('/Admin/CardJob/SortListByStatus/?BoardCode=' + boardCode + '&Orther=' + orther).success(callback);
        },
        getWorkType: function (callback) {
            $http.post('/Admin/CardJob/GetWorkType/').success(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/CardJob/GetStatus/').success(callback);
        },
        updateCardName: function (cardId, newName, callback) {
            $http.post('/Admin/CardJob/UpdateCardName/?CardID=' + cardId + '&NewName=' + newName).success(callback);
        },
        updateCardDescription: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateCardDescription', data).success(callback);
        },
        updateCardLabel: function (cardCode, label, callback) {
            $http.post('/Admin/CardJob/UpdateCardLabel/?CardCode=' + cardCode + "&Label=" + label).success(callback);
        },
        changeListCard: function (cardCode, listCode, callback) {
            $http.post('/Admin/CardJob/ChangeListCard/?CardCode=' + cardCode + "&ListCode=" + listCode).success(callback);
        },
        updateDueDate: function (cardCode, duedate, callback) {
            $http.post('/Admin/CardJob/UpdateDuedate/?CardCode=' + cardCode + '&Duedate=' + duedate).success(callback);
        },
        updateWeightNum: function (cardCode, weightNum, callback) {
            $http.post('/Admin/CardJob/UpdateWeightNum/?CardCode=' + cardCode + '&WeightNum=' + weightNum).success(callback);
        },

        addMember: function (data, callback) {
            $http.post('/Admin/CardJob/AddMember/', data).success(callback);
        },

        getMaxWeightNumCheckList: function (data, callback) {
            $http.post('/Admin/CardJob/GetMaxWeightNumCheckList/?CardCode=' + data).success(callback);
        },
        getCheckList: function (cardCode, callback) {
            $http.post('/Admin/CardJob/GetCheckLists/?CardCode=' + cardCode).success(callback);
        },
        addCheckList: function (cardCode, data, data1, callback) {
            $http.post('/Admin/CardJob/AddCheckList/?CardCode=' + cardCode + '&Title=' + data + '&WeightNum=' + data1).success(callback);
        },
        deleteCheckList: function (checkCode, callback) {
            $http.post('/Admin/CardJob/DeleteCheckList/?CheckCode=' + checkCode).success(callback);
        },


        addCheckItem: function (checkCode, data, data1, callback) {
            $http.post('/Admin/CardJob/AddCheckItem/?CheckCode=' + checkCode + '&Title=' + data + '&WeightNum=' + data1).success(callback);
        },
        getCheckItem: function (checkCode, callback) {
            $http.post('/Admin/CardJob/GetCheckItem/?CheckCode=' + checkCode).success(callback);
        },
        changeChkItemStatus: function (itemId, callback) {
            $http.post('/Admin/CardJob/ChangeItemStatus/?Id=' + itemId).success(callback);
        },
        changeChkItemTitle: function (itemId, title, callback) {
            $http.post('/Admin/CardJob/ChangeItemTitle/?Id=' + itemId + '&Title=' + title).success(callback);
        },
        deleteCheckItem: function (itemid, callback) {
            $http.post('/Admin/CardJob/DeleteCheckItem/?Id=' + itemid).success(callback);
        },

        addComment: function (cardCode, content, callback) {
            $http.post('/Admin/CardJob/AddComment/?CardCode=' + cardCode + '&Content=' + content).success(callback);
        },
        getComment: function (cardCode, callback) {
            $http.post('/Admin/CardJob/GetComments/?CardCode=' + cardCode).success(callback);
        },
        deleteComment: function (cmtId, callback) {
            $http.post('/Admin/CardJob/DeleteComment/?CommentId=' + cmtId).success(callback);
        },
        updateComment: function (cmtId, content, callback) {
            $http.post('/Admin/CardJob/UpdateComment/?CmtId=' + cmtId + '&Content=' + content).success(callback);
        },

        addAttachment: function (data, callback) {
            $http.post('/Admin/CardJob/AddAttachment/', data).success(callback);
        },
        uploadAttachment: function (data, callback) {
            submitFormUpload('/Admin/CardJob/UploadFile/', data, callback);
        },
        getAttachment: function (cardCode, callback) {
            $http.post('/Admin/CardJob/GetAttachment/?CardCode=' + cardCode).success(callback);
        },
        deleteAttachment: function (fileCode, callback) {
            $http.post('/Admin/CardJob/DeleteAttachment/?FileCode=' + fileCode).success(callback);
        },


        add: function (data, callback) {
            $http.post('/UIYKienBanDoc/Insert/', data).success(callback);
        },
        save: function (data, callback) {
            $http.post('/Admin/CardJob/SaveData/', data).success(callback);
        },
        getObjDependency: function (callback) {
            $http.post('/Admin/CardJob/GetObjDependency').success(callback);
        },
        setObjectRelative: function (data, callback) {
            $http.post('/Admin/CardJob/SetObjectRelative/', data).success(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/CardJob/GetListUser').success(callback);
        },
        advanceSearch: function (data, callback) {
            $http.post('/Admin/CardJob/AdvanceSearch/', data).success(callback);
        },
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).success(callback);
        },
        insertCardDependency: function (data, callback) {
            $http.post('/Admin/CardJob/InsertCardDependency/', data).success(callback);
        },
        getCardDependency: function (CardCode, callback) {
            $http.post('/Admin/CardJob/GetObjectRelative/?CardCode=' + CardCode).success(callback);
        },
        deleteCardDependency: function (dependencyId, callback) {
            $http.post('/Admin/CardJob/DeleteCardDependency/?Id=' + dependencyId).success(callback);
        },
        getRelative: function (callback) {
            $http.post('/Admin/CardJob/GetRelative/').success(callback);
        }
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        })
        $rootScope.StatusData = [{
            Value: 1,
            Name: 'Kích Hoạt'
        }, {
            Value: 2,
            Name: 'Không kích hoạt'
        }];
    });
    $rootScope.open = true;
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/board', {
            templateUrl: ctxfolder + '/board.html',
            controller: 'board'
        })
        .when('/board-detail/:id/:viewMode', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index',
        });

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
app.controller('index', function ($scope, $http, $location, $rootScope, $routeParams, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window, $cookies) {
    $rootScope.BoardCode = "BOARD_1";

    $scope.model = {}
    $scope.modelDetail = {};
    $scope.cards = [];
    //$scope.currentCards = [];
    $scope.ViewMode = 0;
    $scope.DfSetting = {};
    $scope.addlist = {};
    $scope.addcard = {};
    $scope.setting = {
        DefaultCard: false
    };
    $scope.searchObj = {
        CardTitle: '',
        Member: '',
        Fromdate: '',
        Todate: ''
    };
    $scope.listUser = [];
    $scope.objDependency = [];
    $scope.cards = [];
    $scope.showAddList = false;
    $scope.showAddCard = '';
    $scope.currentDate = new Date();
    $scope.currentDate = $scope.currentDate.toISOString();
    //$scope.currentLists = [];
    //$scope.currentCards = [];



    //load data
    $scope.initData = function () {
        dataservice.getTeams(function (rs) {
            $scope.Teams = rs;
        });
        dataservice.getBoards(function (rs) {
            $scope.Boards = rs;
        });

        dataservice.getBoardDetail($rootScope.BoardCode, function (rs) {
            //console.log(rs);
            $scope.modelDetail = rs;
            dataservice.getLists($rootScope.BoardCode, function (rs) {
                //console.log(rs);
                $scope.modelDetail.lists = rs;
                //$scope.currentLists = rs;
                angular.forEach(rs, function (value, key) {
                    var listCode = value.ListCode;
                    dataservice.getCardsByList(listCode, function (result) {
                        $scope.cards[listCode] = result;
                        //$scope.currentCards[listCode] = result;
                        //console.log($scope.cards[listCode]);
                    });
                });

                for (var i = 0; i < $scope.modelDetail.lists.length; i++) {
                    if ($scope.modelDetail.lists[i].Status == 0) {
                        $scope.modelDetail.lists[i].HeaderColor = '#d35400';
                    };
                    if ($scope.modelDetail.lists[i].Status == 1) {
                        $scope.modelDetail.lists[i].HeaderColor = '#f1c40f';
                    };
                    if ($scope.modelDetail.lists[i].Status == 2) {
                        $scope.modelDetail.lists[i].HeaderColor = '#2ecc71';
                    }
                }
            });
        });
        dataservice.getLists($rootScope.BoardCode, function (rs) { tmpList = rs });

        dataservice.getListUser(function (rs) {
            $scope.listUser = rs;
        });
        dataservice.getObjDependency(function (rs) {
            $scope.objDependency = rs;
        });
        $scope.DfSetting = $cookies.getObject("DefaultCardSetting");
        if ($scope.DfSetting != undefined) {
            $scope.setting.DefaultCard = true;
        }
        //App.unblockUI('#contentMain');
    };
    //$scope.initData().then(function () { App.unblockUI('#contentMain'); });
    $scope.initData();
    //start card left
    $scope.addBoard = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-board.html',
            controller: 'add-board',
            size: '30',

        });
        modalInstance.result.then(function (d) {
            dataservice.getBoards(function (rs) {
                $scope.Boards = rs;
            });
        }, function () { });
    };
    $scope.editBoard = function (BoardCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit-board.html',
            controller: 'edit-board',
            size: '30',
            resolve: {
                para: function () {
                    return BoardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getBoards(function (rs) {
                $scope.Boards = rs;
            });
        }, function () { });
    };
    $scope.deleteBoard = function (BoardID) {
        dataservice.deleteBoard(BoardID, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    };
    $scope.detail = function (BoardCode) {
        dataservice.getBoardDetail(BoardCode, function (rs) {
            $scope.modelDetail = rs;
            dataservice.getLists(BoardCode, function (rs) {
                //console.log(rs);
                $scope.modelDetail.lists = rs;
                //$scope.currentLists = rs;
                angular.forEach(rs, function (value, key) {
                    var listCode = value.ListCode;
                    dataservice.getCardsByList(listCode, function (result) {
                        $scope.cards[listCode] = result;
                        //$scope.currentCards[listCode] = result;
                    });
                });

                for (var i = 0; i < $scope.modelDetail.lists.length; i++) {
                    if ($scope.modelDetail.lists[i].Status == 0) {
                        $scope.modelDetail.lists[i].HeaderColor = '#d35400';
                    };
                    if ($scope.modelDetail.lists[i].Status == 1) {
                        $scope.modelDetail.lists[i].HeaderColor = '#f1c40f';
                    };
                    if ($scope.modelDetail.lists[i].Status == 2) {
                        $scope.modelDetail.lists[i].HeaderColor = '#2ecc71';
                    }
                }
            });
            //$('.content-wrapper')[0].style.setProperty('background-color', $scope.model.Background, 'important');
        });
        dataservice.getLists(BoardCode, function (rs) { tmpList = rs });

        dataservice.getBoards(function (rs) {
            $scope.modelDetail.boards = rs;
            //console.log($scope.model.boards);
        });
        dataservice.getListUser(function (rs) {
            $scope.listUser = rs;
        });
        dataservice.getObjDependency(function (rs) {
            $scope.objDependency = rs;
        });
        $scope.DfSetting = $cookies.getObject("DefaultCardSetting");
        if ($scope.DfSetting != undefined) {
            $scope.setting.DefaultCard = true;
        }
        App.unblockUI('#contentMain');
        $rootScope.BoardCode = BoardCode;
        if ($scope.ViewMode == 1) {
            $rootScope.reloadGridCard();
        }
    };



    $scope.addTeam = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-team.html',
            controller: 'add-team',
            backdrop: true
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    };
    $scope.deleteTeam = function (code) {
        dataservice.deleteTeam(code, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    };
    $scope.editTeam = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit-team.html',
            controller: 'edit-team',
            backdrop: true,
            resolve: {
                teamCode: function () {
                    return code;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    };
    //end card left







    //card detail
    $scope.acticeDrag = false;
    $scope.resetSearch = function () {
        $scope.initData();
        $scope.searchObj.ButtonStatus = true;
    };
    $scope.search = function () {
        dataservice.advanceSearch($scope.searchObj, function (rs) {
            $scope.searchObj.ButtonStatus = false;

            var lists = [];
            for (var i = 0; i < $scope.modelDetail.lists.length; i++) {
                console.log($scope.modelDetail.lists[i].ListCode);
                var cards = [];
                for (var j = 0; j < $scope.cards[$scope.modelDetail.lists[i].ListCode].length; j++) {
                    console.log($scope.cards[$scope.modelDetail.lists[i].ListCode][j].CardCode);
                    console.log(rs.indexOf($scope.cards[$scope.modelDetail.lists[i].ListCode][j].CardCode));
                    if (rs.indexOf($scope.cards[$scope.modelDetail.lists[i].ListCode][j].CardCode) > -1) {
                        cards.push($scope.cards[$scope.modelDetail.lists[i].ListCode][j]);
                    }
                }
                $scope.cards[$scope.modelDetail.lists[i].ListCode] = cards;
                if ($scope.cards[$scope.modelDetail.lists[i].ListCode].length !== 0) {
                    lists.push($scope.modelDetail.lists[i]);
                }
            }
            $scope.modelDetail.lists = lists;
        });
    };
    $scope.advanceSearch = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/advance-search.html',
            controller: 'advance-search',
            backdrop: true,
            size: '30'
        });
        modalInstance.result.then(function (d) {
            if ($rootScope.advanceSearch === undefined) {
                return;
            }
            console.log($rootScope.advanceSearch);
            dataservice.advanceSearch($rootScope.advanceSearch, function (rs) {
                console.log(rs);
                $scope.searchObj.ButtonStatus = false;
                var lists = [];
                for (var i = 0; i < $scope.modelDetail.lists.length; i++) {
                    console.log($scope.modelDetail.lists[i].ListCode);
                    var cards = [];
                    for (var j = 0; j < $scope.cards[$scope.modelDetail.lists[i].ListCode].length; j++) {
                        console.log($scope.cards[$scope.modelDetail.lists[i].ListCode][j].CardCode);
                        console.log(rs.indexOf($scope.cards[$scope.modelDetail.lists[i].ListCode][j].CardCode));
                        if (rs.indexOf($scope.cards[$scope.modelDetail.lists[i].ListCode][j].CardCode) > -1) {
                            cards.push($scope.cards[$scope.modelDetail.lists[i].ListCode][j]);
                        }
                    }
                    $scope.cards[$scope.modelDetail.lists[i].ListCode] = cards;
                    if ($scope.cards[$scope.modelDetail.lists[i].ListCode].length !== 0) {
                        lists.push($scope.modelDetail.lists[i]);
                    }
                }
                $scope.modelDetail.lists = lists;
            });
        }, function () { });
    };
    $scope.defaultCardSetting = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/default-card-setting.html',
            controller: 'default-card-setting',
            backdrop: true,
            size: '60',
        });
        modalInstance.result.then(function (d) {
            $scope.DfSetting = $cookies.getObject("DefaultCardSetting");
            $scope.setting.DefaultCard = true;
            console.log($scope.DfSetting);
        }, function () { });
    };

    $scope.openAddList = function () {
        $scope.showAddList = !$scope.showAddList;
    }
    $scope.openAddCard = function (ListCode) {
        $scope.showAddCard = ListCode;
    }
    $scope.closeAddCard = function () {
        $scope.showAddCard = '';
    }
    $scope.deleteList = function (ListID) {
        dataservice.deleteList(ListID, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    };
    $scope.cardDetail = function (CardCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit-tag.html',
            controller: 'edit-card',
            backdrop: true,
            size: '60',
            resolve: {
                para: function () {
                    return CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }

    $scope.addList = function () {
        $scope.addlist.BoardCode = $rootScope.BoardCode;
        $scope.addlist.WeightNum = $scope.addlist.WeightNum == null ? 0 : $scope.addlist.WeightNum;
        dataservice.insertList($scope.addlist, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.showAddList = false;
                $scope.addlist.ListName = "";
                $scope.cards[rs.Object.ListCode] = [];
                rs.Object.HeaderColor = '#f1c40f';
                $scope.modelDetail.lists.push(rs.Object);
                //$scope.initData();
            }
        })
    }
    $scope.sortListByStatus = function (orther) {
        dataservice.sortListByStatus($rootScope.BoardCode, orther, function (rs) {
            if (rs.Error) {

            }
            else {
                $scope.initData();
            }
        })
    }

    $scope.editingListTitle = function (id) {
        if ($scope.acticeDrag == false) {
            $scope.acticeDrag = true;
            document.getElementById("listName_" + id).focus();
        }
    }
    $scope.updateListName = function (ListID) {
        var element = $('#listName_' + ListID);
        var newName = element.val();
        var currentName = element.attr('data-currentvalue');
        console.log('NewName: ' + newName);
        console.log("CurrentName: " + currentName);
        if (newName != currentName) {
            console.log("Change name");
            dataservice.updateListName(ListID, newName, function (rs) {
                if (rs.Error) {
                    //App.toastrError(rs.Title);
                }
                else {
                    //App.toastrSuccess(rs.Title);
                    //$scope.initData();
                    element.attr('data-currentvalue', newName)
                }
            })
        }
        $scope.acticeDrag = false;
    }
    $scope.addCard = function (ListCode) {
        $scope.addcard.ListCode = ListCode;
        if ($scope.setting.DefaultCard === true) {
            if ($scope.DfSetting !== undefined) {
                $scope.addcard.Setting = $scope.DfSetting;
                console.log($scope.DfSetting);
            }
        }

        console.log($scope.addcard);
        dataservice.insertCard($scope.addcard, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.cards[ListCode].push(rs.Object);
                $scope.closeAddCard();
                $scope.addcard.CardName = '';
                //$scope.initData();
            }
        });
    };

    $scope.changeListStatus = function (listID, statusCode) {
        dataservice.changeListStatus(listID, statusCode, function (rs) {
            if (rs.Error) {
            }
            else {
                for (var i = 0; i < $scope.modelDetail.lists.length; i++) {
                    if ($scope.modelDetail.lists[i].ListID == listID) {
                        $scope.modelDetail.lists[i].Status = statusCode;
                        if (statusCode == 0) {
                            $scope.modelDetail.lists[i].HeaderColor = '#d35400';
                        };
                        if (statusCode == 1) {
                            $scope.modelDetail.lists[i].HeaderColor = '#f1c40f';
                        };
                        if (statusCode == 2) {
                            $scope.modelDetail.lists[i].HeaderColor = '#2ecc71';
                        }
                    }
                }
            }
        })
    }
    $scope.changeBoard = function (listID, boardCode) {
        dataservice.changeBoard(listID, boardCode, function (rs) {
            if (rs.Error) {

            }
            else {


            }
        })
    }
    $scope.changeHeaderBackgroundList = function (listId) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit-list-background.html',
            controller: 'edit-list-background',
            backdrop: true,
            size: '30',
            resolve: {
                para: function () {
                    return listId;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.changeWeightNumList = function (listId,weightNum) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit-list-weight-num.html',
            controller: 'edit-list-weight-num',
            backdrop: true,
            size: '15',
            resolve: {
                para: function () {
                    return {
                        listId: listId,
                        weightNum: weightNum
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }



    //ui-sortable options 
    var tmpList = [];
    var orther = [];
    $scope.sortableOptions = {
        handle: '.task-board',
        activate: function (e, ui) {
            $scope.acticeDrag = true;
        },
        start: function (e, ui) {
            ui.item.addClass('rotate');
            orther = $scope.modelDetail.lists.map(function (i) {
                return i.Order;
            })
        },
        update: function (e, ui) {
            var logEntry = $scope.modelDetail.lists.map(function (i) {
                return i.Order;
            });
        },
        stop: function (e, ui) {
            //console.log(ui);
            $('.ui-sortable-placeholder').css('display', 'none');
            ui.placeholder.removeClass('ui-sortable-placeholder');
            ui.placeholder.removeAttr("visibility").removeAttr("height");
            ui.item.removeClass('rotate');

            var logEntry = $scope.modelDetail.lists.map(function (i) {
                return i.Order;
            });
            dataservice.updateOrder(orther, logEntry, function (rs) {
                if (rs.Error) {

                }
                else {

                }
            });
            $scope.acticeDrag = false;
        }
    };
    $scope.sortableCard = {
        connectWith: ".tag-content",
        start: function (e, ui) {

        },
        stop: function (e, ui) {
            if (ui.item.sortable.droptarget) {
                var CardCode = ui.item.sortable.droptarget.context.id;
                var ListCode = ui.item.sortable.droptarget[0].id;
                dataservice.changeListCard(CardCode, ListCode, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        //App.toastrSuccess(rs.Title);
                    }
                });
            }
        }
    };
    $scope.calendar = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/calendar.html',
            controller: 'calendar',
            size: '90'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };
    $scope.gridCard = function (type) {
        $scope.ViewMode = type;
    };
    setTimeout(function () {
        $('#FromDate').datetimepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
            minView: 2
        });
        $('#ToDate').datetimepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
            minView: 2
        });
    }, 200);
    $scope.cancel = function () {
        this.close();
    };
    //End card detail




    //hide,show menu
    function openNavCard() {
        if (!$rootScope.open) {
            $rootScope.open = true;
            document.getElementById("mySidenav").style.width = "200px";
            document.getElementById("BoardDetail").style.paddingLeft = "200px";
        }
        else {
            closeNavCard();
        }
    }
    function closeNavCard() {
        $rootScope.open = false;
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("BoardDetail").style.paddingLeft = "15px";
        document.body.style.backgroundColor = "white";
    }
    function openMenu() {
        $.app.menu.expanded = false;
        $.app.menu.expand();
    }
    function closeMenu() {
        $.app.menu.collapsed = false;
        $.app.menu.toggle();
    }
    function removeFooter() {
        var el = document.querySelector('footer.footer');
        el.parentNode.removeChild(el);
    }
    function setHeightBoard() {
        var $header = $('#navbar-menu');
        var $searchBoard = $('#SearchBoard');
        var $footer = $('#navLeftFooter');
        var $content = $('#list-board');
        var height = $window.innerHeight - ($header.height() + $searchBoard.height() + $footer.height()) + 50;
        $('#list-board').css({
            "max-height": height,
            'overflow-y': 'auto'
        });
        document.getElementById("mySidenav").style.width = "200px";
        document.getElementById("BoardDetail").style.paddingLeft = "200px";
    }

    setTimeout(function () {
        $('.content-wrapper').css("height", "100%");
        $('#contentMain').css("height", "100%");
        //$('.ng-scope').not('.boards').not('.card').not('.search-bar').not('.board-detail').css("height", "100%");
        $('.container-fluid').not('.board-detail').css("height", "100%");
        $('.row').css("height", "100%");
        //$('.testimonial-group').css("height", "100%");
        $.app.menu.expanded = true;
        $.app.menu.collapsed = false;
        $.app.menu.toggle();
        removeFooter();
        setHeightBoard();
    }, 500);
    $(document).ready(function (e) {
        $(".menu-toggle").click(function (e) {
            if ($.app.menu.collapsed) {
                $.app.menu.expanded = false;
                $.app.menu.expand();
                closeNavCard();
            } else {
                $.app.menu.collapsed = false;
                $.app.menu.toggle();
                closeNavCard();
            }
            e.stopImmediatePropagation();
        });
        $("#btnOpenTrello").click(function (e) {
            e.preventDefault();
            if ($.app.menu.expanded) {
                $.app.menu.toggle();
            }
            openNavCard();
            e.stopImmediatePropagation();
        });
    });
});

//board
app.controller('add-team', function ($scope, $http, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.model = {
        TeamName: '',
        Member: []
    };
    $scope.initData = function () {
        dataservice.getListUser(function (rs) {
            $scope.listUser = rs;
        });
        dataservice.getListUser(function (rs) {
            $scope.listLeader = rs;
        });
    };
    $scope.initData();

    $scope.leaderSelect = function (username) {
        dataservice.getListUser(function (rs) {
            $scope.listUser = rs;
            for (var i = 0; i < $scope.listUser.length; i++) {
                if ($scope.listUser[i].UserName === username) {
                    $scope.listUser.splice(i, 1);
                }
            }
            for (var i = 0; i < $scope.model.Member.length; i++) {
                if ($scope.model.Member[i].UserName === username) {
                    $scope.model.Member.splice(i, 1);
                }
            }
        });
    };

    $scope.submit = function () {
        var member = '';
        if ($scope.model.TeamName === "") {
            App.toastrError(caption.CJ_CURD_MSG_ENTER_TEAM_NAME);
            return;
        }
        for (var i = 0; i < $scope.model.Member.length; i++) {
            i < $scope.model.Member.length - 1 ? member += $scope.model.Member[i].UserName + ';' : member += $scope.model.Member[i].UserName;
        }
        $scope.model.Member = member;
        console.log($scope.model);

        dataservice.addTeam($scope.model, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
    };
});
app.controller('edit-team', function ($scope, $http, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, teamCode) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.model = {
        TeamName: '',
        Member: []
    };
    $scope.listUser = [];
    $scope.initData = function () {
        dataservice.getTeam(teamCode, function (rs) {
            $scope.model = rs;
            console.log(rs.Member.split(';'));
            $scope.model.Member = rs.Member.split(';');
        });
        dataservice.getListUser(function (rs) {
            for (var i = 0; i < rs.length; i++) {
                $scope.listUser[i] = rs[i].UserName;
            }
        });
        dataservice.getListUser(function (rs) {
            $scope.listLeader = rs;
        });
    };
    $scope.initData();

    $scope.leaderSelect = function (username) {
        dataservice.getListUser(function (rs) {
            for (var i = 0; i < rs.length; i++) {
                $scope.listUser[i] = rs[i].UserName;
            }
            for (var i = 0; i < $scope.listUser.length; i++) {
                if ($scope.listUser[i] === username) {
                    $scope.listUser.splice(i, 1);
                }
            }
            for (var i = 0; i < $scope.model.Member.length; i++) {
                if ($scope.model.Member[i] === username) {
                    $scope.model.Member.splice(i, 1);
                }
            }
        });
    };

    $scope.submit = function () {
        var member = '';
        if ($scope.model.TeamName === "") {
            App.toastrError(caption.CJ_CURD_MSG_ENTER_TEAM_NAME);//Nhập tên nhóm
            return;
        }
        for (var i = 0; i < $scope.model.Member.length; i++) {
            i < $scope.model.Member.length - 1 ? member += $scope.model.Member[i] + ';' : member += $scope.model.Member[i];
        }
        $scope.model.Member = member;
        console.log($scope.model);

        dataservice.editTeam($scope.model, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
    };
});

app.controller('add-board', function ($scope, $http, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {
        BackgroundColor: '',
        BackgroundImage: '',
        Visibility: true,
        TeamCode: '',
        BoardType: ''
    }
    $scope.listColor = [{
        Id: 1,
        Check: true,
        BackgroundColor: 'rgb(240, 29, 106)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(255, 46, 25) 0%, rgb(146, 0, 255) 50%, rgb(0, 95, 255) 100%)',
    }, {
        Id: 2,
        Check: false,
        BackgroundColor: 'rgb(255, 124, 168)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(0, 229, 255) 0%, rgb(167, 151, 255) 50%, rgb(255, 143, 178) 100%)',
    }, {
        Id: 3,
        Check: false,
        BackgroundColor: 'rgb(14, 220, 222)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(14, 230, 183) 0%, rgb(0, 230, 210) 50%, rgb(25, 201, 255) 100%)',
    }, {
        Id: 4,
        Check: false,
        BackgroundColor: 'rgb(255, 156, 25)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(255, 79, 0) 0%, rgb(255, 150, 22) 50%, rgb(255, 220, 45) 100%)',
    }, {
        Id: 5,
        Check: false,
        BackgroundColor: 'rgb(26, 219, 91)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(0, 223, 187) 0%, rgb(110, 223, 0) 50%, rgb(255, 210, 0) 100%)',
    }, {
        Id: 6,
        Check: false,
        BackgroundColor: 'rgb(255, 92, 161)',
        BackgroundImage: '',
    }]

    $scope.initData = function () {
        dataservice.getTeams(function (rs) {
            $scope.Teams = rs;
        })
        dataservice.getBoardsType(function (rs) {
            $scope.boardType = rs;
        });
    }
    $scope.initData();
    $scope.selectColor = function (id) {
        for (var i = 0; i < $scope.listColor.length; i++) {
            if ($scope.listColor[i].Id == id) {
                if ($scope.listColor[i].Check) {
                    $scope.listColor[i].Check = false;
                } else {
                    $scope.listColor[i].Check = true;
                }
            } else {
                $scope.listColor[i].Check = false;
            }
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    $scope.submit = function () {
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        dataservice.insertBoard($scope.model, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit-board', function ($scope, $http, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.model = {
        BackgroundColor: '',
        BackgroundImage: '',
        Visibility: true,
        TeamCode: '',
        BoardType: ''
    }
    $scope.listColor = [{
        Id: 1,
        Check: false,
        BackgroundColor: 'rgb(240, 29, 106)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(255, 46, 25) 0%, rgb(146, 0, 255) 50%, rgb(0, 95, 255) 100%)',
    }, {
        Id: 2,
        Check: false,
        BackgroundColor: 'rgb(255, 124, 168)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(0, 229, 255) 0%, rgb(167, 151, 255) 50%, rgb(255, 143, 178) 100%)',
    }, {
        Id: 3,
        Check: false,
        BackgroundColor: 'rgb(14, 220, 222)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(14, 230, 183) 0%, rgb(0, 230, 210) 50%, rgb(25, 201, 255) 100%)',
    }, {
        Id: 4,
        Check: false,
        BackgroundColor: 'rgb(255, 156, 25)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(255, 79, 0) 0%, rgb(255, 150, 22) 50%, rgb(255, 220, 45) 100%)',
    }, {
        Id: 5,
        Check: false,
        BackgroundColor: 'rgb(26, 219, 91)',
        BackgroundImage: 'radial-gradient(circle at center 75%, rgb(0, 223, 187) 0%, rgb(110, 223, 0) 50%, rgb(255, 210, 0) 100%)',
    }, {
        Id: 6,
        Check: false,
        BackgroundColor: 'rgb(255, 92, 161)',
        BackgroundImage: '',
    }]

    $scope.initData = function () {
        dataservice.getTeams(function (rs) {
            $scope.Teams = rs;
        });
        dataservice.getBoardDetail(para, function (rs) {
            $scope.model = rs;
            //select color
            var selectColor = $scope.listColor.find(function (element) {
                if (element.BackgroundColor == $scope.model.BackgroundColor) return true;
            });
            if (selectColor) {
                selectColor.Check = true;
            }
        });
        dataservice.getBoardsType(function (rs) {
            $scope.boardType = rs;
        });
    }
    $scope.initData();
    $scope.selectColor = function (id) {
        for (var i = 0; i < $scope.listColor.length; i++) {
            if ($scope.listColor[i].Id == id) {
                if ($scope.listColor[i].Check) {
                    $scope.listColor[i].Check = false;
                } else {
                    $scope.listColor[i].Check = true;
                }
            } else {
                $scope.listColor[i].Check = false;
            }
        }
    }
    $scope.submit = function () {
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        dataservice.updateBoard($scope.model, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        })
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});


//list
app.controller('edit-list-background', function ($scope, $http, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.listColor = [{
        Id: 1,
        Check: false,
        Background: "background-color: rgb(240, 29, 106);background-image: radial-gradient(circle at center 75%, rgb(255, 46, 25) 0%, rgb(146, 0, 255) 50%, rgb(0, 95, 255) 100%);"
    }, {
        Id: 2,
        Check: false,
        Background: "background-image: radial-gradient(circle at center 75%, rgb(0, 229, 255) 0%, rgb(167, 151, 255) 50%, rgb(255, 143, 178) 100%);"
    }, {
        Id: 3,
        Check: false,
        Background: "background-color: rgb(14, 220, 222);background-image: radial-gradient(circle at center 75%, rgb(14, 230, 183) 0%, rgb(0, 230, 210) 50%, rgb(25, 201, 255) 100%);"
    }, {
        Id: 4,
        Check: false,
        Background: "background-color: rgb(255, 156, 25);background-image: radial-gradient(circle at center 75%, rgb(255, 79, 0) 0%, rgb(255, 150, 22) 50%, rgb(255, 220, 45) 100%);"
    }, {
        Id: 5,
        Check: false,
        Background: "background-color: rgb(26, 219, 91);background-image: radial-gradient(circle at center 75%, rgb(0, 223, 187) 0%, rgb(110, 223, 0) 50%, rgb(255, 210, 0) 100%);"
    }, {
        Id: 6,
        Check: false,
        Background: "background-color: rgb(255, 92, 161);"
    }, {
        Id: 7,
        Check: false,
        Background: "background-color: rgb(214, 150, 187);"
    }, {
        Id: 8,
        Check: false,
        Background: "background-color: rgb(19, 207, 19);"
    }, {
        Id: 9,
        Check: false,
        Background: "background-color: rgb(255, 195, 0);"
    }, {
        Id: 10,
        Check: false,
        Background: "background-color: rgb(0, 132, 255);"
    }, {
        Id: 11,
        Check: false,
        Background: "background-color: rgb(118, 70, 255);"
    }, {
        Id: 12,
        Check: false,
        Background: "background-color: rgb(68, 190, 199);"
    }, {
        Id: 13,
        Check: false,
        Background: "background-color: rgb(255, 126, 41);"
    }, {
        Id: 14,
        Check: false,
        Background: "background-color: rgb(250, 60, 76);"
    }, {
        Id: 15,
        Check: false,
        Background: "background: #f3ec1b;"
    }, {
        Id: 16,
        Check: false,
        Background: "background:#f31b1b;"
    }, {
        Id: 17,
        Check: false,
        Background: "background:#a29999;"
    }, {
        Id: 18,
        Check: false,
        Background: "background:#a4a5d8;"
    }]
    $scope.selectColor = function (id) {
        for (var i = 0; i < $scope.listColor.length; i++) {
            if ($scope.listColor[i].Id == id) {
                if ($scope.listColor[i].Check) {
                    $scope.listColor[i].Check = false;
                } else {
                    $scope.listColor[i].Check = true;
                }
            } else {
                $scope.listColor[i].Check = false;
            }
        }
    }
    $scope.submit = function () {
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            var obj = {
                ListID: para,
                Background: selectColor.Background
            }
            dataservice.changeListBackground(obj, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        } else {
            App.toastrError("Vui lòng chọn màu!");
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit-list-weight-num', function ($scope, $http, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.model = {
        WeightNum: para.weightNum,
    }
    $scope.submit = function () {
        var obj = {
            ListID: para.listId,
            WeightNum: $scope.model.WeightNum
        }
        dataservice.changeListWeightNum(obj, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        })
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});


//card
app.controller('edit-card', function ($scope, $http, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    var dataSet = [];
    $scope.model = {
        Description: '',
    };
    $scope.checkitem = {
        Title: ''
    };
    $scope.comment = {
        Content: ''
    };

    $scope.members = [];
    $scope.checkList = [];
    $scope.show = {
        SelectCard: false
    };
    $scope.cards = [];
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.initData = async function () {
        await dataservice.getLevels(function (rs) {
            $scope.CardLevels = rs;
        });
        await dataservice.getWorkType(function (rs) {
            $scope.WorkTypes = rs;
        });
        await dataservice.getCardDetail(para, function (rs) {
            console.log(rs);
            $scope.model = rs;
        });
        await dataservice.getAttachment(para, function (rs) {
            $scope.attachments = rs;
        });
        await dataservice.getCheckList(para, function (rs) {
            $scope.checklists = rs;
            angular.forEach(rs, function (value, key) {
                dataservice.getCheckItem(value.ChkListCode, function (result) {
                    $scope.checkList[value.ChkListCode] = result;
                })
            })
        });
        await dataservice.getComment(para, function (rs) {
            $scope.comments = rs;
        });
        await dataservice.getCardDependency(para, function (rs) {
            dataSet = [];
            angular.forEach(rs, function (value, key) {
                debugger
                var obj = [];
                obj.push(value.CatObjCode);
                obj.push(value.ObjCode);
                obj.push(value.Relative);
                obj.push('<button title="Xoá" ng-click="deleteObjReletive(' + value.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i style="color:red" class="fa fa-trash"></i></button>');
                obj.push(value.Id);
                dataSet.push(obj);
            });

            setTimeout(function () {
                refrestTable();
            }, 500);
        });
        await dataservice.getBoards(function (rs) {
            $scope.Boards = rs;
        });
        await dataservice.getStatus(function (rs) {
            $scope.CardStatus = rs;
        });
        await dataservice.getLists($rootScope.BoardCode, function (rs) {
            //console.log(rs);
            $scope.model.lists = rs;
            //$scope.currentLists = rs;
            angular.forEach(rs, function (value, key) {
                var listCode = value.ListCode;
                dataservice.getCardsByList(listCode, function (result) {
                    $scope.cards[listCode] = result;
                });

                console.log($scope.cards);
            });

            for (var i = 0; i < $scope.model.lists.length; i++) {
                if ($scope.model.lists[i].Status === 0) {
                    $scope.model.lists[i].HeaderColor = '#d35400';
                };
                if ($scope.model.lists[i].Status === 1) {
                    $scope.model.lists[i].HeaderColor = '#f1c40f';
                };
                if ($scope.model.lists[i].Status === 2) {
                    $scope.model.lists[i].HeaderColor = '#2ecc71';
                }
            }
        });
    };
    $scope.initData();

    $scope.changeCard = function (CardCode) {
        para = CardCode;
        $scope.initData();
    };

    $scope.deleteObjReletive = function (code) {
        console.log(code);
        dataservice.deleteCardDependency(code, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    };

    $scope.editDescription = function () {
        if ($scope.model.Description === "" || $scope.model.Description == null || $scope.model.Description == undefined) {
            return;
        }
        var obj = {
            CardCode: para,
            Description: $scope.model.Description
        }
        dataservice.updateCardDescription(obj, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    };
    $scope.updateCardName = function (id) {
        //console.log(id);
        var element = $('#card_' + id);
        var newName = element.val();
        var currentName = element.attr('data-currentvalue');
        //console.log('NewName: ' + newName);
        //console.log("CurrentName: " + currentName);
        if (newName != currentName) {
            //console.log("Change name");
            dataservice.updateCardName(id, newName, function (rs) {
                if (rs.Error) {
                    //App.toastrError(rs.Title);
                }
                else {
                    //App.toastrSuccess(rs.Title);
                    //$scope.initData();
                    element.attr('data-currentvalue', newName)
                }
                console.log(rs.Title);
            })
        }
        $scope.acticeDetailDrag = false;
    }
    $scope.updateWeightNum = function () {
        dataservice.updateWeightNum(para, $scope.model.WeightNum, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    }
    $scope.acticeDetailDrag = false;
    $scope.editingCardetailHeader = function (id) {
        if ($(".modal-dialog").hasClass("ui-draggable-dragging") == false) {
            $scope.acticeDetailDrag = true;
            document.getElementById("card_" + id).focus();
        } else {
            $scope.acticeDetailDrag = false;
        }
    }
    $scope.addMember = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-member.html',
            controller: 'add-member',
            size: '50',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
            //backdrop: true,
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    };
    $scope.addDueDate = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-duedate.html',
            controller: 'add-duedate',
            size: '20',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
            //backdrop: true,
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    }

    $scope.changeWorkType = function (type) {
        dataservice.changeWorkType(para, type, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    };
    $scope.changeCardStatus = function (status) {
        dataservice.changeCardStatus(para, status, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    };
    $scope.changeCardLevel = function (level) {
        dataservice.changeCardLevel(para, level, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    };

    $scope.objectRelative = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/object-relative.html',
            controller: 'object-relative',
            size: '60',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
            //backdrop: true,
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    };

    $scope.addAttachment = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/attachment.html',
            controller: 'attachment',
            size: '35',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
            //backdrop: true,
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    }
    $scope.deleteAttachment = function (fileCode) {
        dataservice.deleteAttachment(fileCode, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    }

    $scope.addComment = function () {
        if ($scope.comment.Content == "") {
            App.toastrError(caption.CJ_CURD_MSG_ENTER_COMMENT);//Nhập bình luận!
            return;
        }
        dataservice.addComment(para, $scope.comment.Content, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.comment.Content = '';
                $scope.initData();
            }
        })
    }
    $scope.deleteComment = function (CmtId) {
        dataservice.deleteComment(CmtId, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    }
    $scope.updateComment = function (e) {
        console.log(e.target.getAttribute('cmtid'));
        $scope.show.editComment[e.target.getAttribute('cmtid')] = false;
        dataservice.updateComment(e.target.getAttribute('cmtid'), e.target.value, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    };

    $scope.addLabel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/label.html',
            controller: 'label',
            size: '35',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
            //backdrop: true,
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    }

    $scope.addCheckList = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-checklist.html',
            controller: 'add-checklist',
            size: '20',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
            //backdrop: true,
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    }
    $scope.deleteCheckList = function (CheckCode) {
        dataservice.deleteCheckList(CheckCode, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        })
    }
    $scope.editCheckTitle = function (e) {
        var checkTitle = e.target.value;
        var checkItem = e.target.getAttribute("checkcode");
        console.log(checkTitle);
        console.log(checkItem);
        $scope.show.editCheckTitle[e.target.getAttribute('checkcode')] = false;
        dataservice.changeCheckTitle(checkItem, checkTitle, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        })
    }
    $scope.deleteCheckItem = function (id) {
        dataservice.deleteCheckItem(id, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        })
    }

    $scope.checkItemClick = function (itemId, checkListId) {
        dataservice.changeChkItemStatus(itemId, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                if (rs.Object) {
                    $scope.model.Completed = rs.Object.PercentCard;
                    var getCheckList = $scope.checklists.find(function (element) {
                        if (element.Id == checkListId) return true;
                    });
                    if (getCheckList) {
                        getCheckList.Completed = rs.Object.PercentCheckList;
                    }
                }
            }
        });
    }
    $scope.addCheckItem = function (checkCode) {
        dataservice.addCheckItem(checkCode, $scope.checkitem.Title, $scope.checkitem.WeightNum, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.checkitem.Title = '';
                $scope.initData();
                $scope.show.addCheckItem = false;
            }
        })
    }
    $scope.editCheckItemTitle = function (e) {
        var itemTitle = e.target.value;
        var itemId = e.target.getAttribute("itemid");
        //console.log(itemTitle);
        //console.log(itemId);
        $scope.show.editCheckItem[e.target.getAttribute('itemid')] = false;
        dataservice.changeChkItemTitle(itemId, itemTitle, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        })

    }

    $scope.deleteCard = function (id) {
        dataservice.deleteCard(id, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.cancel();
            }
        })
    };

    $scope.submit = function () {
        //$scope.model.Background = $('#background-color').val();
        console.log($scope.model);
        //dataservice.updateBoard($scope.model, function (rs) {
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    }
        //    else {
        //        App.toastrSuccess(rs.Title);
        //        $uibModalInstance.close();
        //    }
        //})
    };

    function refrestTable() {
        var datatable = $('#data-table').DataTable({
            columns: [
                { title: '<i class="fa fa-info-circle mr5"></i>Loại phụ thuộc' },
                { title: '<i class="fa fa-code mr5"></i>Mã đối tượng' },
                { title: '<i class="fa fa-thumbtack mr5"></i>Quan hệ' },
                { title: '<i class="fa fa-location-arrow mr5"></i>Thao tác' }
            ],
            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "searching": false,
            "lengthChange": false,
            "stripeClasses": [],
            "ordering": false,
            "bPaginate": false,
            "info": false
        });
        datatable.clear();
        datatable.rows.add(dataSet);
        datatable.draw();
    }
    setTimeout(function () {
        //setModalMaxHeight('.modal');
        setModalDraggable(".modal-dialog");
    }, 400);
});

app.controller('add-member', function ($scope, $rootScope, $cookies, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, cardCode) {
    $scope.model = {};
    $scope.listTeam = [];
    $scope.listUser = [];
    $scope.cardMember = {
        listTeam: [],
        listMember: []
    };
    $scope.DfSetting = {};
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getCardTeam(cardCode, function (rs) {
            $scope.cardMember.listTeam = rs;
        });
        dataservice.getCardMember(cardCode, function (rs) {
            for (var i = 0; i < rs.length; i++) {
                $scope.cardMember.listMember[i] = {};
                $scope.cardMember.listMember[i].UserName = rs[i].MemberId;
            }
        });
        dataservice.getTeams(function (rs) {
            $scope.listTeam = rs;
        });
        dataservice.getListUser(function (rs) {
            $scope.listUser = rs;
        });
    };
    $scope.initData();

    $scope.teamSelect = function (item) {
        for (var i = 0; i < $scope.cardMember.listTeam.length; i++) {
            if ($scope.cardMember.listTeam[i].TeamCode === item.TeamCode) {
                App.toastrError(caption.CJ_CURD_MSG_TEAM_EXITED);//Team đã tồn tại!
                return;
            }
        }
        dataservice.getTeamMember(item.TeamCode, function (rs) {
            for (var i = 0; i < rs.split(';').length; i++) {
                for (var j = 0; j < $scope.listUser.length; j++) {
                    if ($scope.listUser[j].UserName === rs.split(';')[i]) {
                        $scope.listUser.splice(j, 1);
                        break;
                    }
                }
            }
        });
        $scope.cardMember.listTeam.push(item);
        //remove member in list
        for (var i = 0; i < $scope.listTeam.length; i++) {
            if ($scope.listTeam[i].TeamCode === item.TeamCode) {
                $scope.listTeam.splice(i, 1);
                break;
            }
        }
    };
    $scope.removeTeam = function (id) {
        for (var i = 0; i < $scope.cardMember.listTeam.length; i++) {
            if ($scope.cardMember.listTeam[i].TeamCode == id) {
                //if ($scope.listTeam.length != 0) {
                $scope.listTeam.push($scope.cardMember.listTeam[i]);
                //}
                $scope.cardMember.listTeam.splice(i, 1);
                break;
            }
        }
    };
    $scope.memberSelect = function (item) {
        for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
            if ($scope.cardMember.listMember[i].UserName === item.UserName) {
                App.toastrError(caption.CJ_CURD_MSG_MEMBER_EXITED);//Member đã tồn tại!
                return;
            }
        }
        $scope.cardMember.listMember.push(item);
        for (var i = 0; i < $scope.listUser.length; i++) {
            if ($scope.listUser[i].UserName == item.UserName) {
                $scope.listUser.splice(i, 1);
                break;
            }
        }
    };
    $scope.removeMember = function (id) {
        for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
            if ($scope.cardMember.listMember[i].UserName == id) {
                $scope.listUser.push($scope.cardMember.listMember[i]);
                $scope.cardMember.listMember.splice(i, 1);
                break;
            }
        }
    };

    $scope.useDefaultSetting = function () {
        $scope.DfSetting = $cookies.getObject("DefaultCardSetting");
        if ($scope.DfSetting === undefined) {
            App.toastrError(caption.CJ_CURD_MSG_DEFAULT_SETTING);//Chưa cài đặt mặt định!
            return;
        }
        $scope.cardMember.listTeam = $scope.DfSetting.Team;
        $scope.cardMember.listMember = $scope.DfSetting.Member;
    };

    $scope.submit = function () {
        var data = { cardcode: cardCode, listteam: $scope.cardMember.listTeam, listmember: $scope.cardMember.listMember };
        console.log(data);
        dataservice.addMember(data, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.cancel();
            }
        });
    };
});
app.controller('add-checklist', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, cardCode) {
    $scope.model = {};
    $scope.maxWeightNum = 0;
    $scope.validationOptions = {
        rules: {
            Title: {
                required: true,
                maxlength: 255,
            },
            WeightNum: {
                min: 0,
                max: 100,
            },
        },
        messages: {
            Title: {
                required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CJ_CURD_TAB_ADD_CHECK_LIST_CURD_TXT_TITLE),//'Nhập tiêu đề!',
                maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CJ_CURD_TAB_ADD_CHECK_LIST_CURD_TXT_TITLE).replace("{1}", "255")//'Cho phép tối đa 255 ký tự!'
            },
            WeightNum: {
                min: "Trọng số lớn hơn 0",
                max: "Trọng số nhỏ hơn 100"
            },
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        dataservice.getMaxWeightNumCheckList(cardCode, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.maxWeightNum = rs.Object;
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.checklist.validate()) {
            dataservice.addCheckList(cardCode, $scope.model.Title, $scope.model.WeightNum, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.cancel();
                }
            })
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('attachment', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, cardCode) {
    $scope.model = {
        CardCode: '',
        FileCode: '',
        MemberId: '',
        CreatedTime: '',
        UpdatedTime: '',
        FileName: '',
        FileUrl: ''
    };
    $scope.validationOptions = {
        rules: {

        },
        messages: {

        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {

    }
    $scope.initData();
    $scope.submit = function () {
        var file = document.getElementById("FileAttachment").files[0];

        if (file == null || file == undefined) {
            App.toastrError("Vui lòng chọn tệp tin");
        } else {
            var fileName = $('#FileAttachment').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log(extFile);

            //if (extFile != "docx" && extFile != "doc" && extFile != "pdf") {
            //    App.toastrError("Chỉ tải lên tệp docx, doc hoặc pdf!");
            //    return;
            //};

            var data = new FormData();
            data.append("FileUpload", file);
            dataservice.uploadAttachment(data, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return;
                }
                else {
                    var file = fileName.split('\\');
                    $scope.model.FileName = file[file.length - 1];
                    $scope.model.FileUrl = '/uploads/files/' + rs.Object;
                    $scope.model.CardCode = cardCode;
                    console.log($scope.model);

                    dataservice.addAttachment($scope.model, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            $scope.cancel();
                        }
                    })
                }
            });
        }
    }
});
app.controller('label', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, cardCode) {
    $scope.model = {

    };
    $scope.validationOptions = {
        rules: {

        },
        messages: {

        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.initData = function () {

    }
    $scope.initData();



    $scope.submit = function () {
        var label = '';
        var element = $('.label-checkbox:checked');
        angular.forEach(element, function (value, key) {
            label += value.value + ';';
        })
        label = label.substring(0, label.length - 1);
        console.log(label);
        if (label != '') {
            debugger
            dataservice.updateCardLabel(cardCode, label, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.cancel();
                }
            })
        }
        else {
            App.toastrError(caption.CJ_CURD_MSG_CHOOSE_LABEL);//Chọn nhãn!
        }
    }
});
app.controller('add-duedate', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, cardCode) {
    $scope.duedate = {
        DueDate: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {

    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.duedate.DueDate != '') {
            dataservice.updateDueDate(cardCode, $scope.duedate.DueDate, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.cancel();
                }
            })
        }
    }
    setTimeout(function () {
        $("#duedate").datetimepicker({
            startDate: new Date(),
            autoclose: true,
        });
    }, 100);
});
app.controller('advance-search', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.listUser = [];
    $scope.objDependency = [];
    $scope.listObjCode = [];
    $scope.cardStatus = [
        {
            Code: "0", Value: "Quá thời hạn"
        }
    ];
    $scope.search = {
        CardTitle: '',
        Member: '',
        Fromdate: '',
        Todate: '',
        Status: '',
        ObjDependency: '',
        ObjCode: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.initData = function () {
        dataservice.getListUser(function (rs) {
            $scope.listUser = rs;
        });
        dataservice.getObjDependency(function (rs) {
            $scope.objDependency = rs;
        });
    };
    $scope.objDependencyChange = function (code) {
        console.log(code);
        dataservice.getObjCode(code, function (rs) {
            $scope.listObjCode = rs;
        });
    };

    $scope.initData();
    $scope.submit = function () {
        //console.log($scope.search);
        $rootScope.advanceSearch = $scope.search;

        $scope.cancel();
    };

    setTimeout(function () {
        $('#DateFrom').datetimepicker({
            viewMode: 'years',
            format: "dd/mm/yyyy",
            autoclose: true,
        });
        $('#DateTo').datetimepicker({
            viewMode: 'years',
            format: "dd/mm/yyyy",
            autoclose: true,
        });
    }, 100);
});
app.controller('default-card-setting', function ($scope, $rootScope, $cookies, $cookieStore, $compile, $uibModal, $confirm, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {
    var vm = $scope;
    var dataSet = [];
    var listDependency = [];
    var customSetting = {};

    $scope.listTeam = [];
    $scope.listUser = [];
    $scope.cardMember = {
        listTeam: [],
        listMember: []
    };
    $scope.objDependency = [];
    $scope.listObjCode = [];
    $scope.setting = {
        ObjDependency: '',
        ObjCode: '',
        Relative: '',
        Member: '',
        Team: ''
    };

    $scope.setcookies = function () {
        $cookies.putObject('DefaultCardSetting', customSetting);
        App.toastrSuccess(caption.CJ_CURD_MSG_SAVE_SUCCESS);// Lưu thành công
    };
    $scope.deleteCookies = function () {
        $cookies.remove('DefaultCardSetting');
    };
    $scope.initData = function () {
        dataservice.getTeams(function (rs) {
            $scope.listTeam = rs;
        });
        dataservice.getListUser(function (rs) {
            $scope.listUser = rs;
        });
        dataservice.getObjDependency(function (rs) {
            $scope.objDependency = rs;
        });
        dataservice.getRelative(function (rs) {
            $scope.relative = rs;
        });
        var DfSetting = $cookies.getObject('DefaultCardSetting');
        if (DfSetting !== undefined) {
            $scope.cardMember.listTeam = DfSetting.Team;
            $scope.cardMember.listMember = DfSetting.Member;
            angular.forEach(DfSetting.ListDependency, function (value, key) {
                var obj = [];
                obj.push(value.Dependency);
                obj.push(value.ObjCode);
                obj.push(value.Relative);
                dataSet.push(obj);
            });


        }
        setTimeout(function () {
            refrestTable();
        }, 500);
    };
    $scope.initData();

    $scope.objDependencyChange = function (code) {
        console.log(code);
        dataservice.getObjCode(code, function (rs) {
            $scope.listObjCode = rs;
        })
    };
    $scope.objCodeChange = function (code) {
        console.log(code);
    };

    $scope.addDependency = function () {
        var dependency = $scope.setting.ObjDependency;
        var objCode = $scope.setting.ObjCode;
        var relative = $scope.setting.Relative;
        if (objCode === "" || relative === "" || dependency === "") {
            App.toastrError("Please select object");
            return;
        }
        var obj = [];

        for (var i = 0; i < dataSet.length; i++) {
            for (var j = 0; j < dataSet[i].length; j++) {
                if (dataSet[i][j] == objCode) {
                    App.toastrError("Object Code already exist");
                    return;
                }
            }
        }

        obj.push(dependency);
        obj.push(objCode);
        obj.push(relative);
        obj.push('<button title="Xoá" ng-click="ABC()" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>')
        dataSet.push(obj);

        refrestTable();

        $scope.setting.ObjDependency = '';
        $scope.setting.ObjCode = '';
        $scope.setting.Relative = '';
        listObjCode = [];
    };

    $scope.teamSelect = function (item) {
        for (var i = 0; i < $scope.cardMember.listTeam.length; i++) {
            if ($scope.cardMember.listTeam[i].TeamCode === item.TeamCode) {
                App.toastrError(caption.CJ_CURD_MSG_TEAM_EXITED);//Team đã tồn tại!
                return;
            }
        }
        $scope.cardMember.listTeam.push(item);
        //remove member in list
        for (var i = 0; i < $scope.listTeam.length; i++) {
            if ($scope.listTeam[i].TeamCode === item.TeamCode) {
                $scope.listTeam.splice(i, 1);
                break;
            }
        }
    };
    $scope.removeTeam = function (id) {
        for (var i = 0; i < $scope.cardMember.listTeam.length; i++) {
            if ($scope.cardMember.listTeam[i].TeamCode == id) {
                //if ($scope.listTeam.length != 0) {
                $scope.listTeam.push($scope.cardMember.listTeam[i]);
                //}
                $scope.cardMember.listTeam.splice(i, 1);
                break;
            }
        }
    };
    $scope.memberSelect = function (item) {
        for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
            if ($scope.cardMember.listMember[i].UserName === item.UserName) {
                App.toastrError(caption.CJ_CURD_MSG_MEMBER_EXITED);//Member đã tồn tại!
                return;
            }
        }
        $scope.cardMember.listMember.push(item);
        for (var i = 0; i < $scope.listUser.length; i++) {
            if ($scope.listUser[i].UserName == item.UserName) {
                $scope.listUser.splice(i, 1);
                break;
            }
        }
    };
    $scope.removeMember = function (id) {
        for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
            if ($scope.cardMember.listMember[i].UserName == id) {
                $scope.listUser.push($scope.cardMember.listMember[i]);
                $scope.cardMember.listMember.splice(i, 1);
                break;
            }
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.clearData = function () {
        $scope.deleteCookies();
        dataSet = [];
        $scope.cardMember = {
            listTeam: [],
            listMember: []
        }
        refrestTable();
        console.log("Clear");
    };
    $scope.submit = function () {
        for (var i = 0; i < dataSet.length; i++) {
            var data = { Dependency: dataSet[i][0], ObjCode: dataSet[i][1], Relative: dataSet[i][2] };
            listDependency.push(data);
        }
        customSetting = { Team: $scope.cardMember.listTeam, Member: $scope.cardMember.listMember, ListDependency: listDependency }
        //console.log(customSetting);
        $scope.setcookies();
        $scope.cancel();
    };

    function refrestTable() {
        var datatable = $('#data-table').DataTable({
            columns: [
                { title: '<i class="fa fa-info-circle mr5"></i>Loại phụ thuộc' },
                { title: '<i class="fa fa-code mr5"></i>Mã đối tượng' },
                { title: '<i class="fa fa-thumbtack mr5"></i>Quan hệ' },
            ],
            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "searching": false,
            "lengthChange": false,
            "stripeClasses": [],
            "ordering": false,
            "bPaginate": false,
            "info": false
        });
        datatable.clear();
        datatable.rows.add(dataSet);
        datatable.draw();
    }

    setTimeout(function () {

    }, 100);
});
app.controller('object-relative', function ($scope, $rootScope, $cookies, $cookieStore, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, cardCode) {
    var vm = $scope;
    var dataSet = [];
    var listDependency = [];
    var customSetting = {};

    $scope.listTeam = [];
    $scope.listUser = [];
    $scope.cardMember = {
        listTeam: [],
        listMember: []
    };
    $scope.setting = {
        Id: -1,
        ObjDependency: '',
        ObjCode: '',
        Relative: '',
        Member: '',
        Team: ''
    };
    $scope.objDependency = [];
    $scope.listObjCode = [];

    $scope.useDefaultSetting = function () {
        var DfSetting = $cookies.getObject('DefaultCardSetting');
        if (DfSetting !== undefined) {
            dataSet = [];
            $scope.cardMember.listTeam = DfSetting.Team;
            $scope.cardMember.listMember = DfSetting.Member;
            angular.forEach(DfSetting.ListDependency, function (value, key) {
                var obj = [];
                obj.push(value.Dependency);
                obj.push(value.ObjCode);
                obj.push(value.Relative);
                dataSet.push(obj);
            });

            refrestTable();
        }
    };
    $scope.initData = function () {
        dataservice.getObjDependency(function (rs) {
            $scope.objDependency = rs;
        });
        dataservice.getCardDependency(cardCode, function (rs) {
            angular.forEach(rs, function (value, key) {
                var obj = [];
                obj.push(value.CatObjCode);
                obj.push(value.ObjCode);
                obj.push(value.Relative);
                obj.push('<button title="Xoá" ng-click="deleteObjReletive(' + value.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i style="color:red" class="fa fa-trash"></i></button>');
                obj.push(value.Id);
                dataSet.push(obj);
            });
            setTimeout(function () {
                refrestTable();
            }, 400);
        });
        dataservice.getRelative(function (rs) {
            $scope.relative = rs;
        })

    };
    $scope.initData();
    $uibModalInstance.opened.then(function () {
        setTimeout(function () {
            refrestTable();
        }, 100);
    });

    $scope.objDependencyChange = function (code) {
        console.log(code);
        dataservice.getObjCode(code, function (rs) {
            $scope.listObjCode = rs;
        });
    };
    $scope.objCodeChange = function (code) {
        console.log(code);
    };
    $scope.addDependency = function () {
        var dependency = $scope.setting.ObjDependency;
        var objCode = $scope.setting.ObjCode;
        var relative = $scope.setting.Relative;
        var id = $scope.setting.Id--;
        if (objCode === "" || relative === "" || dependency === "") {
            App.toastrError(caption.CJ_CURD_MSG_CHOOSE_INFO);//Chọn đầy đủ thông tin
            return;
        }
        var obj = [];

        for (var i = 0; i < dataSet.length; i++) {
            for (var j = 0; j < dataSet[i].length; j++) {
                if (dataSet[i][j] === objCode) {
                    App.toastrError(caption.CJ_CURD_MSG_OBJ_CODE_EXITED);//Mã đối tượng đã tồn tại
                    return;
                }
            }
        }

        obj.push(dependency);
        obj.push(objCode);
        obj.push(relative);
        obj.push('<button title="Xoá" ng-click="deleteObjReletive(' + id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i style="color:red" class="fa fa-trash"></i></button>');
        obj.push(id);
        dataSet.push(obj);

        refrestTable();

        $scope.setting.ObjDependency = '';
        $scope.setting.ObjCode = '';
        $scope.setting.Relative = '';
        listObjCode = [];
    };
    $scope.deleteObjReletive = function (id) {
        for (var i = 0; i < dataSet.length; i++) {
            if (dataSet[i][4] == id) {
                dataSet.splice(i, 1);
                refrestTable();
                break;
            }
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.clearData = function () {
        dataSet = [];
        refrestTable();
        console.log("Clear");
    };
    $scope.submit = function () {
        listDependency = [];
        for (var i = 0; i < dataSet.length; i++) {
            var data = { Dependency: dataSet[i][0], ObjCode: dataSet[i][1], Relative: dataSet[i][2] };
            listDependency.push(data);
        }
        console.log(listDependency);
        //if (listDependency.length > 0) {
        dataservice.setObjectRelative({ CardCode: cardCode, listDependency }, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
        //}
        //$scope.cancel();
    };

    function refrestTable() {
        var datatable = $('#obj-data-table').DataTable({
            columns: [
                { title: '<i class="fa fa-info-circle mr5"></i>Loại phụ thuộc' },
                { title: '<i class="fa fa-code mr5"></i>Mã đối tượng' },
                { title: '<i class="fa fa-thumbtack mr5"></i>Quan hệ' },
                { title: '<i class="fa fa-location-arrow mr5"></i>Thao tác' }
            ],
            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "searching": false,
            "lengthChange": false,
            "stripeClasses": [],
            "ordering": false,
            "bPaginate": false,
            "info": false
        });
        datatable.clear();
        datatable.rows.add(dataSet);
        datatable.draw();
    }
    setTimeout(function () {
        //$('#data-table').DataTable({
        //    columns: [
        //        { title: "Loại phụ thuộc" },
        //        { title: "Mã đối tượng" },
        //        { title: "Quan hệ" },
        //    ],
        //    "searching": false,
        //    "lengthChange": false,
        //    "stripeClasses": [],
        //    "ordering": false
        //});
    }, 100);
});

app.controller('calendar', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {

    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        dataservice.getCards($rootScope.BoardCode, function (rs) {
            showEvent(rs);
        });
    };
    $scope.initData();
    $scope.events = [];
    $scope.submit = function () {

    }
    function createEvent() {
        createCalendar();
        //$('#calendar').fullCalendar({
        //    events: $scope.events
        //})
    }
    function showEvent(rs) {
        debugger
        angular.forEach(rs, function (value, key) {
            debugger
            if (value.CreatedDate != null) {
                //createEvent(value.CreatedDate, value.CardName, value.CardCode);
                var event = {
                    title: value.CardName,
                    date: value.CreatedDate,
                    cardCode: value.CardCode
                }
                $scope.events.push(event);

            }
        })
        createEvent();
    }

    function createCalendar() {
        $('#calendar').fullCalendar({
            defaultView: 'month',
            defaultDate: new Date(),
            selectable: true,
            editable: true,
            selectHelper: true,
            eventLimit: true,
            header: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },
            events: $scope.events,
            eventRender: function (event, element) {
                element.bind('dblclick', function () {
                    console.log(event);

                });
            },
            eventClick: function (calEvent) {
                console.log(calEvent);
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit-tag.html',
                    controller: 'edit-card',
                    backdrop: true,
                    size: '60',
                    resolve: {
                        para: function () {
                            return calEvent.cardCode;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                }, function () { });
            },
            dayClick: function (date) {
            },
            customButtons: {
            }
        })
    }
    setTimeout(function () {
        //createCalendar();

        //$(".fc-prev-button").click(function () {
        //    //console.log(events);
        //    showEvent(events);
        //});
        //$(".fc-next-button").click(function () {
        //    //console.log(events);
        //    showEvent(events);
        //});
        setModalDraggable(".modal-dialog");
    }, 600);
});
app.controller('grid-card', function ($scope, $rootScope, $compile, $filter, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $confirm, dataservice) {
    //$scope.cancel = function () {
    //    $uibModalInstance.close();
    //};
    $scope.table = {};
    var vm = $scope.table;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.model = {
        ListCode: '',
        CardName: '',
        Member: '',
        Fromdate: '',
        Todate: ''
    };
    $scope.create = {};

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CardJob/GetGridCard",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.BoardCode = $rootScope.BoardCode;
                d.ListCode = $scope.model.ListCode;
                d.CardName = $scope.model.CardName;
                d.Member = $scope.model.Member;
                d.Fromdate = $scope.model.Fromdate;
                d.Todate = $scope.model.Todate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
        .withOption('order', [1, 'asc'])
        .withOption('serverSide', true)
        .withOption('stripeClasses', ['a', 'b'])
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            //const contextScope = $scope.$new(true);
            //contextScope.data = data;
            //contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListName').withTitle('<i class="fa fa-code mr5"></i>{{"CJ_COL_LIST_NAME" | translate}}').withOption("sWidth", "50px").renderWith(function (data, type) {
        return data.length > 10 ? data.substr(0, 10) + " ..." : data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardCode').withTitle('<i class="fa fa-code mr5"></i>{{"CJ_COL_CARD_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardName').withTitle('<i class="fa fa-paper-plane mr5"></i>{{"CJ_COL_CARD_NAME" | translate}}').renderWith(function (data, type) {
        return data.length > 10 ? data.substr(0, 20) + " ..." : data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('<i class="fa fa-info-circle mr5"></i>{{"CJ_COL_STATUS" | translate}}').renderWith(function (data, type, full) {
        var icon = '';
        if (data !== "") {
            switch (full.StatusCode) {
                case "DONE":
                    icon = '<i style="color: #2ecc71" class="fa fa-check-circle mr5"></i>';
                    break;
                case "WARNING":
                    icon = '<i style="color: #e67e22" class="fa fa-exclamation-circle mr5"></i>';
                    break;
                case "LOOP":
                    icon = '<i style="color: #9b59b6" class="fa fa-recycle mr5"></i>';
                    break;
            }
            return icon + data;
        }
        else {
            return "";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardLevel').withTitle('<i class="fa fa-navicon mr5"></i>{{"CJ_COL_CARD_LEVEL" | translate}}').renderWith(function (data, type, full) {
        return data !== "" ? '<img style="height: 25px" src="/images/cardJob/' + full.LevelCode + '.png" / >' + data : "";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('<i class="fa fa-user mr5"></i>{{"CJ_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedDate').withOption('type', 'date').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_COL_CREATE_DATE" | translate}}').renderWith(function (data, type) {
        return data === "" ? "" : data.split(' ')[0];
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DueDate').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_COL_DUEDATE" | translate}}').renderWith(function (data, type) {
        return data === "" ? "" : data.split(' ')[0];
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withTitle('<i class="fa fa-recycle mr5"></i>Thao tác').withOption("sWidth", "50px").renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="edit(\'' + full.CardCode + '\')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.CardID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(null, resetPaging);
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

    $rootScope.reloadGridCard = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.getLists($rootScope.BoardCode, function (rs) {
            $scope.lists = rs;
        });
    };
    $scope.initData();
    $scope.delete = function (CardID) {
        dataservice.deleteCard(CardID, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                reloadData();
            }
        });
    };
    $scope.edit = function (CardCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit-tag.html',
            controller: 'edit-card',
            backdrop: true,
            size: '60',
            resolve: {
                para: function () {
                    return CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData(false);
        }, function () { });
    };

    $scope.search = function () {
        reloadData(false);
        //$('#tblData .sorting').click();
    };
    $scope.createNewCard = function () {
        console.log($scope.create);
        dataservice.insertCard($scope.create, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $(".popover.fade").removeClass("in");
                $scope.create = {};
                reloadData(false);
            }
        });
    };

    $scope.options = {
        title: $compile('<label>Thêm thẻ mới</label> <a class="close" style="width: 15px; height: 15px" onclick="$(\'.popover\').popover(\'hide\')" data-dismiss="alert"><span class="fa fa - times"></i></a>')($scope),
        content: $compile(`
                            <div class="input-group">
                                <ui-select tagging ng-model="create.ListCode" theme="bootstrap">
                                    <ui-select-match placeholder="Danh sách...">{{$select.selected.ListName}}</ui-select-match>
                                    <ui-select-choices style="height: auto" repeat="x.ListCode as x in lists | filter: $select.search">
                                        {{x.ListName}}
                                    </ui-select-choices>
                                </ui-select>
                                <span class="input-group-addon" ng-click="model.ListCode = ''">
                                    <span class="fa fa-times"></span>
                                </span>
                            </div>
                            <input class='form-control mt5' ng-model='create.CardName' placeholder='Tên thẻ...'/>
                            <button class='btn btn-red mt5' style="width: 100%" ng-click='createNewCard()'>Tạo</button>
                            <script>
                                $('.popover').draggable();
                                $('body').on('hidden.bs.popover', function (e) {
                                    $(e.target).data("bs.popover").inState = { click: false, hover: false, focus: false }
                                });
                            </script>
                            `)($scope),
        trigger: "click",
        placement: "bottom",
        html: true
    };
    setTimeout(function () {
        $('#FromDateGrid').datetimepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
            minView: 2
        });
        $('#ToDateGrid').datetimepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
            minView: 2
        });
    }, 200);
});
