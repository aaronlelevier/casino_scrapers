from django.shortcuts import render, get_object_or_404

from ticket.models import Ticket, TicketActivityType


def ticket_activities(request, pk):
    ticket = get_object_or_404(Ticket, pk=pk)
    context = {'ticket': ticket}
    return render(request, 'email/test/base.html', context)
