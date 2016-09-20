import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import page from 'bsrs-ember/tests/pages/automation';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { AUTOMATION_URL, automation_LIST_URL, AUTOMATION_AVAILABLE_FILTERS_URL, PEOPLE_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const NEW_URL = `${BASE_URL}/new/1`;

var store, listXhr;

moduleForAcceptance('Acceptance | automation new test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = AF.list();
    listXhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, listData);
    random.uuid = function() { return UUID.value; };
  },
});

test('visit new URL and create a new record', assert => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  // description
  page.descriptionFill(AD.descriptionOne);
  andThen(() => {
    assert.equal(page.descriptionValue, AD.descriptionOne);
  });
  // filter w/ a criteria
  page.addFilter();
  andThen(() => {
    assert.equal(find('.t-automation-pf-select').length, 1);
  });
  xhr(`${AUTOMATION_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-automation-pf-select:eq(0)', PFD.keyOneTranslated);
  selectChoose('.t-priority-criteria', TD.priorityOne);
  xhr(AUTOMATION_URL, 'POST', AF.put({
    id: UUID.value,
    filters: [{
      id: UUID.value,
      source: PFD.sourceIdOne,
      criteria: [TD.priorityOneId],
      lookups: {}
    }]
  }), {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), automation_LIST_URL);
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  visit(NEW_URL);
  page.descriptionFill(AD.descriptionTwo);
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
      assert.equal(page.descriptionValue, AD.descriptionTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  visit(NEW_URL);
  page.descriptionFill(AD.descriptionTwo);
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
      assert.equal(currentURL(), automation_LIST_URL);
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
    assert.equal(currentURL(), automation_LIST_URL);
  });
});
