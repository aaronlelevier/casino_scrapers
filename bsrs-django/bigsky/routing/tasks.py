from django.apps import apps


def process_ticket(tenant_id, ticket_id):
    """
    Use `get_model` vs. `routing.Assignment` to avoid circular import.
    """
    model = apps.get_model("routing", "assignment")
    model.objects.process_ticket(tenant_id, ticket_id)
