# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0007_auto_20151030_1602'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='priority',
            field=models.ForeignKey(null=True, to='ticket.TicketPriority', blank=True),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='status',
            field=models.ForeignKey(null=True, to='ticket.TicketStatus', blank=True),
        ),
    ]
