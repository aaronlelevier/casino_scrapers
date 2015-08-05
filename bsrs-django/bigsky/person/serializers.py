import copy

from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import Group
from django.contrib.auth import update_session_auth_hash
from django.forms.models import model_to_dict

from rest_framework import serializers

from accounting.models import AuthAmount
from accounting.serializers import AuthAmountSerializer
from contact.models import PhoneNumber, Address, Email
from contact.serializers import (PhoneNumberSerializer, AddressSerializer,
    EmailSerializer, AddressSerializer)
from location.models import LocationLevel, Location
from location.serializers import LocationLevelSerializer, LocationIdNameSerializer
from person.models import PersonStatus, Person, Role
from util import create
from util.serializers import BaseCreateSerializer


### ROLE ###

class RoleSerializer(BaseCreateSerializer):

    location_level = LocationLevelSerializer(read_only=True)

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level')


class RoleIdNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = ('id', 'name',)


class RoleCreateSerializer(BaseCreateSerializer):

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
    'auth_amount',
)


class PersonCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = ('id', 'username', 'password', 'role',)

    def create(self, validated_data):
        person = Person.objects.create_user(**validated_data)
        person.groups.add(person.role.group)
        return person


class PersonListSerializer(serializers.ModelSerializer):

    role = RoleIdNameSerializer()
    status = PersonStatusSerializer()
    auth_amount = AuthAmountSerializer()

    class Meta:
        model = Person
        fields = PERSON_FIELDS


class PersonDetailSerializer(serializers.ModelSerializer):

    status = PersonStatusSerializer()
    role = RoleSerializer()
    auth_amount = AuthAmountSerializer()
    phone_numbers = PhoneNumberSerializer(many=True)
    addresses = AddressSerializer(many=True)
    emails = EmailSerializer(many=True)
    location = LocationIdNameSerializer()

    class Meta:
        model = Person
        fields = PERSON_FIELDS + ('location', 'emails', 'phone_numbers', 'addresses',)


class PersonUpdateSerializer(serializers.ModelSerializer):
    '''
    Currently, you can Add/Update PhoneNumber's when Updating a Person, 
    but, you cannot delete PhoneNumber's Yet.
    '''
    auth_amount = AuthAmountSerializer()
    phone_numbers = PhoneNumberSerializer(many=True)
    addresses = AddressSerializer(many=True)
    emails = EmailSerializer(many=True)

    class Meta:
        model = Person
        fields = PERSON_FIELDS + ('location', 'emails', 'phone_numbers', 'addresses',)

    def update(self, instance, validated_data):
        phone_numbers = validated_data.pop('phone_numbers', [])
        addresses = validated_data.pop('addresses', [])
        emails = validated_data.pop('emails', [])
        # Single Model
        auth_amount = validated_data.pop('auth_amount', '')
        create.update_or_create_single_model(auth_amount, AuthAmount)
        # if auth_amount:
        #     aa = AuthAmount.objects.get(id=auth_amount['id'])
        #     aa = create.update_model(aa, auth_amount)
            # instance['auth_amount'] = {'id': aa.id, 'amount': aa.amount, 'currency': aa.currency}

        # Update Person
        instance = create.update_model(instance, validated_data)
        # Create/Update PhoneNumbers
        for contacts, model in [(phone_numbers, PhoneNumber), (addresses, Address),
            (emails, Email)]:
            for c in contacts:
                c = copy.copy(c)
                try:
                    contact = model.objects.get(id=c['id'])
                    # Add back ``Person`` and update Contact
                    c.update({'person': instance})
                    create.update_model(contact, c)
                except model.DoesNotExist:
                    new_contact = model.objects.create(person=instance, **c)
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
    
