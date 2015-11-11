import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/person';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import ActivityDeserializer from 'bsrs-ember/deserializers/activity';

var store;

module('unit: activity deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:activity', 'model:activity/assignee', 'model:activity/person']);
    }
});

test('activity deserializer returns correct data with assignee', (assert) => {
    let subject = ActivityDeserializer.create({store: store});
    let response = TA_FIXTURES.assignee_only(TD.idOne);
    subject.deserialize(response);
    assert.equal(store.find('activity').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('ticket'), TD.idOne);
    assert.equal(store.find('activity/assignee').get('length'), 2);
    assert.equal(store.find('activity').objectAt(0).get('to').get('id'), PD.idSearch);
    assert.equal(store.find('activity').objectAt(0).get('from').get('id'), PD.idBoy);
    assert.notOk(store.find('activity').objectAt(0).get('content'));
    //TODO: assert other property values for to/from
});

test('activity deserializer returns correct activity/person', (assert) => {
    let subject = ActivityDeserializer.create({store: store});
    let response = TA_FIXTURES.assignee_only(TD.idOne);
    subject.deserialize(response);
    assert.equal(store.find('activity').get('length'), 2);
    assert.equal(store.find('activity/person').get('length'), 1);
    assert.equal(store.find('activity').objectAt(0).get('person').get('id'), PD.idOne);
});


//existing, then deserialize over the top
//push in payload w/ assignee and cc_? and both persist and are wired up correctly
