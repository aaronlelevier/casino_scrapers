import copy

from rest_framework import serializers

from contact.serializers import (PhoneNumberSerializer, EmailSerializer, AddressSerializer)
from location.serializers import LocationSerializer, LocationIdNameOnlySerializer
from category.serializers import CategoryIDNameOnlySerializer, CategoryRoleSerializer
from person.models import Person, Role
from person.settings import DEFAULT_ROLE_SETTINGS
from person.validators import (RoleLocationValidator, RoleCategoryValidator,
    RoleSettingsValidator,)
from utils.serializers import (BaseCreateSerializer, NestedContactSerializerMixin,
    RemovePasswordSerializerMixin)


### ROLE ###

class RoleSerializer(BaseCreateSerializer):
    "Serializer used for all ``Role`` API Endpoint operations."

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level')


class RoleCreateSerializer(BaseCreateSerializer):
    "Serializer used for create ``Role`` API Endpoint operations."

    class Meta:
        model = Role
        validators = [RoleCategoryValidator(), RoleSettingsValidator()]
        fields = ('id', 'name', 'role_type', 'location_level', 'categories',
            'settings',)

    def create(self, validated_data):
        validated_data = self._validate_and_update_settings(validated_data)
        return super(RoleCreateSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._validate_and_update_settings(validated_data)
        return super(RoleCreateSerializer, self).update(instance, validated_data)

    def _validate_and_update_settings(self, validated_data):
        final_settings = copy.copy(DEFAULT_ROLE_SETTINGS)

        for k,v in final_settings.items():
            try:
                new_value = validated_data['settings'][k].get('value')
                # to defend agains key's w/ no values that don't match the req'd type
                if new_value:
                    final_settings[k]['value'] = new_value
            except KeyError:
                # Silently pass b/c if a 'value' isn't being posted for
                # a Role setting, we're going to use the default.
                pass
        else:
            validated_data.update({'settings': final_settings})

        return validated_data


class RoleDetailSerializer(BaseCreateSerializer):
    
    categories = CategoryRoleSerializer(many=True)

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level', 'categories',
            'settings',)

    @staticmethod
    def eager_load(queryset):
        return queryset.prefetch_related('categories')


class RoleIdNameSerializer(serializers.ModelSerializer):
    "Used for nested serializer data for other serializers."

    class Meta:
        model = Role
        fields = ('id', 'name',)


### PERSON ###

PERSON_FIELDS = (
    'id', 'username', 'first_name', 'middle_initial',
    'last_name', 'status', 'role', 'title', 'employee_id',
    'auth_amount', 'auth_currency',
)


PERSON_DETAIL_FIELDS = PERSON_FIELDS + ('locale', 'locations', 'last_login', 'date_joined',
    'emails', 'phone_numbers', 'addresses',)


class PersonCreateSerializer(RemovePasswordSerializerMixin, BaseCreateSerializer):
    '''
    Base Create serializer because ``Role`` needed before second step 
    of configuration for the ``Person``.
    '''

    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = ('id', 'username', 'password', 'role',)

    def create(self, validated_data):
        person = Person.objects.create_user(**validated_data)
        person.groups.add(person.role.group)
        return person


class PersonListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Person
        fields = PERSON_FIELDS


class PersonTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Person
        fields = ('id', 'first_name', 'middle_initial', 'last_name')


class PersonDetailSerializer(serializers.ModelSerializer):

    locations = LocationSerializer(many=True)
    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)

    class Meta:
        model = Person
        fields = PERSON_DETAIL_FIELDS

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('role')
                        .prefetch_related('emails', 'phone_numbers', 'addresses',
                                          'locations', 'locations__location_level'))


class PersonCurrentSerializer(PersonDetailSerializer):

    all_locations_and_children = LocationIdNameOnlySerializer(many=True)
    categories = CategoryIDNameOnlySerializer(many=True)

    class Meta:
        model = Person
        fields = PERSON_DETAIL_FIELDS + ('all_locations_and_children',
                                         'categories',)


class PersonUpdateSerializer(RemovePasswordSerializerMixin, NestedContactSerializerMixin,
    serializers.ModelSerializer):
    '''
    Update a ``Person`` and all nested related ``Contact`` Models.

    :Location constraint:
        A Person's Location can only be:

        `person.location.location_level == person.role.location.location_level`

    '''
    password = serializers.CharField(required=False, style={'input_type': 'password'})
    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)

    class Meta:
        model = Person
        validators = [RoleLocationValidator('role', 'locations')]
        write_only_fields = ('password',)
        fields = PERSON_FIELDS + ('password', 'locale', 'locations',
            'emails', 'phone_numbers', 'addresses',)

    def update(self, instance, validated_data):
        # Pasword
        self.update_password(instance, validated_data)
        # Contacts
        return super(PersonUpdateSerializer, self).update(instance, validated_data)

    def update_password(self, instance, validated_data):
        raw_password = validated_data.pop('password', None)
        if raw_password:
            instance.set_password(raw_password)
