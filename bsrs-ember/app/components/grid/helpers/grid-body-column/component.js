import Ember from 'ember';

export default Ember.Component.extend({
    classNameBindings: ['className'],
    className: Ember.computed(function() {
        let noun = this.get('noun');
        let field = this.get('column.field');
        let flexOrderClass = this.get('column.mobileOrder') ? 'flex-order-' + this.get('column.mobileOrder') : '';
        let classNames = this.get('column.classNames') || [];
        let developerClass = 't-' + noun + '-' + field.replace(/\./g, '-');
        return classNames.join(' ') + ' ' + flexOrderClass + ' ' + developerClass;
    })
});
