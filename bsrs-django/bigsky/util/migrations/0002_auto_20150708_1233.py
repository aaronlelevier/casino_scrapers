# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('util', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='setting',
            name='custom',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='setting',
            name='settings',
            field=models.TextField(help_text=b'JSON Dict saved as a string in DB'),
        ),
    ]
