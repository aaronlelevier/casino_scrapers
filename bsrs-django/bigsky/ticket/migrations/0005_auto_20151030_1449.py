# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('generic', '0002_auto_20151029_1621'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ticket', '0004_auto_20151030_1400'),
    ]

    operations = [
        migrations.CreateModel(
            name='TicketActivity',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('comment', models.CharField(max_length=1000, null=True, blank=True)),
                ('attachments', models.ManyToManyField(related_name='ticket_activities', to='generic.Attachment')),
            ],
        ),
        migrations.CreateModel(
            name='TicketCategory',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('weight', models.PositiveIntegerField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterField(
            model_name='ticket',
            name='request',
            field=models.CharField(max_length=1000, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='ticketactivity',
            name='category',
            field=models.ForeignKey(null=True, to='ticket.TicketCategory', blank=True),
        ),
        migrations.AddField(
            model_name='ticketactivity',
            name='person',
            field=models.ForeignKey(help_text='Person who did the TicketActivity', to=settings.AUTH_USER_MODEL, related_name='ticket_activities'),
        ),
        migrations.AddField(
            model_name='ticketactivity',
            name='ticket',
            field=models.ForeignKey(related_name='activities', to='ticket.Ticket'),
        ),
    ]
