import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import RF from 'bsrs-ember/vendor/role_fixtures';
import RD from 'bsrs-ember/vendor/defaults/role';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/role';
import personPage from 'bsrs-ember/tests/pages/person';
import inputCurrencyPage from 'bsrs-ember/tests/pages/input-currency';
import { roleNewData } from 'bsrs-ember/tests/helpers/payloads/role';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new/1';
const SPACEBAR = {keyCode: 32};
const CATEGORY = '.t-role-category-select .ember-basic-dropdown-trigger';
const CATEGORY_DROPDOWN = '.t-role-category-select-dropdown > .ember-power-select-options';

let store, payload, list_xhr, url, counter;

moduleForAcceptance('Acceptance | role new', {
  beforeEach() {
    payload = {
      id: UUID.value,
      name: RD.nameOne,
      role_type: RD.t_roleTypeGeneral,
      location_level: RD.locationLevelOne,
      categories: [CD.idOne],
      auth_amount: 0.0000,
    };

    store = this.application.__container__.lookup('service:simpleStore');
    let endpoint = PREFIX + BASE_URL + '/';
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, RF.empty());
    random.uuid = function() { return UUID.value; };
    url = `${PREFIX}${BASE_URL}/`;
    counter=0;
    run(function() {
      store.push('category', {id: CD.idTwo+'2z', name: CD.nameOne+'2z'});//used for category selection to prevent fillIn helper firing more than once
    });
    // Settings
    let setting_endpoint = `${PREFIX}${BASEURLS.base_roles_url}/route-data/new/`;
    xhr(setting_endpoint, 'GET', null, {}, 200, roleNewData);
  },
  afterEach() {
    counter=0;
  }
});

test('visiting role/new', (assert) => {
  visit(ROLE_URL);
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    assert.equal(store.find('role').get('length'), 7);
    assert.equal(store.find('role-type').get('length'), 2);
    assert.equal(page.roleTypeInput, t(RD.t_roleTypeGeneral));
    assert.equal(store.find('location-level').get('length'), 8);
    assert.equal(page.categorySelectText, '');
    assert.equal(find('.t-amount').get(0)['placeholder'], 'Amount: 0.00');
    assert.equal(inputCurrencyPage.authAmountValue, '');
    assert.equal(inputCurrencyPage.currencySymbolText, CURRENCY_DEFAULTS.symbol);
    assert.equal(inputCurrencyPage.currencyCodeText, CURRENCY_DEFAULTS.code);
    assert.equal(find('.t-inherited-msg-dashboard_text-link').text().trim(), 'Inherited from: general');
    assert.equal(find('.t-settings-dashboard_text').get(0)['placeholder'], 'Default: ' + TD.dashboard_text);
    assert.equal(page.dashboard_textValue, '');
    const role = store.find('role', UUID.value);
    assert.ok(role.get('new'));
  });
  fillIn('.t-role-name', RD.nameOne);
  fillIn('.t-settings-dashboard_text', RD.dashboard_textTwo);
  selectChoose('.t-role-role-type', RD.roleTypeGeneral);
  selectChoose('.t-location-level-select', LLD.nameCompany);
  ajax(`${PREFIX}/admin/categories/parents/`, 'GET', null, {}, 200, CF.top_level_role());
  page.categoryClickDropdown();
  page.categoryClickOptionOneEq();
  fillIn('.t-amount', CURRENCY_DEFAULTS.authAmountOne);
  andThen(() => {
    $('.t-amount').focusout();
  });
  let postPayload = Object.assign(payload, {
    auth_amount: parseFloat(CURRENCY_DEFAULTS.authAmountOne).toFixed(2),
    dashboard_text: RD.dashboard_textTwo
  });
  xhr(url, 'POST', JSON.stringify(postPayload), {}, 201, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
    assert.equal(store.find('role').get('length'), 7);
    let role = store.find('role', UUID.value);
    assert.equal(role.get('new'), undefined);
    assert.equal(role.get('name'), RD.nameOne);
    assert.equal(role.get('role_type'), RD.t_roleTypeGeneral);
    assert.equal(role.get('location_level.id'), RD.locationLevelOne);
    assert.equal(role.get('auth_amount'), parseFloat(CURRENCY_DEFAULTS.authAmountOne).toFixed(2));
    assert.ok(role.get('isNotDirty'));
  });
});

test('validation works and when hit save, we do same post', (assert) => {
  visit(ROLE_URL);
  click('.t-add-new');
  andThen(() => {
    assert.ok(find('.t-name-validation-error').is(':hidden'));
    assert.ok(find('.t-location-level-validation-error').is(':hidden'));
  });
  generalPage.save();
  andThen(() => {
    assert.ok(find('.t-name-validation-error').is(':visible'));
    assert.ok(find('.t-location-level-validation-error').is(':visible'));
  });
  fillIn('.t-role-name', RD.nameOne);
  generalPage.save();
  andThen(() => {
    assert.ok(find('.t-name-validation-error').is(':hidden'));
    assert.ok(find('.t-location-level-validation-error').is(':visible'));
  });
  page.locationLevelClickDropdown();
  page.locationLevelClickOptionOne();
  andThen(() => {
    assert.ok(find('.t-name-validation-error').is(':hidden'));
    assert.ok(find('.t-location-level-validation-error').is(':hidden'));
  });
  ajax(`${PREFIX}/admin/categories/parents/`, 'GET', null, {}, 200, CF.top_level_role());
  page.categoryClickDropdown();
  page.categoryClickOptionOneEq();
  andThen(() => {
    assert.ok(find('.t-name-validation-error').is(':hidden'));
    assert.ok(find('.t-location-level-validation-error').is(':hidden'));
  });
  xhr(url, 'POST', JSON.stringify(payload), {}, 201, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
  clearxhr(list_xhr);
  visit(NEW_URL);
  fillIn('.t-role-name', RD.nameOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
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
      assert.equal(currentURL(), NEW_URL);
      assert.equal(find('.t-role-name').val(), RD.nameOne);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
  visit(NEW_URL);
  fillIn('.t-role-name', RD.nameOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
      let role = store.find('role', {id: UUID.value});
      assert.equal(role.get('length'), 1);
    });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), ROLE_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
      let role = store.find('role', {id: UUID.value});
      assert.equal(role.get('length'), 0);
    });
  });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
  visit(NEW_URL);
  generalPage.cancel();
  andThen(() => {
    assert.equal(store.find('role').get('length'), 6);
  });
});

