import Ember from 'ember';

var CategoryNewController = Ember.Controller.extend({
  actions: {
    setName(name) {
      this.get('model').set('name', name);
    },
    setDescription(description) {
      this.get('model').set('description', description);
    },
    setLabel(label) {
      this.get('model').set('label', label);
    },
    setSubLabel(sublabel) {
      this.get('model').set('subcategory_label', sublabel);
    }
  }
});

export default CategoryNewController;
