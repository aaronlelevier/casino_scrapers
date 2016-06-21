import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('grid-search-input', 'Unit | Component | grid search input', {
  unit: true
});

test('it has property autocapitalize set to none', function(assert) {
  let component = this.subject();
  /* for iOs */
  assert.equal(component.autocapitalize, 'none');
});
