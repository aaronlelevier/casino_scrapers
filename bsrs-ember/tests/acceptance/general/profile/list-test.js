import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_profile_url;
const LIST_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${PD.idZero}`;
const API_LIST_URL = `${PREFIX}${BASE_URL}/`;
const API_DETAIL_URL = `${PREFIX}${BASE_URL}/${PD.idZero}/`;

let application, store, listData, listXhr, run = Ember.run;

moduleForAcceptance('Acceptance | profile list test', {
  beforeEach() {
    
    store = this.application.__container__.lookup('service:simpleStore');
    listData = PF.list();
    listXhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, listData);
  },
  afterEach() {
    
  }
});

test('can click Assignment Profiles from the Dashboard to grid  and then to detail', assert => {
  visit(BASEURLS.base_admin_url);
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.base_admin_url);
  });
  generalPage.clickAssignmentProfiles();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, PF.detail());
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

