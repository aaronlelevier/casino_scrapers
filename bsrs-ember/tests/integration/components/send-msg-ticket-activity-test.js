import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';
import AD from 'bsrs-ember/vendor/defaults/automation';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import moment from 'moment';

let store, trans, activityAutomation, activityPerson, created, timestamp;
const PD = PERSON_DEFAULTS.defaults();

moduleForComponent('send-msg-ticket-activity', 'Integration | Component | send-msg-ticket-activity', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:activity', 'model:activity/send-sms', 'model:activity/send-email']);
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    created = new Date();
    timestamp = moment(created);
    run(() => {
      activityAutomation = store.push('activity', {
        id: TAD.idAssigneeOne,
        created: created,
        type: 'send_sms',
        automation_fk: AD.idOne
      });
      store.push('activity/automation', {id: AD.idOne, description: AD.descriptionOne});
      store.push('activity/send-sms', {id: PD.idOne, fullname: PD.fullname, activities: [TAD.idAssigneeOne]});
      store.push('activity/send-email', {id: PD.idOne, fullname: PD.fullname, activities: [TAD.idAssigneeOne]});
    });
  }
});

test('content for automation generated ticket activity for an SMS', function(assert) {
  this.activity = activityAutomation;
  // from/to here are assignee names
  this.i18nString = trans.t('activity.ticket.msg_sent', {timestamp:timestamp});
  this.render(hbs`{{
    send-msg-ticket-activity
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('.t-link').text().trim(), AD.descriptionOne);
  assert.equal(this.$('[data-test-id=t-message-type]').text().trim(), 'Text message sent to');
  assert.equal(this.$('.t-recipients').text().trim(), PD.fullname);
  assert.equal(this.$('[data-test-id=t-sent-via]').text().trim(), `via ${AD.descriptionOne}`);
  assert.equal(this.$('.t-activity-timestamp').text().trim(), moment(timestamp).fromNow());
  assert.equal(this.$('[data-test-id=t-activity-icon]').find('.fa-mobile').length, 1);
});

test('content for automation generated ticket activity for an Email', function(assert) {
  run(() => {
    store.push('activity', {id: TAD.idAssigneeOne, 'type': 'send_email'});
  });
  this.activity = activityAutomation;
  // from/to here are assignee names
  this.i18nString = trans.t('activity.ticket.msg_sent', {timestamp:timestamp});
  this.render(hbs`{{
    send-msg-ticket-activity
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('.t-link').text().trim(), AD.descriptionOne);
  assert.equal(this.$('[data-test-id=t-message-type]').text().trim(), 'Email sent to');
  assert.equal(this.$('.t-recipients').text().trim(), PD.fullname);
  assert.equal(this.$('[data-test-id=t-sent-via]').text().trim(), `via ${AD.descriptionOne}`);
  assert.equal(this.$('.t-activity-timestamp').text().trim(), moment(timestamp).fromNow());
  assert.equal(this.$('[data-test-id=t-activity-icon]').find('.fa-envelope').length, 1);
});