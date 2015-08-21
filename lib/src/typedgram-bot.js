/// <reference path="../typings/tsd.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TelegramBot = require("node-telegram-bot-api");
var Promise = require("bluebird");
var TIMEOUT = 10000;
exports.TelegramEvent = {
    sticker: 'sticker',
    photo: 'photo',
    audio: 'audio',
    video: 'video',
    document: 'document',
    contact: 'contact',
    location: 'location',
    new_chat_participant: 'new_chat_participant',
    left_chat_participant: 'left_chat_participant',
    new_chat_title: 'new_chat_title',
    new_chat_photo: 'new_chat_photo',
    delete_chat_photo: 'delete_chat_photo',
    group_chat_created: 'group_chat_created',
};
var TelegramTypedBot = (function (_super) {
    __extends(TelegramTypedBot, _super);
    function TelegramTypedBot(token, server) {
        var _this = this;
        _super.call(this, token, { webHook: { port: server.port, host: server.host } });
        this.commands = {};
        this.events = {};
        this.waitingResponse = {};
        this.setWebHook(server.domain + ':443/bot' + token);
        this.getMe().then(function (me) {
            if (_this.initializationAction)
                _this.initializationAction(me);
        });
        _super.prototype.on.call(this, 'text', function (msg) { return _this.receivedMessage('text', msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.audio, function (msg) { return _this.receivedMessage(exports.TelegramEvent.audio, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.document, function (msg) { return _this.receivedMessage(exports.TelegramEvent.document, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.photo, function (msg) { return _this.receivedMessage(exports.TelegramEvent.photo, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.sticker, function (msg) { return _this.receivedMessage(exports.TelegramEvent.sticker, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.video, function (msg) { return _this.receivedMessage(exports.TelegramEvent.video, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.contact, function (msg) { return _this.receivedMessage(exports.TelegramEvent.contact, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.location, function (msg) { return _this.receivedMessage(exports.TelegramEvent.location, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.group_chat_created, function (msg) { return _this.receivedMessage(exports.TelegramEvent.group_chat_created, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.new_chat_participant, function (msg) { return _this.receivedMessage(exports.TelegramEvent.new_chat_participant, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.left_chat_participant, function (msg) { return _this.receivedMessage(exports.TelegramEvent.left_chat_participant, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.new_chat_title, function (msg) { return _this.receivedMessage(exports.TelegramEvent.new_chat_title, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.new_chat_photo, function (msg) { return _this.receivedMessage(exports.TelegramEvent.new_chat_photo, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.delete_chat_photo, function (msg) { return _this.receivedMessage(exports.TelegramEvent.delete_chat_photo, msg); });
    }
    TelegramTypedBot.prototype._request = function (path, qsopt) {
        if (qsopt && qsopt.qs && qsopt.qs.reply_markup) {
            qsopt.qs.reply_markup = JSON.stringify(qsopt.qs.reply_markup);
        }
        return _super.prototype._request.call(this, path, qsopt);
    };
    TelegramTypedBot.prototype.waitResponse = function (msg, timeout) {
        var _this = this;
        if (timeout === void 0) { timeout = TIMEOUT; }
        return function (response) {
            var ticket = "";
            return new Promise(function (resolve, reject) {
                ticket = _this.getTicketFromMessage(msg);
                _this.addToWaiting(ticket, resolve);
            })
                .cancellable()
                .timeout(timeout)
                .catch(Promise.TimeoutError, function (err) {
                if (ticket !== "")
                    _this.removeFromWaiting(ticket);
                throw err;
                return err;
            });
        };
    };
    TelegramTypedBot.prototype.getTicketFromInfo = function (chatId, fromId) {
        return chatId + "," + fromId;
    };
    TelegramTypedBot.prototype.getTicketFromMessage = function (msg) {
        return this.getTicketFromInfo(msg.chat.id, msg.from.id);
    };
    TelegramTypedBot.prototype.addToWaiting = function (ticket, resolve) {
        this.waitingResponse[ticket] = resolve;
    };
    TelegramTypedBot.prototype.removeFromWaiting = function (ticket) {
        delete this.waitingResponse[ticket];
    };
    TelegramTypedBot.prototype.receivedMessage = function (event, msg) {
        var ticket = this.getTicketFromMessage(msg);
        var pendingResolve = this.waitingResponse[ticket];
        if (pendingResolve) {
            this.receivedResponseMessage(msg, ticket, pendingResolve);
        }
        else {
            this.receivedNonResponseMessage(event, msg);
        }
    };
    TelegramTypedBot.prototype.receivedResponseMessage = function (msg, ticket, pendingResolve) {
        pendingResolve(msg);
        this.removeFromWaiting(ticket);
    };
    TelegramTypedBot.prototype.receivedNonResponseMessage = function (event, msg) {
        var action = this.events[event];
        if (action) {
            action(msg);
        }
        else {
            this.receivedText(msg);
        }
    };
    TelegramTypedBot.prototype.receivedText = function (msg) {
        var text = msg.text.trim();
        var isCommand = text.lastIndexOf('/', 0) === 0;
        if (isCommand) {
            var command = text.split(' ')[0];
            var arg = text.replace(command, '').trim();
            this.receivedCommand(command, arg, msg);
        }
        else {
            this.receivedPlainText(text, msg);
        }
    };
    TelegramTypedBot.prototype.receivedCommand = function (command, arg, msg) {
        var action = this.commands[command];
        if (action) {
            action(msg);
        }
        else if (this.missingAction) {
            this.missingAction(msg);
        }
    };
    TelegramTypedBot.prototype.receivedPlainText = function (text, msg) {
        if (this.plainTextAction)
            this.plainTextAction(msg);
    };
    TelegramTypedBot.prototype.onCommand = function (commands, action) {
        var _this = this;
        if (commands instanceof Array) {
            commands.forEach(function (c) { return _this.commands[c] = action; });
        }
        else {
            this.commands[commands] = action;
        }
        console.log('Registered commands:', commands);
    };
    TelegramTypedBot.prototype.execCommand = function (command, msg) {
        var action = this.commands[command];
        if (action) {
            return action(msg);
        }
        else {
            return Promise.reject("Action for command '" + command + "' not found");
        }
    };
    TelegramTypedBot.prototype.onEvent = function (events, action) {
        var _this = this;
        if (events instanceof Array) {
            events.forEach(function (e) { return _this.events[e] = action; });
        }
        else {
            this.events[events] = action;
        }
        console.log('Registered events:', events);
    };
    TelegramTypedBot.prototype.execEvent = function (event, msg) {
        var action = this.events[event];
        if (action) {
            return action(msg);
        }
        else {
            return Promise.reject("Action for event '" + event + "' not found");
        }
    };
    TelegramTypedBot.prototype.onPlainText = function (action) {
        this.plainTextAction = action;
        console.log('Registered plain text action.');
    };
    TelegramTypedBot.prototype.onMissingCommand = function (action) {
        this.missingAction = action;
        console.log('Registered missing action.');
    };
    TelegramTypedBot.prototype.onInitialization = function (action) {
        this.initializationAction = action;
        console.log('Registered initialization action.');
    };
    return TelegramTypedBot;
})(TelegramBot);
exports.TelegramTypedBot = TelegramTypedBot;
