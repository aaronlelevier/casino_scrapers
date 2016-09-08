import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';

var store, trans;

moduleForComponent('validated-input-multi', 'integration: validated-input-multi test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:person', 'service:i18n']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
  }
});

test('passing a type will change the form fields type', function(assert) {
  run(() => {
    this.set('model', store.push('person', {}));
  });
  this.render(hbs`
    {{validated-input-multi
      model=model
      count=0
      placeholder=(t 'admin.person.label.password')
      valuePath='password'
      className='form-control t-person-password'
      didValidate=didValidate
      class='t-person-password-validator'
      type='password'
    }}`);
  let $component = this.$('.t-person-password');
  assert.equal($component.attr('type'), 'password');
  assert.equal($component.attr('placeholder'), trans.t('admin.person.label.password'));
  assert.equal($component.attr('class'), 'form-control t-person-password ember-view ember-text-field');
  assert.equal($component.attr('id'), 'password0');
  assert.equal($component.val(), '');
  $component.val('wat');
  assert.equal($component.val(), 'wat');
});

test('didValidate and isInvalid trigger validation', function(assert) {
  run(() => {
    this.set('model', store.push('person', {}));
  });
  this.render(hbs`
    {{validated-input-multi
      model=model
      placeholder=(t 'admin.person.label.password')
      valuePath='password'
      className='form-control t-person-password'
      didValidate=didValidate
      class='t-person-password-validator'
      type='password'
      maxlength=2
      didValidate=true
      isInvalid=true
    }}`);
  let $component = this.$('.t-person-password-validator');
  assert.ok($component.hasClass('invalid'));
});
