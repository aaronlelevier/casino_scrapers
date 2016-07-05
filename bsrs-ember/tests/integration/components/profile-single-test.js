import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';

var store, run = Ember.run, trans;

moduleForComponent('profile-single', 'integration: profile-single test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:profile']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      store.push('profile', {
        id: PD.idOne,
        description: PD.descOne,
      });
    });
  }
});

test('translation keys for labels', function(assert) {
  this.render(hbs `{{profiles/profile-single model=model}}`);
  assert.equal(getLabelText('description'), trans.t('admin.profile.description'));
  assert.equal(getLabelText('assignee'), trans.t('admin.profile.assignee'));
});
