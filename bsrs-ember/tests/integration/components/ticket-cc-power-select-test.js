import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import typeInSearch from 'bsrs-ember/tests/helpers/type-in-search';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import waitFor from 'ember-test-helpers/wait';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-person';

let store, m2m, m2m_two, ticket, person_one, person_two, person_three, run = Ember.run, person_repo;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-ticket-cc-select';
const OPTION = 'li.ember-power-select-option';

moduleForComponent('ticket-cc-power-select', 'integration: ticket-cc-power-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:person', 'model:ticket-person']);
        run(function() {
            m2m = store.push('ticket-person', {id: TICKET_PEOPLE_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
            m2m_two = store.push('ticket-person', {id: TICKET_PEOPLE_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.idTwo});
            ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PEOPLE_DEFAULTS.idOne, TICKET_PEOPLE_DEFAULTS.idTwo]});
            person_one = store.push('person', {id: PEOPLE_DEFAULTS.id, first_name: PEOPLE_DEFAULTS.first_name, last_name: PEOPLE_DEFAULTS.last_name});
            person_two = store.push('person', {id: PEOPLE_DEFAULTS.idTwo, first_name: 'Scooter', last_name: 'McGavin'});
            person_three = store.push('person', {id: PEOPLE_DEFAULTS.unusedId, first_name: 'Aaron', last_name: 'Wat'});
        });
        person_repo = repository.initialize(this.container, this.registry, 'person');
        person_repo.findTicketPeople = function() {
            return store.find('person');
        };
    }
});

test('should render a selectbox when with options selected (initial state)', function(assert) {
    run(function() {
        store.clear('ticket-person');
    });
    let ticket_cc_options = Ember.A([]);
    this.set('ticket', ticket);
    this.render(hbs`{{ticket-cc-power-select ticket=ticket}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($(`${OPTION}`).text(), GLOBALMSG.power_search);
    assert.equal($(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 0);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let ticket_cc_options = store.find('person');
    this.set('ticket', ticket);
    this.render(hbs`{{ticket-cc-power-select ticket=ticket}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-power-select-options > li').length, 3);
            assert.equal($(`${OPTION}:eq(0)`).text().trim(), PEOPLE_DEFAULTS.fullname);
            assert.equal($(`${OPTION}:eq(1)`).text().trim(), 'Scooter McGavin');
            assert.equal($(`${OPTION}:eq(2)`).text().trim(), 'Aaron Wat');
            assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
            assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains(${PEOPLE_DEFAULTS.fullname})`));
            assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains('Scooter McGavin')`));
        });
});
