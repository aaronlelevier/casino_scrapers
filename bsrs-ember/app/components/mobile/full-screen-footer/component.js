import Ember from 'ember';

export default Ember.Component.extend({
  isVisible: Ember.computed(function(){
    return this.get('hashComponents').length > 1;
  }),
  tagName: 'footer',
  testId: 'mobile-footer',
  attributeBindings: ['testId:data-test-id'],
  classNames: ['mobile-footer flex-item--none'],
  actions: {
    renderSection(componentObj){
      this.attrs.renderSection(componentObj);
    }
  }
});
