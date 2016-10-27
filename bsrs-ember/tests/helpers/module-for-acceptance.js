import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import TestDone from "../helpers/test-done";

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp({ error: options.error });

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
      if (options.afterEach) {
        options.afterEach.apply(this, arguments);
      }
      return destroyApp(this.application);
    }
  });
}
