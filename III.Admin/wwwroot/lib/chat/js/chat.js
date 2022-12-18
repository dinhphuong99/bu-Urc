/*=========================================================================================
  File Name: chat.js
  Description: config websync,chat
  initialization and manipulations
  ----------------------------------------------------------------------------------------
==========================================================================================*/

var configChat = {
    init: function () {
        $(".video_list").click(function () {
            $(".menu-tray").show();
            $(".attend-video-list").show();
            $(".attend-list").hide();
            $('.handle img').css("box-shadow", "0px -4px 0px #bababa");
            $('.handle hr').css("box-shadow", "0px -3px 0px #bababa");
        });
        $(".pop-chat").click(function () {
            $(".menu-tray").show("slide", { direction: "right" }, "slow");
        });
        $(".student_list").click(function () {
            $(".menu-tray").show();
            $(".attend-list").show();
            $(".attend-video-list").hide();
        });
        $(".status-selector").click(function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $('.status-selector-bar').hide();
            } else {
                $(this).addClass('active');
                $('.status-selector-bar').show();
            }
        });
    }
}

//var webSyncHandleUrl = 'http://117.6.131.222:8089/websync.ashx';
var webSyncHandleUrl = 'https://websync.s-work.vn/websync.ashx';
fm.websync.client.enableMultiple = true;
var clients = new fm.websync.client(webSyncHandleUrl);
var testichat = document.getElementById('testichat');
var cnt = 0;
var channel = '';

var userName = document.getElementById('UserName').value;
var fullName = document.getElementById('FullName').value;
var avatar = document.getElementById('Avatar').value;
var userId = document.getElementById('UserId').value;
var host = document.getElementById('Host').value;

console.log('userName: ' + userName);
console.log('fullName: ' + fullName);
console.log('avatar: ' + avatar);
console.log('userId: ' + userId);
console.log('host: ' + host);

//loadChat('Tutor', 'IIICHAT', clients, testichat);
//getSubscribe(clients, 'IIICHAT', testichat);
var url = 'https://ikstudy.com:8000';

function initChat() {
    //var socket = io.connect(url);

    $(".btn-student").dblclick(function () {
        var id = $(this).attr('data-id');
        var tab = getTab();
        var channels = [];

        $("#tab-chat li").each(function (i) {
            var room = $(this).attr('data-room');
            channels.push('/' + room);
        });
        if (id != tab && cnt < 1) {
            cnt = cnt + 1;
            $('.inbox-message').css("display", "none");

            var username = $(this).attr('data-name');
            var stanza = roomid = 'private' + id;
            var ul = document.createElement('ul');
            ul.id = "testichat" + id;
            ul.className = "inbox-message style-scrollbar";

            var img = document.createElement('img');
            img.id = "closePrivate" + id;
            img.className = "close-private";
            img.src = "assets/icons/icon_CLOSE.png";
            $('#chat').append(img);
            $('#chat').append(ul);

            var testichats = document.getElementById('testichat' + id);

            //loadChat(username, roomid, clients, testichats);
            //getSubscribe(clients, roomid, testichats);
            if (channels.length) unSubscribe(clients, channels);

            socket.emit('privatemessage', {
                'id': id,
                'roomid': roomid,
                'studentid': id,
                'studentname': username,
                'room': stanza
            });

            $('.all-message').removeClass('active');
            $('.mess-private').removeClass('active');
            $('<li class="item-stt-message mess-private active" data-id="' + id + '" data-name="' + username + '" data-room="' + roomid + '"><p class="text-overfl">' + username + '</p></li>').insertAfter(".all-message");
        }
    });

    $('.prev-message').click(function () {
        var $prev = $('#tab-chat .active').prev();
        if ($prev.length) {
            $('#tab-chat').animate({
                scrollLeft: $prev.position().left
            }, 'slow');
        }
    });

    $('.next-message').click(function () {
        var $next = $('#tab-chat .active').next();
        if ($next.length) {
            $('#tab-chat').animate({
                scrollLeft: $next.position().left
            }, 'slow');
        }
    });

    //socket.on('privatecreate', function (data) {
    //    var channels = [];

    //    $("#tab-chat li").each(function (i) {
    //        var room = $(this).attr('data-room');
    //        channels.push('/' + room);
    //    });

    //    $('.inbox-message').css("display", "none");

    //    var ul = document.createElement('ul');
    //    ul.id = "testichat" + data.studentid;
    //    ul.className = "inbox-message style-scrollbar";
    //    $('#chat').append(ul);
    //    stanza = data.roomid;

    //    var testichats = document.getElementById('testichat' + data.studentid);

    //    loadChat('Tutor', data.roomid, clients, testichats);
    //    getSubscribe(clients, data.roomid, testichats);
    //    if (channels.length) unSubscribe(clients, channels);

    //    $('.all-message').removeClass('active');
    //    $('.mess-private').removeClass('active');
    //    $('<li class="item-stt-message mess-private active" data-id="' + data.studentid + '" data-name="' + data.studentname + '" data-room="' + data.roomid + '"><p class="text-overfl">' + data.studentname + '</p></li>').insertAfter(".all-message");
    //});
}

