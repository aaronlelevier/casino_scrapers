import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import RF from 'bsrs-ember/vendor/role_fixtures';
import RD from 'bsrs-ember/vendor/defaults/role';
import LLF from 'bsrs-ember/vendor/location-level_fixtures';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import CD from 'bsrs-ember/vendor/defaults/category';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currency';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/role';
import personPage from 'bsrs-ember/tests/pages/person';
import generalPage from 'bsrs-ember/tests/pages/general';
import settingPage from 'bsrs-ember/tests/pages/settings';
import inputCurrencyPage from 'bsrs-ember/tests/pages/input-currency';
import BSRS_TRANSLATION_FACTORY from 'bsrs-ember/vendor/translation_fixtures';
import { roleNewData } from 'bsrs-ember/tests/helpers/payloads/role';
import BASEURLS, { ROLE_LIST_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = ROLE_LIST_URL;
const DETAIL_URL = BASE_URL + '/' + RD.idOne;
const TENANTS_URL = BASEURLS.BASE_TENANT_URL;
const LETTER_A = {keyCode: 65};
const LETTER_S = {keyCode: 83};
const LETTER_R = {keyCode: 82};
const SPACEBAR = {keyCode: 32};
const CATEGORY = '.t-role-category-select .ember-basic-dropdown-trigger';
const CATEGORY_DROPDOWN = '.t-role-category-select-dropdown > .ember-power-select-options';

let store, list_xhr, detail_xhr, setting_detail_xhr, endpoint, detail_data, url, translations, basePayload;

moduleForAcceptance('Acceptance | general role detail', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL + '/';
    detail_data = RF.detail(RD.idOne);
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, RF.list());
    detail_xhr = xhr(endpoint + RD.idOne + '/', 'GET', null, {}, 200, detail_data);
    url = `${PREFIX}${DETAIL_URL}/`;
    //used for category selection to prevent fillIn helper firing more than once
    run(() => {
      store.push('category', {id: CD.idTwo+'2z', name: CD.nameOne+'2z'});
    });
    translations = BSRS_TRANSLATION_FACTORY.generate('en')['en'];
    // Settings
    let setting_endpoint = `${PREFIX}${BASEURLS.base_roles_url}/route-data/new/`;
    setting_detail_xhr = xhr(setting_endpoint, 'GET', null, {}, 200, roleNewData);
    basePayload = {
      id: RD.idOne,
      inherited: undefined,
      auth_currency: null,
      dashboard_text: null
    };
  },
});

test('clicking a roles name will redirect to the given detail view', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
    assert.equal(find('.t-nav-admin-role').hasClass('active'), true);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-nav-admin-role').hasClass('active'), true);
  });
});

