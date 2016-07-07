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
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';

const PREFIX = config.APP.NAMESPACE;
const newId = 1;
const NEW_URL = `/admin/profiles/new/${newId}`;
const LIST_URL = `/admin/profiles/index`;
const DETAIL_URL = `/admin/profiles/${PD.idOne}`;
const API_LIST_URL = `${PREFIX}/profiles/assignment/?page=1`;
const API_CREATE_URL = `${PREFIX}/profiles/assignment/`;
const API_LIST_URL_PERSON = `${PREFIX}/admin/people/`;

const SEARCH = '.ember-power-select-search input';

var application, store, original_uuid, listData, listXhr, run = Ember.run;

module('Acceptance | profile new test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    listData = PF.list();
    listXhr = xhr(API_LIST_URL, 'GET', null, {}, 200, listData);
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('visit new URL and create a new record', assert => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  // description
  page.descFill(PD.descOne);
  andThen(() => {
    assert.equal(page.descValue, PD.descOne);
  });
  // assignee
  let keyword = 'boy1';
  xhr(`${API_LIST_URL_PERSON}person__icontains=${keyword}/`, 'GET', null, {}, 200, PersonF.search_power_select());
  selectSearch('.t-profile-assignee-select', keyword);
  selectChoose('.t-profile-assignee-select', keyword);
  let payload = {
    id: UUID.value,
    description: PD.descOne,
    assignee: '249543cf-8fea-426a-8bc3-09778cd78001'
  };
  xhr(API_CREATE_URL, 'POST', payload, {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});
