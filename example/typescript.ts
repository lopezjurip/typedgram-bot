import {TelegramTypedBot as Bot, BotAction, User, Message, IServerOptions, TelegramEvent} from './../index'

const PORT = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT      // do not choose 443
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN                       // from @botfather
const HOST = process.env.OPENSHIFT_NODEJS_IP || process.env.LOCAL_IP    // whitout port
const DOMAIN = process.env.OPENSHIFT_APP_DNS || process.env.LOCAL_URL   // whitout http

const server: IServerOptions = {
    host: HOST,
    port: PORT,
    domain: DOMAIN,
}

const bot = new Bot(TELEGRAM_TOKEN, server);

class DefaultActions {
    @bot.initialization
    static init(bot: Bot, me: User) {
        console.log(`
        ------------------------------
        Bot successfully deployed!
        ------------------------------
        Bot info:
        - ID: ${me.id}
        - Name: ${me.first_name}
        - Username: ${me.username}

        Server info:
        - Host: ${server.host}
        - Port: ${server.port}
        - Domain: ${server.domain}
        - Node version: ${process.version}
        ------------------------------
        `)
    }
}

class MyActions {
    @bot.command('/hello_world', '/helloworld')
    static hello(bot: Bot, msg: Message, arg?: string) {
        bot.sendMessage(msg.chat.id, 'Hello world!')
    }

    @bot.event(TelegramEvent.photo, TelegramEvent.document)
    static photo(bot: Bot, msg: Message) {
        bot.sendMessage(msg.chat.id, 'Nice pic!')
    }

    @bot.command() // /media
    static media(bot: Bot, msg: Message, arg?: string) {
        bot.sendInteractiveMessage(
            msg.chat.id,
            msg.from.id,
            'Select media type:',
            {
                reply_to_message_id: msg.message_id,
                reply_markup: {
                    keyboard: [
                        ['Image', 'Document'],
                    ],
                    force_reply: true,
                    one_time_keyboard: true,
                    selective: true,
                },
            }
        ).then(response => {
            const hideKeyboard = {
                reply_to_message_id: response.msg.message_id,
                reply_markup: { hide_keyboard: true },
            }

            switch (response.msg.text) {
                case 'Image': {
                    bot.sendMessage(response.msg.chat.id, 'I got this, what do you have?', hideKeyboard)
                    .then(function(sent) {
                        return bot.sendInteractivePhoto(response.msg.chat.id, response.msg.from.id, './example/image.png', hideKeyboard)
                    })
                    .then(function(response) {
                        return bot.sendMessage(response.msg.chat.id, 'Nice!', { reply_to_message_id: response.msg.message_id })
                    })
                    break
                }
                case 'Document': {
                    bot.sendDocument(response.msg.chat.id, './example/bot.js', hideKeyboard)
                }
            }
        })
    }
}
