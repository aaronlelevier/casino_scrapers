import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import SD from 'bsrs-ember/vendor/defaults/status';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import COUNTRY_DEFAULTS from 'bsrs-ember/vendor/defaults/country';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import RD from 'bsrs-ember/vendor/defaults/role';
import RF from 'bsrs-ember/vendor/role_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PD_PUT from 'bsrs-ember/vendor/defaults/person-put';
import PERSON_CURRENT_DEFAULTS from 'bsrs-ember/vendor/defaults/person-current';
import LOCALED from 'bsrs-ember/vendor/defaults/locale';
import ED from 'bsrs-ember/vendor/defaults/email';
import EF from 'bsrs-ember/vendor/email_fixtures';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
// import AF from 'bsrs-ember/vendor/address_fixtures';
// import AD from 'bsrs-ember/vendor/defaults/address';
// import ATD from 'bsrs-ember/vendor/defaults/address-type';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/person';
import inputCurrencyPage from 'bsrs-ember/tests/pages/input-currency';
import random from 'bsrs-ember/models/random';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BSRS_TRANSLATION_FACTORY from 'bsrs-ember/vendor/translation_fixtures';
import BASEURLS, { PEOPLE_URL, ROLES_URL, LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const POWER_SELECT_LENGTH = 10;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const BASE_LOCATION_URL = BASEURLS.base_locations_url;
const PEOPLE_INDEX_URL = `${BASE_PEOPLE_URL}/index`;
const DETAIL_URL = `${BASE_PEOPLE_URL}/${PD.idOne}`;
const LETTER_A = {keyCode: 65};
const LETTER_M = {keyCode: 77};
const BACKSPACE = {keyCode: 8};
const LOCATION = '.t-person-locations-select .ember-basic-dropdown-trigger';
const LOCATION_DROPDOWN = options;
const LOCATIONS = `${LOCATION} > .ember-power-select-multiple-options > .ember-power-select-multiple-option`;
const LOCATION_ONE = `${LOCATIONS}:eq(0)`;
const LOCATION_SEARCH = '.ember-power-select-trigger-multiple-input';

var application, store, list_xhr, people_detail_data, detail_xhr, url, translations, role_route_data_endpoint;

moduleForAcceptance('Acceptance | person detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    var people_list_data = PF.list();
    people_detail_data = PF.detail(PD.idOne);
    list_xhr = xhr(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, people_list_data);
    detail_xhr = xhr(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, people_detail_data);
    url = `${PREFIX}${DETAIL_URL}/`;
    translations = BSRS_TRANSLATION_FACTORY.generate('en')['en'];
    role_route_data_endpoint = `${ROLES_URL}route-data/new/`;
  },
});