//function initVideo() {
//    var videoChat = document.getElementById('videoChat');
//    var loading = document.getElementById('loading');
//    var video = document.getElementById('video');
//    var closeVideo = document.getElementById('closeVideo');
//    var toggleAudioMute = document.getElementById('toggleAudioMute');
//    var toggleVideoMute = document.getElementById('toggleVideoMute');
//    var joinSessionButton = document.getElementById('catturacam');

//    var app = new Video(testichat);
//    var start = function (sessionId, statusVideo = false, statusAudio = true) {
//        if (app.sessionId) {
//            return;
//        }

//        if (sessionId.length != 6) {
//            console.log('Session ID must be 6 digits long.');
//            return;
//        }

//        app.sessionId = sessionId;

//        // Switch the UI context.
//        //location.hash = app.sessionId + '&screen=' + (captureScreenCheckbox.checked ? '1' : '0');
//        videoChat.style.display = 'block';

//        console.log('Joining session ' + app.sessionId + '.');
//        //fm.log.info('Joining session ' + app.sessionId + '.');

//        // Start the signalling client.
//        app.startSignalling(function (error) {
//            if (error != null) {
//                console.log(error);
//                stop();
//                return;
//            }

//            // Start the local media stream.
//            app.startLocalMedia(video, false, statusVideo, statusAudio, function (error) {
//                if (error != null) {
//                    console.log(error);
//                    stop();
//                    return;
//                }

//                // Update the UI context.
//                loading.style.display = 'none';
//                video.style.display = 'block';

//                // Enable the media controls.
//                //toggleAudioMute.removeAttribute('disabled');
//                //toggleVideoMute.removeAttribute('disabled');

//                // Start the conference.
//                app.startConference(function (error) {
//                    if (error != null) {
//                        console.log(error);
//                        stop();
//                        return;
//                    }

//                    // Enable the leave button.
//                    //leaveButton.removeAttribute('disabled');

//                    //fm.log.info('<span style="font-size: 1.5em;">' + app.sessionId + '</span>');
//                    console.log('<span style="font-size: 1.5em;">' + app.sessionId + '</span>');
//                }, function () {
//                    stop();
//                });
//            });
//        });
//    };

//    var stop = function () {
//        if (!app.sessionId) {
//            return;
//        }

//        // Disable the leave button.
//        // leaveButton.setAttribute('disabled', 'disabled');

//        console.log('Leaving session ' + app.sessionId + '.');
//        //fm.log.info('Leaving session ' + app.sessionId + '.');

//        app.sessionId = '';

//        $('#catturacam').removeClass('active');

//        app.stopConference(function (error) {
//            if (error) {
//                fm.log.error(error);
//            }

//            // Disable the media controls.
//            //toggleAudioMute.setAttribute('disabled', 'disabled');
//            //toggleVideoMute.setAttribute('disabled', 'disabled');

