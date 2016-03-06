import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import typeInSearch from 'bsrs-ember/tests/helpers/type-in-search';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import waitFor from 'ember-test-helpers/wait';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

let store, ticket, location_one, location_two, location_three, trans, run = Ember.run, location_repo;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-ticket-location-select';

moduleForComponent('ticket-location-select', 'integration: ticket-location-select test', {
    integration: true,
    setup() {
        trans = this.container.lookup('service:i18n');
        loadTranslations(trans, translations.generate('en'));
        translation.initialize(this);

        store = module_registry(this.container, this.registry, ['model:ticket', 'model:location']);
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, location_fk: LOCATION_DEFAULTS.idOne});
        run(function() {
            location_one = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName});
            location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo});
            location_three = store.push('location', {id: LOCATION_DEFAULTS.unusedId, name: LOCATION_DEFAULTS.storeNameThree});
        });
        location_repo = repository.initialize(this.container, this.registry, 'location');
        location_repo.findTicket = function() {
            return store.find('location');
        };
    }
});

test('should render a selectbox when location options are empty (initial state of selectize)', function(assert) {
    let ticket_location_options = Ember.A([]);
    this.model = ticket;
    this.locationRepo = location_repo;
    this.render(hbs`{{db-fetch-select model=model selectedAttr=model.location className="t-ticket-location-select" displayName="name" change_func="change_location" remove_func="remove_location" repository=locationRepo searchMethod="findTicket"}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text(), GLOBALMSG.power_search);
    assert.equal(this.$('.ember-power-select-placeholder').text(), GLOBALMSG.location_power_select);
    assert.ok(!ticket.get('location'));
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let ticket_location_options = store.find('location');
    location_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.model = ticket;
    this.locationRepo = location_repo;
    this.render(hbs`{{db-fetch-select model=model selectedAttr=model.location className="t-ticket-location-select" displayName="name" change_func="change_location" remove_func="remove_location" repository=locationRepo searchMethod="findTicket"}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-power-select-options > li').length, 3);
            assert.equal($('li.ember-power-select-option:eq(0)').text().trim(), LOCATION_DEFAULTS.storeName);
            assert.equal($('li.ember-power-select-option:eq(1)').text().trim(), LOCATION_DEFAULTS.storeNameTwo);
            assert.equal($('li.ember-power-select-option:eq(2)').text().trim(), LOCATION_DEFAULTS.storeNameThree);
            assert.equal($(`${PowerSelect}`).text().trim(), LOCATION_DEFAULTS.storeName);
        });
});

test('should be able to select new location when one doesnt exist', function(assert) {
    let ticket_location_options = store.find('location');
    this.model = ticket;
    this.locationRepo = location_repo;
    this.render(hbs`{{db-fetch-select model=model selectedAttr=model.location className="t-ticket-location-select" displayName="name" change_func="change_location" remove_func="remove_location" repository=locationRepo searchMethod="findTicket"}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-power-select-options > li').length, 3);
            run(() => {
                $(`.ember-power-select-option:contains(${LOCATION_DEFAULTS.storeName})`).mouseup();
            });
            assert.equal($component.find(`${PowerSelect}`).text().trim(), LOCATION_DEFAULTS.storeName);
            assert.equal(ticket.get('location').get('id'), LOCATION_DEFAULTS.idOne);
        });
});

test('should be able to select new location when ticket already has a location', function(assert) {
    let ticket_location_options = store.find('location');
    location_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.model = ticket;
    this.locationRepo = location_repo;
    this.render(hbs`{{db-fetch-select model=model selectedAttr=model.location className="t-ticket-location-select" displayName="name" change_func="change_location" remove_func="remove_location" repository=locationRepo searchMethod="findTicket"}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-basic-dropdown-content').length, 1);
            assert.equal($('.ember-power-select-options > li').length, 3);
            run(() => {
                $(`.ember-power-select-option:contains(${LOCATION_DEFAULTS.storeNameTwo})`).mouseup();
            });
            assert.equal($(`${DROPDOWN}`).length, 0);
            assert.equal($('.ember-basic-dropdown-content').length, 0);
            assert.equal($('.ember-power-select-options > li').length, 0);
            assert.equal($component.find(`${PowerSelect}`).text().trim(), LOCATION_DEFAULTS.storeNameTwo);
            assert.equal(ticket.get('location').get('id'), LOCATION_DEFAULTS.idTwo);
            assert.deepEqual(location_one.get('tickets'), []);
            assert.deepEqual(location_two.get('tickets'), [TICKET_DEFAULTS.idOne]);
        });
});
