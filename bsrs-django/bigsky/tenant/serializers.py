import copy

from rest_framework import serializers

from accounting.models import Currency
from dtd.serializers import TreeDataLeafNodeSerializer
from tenant.models import Tenant
from utils.serializers import BaseCreateSerializer


class TenantDetailSerializer(serializers.ModelSerializer):

    dt_start = TreeDataLeafNodeSerializer()
    default_currency_id = serializers.PrimaryKeyRelatedField(queryset=Currency.objects.all(),
                                                             source='default_currency')

    class Meta:
        model = Tenant
        fields = ('id', 'company_code', 'company_name', 'dashboard_text',
                  'dt_start', 'default_currency_id', 'test_mode')

    # TODO: can remove if done in Ember deserializer
    def to_representation(self, instance):
        init_data = super(TenantDetailSerializer, self).to_representation(instance)
        data = copy.copy(init_data)
        data['dt_start_id'] = data['dt_start']['id']
        return data


class TenantSerializer(BaseCreateSerializer):

    class Meta:
        model = Tenant
        fields = ('id', 'company_code', 'company_name', 'dashboard_text',
                  'dt_start', 'default_currency', 'test_mode')
