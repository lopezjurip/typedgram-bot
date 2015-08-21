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

## Typescript Usage

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

import {TelegramTypedBot as Bot, IServerOptions, TelegramEvent} from 'typedgram-bot'

const PORT = process.env.PORT                     // do not choose 443
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN // from @botfather
const HOST = process.env.LOCAL_IP                 // whitout port
const DOMAIN = process.env.LOCAL_URL              // whitout http

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
```

### How to response to  `/commands`

When you register a command the associated method will be called. You can declare associate multiple commands to the same action. Also if you don't declare the command, the function name will be used.

##### Example

```ts
bot.onCommand(['/hello_world', '/hello'], msg => {
    return bot.sendMessage(msg.chat.id, 'Hello world!')
}

```

#### Interactive Responses

To make the interactions with the API easier, instead of sending a typical `send...`, you can use `sendInteractive...`.

```ts
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

        switch(response.text) {
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
})
```

See [examples](examples) or check the [definitions](definitions). There is a example showing how to use it on a Javascript project.

### Development

To develop your bot locally, you need a **secure** connection to your local host. One way to achieve this is using a [ngrok](https://ngrok.com/) to create a *tunnel* to your computer.

#### Example

Once installed, create a tunnel to your app.
```sh
$ ngrok 8080

# Tunnel Status                 online
# Version                       1.7/1.7
# Forwarding                    http://SUBDOMAIN.ngrok.com -> 127.0.0.1:8080
# Forwarding                    https://SUBDOMAIN.ngrok.com -> 127.0.0.1:8080
# Web Interface                 127.0.0.1:4040
# # Conn                        0
# Avg Conn Time                 0.00ms
```

Then we set our development *environment variables*.
```sh
$ export TELEGRAM_TOKEN="TOKEN"
$ export PORT="8080"
$ export LOCAL_IP="127.0.0.1"
$ export LOCAL_URL="SUBDOMAIN.ngrok.com"
```
