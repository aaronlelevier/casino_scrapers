# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='ticket',
            options={},
        ),
        migrations.AlterModelOptions(
            name='ticketpriority',
            options={},
        ),
        migrations.AlterModelOptions(
            name='ticketstatus',
            options={},
        ),
    ]
