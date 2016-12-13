import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import TestDone from "../helpers/test-done";

const { RSVP: { Promise } } = Ember;

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp({ error: options.error });
      this.store = this.application.__container__.lookup('service:simpleStore');

      if (options.beforeEach) {
        return options.beforeEach.apply(this, arguments);
      }
    },

    afterEach(assert) {
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
