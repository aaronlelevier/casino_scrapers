import Ember from 'ember';

var NewMixin = Ember.Mixin.create({
    notDirty: Ember.computed.not('dirty'),
    dirty: Ember.computed('isDirty', function() {
        var isDirty = this.get('isDirty');
        var isNew = this.get('new');
        return isNew ? false : isDirty;
    }),
    save() {
        this.set('new', undefined);
        this._super();
    }
});

export default NewMixin;
