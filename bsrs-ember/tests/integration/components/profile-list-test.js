import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import page from 'bsrs-ember/tests/pages/profile';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, model, run = Ember.run, trans;

moduleForComponent('profile-list', 'integration: profile-list test', {
  integration: true,
  setup() {
    page.setContext(this);
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:profile']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      store.push('profile', {
        id: PD.idOne,
        description: PD.descOne,
        assignee_id: PD.assigneeOne,
        assignee: {
          id: PD.assigneeOne,
          username: PD.username
        }
      });
      store.push('profile', {
        id: PD.idTwo,
        description: PD.descTwo,
        assignee_id: PD.assigneeTwo,
        assignee: {
          id: PD.assigneeTwo,
          username: PD.usernameTwo
        }
      });
    });
    // template
    let models = store.find('profile');
    this.set('model', models);
    this.set('filtersets', models);
    this.set('requested', models);
    this.render(hbs `{{
      profiles/profile-list
      count=count
      model=model
      page=page
      sort=sort
      search=search
      find=find
      requested=requested
      page_size=page_size
      filterModel=filterModel
      filtersets=filtersets
      routeName=routeName
      defaultSort=defaultSort
      noun="profile"
      plural=(t "admin.profile.other")
      grid_title=(t "admin.profile" count="2")
      list_url="admin.profiles.index"
      detail_url="admin.profiles.profile"
      add_model_url="admin.profiles.new"
      search_placeholder=(t "admin.profile.search")
      add_model_text=(t "admin.profile.one")
      hasActiveFilterSet=hasActiveFilterSet
    }}`);
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
  }
});

test('template translation tags as variables', function(assert) {
  assert.equal(generalPage.gridTitle, trans.t('admin.profile.other'));
  assert.equal(this.$('.t-grid-search-input').get(0)['placeholder'], trans.t('admin.profile.search'));
  assert.equal(generalPage.gridPageCountText, trans.t('admin.profile.other'));
  // column headers
  assert.equal(page.descSortText, trans.t('admin.profile.label.description'));
  assert.equal(page.assigneeSortText, trans.t('admin.profile.label.assignee'));
});

test('description and assignee username are showing', function(assert) {
  assert.equal(page.descGridOne, PD.descOne);
  assert.equal(page.assigneeGridOne, PD.username);
  assert.equal(page.descGridTwo, PD.descTwo);
  assert.equal(page.assigneeGridTwo, PD.usernameTwo);
});
