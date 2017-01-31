from rest_framework import serializers
from provider.models import Provider


class ProviderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Provider
        fields = ('id', 'name')


class ProviderDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = Provider
        fields = ('id', 'name', 'logo', 'address1', 'address2', 'city',
                  'state', 'postal_code', 'phone', 'email')
