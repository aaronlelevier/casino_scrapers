import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLF from 'bsrs-ember/vendor/location_level_fixtures';

let store, locationz, location_level, all_location_levels, location_levels, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const ClearButton = '.ember-power-select-clear-btn';
const COMPONENT = '.t-location-level-select';
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('location-location-level-select', 'integration: location-location-level-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level']);
        locationz = store.push('location', {id: LD.idOne});
        location_levels = LLF.all_location_levels();
        location_levels.forEach((location_level) => { store.push('location-level', location_level); } );
        location_level = store.find('location-level', LLD.idOne);
        all_location_levels = store.find('location-level');
    }
});

test('should render a selectbox when location type options are empty (initial state of selectize)', function(assert) {
    let all_location_levels = Ember.A([]);
    this.set('model', locationz);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'Select One');
    run(() => { 
        this.$(PowerSelect).click(); 
    });
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text(), 'No results found');
    assert.ok(!locationz.get('location_level'));
    assert.notOk($('.ember-power-select-search').text());
});

test('should render a selectbox with bound options', function(assert) {
    this.set('model', locationz);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'Select One');
    run(() => { 
        this.$(PowerSelect).click(); 
    });
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 8);
});

test('should be able to select new location level when one doesnt exist', function(assert) {
    this.set('model', locationz);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'Select One');
    run(() => { 
        this.$(PowerSelect).click(); 
    });
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 8);
    run(() => { 
        $(`.ember-power-select-option:contains(${LLD.nameCompany})`).click(); 
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameCompany);
    assert.equal(locationz.get('location_level'), LLD.nameCompany);
});

test('should be able to select same location level when location already has a location level', function(assert) {
    store.push('location', {id: LD.idOne});
    store.push('location-level', {id: LLD.idOne, locations: [LD.idOne]});
    this.set('model', locationz);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameCompany);
    run(() => { 
        this.$(PowerSelect).click(); 
    });
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 8);
    run(() => { 
        $(`.ember-power-select-option:contains(${LLD.nameCompany})`).click(); 
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameCompany);
    assert.equal(locationz.get('location_level').get('name'), LLD.nameCompany);
});

test('should be able to select new location level when location already has a location level', function(assert) {
    store.push('location', {id: LD.idOne});
    store.push('location-level', {id: LLD.idOne, locations: [LD.idOne]});
    this.set('model', locationz);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameCompany);
    run(() => { 
        this.$(PowerSelect).click(); 
    });
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 8);
    run(() => { 
        $(`.ember-power-select-option:contains(${LLD.nameDistrict})`).click(); 
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameDistrict);
    assert.equal(locationz.get('location_level').get('name'), LLD.nameDistrict);
});
