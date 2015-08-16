/// <reference path="../typings/node/node.d.ts"/>
/// <reference path="../typings/bluebird/bluebird.d.ts"/>
/// <reference path="./telegram.d.ts"/>
/// <reference path="./telegram-interfaces.ts"/>

import TelegramBot = require("node-telegram-bot-api");
import * as t from './telegram-interfaces';
import {Stream} from "stream";
import {TimeoutError} from "bluebird";

export * from './telegram-interfaces'

export interface IServerOptions {
    host: string
    port: number
    domain: string
}

export interface IBotCommandArgs {
    bot: TelegramBot,
    msg: t.Message,
    arg?: string,
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

export type BotAction = (bot: TelegramBot, msg: t.Message, arg?: string) => void

export type idType = number | string
export type fileType = string | Stream

export class TelegramTypedBot extends TelegramBot {
    protected commands: { [command: string]: BotAction }
    protected events: { [command: string]: BotAction }
    protected waitingResponse: { [messageId: string]: (cmd: IBotCommandArgs) => void }

    public initializationAction: (bot: TelegramBot, me: t.User) => void
    public missingAction: BotAction
    public plainTextAction: BotAction

    constructor(token: string, server: IServerOptions) {
        super(token, { webHook: { port: server.port, host: server.host } })
        this.setWebHook(server.domain + ':443/bot' + token)

        this.commands = {}
        this.events = {}
        this.waitingResponse = {}

        this.getMe().then(me => {
            if (this.initializationAction) this.initializationAction(this, me)
        })

        this.on('text', msg => this.onMessage('text', msg))
        this.on(TelegramEvent.audio, msg => this.onMessage(TelegramEvent.audio, msg))
        this.on(TelegramEvent.document, msg => this.onMessage(TelegramEvent.document, msg))
        this.on(TelegramEvent.photo, msg => this.onMessage(TelegramEvent.photo, msg))
        this.on(TelegramEvent.sticker, msg => this.onMessage(TelegramEvent.sticker, msg))
        this.on(TelegramEvent.video, msg => this.onMessage(TelegramEvent.video, msg))
        this.on(TelegramEvent.contact, msg => this.onMessage(TelegramEvent.contact, msg))
        this.on(TelegramEvent.location, msg => this.onMessage(TelegramEvent.location, msg))
        this.on(TelegramEvent.group_chat_created, msg => this.onMessage(TelegramEvent.group_chat_created, msg))
        this.on(TelegramEvent.new_chat_participant, msg => this.onMessage(TelegramEvent.new_chat_participant, msg))
        this.on(TelegramEvent.left_chat_participant, msg => this.onMessage(TelegramEvent.left_chat_participant, msg))
        this.on(TelegramEvent.new_chat_title, msg => this.onMessage(TelegramEvent.new_chat_title, msg))
        this.on(TelegramEvent.new_chat_photo, msg => this.onMessage(TelegramEvent.new_chat_photo, msg))
        this.on(TelegramEvent.delete_chat_photo, msg => this.onMessage(TelegramEvent.delete_chat_photo, msg))
    }

    protected _request(path: string, qsopt?: t.IQs) {
        if (qsopt && qsopt.qs && qsopt.qs.reply_markup) {
            qsopt.qs.reply_markup = JSON.stringify(qsopt.qs.reply_markup)
        }
        return super._request(path, qsopt)
    }

    protected sendInteractive(chatId: idType, fromId: idType, promise: Promise<t.Message>): Promise<IBotCommandArgs> {
        return new Promise<IBotCommandArgs>((resolve, reject) => {
            var ticket = ""
            promise
                .then(msg => {
                    ticket = this.getTicketFromInfo(chatId, fromId)
                    this.addToWaitingResponse(ticket, resolve)
                }).cancellable().timeout(10000)
                .catch(TimeoutError, err => {
                    if (ticket !== "") this.removeFromWaiting(ticket)
                })
                .catch(err => {
                    reject(err)
                })
        });
    }

    public sendInteractiveMessage(chatId: idType, fromId: idType, text: string, options: t.ISendMessageOptions): Promise<IBotCommandArgs> {
        return this.sendInteractive(chatId, fromId, this.sendMessage(chatId, text, options))
    }

    public sendInteractivePhoto(chatId: idType, fromId: idType, photo: fileType, options?: t.ISendPhotoOptions): Promise<IBotCommandArgs> {
        return this.sendInteractive(chatId, fromId, this.sendPhoto(chatId, photo, options))
    }

    public sendInteractiveAudio(chatId: idType, fromId: idType, audio: fileType, options?: t.ISendAudioOptions): Promise<IBotCommandArgs> {
        return this.sendInteractive(chatId, fromId, this.sendAudio(chatId, audio, options))
    }

