import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import page from 'bsrs-ember/tests/pages/category';
import BASEURLS, { CATEGORIES_URL } from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_INDEX_URL = BASE_URL + '/index';

let application;

moduleForAcceptance('Acceptance | category list test', {
  beforeEach() {
    
    xhr(`${CATEGORIES_URL}?page=1`, "GET", null, {}, 200, CATEGORY_FIXTURES.list());
  },
  afterEach() {
    
  }
});

test('visiting /categories/index', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
    assert.equal(find('.t-sort-name').text(), t('admin.category.label.name'));
    assert.equal(find('.t-sort-description').text(), t('admin.category.label.description'));
    assert.equal(find('.t-sort-label').text(), t('admin.category.label.label'));
    // assert.equal(find('.t-sort-cost-amount').text(), t('admin.category.label.label'));
    // assert.equal(find('.t-sort-cost-code').text(), t('admin.category.label.label'));
  });
});
