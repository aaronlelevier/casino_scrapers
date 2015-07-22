import Ember from 'ember';
import Store from 'ember-cli-simple-store/store';

export default function(container, registry, keys) {
    var factory = require('ember/resolver')['default'];
    var resolver = factory.create({namespace: {modulePrefix: 'bsrs-ember'}});
    registry.register('store:main', Store);
    keys.forEach(function(key) {
        var factory = resolver.resolve('bsrs-ember@' + key);
        registry.register(key, factory);
    });
    return container.lookup('store:main');
}
