import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= FirstCharacterModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= SecondModelSingleCharacter %>F from 'bsrs-ember/vendor/<%= secondModel %>_fixtures';
import page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= CapitalizeModule %>_LIST_URL, <%= secondModelPluralCaps %>_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const NEW_URL = `${BASE_URL}/new/1`;

var store, listXhr;

moduleForAcceptance('Acceptance | general <%= dasherizedModuleName %> new test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = <%= FirstCharacterModuleName %>F.list();
    listXhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, listData);
    random.uuid = function() { return UUID.value; };
  },
});

test('visit new URL and create a new record', assert => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  // <%= firstProperty %>
  page.<%= firstPropertyCamel %>Fill(<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One);
  andThen(() => {
    assert.equal(page.<%= firstPropertyCamel %>Value, <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One);
  });
  // <%= secondProperty %>
  // Assuming secondModel is person
  let keyword = 'Boy1';
  xhr(`${<%= secondModelPluralCaps %>_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, <%= SecondModelSingleCharacter %>F.search_power_select());
  selectSearch('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  selectChoose('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  xhr(<%= CapitalizeModule %>_URL, 'POST', <%= FirstCharacterModuleName %>F.put({id: UUID.value, <%= secondPropertySnake %>: <%= FirstCharacterModuleName %>D.<%= secondPropertyCamel %>SelectOne}), {}, 200, <%= FirstCharacterModuleName %>F.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  visit(NEW_URL);
  page.<%= firstPropertyCamel %>Fill(<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
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
      assert.equal(page.<%= firstPropertyCamel %>Value, <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  visit(NEW_URL);
  page.<%= firstPropertyCamel %>Fill(<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
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
      assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
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
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  });
});
