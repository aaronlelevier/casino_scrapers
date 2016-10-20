import Ember from 'ember';

export const pagination = Ember.Test.registerAsyncHelper('pagination', function(app, assert) {
  var pagination = find('.t-pages');
  assert.equal(pagination.find('.t-page').length, 2);
  assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
  assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
  assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
});

export const pagination2 = Ember.Test.registerAsyncHelper('pagination2', function(app, assert) {
  var pagination = find('.t-pages');
  assert.equal(pagination.find('.t-page').length, 2);
  assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
  assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
  assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
  assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
});
