import copy

from rest_framework import serializers

from contact.models import PhoneNumber, Address, Email
from utils import create

class BaseCreateSerializer(serializers.ModelSerializer):
    '''
    Base Serializer for all Create Serializer. 

    Make ID a "writeable" UUIDField.

    TODO: add a default generator to generate the UUID if 
    it doesn't get sent ?.
    '''
    id = serializers.UUIDField(read_only=False)


class NestedCreateContactSerializerMixin(object):
    """
    Updates nested Contact records on a PUT request for a Model.  The Model 
    is generic here because Contacts use a Generic ForeignKey, so doesn't 
    have to be a Person.
    """
    def create(self, validated_data):
        phone_numbers = validated_data.pop('phone_numbers', [])
        addresses = validated_data.pop('addresses', [])
        emails = validated_data.pop('emails', [])
        instance = super(NestedCreateContactSerializerMixin, self).create(validated_data)
        # Update Person
        instance = create.update_model(instance, validated_data)
        # Create/Update PhoneNumbers
        for contacts, model in [(phone_numbers, PhoneNumber), (addresses, Address),
            (emails, Email)]:
            # Set of all Contact Id's for the Person.  If not in the set() sent 
            # over, will remove the FK reference from the Contact Model of that type.
            contact_ids = set()
            for c in contacts:
                c = copy.copy(c)
                contact_ids.update([c['id']])
                try:
                    contact = model.objects.get(id=c['id'])
                    # Add back ``Person`` and update Contact
                    c.update({'content_object': instance})
                    create.update_model(contact, c)
                except model.DoesNotExist:
                    new_contact = model.objects.create(content_object=instance, **c)
            # Remove FK Reference if not in Nested Contact Payload
            for m in (model.objects.filter(object_id=instance.id)
                                   .exclude(id__in=[x for x in contact_ids])):
                m.delete()
        return instance

class NestedContactSerializerMixin(object):
    """
    Updates nested Contact records on a PUT request for a Model.  The Model 
    is generic here because Contacts use a Generic ForeignKey, so doesn't 
    have to be a Person.
    """
    def update(self, instance, validated_data):
        phone_numbers = validated_data.pop('phone_numbers', [])
        addresses = validated_data.pop('addresses', [])
        emails = validated_data.pop('emails', [])
        # Update Person
        instance = create.update_model(instance, validated_data)
        # Create/Update PhoneNumbers
        for contacts, model in [(phone_numbers, PhoneNumber), (addresses, Address),
            (emails, Email)]:
            # Set of all Contact Id's for the Person.  If not in the set() sent 
            # over, will remove the FK reference from the Contact Model of that type.
            contact_ids = set()
            for c in contacts:
                c = copy.copy(c)
                contact_ids.update([c['id']])
                try:
                    contact = model.objects.get(id=c['id'])
                    # Add back ``Person`` and update Contact
                    c.update({'content_object': instance})
                    create.update_model(contact, c)
                except model.DoesNotExist:
                    new_contact = model.objects.create(content_object=instance, **c)
            # Remove FK Reference if not in Nested Contact Payload
            for m in (model.objects.filter(object_id=instance.id)
                                   .exclude(id__in=[x for x in contact_ids])):
                m.delete()
        return instance


class RemovePasswordSerializerMixin(object):

    def to_representation(self, instance):
        data = super(RemovePasswordSerializerMixin, self).to_representation(instance)
        data.pop('password', None)
        return data


class SettingSerializerMixin(object):

    def create(self, validated_data):
        validated_data = self._validate_and_update_settings(validated_data)
        return super(SettingSerializerMixin, self).create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._validate_and_update_settings(validated_data)
        return super(SettingSerializerMixin, self).update(instance, validated_data)

    def _validate_and_update_settings(self, validated_data):
        default_settings = self._get_settings_file(validated_data['name'])
        final_settings = copy.copy(default_settings)

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

    @staticmethod
    def _get_settings_file(name):
        raise NotImplementedError('`_get_settings_file()` must be implemented.')


### Fields

class UpperCaseSerializerField(serializers.CharField):

    def __init__(self, *args, **kwargs):
        super(UpperCaseSerializerField, self).__init__(*args, **kwargs)

    def to_representation(self, value):
        value = super(UpperCaseSerializerField, self).to_representation(value)
        if value:
            return value.upper()
