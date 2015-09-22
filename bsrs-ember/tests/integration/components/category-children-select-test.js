import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';

let store, category, category_two, category_three, category_repo, run = Ember.run;

moduleForComponent('category-children-select', 'sco integration: category-children-select-test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:category']);
        category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, children_fks: [CATEGORY_DEFAULTS.idTwo]});
        category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, children_fks: []});
        category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, children_fks: []});
        category_repo = repository.initialize(this.container, this.registry, 'category');
        category_repo.find = function() { return store.find('category'); };
    }
});

test('should render a selectbox with bound options and multiple set to true', function(assert) {
    this.set('model', category);
    this.render(hbs`{{category-children-select category=model}}`);
    let $component = this.$('.t-category-children-select');
    assert.equal($component.prop('multiple'), true);
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 2);
});

test('select should show items selected correctly based on the model', function(assert) {
    this.set('model', category);
    this.render(hbs`{{category-children-select category=model}}`);
    let $component = this.$('.t-category-children-select');
    assert.equal(category.get('children').get('length'), 1);
    assert.deepEqual(category.get('children_fks'), [CATEGORY_DEFAULTS.idTwo]);
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 2);
    assert.equal($component.find('div.item:eq(0)').data('value'), CATEGORY_DEFAULTS.idTwo);
    this.$('.selectize-input input').trigger('click');
    run(() => { $component.find('div.option:eq(1)').trigger('click').trigger('change'); });
    assert.equal($component.find('div.option').length, 1);
    assert.equal($component.find('div.item').length, 2);
    assert.equal(category.get('children').get('length'), 2);
    assert.deepEqual(category.get('children_fks'), [CATEGORY_DEFAULTS.idTwo, CATEGORY_DEFAULTS.unusedId]);
    assert.equal($component.find('div.item:eq(0)').data('value'), CATEGORY_DEFAULTS.idTwo);
    assert.equal($component.find('div.item:eq(1)').data('value'), CATEGORY_DEFAULTS.unusedId);
    run(() => { $component.find('div.item:eq(1) > a.remove').trigger('click').trigger('change'); });
    assert.equal($component.find('div.option').length, 2);
    assert.equal($component.find('div.item').length, 1);
    assert.equal(category.get('children').get('length'), 1);
    assert.deepEqual(category.get('children_fks'), [CATEGORY_DEFAULTS.idTwo]);
    assert.equal($component.find('div.item:eq(0)').data('value'), CATEGORY_DEFAULTS.idTwo);
});




