'use strict';

const net = require('net');
const ProtoBuf = require('protobufjs');

const Service = require('egg').Service;

const hallRoot = ProtoBuf.Root.fromJSON(require('./proto/hall.json'));
const client = net.Socket();

class HallService extends Service {

  async tcpClient() {
    if (client.connecting || client.destroyed) return;
    // if (client.)
  }

  async isLoginToHall(options) {

  }
}

module.exports = HallService;