/*ROLE TO CATEGORY M2M*/
test('clicking power select for parent categories will fire off xhr request for all parent categories', (assert) => {
  visit(NEW_URL);
  ajax(`${PREFIX}/admin/categories/parents/`, 'GET', null, {}, 200, CF.top_level_role());
  page.categoryClickDropdown();
  andThen(() => {
    assert.equal(page.categoryOptionLength, 2);
    assert.equal(page.categoriesSelected, 0);
    const role = store.find('role', UUID.value);
    assert.equal(role.get('role_categories_fks').length, 0);
    assert.equal(role.get('categories').get('length'), 0);
  });
  page.categoryClickOptionOneEq();
  andThen(() => {
    let role = store.find('role', UUID.value);
    assert.equal(role.get('role_categories_fks').length, 0);
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    assert.equal(page.categoriesSelected, 1);
  });
  fillIn('.t-role-name', RD.nameOne);
  page.locationLevelClickDropdown();
  page.locationLevelClickOptionOne();
  let category = CF.put({id: CD.idOne, name: CD.nameOne});
  let postPayload = Object.assign(payload, {location_level: LLD.idOne});
  xhr(url, 'POST', JSON.stringify(postPayload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
});

test('adding and removing removing a category in power select for categories will save correctly and cleanup role_categories_fks', (assert) => {
  visit(NEW_URL);
  andThen(() => {
    patchRandom(counter);
  });
  ajax(`${PREFIX}/admin/categories/parents/`, 'GET', null, {}, 200, CF.top_level_role());
  page.categoryClickDropdown();
  andThen(() => {
    assert.equal(page.categoryOptionLength, 2);
    assert.equal(page.categoriesSelected, 0);
    const role = store.find('role', UUID.value);
    assert.equal(role.get('role_categories_fks').length, 0);
    assert.equal(role.get('categories').get('length'), 0);
  });
  page.categoryClickOptionOneEq();
  andThen(() => {
    let role = store.find('role', UUID.value);
    assert.equal(role.get('role_categories').get('length'), 1);
    assert.equal(role.get('categories').get('length'), 1);
    assert.equal(page.categoriesSelected, 1);
  });
  page.categoryOneRemove();
  andThen(() => {
    let role = store.find('role', UUID.value);
    assert.equal(role.get('role_categories').get('length'), 0);
    assert.equal(role.get('categories').get('length'), 0);
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.categoriesSelected, 0);
  });
  page.categoryClickDropdown();
  page.categoryClickOptionTwoEq();
  fillIn('.t-role-name', RD.nameOne);
  page.locationLevelClickDropdown();
  page.locationLevelClickOptionOne();
  payload.categories = [CD.idThree];
  xhr(url, 'POST', JSON.stringify(payload), {}, 201);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
});

test('can add multiple categories', (assert) => {
  visit(NEW_URL);
  ajax(`${PREFIX}/admin/categories/parents/`, 'GET', null, {}, 200, CF.top_level_role());
  page.categoryClickDropdown();
  andThen(() => {
    let role = store.find('role', UUID.value);
    assert.equal(role.get('categories').get('length'), 0);
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.categoryOptionLength, 2);
  });
  page.categoryClickOptionOneEq();
  andThen(() => {
    let role = store.find('role', UUID.value);
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    assert.equal(page.categoriesSelected, 1);
  });
  page.categoryClickDropdown();
  page.categoryClickOptionTwoEq();
  fillIn('.t-role-name', RD.nameOne);
  page.locationLevelClickDropdown();
  page.locationLevelClickOptionOne();
  let postPayload = Object.assign(payload, {categories: [CD.idOne, CD.idThree]});
  xhr(url, 'POST', JSON.stringify(postPayload), {}, 201);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
});

test('adding a new role should allow for another new role to be created after the first is persisted', (assert) => {
  let role_count;
  uuidReset();
  payload.id = 'abc123';
  patchRandomAsync(0);
  visit(ROLE_URL);
  click('.t-add-new');
  fillIn('.t-role-name', RD.nameOne);
  page.locationLevelClickDropdown();
  page.locationLevelClickOptionOne();
  ajax(`${PREFIX}/admin/categories/parents/`, 'GET', null, {}, 200, CF.top_level_role());
  page.categoryClickDropdown();
  page.categoryClickOptionOneEq();
  ajax(url, 'POST', JSON.stringify(payload), {}, 201, Ember.$.extend(true, {}, payload));
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
    role_count = store.find('role').get('length');
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    assert.equal(store.find('role').get('length'), role_count + 1);
    assert.equal(find('.t-role-name').val(), '');
  });
});
