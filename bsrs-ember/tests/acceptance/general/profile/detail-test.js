import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import config from 'bsrs-ember/config/environment';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import page from 'bsrs-ember/tests/pages/profile';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const DETAIL_URL = `/admin/profiles/${PD.idOne}`;
const API_DETAIL_URL = `${PREFIX}/profiles/assignment/${PD.idOne}/`;
const API_LIST_URL_PERSON = `${PREFIX}/admin/people/`;

const SEARCH = '.ember-power-select-search input';

var application, store, detailData, detailXhr, run = Ember.run;

module('Acceptance | profile detail test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    detailData = PF.detail();
    detailXhr = xhr(API_DETAIL_URL, 'GET', null, {}, 200, detailData);
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visit detail', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.descValue, PD.descOne);
  });
  page.descFill(PD.descTwo);
  andThen(() => {
    assert.equal(page.descValue, PD.descTwo);
  });
  let payload = {
    id: PD.idOne,
    description: PD.descTwo,
    assignee: PD.assigneeOne
  };
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('aaron assignee dropdown is initially populated and can change assignee', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let profile = store.findOne('profile');
    assert.equal(page.assigneeInput, PD.username);
  });
  let keyword = 'boy1';
  xhr(`${API_LIST_URL_PERSON}person__icontains=${keyword}/`, 'GET', null, {}, 200, PersonF.search_power_select());
  selectSearch('.t-profile-assignee-select', keyword);
  selectChoose('.t-profile-assignee-select', keyword);
  andThen(() => {
    assert.equal(page.assigneeInput, keyword);
  });
  let payload = {
    id: PD.idOne,
    description: PD.descOne,
    assignee: PD.assigneeSelectOne
  };
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});