//            // Update the UI context.
//            video.style.display = 'none';
//            loading.style.display = 'block';

//            app.stopLocalMedia(function (error) {
//                if (error) {
//                    fm.log.error(error);
//                }

//                app.stopSignalling(function (error) {
//                    if (error) {
//                        fm.log.error(error);
//                    }
//                    // Switch the UI context.
//                    //sessionSelector.style.display = 'block';
//                    videoChat.style.display = 'none';
//                    location.hash = '';
//                });
//            });
//        });
//    };

//    // Attach DOM events.
//    fm.util.observe(joinSessionButton, 'click', function (evt) {
//        if ($(this).hasClass('active')) {
//            videoChat.style.display = 'none';
//            $(this).removeClass('active');
//            stop();
//        } else {
//            videoChat.style.display = 'block';
//            $(this).addClass('active');
//            $(".menu-tray").show("slide", { direction: "right" }, "slow");
//            if ($('#toggleAudioMute').hasClass('active'))
//                statusAudio = true;
//            else
//                statusAudio = false;

//            if ($('#toggleVideoMute').hasClass('active'))
//                statusVideo = true;
//            else
//                statusVideo = false;

//            start('public', statusVideo, statusAudio);
//        }
//    });

//    fm.util.observe(closeVideo, 'click', function (evt) {
//        videoChat.style.display = 'none';
//        $('#catturacam').removeClass('active');
//        stop();
//    });

//    fm.util.observe(window, 'unload', function () {
//        stop();
//    });

//    fm.util.observe(toggleVideoMute, 'click', function (evt) {
//        if ($(this).hasClass('active')) {
//            var muted = app.toggleVideoMute();
//            $(this).children().attr('src', '../../../lib/chat/image/icon_Toggle_ALL_OFF.png');
//            $(this).removeClass('active');
//            videoChat.style.display = 'none';
//            $('#catturacam').removeClass('active');
//            stop();
//        } else {
//            $(this).children().attr('src', '../../../lib/chat/image/icon_Toggle_ALL_ON.png');
//            $(this).addClass('active');
//            videoChat.style.display = 'block';
//            $(".menu-tray").show("slide", { direction: "right" }, "slow");
//            if ($('#toggleVideoMute').hasClass('active'))
//                statusVideo = true;
//            else
//                statusVideo = false;

//            start('public', statusVideo, true);
//        }

//    });

//    fm.util.observe(toggleAudioMute, 'click', function (evt) {
//        if ($(this).hasClass('active')) {
//            var muted = app.toggleAudioMute();
//            $(this).children().attr('src', '../../../lib/chat/image/icon_Toggle_ALL_OFF.png');
//            $(this).removeClass('active');
//        } else {
//            $(this).children().attr('src', '../../../lib/chat/image/icon_Toggle_ALL_ON.png');
//            $(this).addClass('active');

//            if ($('#toggleAudioMute').hasClass('active'))
//                statusAudio = true;
//            else
//                statusAudio = false;
//        }

//    });
//}

