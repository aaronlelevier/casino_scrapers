import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import AD from 'bsrs-ember/vendor/defaults/automation';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import GD from 'bsrs-ember/vendor/defaults/general';
import ActivityDeserializer from 'bsrs-ember/deserializers/activity';

let store, subject, uuid;
const PD = PERSON_DEFAULTS.defaults();

module('unit: activity deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:uuid',
            'model:ticket-status', 'model:ticket-priority', 'model:activity/cc-add',
            'model:activity/cc-remove', 'model:activity', 'model:activity/assignee',
            'model:activity/person', 'model:activity/category-to', 'model:activity/category-from',
            'model:activity/attachment-add','model:activity/attachment-remove',
            'model:activity/automation', 'model:activity/send-sms', 'model:activity/send-email',
            'service:person-current']);
        uuid = this.container.lookup('model:uuid');
        subject = ActivityDeserializer.create({simpleStore:store, uuid:uuid});
    }
});

test('activity deserializer returns correct data with assignee', (assert) => {
    let response = TA_FIXTURES.assignee_only(TD.idOne);
    subject.deserialize(response);
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
    subject.deserialize(response);
    assert.equal(store.find('activity').get('length'), 2);
    assert.equal(store.find('activity/person').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
});

test('activity with only created is deserialized correctly', (assert) => {
    let response = TA_FIXTURES.created_only();
    subject.deserialize(response);
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity/person').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('type'), 'create');
});

test('activity with only status is deserialized correctly', (assert) => {
    store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
    store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
    let response = TA_FIXTURES.status_only();
    subject.deserialize(response);
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
    store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
    store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo});
    let response = TA_FIXTURES.priority_only();
    subject.deserialize(response);
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
    subject.deserialize(response);
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
    subject.deserialize(response);
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
    subject.deserialize(response);
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
    subject.deserialize(response);
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
    subject.deserialize(response);
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('comment'), TD.commentOne);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with categories is deserialized correctly', (assert) => {
    let response = TA_FIXTURES.categories_only();
    subject.deserialize(response);
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('categories_to').objectAt(0).get('name'), CD.nameOne);
    assert.equal(store.find('activity').objectAt(0).get('categories_from').objectAt(0).get('name'), CD.nameTwo);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with automation assignee (no person object on activity object)', (assert) => {
    let response = TA_FIXTURES.automation_assignee_only();
    subject.deserialize(response);
    assert.equal(store.find('activity').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('ticket'), TD.idOne);
    assert.equal(store.find('activity/assignee').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('to').get('id'), PD.idSearch);
    assert.equal(store.find('activity').objectAt(0).get('from').get('id'), PD.idBoy);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
    // TODO: spiking on not pushing in model to activity model store
    // assert.notOk(store.find('activity').objectAt(0).get('automation'));
    assert.equal(store.find('activity').objectAt(0).get('type'), 'assignee');
    // assert.equal(store.find('activity/automation').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('automation.id'), AD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('automation.description'), AD.descriptionOne);
});

test('activity with send_sms', assert => {
    let response = TA_FIXTURES.send_sms_or_email_only('send_sms', 1, TD.idOne);
    subject.deserialize(response);
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('ticket'), TD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('send_sms').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('send_sms').objectAt(0).get('id'), PD.idBoy);
    assert.equal(store.find('activity').objectAt(0).get('send_sms').objectAt(0).get('fullname'), PD.fullnameBoy);
    assert.equal(store.find('activity').objectAt(0).get('automation').get('id'), AD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('automation').get('description'), AD.descriptionOne);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

test('activity with send_email', assert => {
    let response = TA_FIXTURES.send_sms_or_email_only('send_email', 1, TD.idOne);
    subject.deserialize(response);
    assert.equal(store.find('activity').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('ticket'), TD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('send_email').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('send_email').objectAt(0).get('id'), PD.idBoy);
    assert.equal(store.find('activity').objectAt(0).get('send_email').objectAt(0).get('fullname'), PD.fullnameBoy);
    assert.equal(store.find('activity').objectAt(0).get('automation').get('id'), AD.idOne);
    assert.equal(store.find('activity').objectAt(0).get('automation').get('description'), AD.descriptionOne);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
});

//existing, then deserialize over the top
//push in payload w/ assignee and cc_? and both persist and are wired up correctly
