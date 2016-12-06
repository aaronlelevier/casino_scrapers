from django.apps import apps

from celery import shared_task


@shared_task
def process_ticket(tenant_id, ticket_id, event_key):
    Ticket = apps.get_model("ticket", "ticket")
    AutomationEvent = apps.get_model("automation", "automationevent")

    ticket = Ticket.objects.get(id=ticket_id)
    event = AutomationEvent.objects.get(key=event_key)

    _process_ticket(tenant_id, ticket, event)


def _process_ticket(tenant_id, ticket, event):
    Automation = apps.get_model("automation", "automation")
    Automation.objects.process_ticket(tenant_id, ticket, event)
