/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/bluebird/bluebird.d.ts" />
/// <reference path="../../src/lib/telegram.d.ts" />
/// <reference path="lib/telegram-interfaces.d.ts" />
import TelegramBot = require("node-telegram-bot-api");
import * as t from './lib/telegram-interfaces';
import { Stream } from "stream";
export * from './lib/telegram-interfaces';
export interface IServerOptions {
    host: string;
    port: number;
    domain: string;
}
export interface IBotCommandArgs {
    bot: TelegramBot;
    msg: t.Message;
    arg?: string;
}
export declare const TelegramEvent: {
    sticker: string;
    photo: string;
    audio: string;
    video: string;
    document: string;
    contact: string;
    location: string;
    new_chat_participant: string;
    left_chat_participant: string;
    new_chat_title: string;
    new_chat_photo: string;
    delete_chat_photo: string;
    group_chat_created: string;
};
export declare type BotAction = (bot: TelegramBot, msg: t.Message, arg?: string) => void;
export declare type idType = number | string;
export declare type fileType = string | Stream;
export declare class TelegramTypedBot extends TelegramBot {
    protected commands: {
        [command: string]: BotAction;
    };
    protected events: {
        [command: string]: BotAction;
    };
    protected waitingResponse: {
        [messageId: string]: (cmd: IBotCommandArgs) => void;
    };
    initializationAction: (bot: TelegramBot, me: t.User) => void;
    missingAction: BotAction;
    plainTextAction: BotAction;
    constructor(token: string, server: IServerOptions);
    protected _request(path: string, qsopt?: t.IQs): Promise<t.Message>;
    protected sendInteractive(chatId: idType, fromId: idType, promise: Promise<t.Message>): Promise<IBotCommandArgs>;
    sendInteractiveMessage(chatId: idType, fromId: idType, text: string, options: t.ISendMessageOptions): Promise<IBotCommandArgs>;
    sendInteractivePhoto(chatId: idType, fromId: idType, photo: fileType, options?: t.ISendPhotoOptions): Promise<IBotCommandArgs>;
    sendInteractiveAudio(chatId: idType, fromId: idType, audio: fileType, options?: t.ISendAudioOptions): Promise<IBotCommandArgs>;
    sendInteractiveDocument(chatId: idType, fromId: idType, path: fileType, options?: t.IReplyOptions): Promise<IBotCommandArgs>;
    sendInteractiveSticker(chatId: idType, fromId: idType, path: fileType, options?: t.IReplyOptions): Promise<IBotCommandArgs>;
    sendInteractiveVideo(chatId: idType, fromId: idType, path: fileType, options?: t.ISendVideoOptions): Promise<IBotCommandArgs>;
    sendInteractiveLocation(chatId: idType, fromId: idType, latitude: number, longitude: number, options?: t.IReplyOptions): Promise<IBotCommandArgs>;
    protected getTicketFromInfo(chatId: idType, fromId: idType): string;
    protected getTicketFromMessage(msg: t.Message): string;
    protected addToWaitingResponse(ticket: string, resolve: (b: IBotCommandArgs) => void): void;
    protected removeFromWaiting(ticket: string): void;
    protected onMessage(event: string, msg: t.Message): void;
    protected onResponseMessage(msg: t.Message, ticket: string, pendingResolve: (b: IBotCommandArgs) => void): void;
    protected onNonResponseMessage(event: string, msg: t.Message): void;
    protected onText(msg: t.Message): void;
    protected onCommand(command: string, arg: string, msg: t.Message): void;
    protected onPlainText(text: string, msg: t.Message): void;
    setCommand(commands: string | string[], action: BotAction): void;
    command(...commands: string[]): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
    setEvent(events: string | string[], action: BotAction): void;
    event(...events: string[]): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
    setPlainTextCommand(action: BotAction): void;
    plainTextCommand: (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
    setMissingCommand(action: BotAction): void;
    missingCommand: (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
    setInitializationCommand(action: (bot: TelegramBot, me: t.User) => void): void;
    initialization: (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
}
