# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0004_categorystatus'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='category',
            name='status',
        ),
    ]
