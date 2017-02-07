import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import typeInSearch from 'bsrs-ember/tests/helpers/type-in-search';
import wait from 'ember-test-helpers/wait';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import CD from 'bsrs-ember/vendor/defaults/category';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';

let store, category, category_two, category_repo, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger > .ember-power-select-multiple-options';
const DROPDOWN = '.ember-power-select-dropdown';
const OPTION = 'li.ember-power-select-option';

moduleForComponent('category-children-select', 'integration: category-children-select-test', {
  integration: true,
  setup() {
    translation.initialize(this);
    store = module_registry(this.container, this.registry, ['model:category', 'model:category-children']);
    const service = this.container.lookup('service:i18n');
    loadTranslations(service, translations.generate('en'));
    run(() => {
      store.push('category-children', {id: CD.idOne, category_pk: CD.idOne, children_pk: CD.idTwo});
      category = store.push('category', {id: CD.idOne, name: CD.nameOne});
      category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo});
      store.push('category', {id: CD.unusedId, name: CD.nameThree});
    });
    category_repo = repository.initialize(this.container, this.registry, 'category');
    category_repo.findCategoryBySearch = function() {
      return store.find('category');
    };
  }
});

test('should render a selectbox when with options selected (initial state)', function(assert) {
  this.set('model', category_two);
  this.repository = category_repo;
  this.render(hbs`{{db-fetch-multi-select model=model multiAttr="children" multiAttrIds="children_ids" selectedAttr=model.children className="t-category-children-select" displayName="name" add_func="add_children" remove_func="remove_child" repository=repository searchMethod="findCategoryBySearch"}}`);
  clickTrigger();
  assert.equal(Ember.$(DROPDOWN).length, 1);
  assert.equal(Ember.$('.ember-power-select-options > li').length, 1);
  assert.equal(Ember.$(OPTION).text().trim(), GLOBALMSG.power_search);
  assert.equal(Ember.$(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 0);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
  this.set('model', category);
  this.repository = category_repo;
  this.render(hbs`{{db-fetch-multi-select model=model multiAttr="children" multiAttrIds="children_ids" selectedAttr=model.children className="t-category-children-select" displayName="name" add_func="add_children" remove_func="remove_child" repository=repository searchMethod="findCategoryBySearch"}}`);
  run(() => { typeInSearch('a'); });
  return wait().
    then(() => {
      assert.equal(Ember.$(DROPDOWN).length, 1);
      assert.equal(Ember.$('.ember-power-select-options > li').length, 3);
      assert.equal(Ember.$(`${OPTION}:eq(0)`).text().trim(), CD.nameOne);
      assert.equal(Ember.$(`${OPTION}:eq(1)`).text().trim(), CD.nameTwo);
      assert.equal(Ember.$(`${OPTION}:eq(2)`).text().trim(), CD.nameThree);
      assert.equal(Ember.$(`${PowerSelect} > .ember-power-select-multiple-option`).length, 1);
      assert.ok(Ember.$(`${PowerSelect} > span.ember-power-select-multiple-option:contains(${CD.nameOne})`));
    });
});
