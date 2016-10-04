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
import page from 'bsrs-ember/tests/pages/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL, CURRENCIES_URL } from 'bsrs-ember/utilities/urls';

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
  xhr(API_DETAIL_URL, 'PUT', TF.put({company_name: TD.companyNameTwo, default_currency: CD.idEuro}), {}, 200, TF.list());
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

test('deep linking with an xhr with a 404 status code will show up in the error component (currency)', (assert) => {
  clearxhr(detailXhr);
  clearxhr(listXhr);
  const exception = `This record does not exist.`;
  xhr(`${TENANT_URL}${TD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});
