# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0005_auto_20151113_1556'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='ticketactivity',
            options={'ordering': ('-created',)},
        ),
    ]
