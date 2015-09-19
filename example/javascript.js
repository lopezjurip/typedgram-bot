// var telegram = require('typedgram-bot');
var telegram = require('../index');

var PORT = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT;      // do not choose 443
var TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;                       // from @botfather
var HOST = process.env.OPENSHIFT_NODEJS_IP || process.env.LOCAL_IP;    // whitout port
var DOMAIN = process.env.OPENSHIFT_APP_DNS || process.env.LOCAL_URL;   // whitout http

var server = {
  host: HOST,
  port: PORT,
  domain: DOMAIN,
};

var bot = new telegram.TelegramTypedBot(TELEGRAM_TOKEN, server);

bot.onInitialization(function(me) {
  console.log('Bot info:', me);
  console.log('Server info:', server);
});

bot.onCommand('/me', function(msg) {
  return bot.sendMessage(msg.chat.id, JSON.stringify(msg.from, null, 2));
});

bot.onCommand('/help', function(msg) {
  return bot.sendMessage(msg.chat.id, 'Call the action /echo to perform an echo or /apps to see an advanced use.');
});

bot.onCommand('/echo', function(msg) {
  return bot.sendMessage(msg.chat.id, 'What to echo?')
  .then(bot.waitResponse(msg))
  .then(function(response) {
    return bot.sendMessage(msg.chat.id, 'echo: ' + response.text);
  })
  .catch(function(err) {
    return bot.execCommand('/help', msg);
  });
});

bot.onEvent(telegram.TelegramEvent.photo, function(bot, msg) {
  bot.sendMessage(msg.chat.id, 'Nice pic!');
});

bot.onCommand(['/apps', '/applications'], function(msg) {
  return bot.sendMessage(msg.chat.id, 'Select a meme', {
    reply_to_message_id: msg.message_id,
    reply_markup: {
      keyboard: [
        ['Telegram'],
        ['Whatsapp'],
      ],
      force_reply: true,
      one_time_keyboard: true,
      selective: true,
    },
  })
  .then(bot.waitResponse(msg))
  .then(function(response) {
    const keyboard = {
      reply_to_message_id: response.message_id,
      reply_markup: {
        hide_keyboard: true,
      },
    };

    switch (response.text) {
      case 'Telegram': {
        return bot.sendPhoto(response.chat.id, './example/images/telegram.png', keyboard);
      }

      case 'Whatsapp': {
        return bot.sendPhoto(response.chat.id, './example/images/whatsapp.png', keyboard);
      }

      default: {
        return bot.sendMessage(response.chat.id, 'None selected', keyboard);
      }
    }
  })
  .catch(err => {
    return bot.sendMessage(msg.chat.id, 'Timeout!', {reply_markup: {hide_keyboard: true}})
  });
});
