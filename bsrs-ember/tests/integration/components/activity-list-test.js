import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import TA_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket_activity';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';

const ACTIVITY_ITEMS = '.t-activity-list-item';

let store;

moduleForComponent('activity-list', 'integration: activity-list', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket-status', 'model:activity/cc-add', 'model:activity', 'model:activity/assignee', 'model:activity/person']);
    }
});

test('sco activity list will dynamically generate a mix of activity types', function(assert) {
    let person_to_and_from_json = TA_FIXTURES.get_assignee_person_and_to_from_json(TA_DEFAULTS.idAssigneeOne);
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo});
    store.push('activity/cc-add', {id: 1, fullname: 'person1', activities: [TA_DEFAULTS.idCcAddOne]});
    store.push('activity/cc-add', {id: 2, fullname: 'person2', activities: [TA_DEFAULTS.idCcAddOne]});
    store.push('activity/cc-remove', {id: 1, fullname: 'person1', activities: [TA_DEFAULTS.idCcRemoveOne]});
    store.push('activity/cc-remove', {id: 2, fullname: 'person2', activities: [TA_DEFAULTS.idCcRemoveOne]});
    store.push('activity/person', person_to_and_from_json.person);
    store.push('activity/assignee', person_to_and_from_json.to);
    store.push('activity/assignee', person_to_and_from_json.from);
    store.push('activity', TA_FIXTURES.get_create_json(TA_DEFAULTS.idCreate));
    store.push('activity', TA_FIXTURES.get_assignee_json(TA_DEFAULTS.idAssigneeOne));
    store.push('activity', TA_FIXTURES.get_status_json(TA_DEFAULTS.idStatusOne));
    store.push('activity', TA_FIXTURES.get_cc_add_remove_json(TA_DEFAULTS.idCcAddOne, 2, 'cc_add'));
    store.push('activity', TA_FIXTURES.get_cc_add_remove_json(TA_DEFAULTS.idCcRemoveOne, 2, 'cc_remove'));
    let model = store.find('activity');
    this.set('model', model);
    this.render(hbs`{{activity-list model=model}}`);
    let $component = this.$(`${ACTIVITY_ITEMS}`);
    assert.equal($component.length, 5);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text(), `${PD.fullname} created this ticket`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(1)`).text(), `${PD.fullname} changed the assignee from ${PD.fullnameBoy} to ${PD.fullnameBoy2}`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(2)`).text(), `${PD.fullname} changed the status from ${TICKET_DEFAULTS.statusOne} to ${TICKET_DEFAULTS.statusTwo}`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(3)`).text(), `${PD.fullname} added person1, person2 to CC`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(4)`).text(), `${PD.fullname} removed person1, person2 from CC`);
});
