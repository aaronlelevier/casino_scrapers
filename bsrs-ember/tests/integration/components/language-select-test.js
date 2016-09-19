import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import PD from 'bsrs-ember/vendor/defaults/person';
import LOCALED from 'bsrs-ember/vendor/defaults/locale';
import tHelper from 'ember-i18n/helper';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';

var store, person, locale_one, locale_two, locale_three, trans, run = Ember.run;

const PowerSelect = '.ember-power-select-trigger';
const relatedModelName = 'locale';
const COMPONENT = `.t-${relatedModelName}-select`;
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('language-select', 'integration: language-select test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:person', 'model:locale']);
    run(function() {
      person = store.push('person', {id: PD.idOne, locale_fk: LOCALED.idOne});
      locale_one = store.push('locale', {id: LOCALED.idOne, name: LOCALED.nameOneKey, locale: LOCALED.localeOne});
      locale_two = store.push('locale', {id: LOCALED.idTwo, name: LOCALED.nameTwoKey, locale: LOCALED.localeTwo});
      locale_three = store.push('locale', {id: LOCALED.idThree, name: LOCALED.nameThree, locale: LOCALED.localeThree});
    });
    trans = this.container.lookup('service:i18n');
  }
});

test('should render a selectbox with bound options', function(assert) {
  let locales = store.find('locale');
  locale_one.set('people', [PD.idOne]);
  this.set('model', person);
  this.render(hbs`{{power-select-foreign-key mainModel=model selected=model.locale change_method='change_locale' relatedModelName='locale'}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LOCALED.nameOneKey));
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-power-select-options > li').length, 3);
  assert.equal(person.get('locale').get('id'), LOCALED.idOne);
  assert.deepEqual(locale_one.get('people'), [PD.idOne]);
});

test('should be able to select new locale when one doesnt exist', function(assert) {
  let locales = store.find('locale');
  this.set('model', person);
  this.render(hbs`{{power-select-foreign-key mainModel=model selected=model.locale change_method='change_locale' relatedModelName='locale'}}`);
  let $component = this.$(COMPONENT);
  assert.equal($('.ember-power-select-placeholder').text().trim(), trans.t('power.select.select'));
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-power-select-options > li').length, 3);
  nativeMouseUp(`.ember-power-select-option:contains(${LOCALED.nameOneKey})`);
  assert.equal($(DROPDOWN).length, 0);
  assert.equal($('.ember-power-select-options > li').length, 0);
  assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LOCALED.nameOneKey));
  assert.equal(person.get('locale').get('id'), LOCALED.idOne);
  assert.deepEqual(locale_one.get('people'), [PD.idOne]);
});

test('should be able to select same locale when person already has a locale', function(assert) {
  let locales = store.find('locale');
  locale_one.set('people', [PD.idOne]);
  this.set('model', person);
  this.render(hbs`{{power-select-foreign-key mainModel=model selected=model.locale change_method='change_locale' relatedModelName='locale'}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LOCALED.nameOneKey));
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-power-select-options > li').length, 3);
  nativeMouseUp(`.ember-power-select-option:contains(${LOCALED.nameOneKey})`);
  assert.equal($(DROPDOWN).length, 0);
  assert.equal($('.ember-power-select-options > li').length, 0);
  assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LOCALED.nameOneKey));
  assert.equal(person.get('locale').get('id'), LOCALED.idOne);
  assert.deepEqual(locale_one.get('people'), [PD.idOne]);
});

test('should be able to select new locale when person already has a locale', function(assert) {
  let locales = store.find('locale');
  locale_one.set('people', [PD.idOne]);
  this.set('model', person);
  this.render(hbs`{{power-select-foreign-key mainModel=model selected=model.locale change_method='change_locale' relatedModelName='locale'}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LOCALED.nameOneKey));
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-power-select-options > li').length, 3);
  nativeMouseUp(`.ember-power-select-option:contains(${LOCALED.nameTwoKey})`);
  assert.equal($(DROPDOWN).length, 0);
  assert.equal($('.ember-power-select-options > li').length, 0);
  assert.equal(person.get('locale').get('id'), LOCALED.idTwo);
  assert.deepEqual(locale_one.get('people'), []);
  assert.deepEqual(locale_two.get('people'), [PD.idOne]);
});
