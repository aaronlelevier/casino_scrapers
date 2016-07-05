import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const LIST_URL = '/admin/profiles/index';
const DETAIL_URL = `/admin/profiles/${PD.idZero}`;
const API_DETAIL_URL = `${PREFIX}/profiles/assignment/${PD.idZero}/`;

let application, store, endpoint, listData, listXhr, run = Ember.run;

module('Acceptance | profile list test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + '/profiles/assignment/';
    listData = PF.list();
    listXhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, listData);
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visit list, click a record and go to their detail view', assert => {
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, PF.detail());
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});
