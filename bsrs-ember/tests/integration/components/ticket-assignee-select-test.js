import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import PD from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import waitFor from 'ember-test-helpers/wait';
import { typeInSearch, clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';

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
      person_one = store.push('related-person', {id: PD.idOne, first_name: PD.nameOne, last_name: PD.lastNameOne, username: PD.usernameOne, title: PD.titleOne});
      person_two = store.push('related-person', {id: PD.idTwo, first_name: PD.nameTwo, last_name: PD.lastNameTwo, username: PD.usernameTwo, title: PD.titleTwo});
      person_three = store.push('related-person', {id: PD.unusedId, first_name: PD.nameThree, last_name: PD.lastNameThree, username: PD.usernameThree, title: PD.titleThree});
    });
    person_repo = repository.initialize(this.container, this.registry, 'person');
    person_repo.findTicketAssignee = function() {
      return [
        {id: PD.idOne, fullname: PD.nameOne + ' ' + PD.lastNameOne, username: PD.usernameOne, title: PD.titleOne},
        {id: PD.idTwo, fullname: PD.nameTwo + ' ' + PD.lastNameTwo, username: PD.usernameTwo, title: PD.titleTwo},
        {id: PD.unusedId, fullname: PD.nameThree + ' ' + PD.lastNameThree, username: PD.usernameThree, title: PD.titleThree}
      ];
    };
  }
});

test('should be able to select new person when one doesnt exist', function(assert) {
  this.model = ticket;
  this.set('person_repo', person_repo);
  this.render(hbs`{{db-fetch-select model=model selectedAttr=model.assignee className="t-ticket-assignee-select" displayName="fullname" change_func="change_assignee" repository=person_repo searchMethod="findTicketAssignee"}}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(`${DROPDOWN}`).length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${PD.nameOne})`);
      assert.equal($(`${PowerSelect}`).text().trim(), `${PD.nameOne} ${PD.lastNameOne}`);
      assert.equal(ticket.get('assignee').get('id'), PD.idOne);
    });
});

test('should be able to select same person when ticket already has a person', function(assert) {
  person_one.set('assigned_tickets', [TD.idOne]);
  this.model = ticket;
  this.set('person_repo', person_repo);
  this.render(hbs`{{db-fetch-select model=model selectedAttr=model.assignee className="t-ticket-assignee-select" displayName="fullname" change_func="change_assignee" repository=person_repo searchMethod="findTicketAssignee"}}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(`${DROPDOWN}`).length, 1);
      assert.equal($('.ember-basic-dropdown-content').length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${PD.nameOne})`);
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
  person_one.set('assigned_tickets', [TD.idOne]);
  this.model = ticket;
  this.set('person_repo', person_repo);
  this.render(hbs`{{db-fetch-select 
    model=model 
    selectedAttr=model.assignee 
    className="t-ticket-assignee-select" 
    displayName="fullname" 
    change_func="change_assignee" 
    repository=person_repo 
    searchMethod="findTicketAssignee"
  }}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(`${DROPDOWN}`).length, 1);
      assert.equal($('.ember-basic-dropdown-content').length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${PD.nameTwo})`);
      assert.equal($(`${DROPDOWN}`).length, 0);
      assert.equal($('.ember-basic-dropdown-content').length, 0);
      assert.equal($('.ember-power-select-options > li').length, 0);
      assert.equal($(`${PowerSelect}`).text().trim(), `${PD.nameTwo} ${PD.lastNameTwo}`);
      assert.equal(ticket.get('assignee').get('id'), PD.idTwo);
      assert.equal(ticket.get('assignee').get('fullname'), `${PD.nameTwo} ${PD.lastNameTwo}`);
      assert.deepEqual(person_one.get('assigned_tickets'), []);
      assert.deepEqual(person_two.get('assigned_tickets'), [TD.idOne]);
    });
});

test('should not send off xhr within DEBOUNCE INTERVAL', function(assert) {
  var done = assert.async();
  this.model = ticket;
  this.set('person_repo', person_repo);
  this.render(hbs`{{db-fetch-select model=model selectedAttr=model.assignee className="t-ticket-assignee-select" displayName="fullname" change_func="change_assignee" repository=person_repo searchMethod="findTicketAssignee"}}`);
  clickTrigger();
  run(() => { typeInSearch('a'); });
  Ember.run.later(() => {
    assert.equal($('.ember-power-select-option').length, 1);
    done();
  }, 150);//50ms used to allow repo to get hit, but within the DEBOUNCE INTERVAL, thus option length is not 3 yet
});
