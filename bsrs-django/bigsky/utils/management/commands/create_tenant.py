from django.conf import settings
from django.core.management.base import BaseCommand

from location.tests.factory import create_location_levels
from tenant.tests.factory import get_or_create_tenant


class Command(BaseCommand):
    help = 'Create a Tenant with Location Levels'

    def add_arguments(self, parser):
        """
        :name: String name of Tenant to create
        """
        parser.add_argument('name', nargs='?', default=settings.DEFAULT_TENANT_COMPANY_NAME)


    def handle(self, *args, **options):
        name = options.get('name', None)
        tenant = get_or_create_tenant(name)
        create_location_levels(tenant)
