import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';

let application;

module('Acceptance | ticket list test', {
  beforeEach() {
    application = startApp();
    let endpoint = PREFIX + BASE_URL + '/';
    xhr(`${endpoint}?page=1`,'GET', null, {}, 200, TF.list());
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /tickets', (assert) => {
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});
