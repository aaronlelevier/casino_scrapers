import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import CD from 'bsrs-ember/vendor/defaults/currency';
import CF from 'bsrs-ember/vendor/currency_fixtures';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import PD from 'bsrs-ember/vendor/defaults/phone-number';
import PTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import AD from 'bsrs-ember/vendor/defaults/address';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import SD from 'bsrs-ember/vendor/defaults/state';
import SF from 'bsrs-ember/vendor/state_fixtures';
import CountryD from 'bsrs-ember/vendor/defaults/country';
import CountryF from 'bsrs-ember/vendor/country_fixtures';
import page from 'bsrs-ember/tests/pages/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL, CURRENCIES_URL, COUNTRY_URL, STATE_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_TENANT_URL;
const NEW_URL = `${BASE_URL}/new/1`;

var store, listXhr, counter = 0;

moduleForAcceptance('Acceptance | tenant new test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = TF.list();
    listXhr = xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, listData);
    random.uuid = function() { return UUID.value; };
  },
});

test('visit new URL and create a new record', assert => {
  andThen(() => {
    patchIncrement(counter);
  });
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    //title
    assert.equal(page.headerTitleText, t('tenant.new'));
  });
  // company_name
  page.companyNameFill(TD.companyNameOne);
  andThen(() => {
    assert.equal(page.companyNameValue, TD.companyNameOne);
    //title change
    assert.equal(page.headerTitleText, TD.companyNameOne);
  });
  // currency
  selectChoose('.t-currency-select', CD.name);
  andThen(() => {
    assert.equal(page.currencyInput, CD.name);
  });
  //fill in required fields to pass validation
  page.companyCodeFill(TD.companyCodeOne);
  page.companyDashboardTextFill(TD.companyDashboardTextOne);
  page.companyImplementationContactFill(TD.implementationContactInitialOne);
  selectChoose('.t-email-type-select:eq(0)', ETD.workName);
  page.companyImplementationEmailFill(ED.emailOne);
  page.companyBillingContactFill(TD.billingContactOne);
  selectChoose('.t-email-type-select:eq(1)', ETD.workName);
  page.companyBillingEmailFill(ED.emailOne);
  selectChoose('.t-phone-number-type-select:eq(0)', PTD.officeNameValue);
  page.companyBillingPhoneFill(PD.numberOne);
  selectChoose('.t-address-type-select:eq(0)', ATD.officeNameText);
  page.companyBillingAddressFill(AD.streetOne);
  page.companyBillingCityFill(AD.cityOne);
  page.companyBillingZipFill(AD.zipOne);

  // state mock
  const keyword = 'a';
  const stateListResults = SF.list_power_select();
  const stateId = stateListResults.results[0].id;
  const stateName = stateListResults.results[0].name;
  xhr(`${STATE_URL}tenant/?search=${keyword}`, 'GET', null, {}, 200, stateListResults);

  selectSearch('.t-address-state:eq(0)', keyword);
  selectChoose('.t-address-state:eq(0)', stateName);

  // country mock
  const countryData = CountryF.list_power_select();
  const countryId = countryData.results[1].id;
  const countryName = countryData.results[1].name;
  xhr(`${COUNTRY_URL}tenant/?search=${keyword}`, 'GET', null, {}, 200, countryData);

  // billing country
  selectSearch('.t-address-country:eq(0)', keyword);
  selectChoose('.t-address-country', countryName);

  // tenant country
  selectSearch('.t-tenant-country-select', keyword);
  selectChoose('.t-tenant-country-select', countryName);
  andThen(() => {
    assert.ok(page.countrySelectedOne.indexOf(countryName) > -1);
  });

  xhr(TENANT_URL, 'POST', TF.put({
    id: 5,
    countries: [countryId],
    billing_address: {
      id: 4,
      type: ATD.officeId,
      address: AD.streetOne,
      city: AD.cityOne,
      state: stateId,
      postal_code: AD.zipOne,
      country: countryId
    },
    billing_email: {
      id: 2,
      email: ED.emailOne,
      type: ETD.workId
    },
    billing_phone_number: {
      id: 3,
      number: PD.numberOne,
      type: PTD.idOne
    },
    implementation_email: {
      id: 1,
      email: ED.emailOne,
      type: ETD.workId
    }
  }), {}, 200, TF.list());

  generalPage.save();

  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  visit(NEW_URL);
  page.companyNameFill(TD.companyNameTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.equal(page.companyNameValue, TD.companyNameTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  visit(NEW_URL);
  page.companyNameFill(TD.companyNameTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TENANT_LIST_URL);
    });
  });
});

test('clicking cancel button with no edits will take from detail view to list view', (assert) => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
  });
});
