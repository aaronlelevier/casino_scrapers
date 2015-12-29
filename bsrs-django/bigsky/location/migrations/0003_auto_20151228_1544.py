# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_auto_20151228_1503'),
    ]

    operations = [
        migrations.RenameField(
            model_name='locationlevel',
            old_name='create_tickets',
            new_name='can_create_tickets',
        ),
    ]
