'use strict';

const net = require('net');
const ProtoBuf = require('protobufjs');

const Service = require('egg').Service;

const hallRoot = ProtoBuf.Root.fromJSON(require('../../proto/hall.json'));
const CXIsLoginToHallReq = hallRoot.lookupType("CXIsLoginToHallReq");
const CXIsLoginToHallRsp = hallRoot.lookupType("CXIsLoginToHallRsp");
const CSMessageHeader = hallRoot.lookupType("CSMessageHeader");

class HallService extends Service {
  async isLoginToHall(options) {
    const msgHeader = {
      msgName: 'CXIsLoginToHallReq',
      gatewaySession: Date.now()
    };
    const req = {
      uid: options.uid,
      channelId: options.channelId,
      token: options.token,
      isNeedUserInfo: options.isNeedUserInfo,
    };

    const headerBuf = CSMessageHeader.encode(msgHeader).finish();
    const reqBuf = CXIsLoginToHallReq.encode(req).finish();
    const headerLen = headerBuf.length + 4;
    const totalLen = reqBuf.length + headerLen + 4;

    const message = totalLen + '' + headerLen + headerBuf + reqBuf;
    const client = net.Socket();
    await client.connect({
      host: this.config.qqServer.host,
      port: this.config.qqServer.port,
    })
    await client.write(message);
    const data = await client.on('data');
    await client.destroy();
    const res = CXIsLoginToHallRsp.decode(data);
    return res;
  }
}

module.exports = HallService;