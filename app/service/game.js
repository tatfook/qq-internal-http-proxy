'use strict';

const net = require('net');
const Service = require('egg').Service;

class GameService extends Service {
  async sendMessage(message) {

    const client = net.Socket();
    await client.connect({
      host: this.config.gameServer.host,
      port: this.config.gameServer.port,
    });
    await client.write(message);
    return new Promise(resolve => client.on('data', async data => {
      await client.destroy();
      resolve(data);
    }));
  }
}
module.exports = GameService;
