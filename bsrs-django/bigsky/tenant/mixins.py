class RemoveTenantMixin(object):

    def to_representation(self, instance):
        data = super(RemoveTenantMixin, self).to_representation(instance)
        data.pop('tenant', None)
        return data
