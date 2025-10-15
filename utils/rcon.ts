
const net = require('net');

class Rcon {
    constructor(host, port, password) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.socket = new net.Socket();
        this.requestIdCounter = 1;
        this.isAuthenticated = false;
        this.responsePromises = new Map();

        this.socket.on('data', (data) => this.handleData(data));
        //this.socket.on('close', () => console.log('Соединение закрыто.'));
        this.socket.on('error', (err) => console.error('Ошибка сокета:', err));
    }

    handleData(data) {
        const responseId = data.readInt32LE(4);
        const responseBody = data.toString('utf8', 12, data.length - 2);

        if (this.responsePromises.has('auth')) {
            const { resolve, reject } = this.responsePromises.get('auth');
            if (responseId === -1) {
                reject('Неверный RCON пароль.');
            } else {
                this.isAuthenticated = true;
                //console.log('Аутентификация прошла успешно.');
                resolve();
            }
            this.responsePromises.delete('auth');
            return;
        }

        if (this.responsePromises.has(responseId)) {
            const { resolve } = this.responsePromises.get(responseId);
            resolve(responseBody);
            this.responsePromises.delete(responseId);
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket.connect(this.port, this.host, () => {
                //console.log('Успешное подключение к серверу.');
                this.authenticate().then(resolve).catch(reject);
            });
        });
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            this.responsePromises.set('auth', { resolve, reject });
            this.sendPacket(3, this.password, 1);
        });
    }

    sendCommand(command) {
        return new Promise((resolve, reject) => {
            if (!this.isAuthenticated) {
                return reject(new Error('Клиент не аутентифицирован.'));
            }
            const requestId = this.requestIdCounter++;
            this.responsePromises.set(requestId, { resolve, reject });
            this.sendPacket(2, command, requestId);
        });
    }

    sendPacket(type, body, requestId) {
        const bodyLength = Buffer.byteLength(body, 'utf8');
        const packetSize = 10 + bodyLength;
        const buffer = Buffer.alloc(packetSize + 4);

        buffer.writeInt32LE(packetSize, 0);
        buffer.writeInt32LE(requestId, 4);
        buffer.writeInt32LE(type, 8);
        buffer.write(body, 12, 'utf8');
        buffer.writeInt8(0, packetSize + 2);
        buffer.writeInt8(0, packetSize + 3);

        this.socket.write(buffer);
    }

    disconnect() {
        this.socket.end();
    }
}

async function rconRequest(command: string = 'listplayers') {
    const rcon = new Rcon(Bun.env.IP, Bun.env.RCON_PORT, Bun.env.RCON_PASSWORD);
    try {
        await rcon.connect();
        const response = await rcon.sendCommand(command);
        const result = parseRconTableToJson(response)
        /*console.log('Ответ сервера:', result.map((el) => {
            return el["Char name"]
        }).join(', '), result.length);*/
        return result
    } catch (error) {
        console.error(error);
        return []
    } finally {
        rcon.disconnect();
    }
}
function parseRconTableToJson(rconOutput) {
    const lines = rconOutput.trim().split('\n');
    if (lines.length < 2) {
        return [];
    }
    const headers = lines[0].split('|').map(header => header.trim());

    const dataRows = lines.slice(1);

    const jsonData = dataRows.map(row => {
        const values = row.split('|').map(value => value.trim());

        const rowObject = {};

        headers.forEach((header, index) => {
            rowObject[header] = values[index];
        });

        return rowObject;
    });

    return jsonData;
}

export default rconRequest