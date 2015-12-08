import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import LD from 'bsrs-ember/vendor/defaults/location';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import PD from 'bsrs-ember/vendor/defaults/person';
import PLD from 'bsrs-ember/vendor/defaults/person-location';

let store, m2m, m2m_two, person, location_one, location_two, location_three, run = Ember.run;
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
        m2m = store.push('person-location', {id: PLD.idOne, person_pk: PD.idOne, location_pk: LD.idOne});
        m2m_two = store.push('person-location', {id: PLD.idTwo, person_pk: PD.idOne, location_pk: LD.idTwo});
        person = store.push('person', {id: PD.idOne});
        location_one = store.push('location', {id: LD.idOne, name: LD.storeName});
        location_two = store.push('location', {id: LD.idTwo, name: LD.storeNameTwo});
        location_three = store.push('location', {id: LD.unusedId, name: LD.storeNameThree});
    }
});

test('should render a selectbox when with no options (initial state)', function(assert) {
    let person_locations_children = Ember.A([]);
    this.set('person', person);
    this.set('person_locations_children', person_locations_children);
    this.set('search', '');
    this.render(hbs`{{person-locations-select person=person search=search person_locations_children=person_locations_children}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($(`${OPTION}`).text(), GLOBALMSG.power_search);
    assert.equal($(`${PowerSelect} > span.ember-power-select-multiple-option`).length, 2);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let person_locations_children = store.find('location');
    this.set('person', person);
    this.set('person_locations_children', person_locations_children);
    this.set('search', 'x');
    this.render(hbs`{{person-locations-select person=person search=search person_locations_children=person_locations_children}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal($(`${OPTION}:eq(0)`).text().trim(), LD.storeName);
    assert.equal($(`${OPTION}:eq(1)`).text().trim(), LD.storeNameTwo);
    assert.equal($(`${OPTION}:eq(2)`).text().trim(), LD.storeNameThree);
    assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
    assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains(${LD.storeName})`));
});

test('should render power select with bound options after type ahead for search with search params for person children', function(assert) {
    let one = store.push('location', {id: 'abcde4', name: 'a'});
    let two = store.push('location', {id: 'abcde5', name: 'c'});
    let three = store.push('location', {id: 'abcde6', name: 'e'});
    let person_locations_children = Ember.ArrayProxy.extend({
        content: Ember.computed(function() {
            return Ember.A(this.get('source'));
        })
    }).create({
        source: [one, two, three]
    });
    this.set('person', person);
    this.set('person_locations_children', person_locations_children);
    this.set('search', 'abcde');
    this.render(hbs`{{person-locations-select person=person search=search person_locations_children=person_locations_children}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal($(`${OPTION}:eq(0)`).text().trim(), 'a');
    assert.equal($(`${OPTION}:eq(1)`).text().trim(), 'c');
    assert.equal($(`${OPTION}:eq(2)`).text().trim(), 'e');
    assert.equal($(`${PowerSelect} > .ember-power-select-multiple-option`).length, 2);
    assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:eq(0)`).text().indexOf(LD.storeName) > -1);
});

// test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
//     var done = assert.async();
//     this.set('location', location);
//     this.set('search', undefined);
//     this.set('model', location.get('locations'));
//     this.render(hbs`{{location-locations-select model=model location=location search=search}}`);
//     let $component = this.$('.t-location-locations-select');
//     this.$('div.selectize-input input').val('x').trigger('keyup');
//     setTimeout(() => {
//         assert.equal(this.get('search'), undefined);
//         setTimeout(() => {
//             assert.equal(this.get('search'), 'x');
//             done();
//         }, 15);
//     }, 290);
// });


