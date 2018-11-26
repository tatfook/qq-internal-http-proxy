'use strict';

const net = require('net');
const ProtoBuf = require('protobufjs');
const Service = require('egg').Service;

const Root = ProtoBuf.Root.fromJSON(require('../../proto/hall.json'));
const CSMessageHeader = Root.lookupType('CSMessageHeader');

class GameService extends Service {
  async send(message) {
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

  async encode(msgHeader, reqBuf) {
    const headerBuf = CSMessageHeader.encode(msgHeader).finish();
    const headerLen = headerBuf.length + 4;
    const totalLen = reqBuf.length + headerLen + 4;
    const headerLenBuf = Buffer.allocUnsafe(4);
    headerLenBuf.writeUInt32LE(headerLen);
    const totalLenBuf = Buffer.allocUnsafe(4);
    totalLenBuf.writeUInt32LE(totalLen);
    const message = Buffer.concat([ totalLenBuf, headerLenBuf, headerBuf, reqBuf ], totalLen);
    return message;
  }

  async decode(data) {
    const totalLen = data.slice(0, 4).readUInt32LE(0);
    const headerLen = data.slice(4, 8).readUInt32LE(0);
    const headerBuf = data.slice(8, headerLen + 4);
    const rspBuf = data.slice(4 + headerLen, totalLen);
    return {
      headerBuf,
      rspBuf,
    };
  }

  async sendMessage(msgHeader, reqBuf) {
    const message = await this.service.game.encode(msgHeader, reqBuf);
    // console.log('send: ', message);
    const data = await this.service.game.send(message);
    // console.log('return: ', data);
    const {
      headerBuf,
      rspBuf,
    } = await this.service.game.decode(data);
    const rspHeader = CSMessageHeader.decode(headerBuf);
    if (rspHeader.errcode) throw new Error('Hall Error: ', rspHeader.errcode);
    // console.log('rspHeader: ', JSON.stringify(rspHeader));
    const rspClassName = rspHeader.msg_name.toString();
    // console.log('rspClassName: ', rspClassName);
    const decoded = Root.lookupType(rspClassName).decode(rspBuf);
    // console.log('decoded: ', JSON.stringify(decoded));
    return decoded;
  }

  async getProtoClass(name) {
    return Root.lookupType(name);
  }
}
module.exports = GameService;
