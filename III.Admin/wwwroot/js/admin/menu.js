/*=========================================================================================
  File Name: custom-menu.js
  Description: avtive menu,expand,collapse menu
  initialization and manipulations
  ----------------------------------------------------------------------------------------
  Item Name: Robust - Responsive Admin Theme
  Version: 1.2
  Author: GeeksLabs
  Author URL: http://www.themeforest.net/user/geekslabs
==========================================================================================*/
var configMenu = {
    init: function () {
        configMenu.activeNav();
        //configMenu.expand();
        configMenu.navClick();
        configMenu.tabMenu();
        configMenu.fitContent();
        //configMenu.reponsitive();
        //configMenu.collapse();
    },
    //expand: function () {
    //    $('.main-menu-content').find('.navigation-header').addClass('open');
    //},
    //collapse: function () {
    //    var listMenu = $('.main-menu-content').find('.navigation-header');
    //    for (var i = 0; i < listMenu.length; i++) {
    //        if ($(listMenu[i]).nextUntil('.navigation-header').hasClass("active") == false && $(listMenu[i]).hasClass("navigation-header-no-expand") == false) {
    //            $(listMenu[i]).removeClass("open");
    //            $(listMenu[i]).nextUntil('.navigation-header').hide();
    //        }
    //    }
    //},
    activeNav: function () {
        $("#menu-home").addClass('tab-menu-li');
        if (document.location.pathname === '/Admin/CardJob') {
            $('#btnOpenTrello').removeAttr('href');
            $('#btnOpenTrelloMobile').removeAttr('href');
            $('#navbar-menu').addClass('inOutCardPadding');
        } else {
            $("ul.navigation-main li a[href='" + document.location.pathname + "']").parents('li').addClass('active').addClass('hover').addClass('open');
            var tabActiveMain = $(".tab-content .tab-pane ul li a[href='" + document.location.pathname + "']").parent().parent().parent().prop('id');
            var tabActiveSub = $(".tab-content .tab-pane ul li a[href='" + document.location.pathname + "']").parent().parent().parent().parent().parent().prop('id');
            var tabActive = '';
            if (tabActiveMain !== '' && tabActiveMain !== undefined)
                tabActive = tabActiveMain;
            if (tabActiveSub !== '' && tabActiveSub !== undefined)
                tabActive = tabActiveSub;
            if (tabActive !== '') {
                $('ul.sideways li').removeClass('active tab-menu-li-active');
                $('ul.sideways li').removeClass('tab-menu-li-no-active');
                $('ul.sideways li').addClass('tab-menu-li-no-active');
                $('ul.sideways li a[href="#' + tabActive + '"]').parent().addClass('active tab-menu-li-active');

                $('.tab-content .tab-pane').removeClass('active');
                $('.tab-content #' + tabActive).addClass('active');
            } 
        }
    },
    navClick: function () {
        $("ul.page-sidebar-menu li a[href='" + document.location.pathname + "']").parents('li').addClass('active').addClass('open');
    },
    tabMenu: function () {
        //if ($("#menu-home").hasClass("active")) {
        //    $("#menu-home").addClass('tab-menu-li');
        //} else {
        //    $("#menu-home").removeClass('tab-menu-li');
        //}

        //if ($("#menu-system").hasClass("active")) {
        //    $("#menu-system").addClass('tab-menu-li');
        //} else {
        //    $("#menu-system").removeClass('tab-menu-li');
        //}
    },
    fitContent: function () {
        $(".content-wrapper").addClass("padding-right-60");
    }

}
$(document).ready(function () {
    configMenu.init();
});




