import Ember from 'ember';
const { run } = Ember;
import config from 'bsrs-ember/config/environment';

/* @mixin FullScreen
 * Not using save and cancel b/c no tabs that exist in desktop
 */
export default Ember.Mixin.create({
  actions: {
    save(update=false) {
      //TODO: refactor into util funcs
      const model = this.get('model');
      const pk = this.get('model').get('id');
      // const persisted = model.get('new');
      const repository = this.get('repository');
      // const action = persisted === true ? 'insert' : 'update';
      return repository['update'](model).then(() => {
        if (update) {
          const model = this.get('model');
          const pk = model.get('id');
          return this.get('activityRepository').find('ticket', 'tickets', pk, model);
        } else {
          this.setProperties({slideOutRight: false, slideOutUp: true, slideInRight: false});
          const redirectRoute = this.get('redirectRoute');
          run.later(this, 'sendAction', 'close', redirectRoute, config.APP.ANIMATION_TIME);
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
    cancel() {
      const model = this.get('model');
      const redirectRoute = this.get('redirectRoute');
      if (model.get('isNotDirtyOrRelatedNotDirty')) {
        this.setProperties({slideOutRight: true, slideOutUp: false, slideInRight: false});
        run.later(this, 'sendAction', 'close', redirectRoute, config.APP.ANIMATION_TIME);
      } else {
        this.set('mobileDialog', true);
      }
    },
  }
});
