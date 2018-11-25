'use strict';

const ProtoBuf = require('protobufjs');
const Base64 = require('js-base64').Base64;
const Service = require('egg').Service;

const hallRoot = ProtoBuf.Root.fromJSON(require('../../proto/hall.json'));
const CXIsLoginToHallReq = hallRoot.lookupType('CXIsLoginToHallReq');
const CXIsLoginToHallRsp = hallRoot.lookupType('CXIsLoginToHallRsp');
const CSMessageHeader = hallRoot.lookupType('CSMessageHeader');

class HallService extends Service {
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
    const totalLen = data.readUInt32LE(4, 0);
    const headerLen = data.readUInt32LE(4, 4);
    const headerBuf = data.readUInt32LE(headerLen - 4, 8);
    const rspBuf = data.readUInt32LE(totalLen - headerLen, 4 + headerLen);
    return {
      headerBuf,
      rspBuf,
    };
  }

  async sendMessage(message) {
    console.log('send: ', message);
    const data = await this.service.game.sendMessage(message);
    console.log('return: ', data);
    const { headerBuf, rspBuf } = await this.service.hall.decode(data);
    console.log('decoded headerBuf: ', headerBuf);
    const msgHeader = CSMessageHeader.decode(headerBuf);
    if (msgHeader.errcode) throw new Error('Hall Error: ', msgHeader.errcode);

    return rspBuf;
  }

  async isLoginToHall(options) {
    const req = {
      uid: options.uid,
      channel_id: options.channel_id,
      token: Base64.encode(options.token),
      is_need_user_info: options.is_need_user_info,
    };
    const gatewaySession = Date.now();
    const msgHeader = {
      msg_name: Base64.encode('CXIsLoginToHallReq'),
      gateway_session: gatewaySession,
    };

    const reqBuf = CXIsLoginToHallReq.encode(req).finish();
    const message = await this.service.hall.encode(msgHeader, reqBuf);

    const rspBuf = await this.service.hall.sendMessage(message);
    const decoded = CXIsLoginToHallRsp.decode(rspBuf);
    return decoded;
  }
}

module.exports = HallService;
