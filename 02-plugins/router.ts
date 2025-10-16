import Elysia from "elysia";
import path from "path";

function processPaths(inputString) {
    return inputString
        .split('\n')
        .map(line => {
            const match = line.match(/\*([^]+)$/);
            if (match) {
                let path = match[1]
                    .replace(/C:\\SteamLibrary\\/g, '')
                    .replace(/\r/g, '')
                    .trim()
                return path;
            }
            return null;
        })
        .filter(Boolean);
}

export default new Elysia({prefix: "/api"})
    .post('updateMods', async ({body, set}) => {
        const file = body.modsFile
        const password = body.password

        if (password !== 'q1w2') {
            set.status = 401
            return 'Неверный пароль'
        }

        if (!file) {
            set.status = 400
            return 'Файл не был загружен'
        }

        try {
            const fileContent = await file.arrayBuffer()
            const text = Buffer.from(fileContent).toString('utf-8')
            const processedPaths = processPaths(text)

            const jsonPath = path.join(process.cwd(), 'public', 'mods.json')

            await Bun.write(jsonPath, JSON.stringify(processedPaths, null, 2));
            //console.log('Содержимое файла:', processedPaths)
            return `Файл ${file.filename} успешно загружен и прочитан. Содержимое: ${text}`
        } catch (error) {
            console.log(error)
            set.status = 500
            return 'Ошибка при чтении файла'
        }
    }).get('/mods', () => Bun.file(path.join(process.cwd(), 'public', 'mods.json')))