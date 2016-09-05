import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= FirstCharacterModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= SecondModelSingleCharacter %>F from 'bsrs-ember/vendor/<%= secondModel %>_fixtures';
import <%= SecondModelSingleCharacter %>D from 'bsrs-ember/vendor/defaults/<%= secondModel %>';
import page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= CapitalizeModule %>_LIST_URL, <%= secondModelPluralCaps %>_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const DETAIL_URL = `${BASE_URL}/${<%= FirstCharacterModuleName %>D.idOne}`;
const API_DETAIL_URL = `${<%= CapitalizeModule %>_URL}${<%= FirstCharacterModuleName %>D.idOne}/`;

var store, detailXhr, listXhr;

moduleForAcceptance('Acceptance | <%= dasherizedModuleName %> detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = <%= FirstCharacterModuleName %>F.list();
    listXhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, listData);
    const detailData = <%= FirstCharacterModuleName %>F.detail();
    detailXhr = xhr(API_DETAIL_URL, 'GET', null, {}, 200, detailData);
  },
});

test('by clicking record in list view, User is sent to detail view', assert => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
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
    assert.equal(page.<%= firstPropertyCamel %>Value, <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One);
    assert.equal(page.<%= secondProperty %>Input, <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>);
  });
  // <%= firstProperty %>
  page.<%= firstPropertyCamel %>Fill(<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
  andThen(() => {
    assert.equal(page.<%= firstPropertyCamel %>Value, <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
  });
  // <%= secondProperty %>
  // Assuming secondModel is person
  let keyword = 'Boy1';
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=${keyword}/`, 'GET', null, {}, 200, <%= SecondModelSingleCharacter %>F.search_power_select());
  selectSearch('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  selectChoose('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  andThen(() => {
    // ex. PD.fullnameBoy
    assert.equal(page.<%= secondProperty %>Input, <%= SecondModelSingleCharacter %>D.<%= secondModelDisplaySnake %>Boy);
  });
  xhr(API_DETAIL_URL, 'PUT', <%= FirstCharacterModuleName %>F.put({<%= firstPropertyCamel %>: <%= FirstCharacterModuleName %>D.<%= firstPropertySnake %>Two, <%= secondPropertyCamel %>: <%= FirstCharacterModuleName %>D.<%= secondPropertySnake %>SelectOne}), {}, 200, <%= FirstCharacterModuleName %>F.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  page.visitDetail();
  page.<%= firstPropertyCamel %>Fill(<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
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
      assert.equal(page.<%= firstPropertyCamel %>Value, <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  page.<%= firstPropertyCamel %>Fill(<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
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
      assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
      var <%= dasherizedModuleName %> = store.find('<%= dasherizedModuleName %>', <%= FirstCharacterModuleName %>D.idOne);
      assert.equal(<%= dasherizedModuleName %>.get('<%= firstProperty %>'), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One);
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
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  });
});

// delete modal tests

test('when click delete, modal displays and when click ok, <%= dasherizedModuleName %> is deleted and removed from store', assert => {
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
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: '<%= dasherizedModuleName %>'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${<%= CapitalizeModule %>_URL}${<%= FirstCharacterModuleName %>D.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
      assert.equal(store.find('<%= dasherizedModuleName %>', <%= FirstCharacterModuleName %>D.idOne).get('length'), undefined);
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
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: '<%= dasherizedModuleName %>'}));
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

test('deep linking with an xhr with a 404 status code will show up in the error component (<%= secondModelSnake %>)', (assert) => {
  clearxhr(detailXhr);
  clearxhr(listXhr);
  const exception = `This record does not exist.`;
  xhr(`${<%= CapitalizeModule %>_URL}${<%= FirstCharacterModuleName %>D.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});
