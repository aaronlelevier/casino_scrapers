import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'td',
    classNameBindings: ['className'],
    className: Ember.computed(function() {
        let noun = this.get('noun');
        let field = this.get('column.field');
        let classNames = this.get('column.classNames') || [];
        let developerClass = 't-' + noun + '-' + field.replace(/\./g, '-');
        return classNames.join(' ') + ' ' + developerClass;
    })
});
