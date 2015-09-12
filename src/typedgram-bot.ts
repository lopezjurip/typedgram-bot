/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../definitions/src/node-telegram-bot-api.d.ts"/>

import TelegramBot = require('node-telegram-bot-api');
import {Stream} from 'stream';
import Promise = require('bluebird');

export interface IServerOptions {
    host: string
    port: number
    domain?: string
    key?: string
    cert?: string
}

export const TelegramEvent = {
    // text: 'text', // not included to prevent commands and plain text override
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
}

export type Action = (msg: Message) => Promise<Message>
export type idType = number | string
export type fileType = string | Stream

/**
 * Subclass of TelegramBot provided by node-telegram-bot-api
 */
export class TelegramTypedBot extends TelegramBot {

    /**
     * Collection containing every registered command with the respective action.
     */
    public commands: { [command: string]: Action } = {}

    /**
     * Collection containing every registered event with the respective action.
     * Events like receiving a photo, sticker, etc.
     */
    public events: { [command: string]: Action } = {}

    protected waitingResponse: { [ticket: string]: (msg: Message) => void } = {}

    /**
     * This will be executed when successfully connected to Telegram servers.
     * @type {[type]}
     */
    public initializationAction: (me: User) => void

    /**
     * Action to response to a non-registered action.
     * @type {Action}
     */
    public missingAction: Action

    /**
     * Action to response to plain text messages (without command notation '/').
     * @type {Action}
     */
    public plainTextAction: Action

    /**
     * Timeout to reject the [[waitResponse] promise, in that case throws a [[Promise.TimeoutError]].
     * @type {number}
     */
    public responseTimeout: number = 10000;

    /**
     * Start a bot with a token from Botfather.
     * @param  {string}         token              Telegram Bot API Token
     * @param  {IServerOptions} server             Server configuration to stablish a connection to Telegram servers.
     * @return {[TelegramTypedBot]}                A instance of a bot.
     */
    constructor(token: string, server: IServerOptions) {
        super(token, { webHook: { port: server.port, host: server.host } })
        this.setWebHook(server.domain + ':443/bot' + token)

        this.getMe().then(me => {
            if (this.initializationAction) this.initializationAction(me)
        })

        super.on('text', msg => this.receivedMessage('text', msg))
        super.on(TelegramEvent.audio, msg => this.receivedMessage(TelegramEvent.audio, msg))
        super.on(TelegramEvent.document, msg => this.receivedMessage(TelegramEvent.document, msg))
        super.on(TelegramEvent.photo, msg => this.receivedMessage(TelegramEvent.photo, msg))
        super.on(TelegramEvent.sticker, msg => this.receivedMessage(TelegramEvent.sticker, msg))
        super.on(TelegramEvent.video, msg => this.receivedMessage(TelegramEvent.video, msg))
        super.on(TelegramEvent.contact, msg => this.receivedMessage(TelegramEvent.contact, msg))
        super.on(TelegramEvent.location, msg => this.receivedMessage(TelegramEvent.location, msg))
        super.on(TelegramEvent.group_chat_created, msg => this.receivedMessage(TelegramEvent.group_chat_created, msg))
        super.on(TelegramEvent.new_chat_participant, msg => this.receivedMessage(TelegramEvent.new_chat_participant, msg))
        super.on(TelegramEvent.left_chat_participant, msg => this.receivedMessage(TelegramEvent.left_chat_participant, msg))
        super.on(TelegramEvent.new_chat_title, msg => this.receivedMessage(TelegramEvent.new_chat_title, msg))
        super.on(TelegramEvent.new_chat_photo, msg => this.receivedMessage(TelegramEvent.new_chat_photo, msg))
        super.on(TelegramEvent.delete_chat_photo, msg => this.receivedMessage(TelegramEvent.delete_chat_photo, msg))
    }

    protected _request(path: string, qsopt?: IQs) {
        if (qsopt && qsopt.qs && qsopt.qs.reply_markup) {
            qsopt.qs.reply_markup = JSON.stringify(qsopt.qs.reply_markup)
        }
        return super._request(path, qsopt)
    }

    /**
     * When you send a message, set this on the resolution of the promise to wait for the user response of that message.
     * The response petition is registered to the user and chat id.
     * @param  {Message}   msg Message sent by user, we need this to save the chatId and userId.
     * @param  {number =   this.responseTimeout} timeout Reject this operation after a timeout in milliseconds.
     * @return {[type]}        A promise with the user write-back message.
     */
    public waitResponse(msg: Message, timeout: number = this.responseTimeout): (msg: Message) => Promise<Message> {
        return (response: Message) => {
            var ticket = ''
            return new Promise<Message>((resolve, reject) => {
                ticket = this.getTicketFromMessage(msg)
                this.addToWaiting(ticket, resolve)
            })
            .cancellable()
            .timeout(timeout)
            .catch(Promise.TimeoutError, err => {
                if (ticket !== '') this.removeFromWaiting(ticket)
                throw err
                return err
            })
        }
    }