test('when you deep link to the role detail view you get bound attrs', (assert) => {
  clearxhr(list_xhr);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    const role = store.find('role').objectAt(0);
    assert.ok(role.get('isNotDirty'));
    assert.equal(role.get('location_level').get('id'), LLD.idOne);
    assert.equal(page.roleTypeInput, RD.roleTypeGeneral);
    assert.equal(page.categorySelected.indexOf(CD.nameOne), 2);
    assert.equal(page.locationLevelInput.split(' +')[0].trim().split(' ')[0], LLD.nameCompany);
  });
  let response = RF.detail(RD.idOne, RD.namePut);
  let location_level = LLF.put({id: LLD.idLossRegion, name: LLD.nameLossPreventionRegion});
  let payload = RF.put(Object.assign(basePayload, {
    name: RD.namePut,
    dashboard_text: TD.dashboard_textOther,
    role_type: RD.t_roleTypeContractor,
    location_level: location_level.id,
    categories: [CD.idOne],
  }));
  page.nameFill(RD.namePut);
  page.dashboard_textFill(TD.dashboard_textOther);
  selectChoose('.t-role-role-type', RD.roleTypeContractor);
  selectChoose('.t-location-level-select', LLD.nameLossPreventionRegion);
  andThen(() => {
    const role = store.find('role').objectAt(0);
    assert.ok(role.get('isDirtyOrRelatedDirty'));
  });
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
  let list = RF.list();
  list.results[0].name = RD.namePut;
  list.results[0].role_type = RD.roleTypeContractor;
  list.results[0].location_level = LLD.idLossRegion;
  xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
    let role = store.find('role').objectAt(0);
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('validation works and when hit save, we do same post', (assert) => {
  clearxhr(list_xhr);
  visit(DETAIL_URL);
  page.nameFill(RD.nameOne); 
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.notOk(page.nameValidationErrorVisible);
  });
  page.nameFill('');
  triggerEvent('.t-role-name', 'keyup', {keyCode: 32});
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').text().trim(), t('errors.role.name'));
  });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
  visit(ROLE_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(list_xhr);
  visit(DETAIL_URL);
  page.nameFill(RD.namePut);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(generalPage.modalTitleValue(), t('crud.discard_changes'));
      assert.equal(generalPage.modalBodyValue(), t('crud.discard_changes_confirm'));
      assert.equal(generalPage.modalRollbackBtnValue(), t('crud.yes'));
      assert.equal(generalPage.modalCancelBtnValue(), t('crud.no'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(page.nameValue, RD.namePut);
      assert.throws(generalPage.modalIsVisible);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  visit(DETAIL_URL);
  fillIn('.t-role-name', RD.nameTwo);
  page.locationLevelClickDropdown();
  page.locationLevelClickOptionTwo();
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(generalPage.modalTitleValue(), t('crud.discard_changes'));
      assert.equal(generalPage.modalBodyValue(), t('crud.discard_changes_confirm'));
      assert.equal(generalPage.modalRollbackBtnValue(), t('crud.yes'));
      assert.equal(generalPage.modalCancelBtnValue(), t('crud.no'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), ROLE_URL);
      let role = store.find('role', RD.idOne);
      assert.equal(role.get('name'), RD.nameOne);
      assert.throws(generalPage.modalIsVisible);
    });
  });
});

