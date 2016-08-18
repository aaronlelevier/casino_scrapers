import Ember from 'ember';

var EditMixin = Ember.Mixin.create({
  actions: {
    save(update, updateActivities=false) {//update arg determines if transition or not and close out tab
      const model = this.get('model');
      if(update && model.get('isNotDirtyOrRelatedNotDirty')){
        return;
      }
      const pk = this.get('model').get('id');
      // some components used for single and new, so need to handle both situations
      const persisted = model.get('new');
      const repository = this.get('repository');
      const action = persisted === true ? 'insert' : 'update';
      return repository[action](model).then(() => {
        let tab = this.tab();
        // if new model then set saveModel for use in application route so doesn't remove record for new models
        tab.set('saveModel', persisted);
        if(!update){
          //All other routes
          this.sendAction('close', tab);
        } else if (update && updateActivities) {
          //TICKET sends update in args
          return this.get('activityRepository').find('ticket', 'tickets', pk);
        }
      }, (xhr) => {
        if(xhr.status === 400) {
          var response = JSON.parse(xhr.responseText), errors = [];
          Object.keys(response).forEach(function(key) {
            errors.push({name: key, value: response[key].toString()});
          });
          this.set('ajaxError', errors);
        }
      });
    },
    /*
    * @method delete
    * deleteCB call site is in tab-navigation in delete_model function upon clicking Yes in modal
    */
    delete() {
      let id = this.get('model').get('id');
      let repository = this.get('repository');
      let deleteCB = function() {
        return repository.delete(id);
      };
      this.sendAction('delete', this.tab(), deleteCB);
    }
  }
});

export default EditMixin;
