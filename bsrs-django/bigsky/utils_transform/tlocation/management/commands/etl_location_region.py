from django.core.management.base import BaseCommand

from contact.models import Email, PhoneNumber, PhoneNumberType, Address
from location.models import Location, LocationLevel
from utils_transform.tlocation.management.commands import (
    create_phone_numbers,)
from utils_transform.tlocation.models import LocationRegion


class Command(BaseCommand):
    help = 'LocationRegion migrate script'

    def handle(self, *args, **options):
        location_level = LocationLevel.objects.get(name='region')

        for x in LocationRegion.objects.all():
            instance = Location.objects.create(location_level=location_level,
                name=x.name, number=x.number)

            # PhoneNumbers
            create_phone_numbers(x, instance)

            # Email
            if x.email:
                Email.objects.create(content_object=instance,
                    object_id=instance.id, email=x.email)

            # Address
            address = {
                'address1': x.address1,
                'address2': x.address2,
                'city': x.city,
                'state': x.state,
                'zip': x.zip,
                'county': x.county
            }
            if any(address.values()):
                Address.objects.create(content_object=instance,
                    object_id=instance.id, **address)
