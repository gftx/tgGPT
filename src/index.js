import { Telegraf, session } from 'telegraf';
import { code } from 'telegraf/format';
import { message } from 'telegraf/filters';
import config from 'config';
import { ogg } from './messages/index.js';
import { openai } from './openAi/index.js'

const INIT_SESSION = {
    messages: []
};
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command('start', async (ctx) => {
    ctx.session = INIT_SESSION;
    await ctx.reply('Бот запущен, шестеренки смазаны, готов принимать ваши сообщения! как голосовые так и текстовые')
})
bot.command('new', async (ctx) => {
    ctx.session = INIT_SESSION;
    await ctx.reply('Бот запущен, шестеренки смазаны, готов принимать ваши сообщения! как голосовые так и текстовые')
})

bot.on(message('text'), async ctx => {
    console.log('ff')
    if (!ctx.session) ctx.session = INIT_SESSION
    try {
        const text = ctx.message.text;
        await ctx.reply(`ваш запрос: \"${text}\"`);

        ctx.session.messages.push({ role: openai.roles.USER, content: text });
        
        const gptAnswer = await openai.chat(ctx.session.messages);

        ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: gptAnswer.content });
        ctx.reply(gptAnswer.content);

    } catch (error) {
        console.error('error while text', error.message);
    }
});


bot.on(message('voice'), async ctx => {
    console.log('fff')
    if (!ctx.session) ctx.session = INIT_SESSION
    try {
        const userId = String(ctx.message.from.id);
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const { href: voiceMessageLink } = link;
        await ctx.reply(code('*пык мык* обрабатываем войс *пык мык*'));
        const oggPath = await ogg.create(voiceMessageLink, userId);
        const mp3Path = await ogg.toMp3(oggPath, userId);

        const text = await openai.transcription(mp3Path);
        await ctx.reply(`ваш запрос: \"${text}\"`);

        ctx.session.messages.push({ role: openai.roles.USER, content: text });

        const gptAnswer = await openai.chat(ctx.session.messages);

        ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: gptAnswer.content });
        ctx.reply(gptAnswer.content);

    } catch (error) {
        console.error('error while voice', error.message);
    }
});

console.log(config.NODE_ENV)
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));