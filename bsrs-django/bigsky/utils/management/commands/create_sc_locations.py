from django.core.management.base import BaseCommand

from location.models import Location
from sc.etl import LocationEtlAdapter


class Command(BaseCommand):
    help = 'creates Locations in SC'

    def handle(self, *args, **options):
        for location in Location.objects.all():
            LocationEtlAdapter(location).post()
