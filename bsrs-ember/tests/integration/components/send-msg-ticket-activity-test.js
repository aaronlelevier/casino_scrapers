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

let trans, timestamp;
const PD = PERSON_DEFAULTS.defaults();

moduleForComponent('send-msg-ticket-activity', 'Integration | Component | send-msg-ticket-activity', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry, ['model:activity', 
      'model:activity/send-sms', 'model:activity/send-email']);
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    let created = new Date();
    timestamp = moment(created);
    run(() => {
      this.activity = this.store.push('activity', {
        id: TAD.idAssigneeOne,
        created: created,
        type: 'send_sms',
        automation_fk: AD.idOne
      });
      this.store.push('activity/automation', {id: AD.idOne, description: AD.descriptionOne});
      this.store.push('activity/send-sms', {id: PD.idOne, fullname: PD.fullname, activities: [TAD.idAssigneeOne]});
      this.store.push('activity/send-sms', {id: PD.idTwo, fullname: PD.fullnameBoy, activities: [TAD.idAssigneeOne]});
      this.store.push('activity/send-email', {id: PD.idOne, fullname: PD.fullname, activities: [TAD.idAssigneeOne]});
      this.i18nString = trans.t('activity.ticket.msg_sent', {timestamp:timestamp});
    });
  },
  afterEach() {
    delete this.store;
  }
});

test('content for automation generated ticket activity for an SMS', function(assert) {
  this.render(hbs`{{send-msg-ticket-activity
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('.t-link').text().trim(), AD.descriptionOne);
  assert.equal(
    this.$('.t-activity-wrap').text().replace(/[\s\n]+/gm, ''),
    `${trans.t('automation.actions.sms').string.replace(/\s+/, '')}sentto${PD.fullname.replace(/\s+/, '')}${trans.t('general.and')}${PD.fullnameBoy.replace(/\s+/, '')}viafoobar${moment(timestamp).fromNow().replace(/[\s]/g, '')}`);
  assert.equal(this.$('[data-test-id=message-type]').text().trim(), trans.t('automation.actions.sms') + ' sent to');
  assert.equal(this.$('.t-recipients0').text().trim(), PD.fullname);
  assert.equal(this.$('.t-recipients1').text().trim(), PD.fullnameBoy);
  assert.equal(this.$('[data-test-id=t-sent-via]').text().trim(), `via ${AD.descriptionOne}`);
  assert.equal(this.$('.t-activity-timestamp').text().trim(), moment(timestamp).fromNow());
  assert.equal(this.$('[data-test-id=activity-icon]').find('.fa-mobile').length, 1);
});

test('content for automation generated ticket activity for an Email', function(assert) {
  run(() => {
    this.store.push('activity', {id: TAD.idAssigneeOne, type: 'send_email'});
  });
  this.render(hbs`{{send-msg-ticket-activity
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('.t-link').text().trim(), AD.descriptionOne);
  assert.equal(this.$('.t-activity-wrap').text().replace(/[\s\n]+/gm, ''), 
    `${trans.t('automation.actions.email')}sentto${PD.fullname.replace(/\s+/, '')}viafoobar${moment(timestamp).fromNow().replace(/[\s]/g, '')}`);
  assert.equal(this.$('[data-test-id=message-type]').text().trim(), trans.t('automation.actions.email') + ' sent to');
  assert.equal(this.$('.t-recipients0').text().trim(), PD.fullname);
  assert.equal(this.$('[data-test-id=t-sent-via]').text().trim(), `via ${AD.descriptionOne}`);
  assert.equal(this.$('.t-activity-timestamp').text().trim(), moment(timestamp).fromNow());
  assert.equal(this.$('[data-test-id=activity-icon]').find('.fa-envelope').length, 1);
});
