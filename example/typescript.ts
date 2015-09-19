/// <reference path="../definitions/src/node-telegram-bot-api.d.ts"/>
/// <reference path="../definitions/src/typedgram-bot.d.ts"/>

// import {TelegramTypedBot as Bot, IServerOptions, TelegramEvent} from 'typedgram-bot'
import {TelegramTypedBot as Bot, IServerOptions, TelegramEvent} from '../index'

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

bot.onInitialization(me => {
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
})

bot.onCommand('/me', msg => {
    return bot.sendMessage(msg.chat.id, JSON.stringify(msg.from, null, 2))
})

bot.onCommand('/help', msg => {
    return bot.sendMessage(msg.chat.id, 'Call the action /echo to perform an echo or /apps to see an advanced use.')
})

bot.onCommand('/echo', msg => {
    return bot.sendMessage(msg.chat.id, 'What to echo?')
    .then(bot.waitResponse(msg))
    .then(response => {
        return bot.sendMessage(msg.chat.id, 'echo: ' + response.text)
    })
    .catch(err => {
        return bot.execCommand('/help', msg)
    })
})

bot.onCommand(['/apps', '/applications'], msg => {
    return bot.sendMessage(msg.chat.id, 'Select an app', {
        reply_to_message_id: msg.message_id,
        reply_markup: {
            keyboard: [
                ['Telegram'],
                ['Whatsapp'],
            ],
            force_reply: true,
            one_time_keyboard: true,
            selective: true
        },
    })
    .then(bot.waitResponse(msg))
    .then(response => {
        const keyboard = {
            reply_to_message_id: response.message_id,
            reply_markup: {
                hide_keyboard: true
            }
        }

        switch (response.text) {
            case 'Telegram': {
                return bot.sendPhoto(response.chat.id, './example/images/telegram.png', keyboard)
            }
            case 'Whatsapp': {
                return bot.sendPhoto(response.chat.id, './example/images/whatsapp.png', keyboard)
            }
            default: {
                return bot.sendMessage(response.chat.id, 'None selected', keyboard)
            }
        }
    })
    .catch(err => {
        return bot.sendMessage(msg.chat.id, 'Timeout!', {reply_markup: {hide_keyboard: true}})
    })
})
