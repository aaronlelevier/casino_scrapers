from django.core.management.base import BaseCommand

from location.models import Location, LocationLevel
from utils_transform.tlocation.models import LocationRegion


class Command(BaseCommand):
    help = 'LocationRegion migrate script'

    def handle(self, *args, **options):
        region = LocationLevel.objects.get(name='region')

        for x in LocationRegion.objects.all():
            Location.objects.create(location_level=region, name=x.name, number=x.number)
