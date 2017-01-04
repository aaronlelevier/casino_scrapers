from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand

from person.models import Person
from sc.etl import TenantEtlAdapter


class Command(BaseCommand):
    help = 'create Subscriber in SC'

    def handle(self, *args, **options):
        admin = Person.objects.get(username='admin')
        tenant = admin.role.tenant
        try:
            TenantEtlAdapter(tenant).post()
        except ValidationError:
            # Tenant already created in SC
            pass
