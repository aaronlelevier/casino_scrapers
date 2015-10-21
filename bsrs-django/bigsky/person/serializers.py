from rest_framework import serializers

from contact.models import PhoneNumber, Address, Email
from contact.serializers import   (
    PhoneNumberFlatSerializer, PhoneNumberSerializer,
    EmailFlatSerializer, EmailSerializer,
    AddressFlatSerializer, AddressSerializer)
from location.serializers import LocationLevelSerializer, LocationIdNameSerializer
from category.serializers import CategoryRoleSerializer
from person.models import PersonStatus, Person, Role
from person.validators import RoleLocationValidator
from utils import create
from utils.serializers import (BaseCreateSerializer, NestedContactSerializerMixin,
    RemovePasswordSerializerMixin)


### ROLE ###

class RoleSerializer(BaseCreateSerializer):
    "Serializer used for all ``Role`` API Endpoint operations."

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level')


class RoleUpdateSerializer(BaseCreateSerializer):
    "Serializer used for update ``Role`` API Endpoint operations."

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level', 'categories')


class RoleDetailSerializer(BaseCreateSerializer):
    
    categories = CategoryRoleSerializer(many=True)

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level', 'categories')


class RoleIdNameSerializer(serializers.ModelSerializer):
    "Used for nested serializer data for other serializers."

    class Meta:
        model = Role
        fields = ('id', 'name',)


### PERSON STATUS ###

class PersonStatusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PersonStatus
        fields = ('id', 'name')


### PERSON ###

PERSON_FIELDS = (
    'id', 'username', 'first_name', 'middle_initial',
    'last_name', 'status', 'role', 'title', 'employee_id',
    'auth_amount', 'auth_currency',
)


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

    status = PersonStatusSerializer()

    class Meta:
        model = Person
        fields = PERSON_FIELDS


class PersonTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Person
        fields = ('id', 'first_name', 'middle_initial', 'last_name', 'role', 'title')


class PersonDetailSerializer(serializers.ModelSerializer):

    status = PersonStatusSerializer()
    locations = LocationIdNameSerializer(many=True)
    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)

    class Meta:
        model = Person
        fields = PERSON_FIELDS + ('locale', 'locations',
            'emails', 'phone_numbers', 'addresses',)


class PersonUpdateSerializer(RemovePasswordSerializerMixin, NestedContactSerializerMixin,
    serializers.ModelSerializer):
    '''
    Update a ``Person`` and all nested related ``Contact`` Models.

    :Location constraint:
        A Person's Location can only be:

        `person.location.location_level == person.role.location.location_level`

    '''
    password = serializers.CharField(required=False, style={'input_type': 'password'})
    emails = EmailFlatSerializer(required=False, many=True)
    phone_numbers = PhoneNumberFlatSerializer(required=False, many=True)
    addresses = AddressFlatSerializer(required=False, many=True)

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
