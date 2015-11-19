import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TPD from 'bsrs-ember/vendor/defaults/third-party';
import SD from 'bsrs-ember/vendor/defaults/status';
import TPF from 'bsrs-ember/vendor/third_party_fixtures';
import ThirdPartyDeserializer from 'bsrs-ember/deserializers/third-party';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store, subject, status;

module('sco unit: third-party deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:third-party', 'model:status']);
        subject = ThirdPartyDeserializer.create({store: store});
        status = store.push('status', {id: SD.activeId, name: SD.activeName});
    }
});

/* STATUS */
test('third_party setup correct status fk with bootstrapped data (detail)', (assert) => {
    let third_party = store.push('third-party', {id: TPD.idOne});
    let status = store.push('status', {id: SD.activeId, name: SD.activeName});
    let response = TPF.generate(TPD.idOne);
    subject.deserialize(response, TPD.idOne);
    assert.equal(third_party.get('status_fk'), status.get('id'));
    assert.equal(third_party.get('status').get('id'), status.get('id'));
    assert.deepEqual(status.get('people'), [TPD.idOne]);
    assert.ok(third_party.get('isNotDirty'));
});

test('third_party setup correct status fk with existing status pointer to third_party', (assert) => {
    let third_party = store.push('third-party', {id: TPD.idOne, status_fk: SD.activeId});
    let status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [TPD.idOne]});
    let response = TPF.generate(TPD.idOne);
    subject.deserialize(response, TPD.idOne);
    assert.equal(third_party.get('status_fk'), status.get('id'));
    assert.equal(third_party.get('status').get('id'), status.get('id'));
    assert.equal(status.get('people').length, 1);
    assert.ok(third_party.get('isNotDirty'));
});

test('third_party setup correct status fk with bootstrapped data (list)', (assert) => {
    let third_party = store.push('third-party', {id: TPD.idOne});
    let json = TPF.generate(TPD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.equal(third_party.get('status_fk'), status.get('id'));
    assert.equal(third_party.get('status').get('id'), status.get('id'));
    assert.equal(status.get('people').length, 1);
    assert.deepEqual(status.get('people'), [TPD.idOne]);
    assert.ok(third_party.get('isNotDirty'));
});
