import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location-level_fixtures';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/location-level';
import random from 'bsrs-ember/models/random';
import BASEURLS, { LOCATION_LEVELS_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';
const LOCATION_LEVEL_NEW_URL = BASE_URL + '/new/1';
const DETAIL_URL = BASE_URL + '/' + LOCATION_LEVEL_DEFAULTS.idOne;

let application, store, payload, list_xhr, original_uuid;

module('Acceptance | location-level-new', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${LOCATION_LEVELS_URL}?page=1`, 'GET', null, {}, 200, LOCATION_LEVEL_FIXTURES.empty());
    payload = {
      id: UUID.value,
      name: LOCATION_LEVEL_DEFAULTS.nameAnother,
      children: LOCATION_LEVEL_DEFAULTS.newTemplateChildren
    };
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    payload = null;
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('visiting /location-level/new', (assert) => {
  let response = Ember.$.extend(true, {}, payload);
  xhr(LOCATION_LEVELS_URL, 'POST', JSON.stringify(payload), {}, 201, response);
  page.visit();
  click('.t-add-new');
  page.childrenClickDropdown();
  page.childrenClickOptionStore();
  page.childrenClickDropdown();
  page.childrenClickOptionCompany();
  page.childrenClickDropdown();
  page.childrenClickOptionDepartment();
  page.childrenClickDropdown();
  page.childrenClickOptionLossPreventionDistrict();
  page.childrenClickDropdown();
  page.childrenClickOptionLossPreventionRegion();
  page.childrenClickDropdown();
  page.childrenClickOptionThree();//district
  page.childrenClickDropdown();
  page.childrenClickOptionFacilityManagement();
  page.childrenClickDropdown();
  page.childrenClickOptionSecond();//region
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
    assert.equal(store.find('location-level').get('length'), 9);
    let location_level = store.find('location-level', UUID.value);
    assert.equal(location_level.get('children_fks').length, 8);
    assert.ok(location_level.get('new'));
  });
  fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameAnother);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    assert.equal(store.find('location-level').get('length'), 9);
    let location_level = store.find('location-level', UUID.value);
    assert.equal(location_level.get('new'), undefined);
    assert.equal(location_level.get('name'), LOCATION_LEVEL_DEFAULTS.nameAnother);
    assert.ok(location_level.get('isNotDirty'));
  });
});

test('validation works and when hit save, we do same post', (assert) => {
  payload.name = LOCATION_LEVEL_DEFAULTS.nameRegion;
  payload.children = [];
  let response = Ember.$.extend(true, {}, payload);
  xhr(LOCATION_LEVELS_URL, 'POST', JSON.stringify(payload), {}, 201, response);
  page.visit();
  click('.t-add-new');
  andThen(() => {
    assert.ok(find('.t-name-validation-error').is(':hidden'));
  });
  generalPage.save();
  andThen(() => {
    assert.ok(find('.t-name-validation-error').is(':visible'));
  });
  fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameRegion);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
  });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
  clearxhr(list_xhr);
  visit(LOCATION_LEVEL_NEW_URL);
  fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameCompany);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  click('.t-modal-footer .t-modal-cancel-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
      assert.equal(find('.t-location-level-name').val(), LOCATION_LEVEL_DEFAULTS.nameCompany);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
  visit(LOCATION_LEVEL_NEW_URL);
  fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameCompany);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
      let location_level = store.find('location-level', {id: UUID.value});
      assert.equal(location_level.get('length'), 1);
    });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LOCATION_LEVEL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
      let location_level = store.find('location-level', {id: UUID.value});
      assert.equal(location_level.get('length'), 0);
    });
  });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
  visit(LOCATION_LEVEL_NEW_URL);
  generalPage.cancel();
  andThen(() => {
    assert.equal(store.find('location-level').get('length'), 8);
  });
});

test('adding a new location-level should allow for another new location-level to be created after the first is persisted', (assert) => {
  let location_level_count;
  random.uuid = original_uuid;
  payload.id = 'abc123';
  patchRandomAsync(0);
  payload.name = LOCATION_LEVEL_DEFAULTS.nameRegion;
  payload.children = [];
  xhr(LOCATION_LEVELS_URL, 'POST', JSON.stringify(payload), {}, 201, Ember.$.extend(true, {}, payload));
  page.visit();
  click('.t-add-new');
  fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameRegion);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    location_level_count = store.find('location-level').get('length');
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_NEW_URL);
    assert.equal(store.find('location-level').get('length'), location_level_count + 1);
    assert.equal(find('.t-location-level-name').val(), '');
  });
});
