'''
Big Sky Retail Systems Framework
Person serializers

Created on Jan 16, 2015

@author: tkrier
'''
from django.contrib.auth import update_session_auth_hash
from rest_framework import serializers

import person.models as personModels
import contact.serializers as contactSerializers
import role.serializers as roleSerializers

'''
Users consist of the standard Django User model plus the ``Person`` model
    This serializer hides the relationship to ``Person`` from the client
    Special care needed when updating passwords and creating new users.
    
    Todo: we may want to create a separate action here to update password. 
        With this current implementation the password can be updated in the 
        update payload using a put, but password must be included for a put 
        update since it's required in the User model. patch can be used to 
        only update the password. Another option would be to add the password 
        change to the session api.
        
    Todo: provide additional controls over who can update a password... either
        their own or someone elses. For now if the user can update or create they
        update the password as well.
        
'''

#################
# PERSON STATUS #
#################

class PersonStatusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = personModels.PersonStatus
        fields = ('id', 'name')

        
##########
# PERSON #
##########

PERSON_BASE_FIELDS = (
    # navite User fields
    'id',
    'username',
    'first_name',
    'last_name',
    # extended User fields
    'role',
    'status',
    'title',
    'emp_number',
    'auth_amount',
    'middle_initial',
    )

class PersonSerializer(serializers.ModelSerializer):
    
#     role = serializers.PrimaryKeyRelatedField(required=False, queryset=Models.Role.objects.all())
    authamount = serializers.DecimalField(max_digits=15, decimal_places=4, required=False)
#     status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = personModels.Person
        write_only_fields = ('password',)
        fields = PERSON_BASE_FIELDS + ('password',)

    def create(self, validated_data):
        #need to use create_user to make sure password is encrypted
        newuser = personModels.Person.objects.create_user(username=validated_data.get('username'),
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


class PersonListSerializer(serializers.ModelSerializer):
    
    role_name = serializers.CharField(source='role.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = personModels.Person
        fields = PERSON_BASE_FIELDS


class PersonFullSerializer(serializers.ModelSerializer):
    
    phone_numbers = contactSerializers.PhoneNumberShortSerializer(many=True, read_only=True)
    addresses = contactSerializers.AddressShortSerializer(many=True, read_only=True)
    emails = contactSerializers.EmailShortSerializer(many=True, read_only=True)
    # role = roleSerializers.RoleSerializer(read_only=True)
    # status = PersonStatusSerializer(read_only=True)

    class Meta:
        model = personModels.Person
        fields = PERSON_BASE_FIELDS + ('accept_assign', 'phone_numbers', 'addresses', 'emails')
    
