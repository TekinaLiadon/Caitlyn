import SlashCommand from "../structures/Command";
import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { primaryEmbed, errorEmbed } from "../utils/embeds";
import rcon from "../utils/rcon";

export default class DiceCommand extends SlashCommand {
  constructor() {
    super("online", "Список игроков на сервере");
  }

  async exec(interaction: CommandInteraction) {
    const arr = await rcon()
    if (arr.length === 0) interaction.reply({
      embeds: [
        primaryEmbed(
            `На сервере никого`,
            'Или он отключен'
        ),
      ],
    });
    else interaction.reply({
      embeds: [
        primaryEmbed(
          `Игроков: ${arr.length}`,
            arr.map((el) => {
              return el["Char name"]
            }).join('\n')
        ),
      ],
    });
  }

  build(client: Client<boolean>, defaultCommand: SlashCommandBuilder) {
    return defaultCommand.toJSON();
  }
}
