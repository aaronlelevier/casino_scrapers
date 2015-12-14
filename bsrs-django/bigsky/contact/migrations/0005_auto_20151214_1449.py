# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0004_auto_20151214_1431'),
    ]

    operations = [
        migrations.AlterField(
            model_name='email',
            name='email',
            field=models.TextField(null=True, blank=True),
        ),
    ]
