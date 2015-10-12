# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0003_auto_20151010_1458'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticketpriority',
            name='description',
        ),
        migrations.RemoveField(
            model_name='ticketstatus',
            name='description',
        ),
    ]
