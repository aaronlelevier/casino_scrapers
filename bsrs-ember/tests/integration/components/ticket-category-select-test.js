import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';

let store, m2m, m2m_two, m2m_three, ticket, category_one, category_two, category_three, run = Ember.run;

moduleForComponent('ticket-category-select', 'integration: ticket-category-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:category', 'model:ticket-category']);
        m2m = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
        m2m_two = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
        m2m_three = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.unusedId});
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_category_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo, TICKET_CATEGORY_DEFAULTS.idThree]});
        category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo});
        category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId});
        category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null});
        category_three = store.push('category', {id: CATEGORY_DEFAULTS.idThree, name: CATEGORY_DEFAULTS.nameRepairChild, parent_id: null});
    }
});

test('should render a selectbox when the options are empty (initial state of selectize)', function(assert) {
    let ticket_category_options = Ember.A([]);
    this.set('ticket', ticket);
    this.set('ticket_category_options', ticket_category_options);
    this.render(hbs`{{ticket-category-select ticket=ticket ticket_category_options=ticket_category_options}}`);
    let $component = this.$('.t-ticket-category-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 1);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let ticket_category_options = store.find('category');
    this.set('ticket', ticket);
    this.set('ticket_category_options', ticket_category_options);
    this.render(hbs`{{ticket-category-select ticket=ticket ticket_category_options=ticket_category_options}}`);
    let $component = this.$('.t-ticket-category-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 4);
});

test('should render a selectbox with bound options and can change top level category', function(assert) {
    let onlyParents = function(category) {
        return category.get('parent') === undefined;
    }
    let ticket_category_options = store.find('category', onlyParents, []);
    this.set('ticket', ticket);
    this.set('ticket_category_options', ticket_category_options);
    this.render(hbs`{{ticket-category-select ticket=ticket ticket_category_options=ticket_category_options}}`);
    let $component = this.$('.t-ticket-category-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 2);
    assert.equal(ticket.get('top_level_category.id'), CATEGORY_DEFAULTS.unusedId);
    this.$('.selectize-input input').trigger('click');
    run(() => { 
        $component.find('div.option:eq(1)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 2);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idThree);
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

