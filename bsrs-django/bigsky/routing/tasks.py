from routing.models import Assignment


def process_ticket(tenant_id, ticket_id):
    Assignment.objects.process_ticket(tenant_id, ticket_id)
