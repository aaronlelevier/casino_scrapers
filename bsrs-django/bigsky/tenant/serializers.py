import copy

from rest_framework import serializers

from dtd.serializers import TreeDataLeafNodeSerializer
from tenant.models import Tenant


class TenantDetailSerializer(serializers.ModelSerializer):

    dt_start = TreeDataLeafNodeSerializer()

    class Meta:
        model = Tenant
        fields = ('id', 'company_code', 'company_name', 'dashboard_text',
                  'dt_start', 'default_currency', 'test_mode')

    def to_representation(self, instance):
        init_data = super(TenantDetailSerializer, self).to_representation(instance)
        data = copy.copy(init_data)
        data['dt_start_id'] = data['dt_start']['id']
        data['default_currency_id'] = data.pop('default_currency', None)
        return data


class TenantUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tenant
        fields = ('id', 'company_code', 'company_name', 'dashboard_text',
                  'dt_start', 'default_currency', 'test_mode')
