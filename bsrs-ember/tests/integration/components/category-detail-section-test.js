import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import moment from 'moment';
import CD from 'bsrs-ember/vendor/defaults/category';
import page from 'bsrs-ember/tests/pages/category';

let store, category;

moduleForComponent('category-detail-section', 'Integration | Component | category-detail-section', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:category']);
    run(() => {
      category = store.push('category', {
        id: CD.idOne,
        sc_category_name: CD.scCategoryNameOne,
        inherited: {
          sc_category_name: {
            value: CD.scCategoryNameOne
          }
        }
      });
    });
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('sc_category_name inherited text should not show if there is a concrete value', function(assert) {
  this.model = category;
  this.render(hbs`{{
    categories/detail-section
    model=model
  }}`);
  assert.equal(page.scCategoryNameInput, CD.scCategoryNameOne);
  assert.equal(this.$('.t-inherited-msg-sc_category_name').length, 0);
});

test('sc_category_name inherited text should show if there is no concrete value', function(assert) {
  run(() => {
    category = store.push('category', {
      id: CD.idOne,
      sc_category_name: null,
      inherited: {
        sc_category_name: {
          value: null,
          inherited_from: 'category'
        }
      }
    });
  });
  this.model = category;
  this.render(hbs`{{
    categories/detail-section
    model=model
  }}`);
  assert.equal(page.scCategoryNameInput, '');
  assert.equal(this.$('.t-inherited-msg-sc_category_name').length, 1);
});