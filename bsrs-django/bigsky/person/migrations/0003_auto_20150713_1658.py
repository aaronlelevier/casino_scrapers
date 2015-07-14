# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150713_1422'),
    ]

    operations = [
        migrations.CreateModel(
            name='CoveringUser',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='NextApprover',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='person',
            name='ooto_end_date',
            field=models.DateField(max_length=100, null=True, verbose_name=b'Out of the Office Status End Date', blank=True),
        ),
        migrations.AddField(
            model_name='person',
            name='ooto_start_date',
            field=models.DateField(max_length=100, null=True, verbose_name=b'Out of the Office Status Start Date', blank=True),
        ),
        migrations.AddField(
            model_name='person',
            name='ooto_status',
            field=models.CharField(max_length=100, null=True, verbose_name=b'Out of the Office Status', blank=True),
        ),
        migrations.AddField(
            model_name='person',
            name='password_expiration',
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='person',
            name='password_one_time',
            field=models.CharField(max_length=255, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='personstatus',
            name='description',
            field=models.CharField(default=b'one', max_length=100, choices=[(b'one', b'one'), (b'two', b'two')]),
        ),
        migrations.AlterField(
            model_name='person',
            name='authorized_amount_currency',
            field=models.CharField(default=b'usd', max_length=25, choices=[(b'usd', b'usd'), (b'eur', b'eur'), (b'jpy', b'jpy')]),
        ),
        migrations.AddField(
            model_name='nextapprover',
            name='person',
            field=models.OneToOneField(to='person.Person'),
        ),
        migrations.AddField(
            model_name='coveringuser',
            name='person',
            field=models.OneToOneField(to='person.Person'),
        ),
    ]
