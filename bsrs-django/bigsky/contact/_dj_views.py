from django.shortcuts import render, get_object_or_404

from ticket.models import Ticket, TicketActivityType


def ticket_activities(request, pk):
    ticket = get_object_or_404(Ticket, pk=pk)

    context = {'ticket': ticket}
    for x in TicketActivityType.ALL:
        context[x.upper()] = x

    print(context)

    return render(request, 'email/ticket-activities/email.txt', context)
