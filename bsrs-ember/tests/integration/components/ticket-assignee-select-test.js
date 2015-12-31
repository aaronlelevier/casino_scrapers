import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import PD from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import typeInSearch from 'bsrs-ember/tests/helpers/type-in-search';
import waitFor from 'ember-test-helpers/wait';

let store, ticket, person_one, person_two, person_three, run = Ember.run, person_repo;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-ticket-assignee-select';

moduleForComponent('ticket-assignee-select', 'integration: ticket-assignee-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:person']);
        run(function() {
            ticket = store.push('ticket', {id: TD.idOne, assignee_fk: PD.idOne});
            person_one = store.push('person', {id: PD.idOne, first_name: PD.nameOne, last_name: PD.lastNameOne, username: PD.usernameOne, title: PD.titleOne});
            person_two = store.push('person', {id: PD.idTwo, first_name: PD.nameTwo, last_name: PD.lastNameTwo, username: PD.usernameTwo, title: PD.titleTwo});
            person_three = store.push('person', {id: PD.unusedId, first_name: PD.nameThree, last_name: PD.lastNameThree, username: PD.usernameThree, title: PD.titleThree});
        });
        person_repo = repository.initialize(this.container, this.registry, 'person');
        person_repo.findTicketAssignee = function() {
            return store.find('person');
        };
    }
});

test('should render a selectbox when person options are empty (initial state of selectize)', function(assert) {
    let ticket_assignee_options = Ember.A([]);
    this.set('ticket', ticket);
    this.render(hbs`{{ticket-assignee-select ticket=ticket}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal(this.$('.ember-power-select-placeholder').text(), GLOBALMSG.assignee_power_select);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.ok(!ticket.get('assignee'));
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let ticket_assignee_options = store.find('person');
    person_one.set('assigned_tickets', [TD.idOne]);
    this.set('ticket', ticket);
    this.render(hbs`{{ticket-assignee-select ticket=ticket}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-power-select-option').length, 3);
            assert.equal($('li.ember-power-select-option:eq(0)').text().trim(), `${PD.nameOne} ${PD.lastNameOne}`);
            assert.equal($('li.ember-power-select-option:eq(1)').text().trim(), `${PD.nameTwo} ${PD.lastNameTwo}`);
            assert.equal($('li.ember-power-select-option:eq(2)').text().trim(), `${PD.nameThree} ${PD.lastNameThree}`);
            assert.equal($(`${PowerSelect}`).text().trim(), `${PD.nameOne} ${PD.lastNameOne}`);
        });
});

test('should be able to select new person when one doesnt exist', function(assert) {
    let ticket_assignee_options = store.find('person');
    this.set('ticket', ticket);
    this.render(hbs`{{ticket-assignee-select ticket=ticket}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-power-select-options > li').length, 3);
            run(() => { 
                $(`.ember-power-select-option:contains(${PD.nameOne})`).mouseup(); 
            });
            assert.equal($(`${PowerSelect}`).text().trim(), `${PD.nameOne} ${PD.lastNameOne}`);
            assert.equal(ticket.get('assignee').get('id'), PD.idOne);
        });
});

test('should be able to select same person when ticket already has a person', function(assert) {
    let ticket_assignee_options = store.find('person');
    person_one.set('assigned_tickets', [TD.idOne]);
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.render(hbs`{{ticket-assignee-select ticket=ticket ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-basic-dropdown-content').length, 1);
            assert.equal($('.ember-power-select-options > li').length, 3);
            run(() => { 
                $(`.ember-power-select-option:contains(${PD.nameOne})`).mouseup(); 
            });
            assert.equal($(`${DROPDOWN}`).length, 0);
            assert.equal($('.ember-basic-dropdown-content').length, 0);
            assert.equal($('.ember-power-select-options > li').length, 0);
            assert.equal($(`${PowerSelect}`).text().trim(), `${PD.nameOne} ${PD.lastNameOne}`);
            assert.equal(ticket.get('assignee').get('id'), PD.idOne);
            assert.deepEqual(person_one.get('assigned_tickets'), [TD.idOne]);
            assert.deepEqual(person_two.get('assigned_tickets'), undefined);
    });
});

test('should be able to select new person when ticket already has a person', function(assert) {
    let ticket_assignee_options = store.find('person');
    person_one.set('assigned_tickets', [TD.idOne]);
    this.set('ticket', ticket);
    this.render(hbs`{{ticket-assignee-select ticket=ticket}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-basic-dropdown-content').length, 1);
            assert.equal($('.ember-power-select-options > li').length, 3);
            run(() => { 
                $(`.ember-power-select-option:contains(${PD.nameTwo})`).mouseup(); 
            });
            assert.equal($(`${DROPDOWN}`).length, 0);
            assert.equal($('.ember-basic-dropdown-content').length, 0);
            assert.equal($('.ember-power-select-options > li').length, 0);
            assert.equal($(`${PowerSelect}`).text().trim(), `${PD.nameTwo} ${PD.lastNameTwo}`);
            assert.equal(ticket.get('assignee').get('id'), PD.idTwo);
            assert.deepEqual(person_one.get('assigned_tickets'), []);
            assert.deepEqual(person_two.get('assigned_tickets'), [TD.idOne]);
    });
});

