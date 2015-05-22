/**
 *Copyright 2014 Yemasthui
 *Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 *This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.
 */


(function () {

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(iScape.room.autodisableInterval);
        clearInterval(iScape.room.afkInterval);
        iScape.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("iScapesettings", JSON.stringify(iScape.settings));
        localStorage.setItem("iScapeRoom", JSON.stringify(iScape.room));
        var iScapeStorageInfo = {
            time: Date.now(),
            stored: true,
            version: iScape.version
        };
        localStorage.setItem("iScapeStorageInfo", JSON.stringify(iScapeStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/Paradox68/iScape-Bot/edit/master/lang/langIndex.json", function (json) {
            var link = iScape.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[iScape.settings.language.toLowerCase()];
                if (iScape.settings.chatLink !== iScape.chatLink) {
                    link = iScape.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = iScape.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        iScape.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(iScape.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        iScape.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("iScapesettings"));
        if (settings !== null) {
            for (var prop in settings) {
                iScape.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("iScapeStorageInfo");
        if (info === null) API.chatLog(iScape.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("iScapesettings"));
            var room = JSON.parse(localStorage.getItem("iScapeRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(iScape.chat.retrievingdata);
                for (var prop in settings) {
                    iScape.settings[prop] = settings[prop];
                }
                iScape.room.users = room.users;
                iScape.room.afkList = room.afkList;
                iScape.room.historyList = room.historyList;
                iScape.room.mutedUsers = room.mutedUsers;
                iScape.room.autoskip = room.autoskip;
                iScape.room.roomstats = room.roomstats;
                iScape.room.messages = room.messages;
                iScape.room.queue = room.queue;
                iScape.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(iScape.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById("room-settings");
        info = roominfo.textContent;
        var ref_bot = "@iScape Bot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        iScape.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

    var linkFixer = function (msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    var botCreator = "Connor (Paradox";
    var botMaintainer = "/connor (Paradox)"
    var botCreatorIDs = ["paradox-vii","none"];

    var iScape = {
        version: "1.0",
        status: false,
        name: "iScape Bot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/Yemasthui/iScape/master/iScape.js",
        cmdLink: "http://git.io/245Ppg",
        chatLink: "https://rawgit.com/Yemasthui/iScape/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "iScape Bot",
            language: "english",
            chatLink: "https://rawgit.com/Yemasthui/iScape/master/lang/en.json",
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            cmdDeletion: true,
            maximumAfk: 120,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            historySkip: false,
            timeGuard: true,
            maximumSongLength: 10,
            autodisable: true,
            commandCooldown: 30,
            usercommandsEnabled: true,
            lockskipPosition: 3,
            lockskipReasons: [
                ["theme", "This song does not fit the room theme. "],
                ["op", "This song is on the OP list. "],
                ["history", "This song is in the history. "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad sound quality or no sound. "],
                ["nsfw", "The song you contained was NSFW (image or sound). "],
                ["unavailable", "The song you played was not available for some users. "]
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: trur,
            motdInterval: 5,
            motd: "Message of the Day",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/Yemasthui/iScape-customization/master/blacklists/ExampleNSFWlist.json",
                OP: "https://rawgit.com/Yemasthui/iScape-customization/master/blacklists/ExampleOPlist.json"
            }
        },
        room: {
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function () {
                if (iScape.status && iScape.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    iScape.room.roulette.rouletteStatus = true;
                    iScape.room.roulette.countdown = setTimeout(function () {
                        iScape.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(iScape.chat.isopen);
                },
                endRoulette: function () {
                    iScape.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * iScape.room.roulette.participants.length);
                    var winner = iScape.room.roulette.participants[ind];
                    iScape.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = iScape.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(iScape.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        iScape.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            }
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = iScape.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < iScape.room.users.length; i++) {
                    if (iScape.room.users[i].id === id) {
                        return iScape.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < iScape.room.users.length; i++) {
                    var match = iScape.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return iScape.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = iScape.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = iScape.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < iScape.room.queue.id.length; i++) {
                            if (iScape.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            iScape.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(iScape.chat.alreadyadding, {position: iScape.room.queue.position[alreadyQueued]}));
                        }
                        iScape.roomUtilities.booth.lockBooth();
                        if (priority) {
                            iScape.room.queue.id.unshift(id);
                            iScape.room.queue.position.unshift(pos);
                        }
                        else {
                            iScape.room.queue.id.push(id);
                            iScape.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(iScape.chat.adding, {name: name, position: iScape.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = iScape.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return iScape.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(iScape.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return iScape.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (iScape.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = iScape.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(iScape.chat.toolongago, {name: iScape.userUtilities.getUser(user).username, time: time}));
                var songsPassed = iScape.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = iScape.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                var msg = subChat(iScape.chat.valid, {name: iScape.userUtilities.getUser(user).username, time: time, position: newPosition});
                iScape.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!iScape.roomUtilities.booth.locked);
                    iScape.roomUtilities.booth.locked = false;
                    if (iScape.settings.lockGuard) {
                        iScape.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(iScape.roomUtilities.booth.locked);
                        }, iScape.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(iScape.roomUtilities.booth.locked);
                    clearTimeout(iScape.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!iScape.status || !iScape.settings.afkRemoval) return void (0);
                var rank = iScape.roomUtilities.rankToNumber(iScape.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, iScape.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = iScape.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = iScape.userUtilities.getUser(user);
                            if (rank !== null && iScape.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = iScape.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = iScape.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > iScape.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(iScape.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(iScape.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            iScape.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(iScape.chat.afkremove, {name: name, time: time, position: pos, maximumafk: iScape.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            changeDJCycle: function () {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (iScape.settings.cycleGuard) {
                        iScape.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, iScape.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(iScape.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (iScape.settings.motdEnabled) interval = iScape.settings.motdInterval;
                else interval = iScape.settings.messageInterval;
                if ((iScape.room.roomstats.songCount % interval) === 0 && iScape.status) {
                    var msg;
                    if (iScape.settings.motdEnabled) {
                        msg = iScape.settings.motd;
                    }
                    else {
                        if (iScape.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = iScape.room.roomstats.songCount % iScape.settings.intervalMessages.length;
                        msg = iScape.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in iScape.settings.blacklists) {
                    iScape.room.blacklists[bl] = [];
                    if (typeof iScape.settings.blacklists[bl] === 'function') {
                        iScape.room.blacklists[bl] = iScape.settings.blacklists();
                    }
                    else if (typeof iScape.settings.blacklists[bl] === 'string') {
                        if (iScape.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(iScape.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    iScape.room.blacklists[l] = list;
                                })
                            })(bl);
                        }
                        catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(iScape.room.newBlacklisted);
                }
                else {
                    console.log(iScape.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < iScape.room.newBlacklisted.length; i++) {
                    var track = iScape.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = chat.message.trim();
            for (var i = 0; i < iScape.room.users.length; i++) {
                if (iScape.room.users[i].id === chat.uid) {
                    iScape.userUtilities.setLastActivity(iScape.room.users[i]);
                    if (iScape.room.users[i].username !== chat.un) {
                        iScape.room.users[i].username = chat.un;
                    }
                }
            }
            if (iScape.chatUtilities.chatFilter(chat)) return void (0);
            if (!iScape.chatUtilities.commandCheck(chat))
                iScape.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < iScape.room.users.length; i++) {
                if (iScape.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                iScape.room.users[index].inRoom = true;
                var u = iScape.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                iScape.room.users.push(new iScape.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < iScape.room.users.length; j++) {
                if (iScape.userUtilities.getUser(iScape.room.users[j]).id === user.id) {
                    iScape.userUtilities.setLastActivity(iScape.room.users[j]);
                    iScape.room.users[j].jointime = Date.now();
                }

            }
            if (iScape.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(iScape.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(iScape.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            for (var i = 0; i < iScape.room.users.length; i++) {
                if (iScape.room.users[i].id === user.id) {
                    iScape.userUtilities.updateDC(iScape.room.users[i]);
                    iScape.room.users[i].inRoom = false;
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < iScape.room.users.length; i++) {
                if (iScape.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        iScape.room.users[i].votes.woot++;
                    }
                    else {
                        iScape.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();

            if (iScape.settings.voteSkip) {
                if ((mehs - woots) >= (iScape.settings.voteSkipLimit)) {
                    API.sendChat(subChat(iScape.chat.voteskipexceededlimit, {name: dj.username, limit: iScape.settings.voteSkipLimit}));
                    API.moderateForceSkip();
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < iScape.room.users.length; i++) {
                if (iScape.room.users[i].id === obj.user.id) {
                    iScape.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            $("#woot").click(); // autowoot

            var user = iScape.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < iScape.room.users.length; i++){
                if(iScape.room.users[i].id === user.id){
                    iScape.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (iScape.settings.songstats) {
                if (typeof iScape.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(iScape.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            iScape.room.roomstats.totalWoots += lastplay.score.positive;
            iScape.room.roomstats.totalMehs += lastplay.score.negative;
            iScape.room.roomstats.totalCurates += lastplay.score.grabs;
            iScape.room.roomstats.songCount++;
            iScape.roomUtilities.intervalMessage();
            iScape.room.currentDJID = obj.dj.id;

            var mid = obj.media.format + ':' + obj.media.cid;
            for (var bl in iScape.room.blacklists) {
                if (iScape.settings.blacklistEnabled) {
                    if (iScape.room.blacklists[bl].indexOf(mid) > -1) {
                        API.sendChat(subChat(iScape.chat.isblacklisted, {blacklist: bl}));
                        return API.moderateForceSkip();
                    }
                }
            }
            clearTimeout(historySkip);
            if (iScape.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function () {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            API.sendChat(subChat(iScape.chat.songknown, {name: name}));
                            API.moderateForceSkip();
                            iScape.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                        }
                    }
                    if (!alreadyPlayed) {
                        iScape.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            var newMedia = obj.media;
            if (iScape.settings.timeGuard && newMedia.duration > iScape.settings.maximumSongLength * 60 && !iScape.room.roomevent) {
                var name = obj.dj.username;
                API.sendChat(subChat(iScape.chat.timelimit, {name: name, maxlength: iScape.settings.maximumSongLength}));
                API.moderateForceSkip();
            }
            if (user.ownSong) {
                API.sendChat(subChat(iScape.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(iScape.room.autoskipTimer);
            if (iScape.room.autoskip) {
                var remaining = obj.media.duration * 1000;
                iScape.room.autoskipTimer = setTimeout(function () {
                    console.log("Skipping track.");
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
                }, remaining + 3000);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (iScape.room.queue.id.length > 0 && iScape.room.queueable) {
                    iScape.room.queueable = false;
                    setTimeout(function () {
                        iScape.room.queueable = true;
                    }, 500);
                    iScape.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = iScape.room.queue.id.splice(0, 1)[0];
                            pos = iScape.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    iScape.room.queueing--;
                                    if (iScape.room.queue.id.length === 0) setTimeout(function () {
                                        iScape.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + iScape.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = iScape.userUtilities.lookupUser(users[i].id);
                iScape.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!iScape.settings.filterChat) return false;
            if (iScape.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(iScape.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(iScape.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < iScape.chatUtilities.spam.length; j++) {
                if (msg === iScape.chatUtilities.spam[j]) {
                    API.sendChat(subChat(iScape.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = iScape.userUtilities.getPermission(chat.uid);
                var user = iScape.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < iScape.room.mutedUsers.length; i++) {
                    if (iScape.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (iScape.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (iScape.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(iScape.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(iScape.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = iScape.chat.roulettejoin;
                var rlLeaveChat = iScape.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === iScape.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 2 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === '!') {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = iScape.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== "!join" && chat.message !== "!leave") {
                    if (userPerm === 0 && !iScape.room.usercommand) return void (0);
                    if (!iScape.room.allcommand) return void (0);
                }
                if (chat.message === '!eta' && iScape.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = iScape.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in iScape.commands) {
                    var cmdCall = iScape.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (iScape.settings.commandLiteral + cmdCall[i] === cmd) {
                            iScape.commands[comm].functionality(chat, iScape.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    iScape.room.usercommand = false;
                    setTimeout(function () {
                        iScape.room.usercommand = true;
                    }, iScape.settings.commandCooldown * 1000);
                }
                if (executed) {
                    if (iScape.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }
                    iScape.room.allcommand = false;
                    setTimeout(function () {
                        iScape.room.allcommand = true;
                    }, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = iScape.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < iScape.room.users.length; j++) {
                        if (iScape.userUtilities.getUser(iScape.room.users[j]).id === chat.uid) {
                            iScape.userUtilities.setLastActivity(iScape.room.users[j]);
                        }

                    }
                }
                iScape.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            if (iScape.userUtilities.getPermission(u) < 2) return API.chatLog(iScape.chat.greyuser);
            if (iScape.userUtilities.getPermission(u) === 2) API.chatLog(iScape.chat.bouncer);
            iScape.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "https://plug.dj/_/chat/" + cid,
                    type: "DELETE"
                })
            };

            var roomURL = window.location.pathname;
            var Check;

            var detect = function(){
                if(roomURL != window.location.pathname){
                    clearInterval(Check)
                    console.log("Killing bot after room change.");
                    storeToStorage();
                    iScape.disconnectAPI();
                    setTimeout(function () {
                        kill();
                    }, 1000);
                }
            };

            Check = setInterval(function(){ detect() }, 100);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = iScape;
            iScape.roomUtilities.updateBlacklists();
            setInterval(iScape.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            iScape.getNewBlacklistedSongs = iScape.roomUtilities.exportNewBlacklistedSongs;
            iScape.logNewBlacklistedSongs = iScape.roomUtilities.logNewBlacklistedSongs;
            if (iScape.room.roomstats.launchTime === null) {
                iScape.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < iScape.room.users.length; j++) {
                iScape.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < iScape.room.users.length; j++) {
                    if (iScape.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    iScape.room.users[ind].inRoom = true;
                }
                else {
                    iScape.room.users.push(new iScape.User(userlist[i].id, userlist[i].username));
                    ind = iScape.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(iScape.room.users[ind].id) + 1;
                iScape.userUtilities.updatePosition(iScape.room.users[ind], wlIndex);
            }
            iScape.room.afkInterval = setInterval(function () {
                iScape.roomUtilities.afkCheck()
            }, 10 * 1000);
            iScape.room.autodisableInterval = setInterval(function () {
                iScape.room.autodisableFunc();
            }, 60 * 60 * 1000);
            iScape.loggedInID = API.getUser().id;
            iScape.status = true;
            API.sendChat('/cap ' + iScape.settings.startupCap);
            API.setVolume(iScape.settings.startupVolume);
            $("#woot").click();
            if (iScape.settings.startupEmoji) {
                var emojibuttonoff = $(".icon-emoji-off");
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            }
            else {
                var emojibuttonon = $(".icon-emoji-on");
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatars capped at ' + iScape.settings.startupCap);
            API.chatLog('Volume set to ' + iScape.settings.startupVolume);
            loadChat(API.sendChat(subChat(iScape.chat.online, {botname: iScape.settings.botName, version: iScape.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = iScape.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (iScape.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !iScape.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                
                                }
                        }
                },
             **/

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;
                        if (msg.length === cmd.length) time = 60;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(iScape.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < iScape.room.users.length; i++) {
                            userTime = iScape.userUtilities.getLastActivity(iScape.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(iScape.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (iScape.room.roomevent) {
                                    iScape.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            iScape.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(iScape.chat.maximumafktimeset, {name: chat.un, time: iScape.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(iScape.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.afkRemoval) {
                            iScape.settings.afkRemoval = !iScape.settings.afkRemoval;
                            clearInterval(iScape.room.afkInterval);
                            API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.afkremoval}));
                        }
                        else {
                            iScape.settings.afkRemoval = !iScape.settings.afkRemoval;
                            iScape.room.afkInterval = setInterval(function () {
                                iScape.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        iScape.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(iScape.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = iScape.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = iScape.roomUtilities.msToStr(inactivity);

                        var launchT = iScape.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline){
                            API.sendChat(subChat(iScape.chat.inactivelonger, {botname: iScape.settings.botName, name: chat.un, username: name}));
                        } else {
                        API.sendChat(subChat(iScape.chat.inactivefor, {name: chat.un, username: name, time: time}));
                        }
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.autodisable) {
                            iScape.settings.autodisable = !iScape.settings.autodisable;
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.autodisable}));
                        }
                        else {
                            iScape.settings.autodisable = !iScape.settings.autodisable;
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.autodisable}));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.room.autoskip) {
                            iScape.room.autoskip = !iScape.room.autoskip;
                            clearTimeout(iScape.room.autoskipTimer);
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.autoskip}));
                        }
                        else {
                            iScape.room.autoskip = !iScape.room.autoskip;
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(iScape.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(iScape.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                            var crowd = API.getUsers();
                            var msg = chat.message;
                            var argument = msg.substring(cmd.length + 1);
                            var randomUser = Math.floor(Math.random() * crowd.length);
                            var randomBall = Math.floor(Math.random() * iScape.chat.balls.length);
                            var randomSentence = Math.floor(Math.random() * 1);
                            API.sendChat(subChat(iScape.chat.ball, {name: chat.un, botname: iScape.settings.botName, question: argument, response: iScape.chat.balls[randomBall]}));
                     }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof iScape.room.blacklists[list] === 'undefined') return API.sendChat(subChat(iScape.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            iScape.room.newBlacklisted.push(track);
                            iScape.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(iScape.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            API.moderateForceSkip();
                            if (typeof iScape.room.newBlacklistedSongFunction === 'function') {
                                iScape.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(iScape.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (iScape.settings.bouncerPlus) {
                            iScape.settings.bouncerPlus = false;
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!iScape.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = iScape.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    iScape.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(iScape.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(iScape.chat.currentbotname, {botname: iScape.settings.botName}));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            iScape.settings.botName = argument;
                            API.sendChat(subChat(iScape.chat.botnameset, {botName: iScape.settings.botName}));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(iScape.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(iScape.chat.commandslink, {botname: iScape.settings.botName, link: iScape.cmdLink}));
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.cmdDeletion) {
                            iScape.settings.cmdDeletion = !iScape.settings.cmdDeletion;
                            API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.cmddeletion}));
                        }
                        else {
                            iScape.settings.cmdDeletion = !iScape.settings.cmdDeletion;
                            API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.cmddeletion}));
                        }
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function (chat) {
                    var c = Math.floor(Math.random() * iScape.chat.cookies.length);
                    return iScape.chat.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(iScape.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = iScape.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(iScape.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(iScape.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(iScape.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        iScape.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.cycleGuard) {
                            iScape.settings.cycleGuard = !iScape.settings.cycleGuard;
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.cycleguard}));
                        }
                        else {
                            iScape.settings.cycleGuard = !iScape.settings.cycleGuard;
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            iScape.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(iScape.chat.cycleguardtime, {name: chat.un, time: iScape.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(iScape.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = iScape.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(iScape.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = iScape.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        var message = $('.message');
                        var emote = $('.emote');
                        var from = $('.un.clickable');
                        for (var i = 0; i < chats.length; i++) {
                            var n = from[i].textContent;
                            if (name.trim() === n.trim()) {

                                // var messagecid = $(message)[i].getAttribute('data-cid');
                                // var emotecid = $(emote)[i].getAttribute('data-cid');
                                // API.moderateDeleteChat(messagecid);

                                // try {
                                //     API.moderateDeleteChat(messagecid);
                                // }
                                // finally {
                                //     API.moderateDeleteChat(emotecid);
                                // }

                                if (typeof $(message)[i].getAttribute('data-cid') == "undefined"){
                                    API.moderateDeleteChat($(emote)[i].getAttribute('data-cid')); // works well with normal messages but not with emotes due to emotes and messages are seperate.
                                } else {
                                    API.moderateDeleteChat($(message)[i].getAttribute('data-cid'));
                                }
                            }
                        }
                        API.sendChat(subChat(iScape.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },*/

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(iScape.chat.emojilist, {link: link}));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if(chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = iScape.userUtilities.lookupUserName(name);
                        if(typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = iScape.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch(lang){
                            case 'en': break;
                            case 'da': ch += 'Vær venlig at tale engelsk.'; break;
                            case 'de': ch += 'Bitte sprechen Sie Englisch.'; break;
                            case 'es': ch += 'Por favor, hable Inglés.'; break;
                            case 'fr': ch += 'Parlez anglais, s\'il vous plaît.'; break;
                            case 'nl': ch += 'Spreek Engels, alstublieft.'; break;
                            case 'pl': ch += 'Proszę mówić po angielsku.'; break;
                            case 'pt': ch += 'Por favor, fale Inglês.'; break;
                            case 'sk': ch += 'Hovorte po anglicky, prosím.'; break;
                            case 'cs': ch += 'Mluvte prosím anglicky.'; break;
                            case 'sr': ch += 'Молим Вас, говорите енглески.'; break;                                  
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = iScape.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        if (pos < 0) return API.sendChat(subChat(iScape.chat.notinwaitlist, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = iScape.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(iScape.chat.eta, {name: name, time: estimateString}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof iScape.settings.fbLink === "string")
                            API.sendChat(subChat(iScape.chat.facebook, {link: iScape.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.filterChat) {
                            iScape.settings.filterChat = !iScape.settings.filterChat;
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.chatfilter}));
                        }
                        else {
                            iScape.settings.filterChat = !iScape.settings.filterChat;
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.chatfilter}));
                        }
                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(iScape.chat.ghosting, {name1: chat.un, name2: name}));
                        }
                        else API.sendChat(subChat(iScape.chat.notghosting, {name1: chat.un, name2: name}));     
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?", 
                                    { 
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating,
                                        "tag": fixedtag
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g,"+");
                            var commatag = tag.replace(/ /g,", ");
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(iScape.chat.validgiftags, {name: chat.un, id: id, tags: commatag}));
                                } else {
                                    API.sendChat(subChat(iScape.chat.invalidgiftags, {name: chat.un, tags: commatag}));
                                }
                            });
                        }
                        else {
                            function get_random_id(api_key, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?", 
                                    { 
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(iScape.chat.validgifrandom, {name: chat.un, id: id}));
                                } else {
                                    API.sendChat(subChat(iScape.chat.invalidgifrandom, {name: chat.un}));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "(Updated link coming soon)";
                        API.sendChat(subChat(iScape.chat.starterhelp, {link: link}));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.historySkip) {
                            iScape.settings.historySkip = !iScape.settings.historySkip;
                            API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.historyskip}));
                        }
                        else {
                            iScape.settings.historySkip = !iScape.settings.historySkip;
                            API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.historyskip}));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.room.roulette.rouletteStatus && iScape.room.roulette.participants.indexOf(chat.uid) < 0) {
                            iScape.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(iScape.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        var join = iScape.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = iScape.roomUtilities.msToStr(time);
                        API.sendChat(subChat(iScape.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = iScape.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));

                        var permFrom = iScape.userUtilities.getPermission(chat.uid);
                        var permTokick = iScape.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(iScape.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(iScape.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(iScape.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(iScape.chat.kill);
                        iScape.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(iScape.chat.currentlang, {language: iScape.settings.language}));
                        var argument = msg.substring(cmd.length + 1);

                        $.get("https://rawgit.com/Yemasthui/iScape/master/lang/langIndex.json", function (json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === "undefined") {
                                API.sendChat(subChat(iScape.chat.langerror, {link: "http://git.io/vJ9nI"}));
                            }
                            else {
                                iScape.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(iScape.chat.langset, {language: iScape.settings.language}));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = iScape.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            iScape.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(iScape.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = iScape.userUtilities.lookupUser(chat.uid);
                        var perm = iScape.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "http://youtu.be/" + media.cid;
                                API.sendChat(subChat(iScape.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(iScape.chat.songlink, {name: from, link: sound.permalink_url}));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        iScape.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = iScape.settings.lockdownEnabled;
                        iScape.settings.lockdownEnabled = !temp;
                        if (iScape.settings.lockdownEnabled) {
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.lockGuard) {
                            iScape.settings.lockGuard = !iScape.settings.lockGuard;
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.lockguard}));
                        }
                        else {
                            iScape.settings.lockGuard = !iScape.settings.lockGuard;
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            iScape.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(iScape.chat.usedlockskip, {name: chat.un}));
                                iScape.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    iScape.room.skippable = false;
                                    setTimeout(function () {
                                        iScape.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        iScape.userUtilities.moveUser(id, iScape.settings.lockskipPosition, false);
                                        iScape.room.queueable = true;
                                        setTimeout(function () {
                                            iScape.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < iScape.settings.lockskipReasons.length; i++) {
                                var r = iScape.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += iScape.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(iScape.chat.usedlockskip, {name: chat.un}));
                                iScape.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    iScape.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        iScape.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        iScape.userUtilities.moveUser(id, iScape.settings.lockskipPosition, false);
                                        iScape.room.queueable = true;
                                        setTimeout(function () {
                                            iScape.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                        }
                    }
                }
            },

            lockskipposCommand: {
                command: 'lockskippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            iScape.settings.lockskipPosition = pos;
                            return API.sendChat(subChat(iScape.chat.lockskippos, {name: chat.un, position: iScape.settings.lockskipPosition}));
                        }
                        else return API.sendChat(subChat(iScape.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            iScape.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(iScape.chat.lockguardtime, {name: chat.un, time: iScape.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(iScape.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(iScape.chat.logout, {name: chat.un, botname: iScape.settings.botName}));
                        setTimeout(function () {
                            $(".logout").mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            iScape.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(iScape.chat.maxlengthtime, {name: chat.un, time: iScape.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(iScape.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + iScape.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!iScape.settings.motdEnabled) iScape.settings.motdEnabled = !iScape.settings.motdEnabled;
                        if (isNaN(argument)) {
                            iScape.settings.motd = argument;
                            API.sendChat(subChat(iScape.chat.motdset, {msg: iScape.settings.motd}));
                        }
                        else {
                            iScape.settings.motdInterval = argument;
                            API.sendChat(subChat(iScape.chat.motdintervalset, {interval: iScape.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === iScape.loggedInID) return API.sendChat(subChat(iScape.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(iScape.chat.move, {name: chat.un}));
                            iScape.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(iScape.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == "" || time == null || typeof time == "undefined") {
                                return API.sendChat(subChat(iScape.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = iScape.userUtilities.getPermission(chat.uid);
                        var permUser = iScape.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             iScape.room.mutedUsers.push(user.id);
                             if (time === null) API.sendChat(subChat(iScape.chat.mutednotime, {name: chat.un, username: name}));
                             else {
                             API.sendChat(subChat(iScape.chat.mutedtime, {name: chat.un, username: name, time: time}));
                             setTimeout(function (id) {
                             var muted = iScape.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === id) {
                             indexMuted = i;
                             wasMuted = true;
                             }
                             }
                             if (indexMuted > -1) {
                             iScape.room.mutedUsers.splice(indexMuted);
                             var u = iScape.userUtilities.lookupUser(id);
                             var name = u.username;
                             API.sendChat(subChat(iScape.chat.unmuted, {name: chat.un, username: name}));
                             }
                             }, time * 60 * 1000, user.id);
                             }
                             */
                            if (time > 45) {
                                API.sendChat(subChat(iScape.chat.mutedmaxtime, {name: chat.un, time: "45"}));
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(iScape.chat.mutedtime, {name: chat.un, username: name, time: time}));

                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(iScape.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(iScape.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(iScape.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                        }
                        else API.sendChat(subChat(iScape.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof iScape.settings.opLink === "string")
                            return API.sendChat(subChat(iScape.chat.oplist, {link: iScape.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(iScape.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        iScape.disconnectAPI();
                        setTimeout(function () {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(iScape.chat.reload);
                        storeToStorage();
                        iScape.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(iScape.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = iScape.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(iScape.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.etaRestriction) {
                            iScape.settings.etaRestriction = !iScape.settings.etaRestriction;
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.etarestriction}));
                        }
                        else {
                            iScape.settings.etaRestriction = !iScape.settings.etaRestriction;
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!iScape.room.roulette.rouletteStatus) {
                            iScape.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof iScape.settings.rulesLink === "string")
                            return API.sendChat(subChat(iScape.chat.roomrules, {link: iScape.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = iScape.room.roomstats.totalWoots;
                        var mehs = iScape.room.roomstats.totalMehs;
                        var grabs = iScape.room.roomstats.totalCurates;
                        API.sendChat(subChat(iScape.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: 'skip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(iScape.chat.skip, {name: chat.un}));
                        API.moderateForceSkip();
                        iScape.room.skippable = false;
                        setTimeout(function () {
                            iScape.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.songstats) {
                            iScape.settings.songstats = !iScape.settings.songstats;
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.songstats}));
                        }
                        else {
                            iScape.settings.songstats = !iScape.settings.songstats;
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.songstats}));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me This bot was created by ' + botCreator + ', but is now maintained by ' + botMaintainer + ".");
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '/me [@' + from + '] ';

                        msg += iScape.chat.afkremoval + ': ';
                        if (iScape.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += iScape.chat.afksremoved + ": " + iScape.room.afkList.length + '. ';
                        msg += iScape.chat.afklimit + ': ' + iScape.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (iScape.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
												
                        msg += iScape.chat.blacklist + ': ';
                        if (iScape.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += iScape.chat.lockguard + ': ';
                        if (iScape.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += iScape.chat.cycleguard + ': ';
                        if (iScape.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += iScape.chat.timeguard + ': ';
                        if (iScape.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += iScape.chat.chatfilter + ': ';
                        if (iScape.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += iScape.chat.historyskip + ': ';
                        if (iScape.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += iScape.chat.voteskip + ': ';
                        if (iScape.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += iScape.chat.cmddeletion + ': ';
                        if (iScape.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += iScape.chat.autoskip + ': ';
                        if (iScape.room.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        
                        var launchT = iScape.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = iScape.roomUtilities.msToStr(durationOnline);
                        msg += subChat(iScape.chat.activefor, {time: since});

                        return API.sendChat(msg);
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.substring(cmd.length + 2, lastSpace);
                        var name2 = msg.substring(lastSpace + 2);
                        var user1 = iScape.userUtilities.lookupUserName(name1);
                        var user2 = iScape.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(iScape.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === iScape.loggedInID || user2.id === iScape.loggedInID) return API.sendChat(subChat(iScape.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 || p2 < 0) return API.sendChat(subChat(iScape.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(iScape.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 < p2) {
                            iScape.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                iScape.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            iScape.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                iScape.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof iScape.settings.themeLink === "string")
                            API.sendChat(subChat(iScape.chat.genres, {link: iScape.settings.themeLink}));
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.timeGuard) {
                            iScape.settings.timeGuard = !iScape.settings.timeGuard;
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.timeguard}));
                        }
                        else {
                            iScape.settings.timeGuard = !iScape.settings.timeGuard;
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.timeguard}));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = iScape.settings.blacklistEnabled;
                        iScape.settings.blacklistEnabled = !temp;
                        if (iScape.settings.blacklistEnabled) {
                          return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.blacklist}));
                    }
                }
            },
						
            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.motdEnabled) {
                            iScape.settings.motdEnabled = !iScape.settings.motdEnabled;
                            API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.motd}));
                        }
                        else {
                            iScape.settings.motdEnabled = !iScape.settings.motdEnabled;
                            API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.motd}));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.voteSkip) {
                            iScape.settings.voteSkip = !iScape.settings.voteSkip;
                            API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.voteskip}));
                        }
                        else {
                            iScape.settings.voteSkip = !iScape.settings.voteSkip;
                            API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.voteskip}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $(".icon-population").click();
                        $(".icon-ban").click();
                        setTimeout(function (chat) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return API.sendChat();
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = API.getBannedUsers();
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) {
                                $(".icon-chat").click();
                                return API.sendChat(subChat(iScape.chat.notbanned, {name: chat.un}));
                            }
                            API.moderateUnbanUser(bannedUser.id);
                            console.log("Unbanned " + name);
                            setTimeout(function () {
                                $(".icon-chat").click();
                            }, 1000);
                        }, 1000, chat);
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        iScape.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var permFrom = iScape.userUtilities.getPermission(chat.uid);
                        /**
                         if (msg.indexOf('@') === -1 && msg.indexOf('all') !== -1) {
                            if (permFrom > 2) {
                                iScape.room.mutedUsers = [];
                                return API.sendChat(subChat(iScape.chat.unmutedeveryone, {name: chat.un}));
                            }
                            else return API.sendChat(subChat(iScape.chat.unmuteeveryonerank, {name: chat.un}));
                        }
                         **/
                        var from = chat.un;
                        var name = msg.substr(cmd.length + 2);

                        var user = iScape.userUtilities.lookupUserName(name);

                        if (typeof user === 'boolean') return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));

                        var permUser = iScape.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             var muted = iScape.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === user.id) {
                             indexMuted = i;
                             wasMuted = true;
                             }

                             }
                             if (!wasMuted) return API.sendChat(subChat(iScape.chat.notmuted, {name: chat.un}));
                             iScape.room.mutedUsers.splice(indexMuted);
                             API.sendChat(subChat(iScape.chat.unmuted, {name: chat.un, username: name}));
                             */
                            try {
                                API.moderateUnmuteUser(user.id);
                                API.sendChat(subChat(iScape.chat.unmuted, {name: chat.un, username: name}));
                            }
                            catch (e) {
                                API.sendChat(subChat(iScape.chat.notmuted, {name: chat.un}));
                            }
                        }
                        else API.sendChat(subChat(iScape.chat.unmuterank, {name: chat.un}));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            iScape.settings.commandCooldown = cd;
                            return API.sendChat(subChat(iScape.chat.commandscd, {name: chat.un, time: iScape.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(iScape.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.usercommandsEnabled) {
                            API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.usercommands}));
                            iScape.settings.usercommandsEnabled = !iScape.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.usercommands}));
                            iScape.settings.usercommandsEnabled = !iScape.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(iScape.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = iScape.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(iScape.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(iScape.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(iScape.chat.voteskiplimit, {name: chat.un, limit: iScape.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!iScape.settings.voteSkip) iScape.settings.voteSkip = !iScape.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(iScape.chat.voteskipinvalidlimit, {name: chat.un}));
                        }
                        else {
                            iScape.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(iScape.chat.voteskipsetlimit, {name: chat.un, limit: iScape.settings.voteSkipLimit}));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (iScape.settings.welcome) {
                            iScape.settings.welcome = !iScape.settings.welcome;
                            return API.sendChat(subChat(iScape.chat.toggleoff, {name: chat.un, 'function': iScape.chat.welcomemsg}));
                        }
                        else {
                            iScape.settings.welcome = !iScape.settings.welcome;
                            return API.sendChat(subChat(iScape.chat.toggleon, {name: chat.un, 'function': iScape.chat.welcomemsg}));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof iScape.settings.website === "string")
                            API.sendChat(subChat(iScape.chat.website, {link: iScape.settings.website}));
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i){
                            if (users[i].username == name){
                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;
                                if (rawlang == "en"){
                                    var language = "English";
                                } else if (rawlang == "bg"){
                                    var language = "Bulgarian";
                                } else if (rawlang == "cs"){
                                    var language = "Czech";
                                } else if (rawlang == "fi"){
                                    var language = "Finnish"
                                } else if (rawlang == "fr"){
                                    var language = "French"
                                } else if (rawlang == "pt"){
                                    var language = "Portuguese"
                                } else if (rawlang == "zh"){
                                    var language = "Chinese"
                                } else if (rawlang == "sk"){
                                    var language = "Slovak"
                                } else if (rawlang == "nl"){
                                    var language = "Dutch"
                                } else if (rawlang == "ms"){
                                    var language = "Malay"
                                }
                                var rawstatus = API.getUser(id).status;
                                if (rawstatus == "0"){
                                    var status = "Available";
                                } else if (rawstatus == "1"){
                                    var status = "Away";
                                } else if (rawstatus == "2"){
                                    var status = "Working";
                                } else if (rawstatus == "3"){
                                    var status = "Gaming"
                                }
                                var rawrank = API.getUser(id).role;
                                if (rawrank == "0"){
                                    var rank = "User";
                                } else if (rawrank == "1"){
                                    var rank = "Resident DJ";
                                } else if (rawrank == "2"){
                                    var rank = "Bouncer";
                                } else if (rawrank == "3"){
                                    var rank = "Manager"
                                } else if (rawrank == "4"){
                                    var rank = "Co-Host"
                                } else if (rawrank == "5"){
                                    var rank = "Host"
                                } else if (rawrank == "7"){
                                    var rank = "Brand Ambassador"
                                } else if (rawrank == "10"){
                                    var rank = "Admin"
                                }
                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = ", Profile: http://plug.dj/@/" + slug;
                                } else {
                                    var profile = "";
                                }

                                API.sendChat(subChat(iScape.chat.whois, {name1: chat.un, name2: name, id: id, avatar: avatar, profile: profile, language: language, level: level, status: status, joined: joined, rank: rank}));
                            }
                        }
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!iScape.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof iScape.settings.youtubeLink === "string")
                            API.sendChat(subChat(iScape.chat.youtube, {name: chat.un, link: iScape.settings.youtubeLink}));
                    }
                }
            }
        }
    };

    loadChat(iScape.startup);
}).call(this);
