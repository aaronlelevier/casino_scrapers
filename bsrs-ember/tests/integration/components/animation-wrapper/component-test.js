import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('animation-wrapper', 'Integration | Component | animation wrapper', {
  integration: true
});

test('it renders with correct classes', function(assert) {
  this.slideInUp = true;
  this.render(hbs` {{#animation-wrapper slideInUp=slideInUp}} {{/animation-wrapper}} `);
  assert.ok(this.$('animation-wrapper').attr('class').includes('slideInUp'));
  assert.ok(this.$('animation-wrapper').attr('class').includes('full-screen'));
  this.slideOutDown = true;
  this.render(hbs` {{#animation-wrapper slideOutDown=slideOutDown}} {{/animation-wrapper}} `);
  assert.ok(this.$('animation-wrapper').attr('class').includes('slideOutDown'));
  this.slideOutUp = true;
  this.render(hbs` {{#animation-wrapper slideOutUp=slideOutUp}} {{/animation-wrapper}} `);
  assert.ok(this.$('animation-wrapper').attr('class').includes('slideOutUp'));
  this.slideOutRight = true;
  this.render(hbs` {{#animation-wrapper slideOutRight=slideOutRight}} {{/animation-wrapper}} `);
  assert.ok(this.$('animation-wrapper').attr('class').includes('slideOutRight'));
  this.slideOutLeft = true;
  this.render(hbs` {{#animation-wrapper slideOutLeft=slideOutLeft}} {{/animation-wrapper}} `);
  assert.ok(this.$('animation-wrapper').attr('class').includes('slideOutLeft'));
  this.slideInLeft = true;
  this.render(hbs` {{#animation-wrapper slideInLeft=slideInLeft}} {{/animation-wrapper}} `);
  assert.ok(this.$('animation-wrapper').attr('class').includes('slideInLeft'));
  this.slideInRight = true;
  this.render(hbs` {{#animation-wrapper slideInRight=slideInRight}} {{/animation-wrapper}} `);
  assert.ok(this.$('animation-wrapper').attr('class').includes('slideInRight'));
});
