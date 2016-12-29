import Ember from 'ember';
const { Component, computed, get } = Ember;

export default Component.extend({
  tagName: 'span',
  lastItemCount: computed(function() {
    return get(this, 'array').get('length') - 1;
  }),
});
