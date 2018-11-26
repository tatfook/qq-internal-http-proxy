'use strict';

const HallClient = require('./hall_client');
const supportedClients = {
  HallClient,
};

class GameClientManager {
  constructor(clientType, host, port, concurrency = 1) {
    this.clientType = clientType;
    this.host = host;
    this.port = port;
    this.concurrency = concurrency;
    this.clients = [];
  }

  async init() {
    for (let i = 0; i < this.concurrency; i++) {
      this.clients[i] = new supportedClients[this.clientType](this.host, this.port);
      await this.clients[i].init();
    }
  }

  getIdleClient() {
    let index,
      length;
    for (let i = 0; i < this.concurrency; i++) {
      if (length === undefined || length > this.clients[i].waitingListSize) {
        length = this.clients[i].waitingListSize();
        index = i;
      }
    }
    return this.clients[index];
  }

  async send(reqType, reqData) {
    return await this.getIdleClient().sendMessage(reqType, reqData);
  }
}

module.exports = GameClientManager;