/* jshint ignore:start */
test('when click delete, modal displays and when click ok, role is deleted and removed from store', async assert => {
  await visit(DETAIL_URL);
  await generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(generalPage.modalTitleValue(), t('crud.delete.title'));
      assert.equal(generalPage.modalBodyValue(), t('crud.delete.confirm', {module: 'role'}));
      assert.equal(generalPage.modalDeleteBtnValue(), t('crud.delete.button'));
    });
  });
  xhr(`${PREFIX}${BASE_URL}/${RD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), ROLE_URL);
      assert.equal(store.find('role', RD.idOne).get('length'), undefined);
      assert.throws(generalPage.modalIsVisible);
    });
  });
});
/* jshint ignore:end */

/*ROLE TO CATEGORY M2M*/
test('clicking select for categories will fire off xhr request for all parent categories', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    let role = store.find('role', RD.idOne);
    assert.equal(role.get('role_categories_fks').length, 1);
    assert.equal(page.categoriesSelected, 1);
  });
  let category_children_endpoint = PREFIX + '/admin/categories/parents/';
  xhr(category_children_endpoint, 'GET', null, {}, 200, CF.top_level_role());
  page.categoryClickDropdown();
  andThen(() => {
    assert.equal(page.categoryOptionLength, 2);
    assert.equal(page.categoriesSelected, 1);
    const role = store.find('role', RD.idOne);
    assert.equal(role.get('role_categories_fks').length, 1);
    assert.equal(role.get('categories').get('length'), 1);
  });
  page.categoryClickOptionTwoEq();
  andThen(() => {
    const role = store.find('role', RD.idOne);
    assert.equal(role.get('role_categories_fks').length, 1);
    assert.equal(role.get('categories').get('length'), 2);
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    assert.equal(page.categoriesSelected, 2);
  });
  const payload = RF.put(Object.assign(basePayload, {
    location_level: LLD.idOne,
    categories: [CD.idOne, CD.idThree],
  }));
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
});

test('starting with multiple categories, can remove all categories (while not populating options) and add back', (assert) => {
  clearxhr(list_xhr);
  detail_data.categories = [...detail_data.categories, CF.get(CD.idThree, CD.nameThree)];
  visit(DETAIL_URL);
  andThen(() => {
    let role = store.find('role', RD.idOne);
    assert.equal(role.get('categories').get('length'), 2);
    assert.equal(page.categoriesSelected, 2);
  });
  page.categoryOneRemove();
  page.categoryOneRemove();
  andThen(() => {
    assert.equal(page.categoriesSelected, 0);
  });
  let category_endpoint = PREFIX + '/admin/categories/parents/';
  xhr(category_endpoint, 'GET', null, {}, 200, CF.top_level_role());
  page.categoryClickDropdown();
  andThen(() => {
    let role = store.find('role', RD.idOne);
    assert.equal(role.get('role_categories_fks').length, 2);
    assert.equal(role.get('categories').get('length'), 0);
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    assert.equal(page.categoryOptionLength, 2);
  });
  page.categoryClickOptionOneEq();
  page.categoryClickDropdown();
  page.categoryClickOptionTwoEq();
  andThen(() => {
    let role = store.find('role', RD.idOne);
    assert.equal(role.get('role_categories_fks').length, 2);
    assert.equal(role.get('categories').get('length'), 2);
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.categoriesSelected, 2);
  });
});

test('search will filter down on categories in store correctly by removing and adding a category back', (assert) => {
  detail_data.categories = [...detail_data.categories, CF.get(CD.idTwo)];
  detail_data.categories[1].id = 'abc123';
  detail_data.categories[1].name = CD.nameOne + ' scooter';
  visit(DETAIL_URL);
  andThen(() => {
    let role = store.find('role', RD.idOne);
    assert.equal(role.get('categories').get('length'), 2);
    assert.equal(page.categoriesSelected, 2);
  });
  page.categoryOneRemove();
  andThen(() => {
    assert.equal(page.categoriesSelected, 1);
  });
  let category_endpoint = PREFIX + '/admin/categories/parents/';
  xhr(category_endpoint, 'GET', null, {}, 200, CF.list());
  page.categoryClickDropdown();
  andThen(() => {
    assert.equal(page.categoryOptionLength, 10);
  });
  page.categoryClickOptionOneEq();
  andThen(() => {
    let role = store.find('role', RD.idOne);
    assert.equal(role.get('role_categories_fks').length, 2);
    assert.equal(role.get('categories').get('length'), 2);
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    assert.deepEqual(role.get('categories_ids'), ['abc123', CD.idGridOne]);
    assert.equal(page.categoriesSelected, 2);
  });
  let payload = RF.put(Object.assign(basePayload, {
    categories: ['abc123', CD.idGridOne],
  }));
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
});

test('for inherited field, can click link-to to get to inherited setting', (assert) => {
  clearxhr(list_xhr);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(settingPage.dashboardPlaceholderValue(), 'Default: ' + TD.dashboard_text);
    assert.equal(settingPage.dashboardTextInheritedFrom, 'Inherited from: ' + TD.inherits_from_general);
    assert.equal(settingPage.dashboardTextValue, '');
  });
  xhr(`${PREFIX}/admin/tenants/${TD.id}/`, 'GET', null, {}, 200, TF.detail());
  settingPage.dashboardTextInheritedFromClick();
  andThen(() => {
    assert.equal(currentURL(), `${TENANTS_URL}/${TD.id}`);
  });
});

test('deep linking with an xhr with a 404 status code will show up in the error component (role)', (assert) => {
  errorSetup();
  clearxhr(detail_xhr);
  clearxhr(list_xhr);
  const exception = `This record does not exist.`;
  xhr(`${endpoint}${RD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
  errorTearDown();
});

test('role has an auth_amount and auth_currency', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let role = store.find('role', RD.idOne);
    assert.equal(role.get('auth_currency'), null);
    assert.equal(role.get('inherited').auth_currency.inherited_value, CURRENCY_DEFAULTS.id);
    assert.equal(inputCurrencyPage.currencySymbolText, CURRENCY_DEFAULTS.symbol);
    assert.equal(inputCurrencyPage.authAmountValue, CURRENCY_DEFAULTS.authAmountOne);
    assert.equal(inputCurrencyPage.currencyCodeText, CURRENCY_DEFAULTS.code);
  });
  selectChoose('.t-currency-code-select', CURRENCY_DEFAULTS.codeCAD);
  andThen(() => {
    assert.equal(inputCurrencyPage.currencyCodeText, CURRENCY_DEFAULTS.codeCAD);
    let role = store.find('role', RD.idOne);
    assert.equal(role.get('auth_currency'), CURRENCY_DEFAULTS.idCAD);
  });
  var payload = RF.put(Object.assign(basePayload, {
    auth_currency: CURRENCY_DEFAULTS.idCAD
  }));
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
});
