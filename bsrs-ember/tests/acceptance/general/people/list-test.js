import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { PEOPLE_URL } from 'bsrs-ember/utilities/urls';

const BASE_PEOPLE_LIST_URL = BASEURLS.base_people_url;
const PEOPLE_INDEX_URL = BASE_PEOPLE_LIST_URL + '/index';


moduleForAcceptance('Acceptance | general person list test', {
  beforeEach() {
    xhr(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
  },
});

test('visiting /people', function(assert) {
  visit(PEOPLE_INDEX_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_INDEX_URL);
    assert.equal(find('.t-grid-title').text(), t('admin.person.other'));
    assert.equal(find('.t-sort-fullname').text(), t('admin.person.label.fullname'));
    assert.equal(find('.t-sort-status-name').text(), t('admin.person.label.status'));
    assert.equal(find('.t-sort-title').text(), t('admin.person.label.title'));
    assert.equal(find('.t-sort-username').text(), t('admin.person.label.username'));
    assert.equal(find('.t-sort-role-name').text(), t('admin.person.label.role-name'));
  });
});
