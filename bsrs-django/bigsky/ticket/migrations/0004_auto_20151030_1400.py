# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import ticket.models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0003_auto_20151030_1358'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='number',
            field=models.IntegerField(blank=True, default=ticket.models.Ticket.no_ticket_models),
        ),
    ]
