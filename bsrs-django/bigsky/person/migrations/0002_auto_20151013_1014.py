# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='password_change',
            field=models.TextField(blank=True, null=True, help_text='Tuple of (datetime of PW change, old PW)'),
        ),
    ]
