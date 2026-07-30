'use strict';

const { Writable } = require('stream');
const winston = require('winston');
const { createLogger } = require('winston');

module.exports = class Logger {

  constructor(homey) {
    this.homey = homey;
    this.localLogs = this.homey.settings.get('localLogs') || [];
    const transports = [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      new winston.transports.Stream({
        stream: new Writable({
          write: (chunk, encoding, callback) => {
            this.storeLocalLog(chunk.toString());
            callback();
          }
        }),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    ];

    this.logger = createLogger({
      transports: transports
    });
  }

  storeLocalLog(log) {
    try {
      this.localLogs.unshift(JSON.parse(log));
      this.localLogs.splice(500);
      this.homey.settings.set('localLogs', this.localLogs);
    } catch (error) {
      console.error('Unable to store local log entry:', error);
    }
  }

  getLogger() {
    return this.logger;
  }

};
