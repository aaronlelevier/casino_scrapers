import Ember from 'ember';
import {test, module} from 'qunit';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var container, registry, store;

module('unit: person deserializer test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:person', 'model:role', 'model:phonenumber', 'model:address', 'model:address-type']);
    },
    afterEach() {
        store = null;
        container = null;
        registry = null;
    }
});

test('role will keep appending when deserialize_list is invoked with many people who play the same role', (assert) => {
    var subject = PersonDeserializer.create({store: store});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id]);
    var json = [PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.unusedId)];
    var response = {'count':1,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('role will keep appending when deserialize_single is invoked with many people who play the same role', (assert) => {
    var subject = PersonDeserializer.create({store: store});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id]);
    var response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.unusedId);
    response.phone_numbers = [];
    response.addresses = [];
    subject.deserialize(response, PEOPLE_DEFAULTS.unusedId);
    original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
});
