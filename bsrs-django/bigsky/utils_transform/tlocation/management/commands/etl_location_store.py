from django.conf import settings
from django.core.management.base import BaseCommand

from location.models import Location, LocationLevel, LOCATION_DISTRICT, LOCATION_STORE
from tenant.tests.factory import get_or_create_tenant
from utils_transform.tlocation.management.commands._etl_utils import (
    create_phone_numbers, create_email, create_address, join_district_to_store)
from utils_transform.tlocation.models import LocationStore


class Command(BaseCommand):
    help = 'LocationStore migrate script'

    def add_arguments(self, parser):
        """
        :name: String name of Tenant to create
        """
        parser.add_argument('name', nargs='?', default=settings.DEFAULT_TENANT_COMPANY_NAME)

    def handle(self, *args, **options):
        name = options.get('name', None)
        tenant = get_or_create_tenant(name)

        location_level = LocationLevel.objects.get(name=LOCATION_STORE, tenant=tenant)
        districts = Location.objects.filter(location_level__name=LOCATION_DISTRICT)

        for x in LocationStore.objects.all():
            instance = Location.objects.create(location_level=location_level, name=x.name,
                                               number=x.number)

            # create related contacts
            create_phone_numbers(x, instance)
            create_email(x, instance)
            create_address(x, instance)

            # JOIN Region to District
            join_district_to_store(x, instance)