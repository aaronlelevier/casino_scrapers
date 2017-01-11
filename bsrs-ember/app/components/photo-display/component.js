import Ember from 'ember';

export default Ember.Component.extend({
  attributeBindings: ['style'],
  style: Ember.computed('droppedImage', function() {
    let backgroundStyle = '';

    if (this.get('droppedImage')) {
      backgroundStyle = `background-image: url(${this.get('droppedImage')});`;
    } 

    return Ember.String.htmlSafe(backgroundStyle);
  }),
});
