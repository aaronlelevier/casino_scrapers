# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='person',
            name='status',
            field=models.ForeignKey(to='person.PersonStatus', blank=True),
        ),
        migrations.AlterField(
            model_name='personstatus',
            name='description',
            field=models.CharField(default=b'active', max_length=100, choices=[(b'active', b'active'), (b'two', b'two')]),
        ),
    ]
