import Discord from "discord.js";
import fs from "fs";
import path from "path";
export const client = new Discord.Client({
  allowedMentions: { parse: ["users", "roles"] },
  intents: [
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.GuildMembers,
    Discord.IntentsBitField.Flags.GuildMessageReactions,
    Discord.IntentsBitField.Flags.DirectMessageReactions,
    Discord.IntentsBitField.Flags.DirectMessages,
    Discord.IntentsBitField.Flags.GuildMessages,
    Discord.IntentsBitField.Flags.MessageContent,
    Discord.IntentsBitField.Flags.GuildBans,
  ],
  presence: {
    status: "online",
  },
  partials: [Discord.Partials.Message, Discord.Partials.Channel, Discord.Partials.Reaction, Discord.Partials.GuildMember],
});

import { discordLogger } from "../utils/logger";

discordLogger.info("Началась загрузка событий...");
import Event from "../structures/Event";
import Command from "../structures/Command";
import Elysia, {file} from "elysia";
import staticPlugin from "@elysiajs/static";
import router from "../02-plugins/router";
export const commands = new Discord.Collection<string, Command>();
const start = async () => {
  const eventsLoading = await (async function loadEvents(
    dir = path.resolve(__dirname, "../events")
  ) {
    const files = await fs.promises.readdir(dir);
    for (const file of files) {
      const fileDesc = fs.statSync(`${dir}/${file}`);

      if (fileDesc.isDirectory()) {
        await loadEvents(`${dir}/${file}`);
        continue;
      }

      const imported = await import(`${dir}/${file}`);
      const event: Event = new imported.default();
      event.register(client);
      discordLogger.info(`Загруженно событие ${event.name} (${event.event})`);
    }
  })();
  discordLogger.info("Началась загрузка команд...");
  // export const commands = new Discord.Collection<string, Command>();
  const cmdsLoading = await (async function loadCommands(
    dir = path.resolve(__dirname, "../commands")
  ) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fileDesc = fs.statSync(dir + "/" + file);

      if (fileDesc.isDirectory()) {
        await loadCommands(dir + "/" + file);
        continue;
      }

      const loadedCommand = await import(dir + "/" + file);
      const command: Command = new loadedCommand.default();

      commands.set(command.name, command);
      discordLogger.info(`Загруженна команда ${command.name} (${file})`);
    }
  })();
  await Promise.all([eventsLoading, cmdsLoading])
    .then(() => {
      discordLogger.info("Законченна загрузка всех команд и событий.");
      discordLogger.info(`Подключение к дискорду...`);
      client.login(Bun.env.API_BOT_KEY);
    })
    .catch((e) => {
      discordLogger.error(e);
    });
};

(async () => {
  await start()
  const app = new Elysia()
      .use(staticPlugin())
      .get('/', () => file('./public/index.html'))
      .use(router)
      .listen(7009)
  console.log(`🦊 Caitlyn is running at ${app.server?.hostname}:${app.server?.port}`);
})()


