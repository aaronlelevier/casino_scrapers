import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var FilterSetNavigation = Ember.Component.extend({
  tagName: 'hbox',
  repository: inject('filterset'),
  /**
   * @method saved
   * returns saved filterests from the bootup data.  
   */
  saved: Ember.computed('filtersets', 'filtersets.[]', function() {
    const route = this.get('route');
    const filtersets = this.get('filtersets') || [];
    return filtersets.filter((filterset) => {
      return filterset.get('endpoint_name') === route;
    });
  }),
  actions: {
    removeFilterSet: function(id) {
      let repository = this.get('repository');
      repository.delete(id);
    }
  }
});

export default FilterSetNavigation;
