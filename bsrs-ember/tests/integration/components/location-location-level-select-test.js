import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLF from 'bsrs-ember/vendor/location-level_fixtures';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';

let store, locationz, location_level, location_levels, trans, run = Ember.run;
const COMPONENT = '.t-location-level-select';
const DROPDOWN = '.ember-power-select-dropdown';
const SELECTED = '.ember-power-select-selected-item';

moduleForComponent('location location-level-select', 'integration: location location-level-select', {
  integration: true,
  setup() {
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);

    store = module_registry(this.container, this.registry, ['model:location', 'model:location-level']);
    run(function() {
      locationz = store.push('location', {id: LD.idOne});
      location_levels = LLF.all_location_levels();
      location_levels.forEach((location_level) => { store.push('location-level', location_level); } );
    });
    location_level = store.find('location-level', LLD.idOne);
  }
});

test('should render a selectbox with bound options', function(assert) {
  this.set('model', locationz);
  this.render(hbs`{{power-select-foreign-key model=model selected=model.location_level change_method='change_location_level' relatedModelName='location-level' notTranslated=true}}`);
  let $component = this.$(COMPONENT);
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 8);
});

test('should be able to select new location level when one doesnt exist', function(assert) {
  this.set('model', locationz);
  this.render(hbs`{{power-select-foreign-key model=model selected=model.location_level change_method='change_location_level' relatedModelName='location-level' notTranslated=true}}`);
  let $component = this.$(COMPONENT);
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 8);
  nativeMouseUp(`.ember-power-select-option:contains(${LLD.nameCompany})`);
  assert.equal($(DROPDOWN).length, 0);
  assert.equal($('.ember-basic-dropdown-content').length, 0);
  assert.equal($('.ember-power-select-options > li').length, 0);
  assert.equal($component.find(SELECTED).text().trim(), LLD.nameCompany);
  assert.equal(locationz.get('location_level'), LLD.nameCompany);
});

test('should be able to select same location level when location already has a location level', function(assert) {
  run(function() {
    store.push('location', {id: LD.idOne});
    store.push('location-level', {id: LLD.idOne, locations: [LD.idOne]});
  });
  this.set('model', locationz);
  this.render(hbs`{{power-select-foreign-key model=model selected=model.location_level change_method='change_location_level' relatedModelName='location-level' notTranslated=true}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find(SELECTED).text().trim(), LLD.nameCompany);
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 8);
  nativeMouseUp(`.ember-power-select-option:contains(${LLD.nameCompany})`);
  assert.equal($(DROPDOWN).length, 0);
  assert.equal($('.ember-basic-dropdown-content').length, 0);
  assert.equal($('.ember-power-select-options > li').length, 0);
  assert.equal($component.find(SELECTED).text().trim(), LLD.nameCompany);
  assert.equal(locationz.get('location_level').get('name'), LLD.nameCompany);
});

test('should be able to select new location level when location already has a location level', function(assert) {
  run(function() {
    store.push('location', {id: LD.idOne});
    store.push('location-level', {id: LLD.idOne, locations: [LD.idOne]});
  });
  this.set('model', locationz);
  this.render(hbs`{{power-select-foreign-key model=model selected=model.location_level change_method='change_location_level' relatedModelName='location-level' notTranslated=true}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find(SELECTED).text().trim(), LLD.nameCompany);
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 8);
  nativeMouseUp(`.ember-power-select-option:contains(${LLD.nameDistrict})`);
  assert.equal($(DROPDOWN).length, 0);
  assert.equal($('.ember-basic-dropdown-content').length, 0);
  assert.equal($('.ember-power-select-options > li').length, 0);
  assert.equal($component.find(SELECTED).text().trim(), LLD.nameDistrict);
  assert.equal(locationz.get('location_level').get('name'), LLD.nameDistrict);
});
