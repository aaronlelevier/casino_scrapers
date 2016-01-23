import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import CD from 'bsrs-ember/vendor/defaults/category';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_CD from 'bsrs-ember/vendor/defaults/ticket-category';

let store, m2m, m2m_two, m2m_three, ticket, category_one, category_two, category_three, category_four, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-ticket-category-select';

moduleForComponent('ticket-category-select', 'integration: ticket-category-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:category', 'model:ticket-category']);
        run(function() {
            m2m = store.push('ticket-category', {id: TICKET_CD.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CD.idOne});
            m2m_two = store.push('ticket-category', {id: TICKET_CD.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CD.idTwo});
            m2m_three = store.push('ticket-category', {id: TICKET_CD.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CD.unusedId});
            ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_category_fks: [TICKET_CD.idOne, TICKET_CD.idTwo, TICKET_CD.idThree]});
            category_one = store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo, children_fks: []});
            category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId, children_fks: []});
            category_three = store.push('category', {id: CD.unusedId, name: CD.nameThree, parent_id: null, children_fks: []});
            category_four = store.push('category', {id: CD.idThree, name: CD.nameRepairChild, parent_id: null, children_fks: []});
        });
    }
});

test('should render a selectbox when the options are empty (initial state of power-select)', function(assert) {
    assert.equal(1,1);
    // run(function() {
    //     store.clear('category');
    //     store.clear('ticket-category');
    // });
    // ticket.set('ticket_category_fks', []);
    // ticket.set('category', category_one);
    // let ticket_category_options = Ember.A([]);
    // this.set('ticket', ticket);
    // this.set('ticket_category_options', ticket_category_options);
    // this.render(hbs`{{ticket-category-select ticket=ticket category=category ticket_category_options=ticket_category_options}}`);
    // let $component = this.$(`${COMPONENT}`);
    // clickTrigger();
    // assert.equal($(`${DROPDOWN}`).length, 1);
    // assert.equal(this.$('.ember-power-select-placeholder').text(), GLOBALMSG.category_power_select);
    // assert.equal($('.ember-power-select-options > li').length, 1);
    // assert.notOk($('.ember-power-select-search').text());
});

// test('scott should render a selectbox with bound options after type ahead for search', function(assert) {
//     let ticket_category_options = store.find('category');
//     this.set('ticket', ticket);
//     this.set('ticket_category_options', ticket_category_options);
//     this.render(hbs`{{ticket-category-select ticket=ticket ticket_category_options=ticket_category_options}}`);
//     let $component = this.$(`${COMPONENT}`);
//     assert.equal($component.find(`${PowerSelect}`).text().trim(), CD.nameThree);
//     clickTrigger();
//     assert.equal($(`${DROPDOWN}`).length, 1);
//     assert.equal($('.ember-power-select-options > li').length, 4);
// });

// test('should render a selectbox with bound options and can change top level category', function(assert) {
//     let onlyParents = function(category) {
//         return category.get('parent') === undefined;
//     };
//     let ticket_category_options = store.find('category', onlyParents, []);
//     this.set('ticket', ticket);
//     this.set('ticket_category_options', ticket_category_options);
//     this.render(hbs`{{ticket-category-select ticket=ticket ticket_category_options=ticket_category_options}}`);
//     let $component = this.$(`${COMPONENT}`);
//     assert.equal($component.find(`${PowerSelect}`).text().trim(), CD.nameThree);
//     assert.equal(ticket.get('top_level_category').get('id'), CD.unusedId);
//     clickTrigger();
//     assert.equal($(`${DROPDOWN}`).length, 1);
//     assert.equal($('.ember-power-select-options > li').length, 2);
//     run(() => {
//         $(`.ember-power-select-option:contains(${CD.nameRepairChild})`).mouseup();
//     });
//     clickTrigger();
//     assert.equal($(`${DROPDOWN}`).length, 1);
//     assert.equal($('.ember-power-select-options > li').length, 2);
//     assert.equal(ticket.get('top_level_category').get('id'), CD.idThree);
// });
