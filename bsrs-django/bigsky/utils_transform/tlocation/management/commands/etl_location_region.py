from django.core.management.base import BaseCommand

from contact.models import Email, PhoneNumber, PhoneNumberType, Address
from location.models import Location, LocationLevel
from utils_transform.tlocation.management.commands._etl_utils import (
    create_phone_numbers, create_email, create_address)
from utils_transform.tlocation.models import LocationRegion


class Command(BaseCommand):
    help = 'LocationRegion migrate script'

    def handle(self, *args, **options):
        location_level = LocationLevel.objects.get(name='region')

        for x in LocationRegion.objects.all():
            instance = Location.objects.create(location_level=location_level,
                name=x.name, number=x.number)

            # create related contacts
            create_phone_numbers(x, instance)
            create_email(x, instance)
            create_address(x, instance)
