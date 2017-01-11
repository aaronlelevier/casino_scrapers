import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

let droppedImageString = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

let hoverText = 'admin.person.change_profile_picture';
let dropText = 'general.drop.image';
let trans;

moduleForComponent('image-drop', 'Integration | Component | image drop', {
  integration: true,
  beforeEach() {
    trans = this.container.lookup('service:i18n');
    this.hoverText = trans.t(hoverText);
    this.dropText = trans.t(dropText);
    this.icon = 'user';
  }
});

test('it renders default state without a photo', function(assert) {
  this.render(hbs`{{image-drop addHoverText=hoverText dropText=dropText icon=icon}}`);
  assert.equal(this.$('.hover').text().trim(), this.hoverText);
  assert.equal(this.$('.text').text().trim(), this.dropText);
  assert.equal(this.$('.t-image-drop').hasClass('active'), false);
  assert.equal(this.$('.t-image-drop').hasClass('is-dragging'), false);
  let style = this.$('.t-image-drop').css('background-image');
  assert.equal(style, 'none');
});

test('it renders default state with a photo', function(assert) {
  this.render(hbs`{{image-drop changeHoverText=hoverText droppedImage="wat.jpg" dropText=dropText icon=icon}}`);
  assert.equal(this.$('.fa').hasClass('fa-user'), false);
  assert.equal(this.$('.hover').text().trim(), this.hoverText);
  assert.equal(this.$('.text').text().trim(), this.dropText);
  assert.equal(this.$('.t-image-drop').hasClass('active'), false);
  assert.equal(this.$('.t-image-drop').hasClass('is-dragging'), false);
});

test('it reacts to dragging on itself', function(assert) {
  this.render(hbs`{{image-drop hoverText=hoverText dropText=dropText icon=icon}}`);
  this.$('.t-image-drop').trigger('dragover');
  assert.equal(this.$('.t-image-drop').hasClass('active'), true);
  this.$('.t-image-drop').trigger('dragleave');
  assert.equal(this.$('.t-image-drop').hasClass('active'), false);
});

test('it renders the dropped image', function(assert) {
  this.set('droppedImage', droppedImageString);
  this.render(hbs`{{image-drop droppedImage=droppedImage hoverText=hoverText dropText=dropText icon=icon}}`);
  let style = this.$('.t-image-drop').css('background-image');
  let expectedStyle = `url(${droppedImageString})`;
  assert.equal(style.replace(/"/g, ""), expectedStyle);
});

// TODO: look at ember-sinon to integration test this.
// test('it handles a dropped image file', function(assert) {
//   this.set('droppedImage', droppedImageString);
//   this.render(hbs`{{image-drop droppedImage=droppedImage hoverText=hoverText dropText=dropText icon=icon}}`);
//   let fileName = 'file.png';
//   this.$('.t-image-drop').trigger('dragover');
//   assert.equal(this.$('.t-image-drop').hasClass('active'), true);
//   fillInFileInput('input', { name: fileName, content: droppedImageString });
//   let style = this.$('.t-image-drop').css('background-image');
//   let expectedStyle = `url(${droppedImageString})`;
//   assert.equal(removeDoubleQuotes(style), expectedStyle);
//   assert.equal(this.$('.t-image-drop').hasClass('active'), false);
// });
