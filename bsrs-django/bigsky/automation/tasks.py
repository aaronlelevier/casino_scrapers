from django.apps import apps

from celery import shared_task


@shared_task
def save_ticket_ccs(ticket, people):
    ticket.cc.set([p for p in people])


@shared_task
def process_ticket(tenant_id, ticket, event):
    Automation = apps.get_model("automation", "automation")
    Automation.objects.process_ticket(tenant_id, ticket, event)
