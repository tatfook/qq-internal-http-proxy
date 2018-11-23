'use strict';

const ProtoBuf = require('protobufjs');

const Service = require('egg').Service;

const hallRoot = ProtoBuf.Root.fromJSON(require('../../proto/hall.json'));
const CXIsLoginToHallReq = hallRoot.lookupType('CXIsLoginToHallReq');
const CXIsLoginToHallRsp = hallRoot.lookupType('CXIsLoginToHallRsp');
const CSMessageHeader = hallRoot.lookupType('CSMessageHeader');

class HallService extends Service {
  async isLoginToHall(options) {
    const msgHeader = {
      msgName: 'CXIsLoginToHallReq',
      gatewaySession: Date.now(),
    };
    const req = {
      uid: options.uid,
      channelId: options.channelId,
      token: options.token,
      isNeedUserInfo: options.isNeedUserInfo,
    };

    const headerBuf = CSMessageHeader.encode(CSMessageHeader.create(msgHeader)).finish();
    const reqBuf = CXIsLoginToHallReq.encode(CXIsLoginToHallReq.create(req)).finish();
    const headerLen = headerBuf.length + 4;
    const totalLen = reqBuf.length + headerLen + 4;
    const headerLenBuf = Buffer.allocUnsafe(4).writeUInt32LE(headerLen);
    const totalLenBuf = Buffer.allocUnsafe(4).writeUInt32LE(totalLen);

    const message = totalLenBuf + headerLenBuf + headerBuf + reqBuf;
    console.log(message);
    const data = await this.ctx.service.game.sendMessage(message);
    console.log(data);

    return data;
  }
}

module.exports = HallService;
