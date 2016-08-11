import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

let store, location_level, location_levels, trans, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger > .ember-power-select-multiple-options';
const COMPONENT = '.t-location-level-children-select';
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('location-level-children-select', 'integration: location-level-children-select test', {
  integration: true,
  setup() {
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    store = module_registry(this.container, this.registry, ['model:location-level']);
    run(function() {
      location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany});
      store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment});
      store.push('location-level', {id: LLD.idThree, name: LLD.nameRegion});
      store.push('location-level', {id: LLD.idDistrict, name: LLD.nameDistrict});
      store.push('location-level', {id: LLD.idStore, name: LLD.nameStore});
    });
    location_levels = store.find('location-level');
  }
});

test('should render a selectbox when location type options are empty (initial state of power select)', function(assert) {
  let location_levels = Ember.A([]);
  this.set('model', location_level);
  this.set('options', location_levels);
  this.render(hbs`{{location-level-children-power-select model=model options=options}}`);
  let $component = this.$(COMPONENT);
  //assert.equal($component.find(`${PowerSelect} > input`).attr('placeholder').trim(), 'Select One');
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 1);
  assert.equal($('li.ember-power-select-option').text().trim(), GLOBALMSG.no_results);
  assert.deepEqual(location_level.get('children_fks'), undefined);
  assert.notOk($('.ember-power-select-search').text());
});

test('should render a selectbox with bound options', function(assert) {
  this.set('model', location_level);
  this.set('options', location_levels);
  this.render(hbs`{{location-level-children-power-select model=model options=options}}`);
  let $component = this.$(COMPONENT);
  //assert.equal($component.find(`${PowerSelect} > input`).attr('placeholder').trim(), 'Select One');
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 5);
});

// setChild action is in controller.  Need to migrate these tests over to acceptane
//test('should not be able to select same location level when one doesnt exist', function(assert) {
//  this.set('model', location_level);
//  this.set('options', location_levels);
//  this.render(hbs`{{location-level-children-power-select model=model options=options}}`);
//  let $component = this.$(COMPONENT);
//  //assert.equal($component.find(`${PowerSelect} > input`).attr('placeholder').trim(), 'Select One');
//  clickTrigger();
//  assert.equal($(DROPDOWN).length, 1);
//  assert.equal($('.ember-basic-dropdown-content').length, 1);
//  assert.equal($('.ember-power-select-options > li').length, 5);
//  nativeMouseUp(`.ember-power-select-option:contains(${LLD.nameCompany})`);
//  assert.equal($(DROPDOWN).length, 0);
//  assert.equal($('.ember-basic-dropdown-content').length, 0);
//  assert.equal($('.ember-power-select-options > li').length, 0);
//  assert.equal($component.find(PowerSelect).text().trim().split('+ ')[0].split(' ').pop(), '');
//  // assert.equal(location_level.get('children.id'), undefined);
//});

//test('should be able to select new location level when one doesnt exist', function(assert) {
//  this.set('model', location_level);
//  this.set('options', location_levels);
//  this.render(hbs`{{location-level-children-power-select model=model options=options}}`);
//  let $component = this.$(COMPONENT);
//  //assert.equal($component.find(`${PowerSelect} > input`).attr('placeholder').trim(), 'Select One');
//  clickTrigger();
//  assert.equal($(DROPDOWN).length, 1);
//  assert.equal($('.ember-basic-dropdown-content').length, 1);
//  assert.equal($('.ember-power-select-options > li').length, 5);
//  nativeMouseUp(`.ember-power-select-option:contains(${LLD.nameRegion})`);
//  assert.equal($(DROPDOWN).length, 0);
//  assert.equal($('.ember-basic-dropdown-content').length, 0);
//  assert.equal($('.ember-power-select-options > li').length, 0);
//  assert.equal($component.find(PowerSelect).text().trim().split('+ ')[0].split(' ').pop(), LLD.nameRegion);
//  // assert.equal(location_level.get('children.id'), LLD.idRegion);
//});

//test('selecting same location level will remove that location level', function(assert) {
//  run(function() {
//    store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, children_fks: [LLD.idTwo, LLD.idThree]});
//  });
//  this.set('model', location_level);
//  this.set('options', location_levels);
//  this.render(hbs`{{location-level-children-power-select model=model options=options}}`);
//  let $component = this.$(COMPONENT);
//  assert.equal($component.find(PowerSelect).text().trim().split('+ ')[0].split(' ').pop(), LLD.nameRegion);
//  clickTrigger();
//  assert.equal($(DROPDOWN).length, 1);
//  assert.equal($('.ember-basic-dropdown-content').length, 1);
//  assert.equal($('.ember-power-select-options > li').length, 5);
//  nativeMouseUp(`.ember-power-select-option:contains(${LLD.nameRegion})`);
//  assert.equal($(DROPDOWN).length, 0);
//  assert.equal($('.ember-basic-dropdown-content').length, 0);
//  assert.equal($('.ember-power-select-options > li').length, 0);
//  assert.equal($component.find(PowerSelect).text().trim().split('+ ')[0].split(' ').pop(), LLD.nameDepartment);
//  assert.deepEqual(location_level.get('children_fks'), [LLD.idTwo]);
//});

//test('should be able to select new location level when location already has a location level', function(assert) {
//  run(function() {
//    store.push('location-level', {id: LLD.idOne, children_fks: [LLD.idTwo, LLD.idThree]});
//  });
//  this.set('model', location_level);
//  this.set('options', location_levels);
//  this.render(hbs`{{location-level-children-power-select model=model options=options}}`);
//  let $component = this.$(COMPONENT);
//  assert.equal($component.find(PowerSelect).text().trim().split('+ ')[0].split(' ').pop(), LLD.nameRegion);
//  clickTrigger();
//  assert.equal($(DROPDOWN).length, 1);
//  assert.equal($('.ember-basic-dropdown-content').length, 1);
//  assert.equal($('.ember-power-select-options > li').length, 5);
//  nativeMouseUp(`.ember-power-select-option:contains(${LLD.nameDistrict})`);
//  assert.equal($(DROPDOWN).length, 0);
//  assert.equal($('.ember-basic-dropdown-content').length, 0);
//  assert.equal($('.ember-power-select-options > li').length, 0);
//  assert.deepEqual(location_level.get('children_fks'), [LLD.idTwo, LLD.idThree, LLD.idDistrict]);
//});
