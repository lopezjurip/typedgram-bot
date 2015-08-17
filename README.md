# Typedgram Bot
> Under heavy development

Interactive Telegram Bot API.

## Install

This project uses [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) Node module. Make sure you have installed [Node and npm](https://nodejs.org/).

```sh
$ npm install --save typedgram-bot
```

If you are using **[tsd](https://github.com/DefinitelyTyped/tsd)**, run `tsd link` to import the typings. This should import to your `typings/tsd.d.ts`:

```ts
/// <reference path="../node_modules/typedgram-bot/definitions/src/typedgram-bot.d.ts" />
```

## Usage

This project interacts with Telegram using webhooks, so make sure you have access to your server `ip`, `port` and `host`.

##### Token

Go talk to **Telegram's official bot: [@BotFather](https://telegram.me/botfather)** and ask for a token.

### Setup

There are three default actions for every bot:

* `initializationAction`: When the bot start and it's registered in Telegram servers.
* `missingAction`: When someone executes a command `/` without associated action.
* `plainTextAction`: When simple text (without commands `/`) is inputed.

##### Example

```ts
/// <reference path="../typings/tsd.d.ts"/>

import {TelegramTypedBot as Bot, IServerOptions} from "typedgram-bot"

const PORT = process.env.PORT                       // do not choose 443
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN   // from @botfather
const HOST = process.env.LOCAL_IP                   // whitout port
const DOMAIN = process.env.LOCAL_URL                // whitout http nor https

const server: IServerOptions = {
    host: HOST,
    port: PORT,
    domain: DOMAIN,
}

const bot = new Bot(TELEGRAM_TOKEN, server);

class DefaultActions {
    @bot.initialization
    static init(bot, me) {
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

    @bot.missingCommand
    static missing(bot: Bot, msg: Message, arg?: string) {
        console.log('received:', msg.text)
    }
}
```

### How to response to  `/commands`

When you register a command the associated method will be called. You can declare associate multiple commands to the same action. Also if you don't declare the command, the function name will be used.

##### Example

```ts
class Responses {
    @bot.command('/hello_world', '/helloworld')
    static hello(bot: Bot, msg: Message, arg?: string) {
        bot.sendMessage(msg.chat.id, 'Hello world!')
    }

    @bot.command()
    static help(bot: Bot, msg: Message, arg?: string) {
        // uses method name, in this case: '/help'
        bot.sendMessage(msg.chat.id, '')
    }
}
```

**You are not forced to use decorators**, another way to response to commands it's with callbacks.

```ts
bot.setCommand('/hey', (bot, msg, srg) => {
    bot.sendMessage(msg.chat.id, 'hey!')
})
```

#### Interactive Responses

To make the interactions with the API easier, instead of sending a typical `send...`, you can use `sendInteractive...`.

```ts
class InteractiveResponses {
    @bot.command('/echo')
    static echo(bot: Bot, msg: Message, arg?: string) {
        if (arg) {
            // example: '/echo hey!'
            bot.sendMessage(msg.chat.id, `echo: ${arg}`)
        } else {
            // when it's just '/echo'
            bot.sendInteractiveMessage(
                msg.chat.id,
                msg.from.id,
                'Text me what to echo',
                {
                    reply_to_message_id: msg.message_id,
                    reply_markup: {
                        force_reply: true,
                    }
                }
            ).then(response => {
                // We wait the response: Message that comes as a Promise.
                // If there is not answer, it will 'reject' the promise with TimeoutError.
                bot.sendMessage(response.chat.id, response.arg)
            })
        }
    }
}
```

See [examples](examples) or check the [definitions](definitions).
