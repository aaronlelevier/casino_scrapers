import Ember from 'ember';
import trim from 'bsrs-ember/utilities/trim';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import typeInSearch from 'bsrs-ember/tests/helpers/type-in-search';
import waitFor from 'ember-test-helpers/wait';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';

let store, category, category_two, category_three, category_repo, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger > .ember-power-select-multiple-options';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-category-children-select';
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
      category_three = store.push('category', {id: CD.unusedId, name: CD.nameThree});
    });
    category_repo = repository.initialize(this.container, this.registry, 'category');
    category_repo.findCategoryChildren = function() {
      return store.find('category');
    };
  }
});

test('should render a selectbox when with options selected (initial state)', function(assert) {
  let categories_children = Ember.A([]);
  this.set('model', category_two);
  this.repository = category_repo;
  this.render(hbs`{{db-fetch-multi-select model=model multiAttr="children" multiAttrIds="children_ids" selectedAttr=model.children className="t-category-children-select" displayName="name" add_func="add_children" remove_func="remove_child" repository=repository searchMethod="findCategoryChildren"}}`);
  let $component = this.$(COMPONENT);
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-power-select-options > li').length, 1);
  assert.equal($(OPTION).text().trim(), GLOBALMSG.power_search);
  assert.equal($(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 0);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
  let categories_children = store.find('category');
  this.set('model', category);
  this.repository = category_repo;
  this.render(hbs`{{db-fetch-multi-select model=model multiAttr="children" multiAttrIds="children_ids" selectedAttr=model.children className="t-category-children-select" displayName="name" add_func="add_children" remove_func="remove_child" repository=repository searchMethod="findCategoryChildren"}}`);
  let $component = this.$(COMPONENT);
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(DROPDOWN).length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      assert.equal($(`${OPTION}:eq(0)`).text().trim(), CD.nameOne);
      assert.equal($(`${OPTION}:eq(1)`).text().trim(), CD.nameTwo);
      assert.equal($(`${OPTION}:eq(2)`).text().trim(), CD.nameThree);
      assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 1);
      assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains(${CD.nameOne})`));
    });
});