    protected getTicketFromInfo(chatId: idType, fromId: idType): string {
        return `${chatId},${fromId}`
    }

    protected getTicketFromMessage(msg: Message): string {
        return this.getTicketFromInfo(msg.chat.id, msg.from.id)
    }

    protected addToWaiting(ticket: string, resolve: (msg: Message) => void) {
        this.waitingResponse[ticket] = resolve
    }

    protected removeFromWaiting(ticket: string) {
        delete this.waitingResponse[ticket];
    }

    protected receivedMessage(event: string, msg: Message) {
        const ticket = this.getTicketFromMessage(msg)
        const pendingResolve = this.waitingResponse[ticket]

        if (pendingResolve) {
            this.receivedResponseMessage(msg, ticket, pendingResolve)
        } else {
            this.receivedNonResponseMessage(event, msg)
        }
    }

    protected receivedResponseMessage(msg: Message, ticket: string, pendingResolve: (msg: Message) => void) {
        pendingResolve(msg)
        this.removeFromWaiting(ticket)
    }

    protected receivedNonResponseMessage(event: string, msg: Message) {
        const action = this.events[event]
        if (action) {
            action(msg)
        } else {
            this.receivedText(msg)
        }
    }

    protected receivedText(msg: Message) {
        const text = msg.text.trim()
        const isCommand = text.lastIndexOf('/', 0) === 0
        if (isCommand) {
            const command = text.split(' ')[0]
            const arg = text.replace(command, '').trim()
            this.receivedCommand(command, arg, msg)
        } else {
            this.receivedPlainText(text, msg)
        }
    }

    protected receivedCommand(command: string, arg: string, msg: Message) {
        const action = this.commands[command]
        if (action) {
            action(msg)
        } else if (this.missingAction) {
            this.missingAction(msg)
        }
    }

    protected receivedPlainText(text: string, msg: Message) {
        if (this.plainTextAction) this.plainTextAction(msg)
    }

    /**
     * Register a command or multiple commands as strings with a '/' prefix.
     * The action will be called when a user uses the command.
     * Example:
     * bot.onCommand('/hello'), msg => { /... });
     * @param  {string |      string[]}    commands Commands to register.
     * @param  {Action}    action Must recieve a [[Message]]. This is called when a user uses the command.
     */
    public onCommand(commands: string | string[], action: Action) {
        if (commands instanceof Array) {
            commands.forEach(c => this.commands[<string>c] = action)
        } else {
            this.commands[<string>commands] = action
        }
        console.log('Registered commands:', commands)
    }

    /**
     * You can manually execute commands registered in [[onCommand]] with a specific message.
     * @param  {string}           command Registered command to call, remember the '/' prefix.
     * @param  {Message}          msg     Message to use in that command.
     * @return {Promise<Message>}         Send operation promise returned by that command. Rejects if the command was not registerd.
     */
    public execCommand(command: string, msg: Message): Promise<Message> {
        const action = this.commands[command]
        if (action) {
            return action(msg)
        } else {
            return Promise.reject(`Action for command '${command}' not found`)
        }
    }

    /**
     * Register a event or multiple events of [[TelegramEvent]].
     * Example:
     * bot.onEvent(TelegramEvent.photo), msg => { /... });
     * @param  {string |      string[]}    events Event from [[TelegramEvent]].
     * @param  {Action}    action Action to call when the event is triggered.
     */
    public onEvent(events: string | string[], action: Action) {
        if (events instanceof Array) {
            events.forEach(e => this.events[<string>e] = action)
        } else {
            this.events[<string>events] = action
        }
        console.log('Registered events:', events)
    }

    /**
     * You can manually execute events registered in [[onEvent]] with a specific message.
     * @param  {string}           event Registered event to call from [[TelegramEvent]].
     * @param  {Message}          msg   Message to use in that event associated action.
     * @return {Promise<Message>}       Send operation promise returned by that event. Rejects if the event was not registerd.
     */
    public execEvent(event: string, msg: Message): Promise<Message> {
        const action = this.events[event]
        if (action) {
            return action(msg)
        } else {
            return Promise.reject(`Action for event '${event}' not found`)
        }
    }

    public onPlainText(action: Action) {
        this.plainTextAction = action
        console.log('Registered plain text action.')
    }

    public onMissingCommand(action: Action) {
        this.missingAction = action
        console.log('Registered missing action.')
    }

    public onInitialization(action: (me: User) => void) {
        this.initializationAction = action
        console.log('Registered initialization action.')
    }
}
