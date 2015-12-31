import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import RD from 'bsrs-ember/vendor/defaults/role';
import PD from 'bsrs-ember/vendor/defaults/person';
import RF from 'bsrs-ember/vendor/role_fixtures';

let store, role, roles, person, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const COMPONENT = '.t-person-role-select';
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('person-role-select', 'integration: person-role-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role']);
        run(function() {
            person = store.push('person', {id: PD.idOne});
            roles = RF.list();
            roles.results.forEach((role) => { store.push('role', role); } );
        });
        role = store.find('role', RD.idOne);
        roles = store.find('role');
    }
});

test('should render a selectbox when role options are empty (initial state of selectize)', function(assert) {
    let roles = Ember.A([]);
    this.set('model', person);
    this.set('roles', roles);
    this.render(hbs`{{role-select model=model options=roles role_change=role_change}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), 'Select One');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text(), 'No results found');
    assert.ok(!person.get('role'));
    assert.notOk($('.ember-power-select-search').text());
});

test('should be able to select same role when person already has a role', function(assert) {
    run(function() {
        store.push('role', {id: RD.idOne, people: [PD.idOne]});
    });
    this.set('model', person);
    this.set('roles', roles);
    this.render(hbs`{{role-select model=model options=roles role_change=role_change}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), RD.nameOne);
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 10);
    run(() => { 
        $(`.ember-power-select-option:contains(${RD.nameOne})`).mouseup(); 
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim(), RD.nameOne);
    assert.equal(person.get('role').get('name'), RD.nameOne);
});

test('should be able to select new person level when person already has a person level', function(assert) {
    run(function() {
        store.push('person', {id: PD.idOne});
        store.push('role', {id: RD.idOne, people: [PD.idOne]});
    });
    this.set('model', person);
    this.set('roles', roles);
    this.render(hbs`{{role-select model=model options=roles role_change=role_change}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), RD.nameOne);
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    run(() => { 
        $(`.ember-power-select-option:contains(${RD.nameTwo})`).mouseup(); 
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim(), RD.nameTwo);
    assert.equal(person.get('role').get('name'), RD.nameTwo);
});
