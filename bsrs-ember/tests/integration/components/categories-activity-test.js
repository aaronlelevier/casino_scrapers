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
import PD from 'bsrs-ember/vendor/defaults/person';
import moment from 'moment';

var store, trans, activityAutomation, activityPerson, created, timestamp;

moduleForComponent('categories-activity', 'Integration | Component | categories-activity', {
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
        }
      });
      activityPerson = store.push('activity', {id: TAD.idCreate, type: 'assignee', person_fk: PD.idOne});
      store.push('activity/person', {id: PD.idOne, fullname: PD.fullname});
    });
  }
});

test('content for automation generated ticket activity category added', function(assert) {
  this.activity = activityAutomation;
  // from/to here are assignee names
  this.i18nString = trans.t('activity.ticket.categories',
    {from:'foo', to:'bar', timestamp:timestamp});
  this.render(hbs`{{
    categories-activity
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('[data-test-id="t-ticket-category"]').text().trim(), 'changed the category from foo to bar');
  assert.equal(this.$('.t-link').text().trim(), activityAutomation.get('automation').description);
  assert.equal(this.$('.t-activity-timestamp').text().trim(), moment(timestamp).fromNow());
});

test('content for person generated ticket activity category added', function(assert) {
  this.activity = activityPerson;
  // from/to here are assignee names
  this.i18nString = trans.t('activity.ticket.categories',
    {from:'foo', to:'bar', timestamp:timestamp});
  this.render(hbs`{{
    categories-activity
    activity=activity
    i18nString=i18nString
    fulltime=(moment-from-now activity.created)
  }}`);
  assert.equal(this.$('.t-link').text().trim(), activityPerson.get('person').get('fullname'));
});
