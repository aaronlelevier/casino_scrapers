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


class NestedContactSerializerMixin(object):

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
