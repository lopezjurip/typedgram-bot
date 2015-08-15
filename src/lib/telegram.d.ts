/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../typings/bluebird/bluebird.d.ts"/>
/// <reference path="./telegram-interfaces.ts"/>

declare module "node-telegram-bot-api" {
    import {Stream} from "stream";
    import {
        User,
        Update,
        Message,
        UserProfilePhotos,
        ITelegramBotOptions,
        ISendMessageOptions,
        ISendPhotoOptions,
        ISendAudioOptions,
        IReplyOptions,
        ISendVideoOptions,
        IQs,
    } from "telegram-interfaces";

    type idType = number | string
    type fileType = string | Stream

    class TelegramBot {
        public constructor(token: string, options: ITelegramBotOptions)

        public setWebHook(url?: string): void
        public getUpdates(timeout?: idType, limit?: idType, offset?: idType): Promise<Update>

        protected on(event: string, action: (msg: Message) => any): Promise<Message>
        public getMe(): Promise<User>

        protected _request(path: string, options: IQs): Promise<Message>
        public sendMessage(chatId: idType, text: string, options?: ISendMessageOptions): Promise<Message>
        public sendPhoto(chatId: idType, photo: fileType, options?: ISendPhotoOptions): Promise<Message>
        public sendAudio(chatId: idType, audio: fileType, options?: ISendAudioOptions): Promise<Message>
        public sendDocument(chatId: idType, path: fileType, options?: IReplyOptions): Promise<Message>
        public sendSticker(chatId: idType, path: fileType, options?: IReplyOptions): Promise<Message>
        public sendVideo(chatId: idType, path: fileType, options?: ISendVideoOptions): Promise<Message>
        public sendLocation(chatId: idType, latitude: number, longitude: number, options?: IReplyOptions): Promise<Message>

        public forwardMessage(chatId: idType, fromChatId: idType, messageId: idType): Promise<Message>

        public sendChatAction(chatId: idType, action: string): void

        public getUserProfilePhotos(userId: number | string, offset?: number, limit?: number): Promise<UserProfilePhotos>
    }

    export = TelegramBot;
}
