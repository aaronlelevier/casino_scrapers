import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';

let store, m2m, m2m_two, m2m_three, ticket, category_one, category_two, category_three, category_four, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-ticket-category-select';

moduleForComponent('ticket-category-select', 'integration: ticket-category-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:category', 'model:ticket-category']);
        run(function() {
            m2m = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
            m2m_two = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
            m2m_three = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.unusedId});
            ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_category_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo, TICKET_CATEGORY_DEFAULTS.idThree]});
            category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo});
            category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId});
            category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null});
            category_four = store.push('category', {id: CATEGORY_DEFAULTS.idThree, name: CATEGORY_DEFAULTS.nameRepairChild, parent_id: null});
        });
    }
});

test('should render a selectbox when the options are empty (initial state of power-select)', function(assert) {
    run(function() {
        store.clear('category');
        store.clear('ticket-category');
    });
    ticket.set('ticket_category_fks', []);
    let ticket_category_options = Ember.A([]);
    this.set('ticket', ticket);
    this.set('ticket_category_options', ticket_category_options);
    this.render(hbs`{{ticket-category-select ticket=ticket ticket_category_options=ticket_category_options}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal(this.$('.ember-power-select-placeholder').text(), GLOBALMSG.category_power_select);
    assert.equal($('.ember-power-select-options > li').length, 1);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let ticket_category_options = store.find('category');
    this.set('ticket', ticket);
    this.set('ticket_category_options', ticket_category_options);
    this.render(hbs`{{ticket-category-select ticket=ticket ticket_category_options=ticket_category_options}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), CATEGORY_DEFAULTS.nameThree);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 4);
});

test('should render a selectbox with bound options and can change top level category', function(assert) {
    let onlyParents = function(category) {
        return category.get('parent') === undefined;
    };
    let ticket_category_options = store.find('category', onlyParents, []);
    this.set('ticket', ticket);
    this.set('ticket_category_options', ticket_category_options);
    this.render(hbs`{{ticket-category-select ticket=ticket ticket_category_options=ticket_category_options}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), CATEGORY_DEFAULTS.nameThree);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.unusedId);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 2);
    run(() => { 
        $(`.ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameRepairChild})`).mouseup();
    });
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 2);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idThree);
});

