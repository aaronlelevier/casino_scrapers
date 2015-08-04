# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_locationlevel_role_type'),
    ]

    operations = [
        migrations.RenameField(
            model_name='location',
            old_name='level',
            new_name='location_level',
        ),
    ]
