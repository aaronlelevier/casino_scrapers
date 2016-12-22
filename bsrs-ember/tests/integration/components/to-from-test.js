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

moduleForComponent('to-from', 'Integration | Component | to-from', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:activity']);
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    created = new Date();
    timestamp = moment(created);
    run(() => {
      activityAutomation = store.push('activity', {
        id: TAD.idAssigneeOne,
        created: created,
        automation_fk: AD.idOne
      });
      store.push('activity/automation', {id: AD.idOne, description: AD.descriptionOne});
      activityPerson = store.push('activity', {id: TAD.idCreate, type: 'assignee', person_fk: PD.idOne});
      store.push('activity/person', {id: PD.idOne, fullname: PD.fullname});
    });
  }
});

test('fa-icon is generated based on ticket activity type', function(assert) {
  // status
  run(() => {
    store.push('activity', {id: TAD.idAssigneeOne, type: 'status'});
  });
  this.activity = activityAutomation;
  this.i18nString = trans.t('activity.ticket.to_from',
    {type:'assignee', from:'foo', to:'bar', timestamp:timestamp});
  this.render(hbs`{{
    to-from
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('[data-test-id=t-activity-icon]').find('.fa-clock-o').length, 1);
  // assignee
  run(() => {
    store.push('activity', {id: TAD.idAssigneeOne, type: 'assignee'});
  });
  this.set('activity', activityAutomation);
  this.render(hbs`{{
    to-from
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('[data-test-id=t-activity-icon]').find('.fa-user').length, 1);
  // priority
  run(() => {
    store.push('activity', {id: TAD.idAssigneeOne, type: 'priority'});
  });
  this.set('activity', activityAutomation);
  this.render(hbs`{{
    to-from
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('[data-test-id=t-activity-icon]').find('.fa-exclamation-triangle').length, 1);
});

test('content for automation generated ticket activity with assignee', function(assert) {
  this.activity = activityAutomation;
  // from/to here are assignee names
  this.i18nString = trans.t('activity.ticket.to_from',
    {type:'assignee', from:'foo', to:'bar', timestamp:timestamp});
  this.render(hbs`{{
    to-from
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('.t-link').text().trim(), AD.descriptionOne);
  assert.equal(this.$('.t-to-from-new').text().trim(), 'foo');
  assert.equal(this.$('.t-to-from-old').text().trim(), 'bar');
  assert.equal(this.$('.t-activity-timestamp').text().trim(), moment(timestamp).fromNow());
});

test('content for person generated ticket activity with assignee', function(assert) {
  this.activity = activityPerson;
  // from/to here are assignee names
  this.i18nString = trans.t('activity.ticket.to_from',
    {type:'assignee', from:'foo', to:'bar', timestamp:timestamp});
  this.render(hbs`{{
    to-from
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('.t-link').text().trim(), PD.fullname);
});
