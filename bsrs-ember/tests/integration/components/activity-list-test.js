import Ember from 'ember';
import trim from 'bsrs-ember/utilities/trim';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import GD from 'bsrs-ember/vendor/defaults/general';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';
import TAF from 'bsrs-ember/vendor/ticket_activity_fixtures';

const ALL_TAB = '.t-activity-tab-all_updates';
const COMMENT_TAB = '.t-activity-tab-comments';
const STATUS_TAB = '.t-activity-tab-status_updates';

const ACTIVITY_ITEMS = '.t-activity-list-item';
const ATTACHMENT_FILE = '.t-ticket-attachment-add-remove';

let store, trans;

moduleForComponent('activity-list', 'integration: activity-list', {
    integration: true,
    setup() {
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:ticket-status', 'model:ticket-priority', 'model:activity/cc-add', 'model:activity', 'model:activity/assignee', 'model:activity/person']);
        trans = this.container.lookup('service:i18n');
        loadTranslations(trans, translations.generate('en'));
        translation.initialize(this);
    }
});

test('scott activity list will dynamically generate a mix of activity types', function(assert) {
    let person_to_and_from_json = TAF.get_assignee_person_and_to_from_json(TAD.idAssigneeOne);
    store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
    store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
    store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
    store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo});
    store.push('activity/cc-add', {id: 1, fullname: 'person1', activities: [TAD.idCcAddOne]});
    store.push('activity/cc-add', {id: 2, fullname: 'person2', activities: [TAD.idCcAddOne]});
    store.push('activity/cc-remove', {id: 1, fullname: 'person1', activities: [TAD.idCcRemoveOne]});
    store.push('activity/cc-remove', {id: 2, fullname: 'person2', activities: [TAD.idCcRemoveOne]});
    store.push('activity/person', person_to_and_from_json.person);
    store.push('activity/assignee', person_to_and_from_json.to);
    store.push('activity/assignee', person_to_and_from_json.from);
    store.push('activity/attachment-add', {id: TAD.idAttachmentAddOne, filename: GD.nameTicketAttachmentOne, file: TAD.fileAttachmentAddOne, activities: [TAD.idAttachmentAddOne]});
    store.push('activity', TAF.get_create_json(TAD.idCreate));
    store.push('activity', TAF.get_assignee_json(TAD.idAssigneeOne));
    store.push('activity', TAF.get_status_json(TAD.idStatusOne));
    store.push('activity', TAF.get_priority_json(TAD.idPriorityOne));
    store.push('activity', TAF.get_cc_add_remove_json(TAD.idCcAddOne, 2, 'cc_add'));
    store.push('activity', TAF.get_cc_add_remove_json(TAD.idCcRemoveOne, 2, 'cc_remove'));
    store.push('activity', TAF.get_comment_json(TAD.idCommentOne));
    store.push('activity', TAF.get_attachment_add_remove_json(TAD.idAttachmentAddOne, 1, 'attachment_add'));
    let model = store.find('activity');
    this.set('model', model);
    this.render(hbs`{{activity-list model=model}}`);
    let $component = this.$(`${ACTIVITY_ITEMS}`);
    assert.equal($component.length, 8);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} added person1 person2 to CC 15 days ago`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(1)`).text().trim(), `${PD.fullname} removed person1 person2 from CC 20 days ago`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(2)`).text().trim(), `${PD.fullname} changed the status from ${trans.t(TD.statusTwo)} to ${trans.t(TD.statusOne)} a month ago`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(3)`).text().trim(), `${PD.fullname} changed the assignee from ${PD.fullnameBoy2} to ${PD.fullnameBoy} a month ago`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(4)`).text().trim(), `${PD.fullname} changed the priority from ${trans.t(TD.priorityTwo)} to ${trans.t(TD.priorityOne)} 2 months ago`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(5)`).text().trim(), `${PD.fullname} created this ticket 3 months ago`);
    assert.equal(this.$(`${ACTIVITY_ITEMS}:eq(6)`).text().trim(), `${PD.fullname} commented 4 months ago ${TD.commentOne}`);
    assert.equal(trim(this.$(`${ACTIVITY_ITEMS}:eq(7)`).text()), `${PD.fullname} uploaded 1 files 6 months ago ${GD.nameTicketAttachmentOne}`);
    // assert.equal(this.$(`${ATTACHMENT_FILE}:eq(2)`).attr('href'), `/media/${TAD.fileAttachmentAddOne}`);//not sure where this cam from....there is only 8 activity push above
});

test('activity list can be filtered to show comments or status updates', function(assert) {
    let person_to_and_from_json = TAF.get_assignee_person_and_to_from_json(TAD.idAssigneeOne);
    store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
    store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
    store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
    store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo});
    store.push('activity/cc-add', {id: 1, fullname: 'person1', activities: [TAD.idCcAddOne]});
    store.push('activity/cc-add', {id: 2, fullname: 'person2', activities: [TAD.idCcAddOne]});
    store.push('activity/cc-remove', {id: 1, fullname: 'person1', activities: [TAD.idCcRemoveOne]});
    store.push('activity/cc-remove', {id: 2, fullname: 'person2', activities: [TAD.idCcRemoveOne]});
    store.push('activity/person', person_to_and_from_json.person);
    store.push('activity/assignee', person_to_and_from_json.to);
    store.push('activity/assignee', person_to_and_from_json.from);
    store.push('activity/attachment-add', {id: TAD.idAttachmentAddOne, filename: GD.nameTicketAttachmentOne, file: TAD.fileAttachmentAddOne, activities: [TAD.idAttachmentAddOne]});
    store.push('activity', TAF.get_create_json(TAD.idCreate));
    store.push('activity', TAF.get_assignee_json(TAD.idAssigneeOne));
    store.push('activity', TAF.get_status_json(TAD.idStatusOne));
    store.push('activity', TAF.get_priority_json(TAD.idPriorityOne));
    store.push('activity', TAF.get_cc_add_remove_json(TAD.idCcAddOne, 2, 'cc_add'));
    store.push('activity', TAF.get_cc_add_remove_json(TAD.idCcRemoveOne, 2, 'cc_remove'));
    store.push('activity', TAF.get_comment_json(TAD.idCommentOne));
    store.push('activity', TAF.get_attachment_add_remove_json(TAD.idAttachmentAddOne, 1, 'attachment_add'));
    let model = store.find('activity');
    this.set('model', model);
    this.render(hbs`{{activity-list model=model}}`);
    let $component = this.$(`${ACTIVITY_ITEMS}`);
    assert.equal($component.length, 8);
    this.$(`${STATUS_TAB}`).click();
    $component = this.$(`${ACTIVITY_ITEMS}`).filter(':visible');
    assert.equal($component.length, 2);
    this.$(`${COMMENT_TAB}`).click();
    $component = this.$(`${ACTIVITY_ITEMS}`).filter(':visible');
    assert.equal($component.length, 2);
    this.$(`${ALL_TAB}`).click();
    $component = this.$(`${ACTIVITY_ITEMS}`).filter(':visible');
    assert.equal($component.length, 8);

});
