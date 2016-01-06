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

let store, m2m, m2m_two, person, location_one, location_two, location_three, run = Ember.run, location_repo;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-person-locations-select';
const OPTION = 'li.ember-power-select-option';

moduleForComponent('person-locations-select', 'integration: person-locations-select test', {
    integration: true,
    setup() {
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:person', 'model:location', 'model:person-location']);
        let service = this.container.lookup('service:i18n');
        loadTranslations(service, translations.generate('en'));
        run(function() {
            m2m = store.push('person-location', {id: PLD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
            m2m_two = store.push('person-location', {id: PLD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
            person = store.push('person', {id: PD.idOne});
            location_one = store.push('location', {id: LD.idOne, name: LD.storeName});
            location_two = store.push('location', {id: LD.idTwo, name: LD.storeNameTwo});
            location_three = store.push('location', {id: LD.unusedId, name: LD.storeNameThree});
        });
        location_repo = repository.initialize(this.container, this.registry, 'location');
        location_repo.findLocationSelect = function() {
            return store.find('location');
        };
    }
});

test('should render a selectbox when with no options (initial state)', function(assert) {
    let person_locations_children = Ember.A([]);
    this.set('person', person);
    this.render(hbs`{{person-locations-select person=person}}`);
    let $component = this.$(`${COMPONENT}`);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($(`${OPTION}`).text(), GLOBALMSG.power_search);
    assert.equal($(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 2);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let person_locations_children = store.find('location');
    this.set('person', person);
    this.render(hbs`{{person-locations-select person=person}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { typeInSearch('a'); });
    return waitFor().
        then(() => {
            assert.equal($(`${DROPDOWN}`).length, 1);
            assert.equal($('.ember-power-select-options > li').length, 3);
            assert.equal($(`${OPTION}:eq(0)`).text().trim(), LD.storeName);
            assert.equal($(`${OPTION}:eq(1)`).text().trim(), LD.storeNameTwo);
            assert.equal($(`${OPTION}:eq(2)`).text().trim(), LD.storeNameThree);
            assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
            assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains(${LD.storeName})`));
        });
});
