/// <reference path="../definitions/src/node-telegram-bot-api.d.ts"/>
/// <reference path="../definitions/src/typedgram-bot.d.ts"/>
/// <reference path="../typings/mocha/mocha.d.ts"/>

import {TelegramTypedBot as Bot, IServerOptions, TelegramEvent} from '../index'

describe('TypedgramBot', function() {
    this.timeout(3000);

    const PORT = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
    const HOST = process.env.OPENSHIFT_NODEJS_IP || process.env.LOCAL_IP
    const DOMAIN = process.env.OPENSHIFT_APP_DNS || process.env.LOCAL_URL
    const USER_ID = process.env.USER_ID

    if (!TELEGRAM_TOKEN) {
        throw new Error('Bot token not provided');
    }

    const server: IServerOptions = {
        host: HOST,
        port: PORT,
        domain: DOMAIN,
    }

    var bot: Bot = undefined

    before(done => {
        bot = new Bot(TELEGRAM_TOKEN, server)
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
            done()
        })
    })

    describe('#sendMessage()', () => {
        it('sends a basic message', () => {
            return bot.sendMessage(USER_ID, 'message')
        })
    })
})
