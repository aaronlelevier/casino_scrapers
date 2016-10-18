import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import SED from 'bsrs-ember/vendor/defaults/sendemail';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import SEJRD from 'bsrs-ember/vendor/defaults/sendemail-join-recipients';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import page from 'bsrs-ember/tests/pages/automation';

var store, trans, action;

moduleForComponent('automations/sendemail-action', 'Integration | Component | automations/sendemail action', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:automation']);
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, subject: SED.subjectOne, body: SED.bodyOne, sendemail_recipient_fks: [SEJRD.idOne], actions: [AAD.idOne]});
    store.push('person', {id: PersonD.idOne, fullname: PersonD.fullname});
    store.push('sendemail-join-recipients', {id: SEJRD.idOne, sendemail_pk: SED.idOne, recipient_pk: PersonD.idOne});
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('terrance it renders', function(assert) {
  this.model = action;
  this.index = 0;
  this.render(hbs`{{automations/sendemail-action model=model index=index}}`);
  assert.equal(this.$('.t-sendemail-recipient-label').text().trim(), trans.t('admin.action.sendemail.recipients'));
  assert.equal(this.$('.t-sendemail-subject-label').text().trim(), trans.t('admin.action.subject'));
  assert.equal(this.$('.t-sendemail-body-label').text().trim(), trans.t('admin.action.body'));
  assert.equal(this.$('.t-action-subject0').val(), action.get('sendemail').get('subject'));
  assert.equal(this.$('.t-action-body0').val(), action.get('sendemail').get('body'));
  assert.equal(page.actionSendEmailRecipientOne.replace(/\W/, '').trim(), action.get('sendemail').get('recipient').objectAt(0).get('fullname'));
});
