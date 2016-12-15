from django.conf import settings
from django.core.management.base import BaseCommand

from translation.tasks import update_translations


class Command(BaseCommand):

    def handle(self, *args, **options):
        update_translations.apply_async(queue=settings.CELERY_DEFAULT_QUEUE)
