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
import CountryD from 'bsrs-ember/vendor/defaults/country';
import CountryF from 'bsrs-ember/vendor/country_fixtures';
import page from 'bsrs-ember/tests/pages/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL, CURRENCIES_URL, COUNTRY_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_TENANT_URL;
const NEW_URL = `${BASE_URL}/new/1`;

var store, listXhr;

moduleForAcceptance('Acceptance | tenant new test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = TF.list();
    listXhr = xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, listData);
    random.uuid = function() { return UUID.value; };
  },
});

test('visit new URL and create a new record', assert => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  // company_name
  page.companyNameFill(TD.companyNameOne);
  andThen(() => {
    assert.equal(page.companyNameValue, TD.companyNameOne);
  });
  // currency
  selectChoose('.t-currency-select', CD.nameEuro);
  andThen(() => {
    assert.equal(page.currencyInput, CD.nameEuro);
  });
  // country
  const keyword = 'a';
  const countryData = CountryF.list_power_select();
  const countryId = countryData.results[1].id;
  const countryName = countryData.results[1].name;
  xhr(`${COUNTRY_URL}tenant/?search=${keyword}`, 'GET', null, {}, 200, countryData);
  selectSearch('.t-tenant-country-select', keyword);
  selectChoose('.t-tenant-country-select', 'Merica1');
  andThen(() => {
    assert.ok(page.countrySelectedOne.indexOf(countryName) > -1);
  });
  xhr(TENANT_URL, 'POST', TF.put({id: UUID.value, currency: CD.idEuro, country: [countryId]}), {}, 200, TF.list());
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

// TODO: (ayl) Failing
// test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
//   visit(NEW_URL);
//   page.companyNameFill(TD.companyNameTwo);
//   generalPage.cancel();
//   andThen(() => {
//     waitFor(assert, () => {
//       assert.equal(currentURL(), NEW_URL);
//       assert.ok(generalPage.modalIsVisible);
//     });
//   });
//   generalPage.clickModalRollback();
//   andThen(() => {
//     waitFor(assert, () => {
//       assert.equal(currentURL(), TENANT_LIST_URL);
//     });
//   });
// });

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
