'''
Big Sky Retail Systems Framework
Person serializers

Created on Jan 16, 2015

@author: tkrier
'''
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import Group

from rest_framework import serializers

from location.models import LocationLevel, Location
from person.models import PersonStatus, Person, Role
from contact.serializers import (
    PhoneNumberShortSerializer, AddressShortSerializer, EmailShortSerializer
)


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

    name = serializers.CharField(source='group.name')

    class Meta:
        model = Role
        fields = ('id', 'name',)


class PersonStatusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PersonStatus
        fields = ('id', 'name')


PERSON_BASE_FIELDS = (
    'id',
    'name', # calculated DRF field
    'title',
    'role',
    'emp_number',
    'status',
    'auth_amount',
    )

PERSON_FIELDS = (
    'username',
    'first_name',
    'middle_initial',
    'last_name',
    )

class PersonCreateSerializer(serializers.ModelSerializer):
    '''
    Only required fields.
    '''
    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = (
            'username', 'email', 'password', 'first_name', 'last_name', # user fields
            'role', 'status', 'location',    # keys
            'auth_amount', 'auth_amount_currency', # required - other
        )


PERSON_FIELDS = ('id', 'username', 'first_name', 'middle_initial',
            'last_name', 'title', 'emp_number', 'auth_amount',
            'role', 'status')

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


class PersonSerializer(PersonListSerializer):

    name = serializers.SerializerMethodField('get_full_name')

    def get_full_name(self, obj):
        return '{} {}'.format(obj.first_name, obj.last_name)

    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = PERSON_BASE_FIELDS + PERSON_FIELDS + ('password',)

    def create(self, validated_data):
        #need to use create_user to make sure password is encrypted
        newuser = Person.objects.create_user(username=validated_data.get('username'),
                                             password=validated_data.get('password'))
        
        #remove password from payload and update included fields
        if 'password' in validated_data:
            validated_data.pop('password')
        
        newuser = self.update(newuser, validated_data)
                
        return newuser

    def update(self, instance, validated_data):
        #remove password from dict so it isn't saved in the clear
        if 'password' in validated_data:
            password = validated_data.pop('password')
        else:
            password = ''

        #remove the user from the group if the role has changed
        role_changed = False
        if not instance.role:
            role_changed = True
        elif 'role' in validated_data and validated_data['role'].id != instance.role.id:
            role_changed = True
            instance.role.user_set.remove(instance)
        
        #call base class to get model fields
        super(PersonSerializer, self).update(instance, validated_data)
        
        #now add the user to the new group
        if role_changed:
            instance.role.user_set.add(instance)
        
        #check for a password change
        if password:
            instance.set_password(password)
            instance.save()
            #updates session cookie or token for current session if current user's password was updated 
            update_session_auth_hash(self.context['request'], instance)
        
        return instance


class PersonContactSerializer(PersonSerializer):
    
    phone_numbers = PhoneNumberShortSerializer(many=True, read_only=True)
    addresses = AddressShortSerializer(many=True, read_only=True)
    emails = EmailShortSerializer(many=True, read_only=True)

    class Meta:
        model = Person
        fields = PERSON_BASE_FIELDS + PERSON_FIELDS + ('accept_assign', 'phone_numbers', 'addresses', 'emails')


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
    
