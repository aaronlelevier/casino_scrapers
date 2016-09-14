from rest_framework import serializers

from contact.models import Email, Address, PhoneNumber
from contact.serializers import (EmailSerializer, PhoneNumberSerializer, AddressSerializer,
    CountryIdNameSerializer)
from dtd.models import TreeData
from dtd.serializers import TreeDataLeafNodeSerializer
from person.models import Person
from person.serializers_leaf import PersonSimpleSerializer
from tenant.models import Tenant
from utils import create
from utils.serializers import BaseCreateSerializer


class TenantListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tenant
        fields = ('id', 'company_code', 'company_name')


CREATE_FIELDS = ('id', 'company_code', 'company_name', 'dashboard_text',
                  'default_currency', 'implementation_contact_initial',
                  'implementation_email', 'billing_email', 'billing_phone_number',
                  'billing_address')


class TenantContactsMixin(object):

    @staticmethod
    def update_or_create_nested_contacts(validated_data):
        contact_data = [
            ('implementation_email', validated_data.pop('implementation_email', {}), Email),
            ('billing_email', validated_data.pop('billing_email', {}), Email),
            ('billing_address', validated_data.pop('billing_address', {}), Address),
            ('billing_phone_number', validated_data.pop('billing_phone_number', {}), PhoneNumber)
        ]

        # process Contact models
        for key, value, model in contact_data:
            if value:
                try:
                    c = model.objects.get(id=value['id'])
                    create.update_model(c, value)
                except model.DoesNotExist:
                    c = model.objects.create(**value)
                finally:
                    validated_data[key] = c

        return validated_data


class TenantCreateSerializer(TenantContactsMixin, BaseCreateSerializer):

    implementation_email = EmailSerializer()
    billing_email = EmailSerializer()
    billing_phone_number = PhoneNumberSerializer()
    billing_address = AddressSerializer()

    class Meta:
        model = Tenant
        fields = CREATE_FIELDS

    def create(self, validated_data):
        validated_data = self.update_or_create_nested_contacts(validated_data)
        return super(TenantCreateSerializer, self).create(validated_data)

    def to_representation(self, instance):
        data = super(TenantCreateSerializer, self).to_representation(instance)
        data['default_currency_id'] = data['default_currency']
        return data


class TenantDetailSerializer(TenantCreateSerializer):

    dt_start = TreeDataLeafNodeSerializer(required=False)
    implementation_contact = PersonSimpleSerializer(required=False)
    countries = CountryIdNameSerializer(required=False, many=True)

    class Meta:
        model = Tenant
        fields = CREATE_FIELDS + ('dt_start', 'implementation_contact', 'countries', 'test_mode')

    def to_representation(self, instance):
        data = super(TenantDetailSerializer, self).to_representation(instance)
        data['dt_start_id'] = data['dt_start']['id'] if data['dt_start'] else None
        return data

    def update(self, instance, validated_data):
        implementation_contact = validated_data.pop('implementation_contact', {})
        dt_start = validated_data.pop('dt_start', {})
        countries = validated_data.pop('countries', [])

        validated_data = self.update_or_create_nested_contacts(validated_data)

        instance = super(TenantDetailSerializer, self).update(instance, validated_data)

        instance = self._update_foreign_key(instance, Person, 'implementation_contact', implementation_contact)
        instance = self._update_foreign_key(instance, TreeData, 'dt_start', dt_start)
        instance = self._update_countries(instance, countries)
        instance.save()
        return instance

    @staticmethod
    def _update_foreign_key(instance, model, key, data):
        if data:
            obj = model.objects.get(id=data['id'])
            setattr(instance, key, obj)
        else:
            setattr(instance, key, None)
        return instance

    @staticmethod
    def _update_countries(instance, countries):
        country_ids = []
        if countries:
            country_ids = [c['id'] for c in countries]
            # add new
            instance.countries.add(*country_ids)
        # remove old
        countries_to_remove = instance.countries.exclude(id__in=country_ids)
        for c in countries_to_remove:
            instance.countries.remove(c)
        return instance
