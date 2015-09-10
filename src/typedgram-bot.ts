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

export class TelegramTypedBot extends TelegramBot {
    public commands: { [command: string]: Action } = {}
    public events: { [command: string]: Action } = {}
    protected waitingResponse: { [ticket: string]: (msg: Message) => void } = {}

    public initializationAction: (me: User) => void
    public missingAction: Action
    public plainTextAction: Action

    public responseTimeout: number = 10000;

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

    public onCommand(commands: string | string[], action: Action) {
        if (commands instanceof Array) {
            commands.forEach(c => this.commands[<string>c] = action)
        } else {
            this.commands[<string>commands] = action
        }
        console.log('Registered commands:', commands)
    }

    public execCommand(command: string, msg: Message): Promise<Message> {
        const action = this.commands[command]
        if (action) {
            return action(msg)
        } else {
            return Promise.reject(`Action for command '${command}' not found`)
        }
    }

    public onEvent(events: string | string[], action: Action) {
        if (events instanceof Array) {
            events.forEach(e => this.events[<string>e] = action)
        } else {
            this.events[<string>events] = action
        }
        console.log('Registered events:', events)
    }

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
