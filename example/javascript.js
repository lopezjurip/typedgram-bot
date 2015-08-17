var telegram = require('./../index'); // require('typedgram-bot');

var PORT = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT; // do not choose 443
var TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // from @botfather
var HOST = process.env.OPENSHIFT_NODEJS_IP || process.env.LOCAL_IP; // whitout port
var DOMAIN = process.env.OPENSHIFT_APP_DNS || process.env.LOCAL_URL; // whitout http

var server = {
  host: HOST,
  port: PORT,
  domain: DOMAIN,
};

var bot = new telegram.TelegramTypedBot(TELEGRAM_TOKEN, server);

bot.setInitializationCommand(function(bot, me) {
  console.log('Bot info:', me);
  console.log('Server info:', server);
});

bot.setCommand(['/hello_world', '/helloworld'], function(bot, msg, arg) {
  bot.sendMessage(msg.chat.id, 'Hello world!');
});

bot.setEvent(telegram.TelegramEvent.photo, function(bot, msg) {
  bot.sendMessage(msg.chat.id, 'Nice pic!');
});

bot.setCommand('/media', function(bot, msg, arg) {
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
  ).then(function(response) {
    var hideKeyboard = {
        reply_to_message_id: response.message_id,
        reply_markup: { hide_keyboard: true },
    };

    switch (response.text) {
      case 'Image': {
        bot.sendMessage(response.chat.id, 'I got this, what do you have?', hideKeyboard)
        .then(function(sent) {
          return bot.sendInteractivePhoto(response.chat.id, response.from.id, './example/image.png', hideKeyboard);
        })
        .then(function(response) {
          return bot.sendMessage(response.chat.id, 'Nice!', { reply_to_message_id: response.message_id });
        });

        break;
      }

      case 'Document': {
        bot.sendDocument(response.chat.id, './example/bot.js', hideKeyboard);
      }
    }
  });
});
