import copy

from rest_framework import serializers

from contact.models import PhoneNumber, Address, Email
from setting.models import Setting
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
        return super(NestedContactSerializerMixin, self).update(instance, validated_data)


class RemovePasswordSerializerMixin(object):

    def to_representation(self, instance):
        data = super(RemovePasswordSerializerMixin, self).to_representation(instance)
        data.pop('password', None)
        return data


class NestedSettingUpdateMixin(object):
    """
    Needed as a Mixin b/c General, Role, and Person will need this
    custom update logic for 'settings' JsonField.
    """
    def update(self, instance, validated_data):
        settings_obj = validated_data.pop('settings', {})
        self.update_settings(instance, settings_obj)
        return super(NestedSettingUpdateMixin, self).update(instance, validated_data)

    @staticmethod
    def update_settings(instance, settings_obj):
        init_settings = copy.copy(instance.settings.settings)
        settings = copy.copy(settings_obj.get('settings', {}))

        for k,v in settings.items():
            init_settings[k]['value'] = v

        # retrieve a current DB copy of the instance in order to
        # get the unaltered Setting related object.
        klass = instance.__class__
        i = klass.objects.get(id=instance.id)

        setting_instance = i.settings
        setting_instance.settings = settings
        setting_instance.save()


class NestedSettingsToRepresentationMixin(object):
    """
    Replace settings on Model w/ inherited settings.
    
    Ex: GeneralSettings > RoleSettings = CombinedSettings
    """
    def to_representation(self, instance):
        data = super(NestedSettingsToRepresentationMixin, self).to_representation(instance)
        if instance.settings:
            data['settings'] = instance.combined_settings()
        return data


### Fields

class UpperCaseSerializerField(serializers.CharField):

    def __init__(self, *args, **kwargs):
        super(UpperCaseSerializerField, self).__init__(*args, **kwargs)

    def to_representation(self, value):
        value = super(UpperCaseSerializerField, self).to_representation(value)
        if value:
            return value.upper()
