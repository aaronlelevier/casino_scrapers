from django.core.management.base import BaseCommand

from work_order.tests.factory import create_work_order, create_work_order_statuses, create_work_order_priorities


class Command(BaseCommand):

    def handle(self, *args, **options):
        create_work_order_priorities()
        create_work_order_statuses()
        create_work_order()
