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
const DETAIL_URL = `/admin/profiles/${PD.idOne}`;
const API_CREATE_URL = `${PREFIX}/profiles/assignment/`;
const API_LIST_URL_PERSON = `${PREFIX}/admin/people/`;

const SEARCH = '.ember-power-select-search input';

var application, store, original_uuid, run = Ember.run;

module('Acceptance | profile new test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('visit new', assert => {
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
  let keyword = 'Boy1';
  xhr(`${API_LIST_URL_PERSON}?fullname__icontains=${keyword}`, 'GET', null, {}, 200, PersonF.search());
  page.assigneeClickDropdown();
  andThen(() => {
    fillIn(`${SEARCH}`, keyword);
  });
  page.assigneeClickOptionOne();
  andThen(() => {
    assert.equal(page.assigneeInput, 'boy1');
  });
  let payload = {
    id: UUID.value,
    description: PD.descOne,
    assignee: '249543cf-8fea-426a-8bc3-09778cd78001'
  };
  xhr(API_CREATE_URL, 'POST', payload, {}, 200, {});
  generalPage.save();
  // TODO: should redirect to "list view" once the grid view's configured
  // andThen(() => {
  //   assert.equal(currentURL(), `/admin/profiles/${UUID.value}`);
  // });
});




