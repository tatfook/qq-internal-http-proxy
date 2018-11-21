'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1542790408305_3363';

  // add your config here
  config.middleware = [];

  config.tcpServer = {
    ip: '172.16.0.17',
    port: 23001
  }

  return config;
};
