import Ember from 'ember';
import NewMixin from 'bsrs-ember/mixins/model/new';

export default Ember.Object.extend(NewMixin, {
  progress: Ember.computed('percent', function() {
    const percent = this.get('percent');
    return new Ember.Handlebars.SafeString(`width: ${percent}%;`);
  }),
  complete: Ember.computed('percent', function() {
    const percent = this.get('percent');
    if(percent === 100){
      return true;
    }
  }),
  complete_class: Ember.computed('complete', function() {
    const complete = this.get('complete');
    if(complete){
      return 'complete';
    }
  })
});
