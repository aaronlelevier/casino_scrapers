import json

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from accounting.serializers import CurrencyIdNameSerializer
from contact.models import Email, Address, PhoneNumber, Country
from contact.serializers import (
    EmailSerializer, PhoneNumberSerializer, AddressSerializer, AddressUpdateSerializer,
    CountryIdNameSerializer)
from dtd.serializers import TreeDataListSerializer
from person.serializers_leaf import PersonSimpleSerializer
from tenant.models import Tenant
from tenant.oauth import BsOAuthSession, DEV_SC_SUBSCRIBER_POST_URL
from utils import create
from utils.serializers import BaseCreateSerializer


class TenantListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tenant
        fields = ('id', 'company_code', 'company_name', 'test_mode')


TENANT_FIELDS = ('id', 'company_code', 'company_name', 'dashboard_text',
                  'default_currency', 'implementation_contact_initial',
                  'implementation_email', 'billing_email', 'billing_phone_number',
                  'billing_address', 'billing_contact', 'countries',)


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
                except model.DoesNotExist:
                    c = model.objects.create(**value)
                else:
                    create.update_model(c, value)
                finally:
                    validated_data[key] = c

        return validated_data


class TenantDetailSerializer(BaseCreateSerializer):

    implementation_email = EmailSerializer()
    billing_email = EmailSerializer()
    billing_phone_number = PhoneNumberSerializer()
    billing_address = AddressSerializer()
    implementation_contact = PersonSimpleSerializer()
    dtd_start = TreeDataListSerializer()
    default_currency = CurrencyIdNameSerializer()
    countries = CountryIdNameSerializer(required=False, many=True)

    class Meta:
        model = Tenant
        fields = TENANT_FIELDS + ('scid', 'test_mode', 'implementation_contact', 'dtd_start',)


class TenantCreateSerializer(TenantContactsMixin, BaseCreateSerializer):

    implementation_email = EmailSerializer()
    billing_email = EmailSerializer()
    billing_phone_number = PhoneNumberSerializer()
    billing_address = AddressUpdateSerializer()
    countries = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), required=False, many=True)

    class Meta:
        model = Tenant
        fields = TENANT_FIELDS

    def create(self, validated_data):
        validated_data = self.update_or_create_nested_contacts(validated_data)
        instance = super(TenantCreateSerializer, self).create(validated_data)
        self._send_mail(instance.implementation_email.email)
        self._sc_create(instance)
        return instance

    # TODO: update this w/ email template / django send_mail when ready
    def _send_mail(self, email):
        pass

    def _sc_create(self, instance):
        session = BsOAuthSession()
        tries = 3
        for i in range(tries):
            sc_response = session.post(DEV_SC_SUBSCRIBER_POST_URL, data=instance.sc_post_data)

            if sc_response.status_code == 201:
                data = json.loads(sc_response.content.decode('utf8'))
                instance.scid = data['id']
                instance.save()
                break;
            else:
                if tries == i+1: # b/c range() 0 indexed
                    raise ValidationError("Error creating subscriber")


class TenantUpdateSerializer(TenantCreateSerializer):

    class Meta:
        model = Tenant
        fields = TENANT_FIELDS + ('test_mode', 'implementation_contact', 'dtd_start',)

    def update(self, instance, validated_data):
        countries = validated_data.pop('countries', [])
        validated_data = self.update_or_create_nested_contacts(validated_data)

        instance = super(TenantUpdateSerializer, self).update(instance, validated_data)

        instance = self._update_countries(instance, countries)
        instance.save()
        return instance

    @staticmethod
    def _update_countries(instance, countries):
        country_ids = []
        if countries:
            country_ids = [c.id for c in countries]
            # add new
            instance.countries.add(*country_ids)
        # remove old
        countries_to_remove = instance.countries.exclude(id__in=country_ids)
        for c in countries_to_remove:
            instance.countries.remove(c)
        return instance
