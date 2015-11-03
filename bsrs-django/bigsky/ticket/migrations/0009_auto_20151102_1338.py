# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0008_auto_20151030_1718'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='ticketpriority',
            options={'verbose_name_plural': 'Ticket Priorities'},
        ),
        migrations.AlterModelOptions(
            name='ticketstatus',
            options={'verbose_name_plural': 'Ticket Statuses'},
        ),
    ]
