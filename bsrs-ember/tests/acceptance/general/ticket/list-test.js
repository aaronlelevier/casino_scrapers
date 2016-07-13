import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import BASEURLS, { TICKETS_URL } from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';

let application;

module('Acceptance | ticket list test', {
  beforeEach() {
    application = startApp();
    xhr(`${TICKETS_URL}?page=1`,'GET', null, {}, 200, TF.list());
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
