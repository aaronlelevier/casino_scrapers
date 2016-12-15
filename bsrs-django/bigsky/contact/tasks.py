from django.apps import apps

from celery import shared_task

from contact.models import Email, PhoneNumber
from ticket.models import Ticket


@shared_task
def process_send_email(ticket_id, action_id, event):
    ticket = Ticket.objects.get(id=ticket_id)
    AutomationAction = apps.get_model("automation", "automationaction")
    action = AutomationAction.objects.get(id=action_id)

    Email.objects.process_send_email(ticket, action, event)


@shared_task
def process_send_sms(ticket_id, action_id, event):
    ticket = Ticket.objects.get(id=ticket_id)
    AutomationAction = apps.get_model("automation", "automationaction")
    action = AutomationAction.objects.get(id=action_id)

    PhoneNumber.objects.process_send_sms(ticket, action, event)
