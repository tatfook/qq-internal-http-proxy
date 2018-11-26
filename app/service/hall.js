'use strict';

const Base64 = require('js-base64').Base64;
const Service = require('egg').Service;

class HallService extends Service {
  async isLoginToHall(options) {
    const reqData = {
      uid: options.uid,
      channel_id: options.channel_id,
      token: Base64.encode(options.token),
      is_need_user_info: options.is_need_user_info,
    };
    const client = await this.app.hallClientManager();
    const decoded = await client.send('CXIsLoginToHallReq', reqData);
    return decoded;
  }
}

module.exports = HallService;
