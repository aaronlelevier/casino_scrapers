from django.core.management.base import BaseCommand

from location.models import Location, LocationLevel
from utils_transform.tlocation.management.commands._etl_utils import (
    create_phone_numbers, create_email, create_address, join_region_to_district)
from utils_transform.tlocation.models import LocationDistrict


class Command(BaseCommand):
    help = 'LocationDistrict migrate script'

    def handle(self, *args, **options):
        location_level = LocationLevel.objects.get(name='district')

        for x in LocationDistrict.objects.all():
            instance = Location.objects.create(location_level=location_level,
                name=x.name, number=x.number)

            # create related contacts
            create_phone_numbers(x, instance)
            create_email(x, instance)
            create_address(x, instance)

            # JOIN Region to District
            join_region_to_district(x, instance)
