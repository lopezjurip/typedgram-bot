/// <reference path="../typings/tsd.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TelegramBot = require("node-telegram-bot-api");
var bluebird_1 = require("bluebird");
var TypedgramBot;
(function (TypedgramBot) {
    TypedgramBot.TelegramEvent = {
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
            this.setWebHook(server.domain + ':443/bot' + token);
            this.commands = {};
            this.events = {};
            this.waitingResponse = {};
            this.getMe().then(function (me) {
                if (_this.initializationAction)
                    _this.initializationAction(_this, me);
            });
            this.on('text', function (msg) { return _this.onMessage('text', msg); });
            this.on(TypedgramBot.TelegramEvent.audio, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.audio, msg); });
            this.on(TypedgramBot.TelegramEvent.document, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.document, msg); });
            this.on(TypedgramBot.TelegramEvent.photo, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.photo, msg); });
            this.on(TypedgramBot.TelegramEvent.sticker, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.sticker, msg); });
            this.on(TypedgramBot.TelegramEvent.video, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.video, msg); });
            this.on(TypedgramBot.TelegramEvent.contact, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.contact, msg); });
            this.on(TypedgramBot.TelegramEvent.location, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.location, msg); });
            this.on(TypedgramBot.TelegramEvent.group_chat_created, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.group_chat_created, msg); });
            this.on(TypedgramBot.TelegramEvent.new_chat_participant, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.new_chat_participant, msg); });
            this.on(TypedgramBot.TelegramEvent.left_chat_participant, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.left_chat_participant, msg); });
            this.on(TypedgramBot.TelegramEvent.new_chat_title, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.new_chat_title, msg); });
            this.on(TypedgramBot.TelegramEvent.new_chat_photo, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.new_chat_photo, msg); });
            this.on(TypedgramBot.TelegramEvent.delete_chat_photo, function (msg) { return _this.onMessage(TypedgramBot.TelegramEvent.delete_chat_photo, msg); });
        }
        TelegramTypedBot.prototype._request = function (path, qsopt) {
            if (qsopt && qsopt.qs && qsopt.qs.reply_markup) {
                qsopt.qs.reply_markup = JSON.stringify(qsopt.qs.reply_markup);
            }
            return _super.prototype._request.call(this, path, qsopt);
        };
        TelegramTypedBot.prototype.sendInteractive = function (chatId, fromId, promise) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var ticket = "";
                promise
                    .then(function (msg) {
                    ticket = _this.getTicketFromInfo(chatId, fromId);
                    _this.addToWaitingResponse(ticket, resolve);
                }).cancellable().timeout(10000)
                    .catch(bluebird_1.TimeoutError, function (err) {
                    if (ticket !== "")
                        _this.removeFromWaiting(ticket);
                })
                    .catch(function (err) {
                    reject(err);
                });
            });
        };
        TelegramTypedBot.prototype.sendInteractiveMessage = function (chatId, fromId, text, options) {
            return this.sendInteractive(chatId, fromId, this.sendMessage(chatId, text, options));
        };
        TelegramTypedBot.prototype.sendInteractivePhoto = function (chatId, fromId, photo, options) {
            return this.sendInteractive(chatId, fromId, this.sendPhoto(chatId, photo, options));
        };
        TelegramTypedBot.prototype.sendInteractiveAudio = function (chatId, fromId, audio, options) {
            return this.sendInteractive(chatId, fromId, this.sendAudio(chatId, audio, options));
        };
        TelegramTypedBot.prototype.sendInteractiveDocument = function (chatId, fromId, path, options) {
            return this.sendInteractive(chatId, fromId, this.sendDocument(chatId, path, options));
        };
        TelegramTypedBot.prototype.sendInteractiveSticker = function (chatId, fromId, path, options) {
            return this.sendInteractive(chatId, fromId, this.sendSticker(chatId, path, options));
        };
        TelegramTypedBot.prototype.sendInteractiveVideo = function (chatId, fromId, path, options) {
            return this.sendInteractive(chatId, fromId, this.sendVideo(chatId, path, options));
        };
        TelegramTypedBot.prototype.sendInteractiveLocation = function (chatId, fromId, latitude, longitude, options) {
            return this.sendInteractive(chatId, fromId, this.sendLocation(chatId, latitude, longitude, options));
        };
        TelegramTypedBot.prototype.getTicketFromInfo = function (chatId, fromId) {
            return chatId + "," + fromId;
        };
        TelegramTypedBot.prototype.getTicketFromMessage = function (msg) {
            return this.getTicketFromInfo(msg.chat.id, msg.from.id);
        };
        TelegramTypedBot.prototype.addToWaitingResponse = function (ticket, resolve) {
            this.waitingResponse[ticket] = resolve;
        };
        TelegramTypedBot.prototype.removeFromWaiting = function (ticket) {
            delete this.waitingResponse[ticket];
        };
        TelegramTypedBot.prototype.onMessage = function (event, msg) {
            var ticket = this.getTicketFromMessage(msg);
            var pendingResolve = this.waitingResponse[ticket];
            if (pendingResolve) {
                this.onResponseMessage(msg, ticket, pendingResolve);
            }
            else {
                this.onNonResponseMessage(event, msg);
            }
        };
        TelegramTypedBot.prototype.onResponseMessage = function (msg, ticket, pendingResolve) {
            pendingResolve({ bot: this, msg: msg, arg: msg.text });
            this.removeFromWaiting(ticket);
        };
        TelegramTypedBot.prototype.onNonResponseMessage = function (event, msg) {
            var action = this.events[event];
            if (action) {
                action(this, msg);
            }
            else {
                this.onText(msg);
            }
        };
        TelegramTypedBot.prototype.onText = function (msg) {
            var text = msg.text.trim();
            var isCommand = text.lastIndexOf('/', 0) === 0;
            if (isCommand) {
                var command = text.split(' ')[0];
                var arg = text.replace(command, '').trim();
                this.onCommand(command, arg, msg);
            }
            else {
                this.onPlainText(text, msg);
            }
        };
        TelegramTypedBot.prototype.onCommand = function (command, arg, msg) {
            var action = this.commands[command];
            if (action) {
                action(this, msg, arg);
            }
            else if (this.missingAction) {
                this.missingAction(this, msg, arg);
            }
        };
        TelegramTypedBot.prototype.onPlainText = function (text, msg) {
            if (this.plainTextAction) {
                this.plainTextAction(this, msg, msg.text);
            }
        };
        TelegramTypedBot.prototype.setCommand = function (commands, action) {
            var _this = this;
            if (commands instanceof Array) {
                commands.forEach(function (c) { return _this.commands[c] = action; });
            }
            else {
                this.commands[commands] = action;
            }
            console.log('Registered commands:', commands);
        };
        TelegramTypedBot.prototype.command = function () {
            var _this = this;
            var commands = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                commands[_i - 0] = arguments[_i];
            }
            return function (target, propertyKey, descriptor) {
                if (commands.length === 0) {
                    _this.setCommand("/" + propertyKey, descriptor.value);
                }
                else {
                    _this.setCommand(commands, descriptor.value);
                }
                return descriptor;
            };
        };
        TelegramTypedBot.prototype.setEvent = function (events, action) {
            var _this = this;
            if (events instanceof Array) {
                events.forEach(function (e) { return _this.events[e] = action; });
            }
            else {
                this.events[events] = action;
            }
            console.log('Registered events:', events);
        };
        TelegramTypedBot.prototype.event = function () {
            var _this = this;
            var events = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                events[_i - 0] = arguments[_i];
            }
            return function (target, propertyKey, descriptor) {
                if (events.length === 0) {
                    _this.setEvent(propertyKey, descriptor.value);
                }
                else {
                    _this.setEvent(events, descriptor.value);
                }
                return descriptor;
            };
        };
        TelegramTypedBot.prototype.setPlainTextCommand = function (action) {
            this.plainTextAction = action;
            console.log('Registered plain text action.');
        };
        Object.defineProperty(TelegramTypedBot.prototype, "plainTextCommand", {
            get: function () {
                var _this = this;
                return function (target, propertyKey, descriptor) {
                    _this.setPlainTextCommand(descriptor.value);
                    return descriptor;
                };
            },
            enumerable: true,
            configurable: true
        });
        TelegramTypedBot.prototype.setMissingCommand = function (action) {
            this.missingAction = action;
            console.log('Registered missing action.');
        };
        Object.defineProperty(TelegramTypedBot.prototype, "missingCommand", {
            get: function () {
                var _this = this;
                return function (target, propertyKey, descriptor) {
                    _this.setMissingCommand(descriptor.value);
                    return descriptor;
                };
            },
            enumerable: true,
            configurable: true
        });
        TelegramTypedBot.prototype.setInitializationCommand = function (action) {
            this.initializationAction = action;
            console.log('Registered initialization action.');
        };
        Object.defineProperty(TelegramTypedBot.prototype, "initialization", {
            get: function () {
                var _this = this;
                return function (target, propertyKey, descriptor) {
                    _this.setInitializationCommand(descriptor.value);
                    return descriptor;
                };
            },
            enumerable: true,
            configurable: true
        });
        return TelegramTypedBot;
    })(TelegramBot);
    TypedgramBot.TelegramTypedBot = TelegramTypedBot;
})(TypedgramBot = exports.TypedgramBot || (exports.TypedgramBot = {}));
