import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import RD from 'bsrs-ember/vendor/defaults/role';
import LLF from 'bsrs-ember/vendor/location_level_fixtures';

let store, role, location_level, all_location_levels, location_levels, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const COMPONENT = '.t-location-level-select';
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('location-level-select', 'integration: location-level-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:role', 'model:location-level']);
        run(function() {
            role = store.push('role', {id: RD.idOne});
            location_levels = LLF.all_location_levels();
            location_levels.forEach((location_level) => { store.push('location-level', location_level); } );
        });
        location_level = store.find('location-level', LLD.idOne);
        all_location_levels = store.find('location-level');
    }
});

test('should render a selectbox when role type options are empty (initial state of selectize)', function(assert) {
    let all_location_levels = Ember.A([]);
    this.set('model', role);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'Select One');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text(), 'No results found');
    assert.ok(!role.get('location_level'));
    assert.notOk($('.ember-power-select-search').text());
});

test('should render a selectbox with bound options', function(assert) {
    this.set('model', role);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'Select One');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 8);
});

test('should be able to select new location level when one doesnt exist', function(assert) {
    this.set('model', role);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'Select One');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 8);
    run(() => { 
        $(`.ember-power-select-option:contains(${LLD.nameCompany})`).mouseup(); 
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameCompany);
    assert.equal(role.get('location_level'), LLD.nameCompany);
});

test('should be able to select same location level when role already has a location level', function(assert) {
    run(function() {
        store.push('role', {id: RD.idOne});
        store.push('location-level', {id: LLD.idOne, roles: [RD.idOne]});
    });
    this.set('model', role);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameCompany);
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 8);
    run(() => { 
        $(`.ember-power-select-option:contains(${LLD.nameCompany})`).mouseup(); 
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameCompany);
    assert.equal(role.get('location_level').get('name'), LLD.nameCompany);
});

test('should be able to select new location level when role already has a location level', function(assert) {
    run(function() {
        store.push('role', {id: RD.idOne});
        store.push('location-level', {id: LLD.idOne, roles: [RD.idOne]});
    });
    this.set('model', role);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-level-select model=model options=all_location_levels}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameCompany);
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 8);
    run(() => { 
        $(`.ember-power-select-option:contains(${LLD.nameDistrict})`).mouseup(); 
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim().split(' +')[0].split(' ')[0].trim(), LLD.nameDistrict);
    assert.equal(role.get('location_level').get('name'), LLD.nameDistrict);
});
