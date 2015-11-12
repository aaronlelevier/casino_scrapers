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
        store = module_registry(this.container, this.registry, ['model:activity', 'model:activity/assignee', 'model:activity/person']);
    }
});

test('activity list will dynamically generate a mix of activity types', function(assert) {
    let person_to_and_from_json = TA_FIXTURES.get_assignee_person_and_to_from_json(TA_DEFAULTS.idAssigneeOne);
    store.push('activity/person', person_to_and_from_json.person);
    store.push('activity/assignee', person_to_and_from_json.to);
    store.push('activity/assignee', person_to_and_from_json.from);
    store.push('activity', TA_FIXTURES.get_create_json(TA_DEFAULTS.idCreate));
    store.push('activity', TA_FIXTURES.get_assignee_json(TA_DEFAULTS.idAssigneeOne));
    let model = store.find('activity');
    this.set('model', model);
    this.render(hbs`{{activity-list model=model}}`);
    let $component = this.$(`${ACTIVITY_ITEMS}`);
    assert.equal($component.length, 2);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text(), `${PD.fullname} created this ticket`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(1)`).text(), `${PD.fullname} changed the assignee from ${PD.fullnameBoy} to ${PD.fullnameBoy2}`);
});
