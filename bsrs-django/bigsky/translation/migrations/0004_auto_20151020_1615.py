# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0003_auto_20151020_1531'),
    ]

    operations = [
        migrations.AlterField(
            model_name='translation',
            name='locale',
            field=models.OneToOneField(blank=True, null=True, to='translation.Locale'),
        ),
    ]