function loadChat(username, roomid, client, testichats) {
    var name = username;
    var rooms = roomid;
    var clients = client;
    var testichat = testichats;

    fm.util.addOnLoad(function () {
        //init object chat between users a room
        var chat = {
            alias: 'Unknown',
            clientId: 0,
            channels: {
                main: '/' + rooms
            },
            dom: {
                chat: {
                    container: document.getElementById('chat'),
                    text: document.getElementById('scrivi'),
                    send: document.getElementById('btn-send'),
                    username: name,
                    roomid: rooms
                }
            },
            util: {
                start: function () {
                    //console.log(name + ':' + room);
                    chat.alias = name;
                    chat.clientId = rooms;
                    //chat.util.hide(chat.dom.prechat.container);
                    chat.util.show(chat.dom.chat.container);
                    chat.util.scroll();
                    chat.dom.chat.text.focus();
                },
                stopEvent: function (event) {
                    if (event.preventDefault) {
                        event.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    } else {
                        event.cancelBubble = true;
                    }
                },
                send: function () {
                    if (chat.util.isEmpty(chat.dom.chat.text)) {
                        chat.util.setInvalid(chat.dom.chat.text);
                    }
                    else {
                        var dataSend = {
                            alias: chat.alias,
                            type: 999,
                            from: "driver",
                            locationMessage: {
                                driverId: userId,
                            },
                            userName: userName,
                            name: fullName,
                            text: chat.dom.chat.text.value,
                            avatar: host + avatar,
                        };

                        console.log('----------Data Send-----------');
                        console.log(dataSend);
                        removeContentChat();
                        clients.publish({
                            retries: 0,
                            channel: '/' + rooms,
                            data: dataSend,
                            onSuccess: function (args) {
                                chat.util.clear(chat.dom.chat.text);
                            }
                        });
                    }
                },
                show: function (el) {
                    el.style.display = '';
                },
                hide: function (el) {
                    el.style.display = 'none';
                },
                clear: function (el) {
                    el.value = '';
                },
                observe: fm.util.observe,
                isEnter: function (e) {
                    return (e.keyCode == 13);
                },
                isEmpty: function (el) {
                    return (el.value == '');
                },
                setInvalid: function (el) {
                    el.className = 'invalid';
                },
                clearLog: function () {
                    testichat.innerHTML = '';
                },
                logMessage: function (alias, text, me) {
                    var html = '<li';
                    if (me) {
                        html += ' class="item-message"';
                    } else {
                        html += ' class="item-message me"';
                    }
                    html += '><p class="name-sender">' + alias + ':</p><p class="content-mess">' + text + '</p></li>';
                    chat.util.log(html);
                },
                logSuccess: function (text) {
                    chat.util.log('<li class="item-message success"><p class="content-mess">' + text + '</p></li>');
                },
                logFailure: function (text) {
                    chat.util.log('<li class="item-message failure"><p class="content-mess">' + text + '</p></li>');
                },
                log: function (html) {
                    var div = document.createElement('div');
                    div.innerHTML = html;
                    testichat.appendChild(div);
                    chat.util.scroll();
                },
                scroll: function () {
                    testichat.scrollTop = testichat.scrollHeight;
                }
            }
        };

        chat.util.observe(chat.dom.chat.send, 'click', function (e) {

            chat.util.start();
            chat.util.send();
        });

        chat.util.observe(chat.dom.chat.text, 'keydown', function (e) {
            console.log('------beforsend------')
            if (chat.util.isEnter(e)) {
                console.log('------send------')
                chat.util.start();
                chat.util.send();
                chat.util.stopEvent(e);
            }
        });

        client.setAutoDisconnect({
            synchronous: true
        });

        clients.connect({
            onSuccess: function (args) {
                chat.clientId = args.clientId;
                chat.util.clearLog();
                //chat.util.logSuccess('Connected to WebSync.');
                //chat.util.show(chat.dom.prechat.container);
                chat.util.show(chat.dom.chat.container);
            },
            onFailure: function (args) {
                //var username = args.getData().alias;
                //var content = ''

                //chat.util.logSuccess('Could not connect to WebSync.');
            }
        });
    });
}

function activeTab() {
    $(document).on('click', '.item-stt-message', function () {
        var id = $(this).attr('data-id');
        var channels = [];
        $('.item-stt-message').removeClass('active');
        $('.inbox-message').css("display", "none");
        $(this).addClass('active');
        $("#tab-chat li").each(function (i) {
            if (!$(this).hasClass('active')) {
                var room = $(this).attr('data-room');
                channels.push('/' + room);
            }
        });
        if (id == 0) {
            getSubscribe(clients, 'public', testichat);
            if (channels.length) unSubscribe(clients, channels);
            $('#testichat').css("display", "block");
        } else {
            var username = $(this).attr('data-name');
            var stanza = roomid = $(this).attr('data-room');
            var testichats = document.getElementById('testichat' + id);
            getSubscribe(clients, roomid, testichats);
            if (channels.length) unSubscribe(clients, channels);
            $('#testichat' + id).css("display", "block");
        }
    });
}

