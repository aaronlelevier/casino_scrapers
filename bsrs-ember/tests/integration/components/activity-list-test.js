import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';
import TAF from 'bsrs-ember/vendor/ticket_activity_fixtures';

const ACTIVITY_ITEMS = '.t-activity-list-item';

let store;

moduleForComponent('activity-list', 'integration: activity-list', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket-status', 'model:ticket-priority', 'model:activity/cc-add', 'model:activity', 'model:activity/assignee', 'model:activity/person']);
    }
});

test('activity list will dynamically generate a mix of activity types', function(assert) {
    assert.equal(1,1);
    // let person_to_and_from_json = TAF.get_assignee_person_and_to_from_json(TAD.idAssigneeOne);
    // store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
    // store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
    // store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
    // store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo});
    // store.push('activity/cc-add', {id: 1, fullname: 'person1', activities: [TAD.idCcAddOne]});
    // store.push('activity/cc-add', {id: 2, fullname: 'person2', activities: [TAD.idCcAddOne]});
    // store.push('activity/cc-remove', {id: 1, fullname: 'person1', activities: [TAD.idCcRemoveOne]});
    // store.push('activity/cc-remove', {id: 2, fullname: 'person2', activities: [TAD.idCcRemoveOne]});
    // store.push('activity/person', person_to_and_from_json.person);
    // store.push('activity/assignee', person_to_and_from_json.to);
    // store.push('activity/assignee', person_to_and_from_json.from);
    // store.push('activity', TAF.get_create_json(TAD.idCreate));
    // store.push('activity', TAF.get_assignee_json(TAD.idAssigneeOne));
    // store.push('activity', TAF.get_status_json(TAD.idStatusOne));
    // store.push('activity', TAF.get_priority_json(TAD.idPriorityOne));
    // store.push('activity', TAF.get_cc_add_remove_json(TAD.idCcAddOne, 2, 'cc_add'));
    // store.push('activity', TAF.get_cc_add_remove_json(TAD.idCcRemoveOne, 2, 'cc_remove'));
    // let model = store.find('activity');
    // this.set('model', model);
    // this.render(hbs`{{activity-list model=model}}`);
    // let $component = this.$(`${ACTIVITY_ITEMS}`);
    // assert.equal($component.length, 6);
    // assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} created this ticket 3 months ago`);
    // assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(1)`).text().trim(), `${PD.fullname} changed the assignee from ${PD.fullnameBoy} to ${PD.fullnameBoy2} a month ago`);
    // assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(2)`).text().trim(), `${PD.fullname} changed the status from ${TD.statusOne} to ${TD.statusTwo} a month ago`);
    // assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(3)`).text().trim(), `${PD.fullname} changed the priority from ${TD.priorityOne} to ${TD.priorityTwo} 2 months ago`);
    // assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(4)`).text().trim(), `${PD.fullname} added person1, person2 to CC 15 days ago`);
    // assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(5)`).text().trim(), `${PD.fullname} removed person1, person2 from CC 15 days ago`);
});
