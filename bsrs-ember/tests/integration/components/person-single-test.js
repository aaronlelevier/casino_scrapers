import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';

var store;

moduleForComponent('person-single', 'integration: person-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:currency', 'service:currency']);
        store.push('currency', CURRENCY_DEFAULTS);
        translation.initialize(this);
        var service = this.container.lookup('service:i18n');
        var json = translations.generate();
        loadTranslations(service, json);
    }
});

test('selecting a role will append the persons id to the new role but remove it from the previous role', function(assert) {
    var role_two = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.unusedId]});
    var role_one = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne});
    this.set('model', person);
    this.set('roles', store.find('role'));
    this.render(hbs`{{person-single model=model roles=roles}}`);
    var $component = this.$('.t-person-role-select');
    assert.equal(this.$('.t-person-role-select option:eq(0)').text(), 'Select One');
    assert.equal(this.$('.t-person-role-select option:eq(1)').text(), 'Administrator');//TODO: translate this
    assert.equal(person.get('role').get('people'), PEOPLE_DEFAULTS.id);
    assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
    assert.ok(role_one.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    this.$('.t-person-role-select').val(ROLE_DEFAULTS.idTwo).trigger('change');
    assert.equal(role_two.get('people.length'), 2);
    assert.deepEqual(role_two.get('people'), [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.equal(role_one.get('people.length'), 0);
    assert.deepEqual(role_one.get('people'), []);
    assert.deepEqual(person.get('role').get('people')[1], PEOPLE_DEFAULTS.id);
    assert.deepEqual(person.get('role.id'), ROLE_DEFAULTS.idTwo);
    assert.ok(role_one.get('isNotDirty'));
    assert.ok(role_two.get('isDirty'));
});

test('selecting a placeholder instead of legit role will not append the persons id to anything but still remove it from the previous role', function(assert) {
    var role_two = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.unusedId]});
    var role_one = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne});
    this.set('model', person);
    this.set('roles', store.find('role'));
    this.render(hbs`{{person-single model=model roles=roles}}`);
    var $component = this.$('.t-person-role-select');
    assert.equal(this.$('.t-person-role-select option:eq(0)').text(), 'Select One');
    assert.equal(this.$('.t-person-role-select option:eq(1)').text(), 'Administrator');//TODO: translate this
    assert.equal(person.get('role').get('people'), PEOPLE_DEFAULTS.id);
    assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
    assert.ok(role_one.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    this.$('.t-person-role-select').val('Select One').trigger('change');
    assert.equal(role_two.get('people.length'), 1);
    assert.deepEqual(role_two.get('people'), [PEOPLE_DEFAULTS.unusedId]);
    assert.deepEqual(role_one.get('people'), []);
    assert.equal(person.get('role'), undefined);
    assert.ok(role_one.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.ok(person.get('isNotDirty'));
});
