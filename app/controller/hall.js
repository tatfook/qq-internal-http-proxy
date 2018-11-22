'use strict';

const Controller = require('egg').Controller;

class HallController extends Controller {
  async isLogin() {
    const options = this.ctx.params.permit('uid', 'channelId', 'token', 'isNeedUserInfo');
    try {
      this.ctx.body = await this.ctx.service.hall.isLoginToHall(options);
    } catch (err) {
      this.ctx.logger.error('failed to check login', err);
      this.ctx.body = err;
    }
  }
}

module.exports = HallController;
