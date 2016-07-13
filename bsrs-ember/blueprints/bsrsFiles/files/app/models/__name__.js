import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConfMixin from 'bsrs-ember/mixins/optconfigure/<%= dasherizedModuleName %>';

export default Model.extend(OptConfMixin, {
  init() {
    belongs_to.bind(this)('<%= secondProperty %>', '<%= dasherizedModuleName %>');
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  <%= firstPropertySnake %>: attr(''),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', '<%= secondPropertyCamel %>IsDirty', function() {
    return this.get('isDirty') || this.get('<%= secondPropertyCamel %>IsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollback<%= secondPropertyTitle %>();
    this._super();
  },
  saveRelated() {
    this.save<%= secondPropertyTitle %>();
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('<%= dasherizedModuleName %>', this.get('id'));
    });
  },
  serialize() {
    return {
      id: this.get('id'),
      <%= firstProperty %>: this.get('<%= firstPropertySnake %>'),
      <%= secondProperty %>: this.get('<%= secondPropertySnake %>').get('id'),
    };
  },
});
