import Ember from 'ember';
import NewMixin from 'bsrs-ember/mixins/model/new';

export default Ember.Object.extend(NewMixin, {
    progress: Ember.computed('percent', function() {
        let percent = this.get('percent');
        return new Ember.Handlebars.SafeString(`width: ${percent}%;`);
    })
});
