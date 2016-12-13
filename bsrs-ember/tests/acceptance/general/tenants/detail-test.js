import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import CF from 'bsrs-ember/vendor/currency_fixtures';
import CD from 'bsrs-ember/vendor/defaults/currency';
import COD from 'bsrs-ember/vendor/defaults/country';
import DD from 'bsrs-ember/vendor/defaults/dtd';
import DF from 'bsrs-ember/vendor/dtd_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PF from 'bsrs-ember/vendor/people_fixtures';
import SF from 'bsrs-ember/vendor/state_fixtures';
import CountryF from 'bsrs-ember/vendor/country_fixtures';
import page from 'bsrs-ember/tests/pages/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL, CURRENCIES_URL, PEOPLE_URL, DTD_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const API_DETAIL_URL = `${TENANT_URL}${TD.idOne}/`;
const CURRENCY = '.t-currency-select';

var  detailXhr, listXhr;

moduleForAcceptance('Acceptance | general tenant detail test', {
  beforeEach() {
    const listData = TF.list();
    listXhr = xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, listData);
    const detailData = TF.detail();
    detailXhr = xhr(API_DETAIL_URL, 'GET', null, {}, 200, detailData);
  },
});

test('by clicking record in list view, User is sent to detail view', function(assert) {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('visit detail and update all fields', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(document.title, t('doctitle.tenant.single', { companyName: 'foobar' }));
    assert.equal(page.companyNameValue, TD.companyNameOne);
    assert.equal(page.currencyInput, TD.name);
    // fields that only exist on the detail/update record, and not the create
    assert.equal(find('.t-tenant-test_mode').prop('checked'), TD.testModeFalse);
    assert.ok(page.implementationContact.indexOf(PD.fullname) > -1);
    assert.equal(page.dtdStart, DD.descriptionStart);
  });
  // company_name
  page.companyNameFill(TD.companyNameTwo);
  andThen(() => {
    assert.equal(page.companyNameValue, TD.companyNameTwo);
  });
  // currency
  selectChoose('.t-currency-select', CD.nameEuro);
  andThen(() => {
    assert.equal(page.currencyInput, CD.nameEuro);
  });
  // test_mode
  page.testModeClick();
  andThen(() => {
    assert.equal(find('.t-tenant-test_mode').prop('checked'), TD.testModeTrue);
  });
  // implementation_contact - optionally remove first, then add back to show that
  // remove works as well
  page.clearImplementationContact();
  andThen(() => {
    assert.equal(page.implementationContact, 'Click to select');
  });
  const keyword = 'a';
  const personData = PF.get_for_power_select(PD.idTwo, PD.nameTwo, PD.lastNameTwo);
  const personFullname = PD.nameTwo + ' ' + PD.lastNameTwo;
  xhr(`${PEOPLE_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, personData);
  selectSearch('.t-tenant-implementation_contact-select', keyword);
  selectChoose('.t-tenant-implementation_contact-select', personFullname);
  andThen(() => {
    assert.ok(page.implementationContact.indexOf(personFullname) > -1);
  });
  // dtd_start
  const dtdData = DF.list();
  const dtdId = dtdData.results[0].id;
  const dtdDescription = dtdData.results[0].description;
  xhr(`${DTD_URL}?search=${keyword}`, 'GET', null, {}, 200, dtdData);
  selectSearch('.t-tenant-dtd_start-select', keyword);
  selectChoose('.t-tenant-dtd_start-select', dtdDescription);
  andThen(() => {
    assert.equal(page.dtdStart, dtdDescription);
  });
  // PUT
  const payload = TF.put({
    company_name: TD.companyNameTwo,
    default_currency: CD.idEuro,
    test_mode: TD.testModeTrue,
    implementation_contact: PD.idTwo,
    dtd_start: dtdId
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, TF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', function(assert) {
  clearxhr(listXhr);
  page.visitDetail();
  page.companyNameFill(TD.companyNameTwo);
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
      assert.equal(page.companyNameValue, TD.companyNameTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', function(assert) {
  page.visitDetail();
  page.companyNameFill(TD.companyNameTwo);
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
      assert.equal(currentURL(), TENANT_LIST_URL);
      var tenant = this.store.find('tenant', TD.idOne);
      assert.equal(tenant.get('company_name'), TD.companyNameOne);
    });
  });
});

test('clicking cancel button with no edits will take from detail view to list view', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
  });
});

// delete modal tests

test('when click delete, modal displays and when click ok, tenant is deleted and removed from this.store', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'tenant'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${TENANT_URL}${TD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TENANT_LIST_URL);
      assert.equal(this.store.find('tenant', TD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when click delete, and click no modal disappears', function(assert) {
  clearxhr(listXhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'tenant'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  generalPage.clickModalCancelDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

// modal tests: end

test('deep linking with an xhr with a 404 status code will show up in the error component (currency)', function(assert) {
  errorSetup();
  clearxhr(detailXhr);
  clearxhr(listXhr);
  const exception = `This record does not exist.`;
  xhr(`${TENANT_URL}${TD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
  errorTearDown();
});

test('validations work', function(assert) {
  clearxhr(listXhr);
  page.visitDetail();
  page.companyNameFill('');
  triggerEvent('.t-tenant-company_name', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-company_name').text().trim(), t('errors.tenant.company_name'));
    assert.equal($('.invalid').length, 1);
  });
  page.companyImplementationContactFill('');
  triggerEvent('.t-tenant-implementation_contact_initial', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-implementation_contact_initial').text().trim(), t('errors.tenant.implementation_contact_initial'));
    assert.equal($('.invalid').length, 2);
  });
  page.companyCodeFill('');
  triggerEvent('.t-tenant-company_code', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-company_code').text().trim(), t('errors.tenant.company_code'));
    assert.equal($('.invalid').length, 3);
  });
  page.companyBillingContactFill('');
  triggerEvent('.t-tenant-billing_contact', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-billing_contact').text().trim(), t('errors.tenant.billing_contact'));
    assert.equal($('.invalid').length, 4);
  });
  page.companyBillingAddressFill('');
  triggerEvent('.t-address-address', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-address').text().trim(), t('errors.address.address'));
    assert.equal($('.invalid').length, 5);
  });
  page.companyBillingCityFill('');
  triggerEvent('.t-address-city', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-city').text().trim(), t('errors.address.city'));
    assert.equal($('.invalid').length, 6);
  });
  page.companyBillingZipFill('');
  triggerEvent('.t-address-postal-code', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-postal_code').text().trim(), t('errors.address.postal_code'));
    assert.equal($('.invalid').length, 7);
  });
  page.companyBillingEmailFill('');
  triggerEvent('.t-email-email1', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-email').text().trim(), t('errors.email.email'));
    assert.equal($('.invalid').length, 8);
  });
  page.companyBillingPhoneFill('');
  triggerEvent('.t-phonenumber-number', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-number').text().trim(), t('errors.phonenumber.number'));
    assert.equal($('.invalid').length, 9);
  });
  page.companyDashboardTextFill('');
  triggerEvent('.t-tenant-dashboard_text', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-dashboard_text').text().trim(), t('errors.tenant.dashboard_text'));
    assert.equal($('.invalid').length, 10);
  });
  page.companyImplementationEmailFill('');
  triggerEvent('.t-email-email', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.t-validation-email:eq(0)').text().trim(), t('errors.email.email'));
    assert.equal($('.invalid').length, 11);
  });

  // TODO: When removing country from multi select it doesnt trigger validation.
  // removeMultipleOption('.t-tenant-country-select', COD.name);
  // andThen(() => {
  //   assert.equal(currentURL(), DETAIL_URL);
  //   assert.equal($('.t-validation-countries').text().trim(), 'errors.tenant.countries');
  //   assert.equal($('.invalid').length, 4);
  // });
});
