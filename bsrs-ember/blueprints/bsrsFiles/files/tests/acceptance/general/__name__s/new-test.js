import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= camelizedModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= secondModelTitle %>F from 'bsrs-ember/vendor/<%= secondModelPlural %>_fixtures';
import page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= secondModelPluralCaps %>_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const NEW_URL = `${BASE_URL}/new/1`;
const LIST_URL = `${BASE_URL}/index`;

const SEARCH = '.ember-power-select-search input';

var application, store, original_uuid, listXhr;

moduleForAcceptance('Acceptance | <%= dasherizedModuleName %> new test', {
  beforeEach() {
    
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = <%= camelizedModuleName %>F.list();
    listXhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, listData);
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    random.uuid = original_uuid;
    
  }
});

test('visit new URL and create a new record', assert => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  // <%= firstProperty %>
  page.<%= firstPropertyCamel %>Fill(<%= camelizedModuleName %>D.<%= firstPropertyCamel %>One);
  andThen(() => {
    assert.equal(page.<%= firstPropertyCamel %>Value, <%= camelizedModuleName %>D.<%= firstPropertyCamel %>One);
  });
  // <%= secondProperty %>
  let keyword = 'boy1';
  xhr(`${<%= secondModelPluralCaps %>_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, <%= secondModelTitle %>F.search_power_select());
  selectSearch('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  selectChoose('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  let payload = {
    id: UUID.value,
    <%= firstProperty %>: <%= camelizedModuleName %>D.<%= firstPropertyCamel %>One,
    <%= secondProperty %>: '249543cf-8fea-426a-8bc3-09778cd78001'
  };
  xhr(<%= CapitalizeModule %>_URL, 'POST', payload, {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  visit(NEW_URL);
  page.<%= firstPropertyCamel %>Fill(<%= camelizedModuleName %>D.<%= firstPropertyCamel %>Two);
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
      assert.equal(page.<%= firstPropertyCamel %>Value, <%= camelizedModuleName %>D.<%= firstPropertyCamel %>Two);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  visit(NEW_URL);
  page.<%= firstPropertyCamel %>Fill(<%= camelizedModuleName %>D.<%= firstPropertyCamel %>Two);
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
      assert.equal(currentURL(), LIST_URL);
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
    assert.equal(currentURL(), LIST_URL);
  });
});
