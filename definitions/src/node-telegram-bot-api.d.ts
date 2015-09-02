interface IPollingOptions {
    timeout?: number | string
    interval?: number | string
}

interface IWebHookOptions {
    host: string
    port: number
    key?: string
    cert?: string
}

interface ITelegramBotOptions {
    webHook?: boolean | IWebHookOptions
    polling?: boolean | IPollingOptions
}

interface Update {
    update_id: number
    message?: Message
}

interface User {
    id: number
    first_name: string
    last_name?: string
    username?: string
}

interface GroupChat {
    id: number
    title: number
}


interface IFile {
    file_id: string
    file_size?: number
}

interface IMimeType extends IFile {
    mime_type?: string
}

interface IMedia extends IFile {
    width: number
    height: number
}

interface IThumbMedia extends IMedia {
    thumb?: PhotoSize
}


interface PhotoSize extends IMedia {

}

interface Audio extends IMimeType {
    duration: number
}

interface Document extends IMimeType, IThumbMedia {
    file_name?: string
}

interface Sticker extends IThumbMedia {

}

interface Video extends IThumbMedia, IMimeType {
    duration: number
}

interface Contact {
    phone_number: string
    first_name: string
    last_name?: string
    user_id?: number
}

interface Location {
    longitude: number
    latitude: number
}

interface UserProfilePhotos {
    total_count: number
    photos: PhotoSize[][]
}

interface Message {
    message_id: number
    from: User
    date: number
    chat: User | GroupChat
    forward_from?: User
    forward_date?: number
    reply_to_message?: Message
    text?: string
    audio?: Audio
    document?: Document
    photo?: PhotoSize[]
    sticker?: Sticker
    video?: Video
    caption?: string
    contact?: Contact
    location?: Location
    new_chat_participant?: User
    left_chat_participant?: User
    new_chat_title?: string
    new_chat_photo?: PhotoSize[]
    delete_chat_photo?: boolean
    group_chat_created?: boolean
}

interface IKeyboard {
    selective?: boolean
}

interface IReplyKeyboardMarkup extends IKeyboard {
    keyboard: string[][]
    resize_keyboard?: boolean
    one_time_keyboard?: boolean
}

interface IReplyKeyboardHide extends IKeyboard {
    hide_keyboard: boolean
}

interface IForceReply extends IKeyboard {
    force_reply: boolean
}

interface IReplyOptions {
    reply_to_message_id?: number
    reply_markup?: IReplyKeyboardMarkup | IReplyKeyboardHide | IForceReply | string
}

interface ISendMessageOptions extends IReplyOptions {
    disable_web_page_preview?: boolean
}

interface ISendPhotoOptions extends IReplyOptions {
    caption?: string
}

interface ISendAudioOptions extends IReplyOptions {
    duration?: number
    performer?: string
    title?: string
}

interface ISendVideoOptions extends IReplyOptions {
    caption?: string
    duration?: number
}

interface IQs {
    qs: IReplyOptions
}

declare module "node-telegram-bot-api" {
    import {Stream} from "stream";

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
