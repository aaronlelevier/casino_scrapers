import Ember from 'ember';

var NewMixin = Ember.Mixin.create({
    notDirty: Ember.computed.not('dirty'),
    dirty: Ember.computed('isDirty', function() {
        var isDirty = this.get('isDirty');
        var isNew = this.get('new');
        return isNew ? false : isDirty;
    }),
    isNewAndNotDirty: Ember.computed('new', 'isNotDirty', function() {
        return this.get('new') && this.get('isNotDirty');
    }),
    save() {
        this.set('new', undefined);
        this._super();
    }
});

export default NewMixin;
