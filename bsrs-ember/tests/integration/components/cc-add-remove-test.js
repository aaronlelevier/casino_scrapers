import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';
import AD from 'bsrs-ember/vendor/defaults/automation';
import PD from 'bsrs-ember/vendor/defaults/person';
import { clickTrigger, triggerKeydown, nativeMouseUp, nativeMouseDown, typeInSearch } from 'bsrs-ember/tests/helpers/ember-power-select';
import waitFor from 'ember-test-helpers/wait';
import moment from 'moment';

var store, trans, activityAutomation, activityPerson, created, timestamp;

moduleForComponent('cc-add-remove', 'Integration | Component | cc-add-remove', {
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
        automation: {
          id: AD.idOne,
          description: AD.descriptionOne
        },
        type: 'cc_add',
        added: [{
          id: PD.idOne, fullname: PD.fullname
        }]
      });
      activityPerson = store.push('activity', {
        id: TAD.idCreate,
        created: created,
        type: 'cc_add',
        person_fk: PD.idOne,
        added: [{
          id: PD.idOne, fullname: PD.fullname
        }]
      });
      store.push('activity/person', {id: PD.idOne, fullname: PD.fullname});
    });
  }
});

// cc_add

test('content for automation generated ticket activity cc-add-remove cc_add', function(assert) {
  this.activity = activityAutomation;
  this.i18nString = trans.t('activity.ticket.cc_add',
    {added: 'foo', timestamp:timestamp});
  this.render(hbs`{{
    cc-add-remove
    activity=activity
    i18nString=i18nString
    fulltime=(moment-format activity.created 'dddd, MMMM Do YYYY, h:mm:ss a z')
  }}`);
  assert.equal(this.$('.t-link').text().trim(), activityAutomation.get('automation').description);
  assert.equal(this.$('.t-ticket-cc-add-remove').text().trim(), PD.fullname);
  assert.ok(this.$('.t-activity-timestamp').text().trim());
});

test('content for person generated ticket activity cc-add-remove cc_add', function(assert) {
  this.activity = activityPerson;
  this.i18nString = trans.t('activity.ticket.cc_add',
    {added: 'foo', timestamp:timestamp});
  this.render(hbs`{{
    cc-add-remove
    activity=activity
    i18nString=i18nString
    fulltime=(moment-format activity.created 'dddd, MMMM Do YYYY, h:mm:ss a z')
  }}`);
  assert.equal(this.$('.t-link').text().trim(), activityPerson.get('person').get('fullname'));
  assert.equal(this.$('.t-ticket-cc-add-remove').text().trim(), PD.fullname);
});

// cc_remove

test('content for automation generated ticket activity cc-add-remove cc_remove', function(assert) {
  activityAutomation.type = 'cc_remove';
  delete activityAutomation.added;
  activityAutomation.removed = [{
    id: PD.idOne, fullname: PD.fullname
  }];
  this.activity = activityAutomation;
  this.i18nString = trans.t('activity.ticket.cc_add',
    {added: 'foo', timestamp:timestamp});
  this.render(hbs`{{
    cc-add-remove
    activity=activity
    i18nString=i18nString
    fulltime=(moment-format activity.created 'dddd, MMMM Do YYYY, h:mm:ss a z')
  }}`);
  assert.equal(this.$('.t-link').text().trim(), activityAutomation.get('automation').description);
  assert.equal(this.$('.t-ticket-cc-add-remove').text().trim(), PD.fullname);
  assert.ok(this.$('.t-activity-timestamp').text().trim());
});

test('content for person generated ticket activity cc-add-remove cc_remove', function(assert) {
  activityPerson.type = 'cc_remove';
  delete activityPerson.added;
  activityPerson.removed = [{
    id: PD.idOne, fullname: PD.fullname
  }];
  this.activity = activityPerson;
  this.i18nString = trans.t('activity.ticket.cc_add',
    {added: 'foo', timestamp:timestamp});
  this.render(hbs`{{
    cc-add-remove
    activity=activity
    i18nString=i18nString
    fulltime=(moment-format activity.created 'dddd, MMMM Do YYYY, h:mm:ss a z')
  }}`);
  assert.equal(this.$('.t-link').text().trim(), activityPerson.get('person').get('fullname'));
  assert.equal(this.$('.t-ticket-cc-add-remove').text().trim(), PD.fullname);
});