    public sendInteractiveDocument(chatId: idType, fromId: idType, path: fileType, options?: t.IReplyOptions): Promise<IBotCommandArgs> {
        return this.sendInteractive(chatId, fromId, this.sendDocument(chatId, path, options))
    }

    public sendInteractiveSticker(chatId: idType, fromId: idType, path: fileType, options?: t.IReplyOptions): Promise<IBotCommandArgs> {
        return this.sendInteractive(chatId, fromId, this.sendSticker(chatId, path, options))
    }

    public sendInteractiveVideo(chatId: idType, fromId: idType, path: fileType, options?: t.ISendVideoOptions): Promise<IBotCommandArgs> {
        return this.sendInteractive(chatId, fromId, this.sendVideo(chatId, path, options))
    }

    public sendInteractiveLocation(chatId: idType, fromId: idType, latitude: number, longitude: number, options?: t.IReplyOptions): Promise<IBotCommandArgs> {
        return this.sendInteractive(chatId, fromId, this.sendLocation(chatId, latitude, longitude, options))
    }

    protected getTicketFromInfo(chatId: idType, fromId: idType): string {
        return `${chatId},${fromId}`
    }

    protected getTicketFromMessage(msg: t.Message): string {
        return this.getTicketFromInfo(msg.chat.id, msg.from.id)
    }

    protected addToWaitingResponse(ticket: string, resolve: (b: IBotCommandArgs) => void) {
        this.waitingResponse[ticket] = resolve
    }

    protected removeFromWaiting(ticket: string) {
        delete this.waitingResponse[ticket];
    }

    protected onMessage(event: string, msg: t.Message) {
        const ticket = this.getTicketFromMessage(msg)
        const pendingResolve = this.waitingResponse[ticket]

        if (pendingResolve) {
            this.onResponseMessage(msg, ticket, pendingResolve)
        } else {
            this.onNonResponseMessage(event, msg)
        }
    }

    protected onResponseMessage(msg: t.Message, ticket: string, pendingResolve: (b: IBotCommandArgs) => void) {
        pendingResolve({ bot: this, msg: msg, arg: msg.text })
        this.removeFromWaiting(ticket)
    }

    protected onNonResponseMessage(event: string, msg: t.Message) {
        const action = this.events[event]
        if (action) {
            action(this, msg)
        } else {
            this.onText(msg)
        }
    }

    protected onText(msg: t.Message) {
        const text = msg.text.trim()
        const isCommand = text.lastIndexOf('/', 0) === 0
        if (isCommand) {
            const command = text.split(' ')[0]
            const arg = text.replace(command, '').trim()
            this.onCommand(command, arg, msg)
        } else {
            this.onPlainText(text, msg)
        }
    }

    protected onCommand(command: string, arg: string, msg: t.Message) {
        const action = this.commands[command]
        if (action) {
            action(this, msg, arg)
        } else if (this.missingAction) {
            this.missingAction(this, msg, arg)
        }
    }

    protected onPlainText(text: string, msg: t.Message) {
        if (this.plainTextAction) {
            this.plainTextAction(this, msg, msg.text)
        }
    }

    public setCommand(commands: string | string[], action: BotAction) {
        if (commands instanceof Array) {
            commands.forEach(c => this.commands[<string>c] = action)
        } else {
            this.commands[<string>commands] = action
        }
        console.log('Registered commands:', commands)
    }

    public command(...commands: string[]) {
        return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
            if (commands.length === 0) {
                this.setCommand(`/${propertyKey}`, descriptor.value)
            } else {
                this.setCommand(commands, descriptor.value)
            }
            return descriptor;
        }
    }

    public setEvent(events: string | string[], action: BotAction) {
        if (events instanceof Array) {
            events.forEach(e => this.events[<string>e] = action)
        } else {
            this.events[<string>events] = action
        }
        console.log('Registered events:', events)
    }

    public event(...events: string[]) {
        return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
            if (events.length === 0) {
                this.setEvent(propertyKey, descriptor.value)
            } else {
                this.setEvent(events, descriptor.value)
            }
            return descriptor;
        }
    }

    public setPlainTextCommand(action: BotAction) {
        this.plainTextAction = action
        console.log('Registered plain text action.')
    }

    public get plainTextCommand() {
        return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
            this.setPlainTextCommand(descriptor.value)
            return descriptor;
        }
    }

    public setMissingCommand(action: BotAction) {
        this.missingAction = action
        console.log('Registered missing action.')
    }

    public get missingCommand() {
        return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
            this.setMissingCommand(descriptor.value)
            return descriptor;
        }
    }

    public setInitializationCommand(action: (bot: TelegramBot, me: t.User) => void) {
        this.initializationAction = action
        console.log('Registered initialization action.')
    }

    public get initialization() {
        return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
            this.setInitializationCommand(descriptor.value)
            return descriptor;
        }
    }
}
