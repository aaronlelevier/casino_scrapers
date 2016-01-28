import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import RD from 'bsrs-ember/vendor/defaults/role';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';

let store, role, all_role_types, trans, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const COMPONENT = '.t-role-role-type';
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('role-role-type-select', 'integration: amk role-role-type-select test', {
    integration: true,
    setup() {
        trans = this.container.lookup('service:i18n');
        loadTranslations(trans, translations.generate('en'));
        translation.initialize(this);

        store = module_registry(this.container, this.registry, ['model:role', 'model:role-type']);
        run(function() {

            role = store.push('role', {id: RD.idOne});
            store.push('role-type', {id:1, name: RD.roleTypeGeneral});
            store.push('role-type', {id:2, name: 'Third Party'});
        });
        all_role_types = store.find('role-type');
    }
});

test('should render a selectbox when role type options are empty (initial state of selectize)', function(assert) {
    let all_role_types = Ember.A([]);
    this.set('role', role);
    this.set('all_role_types', all_role_types);
    this.render(hbs`{{roles/role-type-select role=role all_role_types=all_role_types}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), '');
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text(), 'No Matches');
    assert.ok(!role.get('role_type'));
    assert.notOk($('.ember-power-select-search').text());
});

test('should render a selectbox with bound options', function(assert) {
    this.set('role', role);
    this.set('all_role_types', all_role_types);
    this.render(hbs`{{roles/role-type-select role=role all_role_types=all_role_types}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), '');
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 2);
});

test('should be able to select new role_type when one doesnt exist', function(assert) {
    this.set('role', role);
    this.set('all_role_types', all_role_types);
    this.render(hbs`{{roles/role-type-select role=role all_role_types=all_role_types}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), '');
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 2);
    run(() => {
        $(`.ember-power-select-option:contains(${RD.roleTypeGeneral})`).mouseup();
    });
    assert.equal($(`${DROPDOWN}`).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), RD.roleTypeGeneral);
    assert.equal(role.get('role_type'), RD.roleTypeGeneral);
});

test('should be able to select same role_type when role already has a role_type', function(assert) {
    run(function() {
        store.push('role', {id: RD.idOne, role_type: RD.roleTypeGeneral});
    });
    this.set('role', role);
    this.set('all_role_types', all_role_types);
    this.render(hbs`{{roles/role-type-select role=role all_role_types=all_role_types}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), RD.roleTypeGeneral);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 2);
    run(() => {
        $(`.ember-power-select-option:contains(${RD.roleTypeGeneral})`).mouseup();
    });
    assert.equal($(`${DROPDOWN}`).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), RD.roleTypeGeneral);
    assert.equal(role.get('role_type'), RD.roleTypeGeneral);
});

test('should be able to select new role_type when role already has a role_type', function(assert) {
    run(function() {
        store.push('role', {id: RD.idOne, role_type: RD.roleTypeGeneral});
    });
    let all_role_types = store.find('role-type');
    this.set('role', role);
    this.set('all_role_types', all_role_types);
    this.render(hbs`{{roles/role-type-select role=role all_role_types=all_role_types}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), RD.roleTypeGeneral);
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 2);
    run(() => {
        $(`.ember-power-select-option:contains('Third Party')`).mouseup();
    });
    assert.equal($(`${DROPDOWN}`).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), 'Third Party');
    assert.equal(role.get('role_type'), 'Third Party');
});
