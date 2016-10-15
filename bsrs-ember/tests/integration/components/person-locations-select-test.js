import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import typeInSearch from 'bsrs-ember/tests/helpers/type-in-search';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import waitFor from 'ember-test-helpers/wait';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import LD from 'bsrs-ember/vendor/defaults/location';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import PD from 'bsrs-ember/vendor/defaults/person';
import PLD from 'bsrs-ember/vendor/defaults/person-location';

let store, person, run = Ember.run, location_repo;

const PowerSelect = '.ember-power-select-trigger > .ember-power-select-multiple-options';
const DROPDOWN = '.ember-power-select-dropdown';
const OPTION = 'li.ember-power-select-option';

moduleForComponent('person-locations-select', 'integration: person-locations-select test', {
    integration: true,
    setup() {
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:person', 'model:location', 'model:person-location']);
        let service = this.container.lookup('service:i18n');
        loadTranslations(service, translations.generate('en'));
        run(function() {
            store.push('person-location', {id: PLD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
            store.push('person-location', {id: PLD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
            person = store.push('person', {id: PD.idOne});
            store.push('location', {id: LD.idOne, name: LD.storeName});
            store.push('location', {id: LD.idTwo, name: LD.storeNameTwo});
            store.push('location', {id: LD.unusedId, name: LD.storeNameThree});
        });
        location_repo = repository.initialize(this.container, this.registry, 'location');
        location_repo.findLocationSelect = function() {
            return store.find('location');
        };
    }
});

test('should render a selectbox when with no options (initial state)', function(assert) {
    this.model = person;
    this.selected = person.get('locations');
    this.extra_params = {};
    this.render(hbs`{{db-fetch-multi-select model=model multiAttr="location" selectedAttr=selected className="t-person-locations-select" displayName="name" add_func="add_location" remove_func="remove_location" repository=location_repo searchMethod="findLocationSelect" extra_params=extra_params}}`);
    clickTrigger();
    assert.equal(this.$(`${DROPDOWN}`).length, 1);
    assert.equal(this.$('.ember-power-select-options > li').length, 1);
    assert.equal(this.$(`${OPTION}`).text().trim(), GLOBALMSG.power_search);
    assert.equal(this.$(`.ember-power-select-multiple-option`).length, 2);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    this.model = person;
    this.selected = person.get('locations');
    this.location_repo = location_repo;
    this.extra_params = {};
    this.render(hbs`{{db-fetch-multi-select model=model multiAttr="location" selectedAttr=selected className="t-person-locations-select" displayName="name" add_func="add_location" remove_func="remove_location" repository=location_repo searchMethod="findLocationSelect" extra_params=extra_params}}`);
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal(this.$(`${DROPDOWN}`).length, 1);
            assert.equal(this.$('.ember-power-select-options > li').length, 3);
            assert.equal(this.$(`${OPTION}:eq(0)`).text().trim(), LD.storeName);
            assert.equal(this.$(`${OPTION}:eq(1)`).text().trim(), LD.storeNameTwo);
            assert.equal(this.$(`${OPTION}:eq(2)`).text().trim(), LD.storeNameThree);
            assert.equal(this.$(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
            assert.ok(this.$(`${PowerSelect} > span.ember-power-select-multiple-option:contains(this.${LD.storeName})`));
        });
});

test('should not send off xhr within DEBOUNCE INTERVAL', function(assert) {
    var done = assert.async();
    this.model = person;
    this.selected = person.get('locations');
    this.location_repo = location_repo;
    this.extra_params = {};
    this.render(hbs`{{db-fetch-multi-select model=model multiAttr="location" selectedAttr=selected className="t-person-locations-select" displayName="name" add_func="add_location" remove_func="remove_location" repository=location_repo searchMethod="findLocationSelect" extra_params=extra_params}}`);
    run(() => { typeInSearch('a'); });
    Ember.run.later(() => {
        assert.equal(this.$('.ember-power-select-options > li').length, 1);
        done();
    }, 150);//50ms used to allow repo to get hit, but within the DEBOUNCE INTERVAL, thus option length is not 3 yet
});
