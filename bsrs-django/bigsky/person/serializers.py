from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import Group
from django.contrib.auth import update_session_auth_hash
from rest_framework import serializers

from contact.models import PhoneNumber, Address, Email
from contact.serializers import (PhoneNumberSerializer, AddressSerializer,
    EmailSerializer, AddressSerializer)
from location.models import LocationLevel, Location
from location.serializers import LocationLevelSerializer
from person.models import PersonStatus, Person, Role
from util import create


### ROLE ###

class RoleSerializer(serializers.ModelSerializer):

    id = serializers.UUIDField(read_only=False)
    location_level = LocationLevelSerializer(read_only=True)

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level')


class RoleCreateSerializer(serializers.ModelSerializer):

    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level')


class RoleDetailSerializer(serializers.ModelSerializer):

    group = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        required=False
        )
    location_level = serializers.PrimaryKeyRelatedField(
        queryset=LocationLevel.objects.all(),
        required=False
        )
    name = serializers.CharField(source='group.name')

    class Meta:
        model = Role
        fields = ('id', 'group', 'name', 'location_level', 'role_type',)


### PERSON STATUS ###

class PersonStatusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PersonStatus
        fields = ('id', 'name')


### PERSON ###

PERSON_FIELDS = (
    'id', 'username', 'first_name', 'middle_initial',
    'last_name', 'status', 'role', 'title', 'employee_id',
    'auth_amount', 'auth_amount_currency',
)


class PersonCreateSerializer(serializers.ModelSerializer):
    
    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = ('id', 'username', 'password', 'role',)

    def create(self, validated_data):
        person = Person.objects.create_user(**validated_data)
        person.groups.add(person.role.group)
        return person


class PersonListSerializer(serializers.ModelSerializer):

    role = RoleSerializer(read_only=True)
    status = PersonStatusSerializer(read_only=True)

    class Meta:
        model = Person
        fields = PERSON_FIELDS


class PersonUpdateSerializer(serializers.ModelSerializer):
    '''
    Currently, you can Add/Update PhoneNumber's when Updating a Person, 
    but, you cannot delete PhoneNumber's Yet.
    '''
    phone_numbers = PhoneNumberSerializer(many=True)
    addresses = AddressSerializer(many=True)
    emails = EmailSerializer(many=True)

    class Meta:
        model = Person
        fields = PERSON_FIELDS + ('emails', 'phone_numbers', 'addresses',)

    def update(self, instance, validated_data):
        phone_numbers = validated_data.pop('phone_numbers', [])
        addresses = validated_data.pop('addresses', [])
        emails = validated_data.pop('emails', [])
        # Update Person
        instance = create.update_model(instance, validated_data)
        # Create/Update PhoneNumbers
        for ph in phone_numbers:
            try:
                phone = PhoneNumber.objects.get(id=ph['id'])
                create.update_model(phone, ph)
            except PhoneNumber.DoesNotExist:
                PhoneNumber.objects.create(person=instance, **ph)
        return instance


### PASSWORD ###

class PasswordSerializer(serializers.Serializer):
    '''
    TODO: 
    this will be a route for Password and the main Update will be separate
    '''
    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = ('password',)

        def update(self, instance, validated_data):
            password = validated_data.pop('password')
            instance.set_password(password)
            instance.save()
            update_session_auth_hash(self.context['request'], instance)
            return super(PasswordSerializer, self).update(instance, validated_data)
    
