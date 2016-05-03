from django.core.management.base import BaseCommand

from utils_transform.tticket.management.commands._etl_utils import (
    run_ticket_migrations,)


class Command(BaseCommand):

    def handle(self, *args, **options):
        run_ticket_migrations()
