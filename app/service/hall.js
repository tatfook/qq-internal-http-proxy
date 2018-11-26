'use strict';

const Base64 = require('js-base64').Base64;
const Service = require('egg').Service;

class HallService extends Service {
  async isLoginToHall(options) {
    const req = {
      uid: options.uid,
      channel_id: options.channel_id,
      token: Base64.encode(options.token),
      is_need_user_info: options.is_need_user_info,
    };
    const gatewaySession = `${Date.now()}${Math.ceil(Math.random() * 100)}`;
    const msgHeader = {
      msg_name: Base64.encode('CXIsLoginToHallReq'),
      gateway_session: gatewaySession,
    };
    const CXIsLoginToHallReq = await this.service.game.getProtoClass('CXIsLoginToHallReq');
    const reqBuf = CXIsLoginToHallReq.encode(req).finish();
    const decoded = await this.service.game.sendMessage(msgHeader, reqBuf);
    return decoded;
  }
}

module.exports = HallService;