function getSubscribe(clients, roomid, testichat) {
    clients.subscribe({
        channel: '/' + roomid,
        onSuccess: function (args) {

            //chat.util.logSuccess('Content chat.');
            //var logs = args.getExtensionValue('logs');
            //if (logs != null) {
            //    for (var i = 0; i < logs.length; i++) {
            //        logMessage(logs[i].alias, logs[i].text, false, testichat);
            //    }
            //}
        },
        onFailure: function (args) {
            //chat.util.logSuccess('Not connecting.');
        },
        onReceive: function (args) {
            var ch = args.getChannel();
            console.log(ch);
            //logMessage(args.getData().alias, args.getData().text, args.getWasSentByMe(), testichat);
            receiveMessage(args.getData().userName, args.getData().name, args.getData().text, args.getData().avatar, args.getWasSentByMe());
        }
    });
}

function unSubscribe(clients, channels) {
    clients.unsubscribe({
        channels: channels,
        onFailure: function (args) {
            alert(args.error);
        },
        onSuccess: function (args) {
            var chat = document.getElementById('testichat');
            chat.innerHTML = '';
            channel = "";
        },
    });
}

function logMessage(alias, text, me, testichat) {
    var html = '<li';
    if (me) {
        html += ' class="item-message"';
    } else {
        html += ' class="item-message me"';
    }
    html += '><p class="name-sender">' + alias + ':</p><p class="content-mess">' + text + '</p></li>';
    var div = document.createElement('div');
    div.innerHTML = html;
    testichat.appendChild(div);
    testichat.scrollTop = testichat.scrollHeight;
}

var cssYyourAvatar = 'style="height: 4em;width: 4em;border-radius: 50px;float: right;margin-left: 3%;border: 1px solid #d2d2d2;"';
var cssyourName = 'style="float: right;height: 100%;width: 70%;text-align: right;font-size: 80%;"';
var csscontenyourMess = 'style="float: right; width: 70% !important; border-radius: 5px; background: #d2d2d2; margin: 0 !important; padding: 2%;height: auto !important; margin-bottom: 6% !important; font-weight: 400;border: 1px solid #d2d2d2"';
var cssarrowright = 'style="width: 0; height: 0; border-bottom: 9px solid transparent; border-top: 7px solid transparent; border-left: 11px solid #d2d2d2; position: absolute;right: 22%;"';
var cssmyAvatar = 'style=" height: 4em; width: 4em; border-radius: 50px; float: left;margin-right: 3%;border: 1px solid #d2d2d2;"';
var cssmyName = 'style=" float: left;width: 70%; font-size: 80%;"';
var csscontentmyMess = 'style=" float: left; width: 70% !important; // border: 1px solid; border-radius: 5px; background: #4092F9;margin: 0 !important; padding: 2%; height: auto !important;margin-bottom: 6% !important; font-weight: 400;color: white;"';
var cssarrowleft = 'style=" width: 0; height: 0; border-bottom: 9px solid transparent; border-top: 7px solid transparent; border-right: 11px solid #4092f9; position: absolute; left: 17.2%;"';

function receiveMessage(_userName, name, text, avatar, me) {
    if (_userName == userName) {
        var chat = document.getElementById('testichat');
        var html = '<div ';
        if (me) {
            html += ' class="yourMessage"';
        }
        html += '>' + '<img ' + cssYyourAvatar + ' src="' + avatar + '"/><b ' + cssyourName + '>' + name + '</b>' + '<div ' + csscontenyourMess + '><span ' + cssarrowright + '></span>' + text + '</div></div>';
        var div = document.createElement('div');
        div.innerHTML = html;
        chat.appendChild(div);
        // this.content.scrollToBottom(0);
    }
    else {
        var chat = document.getElementById('testichat');
        var html = '<div ';
        if (me) {
            html += ' class="myMessage"';
        }
        html += '>' + '<img ' + cssmyAvatar + 'src="' + avatar + '"/><b ' + cssmyName + '>' + name + '</b>' + '<div ' + csscontentmyMess + '"><span ' + cssarrowleft + '></span>' + text + '</div></div>';
        var div = document.createElement('div');
        div.innerHTML = html;
        chat.appendChild(div);
        // this.content.scrollToBottom(0);
    }
}

