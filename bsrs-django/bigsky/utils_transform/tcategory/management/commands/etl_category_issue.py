from django.conf import settings
from django.core.management.base import BaseCommand

from tenant.tests.factory import get_or_create_tenant
from utils_transform.tcategory.management.commands._etl_utils import (
    run_category_issue_migrations,)


class Command(BaseCommand):
    help = 'Create Issue Categories'

    def add_arguments(self, parser):
        """
        :name: String name of Tenant to create
        """
        parser.add_argument('name', nargs='?', default=settings.DEFAULT_TENANT_COMPANY_NAME)

    def handle(self, *args, **options):
        name = options.get('name', None)
        tenant = get_or_create_tenant(name)

        run_category_issue_migrations(tenant)
