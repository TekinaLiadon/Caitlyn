import { EmbedBuilder, Colors } from "discord.js";
export class ExtendedEmbed extends EmbedBuilder {
  constructor(data?: ConstructorParameters<typeof EmbedBuilder>[0]) {
    super(data);
  }

  public addField(name: string, value: string, inline: boolean = false) {
    this.addFields({ name, value, inline });
    return this;
  }
}
// https://discordjs.guide/popular-topics/embeds.html#using-the-embed-constructor
export const primaryEmbed = (
  title = "",
  description = "",
  color: keyof typeof Colors = "Aqua"
) =>
  new ExtendedEmbed({ title, description })
    .setColor(color)

export const errorEmbed = (
  title = "",
  description = "",
  color: keyof typeof Colors = "Red"
) =>
  new ExtendedEmbed({ title, description })
    .setColor(color)

export const starEmbed = (title = "",
                          description = "",
                          name = '',
                          iconURL = '',
                          url = '',
                          color: keyof typeof Colors = "Aqua") => new ExtendedEmbed({ title, description })
    .setAuthor({ name, iconURL, url, })
    .setColor(color)
    .setTimestamp()