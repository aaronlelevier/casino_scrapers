from django.contrib import admin

from ticket import models


@admin.register(models.TicketPriority)
class TicketPriorityAdmin(admin.ModelAdmin):
    pass


@admin.register(models.TicketStatus)
class TicketStatusAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Ticket)
class TicketAdmin(admin.ModelAdmin):
    pass
