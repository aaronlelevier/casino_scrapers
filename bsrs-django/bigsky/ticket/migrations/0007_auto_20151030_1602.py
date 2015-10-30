# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0006_auto_20151030_1531'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='attachments',
            field=models.ManyToManyField(to='generic.Attachment', related_name='tickets', blank=True),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='priority',
            field=models.ForeignKey(to='ticket.TicketPriority', blank=True),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='status',
            field=models.ForeignKey(to='ticket.TicketStatus', blank=True),
        ),
    ]
