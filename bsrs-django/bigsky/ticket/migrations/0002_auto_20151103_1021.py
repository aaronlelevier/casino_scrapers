# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='TicketCategory',
            new_name='TicketActivityType',
        ),
        migrations.RenameField(
            model_name='ticketactivity',
            old_name='category',
            new_name='type',
        ),
    ]
