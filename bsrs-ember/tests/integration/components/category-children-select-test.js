import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';

let store, category, category_two, category_three, category_repo, run = Ember.run;

moduleForComponent('category-children-select', 'integration: category-children-select-test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:category']);
        category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, children_fks: [CATEGORY_DEFAULTS.idTwo]});
        category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, children_fks: []});
        category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, children_fks: []});
        category_repo = repository.initialize(this.container, this.registry, 'category');
        category_repo.findCategoryChildren = function() { 
            return store.find('category'); 
        };
    }
});

test('should render a selectbox with bound options and multiple set to true', function(assert) {
    this.set('model', category);
    this.render(hbs`{{category-children-select category=model}}`);
    let $component = this.$('.t-category-children-select');
    assert.equal($component.prop('multiple'), true);
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 0);
});

// test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
//     var done = assert.async();
//     this.set('model', category);
//     this.set('search', undefined);
//     this.set('categories_children', store.find('category'));
//     this.render(hbs`{{category-children-select search=search category=model categories_children=categories_children}}`);
//     this.$('div.selectize-input input').val('x').trigger('keyup');
//     setTimeout(() => {
//         assert.equal(this.get('search'), undefined);
//         setTimeout(() => {
//             assert.equal(this.get('search'), 'x');
//             done();
//         }, 11);
//     }, 290);
// });

