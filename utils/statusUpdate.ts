import rcon from "./rcon";
import {client} from "../01-app";
import {ActivityType} from "discord.js"


export default async () => {
    const arr = await rcon()
    client.user?.setPresence({
            activities: [{ name: arr?.length > 0 ? `На сервере: ${arr.length} / 40 игроков` : 'Нет данных от сервера', type: ActivityType.Watching }],
            status: "online",
        })
    setInterval(async () => {
        const arr = await rcon()
        client.user?.setPresence({
            activities: [{ name: arr?.length > 0 ? `На сервере: ${arr.length} / 40 игроков` : 'Нет данных от сервера', type: ActivityType.Watching }],
            status: "online",
        })
    }, 60000);
}