/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../definitions/src/node-telegram-bot-api.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TelegramBot = require('node-telegram-bot-api');
var Promise = require('bluebird');
/**
 * Object with the posible events from Telegram.
 * 'text' not included to prevent command and plain text override.
 *
 * @type Object
 */
exports.TelegramEvent = {
    // text: 'text',
    sticker: 'sticker',
    photo: 'photo',
    audio: 'audio',
    video: 'video',
    voice: 'voice',
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
/**
 * Subclass of TelegramBot provided by node-telegram-bot-api
 */
var TelegramTypedBot = (function (_super) {
    __extends(TelegramTypedBot, _super);
    /**
     * Start a bot with a token from Botfather.
     *
     * @param  {string}         token              Telegram Bot API Token
     * @param  {IServerOptions} server             Server configuration to stablish a connection to Telegram servers.
     * @return {[TelegramTypedBot]}                A instance of a bot.
     */
    function TelegramTypedBot(token, server) {
        var _this = this;
        _super.call(this, token, { webHook: { port: server.port, host: server.host } });
        /**
         * Collection containing every registered command with the respective action.
         */
        this.commands = {};
        /**
         * Collection containing every registered event with the respective action.
         * Events like receiving a photo, sticker, etc. See [[TelegramEvent]].
         */
        this.events = {};
        /**
         * Collection to store pending responses.
         */
        this.waitingResponse = {};
        /**
         * Timeout to reject the [[waitResponse] promise, in that case throws a [[Promise.TimeoutError]].
         *
         * @type number
         */
        this.responseTimeout = 10000;
        this.setWebHook(server.domain + ':443/bot' + token);
        this.getMe().then(function (me) {
            _this.id = me.id;
            _this.username = me.username;
            _this.name = me.first_name;
            if (_this.initializationAction)
                _this.initializationAction(me);
        });
        _super.prototype.on.call(this, 'text', function (msg) { return _this.receivedMessage('text', msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.audio, function (msg) { return _this.receivedMessage(exports.TelegramEvent.audio, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.document, function (msg) { return _this.receivedMessage(exports.TelegramEvent.document, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.photo, function (msg) { return _this.receivedMessage(exports.TelegramEvent.photo, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.sticker, function (msg) { return _this.receivedMessage(exports.TelegramEvent.sticker, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.video, function (msg) { return _this.receivedMessage(exports.TelegramEvent.video, msg); });
        _super.prototype.on.call(this, exports.TelegramEvent.voice, function (msg) { return _this.receivedMessage(exports.TelegramEvent.voice, msg); });
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
    /**
     * When you send a message, set this on the resolution of the promise to wait for the user response of that message.
     * The response petition is registered to the user and chat id.
     *
     * @param  {Message}   msg Message sent by user, we need this to save the chatId and userId.
     * @param  {number =   this.responseTimeout} timeout Reject this operation after a timeout in milliseconds.
     * @return {Promise<Message>}        A promise with the user write-back message.
     */
    TelegramTypedBot.prototype.waitResponse = function (msg, timeout) {
        var _this = this;
        if (timeout === void 0) { timeout = this.responseTimeout; }
        return function (response) {
            var ticket = '';
            return new Promise(function (resolve, reject) {
                ticket = _this.getTicketFromMessage(msg);
                _this.addToWaiting(ticket, resolve);
            })
                .cancellable()
                .timeout(timeout)
                .catch(Promise.TimeoutError, function (err) {
                if (ticket !== '')
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
        if (this.events[event]) {
            this.events[event](msg);
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
            this.receivedCommand(command, msg);
        }
        else {
            this.receivedPlainText(text, msg);
        }
    };
    TelegramTypedBot.prototype.receivedCommand = function (command, msg) {
        if (this.commands[command]) {
            this.commands[command](msg);
        }
        else {
            this.missingAction(msg);
        }
    };
    TelegramTypedBot.prototype.receivedPlainText = function (text, msg) {
        if (this.plainTextAction)
            this.plainTextAction(msg);
    };
    /**
     * Register a command or multiple commands as strings with a '/' prefix.
     * The action will be called when a user uses the command.
     *
     * Example:
     * bot.onCommand('/hello'), msg => { /... });
     *
     * @param  {string | string[]}    commands Commands to register.
     * @param  {Action}    action Must recieve a [[Message]]. This is called when a user uses the command.
     */
    TelegramTypedBot.prototype.onCommand = function (commands, action) {
        var _this = this;
        if (commands instanceof Array) {
            commands.forEach(function (c) { return _this.commands[c] = action; });
        }
        else {
            this.commands[commands] = action;
        }
        // console.log('Registered commands:', commands)
    };
    /**
     * You can manually execute commands registered in [[onCommand]] with a specific message.
     *
     * @param  {string}           command Registered command to call, remember the '/' prefix.
     * @param  {Message}          msg     Message to use in that command.
     * @return {Promise<Message>}         Send operation promise returned by that command. Rejected if the command was not registerd.
     */
    TelegramTypedBot.prototype.execCommand = function (command, msg) {
        if (this.commands[command]) {
            return this.commands[command](msg);
        }
        else {
            return Promise.reject("Action for command '" + command + "' not found");
        }
    };
    /**
     * Register a event or multiple events of [[TelegramEvent]].
     *
     * Example:
     * bot.onEvent(TelegramEvent.photo), msg => { /... });
     *
     * @param  {string | string[]}    events Event from [[TelegramEvent]].
     * @param  {Action}    action Action to call when the event is triggered.
     */
    TelegramTypedBot.prototype.onEvent = function (events, action) {
        var _this = this;
        if (events instanceof Array) {
            events.forEach(function (e) { return _this.events[e] = action; });
        }
        else {
            this.events[events] = action;
        }
        // console.log('Registered events:', events)
    };
    /**
     * You can manually execute events registered in [[onEvent]] with a specific message.
     *
     * @param  {string}           event Registered event to call from [[TelegramEvent]].
     * @param  {Message}          msg   Message to use in that event associated action.
     * @return {Promise<Message>}       Send operation promise returned by that event. Rejected if the event was not registerd.
     */
    TelegramTypedBot.prototype.execEvent = function (event, msg) {
        if (this.events[event]) {
            return this.events[event](msg);
        }
        else {
            return Promise.reject("Action for event '" + event + "' not found");
        }
    };
    /**
     * Register this action to respond to plain text commands.
     * This is called only if [[waitResponse]] is not active.
     *
     * @param  {Action} action Action to call on plain text.
     */
    TelegramTypedBot.prototype.onPlainText = function (action) {
        this.plainTextAction = action;
        // console.log('Registered plain text action.')
    };
    /**
     * Register action to respond to non-registered commands.
     * This is optional.
     *
     * @param  {Action} action Action to call on non-registered command request.
     */
    TelegramTypedBot.prototype.onMissingCommand = function (action) {
        this.missingAction = action;
        // console.log('Registered missing action.')
    };
    /**
     * Execute this when the bot is successfully deployed.
     *
     * @param  {User}   action Bot's User object with his Telegram information.
     */
    TelegramTypedBot.prototype.onInitialization = function (action) {
        this.initializationAction = action;
        // console.log('Registered initialization action.')
    };
    return TelegramTypedBot;
})(TelegramBot);
exports.TelegramTypedBot = TelegramTypedBot;
