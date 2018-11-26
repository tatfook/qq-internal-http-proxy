'use strict';
const net = require('net');
const ProtoBuf = require('protobufjs');
const Base64 = require('js-base64').Base64;

const Root = ProtoBuf.Root.fromJSON(require('../../proto/hall.json'));
const CSMessageHeader = Root.lookupType('CSMessageHeader');

class HallClient {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.callbacks = new Map();
  }

  async init() {
    this.client = net.Socket();
    await this.client.connect({
      host: this.host,
      port: this.port,
    });
    this.client.on('data', this.parseFeedback);
  }

  async parseFeedback(data) {
    try {
      const {
        headerBuf,
        rspBuf,
      } = this.decode(data);
      const rspHeader = CSMessageHeader.decode(headerBuf);
      const gatewaySession = rspHeader.gateway_session;
      const callback = this.callbacks.get(gatewaySession);
      this.callbacks.delete(gatewaySession);
      if (!callback) {
        console.error('Missing callback for session ', gatewaySession);
        return;
      }
      if (rspHeader.errcode) {
        return callback({
          error: new Error('Game Server Error: ', rspHeader.errcode),
        });
      }
      const rspClassName = rspHeader.msg_name.toString();
      const decoded = Root.lookupType(rspClassName).decode(rspBuf);
      return callback({
        data: decoded,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async encode(msgHeader, reqBuf) {
    const headerBuf = CSMessageHeader.encode(msgHeader).finish();
    const headerLen = headerBuf.length + 4;
    const totalLen = reqBuf.length + headerLen + 4;
    const headerLenBuf = Buffer.allocUnsafe(4);
    headerLenBuf.writeUInt32LE(headerLen);
    const totalLenBuf = Buffer.allocUnsafe(4);
    totalLenBuf.writeUInt32LE(totalLen);
    const message = Buffer.concat([ totalLenBuf, headerLenBuf, headerBuf, reqBuf ]);
    return message;
  }

  async decode(data) {
    const totalLen = data.slice(0, 4).readUInt32LE(0);
    const headerLen = data.slice(4, 8).readUInt32LE(0);
    const headerBuf = data.slice(8, headerLen + 4);
    const rspBuf = data.slice(4 + headerLen, totalLen);
    return {
      headerBuf,
      rspBuf,
    };
  }

  async sendMessage(reqType, reqData) {
    const reqProtoClass = Root.lookupType(reqType);
    if (!reqProtoClass) throw new Error('Invalide reqType: ', reqType);
    const gatewaySession = this.generateGatewaySession();
    const msgHeader = {
      msg_name: Base64.encode(reqType),
      gateway_session: gatewaySession,
    };
    const reqBuf = reqProtoClass.encode(reqData).finish();
    const message = await this.encode(msgHeader, reqBuf);
    this.client.write(message);
    return new Promise(resolve => this.callbacks.set(gatewaySession, data => resolve(data)));
  }

  generateGatewaySession() {
    let gatewaySession = `${Date.now()}${Math.ceil(Math.random() * 100)}`;
    while (this.callbacks.get(gatewaySession)) {
      gatewaySession = `${Date.now()}${Math.ceil(Math.random() * 100)}`;
    }
    return gatewaySession;
  }

  waitingListSize() {
    return this.callbacks.length;
  }
}

module.exports = HallClient;