function createCanvas() {
    $("#layers-body li").each(function (i) {
        $(this).addClass("item" + (i + 1));
        $(this).attr("data-cnt", (i + 1));
        $(this).find('span').text((i + 1));

        var canvas = cloneCanvas((i + 1));
        $('#panel').append(canvas);
    });
}

function getTab() {
    var tab = 0;
    $("#tab-chat li").each(function (i) {
        if ($(this).hasClass('active')) {
            tab = parseInt($(this).attr('data-id'));
        }
    });
    return tab;
}

//function hideChat() {
//    
//    $(".content-wrapper").click(function () {
//        $(".menu-tray").hide();
//        $(".menu-tray").hide("slide", { direction: "right" }, "slow");
//    });
//}

$(document).mouseup(function (e) {
    var container = $(".menu-tray");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

$(function () {
    configChat.init();
    //createCanvas();
    //initDraw();
    //addLayer();
    //deleteLayer();
    //clearState();
    initChat();
    activeTab();
    //initVideo();
    //logMessage();
});

//Xu ly su kien
function messageDetail(roomName) {
    loadChat(fullName, 'IIICHAT', clients, testichat);
    getSubscribe(clients, 'IIICHAT', testichat);
    channel = "IIICHAT";
    $('.header-menu').addClass('hidden');
    $('.chat-content').removeClass('hidden');
    $('#message-title-room').empty();
    $('#message-title-room').append(roomName);
}

function backMenu() {
    $('.header-menu').removeClass('hidden');
    $('.chat-content').addClass('hidden');
    var ch = "/" + channel;
    clients.unsubscribe({
        channel: ch,
        data: {
            type: 888,
            from: "monitor",
            locationMessage: {
                driverId: userId,
            },
        },
        onSuccess: function (args) {
            var chat = document.getElementById('testichat');
            chat.innerHTML = '';
            channel = "";
            console.log("exits chanel success");
            clients.disconnect();
            clients = new fm.websync.client(webSyncHandleUrl);
        },
        onFailure: function (args) {
            console.log("unsubcribe failed: " + args.channel);
        }
    });
    //clients.unsubscribe({
    //    channel: ch,
    //    onSuccess: function (args) {
    //        var chat = document.getElementById('testichat');
    //        chat.innerHTML = '';
    //        channel = "";
    //        console.log("exits chanel success")
    //    },
    //    onFailure: function (args) {
    //        console.log("unsubcribe failed: " + args.channel);
    //    }
    //});
}

function messageUser(_userName, givenName) {

    if (userName < _userName) {
        channel = channel + userName + "_" + _userName
    }
    else {
        channel = channel + _userName + "_" + userName
    }
    $('.header-menu').addClass('hidden');
    $('.chat-content').removeClass('hidden');
    $('#message-title-room').empty();
    $('#message-title-room').append(givenName);

    loadChat(userName, channel, clients, testichat);
    getSubscribe(clients, channel, testichat);
}

function joinMeeting() {
    jQuery.ajax({
        type: "POST",
        url: "/Admin/Meeting/JoinMeeting?meetingID=" + "83177583821",
        contentType: "application/json",
        dataType: "JSON",
        success: function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                window.open('/Admin/Meeting', '_blank');
            }
        },
        failure: function (errMsg) {
            App.toastrSuccess(errMsg);
        }
    });
}

function removeContentChat() {
    var listMessage = $('.inbox-message').children();
    var limitMessage = 100;
    if (listMessage.length > limitMessage) {
        var i = listMessage.length;
        for (item in listMessage) {
            listMessage[item].remove();
            i--;

            if (i === limitMessage)
                break;
        }
    }
}
