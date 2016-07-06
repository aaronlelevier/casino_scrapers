import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import page from 'bsrs-ember/tests/pages/profile';

var store, model, run = Ember.run, trans;

moduleForComponent('profile-single', 'integration: profile-single test', {
  integration: true,
  setup() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:profile']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      model = store.push('profile', {
        id: PD.idOne,
        description: PD.descOne,
      });
    });
    this.set('model', model);
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('header - shows detail if not model.new', function(assert) {
  this.render(hbs `{{profiles/profile-single model=model}}`);
  assert.equal(this.$('.t-profile-header').text().trim(), trans.t('admin.profile.detail'));
});

test('header - shows new if model.new', function(assert) {
  model.set('new', true);
  this.set('model', model);
  this.render(hbs `{{profiles/profile-single model=model}}`);
  assert.equal(this.$('.t-profile-header').text().trim(), trans.t('admin.profile.new'));
});

test('translation keys for labels', function(assert) {
  this.render(hbs `{{profiles/profile-single}}`);
  assert.equal(getLabelText('description'), trans.t('admin.profile.description'));
  assert.equal(getLabelText('assignee'), trans.t('admin.profile.assignee'));
});

test('placeholders', function(assert) {
  this.render(hbs `{{profiles/profile-single}}`);
  assert.equal(this.$('.t-ap-description').get(0)['placeholder'], trans.t('admin.profile.description'));
});
