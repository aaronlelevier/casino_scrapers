import Ember from 'ember';

export default {
    name: 'repository',
    initialize: function(container, registry, name) {
        var module = 'bsrs-ember/repositories/' + name;
        var factory = window.require(module, null, null, true);
        if (!factory || !factory['default'] || !(factory['default'].prototype instanceof Ember.Object)) {
            throw new Error(name + " must export a default to be registered with application.");
        }
        registry.register('repositories:' + name, factory['default']);
        var instance = container.lookup('repositories:' + name);
        instance.find = function() { return []; };
        return instance;
    }
};
