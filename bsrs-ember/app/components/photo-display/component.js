import Ember from 'ember';

export default Ember.Component.extend({
  attributeBindings: ['style', 'dataTestId:data-test-id'],
  style: Ember.computed('droppedImage', function() {
    let backgroundStyle = '';
    const image = this.get('image');

    if (image) {
      backgroundStyle = `background-image: url(${image});`;
    } 

    return Ember.String.htmlSafe(backgroundStyle);
  }),
});
