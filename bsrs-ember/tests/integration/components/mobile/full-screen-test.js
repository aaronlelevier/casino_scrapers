import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';

let store;

moduleForComponent('mobile/full-screen', 'Integration | Component | full-screen', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:person']);
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'mobile').begin + 5;
    flexi.set('width', width);
    run(() => {
      store.push('person', {'id': '55639133-fd6f-4a03-b7bc-ec2a6a3cb049', 'name': 'person'});
    });
  },
});

test('full screen renders with a title, header and footer', function(assert) {
  this.hashComponents=[
    {
      title: 'Detail'
    },
    {
      title: 'Other'
    }
  ];
  this.repository = repository.initialize(this.container, this.registry, 'person');
  this.model = store.find('person');
  this.title = "Person";
  this.render(hbs`{{mobile/full-screen
    title=title
    model=model
    close="closeMobileDetail"
    redirectRoute="admin.people.index"
    hashComponents=hashComponents
    repository=repository
  }}`);
  assert.equal(this.$('[data-test-id="mobile-detail-title"]').text(), 'Person');
  assert.equal(this.$('[data-test-id="mobile-save-btn"]').length, 1);
  assert.equal(this.$('[data-test-id="mobile-header"]').length, 1);
  assert.equal(this.$('[data-test-id="mobile-footer"]').length, 1);
  assert.equal(this.$('[data-test-id="mobile-footer-item"]:eq(0)').text(), 'Detail');
  assert.equal(this.$('[data-test-id="mobile-footer-item"]:eq(1)').text(), 'Other');
});

test('full screen with one section renders with no footer', function(assert) {
  this.hashComponents=[
    {
      title: 'Display'
    }
  ];
  this.repository = repository.initialize(this.container, this.registry, 'person');
  this.model = store.find('person');
  this.title = "Person";
  this.render(hbs`{{mobile/full-screen
    title=title
    model=model
    close="closeMobileDetail"
    redirectRoute="admin.people.index"
    hashComponents=hashComponents
    repository=repository
  }}`);
  assert.equal(this.$('[data-test-id="mobile-footer"]:visible').length, 0);
});
