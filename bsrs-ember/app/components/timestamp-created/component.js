import Ember from 'ember';
import moment from 'moment';

export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['create-date', 't-created-comment'],
  title: Ember.computed(function(){
    return moment(this.get('model').get('created')).format('dddd, MMMM Do YYYY, h:mm:ss a z');
  }),
  testId: 'created-tag',
  attributeBindings: ['testId:data-test-id'],
});
