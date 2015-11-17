# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0006_auto_20151113_1628'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticket',
            name='attachments',
        ),
    ]
