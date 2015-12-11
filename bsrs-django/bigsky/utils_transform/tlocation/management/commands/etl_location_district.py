from django.core.management.base import BaseCommand

from contact.models import Email, PhoneNumber, Address
from location.models import Location, LocationLevel
from utils_transform.tlocation.models import LocationDistrict

import logging
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'LocationDistrict migrate script'

    def handle(self, *args, **options):
        location_level = LocationLevel.objects.get(name='district')
        regions = Location.objects.filter(location_level__name='region')

        for x in LocationDistrict.objects.all():
            instance = Location.objects.create(location_level=location_level, name=x.name,
                                               number=x.number)

            # PhoneNumbers
            if x.telephone:
                PhoneNumber.objects.create(content_object=instance,
                    object_id=instance.id, number=x.telephone)
            if x.carphone:
                PhoneNumber.objects.create(content_object=instance,
                    object_id=instance.id, number=x.carphone)
            if x.fax:
                PhoneNumber.objects.create(content_object=instance,
                    object_id=instance.id, number=x.fax)

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

            # JOIN Region to District
            try:
                region = regions.objects.get(number=x.regionnumber)
            except Location.DoesNotExist as e:
                logger.debug(e)
            else:
                region.children.add(instance)
