'''
Big Sky Retail Systems Framework
Person serializers

Created on Jan 16, 2015

@author: tkrier
'''
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import Group
from django.contrib.auth import update_session_auth_hash
from rest_framework import serializers

from contact.models import PhoneNumber, Address, Email
from contact.serializers import (PhoneNumberShortSerializer, AddressShortSerializer,
    EmailShortSerializer,AddressShortFKSerializer, PhoneNumberShortFKSerializer,)
from location.models import LocationLevel, Location
from location.serializers import LocationLevelSerializer
from person.models import PersonStatus, Person, Role


'''
Users consist of the standard Django User model plus the ``Person`` model
This serializer hides the relationship to ``Person`` from the client
Special care needed when updating passwords and creating new users.
    
:Todo: 
    We may want to create a separate action here to update password. 
    With this current implementation the password can be updated in the 
    update payload using a put, but password must be included for a put 
    update since it's required in the User model. patch can be used to 
    only update the password. Another option would be to add the password 
    change to the session api.

:Todo: 
    Provide additional controls over who can update a password... either
    their own or someone elses. For now if the user can update or create they
    update the password as well.
    
'''

### Base ###

class RoleSerializer(serializers.ModelSerializer):

    id = serializers.UUIDField(read_only=False)
    location_level = LocationLevelSerializer(read_only=True)

    class Meta:
        model = Role
        fields = ('id', 'name', 'role_type', 'location_level')


class PersonStatusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PersonStatus
        fields = ('id', 'name')


class PersonCreateSerializer(serializers.ModelSerializer):
    "Base create fields for form wizard"

    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = (
            'id', 'username', 'password', 'role',
        )

    def create(self, validated_data):
        person = Person.objects.create_user(**validated_data)
        person.role.user_set.add(person)
        return person


PERSON_FIELDS = (
    'deleted', 'id', 'username', 'first_name', 'middle_initial',
    'last_name', 'title', 'employee_id', 'status', 'role', 
    )


class PersonNestedCreateSerializer(serializers.ModelSerializer):
    
    id = serializers.UUIDField(read_only=False)
    phone_numbers = PhoneNumberShortFKSerializer(many=True)

    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = PERSON_FIELDS  + ('password', 'phone_numbers',)

    def create(self, validated_data):
        phone_numbers = validated_data.pop('phone_numbers', [])
        person = Person.objects.create_user(**validated_data)
        for ph in phone_numbers:
            PhoneNumber.objects.create(person=person, **ph)
        return person


class PersonListSerializer(serializers.ModelSerializer):

    role = RoleSerializer(read_only=True)
    status = PersonStatusSerializer(read_only=True)

    class Meta:
        model = Person
        fields = PERSON_FIELDS


class PersonDetailSerializer(PersonListSerializer):

    phone_numbers = PhoneNumberShortSerializer(many=True, read_only=True)
    addresses = AddressShortSerializer(many=True, read_only=True)

    class Meta:
        model = Person
        fields = PERSON_FIELDS + ('phone_numbers', 'addresses',)


class PersonUpdateSerializer(serializers.ModelSerializer):

    # phone_numbers = PhoneNumberShortFKSerializer(many=True)
    # addresses = AddressShortFKSerializer(many=True)

    class Meta:
        model = Person
        # write_only_fields = ('password',)
        fields = PERSON_FIELDS # ('password',) # 'phone_numbers', 'addresses',)

    def update(self, instance, validated_data):
        # phone_numbers = validated_data.pop('phone_numbers')
        # addresses = validated_data.pop('addresses')

        # Role
        if not instance.role:
            role_changed = True
        elif 'role' in validated_data and validated_data['role'].id != instance.role.id:
            role_changed = True
            instance.role.user_set.remove(instance)
        else:
            role_changed = False

        super(PersonUpdateSerializer, self).update(instance, validated_data)

        # PhoneNumbers
        # for ph in phone_numbers:
        #     PhoneNumber.objects.create(person=person, **ph)
        # # Addresses
        # for ad in addresses:
        #     Address.objects.create(person=person, **ad)

        if role_changed:
            instance.role.user_set.add(instance)
        return instance


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
    
