from rest_framework import serializers

from category.serializers import CategoryIDNameOnlySerializer, CategoryRoleSerializer
from contact.serializers import PhoneNumberSerializer, EmailSerializer, AddressSerializer
from location.serializers import LocationIdNameOnlySerializer, LocationStatusFKSerializer
from person.models import Person, Role, PersonStatus
from person.validators import RoleLocationValidator, RoleCategoryValidator
from setting.serializers import SettingSerializer
from utils.serializers import (BaseCreateSerializer, NestedContactSerializerMixin,
    RemovePasswordSerializerMixin, NestedSettingUpdateMixin,
    NestedSettingsToRepresentationMixin)


### ROLE ###

class RoleSerializer(BaseCreateSerializer):

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level')


class RoleCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Role
        validators = [RoleCategoryValidator()]
        fields = ('id', 'name', 'role_type', 'location_level', 'categories',)


class RoleUpdateSerializer(NestedSettingUpdateMixin, BaseCreateSerializer):
    settings = SettingSerializer()

    class Meta:
        model = Role
        validators = [RoleCategoryValidator()]
        fields = ('id', 'name', 'role_type', 'location_level', 'categories',
            'settings',)


class RoleDetailSerializer(NestedSettingsToRepresentationMixin, BaseCreateSerializer):
    
    categories = CategoryRoleSerializer(many=True)
    settings = SettingSerializer()

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
    'last_name', 'fullname', 'status', 'role', 'title', 'employee_id',
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


class PersonStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = PersonStatus
        fields = ('id', 'name')


class PersonListSerializer(serializers.ModelSerializer):

    status = PersonStatusSerializer(required=False)

    class Meta:
        model = Person
        fields = PERSON_FIELDS


class PersonTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Person
        fields = ('id', 'first_name', 'middle_initial', 'last_name', 'status', 'role')


class PersonDetailSerializer(NestedSettingsToRepresentationMixin, serializers.ModelSerializer):

    locations = LocationStatusFKSerializer(many=True)
    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)
    settings = SettingSerializer()

    class Meta:
        model = Person
        fields = PERSON_DETAIL_FIELDS + ('settings',)

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('role')
                        .prefetch_related('emails', 'phone_numbers', 'addresses',
                                          'locations', 'locations__location_level'))

    def to_representation(self, instance):
        data = super(PersonDetailSerializer, self).to_representation(instance)
        data['status_fk'] = data.pop('status', [])
        return data


class PersonCurrentSerializer(PersonDetailSerializer):

    all_locations_and_children = LocationIdNameOnlySerializer(many=True)
    categories = CategoryIDNameOnlySerializer(many=True)

    class Meta:
        model = Person
        fields = PERSON_DETAIL_FIELDS + ('all_locations_and_children',
                                         'categories',)


class PersonUpdateSerializer(RemovePasswordSerializerMixin, NestedContactSerializerMixin,
    NestedSettingUpdateMixin, serializers.ModelSerializer):
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
    settings = SettingSerializer(required=False)

    class Meta:
        model = Person
        validators = [RoleLocationValidator('role', 'locations')]
        write_only_fields = ('password',)
        fields = PERSON_FIELDS + ('password', 'locale', 'locations',
            'emails', 'phone_numbers', 'addresses', 'settings',)

    def update(self, instance, validated_data):
        # Pasword
        self._update_password(instance, validated_data)
        # Contacts
        return super(PersonUpdateSerializer, self).update(instance, validated_data)

    def _update_password(self, instance, validated_data):
        raw_password = validated_data.pop('password', None)
        if raw_password:
            instance.set_password(raw_password)
