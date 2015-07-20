# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0005_auto_20150720_0959'),
    ]

    operations = [
        migrations.AlterField(
            model_name='email',
            name='email',
            field=models.EmailField(max_length=255),
        ),
    ]
