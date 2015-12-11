from django.core.management.base import BaseCommand

from location.models import Location, LocationLevel
from utils_transform.tlocation.models import LocationDistrict


class Command(BaseCommand):
    help = 'LocationDistrict migrate script'

    def handle(self, *args, **options):
        location_level = LocationLevel.objects.get(name='district')

        for x in LocationDistrict.objects.all():
            Location.objects.create(location_level=location_level, name=x.name, number=x.number)
