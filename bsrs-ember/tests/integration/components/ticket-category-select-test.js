import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';

let store, m2m, m2m_two, ticket, category_one, category_two, category_three, run = Ember.run;

moduleForComponent('ticket-category-select', 'integration: ticket-category-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:category', 'model:ticket-category']);
        m2m = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
        m2m_two = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo]});
        category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
        category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameOne});
        category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameOne});
    }
});

test('should render a selectbox when the options are empty (initial state of selectize)', function(assert) {
    let ticket_category_options = Ember.A([]);
    this.set('ticket', ticket);
    this.set('ticket_category_options', ticket_category_options);
    this.set('search_category', '');
    this.render(hbs`{{ticket-category-select ticket=ticket search_category=search_category ticket_category_options=ticket_category_options}}`);
    let $component = this.$('.t-ticket-category-select');
    assert.equal($component.prop('multiple'), true);
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 0);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let ticket_category_options = store.find('category');
    this.set('ticket', ticket);
    this.set('ticket_category_options', ticket_category_options);
    this.set('search_category', 'x');
    this.render(hbs`{{ticket-category-select ticket=ticket search_category=search_category ticket_category_options=ticket_category_options}}`);
    let $component = this.$('.t-ticket-category-select');
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 1);
});

test('should render a selectbox with bound options and multiple set to true after type ahead for search', function(assert) {
    let ticket_category_options = store.find('category');
    this.set('ticket', ticket);
    this.set('ticket_category_options', ticket_category_options);
    this.set('search_category', 'x');
    this.render(hbs`{{ticket-category-select ticket=ticket search_category=search_category ticket_category_options=ticket_category_options}}`);
    let $component = this.$('.t-ticket-category-select');
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 1);
    this.$('.selectize-input input').trigger('click');
    this.$('.selectize-input input').val('a').trigger('change');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 3);
    assert.equal($component.find('div.option').length, 0);
    assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.unusedId);
    let unique_people = ticket.get('categories_ids').toArray().uniq();
    assert.equal(unique_people.get('length'), 3);
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

