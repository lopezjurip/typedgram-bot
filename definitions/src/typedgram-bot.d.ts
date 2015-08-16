/// <reference path="../../typings/tsd.d.ts" />
declare module 'typedgram-bot' {
    import TelegramBot = require("node-telegram-bot-api");
    import { Stream } from "stream";
    interface IServerOptions {
        host: string;
        port: number;
        domain: string;
    }
    interface IBotCommandArgs {
        bot: TelegramBot;
        msg: Message;
        arg?: string;
    }
    const TelegramEvent: {
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
    type BotAction = (bot: TelegramBot, msg: Message, arg?: string) => void;
    type idType = number | string;
    type fileType = string | Stream;
    class TelegramTypedBot extends TelegramBot {
        protected commands: {
            [command: string]: BotAction;
        };
        protected events: {
            [command: string]: BotAction;
        };
        protected waitingResponse: {
            [messageId: string]: (cmd: IBotCommandArgs) => void;
        };
        initializationAction: (bot: TelegramBot, me: User) => void;
        missingAction: BotAction;
        plainTextAction: BotAction;
        constructor(token: string, server: IServerOptions);
        protected _request(path: string, qsopt?: IQs): Promise<Message>;
        protected sendInteractive(chatId: idType, fromId: idType, promise: Promise<Message>): Promise<IBotCommandArgs>;
        sendInteractiveMessage(chatId: idType, fromId: idType, text: string, options?: ISendMessageOptions): Promise<IBotCommandArgs>;
        sendInteractivePhoto(chatId: idType, fromId: idType, photo: fileType, options?: ISendPhotoOptions): Promise<IBotCommandArgs>;
        sendInteractiveAudio(chatId: idType, fromId: idType, audio: fileType, options?: ISendAudioOptions): Promise<IBotCommandArgs>;
        sendInteractiveDocument(chatId: idType, fromId: idType, path: fileType, options?: IReplyOptions): Promise<IBotCommandArgs>;
        sendInteractiveSticker(chatId: idType, fromId: idType, path: fileType, options?: IReplyOptions): Promise<IBotCommandArgs>;
        sendInteractiveVideo(chatId: idType, fromId: idType, path: fileType, options?: ISendVideoOptions): Promise<IBotCommandArgs>;
        sendInteractiveLocation(chatId: idType, fromId: idType, latitude: number, longitude: number, options?: IReplyOptions): Promise<IBotCommandArgs>;
        protected getTicketFromInfo(chatId: idType, fromId: idType): string;
        protected getTicketFromMessage(msg: Message): string;
        protected addToWaitingResponse(ticket: string, resolve: (b: IBotCommandArgs) => void): void;
        protected removeFromWaiting(ticket: string): void;
        protected onMessage(event: string, msg: Message): void;
        protected onResponseMessage(msg: Message, ticket: string, pendingResolve: (b: IBotCommandArgs) => void): void;
        protected onNonResponseMessage(event: string, msg: Message): void;
        protected onText(msg: Message): void;
        protected onCommand(command: string, arg: string, msg: Message): void;
        protected onPlainText(text: string, msg: Message): void;
        setCommand(commands: string | string[], action: BotAction): void;
        command(...commands: string[]): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
        setEvent(events: string | string[], action: BotAction): void;
        event(...events: string[]): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
        setPlainTextCommand(action: BotAction): void;
        plainTextCommand: (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
        setMissingCommand(action: BotAction): void;
        missingCommand: (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
        setInitializationCommand(action: (bot: TelegramBot, me: User) => void): void;
        initialization: (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
    }
}
