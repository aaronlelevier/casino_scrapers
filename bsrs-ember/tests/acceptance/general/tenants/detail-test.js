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
import DD from 'bsrs-ember/vendor/defaults/dtd';
import DF from 'bsrs-ember/vendor/dtd_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PF from 'bsrs-ember/vendor/people_fixtures';
import page from 'bsrs-ember/tests/pages/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL, CURRENCIES_URL, PEOPLE_URL, DTD_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const API_DETAIL_URL = `${TENANT_URL}${TD.idOne}/`;

var store, detailXhr, listXhr;

moduleForAcceptance('Acceptance | tenant detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = TF.list();
    listXhr = xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, listData);
    const detailData = TF.detail();
    detailXhr = xhr(API_DETAIL_URL, 'GET', null, {}, 200, detailData);
  },
});

test('by clicking record in list view, User is sent to detail view', assert => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('visit detail and update all fields', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
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

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
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

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
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
      var tenant = store.find('tenant', TD.idOne);
      assert.equal(tenant.get('company_name'), TD.companyNameOne);
    });
  });
});

test('clicking cancel button with no edits will take from detail view to list view', (assert) => {
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

test('when click delete, modal displays and when click ok, tenant is deleted and removed from store', assert => {
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
      assert.equal(store.find('tenant', TD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when click delete, and click no modal disappears', assert => {
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

// test('deep linking with an xhr with a 404 status code will show up in the error component (currency)', (assert) => {
//   clearxhr(detailXhr);
//   clearxhr(listXhr);
//   const exception = `This record does not exist.`;
//   xhr(`${TENANT_URL}${TD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
//   page.visitDetail();
//   andThen(() => {
//     assert.equal(currentURL(), DETAIL_URL);
//     assert.equal(find('.t-error-message').text(), 'WAT');
//   });
// });
