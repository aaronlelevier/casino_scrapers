import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import ROLE_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/role-category';

let store, m2m, m2m_two, role, category_one, category_two, category_three, run = Ember.run;

moduleForComponent('role-category-select', 'integration: role-category-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:role', 'model:category', 'model:role-category']);
        m2m = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
        m2m_two = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idTwo, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idTwo});
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]});
        category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
        category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo});
        category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree});
    }
});

test('should render a selectbox when category options are empty (initial state of selectize)', function(assert) {
    let categories_children = Ember.A([]);
    this.set('role', role);
    this.set('categories_children', categories_children);
    this.render(hbs`{{role-category-select role=role categories_children=categories_children}}`);
    let $component = this.$('.t-role-category-select');
    assert.equal($component.prop('multiple'), true);
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 0);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let categories_children = store.find('category');
    this.set('role', role);
    this.set('categories_children', categories_children);
    this.set('search', 'x');
    this.render(hbs`{{role-category-select role=role search=search categories_children=categories_children}}`);
    let $component = this.$('.t-role-category-select');
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 1);
});

test('should render a selectbox with bound options and multiple set to true after type ahead for search', function(assert) {
    let categories_children = store.find('category');
    this.set('role', role);
    this.set('categories_children', categories_children);
    this.set('search', 'x');
    this.render(hbs`{{role-category-select role=role search=search categories_children=categories_children}}`);
    let $component = this.$('.t-role-category-select');
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 1);
    this.$('.selectize-input input').trigger('click');
    this.$('.selectize-input input').val('a').trigger('change');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 3);
    assert.equal($component.find('div.option').length, 0);
    assert.equal(role.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.unusedId);
    let unique_category = role.get('categories_ids').toArray().uniq();
    assert.equal(unique_category.get('length'), 3);
});

// test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
//     var done = assert.async();
//     this.set('category', category);
//     this.set('search', undefined);
//     this.set('model', category.get('locations'));
//     this.render(hbs`{{category-locations-select model=model category=category search=search}}`);
//     let $component = this.$('.t-category-locations-select');
//     this.$('div.selectize-input input').val('x').trigger('keyup');
//     setTimeout(() => {
//         assert.equal(this.get('search'), undefined);
//         setTimeout(() => {
//             assert.equal(this.get('search'), 'x');
//             done();
//         }, 15);
//     }, 290);
// });


