import Ember from 'ember';
import Resolver from 'ember-resolver';
import Store from 'ember-cli-simple-store/store';

export default function(container, registry, keys) {
    var resolver = Resolver.create({namespace: {modulePrefix: 'bsrs-ember'}});
    registry.register('store:main', Store);
    keys.forEach(function(key) {
        var factory = resolver.resolve('bsrs-ember@' + key);
        registry.register(key, factory);
    });
    return container.lookup('store:main');
}
