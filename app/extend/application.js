'use strict';

const HALL_CLIENT_MANAGER = Symbol('Application#gameClientManager');
const ClientManager = require('../lib/client_manager');

// app/extend/application.js
module.exports = {
  async hallClientManager() {
    if (!this[HALL_CLIENT_MANAGER]) {
      const conf = this.config.gameClientManager;
      this[HALL_CLIENT_MANAGER] = new ClientManager('HallClient', conf.host, conf.port, conf.concurrency);
      await this[HALL_CLIENT_MANAGER].init();
    }
    return this[HALL_CLIENT_MANAGER];
  },
};
