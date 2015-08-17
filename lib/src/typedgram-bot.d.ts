/// <reference path="../../typings/node-telegram-bot-api/node-telegram-bot-api.d.ts" />
import TelegramBot = require("node-telegram-bot-api");
import { Stream } from "stream";
export interface IServerOptions {
    host: string;
    port: number;
    domain: string;
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
export declare type BotAction = (bot: TelegramBot, msg: Message, arg?: string) => void;
export declare type idType = number | string;
export declare type fileType = string | Stream;
export declare class TelegramTypedBot extends TelegramBot {
    commands: {
        [command: string]: BotAction;
    };
    events: {
        [command: string]: BotAction;
    };
    protected waitingResponse: {
        [ticket: string]: (msg: Message) => void;
    };
    initializationAction: (bot: TelegramBot, me: User) => void;
    missingAction: BotAction;
    plainTextAction: BotAction;
    constructor(token: string, server: IServerOptions);
    protected _request(path: string, qsopt?: IQs): Promise<Message>;
    protected sendInteractive(chatId: idType, fromId: idType, promise: Promise<Message>): Promise<Message>;
    sendInteractiveMessage(chatId: idType, fromId: idType, text: string, options?: ISendMessageOptions): Promise<Message>;
    sendInteractivePhoto(chatId: idType, fromId: idType, photo: fileType, options?: ISendPhotoOptions): Promise<Message>;
    sendInteractiveAudio(chatId: idType, fromId: idType, audio: fileType, options?: ISendAudioOptions): Promise<Message>;
    sendInteractiveDocument(chatId: idType, fromId: idType, path: fileType, options?: IReplyOptions): Promise<Message>;
    sendInteractiveSticker(chatId: idType, fromId: idType, path: fileType, options?: IReplyOptions): Promise<Message>;
    sendInteractiveVideo(chatId: idType, fromId: idType, path: fileType, options?: ISendVideoOptions): Promise<Message>;
    sendInteractiveLocation(chatId: idType, fromId: idType, latitude: number, longitude: number, options?: IReplyOptions): Promise<Message>;
    protected getTicketFromInfo(chatId: idType, fromId: idType): string;
    protected getTicketFromMessage(msg: Message): string;
    protected addToWaitingResponse(ticket: string, resolve: (msg: Message) => void): void;
    protected removeFromWaiting(ticket: string): void;
    protected onMessage(event: string, msg: Message): void;
    protected onResponseMessage(msg: Message, ticket: string, pendingResolve: (msg: Message) => void): void;
    protected onNonResponseMessage(event: string, msg: Message): void;
    protected onText(msg: Message): void;
    protected onCommand(command: string, arg: string, msg: Message): void;
    protected onPlainText(text: string, msg: Message): void;
    setCommand(commands: string | string[], action: BotAction): void;
    command(...commands: string[]): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
    setEvent(events: string | string[], action: BotAction): void;
    event(...events: string[]): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
    setPlainText(action: BotAction): void;
    plainText: (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
    setMissingCommand(action: BotAction): void;
    missingCommand: (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
    setInitialization(action: (bot: TelegramBot, me: User) => void): void;
    initialization: (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
}
