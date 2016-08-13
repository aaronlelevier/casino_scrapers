import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import PD from 'bsrs-ember/vendor/defaults/person';

var store, trans;
const ERR_TEXT = '.validated-input-error-dialog';

moduleForComponent('person-text-input', 'integration: person-text-input test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:person']);
    run(() => {
      this.set('model', store.push('person', {id: PD.idOne}));
    });
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    var service = this.container.lookup('service:i18n');
    var json = translations.generate('en');
    loadTranslations(service, json);
  }
});

test('first_name validation error if not present or greater than 30 characters', function(assert) {
  const FIRST_NAME = '.t-person-first-name';
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'first_name';
  var done = assert.async();
  this.render(hbs`{{people/person-text-input model=model field="first_name"}}`);
  // presence required
  let $err = this.$('.invalid');
  assert.equal($err.text().trim(), '');
  this.$(FIRST_NAME).val('').keyup();
  Ember.run.later(() => {
    let $err = this.$('.invalid');
    assert.ok($err.is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.first_name'));
    this.$(FIRST_NAME).val('a').keyup();
    Ember.run.later(() => {
      // valid input
      $err = this.$('.invalid');
      assert.notOk($err.is(':visible'));
      this.$(FIRST_NAME).val('a'.repeat(31)).keyup();
      Ember.run.later(() => {
        $err = this.$('.invalid');
        assert.ok($err.is(':visible'));
        assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.first_name.length'));
        this.$(FIRST_NAME).val('a'.repeat(30)).keyup();
        Ember.run.later(() => {
          $err = this.$('.invalid');
          assert.notOk($err.is(':visible'));
          done();
        }, 300);
      }, 1900);
    }, 300);
  }, 1900);
});

test('middle_initial validation error if not present or greater than 30 characters', function(assert) {
  const MIDDLE_INITIAL = '.t-person-middle-initial';
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'middle_initial';
  var done = assert.async();
  this.render(hbs`{{people/person-text-input model=model field="middle_initial"}}`);
  // presence required
  let $err = this.$('.invalid');
  assert.equal($err.text().trim(), '');
  this.$(MIDDLE_INITIAL).val('').keyup();
  Ember.run.later(() => {
    let $err = this.$('.invalid');
    assert.notOk($err.is(':visible'));
    this.$(MIDDLE_INITIAL).val('a').keyup();
    Ember.run.later(() => {
      // valid input
      $err = this.$('.invalid');
      assert.notOk($err.is(':visible'));
      this.$(MIDDLE_INITIAL).val('1').keyup();
      Ember.run.later(() => {
        $err = this.$('.invalid');
        assert.ok($err.is(':visible'));
        assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.middle_initial'));
         done();
      }, 1900);
    }, 300);
  }, 1900);
});

test('last_name validation error if not present or greater than 30 characters', function(assert) {
  const LAST_NAME = '.t-person-last-name';
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'last_name';
  var done = assert.async();
  this.render(hbs`{{people/person-text-input model=model field="last_name"}}`);
  // presence required
  let $err = this.$('.invalid');
  assert.equal($err.text().trim(), '');
  this.$(LAST_NAME).val('').keyup();
  Ember.run.later(() => {
    let $err = this.$('.invalid');
    assert.ok($err.is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.last_name'));
    this.$(LAST_NAME).val('a').keyup();
    Ember.run.later(() => {
      // valid input
      $err = this.$('.invalid');
      assert.notOk($err.is(':visible'));
      this.$(LAST_NAME).val('a'.repeat(31)).keyup();
      Ember.run.later(() => {
        $err = this.$('.invalid');
        assert.ok($err.is(':visible'));
        assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.last_name.length'));
        this.$(LAST_NAME).val('a'.repeat(30)).keyup();
        Ember.run.later(() => {
          $err = this.$('.invalid');
          assert.notOk($err.is(':visible'));
          done();
        }, 300);
      }, 1900);
    }, 300);
  }, 1900);
});
