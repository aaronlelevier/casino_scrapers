import Ember from 'ember';
import multi from '../multi-input/component';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['add-more'],
  // click: function(e) {
  //   e.preventDefault();
  //   multi.create().appendTo($('.form-group:last'));
  // }
});
