from rest_framework import serializers

from tenant.models import Tenant


class TenantSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tenant
        fields = ('id', 'company_code', 'company_name', 'dashboard_text',
                  'dt_start', 'default_currency', 'test_mode')
