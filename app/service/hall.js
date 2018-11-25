'use strict';

const ProtoBuf = require('protobufjs');
const Base64 = require('js-base64').Base64;
const Service = require('egg').Service;

const hallRoot = ProtoBuf.Root.fromJSON(require('../../proto/hall.json'));
const CXIsLoginToHallReq = hallRoot.lookupType('CXIsLoginToHallReq');
const CXIsLoginToHallRsp = hallRoot.lookupType('CXIsLoginToHallRsp');
const CSMessageHeader = hallRoot.lookupType('CSMessageHeader');

class HallService extends Service {
  async isLoginToHall(options) {
    const msgHeader = {
      msg_name: Base64.encode('CXIsLoginToHallReq'),
      gateway_session: 1,
    };
    const req = {
      uid: options.uid,
      channel_id: options.channel_id,
      token: Base64.encode(options.token),
      is_need_user_info: options.is_need_user_info,
    };

    // console.log(req);

    const headerBuf = CSMessageHeader.encode(msgHeader).finish();
    const reqBuf = CXIsLoginToHallReq.encode(req).finish();
    const headerLen = headerBuf.length + 4;
    const totalLen = reqBuf.length + headerLen + 4;
    const headerLenBuf = Buffer.allocUnsafe(4);
    headerLenBuf.writeUInt32LE(headerLen);
    const totalLenBuf = Buffer.allocUnsafe(4);
    totalLenBuf.writeUInt32LE(totalLen);

    const message = Buffer.concat([ totalLenBuf, headerLenBuf, headerBuf, reqBuf ], totalLen);
    console.log(message);
    const data = await this.ctx.service.game.sendMessage(message);
    console.log(data);
    const decoded = CXIsLoginToHallRsp.decode(data);
    console.log(decoded);

    return decoded;
  }
}

module.exports = HallService;
