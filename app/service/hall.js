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
      msg_name: 'CXIsLoginToHallReq',
      gateway_session: 1,
    };
    const req = {
      uid: options.uid,
      channel_id: options.channel_id,
      token: options.token,
      is_need_user_info: options.is_need_user_info,
    };

    // console.log(req);

    const headerBuf = CSMessageHeader.encode(CSMessageHeader.create(msgHeader)).finish();
    console.log(headerBuf);
    const reqBuf = CXIsLoginToHallReq.encode(CXIsLoginToHallReq.create(req)).finish();
    console.log(reqBuf);
    const headerLen = headerBuf.length + 4;
    const totalLen = reqBuf.length + headerLen + 4;
    const headerLenBuf = Buffer.allocUnsafe(4);
    headerLenBuf.writeUInt32LE(headerLen);
    const totalLenBuf = Buffer.allocUnsafe(4);
    totalLenBuf.writeUInt32LE(totalLen);

    console.log(`message = ${JSON.stringify(CSMessageHeader.create(msgHeader))}`);
    console.log(`buffer = ${Array.prototype.toString.call(headerBuf)}`);

    console.log(`decoded = ${JSON.stringify(CSMessageHeader.decode(headerBuf))}`);

    // console.log(CXIsLoginToHallReq.decode(reqBuf));
    // console.log(CXIsLoginToHallReq.toObject(CXIsLoginToHallReq.decode(reqBuf)));

    const message = Buffer.concat([ totalLenBuf, headerLenBuf, headerBuf, reqBuf ]);
    console.log(message);
    const data = await this.ctx.service.game.sendMessage(message);
    console.log(data);

    return data;
  }
}

module.exports = HallService;
