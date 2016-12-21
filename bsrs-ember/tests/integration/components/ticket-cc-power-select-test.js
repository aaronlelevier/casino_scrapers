import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import { typeInSearch, clickTrigger } from '../../helpers/ember-power-select';
import waitFor from 'ember-test-helpers/wait';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TPD from 'bsrs-ember/vendor/defaults/ticket-join-person';

let store, m2m, m2m_two, ticket, person_one, person_two, person_three, trans, run = Ember.run, person_repo;
const PowerSelect = '.ember-power-select-trigger > .ember-power-select-multiple-options';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-ticket-cc-select';
const OPTION = 'li.ember-power-select-option';
const PD = PERSON_DEFAULTS.defaults();

moduleForComponent('ticket-cc-power-select', 'integration: ticket-cc-power-select test', {
  integration: true,
  setup() {
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:person', 'model:ticket-join-person']);
    run(function() {
      m2m = store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
      m2m_two = store.push('ticket-join-person', {id: TPD.idTwo, ticket_pk: TD.idOne, person_pk: PD.idTwo});
      ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne, TPD.idTwo]});
      person_one = store.push('person', {id: PD.id, first_name: PD.first_name, last_name: PD.last_name});
      person_two = store.push('person', {id: PD.idTwo, first_name: 'Scooter', last_name: 'McGavin'});
      person_three = store.push('person', {id: PD.unusedId, first_name: 'Aaron', last_name: 'Wat'});
    });
    person_repo = repository.initialize(this.container, this.registry, 'person');
    person_repo.findTicketPeople = function() {
      return store.find('person');
    };
  }
});

test('should render a selectbox when with options selected (initial state)', function(assert) {
  run(function() {
    store.clear('ticket-join-person');
  });
  let ticket_cc_options = Ember.A([]);
  this.model = ticket;
  this.selected = ticket.get('cc');
  this.person_repo = person_repo;
  this.render(hbs`{{db-fetch-multi-select model=model multiAttr="cc" selectedAttr=selected className="t-ticket-cc-select" displayName="fullname" add_func="add_cc" remove_func="remove_cc" repository=person_repo searchMethod="findTicketPeople" extra_params=extra_params}}`);
  let $component = this.$(COMPONENT);
  clickTrigger();
  assert.equal($(`${DROPDOWN}`).length, 1);
  assert.equal($('.ember-power-select-options > li').length, 1);
  assert.equal($(`${OPTION}`).text().trim(), GLOBALMSG.power_search);
  assert.equal($(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 0);
});

// test('should render a selectbox with bound options after type ahead for search', function(assert) {
//   let ticket_cc_options = store.find('person');
//   this.model = ticket;
//   this.selected = ticket.get('cc');
//   this.person_repo = person_repo;
//   this.render(hbs`{{db-fetch-multi-select model=model multiAttr="cc" selectedAttr=selected className="t-ticket-cc-select" displayName="fullname" add_func="add_cc" remove_func="remove_cc" repository=person_repo searchMethod="findTicketPeople" extra_params=extra_params}}`);
//   let $component = this.$(COMPONENT);
//   clickTrigger();
//   run(() => { typeInSearch('a'); });
//   return waitFor().
//   then(() => {
//     assert.equal($(`${DROPDOWN}`).length, 1);
//     assert.equal($('.ember-power-select-options > li').length, 3);
//     assert.equal($(`${OPTION}:eq(0)`).text().trim(), PD.fullname);
//     assert.equal($(`${OPTION}:eq(1)`).text().trim(), 'Scooter McGavin');
//     assert.equal($(`${OPTION}:eq(2)`).text().trim(), 'Aaron Wat');
//     assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
//     assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains(${PD.fullname})`));
//     assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains('Scooter McGavin')`));
//   });
// });

test('should not send off xhr within DEBOUNCE INTERVAL', function(assert) {
  var done = assert.async();
  let ticket_cc_options = store.find('person');
  this.model = ticket;
  this.selected = ticket.get('cc');
  this.person_repo = person_repo;
  this.render(hbs`{{db-fetch-multi-select model=model multiAttr="cc" selectedAttr=selected className="t-ticket-cc-select" displayName="fullname" add_func="add_cc" remove_func="remove_cc" repository=person_repo searchMethod="findTicketPeople" extra_params=extra_params}}`);
  let $component = this.$(`${COMPONENT}`);
  run(() => { typeInSearch('a'); });
  Ember.run.later(() => {
    assert.equal($('.ember-power-select-options > li').length, 1);
    done();
  }, 150);//50ms used to allow repo to get hit, but within the DEBOUNCE INTERVAL, thus option length is not 3 yet
});
