import Ember from 'ember';

export default Ember.Component.extend({
  tabList: Ember.inject.service(),
  classNames: 'tab slideInUp animated-fast'.w(),
  /*
   * singleTabIsDirty 
   * singleTab does not have access to all models in this context, so use tabService showModal function to determine if any of its models are dirty
   * Note: unsure why need {or} truth-helper in template for single model.
   * @return {boolean}
   */
  singleTabIsDirty: Ember.computed('model.isDirtyOrRelatedDirty', function() {
    const tabService = this.get('tabList');
    const tab = this.get('tab');
    return tabService.showModal(tab, 'closeTab');
  }),
  actions: {
    close(tab){
      this.get('close')(tab);
    },
  }
});
