'use strict';

const Homey = require('homey');
const VaillantAuthentication = require('./lib/vaillant-authentication');
const { ReauthenticationRequiredError } = require('./lib/vaillant-authentication');
const Logger = require('./lib/logger');

module.exports = class MyApp extends Homey.App {

  async onInit() {
    this.logger = new Logger(this.homey).getLogger();
    this.logger.info('Initialize App');

    this.authentication = new VaillantAuthentication(this.homey.settings, this.logger);
    if (this.authentication.isLoggedIn()) {
      try {
        await this.authentication.renewToken(this.homey.settings.get('country'));
      } catch (error) {
        if (error instanceof ReauthenticationRequiredError) {
          this.logger.error('Stored Vaillant session expired. Devices will be marked unavailable until repaired.');
        } else {
          throw error;
        }
      }
    } else {
      this.logger.info('No stored Vaillant session found. Skipping token renewal.');
    }
  }

};
