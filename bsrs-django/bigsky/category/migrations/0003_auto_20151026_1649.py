# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0002_auto_20151026_1417'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ('label', 'name')},
        ),
    ]
