import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import moment from 'moment';
import CD from 'bsrs-ember/vendor/defaults/category';
import SCD from 'bsrs-ember/vendor/defaults/sccategory';
import page from 'bsrs-ember/tests/pages/category';

let store, category;

moduleForComponent('category-other-section', 'Integration | Component | category-other-section', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:category', 'model:sccategory']);
    run(() => {
      category = store.push('category', {
        id: CD.idOne,
        sccategory_fk: SCD.idOne,
        inherited: {
          sc_category: {
            value: CD.scCategoryNameOne
          }
        }
      });
      store.push('sccategory', {id: SCD.idOne, name: SCD.nameOne, categories: [CD.idOne]});
    });
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('sc_category inherited text should not show if there is a concrete value', function(assert) {
  this.model = category;
  this.render(hbs`{{
    categories/other-section
    model=model
  }}`);
  assert.equal(page.scCategoryNameInput, `${SCD.nameOne} ×`);
  assert.equal(this.$('.t-inherited-msg-sc_category_name').length, 0);
});

test('sc_category inherited text should show if there is no concrete value', function(assert) {
  run(() => {
    category = store.push('category', {
      id: CD.idOne,
      sccategory_fk: undefined,
      inherited: {
        sc_category: {
          value: null,
          inherited_from: 'category'
        }
      }
    });
    store.push('sccategory', {id: SCD.idOne, removed: true});
  });
  this.model = category;
  this.render(hbs`{{
    categories/other-section
    model=model
  }}`);
  assert.equal(this.$('.t-inherited-msg-sc_category_name').length, 1);
});