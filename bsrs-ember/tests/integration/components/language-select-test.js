import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import PD from 'bsrs-ember/vendor/defaults/person';
import LOCALED from 'bsrs-ember/vendor/defaults/locale';
import tHelper from 'ember-i18n/helper';

var store, person, locale_one, locale_two, locale_three, trans, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const COMPONENT = '.t-locale-select';
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('language-select', 'integration: language-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:locale']);
        run(function() {
            person = store.push('person', {id: PD.idOne, locale_fk: LOCALED.idOne});
            locale_one = store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOne, locale: LOCALED.localeOne});
            locale_two = store.push('locale', {id: LOCALED.idTwo, name: LOCALED.nameTwo, locale: LOCALED.localeTwo});
            locale_three = store.push('locale', {id: LOCALED.idThree, name: LOCALED.nameThree, locale: LOCALED.localeThree});
        });
        trans = this.container.lookup('service:i18n');
    }
});

test('should render a selectbox when locale options are empty (initial state of selectize)', function(assert) {
    let locales = Ember.A([]);
    this.set('person', person);
    this.set('locales', locales);
    this.render(hbs`{{language-select person=person locales=locales}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), '');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    // assert.equal($('li.ember-power-select-option').text(), 'No Matches');
    assert.ok(!person.get('locale'));
    assert.notOk($('.ember-power-select-search').text());
});

test('should render a selectbox with bound options', function(assert) {
    let locales = store.find('locale');
    locale_one.set('people', [PD.idOne]);
    this.set('person', person);
    this.set('locales', locales);
    this.render(hbs`{{language-select person=person locales=locales}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'English -');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal(person.get('locale').get('id'), LOCALED.idOne);
    assert.deepEqual(locale_one.get('people'), [PD.idOne]);
});

test('should be able to select new locale when one doesnt exist', function(assert) {
    let locales = store.find('locale');
    this.set('person', person);
    this.set('locales', locales);
    this.render(hbs`{{language-select person=person locales=locales}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), '');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => {
        $(`.ember-power-select-option:contains(${LOCALED.nameOne})`).mouseup();
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    //TODO: this needs to be translated
    assert.equal($component.find(PowerSelect).text().trim(), 'English -');
    assert.equal(person.get('locale').get('id'), LOCALED.idOne);
    assert.deepEqual(locale_one.get('people'), [PD.idOne]);
});

test('should be able to select same locale when person already has a locale', function(assert) {
    let locales = store.find('locale');
    locale_one.set('people', [PD.idOne]);
    this.set('person', person);
    this.set('locales', locales);
    this.render(hbs`{{language-select person=person locales=locales}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'English -');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => {
        $(`.ember-power-select-option:contains(${LOCALED.nameOne})`).mouseup();
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim(), 'English -');
    assert.equal(person.get('locale').get('id'), LOCALED.idOne);
    assert.deepEqual(locale_one.get('people'), [PD.idOne]);
});

test('should be able to select new locale when person already has a locale', function(assert) {
    let locales = store.find('locale');
    locale_one.set('people', [PD.idOne]);
    this.set('person', person);
    this.set('locales', locales);
    this.render(hbs`{{language-select person=person locales=locales}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'English -');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => {
        $(`.ember-power-select-option:contains(${LOCALED.nameTwo})`).mouseup();
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal(person.get('locale').get('id'), LOCALED.idTwo);
    assert.deepEqual(locale_one.get('people'), []);
    assert.deepEqual(locale_two.get('people'), [PD.idOne]);
});
