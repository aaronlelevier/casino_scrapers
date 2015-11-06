import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

let store, ticket, person_one, person_two, person_three, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-ticket-assignee-select';

moduleForComponent('ticket-assignee-select', 'integration: ticket-assignee-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:person']);
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, assignee_fk: PEOPLE_DEFAULTS.idOne});
        person_one = store.push('person', {id: PEOPLE_DEFAULTS.idOne, first_name: PEOPLE_DEFAULTS.nameOne, last_name: PEOPLE_DEFAULTS.lastNameOne, username: PEOPLE_DEFAULTS.usernameOne, title: PEOPLE_DEFAULTS.titleOne});
        person_two = store.push('person', {id: PEOPLE_DEFAULTS.idTwo, first_name: PEOPLE_DEFAULTS.nameTwo, last_name: PEOPLE_DEFAULTS.lastNameTwo, username: PEOPLE_DEFAULTS.usernameTwo, title: PEOPLE_DEFAULTS.titleTwo});
        person_three = store.push('person', {id: PEOPLE_DEFAULTS.unusedId, first_name: PEOPLE_DEFAULTS.nameThree, last_name: PEOPLE_DEFAULTS.lastNameThree, username: PEOPLE_DEFAULTS.usernameThree, title: PEOPLE_DEFAULTS.titleThree});
    }
});

test('should render a selectbox when person options are empty (initial state of selectize)', function(assert) {
    let ticket_assignee_options = Ember.A([]);
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.render(hbs`{{ticket-assignee-select ticket=ticket ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal(this.$('.ember-power-select-placeholder').text(), GLOBALMSG.assignee_power_select);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.ok(!ticket.get('assignee'));
});

test('should render a selectbox with bound options after type ahead for search_assignee', function(assert) {
    let ticket_assignee_options = store.find('person');
    person_one.set('assigned_tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.set('search_assignee', 'x');
    this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal($('li.ember-power-select-option:eq(0)').text().trim(), `${PEOPLE_DEFAULTS.nameOne} ${PEOPLE_DEFAULTS.lastNameOne}`);
    assert.equal($('li.ember-power-select-option:eq(1)').text().trim(), `${PEOPLE_DEFAULTS.nameTwo} ${PEOPLE_DEFAULTS.lastNameTwo}`);
    assert.equal($('li.ember-power-select-option:eq(2)').text().trim(), `${PEOPLE_DEFAULTS.nameThree} ${PEOPLE_DEFAULTS.lastNameThree}`);
    assert.equal($(`${PowerSelect}`).text().trim(), `${PEOPLE_DEFAULTS.nameOne} ${PEOPLE_DEFAULTS.lastNameOne}`);
});

test('should be able to select new person when one doesnt exist', function(assert) {
    let ticket_assignee_options = store.find('person');
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.set('search_assignee', 'x');
    this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => { 
        $(`.ember-power-select-option:contains(${PEOPLE_DEFAULTS.nameOne})`).click(); 
    });
    assert.equal($(`${PowerSelect}`).text().trim(), `${PEOPLE_DEFAULTS.nameOne} ${PEOPLE_DEFAULTS.lastNameOne}`);
    assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idOne);
});

test('should be able to select same person when ticket already has a person', function(assert) {
    let ticket_assignee_options = store.find('person');
    person_one.set('assigned_tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.set('search_assignee', 'x');
    this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => { 
        $(`.ember-power-select-option:contains(${PEOPLE_DEFAULTS.nameOne})`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($(`${PowerSelect}`).text().trim(), `${PEOPLE_DEFAULTS.nameOne} ${PEOPLE_DEFAULTS.lastNameOne}`);
    assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idOne);
    assert.deepEqual(person_one.get('assigned_tickets'), [TICKET_DEFAULTS.idOne]);
    assert.deepEqual(person_two.get('assigned_tickets'), undefined);
});

test('should be able to select new person when ticket already has a person', function(assert) {
    let ticket_assignee_options = store.find('person');
    person_one.set('assigned_tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.set('search_assignee', 'x');
    this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => { 
        $(`.ember-power-select-option:contains(${PEOPLE_DEFAULTS.nameTwo})`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($(`${PowerSelect}`).text().trim(), `${PEOPLE_DEFAULTS.nameTwo} ${PEOPLE_DEFAULTS.lastNameTwo}`);
    assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idTwo);
    assert.deepEqual(person_one.get('assigned_tickets'), []);
    assert.deepEqual(person_two.get('assigned_tickets'), [TICKET_DEFAULTS.idOne]);
});

// test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
//     var done = assert.async();
//     let ticket_assignee_options = store.find('person');
//     this.set('ticket', ticket);
//     this.set('ticket_assignee_options', ticket_assignee_options);
//     this.set('search_assignee', undefined);
//     this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
//     let $component = this.$('.t-ticket-assignee-select');
//     this.$('.selectize-input input').val('x').trigger('keyup');
//     setTimeout(() => {
//         assert.equal(this.get('search_assignee'), undefined);
//         setTimeout(() => {
//             assert.equal(this.get('search_assignee'), 'x');
//             done();
//         }, 11);
//     }, 290);
// });


