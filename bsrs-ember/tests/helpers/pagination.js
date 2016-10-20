import Ember from 'ember';

let pginator = Ember.Test.registerAsyncHelper('pagination', function(app, assert) {
  let pg = find('.t-pages');
  assert.equal(pg.find('.t-page').length, 2);
  assert.equal(pg.find('.t-page:eq(0) a').text().trim(), '1');
  assert.equal(pg.find('.t-page:eq(1) a').text().trim(), '2');
  assert.ok(pg.find('.t-page:eq(0) a').hasClass('active'));
  assert.ok(!pg.find('.t-page:eq(1) a').hasClass('active'));
});

let pginator2 = Ember.Test.registerAsyncHelper('pagination2', function(app, assert) {
  let pg = find('.t-pages');
  assert.equal(pg.find('.t-page').length, 2);
  assert.equal(pg.find('.t-page:eq(0) a').text().trim(), '1');
  assert.equal(pg.find('.t-page:eq(1) a').text().trim(), '2');
  assert.ok(!pg.find('.t-page:eq(0) a').hasClass('active'));
  assert.ok(pg.find('.t-page:eq(1) a').hasClass('active'));
});

export { pginator, pginator2 };
