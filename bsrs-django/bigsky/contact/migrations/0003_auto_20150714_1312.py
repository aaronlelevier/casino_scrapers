# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0002_auto_20150713_1727'),
    ]

    operations = [
        migrations.AddField(
            model_name='address',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 14, 20, 12, 0, 947930, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='address',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='address',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 14, 20, 12, 5, 811884, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='email',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 14, 20, 12, 7, 371835, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='email',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='email',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 14, 20, 12, 9, 755753, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='phonenumber',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 14, 20, 12, 11, 323687, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='phonenumber',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='phonenumber',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 14, 20, 12, 13, 19597, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='address',
            name='type',
            field=models.ForeignKey(to='contact.AddressType'),
        ),
        migrations.AlterField(
            model_name='email',
            name='type',
            field=models.ForeignKey(to='contact.EmailType'),
        ),
        migrations.AlterField(
            model_name='phonenumber',
            name='type',
            field=models.ForeignKey(to='contact.PhoneNumberType'),
        ),
    ]
