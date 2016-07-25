from django.dispatch import receiver
from django.db.models.signals import post_save

from routing.tasks import process_ticket
from ticket.models import Ticket, TICKET_STATUS_NEW


@receiver(post_save, sender=Ticket)
def process_ticket_post_save(sender, instance=None, created=False, **kwargs):
    """Post-save hook to process assignments"""
    if instance.status.name == TICKET_STATUS_NEW and not instance.assignee:
        process_ticket(instance.location.location_level.tenant.id,
                       ticket_id=instance.id)
