import Ember from 'ember';

export default Ember.Object.extend({
    progress: Ember.computed('percent', function() {
        let percent = this.get('percent');
        return new Ember.Handlebars.SafeString(`width: ${percent}%;`);
    })
});