test('clicking a persons name will redirect to the given detail view', (assert) => {
  page.visitPeople();
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_INDEX_URL);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('username backend validation', (assert) => {
  clearxhr(list_xhr);
  clearxhr(detail_xhr);
  let data = PF.detail(PD.idOne);
  data.username = 'Watter1';
  xhr(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, data);
  page.visitDetail();
  andThen(() => {
    assert.equal(find('.t-existing-error').text().trim(), '');
  });
  const username_response = {'count':1,'next':null,'previous':null,'results': [{'id': PD.idOne}]};
  xhr(PEOPLE_URL + '?username=mgibson1', 'GET', null, {}, 200, username_response);
  fillIn('.t-person-username', PD.username);
  andThen(() => {
    assert.equal(find('.t-existing-error').text().trim(), t(GLOBALMSG.existing_username, {value: PD.username}));
  });
});

// can change locale to inactive for person and save (power select)
test('when you deep link to the person detail view you get bound attrs', (assert) => {
  page.visitDetail();
  page.localeClickDropdown();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    var person = store.find('person', PD.idOne);
    assert.ok(person.get('isNotDirty'));
    assert.equal(find('.t-person-username').val(), PD.username);
    assert.equal(find('.t-person-first-name').val(), PD.first_name);
    assert.equal(find('.t-person-middle-initial').val(), PD.middle_initial);
    assert.equal(find('.t-person-last-name').val(), PD.last_name);
    assert.equal(find('.t-person-title').val(), PD.title);
    assert.equal(find('.t-person-employee_id').val(), PD.employee_id);
    assert.equal(find('.t-input-multi-email').find('select:eq(0)').val(), ETD.workId);
    assert.equal(find('.t-input-multi-email').find('select:eq(1)').val(), ETD.personalId);
    assert.equal(find('.t-input-multi-email').find('select:eq(0) option:selected').text(), t(ETD.workEmail));
    assert.equal(find('.t-input-multi-email').find('select:eq(1) option:selected').text(), t(ETD.personalEmail));
    assert.equal(find('.t-input-multi-email').find('input').length, 2);
    assert.equal(find('.t-input-multi-email').find('input:eq(0)').val(), ED.emailOne);
    assert.equal(find('.t-input-multi-email').find('input:eq(1)').val(), ED.emailTwo);
    assert.equal(find('.t-input-multi-phone').find('select:eq(0)').val(), PNTD.officeId);
    assert.equal(find('.t-input-multi-phone').find('select:eq(1)').val(), PNTD.mobileId);
    assert.equal(find('.t-input-multi-phone').find('select:eq(0) option:selected').text(), t(PNTD.officeName));
    assert.equal(find('.t-input-multi-phone').find('select:eq(1) option:selected').text(), t(PNTD.mobileName));
    assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    assert.equal(find('.t-input-multi-phone').find('input:eq(0)').val(), PND.numberOne);
    assert.equal(find('.t-input-multi-phone').find('input:eq(1)').val(), PND.numberTwo);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group').length, 2);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type').val(), ATD.officeId);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type option:selected').text(), t(ATD.officeName));
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-address').val(), AD.streetOne);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-city').val(), AD.cityOne);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-state').val(), AD.stateTwo);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-postal-code').val(), AD.zipOne);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-country').val(), AD.countryOne);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type').val(), ATD.shippingId);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type option:selected').text(), t(ATD.shippingName));
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-address').val(), AD.streetTwo);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-city').val(), AD.cityTwo);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-state').val(), AD.stateTwo);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-postal-code').val(), AD.zipTwo);
    // assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-country').val(), AD.countryTwo);
    assert.equal(page.statusInput, t(SD.activeName));
    assert.equal(page.localeInput, PD.localeFull);
    assert.equal(page.localeOptionLength, 2);
    assert.equal(page.localeOne, PD.localeFull);
    assert.equal(page.localeTwo, PD.localeTwoFull);
    assert.equal(page.roleInput, RD.nameOne);
    assert.equal(find('.t-currency-symbol').text().trim(), CURRENCY_DEFAULTS.symbol);
  });
  var response = PF.detail(PD.idOne);
  var payload = PF.put({id: PD.id, username: PD_PUT.username, first_name: PD_PUT.first_name,
    middle_initial: PD_PUT.middle_initial, last_name: PD_PUT.last_name, title: PD_PUT.title,
    employee_id: PD_PUT.employee_id, auth_amount: PD_PUT.auth_amount, locale: PD.locale_id });
    const username_response = {'count':0,'next':null,'previous':null,'results': []};
    xhr(`${PEOPLE_URL}?username=${PD_PUT.username}`, 'get', null, {}, 200, username_response);
    fillIn('.t-person-username', PD_PUT.username);
    fillIn('.t-person-first-name', PD_PUT.first_name);
    fillIn('.t-person-middle-initial', PD_PUT.middle_initial );
    fillIn('.t-person-last-name', PD_PUT.last_name);
    fillIn('.t-person-title', PD_PUT.title);
    fillIn('.t-person-employee_id', PD_PUT.employee_id);
    fillIn('.t-amount', PD_PUT.auth_amount);
    andThen(() => {
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isDirty'));
      assert.ok(person.get('isDirtyOrRelatedDirty'));
      assert.ok(person.get('emailsIsNotDirty'));
    });
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirty'));
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
      assert.ok(person.get('emailsIsNotDirty'));
    });
  });

  test('when changing password to invalid, it checks for validation', (assert) => {
    page.visitDetail();
    page.clickChangePassword();
    fillIn('.t-person-password', PD.password);
    let url = PREFIX + DETAIL_URL + '/';
    let response = PF.detail(PD.idOne);
    let payload = PF.put({id: PD.id, username: PD.username, password: PD.password});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('password'), '');
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  test('payload does not include password if blank or undefined', (assert) => {
    page.visitDetail();
    const username_response = {'count':0,'next':null,'previous':null,'results': []};
    xhr(`${PEOPLE_URL}?username=${PD.sorted_username}`, 'GET', null, {}, 200, username_response);
    fillIn('.t-person-username', PD.sorted_username);
    let response = PF.detail(PD.idOne);
    let payload = PF.put({id: PD.id, username: PD.sorted_username});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('password'), '');
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  /* OTHER */
  test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    const username_response = {'count':1,'next':null,'previous':null,'results': [{'id': PD.idOne}]};
    xhr(`${PEOPLE_URL}?username=${PD_PUT.username}`, 'GET', null, {}, 200, username_response);
    fillIn('.t-person-username', PD_PUT.username);
    generalPage.cancel();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(generalPage.modalIsVisible);
        assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      });
    });
    generalPage.clickModalCancel();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-person-username').val(), PD_PUT.username);
        assert.ok(generalPage.modalIsHidden);
      });
    });
  });

  test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    page.visitDetail();
    const username_response = {'count':1,'next':null,'previous':null,'results': [{'id': PD.idone}]};
    xhr(`${PEOPLE_URL}?username=${PD_PUT.username}`, 'get', null, {}, 200, username_response);
    fillIn('.t-person-username', PD_PUT.username);
    generalPage.cancel();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(generalPage.modalIsVisible);
      });
    });
    generalPage.clickModalRollback();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
        var person = store.find('person', PD.idOne);
        assert.equal(person.get('username'), PD.username);
      });
    });
  });

  test('currency helper displays inherited auth_amount, and can click link-to to go to roles inherited value', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(inputCurrencyPage.authAmountPlaceholder(), 'Default: ' + PD.auth_amount);
      assert.equal(inputCurrencyPage.authAmountInheritedFromText, 'Inherited from: ' + TENANT_DEFAULTS.inherits_from_role);
      assert.equal(inputCurrencyPage.authAmountValue, "");
    });
    xhr(role_route_data_endpoint, 'GET', null, {}, 200, {});
    xhr(`${ROLES_URL}${RD.idOne}/`, 'GET', null, {}, 200, RF.detail(RD.idOne));
    inputCurrencyPage.authAmountInheritedFromClick();
    andThen(() => {
      assert.equal(currentURL(), `${BASEURLS.base_roles_url}/${RD.idOne}`);
    });
  });

  test('can change currency by clicking it and selecting another currency', assert => {
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(inputCurrencyPage.currencySymbolText, CURRENCY_DEFAULTS.symbol);
      let person = store.find('person', PD.id);
      assert.equal(person.get('inherited').auth_currency.inherited_value, CURRENCY_DEFAULTS.id);
      assert.equal(inputCurrencyPage.currencyCodeText, CURRENCY_DEFAULTS.code);
    });
    selectChoose('.t-currency-code', CURRENCY_DEFAULTS.codeCAD);
    andThen(() => {
      assert.equal(inputCurrencyPage.currencyCodeText, CURRENCY_DEFAULTS.codeCAD);
      let person = store.find('person', PD.id);
      assert.equal(person.get('auth_currency'), CURRENCY_DEFAULTS.idCAD);
    });
    var payload = PF.put({id: PD.id, auth_currency: CURRENCY_DEFAULTS.idCAD});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  /* jshint ignore:start */
  test('when click delete, modal displays and when click ok, person is deleted and removed from store', async assert => {
    await page.visitDetail();
    await generalPage.delete();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(Ember.$('.ember-modal-dialog'));
        assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
        assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'person'}));
        assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
      });
    });
    xhr(`${PREFIX}${BASE_PEOPLE_URL}/${PD.idOne}/`, 'DELETE', null, {}, 204, {});
    generalPage.clickModalDelete();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
        assert.equal(store.find('person', PD.idOne).get('length'), undefined);
        assert.throws(Ember.$('.ember-modal-dialog'));
      });
    });
  });

  test('when click delete, and click no modal disappears', async assert => {
    clearxhr(list_xhr);
    await page.visitDetail();
    await generalPage.delete();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(store.find('person').get('length'), 2);
        assert.ok(Ember.$('.ember-modal-dialog'));
        assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
        assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'person'}));
        assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
      });
    });
    generalPage.clickModalCancelDelete();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(store.find('person').get('length'), 2);
        assert.throws(Ember.$('.ember-modal-dialog'));
      });
    });
  });
  /* jshint ignore:end */

  /* PHONE NUMBER AND ADDRESS AND EMAIL*/
  test('newly added email without a valid name are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
    visit(DETAIL_URL);
    click('.t-add-email-btn:eq(0)');
    andThen(() => {
      assert.equal(store.find('email').get('length'), 3);
      let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(4)', '34');
    andThen(() => {
      let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-new-entry:eq(4)', '');
    generalPage.cancel();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      assert.equal(store.find('email').get('length'), 2);
    });
  });

  test('newly added phone numbers without a valid number are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
    page.visitDetail();
    click('.t-btn-add:eq(0)');
    andThen(() => {
      assert.equal(store.find('phonenumber').get('length'), 3);
      let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(2)', '34');
    andThen(() => {
      let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 1);
    });
    fillIn('.t-new-entry:eq(2)', '');
    generalPage.cancel();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      assert.equal(store.find('phonenumber').get('length'), 2);
    });
  });

  // test('newly added addresses without a valid name are ignored and removed when user navigates away (no rollback prompt)', (assert) => {
  //   page.visitDetail();
  //   click('.t-add-address-btn:eq(0)');
  //   andThen(() => {
  //     assert.equal(store.find('address').get('length'), 3);
  //     let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
  //     assert.equal(visible_errors.length, 0);
  //   });
  //   fillIn('.t-address-address:eq(2)', '34');
  //   andThen(() => {
  //     let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
  //     assert.equal(visible_errors.length, 1);
  //   });
  //   fillIn('.t-address-address:eq(2)', '');
  //   generalPage.cancel();
  //   andThen(() => {
  //     assert.equal(currentURL(), PEOPLE_INDEX_URL);
  //     assert.equal(store.find('address').get('length'), 2);
  //   });
  // });

  test('emails without a valid name are ignored and removed on save', (assert) => {
    page.visitDetail();
    click('.t-add-email-btn:eq(0)');
    andThen(() => {
      let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(4)', '34');
    andThen(() => {
      let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 1);
      assert.equal(find('.t-input-multi-email-validation-format-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_email);
    });
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      let visible_errors = find('.t-input-multi-email-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 1);
      assert.equal(store.find('email').get('length'), 3);
    });
    fillIn('.t-new-entry:eq(4)', '');
    var response = PF.detail(PD.idOne);
    var payload = PF.put({id: PD.id});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      assert.equal(store.find('email').get('length'), 2);
    });
  });

  test('phone numbers without a valid number are ignored and removed on save', (assert) => {
    page.visitDetail();
    click('.t-btn-add:eq(0)');
    andThen(() => {
      let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 0);
    });
    fillIn('.t-new-entry:eq(2)', '34');
    andThen(() => {
      let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 1);
      assert.equal(find('.t-input-multi-phone-validation-format-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_ph);
    });
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      let visible_errors = find('.t-input-multi-phone-validation-format-error:not(:hidden)');
      assert.equal(visible_errors.length, 1);
      assert.equal(store.find('phonenumber').get('length'), 3);
    });
    fillIn('.t-new-entry:eq(2)', '');
    var response = PF.detail(PD.idOne);
    var payload = PF.put({id: PD.id});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      assert.equal(store.find('phonenumber').get('length'), 2);
    });
  });

  // test('address without a valid address or zip code are ignored and removed on save', (assert) => {
  //   page.visitDetail();
  //   click('.t-add-address-btn:eq(0)');
  //   andThen(() => {
  //     let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
  //     let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
  //     assert.equal(visible_errors.length, 0);
  //     assert.equal(visible_zip_errors.length, 0);
  //   });
  //   fillIn('.t-address-address:eq(2)', '34');
  //   andThen(() => {
  //     let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
  //     assert.equal(visible_errors.length, 1);
  //     assert.equal(find('.t-input-multi-address-validation-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_street);
  //   });
  //   generalPage.save();
  //   andThen(() => {
  //     assert.equal(currentURL(), DETAIL_URL);
  //     let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
  //     let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
  //     assert.equal(visible_errors.length, 1);
  //     assert.equal(visible_zip_errors.length, 0);
  //     assert.equal(store.find('address').get('length'), 3);
  //   });
  //   fillIn('.t-address-address:eq(2)', '');
  //   fillIn('.t-address-postal-code:eq(2)', '34');
  //   andThen(() => {
  //     let visible_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
  //     assert.equal(visible_errors.length, 1);
  //     assert.equal(find('.t-input-multi-address-zip-validation-error:not(:hidden):eq(0)').text().trim(), GLOBALMSG.invalid_zip);
  //   });
  //   generalPage.save();
  //   andThen(() => {
  //     assert.equal(currentURL(), DETAIL_URL);
  //     let visible_errors = find('.t-input-multi-address-validation-error:not(:hidden)');
  //     let visible_zip_errors = find('.t-input-multi-address-zip-validation-error:not(:hidden)');
  //     assert.equal(visible_errors.length, 1);
  //     assert.equal(visible_zip_errors.length, 1);
  //     assert.equal(store.find('address').get('length'), 3);
  //   });
  //   fillIn('.t-address-postal-code:eq(2)', '');
  //   var response = PF.detail(PD.idOne);
  //   var payload = PF.put({id: PD.id});
  //   xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
  //   generalPage.save();
  //   andThen(() => {
  //     assert.equal(currentURL(), PEOPLE_INDEX_URL);
  //     assert.equal(store.find('address').get('length'), 2);
  //   });
  // });

  test('when you change a related email numbers type it will be persisted correctly', (assert) => {
    page.visitDetail();
    var emails = EF.put({id: ED.idOne, type: ETD.personalId});
    var payload = PF.put({id: PD.id, emails: emails});
    fillIn('.t-multi-email-type:eq(0)', ETD.personalId);
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  test('when you change a related phone numbers type it will be persisted correctly', (assert) => {
    page.visitDetail();
    var phone_numbers = PNF.put({id: PND.idOne, type: PNTD.mobileId});
    var payload = PF.put({id: PD.id, phone_numbers: phone_numbers});
    fillIn('.t-multi-phone-type:eq(0)', PNTD.mobileId);
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  // test('when you change a related address type it will be persisted correctly', (assert) => {
  //   page.visitDetail();
  //   var addresses = AF.put({id: AD.idOne, type: ATD.shippingId});
  //   var payload = PF.put({id: PD.id, addresses: addresses});
  //   xhr(url,'PUT',JSON.stringify(payload),{},200);
  //   fillIn('.t-address-type:eq(0)', ATD.shippingId);
  //   generalPage.save();
  //   andThen(() => {
  //     assert.equal(currentURL(), PEOPLE_INDEX_URL);
  //   });
  // });

  test('when user changes an attribute on email and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    page.visitDetail();
    fillIn('.t-multi-email-type:eq(0)', ETD.personalId);
    generalPage.cancel();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(generalPage.modalIsVisible);
      });
    });
    generalPage.clickModalRollback();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
        var person = store.find('person', PD.idOne);
        var emails = store.find('email', PD.idOne);
        assert.equal(emails._source[0].get('type'), ETD.workId);
      });
    });
  });

  test('when user changes an attribute on phonenumber and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    page.visitDetail();
    fillIn('.t-multi-phone-type:eq(0)', PNTD.mobileId);
    generalPage.cancel();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(generalPage.modalIsVisible);
      });
    });
    generalPage.clickModalRollback();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
        var person = store.find('person', PD.idOne);
        var phone_numbers = store.find('phonenumber', PD.idOne);
        assert.equal(phone_numbers._source[0].get('type'), PNTD.officeId);
      });
    });
  });

  // test('when user changes an attribute on address and clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
  //   page.visitDetail();
  //   fillIn('.t-address-type:eq(0)', ATD.shippingId);
  //   generalPage.cancel();
  //   andThen(() => {
  //     waitFor(assert, () => {
  //       assert.equal(currentURL(), DETAIL_URL);
  //       assert.ok(generalPage.modalIsVisible);
  //     });
  //   });
  //   generalPage.clickModalRollback();
  //   andThen(() => {
  //     waitFor(assert, () => {
  //       assert.equal(currentURL(), PEOPLE_INDEX_URL);
  //       var person = store.find('person', PD.idOne);
  //       var addresses = store.find('address', PD.idOne);
  //       assert.equal(addresses._source[0].get('type'), ATD.officeId);
  //     });
  //   });
  // });

  test('when user removes a phone number clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    page.visitDetail();
    click('.t-del-email-btn:eq(0)');
    generalPage.cancel();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(generalPage.modalIsVisible);
      });
    });
    generalPage.clickModalRollback();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
        var person = store.find('person', PD.idOne);
        var emails = store.find('email', PD.idOne);
        assert.equal(emails._source[0].get('type'), ETD.workId);
      });
    });
  });

  test('when user removes a phone number clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
    page.visitDetail();
    click('.t-del-btn:eq(0)');
    generalPage.cancel();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(generalPage.modalIsVisible);
      });
    });
    generalPage.clickModalRollback();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
        var person = store.find('person', PD.idOne);
        var phone_numbers = store.find('phonenumber', PD.idOne);
        assert.equal(phone_numbers._source[0].get('type'), PNTD.officeId);
      });
    });
  });

  // test('when user removes an address clicks cancel we prompt them with a modal and the related model gets rolled back', (assert) => {
  //   page.visitDetail();
  //   click('.t-del-address-btn:eq(0)');
  //   generalPage.cancel();
  //   andThen(() => {
  //     waitFor(assert, () => {
  //       assert.equal(currentURL(), DETAIL_URL);
  //       assert.ok(generalPage.modalIsVisible);
  //     });
  //   });
  //   generalPage.clickModalRollback();
  //   andThen(() => {
  //     waitFor(assert, () => {
  //       assert.equal(currentURL(), PEOPLE_INDEX_URL);
  //       var person = store.find('person', PD.idOne);
  //       var addresses = store.find('address', PD.idOne);
  //       assert.equal(addresses._source[0].get('type'), ATD.officeId);
  //     });
  //   });
  // });

  test('when you deep link to the person detail view you can remove a new phone number', (assert) => {
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
      assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-del-btn:eq(0)');
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(find('.t-input-multi-phone').find('input').length, 1);
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    var phone_numbers = PNF.put();
    var response = PF.detail(PD.idOne);
    var payload = PF.put({id: PD.id, phone_numbers: [phone_numbers[1]]});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirty'));
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });

  // test('when you deep link to the person detail view you can remove a new address', (assert) => {
  //   page.visitDetail();
  //   andThen(() => {
  //     assert.equal(currentURL(), DETAIL_URL);
  //     var person = store.find('person', PD.idOne);
  //     assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  //     assert.equal(find('.t-input-multi-address').find('input').length, 4);
  //   });
  //   click('.t-del-address-btn:eq(0)');
  //   andThen(() => {
  //     assert.equal(currentURL(), DETAIL_URL);
  //     assert.equal(find('.t-input-multi-address').find('input').length, 2);
  //     var person = store.find('person', PD.idOne);
  //     assert.ok(person.get('isDirtyOrRelatedDirty'));
  //   });
  //   var addresses = AF.put();
  //   var response = PF.detail(PD.idOne);
  //   var payload = PF.put({id: PD.id, addresses: [addresses[1]]});
  //   xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
  //   generalPage.save();
  //   andThen(() => {
  //     assert.equal(currentURL(), PEOPLE_INDEX_URL);
  //     var person = store.find('person', PD.idOne);
  //     assert.ok(person.get('isNotDirty'));
  //     assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  //     assert.ok(person.get('emailsIsNotDirty'));
  //   });
  // });

  test('when you deep link to the person detail view you can add and remove a new phone number', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
      assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    });
    click('.t-btn-add:eq(0)');
    click('.t-del-btn:eq(2)');
    andThen(() => {
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirty'));
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });

  // test('when you deep link to the person detail view you can add and remove a new address', (assert) => {
  //   clearxhr(list_xhr);
  //   page.visitDetail();
  //   andThen(() => {
  //     assert.equal(currentURL(), DETAIL_URL);
  //     var person = store.find('person', PD.idOne);
  //     assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  //     assert.equal(find('.t-input-multi-address').find('input').length, 4);
  //   });
  //   click('.t-add-address-btn:eq(0)');
  //   click('.t-del-address-btn:eq(2)');
  //   andThen(() => {
  //     var person = store.find('person', PD.idOne);
  //     assert.ok(person.get('isNotDirty'));
  //     assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  //   });
  // });

  test('when you deep link to the person detail view you can change the phone number type and add a new phone number', (assert) => {
    random.uuid = function() { return UUID.value; };
    page.visitDetail();
    fillIn('.t-input-multi-phone select:eq(0)', PNTD.mobileId);
    click('.t-btn-add:eq(0)');
    fillIn('.t-new-entry:eq(2)', PND.numberThree);
    var phone_numbers = PNF.put();
    phone_numbers[0].type = PNTD.mobileId;
    var response = PF.detail(PD.idOne);
    run(function() {
      phone_numbers.push({id: UUID.value, number: PND.numberThree, type: PNTD.officeId});
    });
    var payload = PF.put({id: PD.id, phone_numbers: phone_numbers});
    xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirty'));
      assert.equal(person.get('phone_numbers').objectAt(0).get('type'), PNTD.mobileId);
      assert.equal(person.get('phone_numbers').objectAt(2).get('type'), PNTD.officeId);
      assert.ok(person.get('phone_numbers').objectAt(0).get('isNotDirty'));
    });
  });

  // test('when you deep link to the person detail view you can change the address type and can add new address with default type', (assert) => {
  //   random.uuid = function() { return UUID.value; };
  //   page.visitDetail();
  //   fillIn('.t-input-multi-address .t-address-group:eq(0) select:eq(0)', ATD.shippingId);
  //   click('.t-add-address-btn:eq(0)');
  //   fillIn('.t-address-address:eq(2)', AD.streetThree);
  //   var addresses = AF.put();
  //   addresses[0].type = ATD.shippingId;
  //   var response = PF.detail(PD.idOne);
  //   run(function() {
  //     addresses.push({id: UUID.value, type: ATD.officeId, address: AD.streetThree});
  //   });
  //   var payload = PF.put({id: PD.id, addresses: addresses});
  //   xhr(PREFIX + DETAIL_URL + '/', 'PUT', JSON.stringify(payload), {}, 200, response);
  //   generalPage.save();
  //   andThen(() => {
  //     assert.equal(currentURL(), PEOPLE_INDEX_URL);
  //     var person = store.find('person', PD.idOne);
  //     assert.ok(person.get('isNotDirty'));
  //     assert.equal(person.get('addresses').objectAt(0).get('type'), ATD.shippingId);
  //     assert.equal(person.get('addresses').objectAt(2).get('type'), ATD.officeId);
  //     assert.ok(person.get('addresses').objectAt(0).get('isNotDirty'));
  //   });
  // });


  test('clicking cancel button will take from detail view to list view', (assert) => {
    page.visitPeople();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      const person = store.find('person', PD.idOne);
      assert.equal(person.get('role.id'), RD.idOne);
      assert.equal(person.get('role_fk'), RD.idOne);
      assert.ok(person.get('roleIsNotDirty'));
    });
    generalPage.cancel();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  /* ROLE */
  test('when you change a related role it will be persisted correctly', (assert) => {
    page.visitDetail();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('role_fk'), RD.idOne);
      assert.equal(person.get('locations').get('length'), 1);
      assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
    });
    //refreshModel will call findById in people repo
    let people_detail_data_two = PF.detail(PD.idOne);
    people_detail_data_two.role = RD.idTwo;
    ajax(PEOPLE_URL + PD.idOne + '/', 'GET', null, {}, 200, people_detail_data_two);
    page.roleClickDropdown();
    page.roleClickOptionTwo();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idTwo);
    });
    page.firstNameFill(PD.first_name);
    page.middleInitial(PD.middle_initial);
    page.lastNameFill(PD.last_name);
    var role = RF.put({id: RD.idTwo, name: RD.nameTwo, people: [PD.id]});
    var payload = PF.put({id: PD.id, first_name: PD.first_name, middle_initial: PD.middle_initial, last_name: PD.last_name, role: role.id});
    payload.locations = [];
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  test('when you deep link to the person detail view you can alter the role and rolling back will reset it', (assert) => {
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
      assert.equal(page.roleInput, RD.nameOne);
      assert.equal(person.get('role.id'), RD.idOne);
    });
    //refreshModel will call findById in people repo
    let people_detail_data_two = PF.detail(PD.idOne);
    people_detail_data_two.role = RD.idTwo;
    ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, people_detail_data_two);
    page.roleClickDropdown();
    page.roleClickOptionTwo();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idTwo);
      assert.equal(page.roleInput, RD.nameTwo);
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('isDirtyOrRelatedDirty'));
      assert.equal(person.get('role.id'), RD.idTwo);
    });
    generalPage.cancel();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idTwo);
        assert.ok(generalPage.modalIsVisible);
      });
    });
    generalPage.clickModalRollback();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
        var person = store.find('person', PD.idOne);
        assert.equal(person.get('role.id'), RD.idOne);
        var actual_role = store.find('role', RD.idOne);
        assert.ok(actual_role.get('isNotDirty'));
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        var previous_role = store.find('role', RD.idTwo);
        assert.ok(Ember.$.inArray(person.get('id'), previous_role.get('people')) === -1);
        assert.ok(previous_role.get('isNotDirty'));
      });
    });
  });

  test('when you deep link to the person detail view you can alter the role and change it back without dirtying the person model', (assert) => {
    page.visitDetail();
    andThen(() => {
      clearxhr(detail_xhr);
      //refreshModel will call findById in people repo
      let people_detail_data_two = PF.detail(PD.idOne);
      people_detail_data_two.role = RD.idTwo;
      let first_role_change = xhr(PEOPLE_URL + PD.idOne + '/', 'GET', null, {}, 200, people_detail_data_two);
      assert.equal(currentURL(), DETAIL_URL);
      var person = store.find('person', PD.idOne);
      andThen(() => {
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(page.roleInput, RD.nameOne);
        assert.equal(person.get('role.id'), RD.idOne);
      });
      page.roleClickDropdown();
      page.roleClickOptionTwo();
      andThen(() => {
        assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idTwo);
        assert.equal(page.roleInput, RD.nameTwo);
        var person = store.find('person', PD.idOne);
        assert.ok(person.get('isDirtyOrRelatedDirty'));
        assert.equal(person.get('role.id'), RD.idTwo);
      });
      andThen(() => {
        clearxhr(first_role_change);
        let people_detail_data_three = PF.detail(PD.idOne);
        people_detail_data_three.role = RD.idOne;
          page.firstNameFill(PD.first_name);
          page.middleInitial(PD.middle_initial);
          page.lastNameFill(PD.last_name);
        xhr(PEOPLE_URL + PD.idOne + '/', 'GET', null, {}, 200, people_detail_data_three);
        page.roleClickDropdown();
        page.roleClickOptionOne();
        andThen(() => {
          assert.equal(currentURL(), DETAIL_URL + '?role_change=' + RD.idOne);
          assert.equal(page.roleInput, RD.nameOne);
          var person = store.find('person', PD.idOne);
          assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
          assert.equal(person.get('role.id'), RD.idOne);
        });
      });
      generalPage.cancel();
      andThen(() => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
      });
    });
  });



  test('when you change a related role it will change the related locations as well', (assert) => {
    clearxhr(list_xhr);
    let people_list_data_mod = PF.list();
    people_list_data_mod.results[0].role = RD.idTwo;
    list_xhr = xhr(PEOPLE_URL + '?page=1', 'GET', null, {}, 200, people_list_data_mod);
    page.visitDetail();
    let url = PREFIX + DETAIL_URL + "/";
    let role = RF.put({id: RD.idTwo, name: RD.nameTwo, people: [PD.id]});
    let payload = PF.put({id: PD.id, role: role.id, locations: []});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locationsIsDirty'), false);
      assert.deepEqual(person.get('locations').get('length'), 1);
    });
    clearxhr(detail_xhr);
    let people_detail_data_two = PF.detail(PD.idOne);
    xhr(PEOPLE_URL + PD.idOne + '/', 'GET', null, {}, 200, people_detail_data_two);
    page.roleClickDropdown();
    page.roleClickOptionTwo();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locationsIsDirty'), false);
      assert.equal(person.get('isDirtyOrRelatedDirty'), true);
      assert.equal(person.get('role.id'), RD.idTwo);
      assert.deepEqual(person.get('locations').get('length'), 0);
    });
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      let person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
  });

  test('when you change a related role it will change the related locations as well with no search criteria that was cleared out by user', (assert) => {
    clearxhr(list_xhr);
    let people_list_data_mod = PF.list();
    people_list_data_mod.results[0].role = RD.idTwo;
    list_xhr = xhr(PEOPLE_URL + '?page=1', 'GET', null, {}, 200, people_list_data_mod);
    page.visitDetail();
    let url = PREFIX + DETAIL_URL + "/";
    let role = RF.put({id: RD.idTwo, name: RD.nameTwo, people: [PD.id]});
    let payload = PF.put({id: PD.id, role: role.id, locations: []});
    xhr(url,'PUT',JSON.stringify(payload),{},200);
    andThen(() => {
      let locations_endpoint = `${LOCATIONS_URL}location__icontains=a/?location_level=${LLD.idOne}`;
      xhr(locations_endpoint, 'GET', null, {}, 200, LF.list_power_select());
      page.locationClickDropdown();
      fillIn(LOCATION_SEARCH, 'a');
      andThen(() => {
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locationsIsDirty'), false);
        assert.equal(person.get('locations').get('length'), 1);
      });
      fillIn(LOCATION_SEARCH, '');
      andThen(() => {
        assert.equal(page.locationOptionLength, 1);
        assert.equal(find(LOCATION_DROPDOWN).text().trim(), GLOBALMSG.power_search);
      });
      clearxhr(detail_xhr);
      let people_detail_data_two = PF.detail(PD.idOne);
      people_detail_data_two.role = RD.idTwo;
      xhr(PEOPLE_URL + PD.idOne + '/', 'GET', null, {}, 200, people_detail_data_two);
      page.roleClickDropdown();
      page.roleClickOptionTwo();
      andThen(() => {
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('role.id'), RD.idTwo);
      });
      generalPage.save();
      andThen(() => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
        let person = store.find('person', PD.idOne);
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        assert.equal(person.get('locations').get('length'), 0);
      });
    });
  });

  /*PERSON TO LOCATION ONE TO MANY*/
  test('deep link to person and clicking in the person-locations-select component will fire off xhr to get locations with one location to start with', (assert) => {
    page.visitDetail();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locations').get('length'), 1);
      assert.equal(page.locationOneSelected.indexOf(LD.storeName), 2);
    });
    page.locationClickDropdown();
    andThen(() => {
      assert.equal(page.locationOptionLength, 1);
      assert.equal(find(LOCATION_DROPDOWN).text().trim(), GLOBALMSG.power_search);
    });
    let locations_endpoint = `${LOCATIONS_URL}location__icontains=ABC1234/?location_level=${LLD.idOne}`;
    const response = LF.list_power_select();
    xhr(locations_endpoint, 'GET', null, {}, 200, response);
    fillIn(LOCATION_SEARCH, 'ABC1234');
    andThen(() => {
      assert.equal(page.locationOptionLength, POWER_SELECT_LENGTH);
    });
    page.locationClickOptionTwo();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locations').get('length'), 2);
      assert.equal(page.locationOneSelected.indexOf(LD.storeName), 2);
      assert.equal(page.locationTwoSelected.indexOf(LD.storeNameFive), 2);
      assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    page.locationClickDropdown();
    fillIn(LOCATION_SEARCH, '');
    andThen(() => {
      assert.equal(page.locationOptionLength, 1);
      assert.equal(find(`${LOCATION_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
      let person = store.find('person', PD.idOne);
      assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = PF.put({id: PD.idOne, locations: [LD.idOne, LD.gridLocSelect]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  test('can remove and add back same location', (assert) => {
    page.visitDetail();
    page.locationOneRemove();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locations').get('length'), 0);
    });
    let locations_endpoint = `${LOCATIONS_URL}location__icontains=a/?location_level=${LLD.idOne}`;
    const response = LF.list_power_select();
    response.push(LF.get_no_related(LD.idOne, LD.storeName));
    xhr(locations_endpoint, 'GET', null, {}, 200, response);
    fillIn(LOCATION_SEARCH, 'a');
    page.locationClickOptionOne();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locations').get('length'), 1);
      assert.equal(page.locationOneSelected.indexOf(LD.storeName), 2);
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = PF.put({id: PD.idOne, locations: [LD.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  test('starting with multiple locations, can remove all locations (while not populating options) and add back', (assert) => {
    people_detail_data.locations = [...people_detail_data.locations, LF.get_fk(LD.idTwo)];
    people_detail_data.locations[1].name = LD.storeNameTwo;
    page.visitDetail();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locations').get('length'), 2);
      assert.equal(page.locationOneSelected.indexOf(LD.storeName), 2);
      assert.equal(page.locationTwoSelected.indexOf(LD.storeNameTwo), 2);
    });
    page.locationOneRemove();
    page.locationOneRemove();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locations').get('length'), 0);
      assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    let locations_endpoint = `${LOCATIONS_URL}location__icontains=a/?location_level=${LLD.idOne}`;
    const response = LF.list_power_select();
    xhr(locations_endpoint, 'GET', null, {}, 200, response);
    page.locationClickDropdown();
    fillIn(LOCATION_SEARCH, 'a');
    page.locationClickOptionOneEq();
    andThen(() => {
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locations').get('length'), 1);
      assert.equal(page.locationOneSelected.indexOf(LD.storeNameOne), 2);
      assert.ok(person.get('isDirtyOrRelatedDirty'));
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = PF.put({id: PD.idOne, locations: [LD.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  test('clicking and typing into power select for people will not filter if spacebar pressed', (assert) => {
    page.visitDetail();
    fillIn(LOCATION_SEARCH, '');
    andThen(() => {
      assert.equal(page.locationOptionLength, 1);
      assert.equal(find(LOCATION_DROPDOWN).text().trim(), GLOBALMSG.power_search);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = PF.detail(PD.idOne);
    let payload = PF.put({id: PD.idOne, locations: [LD.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  test('when you deep link to the person detail view you can alter the locations and rolling back will reset it', (assert) => {
    clearxhr(detail_xhr);
    page.visitDetail();
    people_detail_data = PF.detail(PD.idOne);
    people_detail_data.locations = [];
    page.locationClickDropdown();
    andThen(() => {
      assert.equal(page.locationOptionLength, 1);
      assert.equal(find(`${LOCATION_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
      let person = store.find('person', PD.idOne);
      assert.equal(person.get('locations').get('length'), 0);
      var previous_location_m2m = store.find('person-location', {person_pk: PD.id});
      assert.deepEqual(person.get('person_locations_fks'), []);
      assert.equal(previous_location_m2m.get('length'), 0);
    });
    xhr(PEOPLE_URL + PD.idOne + '/', 'GET', null, {}, 200, people_detail_data);
    let locations_endpoint = `${LOCATIONS_URL}location__icontains=ABC1234/?location_level=${LLD.idOne}`;
    const response = LF.list_power_select();
    xhr(locations_endpoint, 'GET', null, {}, 200, response);
    fillIn(LOCATION_SEARCH, 'ABC1234');
    page.locationClickOptionTwo();
    generalPage.cancel();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(generalPage.modalIsVisible);
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locations').get('length'), 1);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isDirtyOrRelatedDirty'));
        var previous_location_m2m = store.find('person-location', {person_pk: PD.id});
        assert.deepEqual(person.get('person_locations_fks'), []);
        assert.equal(previous_location_m2m.get('length'), 1);
      });
    });
    generalPage.clickModalRollback();
    andThen(() => {
      waitFor(assert, () => {
        assert.equal(currentURL(), PEOPLE_INDEX_URL);
        let person = store.find('person', PD.idOne);
        assert.equal(person.get('locations').get('length'), 0);
        assert.ok(person.get('isNotDirty'));
        assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
        var previous_location_m2m = store.find('person-location', {person_pk: PD.id});
        assert.deepEqual(person.get('person_locations_fks'), []);
        assert.equal(previous_location_m2m.get('length'), 1);
        assert.ok(previous_location_m2m.objectAt(0).get('removed'), true);
      });
    });
  });

  /* STATUS */
  test('can change status to inactive for person and save (power select)', (assert) => {
    page.visitDetail();
    andThen(() => {
      assert.equal(page.statusInput, t(SD.activeName));
    });
    page.statusClickDropdown();
    andThen(() => {
      assert.equal(page.statusOptionLength, 3);
      assert.equal(page.statusOne, t(SD.activeName));
      assert.equal(page.statusTwo, t(SD.inactiveName));
      assert.equal(page.statusThree, t(SD.expiredName));
      const person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
    page.statusClickOptionTwo();
    andThen(() => {
      const person = store.find('person', PD.idOne);
      assert.equal(person.get('status_fk'), SD.activeId);
      assert.equal(person.get('status.id'), SD.inactiveId);
      assert.ok(person.get('isDirtyOrRelatedDirty'));
      assert.equal(page.statusInput, t(SD.inactiveName));
    });
    let url = PREFIX + DETAIL_URL + '/';
    let payload = PF.put({id: PD.idOne, status: SD.inactiveId});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  /* LOCALE */
  test('can change locale to inactive for person and save (power select)', (assert) => {
    page.visitDetail();
    andThen(() => {
      assert.equal(page.localeInput, PD.localeFull);
    });
    page.localeClickDropdown();
    andThen(() => {
      assert.equal(page.localeOptionLength, 2);
      assert.equal(page.localeOne, PD.localeFull);
      assert.equal(page.localeTwo, PD.localeTwoFull);
      const person = store.find('person', PD.idOne);
      assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    });
    page.localeClickOptionTwo();
    andThen(() => {
      const person = store.find('person', PD.idOne);
      assert.equal(person.get('locale_fk'), LOCALED.idOne);
      assert.equal(person.get('locale.id'), LOCALED.idTwo);
      assert.ok(person.get('isDirtyOrRelatedDirty'));
      assert.equal(page.localeInput, PD.localeTwoFull);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let payload = PF.put({id: PD.idOne, locale: LOCALED.idTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  test('when changing the locale for a user (not current user), the language is not updated on the site', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      var person = store.find('person', PD.idOne);
      assert.ok(person.get('id') !== PERSON_CURRENT_DEFAULTS.id);
      assert.equal(find('.t-person-first-name').val(), PD.first_name);
      assert.equal(page.localeInput, PD.localeFull);
      assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");
    });
    page.localeClickDropdown();
    page.localeClickOptionTwo();
    andThen(() => {
      assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");
    });
  });

  test('deep linking with an xhr with a 404 status code will show up in the error component (person)', (assert) => {
    clearxhr(detail_xhr);
    clearxhr(list_xhr);
    const exception = `This record does not exist.`;
    xhr(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(find('.t-error-message').text(), 'WAT');
    });
  });

  test('settings values, placeholers, and inherited froms', assert => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      // inherited
      assert.equal(page.acceptAssignLabelText, translations['admin.setting.accept_assign']);
      assert.equal(page.acceptAssignChecked(), PD.inherited.accept_assign.inherited_value);
      assert.equal(page.acceptAssignInheritedFromLabelText, 'Inherited from: ' + TENANT_DEFAULTS.inherits_from_role);
      assert.equal(page.acceptNotifyLabelText, translations['admin.setting.accept_notify']);
      assert.equal(page.acceptNotifyChecked(), PD.inherited.accept_notify.inherited_value);
      assert.equal(page.acceptNotifyInheritedFromLabelText, 'Inherited from: ' + TENANT_DEFAULTS.inherits_from_role);
      // not inherited
      page.clickChangePassword();
      andThen(() => {
        assert.equal(page.passwordOneTimeLabelText, translations['admin.setting.password_one_time']);
        assert.notOk(page.passwordOneTimeChecked());
      });
      page.passwordOneTimeClick();
      andThen(() => {
        assert.ok(page.passwordOneTimeChecked());
      });
    });
  });

  test('update accept_assign accept_notify password_one_time', assert => {
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(page.acceptAssignChecked(), PD.inherited.accept_assign.inherited_value);
      assert.equal(page.acceptNotifyChecked(), PD.inherited.accept_notify.inherited_value);
      page.clickChangePassword();
      andThen(() => {
        assert.equal(page.passwordOneTimeLabelText, translations['admin.setting.password_one_time']);
        assert.notOk(page.passwordOneTimeChecked());
      });
      page.passwordOneTimeClick();
      andThen(() => {
        assert.ok(page.passwordOneTimeChecked());
      });
    });
    page.acceptAssignClick();
    page.acceptNotifyClick();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(page.acceptAssignChecked(), !PD.inherited.accept_assign.inherited_value);
      assert.equal(page.acceptNotifyChecked(), !PD.inherited.accept_notify.inherited_value);
    });
    let person = store.find('person', {id: PD.id});
    let payload = PF.put({id: PD.id});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
    });
  });

  test('link-to for accept_assign setting, and link routes to person.role', assert => {
    xhr(role_route_data_endpoint, 'GET', null, {}, 200, {});
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
    });
    xhr(`${ROLES_URL}${RD.idOne}/`, 'GET', null, {}, 200, RF.detail(RD.idOne));
    page.acceptAssignInheritedFromClick();
    andThen(() => {
      assert.equal(currentURL(), `${BASEURLS.base_roles_url}/${RD.idOne}`);
    });
  });

  test('link-to for accept_notify setting, and link routes to person.role', assert => {
    xhr(role_route_data_endpoint, 'GET', null, {}, 200, {});
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
      assert.equal(currentURL(), DETAIL_URL);
    });
    xhr(`${ROLES_URL}${RD.idOne}/`, 'GET', null, {}, 200, RF.detail(RD.idOne));
    page.acceptNotifyInheritedFromClick();
    andThen(() => {
      assert.equal(currentURL(), `${BASEURLS.base_roles_url}/${RD.idOne}`);
    });
  });
