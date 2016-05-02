from django.contrib import admin

from utils_transform.tticket import models


@admin.register(models.DominoTicket)
class DominoTicketAdmin(admin.ModelAdmin):
    pass
