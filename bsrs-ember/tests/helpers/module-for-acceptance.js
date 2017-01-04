import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import TestDone from "../helpers/test-done";
import PersonCurrentService from 'bsrs-ember/services/person-current';
import { task } from 'ember-concurrency';

const { RSVP: { Promise } } = Ember;

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp({ error: options.error });
      this.store = this.application.__container__.lookup('service:simpleStore');

      // PATCH person current service so avoid making session calls throughout test run
      // Application route fetches once 
      this.pc_service = this.application.__container__.lookup('service:person-current');
      this.pollPersonCurrent = this.pc_service.pollPersonCurrent;
      const _this = this;
      // no-op
      this.pc_service.pollPersonCurrent = task(function * () { 
        yield;
      });

      if (options.beforeEach) {
        return options.beforeEach.apply(this, arguments);
      }
    },

    afterEach(assert) {
      // RESET pc_service pollPersonCurrent function so can use it in later test runs
      this.pc_service.pollPersonCurrent = this.pollPersonCurrent;
      delete this.pollPersonCurrent;

      TestDone.create({
        name: assert.test.testName,
        module: assert.test.module.name,
        assert: assert
      }).testDoneCallback();
      Ember.$.fauxjax.clear();
      uuidReset();
      delete this.store;
      let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
      return Promise.resolve(afterEach).then(() => destroyApp(this.application));
    }
  });
}
