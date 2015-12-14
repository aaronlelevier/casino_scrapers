from django.core.management.base import BaseCommand

from utils_transform.tlocation.tests.factory import create_location_region


class Command(BaseCommand):
    help = 'LocationRegion migrate script'

    def handle(self, *args, **options):
        for i in range(3):
            create_location_region()
