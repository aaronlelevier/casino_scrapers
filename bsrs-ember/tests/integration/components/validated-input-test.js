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
import GLOBAL from 'bsrs-ember/vendor/defaults/global-message';

var store, run = Ember.run, person_repo, trans;

moduleForComponent('validated-input', 'integration: validated-input test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:currency']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    var service = this.container.lookup('service:i18n');
    var json = translations.generate('en');
    loadTranslations(service, json);
    person_repo = repository.initialize(this.container, this.registry, 'person');
    person_repo.findUsername = () => { return new Ember.RSVP.Promise(() => {}); };
  }
});

test('passing a type will change the form fields type', function(assert) {
  run(() => {
    this.set('model', store.push('person', {}));
  });
  this.render(hbs`
    {{validated-input
      model=model
      value=model.password
      placeholder=(t "admin.person.label.password")
      valuePath="password"
      className="form-control t-person-password"
      didValidate=didValidate
      class="t-person-password-validator"
      idZ="password"
      type="password"
    }}`);
  let $component = this.$('.t-person-password');
  assert.equal($component.attr('type'), 'password');
});