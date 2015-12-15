from django.core.management.base import BaseCommand

from utils_transform.tlocation.tests.factory import (
    create_location_region, create_location_district, create_location_store)


class Command(BaseCommand):
    help = 'LocationRegion migrate script'

    def handle(self, *args, **options):
        for i in range(2):
            region = create_location_region()

        create_location_district()
        district = create_location_district(region)

        create_location_store()
        create_location_store(district)
