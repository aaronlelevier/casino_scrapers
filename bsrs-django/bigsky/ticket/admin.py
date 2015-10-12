from django.contrib import admin

from ticket import models


@admin.register(models.Ticket)
class TicketAdmin(admin.ModelAdmin):
    pass