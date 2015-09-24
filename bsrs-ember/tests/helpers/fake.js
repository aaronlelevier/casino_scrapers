import Ember from 'ember';

export default {
    name: 'fake',
    initialize: function(container, registry, module, fake) {
        registry.register(module, fake);
        return container.lookup(module);
    }
};
