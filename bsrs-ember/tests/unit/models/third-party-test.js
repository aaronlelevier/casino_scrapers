import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import SD from 'bsrs-ember/vendor/defaults/status';
import TPD from 'bsrs-ember/vendor/defaults/third-party';

var store, uuid, status, third_party, run = Ember.run;

module('unit: third-party test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:third-party', 'model:status']);
    }
});

/* STATUS */
test('related status should return one status for a third_party', (assert) => {
    run(function() {
        status = store.push('status', {id: SD.activeId, name: SD.activeName}); 
        third_party = store.push('third-party', {id: TPD.idOne, status_fk: SD.activeId});
    });
    assert.ok(third_party.get('isNotDirtyOrRelatedNotDirty'));
});

test('change_status will update the third_partys status and dirty the model', (assert) => {
    let inactive_status;
    run(function() {
        status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [TPD.idOne]}); 
        inactive_status = store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []}); 
        third_party = store.push('third-party', {id: TPD.idOne, status_fk: SD.activeId});
    });
    assert.ok(third_party.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(third_party.get('status_fk'), SD.activeId); 
    assert.equal(third_party.get('status.id'), SD.activeId); 
    run(function() {
        third_party.change_status(inactive_status.get('id'));
    });
    assert.equal(third_party.get('status_fk'), SD.activeId); 
    assert.equal(third_party.get('status.id'), SD.inactiveId); 
    assert.ok(third_party.get('isDirtyOrRelatedDirty')); 
    assert.ok(third_party.get('statusIsDirty')); 
});

test('save third_party will set status_fk to current status id', (assert) => {
    let inactive_status;
    run(function() {
        status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [TPD.idOne]}); 
        inactive_status = store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []}); 
        third_party = store.push('third-party', {id: TPD.idOne, status_fk: SD.activeId});
    });
    assert.ok(third_party.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(third_party.get('status_fk'), SD.activeId); 
    assert.equal(third_party.get('status.id'), SD.activeId); 
    run(function() {
        third_party.change_status(inactive_status.get('id'));
    });
    assert.equal(third_party.get('status_fk'), SD.activeId); 
    assert.equal(third_party.get('status.id'), SD.inactiveId); 
    assert.ok(third_party.get('isDirtyOrRelatedDirty')); 
    assert.ok(third_party.get('statusIsDirty')); 
    run(function() {
        third_party.saveRelated();
    });
    assert.ok(third_party.get('isNotDirtyOrRelatedNotDirty')); 
    assert.ok(!third_party.get('statusIsDirty')); 
    assert.equal(third_party.get('status_fk'), SD.inactiveId); 
    assert.equal(third_party.get('status.id'), SD.inactiveId); 
});

test('rollback third_party will set status to current status_fk', (assert) => {
    let inactive_status;
    run(function() {
        status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [TPD.idOne]}); 
        inactive_status = store.push('status', {id: SD.inactiveId, name: SD.inactiveName, people: []}); 
        third_party = store.push('third-party', {id: TPD.idOne, status_fk: SD.activeId});
    });
    assert.ok(third_party.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(third_party.get('status_fk'), SD.activeId); 
    assert.equal(third_party.get('status.id'), SD.activeId); 
    run(function() {
        third_party.change_status(inactive_status.get('id'));
    });
    assert.equal(third_party.get('status_fk'), SD.activeId); 
    assert.equal(third_party.get('status.id'), SD.inactiveId); 
    assert.ok(third_party.get('isDirtyOrRelatedDirty')); 
    assert.ok(third_party.get('statusIsDirty')); 
    run(function() {
        third_party.rollbackRelated();
    });
    assert.ok(third_party.get('isNotDirtyOrRelatedNotDirty')); 
    assert.ok(!third_party.get('statusIsDirty')); 
    assert.equal(third_party.get('status.id'), SD.activeId); 
    assert.equal(third_party.get('status_fk'), SD.activeId); 
});
