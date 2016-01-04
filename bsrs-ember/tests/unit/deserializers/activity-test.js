import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/person';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import GD from 'bsrs-ember/vendor/defaults/general';
import ActivityDeserializer from 'bsrs-ember/deserializers/activity';

var store, subject, uuid, run = Ember.run;

module('unit: activity deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:uuid', 'model:ticket-status', 'model:ticket-priority', 'model:activity/cc-add', 'model:activity/cc-remove', 'model:activity', 'model:activity/assignee', 'model:activity/person', 'model:activity/category-to', 'model:activity/category-from', 'model:activity/attachment-add','model:activity/attachment-remove']);
        uuid = this.container.lookup('model:uuid');
        subject = ActivityDeserializer.create({store:store, uuid:uuid});
    }
});

test('activity deserializer returns correct data with assignee', (assert) => {
    let response = TA_FIXTURES.assignee_only(TD.idOne);
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('ticket'), TD.idOne);
    assert.equal(store.find('activity/assignee').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('to').get('id'), PD.idSearch);
    assert.equal(store.find('activity').objectAt(0).get('from').get('id'), PD.idBoy);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
    assert.equal(store.find('activity').objectAt(0).get('type'), 'assignee');
    //TODO: assert other property values for to/from
});

test('activity deserializer returns correct activity/person', (assert) => {
    let response = TA_FIXTURES.assignee_only(TD.idOne);
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 2);
    assert.equal(store.find('activity/person').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
});

test('activity with only created is deserialized correctly', (assert) => {
    let response = TA_FIXTURES.created_only();
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity/person').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('type'), 'create');
});

test('activity with only status is deserialized correctly', (assert) => {
    run(function() {
        store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
        store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
    });
    let response = TA_FIXTURES.status_only();
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 3);
    assert.equal(store.find('activity/person').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('type'), 'status');
    assert.equal(store.find('activity').objectAt(1).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(1).get('type'), 'status');
    assert.equal(store.find('activity').objectAt(2).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(2).get('type'), 'status');
    assert.equal(store.find('activity').objectAt(0).get('to').get('id'), TD.statusOneId);
    assert.equal(store.find('activity').objectAt(0).get('from').get('id'), TD.statusTwoId);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with only priority is deserialized correctly', (assert) => {
    run(function() {
        store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
        store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo});
    });
    let response = TA_FIXTURES.priority_only();
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 3);
    assert.equal(store.find('activity/person').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('type'), 'priority');
    assert.equal(store.find('activity').objectAt(1).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(1).get('type'), 'priority');
    assert.equal(store.find('activity').objectAt(2).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(2).get('type'), 'priority');
    assert.equal(store.find('activity').objectAt(0).get('to').get('id'), TD.priorityOneId);
    assert.equal(store.find('activity').objectAt(0).get('from').get('id'), TD.priorityTwoId);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with only cc_add is deserialized correctly', (assert) => {
    let response = TA_FIXTURES.cc_add_only(2);
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity/person').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('type'), 'cc_add');
    assert.equal(store.find('activity').objectAt(0).get('to'), undefined);
    assert.equal(store.find('activity').objectAt(0).get('from'), undefined);
    assert.equal(store.find('activity').objectAt(0).get('added').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('added').objectAt(0).get('id'), PD.idBoy);
    assert.equal(store.find('activity').objectAt(0).get('added').objectAt(1).get('id'), PD.idSearch);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with only cc_remove is deserialized correctly', (assert) => {
    let response = TA_FIXTURES.cc_remove_only(2);
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity/person').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('type'), 'cc_remove');
    assert.equal(store.find('activity').objectAt(0).get('to'), undefined);
    assert.equal(store.find('activity').objectAt(0).get('from'), undefined);
    assert.equal(store.find('activity').objectAt(0).get('removed').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('removed').objectAt(0).get('id'), PD.idBoy);
    assert.equal(store.find('activity').objectAt(0).get('removed').objectAt(1).get('id'), PD.idSearch);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with only attachment_add is deserialized correctly', (assert) => {
    const response = TA_FIXTURES.attachment_add_only(2);
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity/attachment-add').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('type'), 'attachment_add');
    assert.equal(store.find('activity').objectAt(0).get('added_attachment').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('added_attachment').objectAt(0).get('id'), GD.attachmentIdOne);
    assert.equal(store.find('activity').objectAt(0).get('added_attachment').objectAt(1).get('id'), GD.attachmentIdTwo);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with only attachment_remove is deserialized correctly', (assert) => {
    const response = TA_FIXTURES.attachment_remove_only(2);
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity/attachment-remove').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('type'), 'attachment_remove');
    assert.equal(store.find('activity').objectAt(0).get('removed_attachment').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('removed_attachment').objectAt(0).get('id'), GD.attachmentIdOne);
    assert.equal(store.find('activity').objectAt(0).get('removed_attachment').objectAt(1).get('id'), GD.attachmentIdTwo);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with comment is deserialized correctly', (assert) => {
    let response = TA_FIXTURES.comment_only();
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('comment'), TD.commentOne);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with categories is deserialized correctly', (assert) => {
    let response = TA_FIXTURES.categories_only();
    run(function() {
        subject.deserialize(response);
    });
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('categories_to').objectAt(0).get('name'), CD.nameOne);
    assert.equal(store.find('activity').objectAt(0).get('categories_from').objectAt(0).get('name'), CD.nameTwo);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

//existing, then deserialize over the top
//push in payload w/ assignee and cc_? and both persist and are wired up correctly
