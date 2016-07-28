import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/<%= dasherizedModuleName %>';

const Validations = buildValidations({
  <%= firstPropertySnake %>: [
    validator('presence', {
      presence: true,
      message: 'errors.<%= dasherizedModuleName %>.<%= firstPropertySnake %>'
    }),
    validator('length', {
      min: 5,
      max: 500,
      message: 'errors.<%= dasherizedModuleName %>.<%= firstPropertySnake %>.min_max'
    })
  ],
  <%= secondPropertySnake %>: [
    validator('presence', {
      presence: true,
      message: 'errors.<%= dasherizedModuleName %>.<%= secondPropertySnake %>'
    }),
  ],
});

export default Model.extend(OptConf, Validations, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('<%= secondProperty %>', '<%= dasherizedModuleName %>');
    many_to_many.bind(this)('<%= thirdPropertySnake %>', '<%= dasherizedModuleName %>');
  },
  simpleStore: Ember.inject.service(),
  <%= firstPropertySnake %>: attr(''),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', '<%= secondPropertyCamel %>IsDirty', '<%= thirdPropertyCamel %>IsDirty', function() {
    return this.get('isDirty') || this.get('<%= secondPropertyCamel %>IsDirty') || this.get('<%= thirdPropertyCamel %>IsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollback<%= secondPropertyTitle %>();
    this.rollback<%= thirdPropertyTitle %>();
    this._super(...arguments);
  },
  saveRelated() {
    this.save<%= secondPropertyTitle %>();
    this.save<%= thirdPropertyTitle %>();
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('<%= dasherizedModuleName %>', this.get('id'));
    });
  },
  serialize() {
    return {
      id: this.get('id'),
      <%= firstPropertySnake %>: this.get('<%= firstPropertySnake %>'),
      <%= secondPropertySnake %>: this.get('<%= secondPropertySnake %>').get('id'),
      <%= thirdPropertySnake %>: this.get('<%= thirdPropertySnake %>_ids'),
    };
  },
});
