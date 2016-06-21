import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import PD from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import LD from 'bsrs-ember/vendor/defaults/locale';
import GLOBAL from 'bsrs-ember/vendor/defaults/global-message';

var store, run = Ember.run, person_repo, trans;

moduleForComponent('person-new', 'integration: person-new test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:currency']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    var service = this.container.lookup('service:i18n');
    var json = translations.generate('en');
    loadTranslations(service, json);
    run(function() {
      store.push('locale', {id: LD.idOne, name: LD.nameOneKey, default: LD.defaultOne});
    });
    person_repo = repository.initialize(this.container, this.registry, 'person');
    person_repo.findUsername = () => { return new Ember.RSVP.Promise(() => {}); };
  }
});

test('filling in invalid username reveal validation messages', function(assert) {
  run(() => {
    this.set('model', store.push('person', {}));
  });
  this.render(hbs`{{people/person-new model=model}}`);
  let $component = this.$('.has-error');
  assert.equal($component.text().trim(), '');
  this.$('.t-person-password').val(PD.password).trigger('change');
  var save_btn = this.$('.t-save-btn');
  save_btn.trigger('click').trigger('change');
  $component = this.$('.has-error');
  assert.ok($component.is(':visible'));
  assert.equal($component.text().trim(), trans.t('errors.person.username'));
});

test('should default locale if not present in Person model', function(assert) {
  let person;
  run(() => {
    person = store.push('person', {});
    this.set('model', person);
  });
  this.render(hbs`{{people/person-new model=model}}`);
  let $component = this.$('.t-locale-select');
  assert.equal($component.text().trim(), trans.t(LD.nameOneKey));
  assert.ok(person.get('isNotDirty'));
});



// test('filling in invalid password reveal validation messages', function(assert) {
//   run(() => {
//     this.set('model', store.push('person', {}));
//   });
//   this.render(hbs`{{people/person-new model=model}}`);
//   this.$('.t-person-username').val('a').trigger('change');
//   let $component = this.$('.has-error');
//   assert.equal($component.text().trim(), '');
//   var save_btn = this.$('.t-save-btn');
//   save_btn.trigger('click').trigger('change');
//   $component = this.$('.has-error');
//   assert.ok($component.is(':visible'));
//   assert.equal($component.text().trim(), trans.t('errors.person.password'));
// });
