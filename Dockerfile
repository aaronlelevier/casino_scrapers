FROM python:3.4

MAINTAINER Scott Newcomer

# prevent dpkg errors
ENV TERM=xterm-256color

# not using pip to install virtual env b/c operating system pkg manager at system level to ekeep application env separate
# build-essential libbz2-dev libncurses5-dev libreadline6-dev libsqlite3-dev libgdbm-dev \
# liblzma-dev libssl-dev python3-setuptools \
# libffi-dev libpq-dev libevent-dev libjpeg-dev libfreetype6-dev zlib1g-dev \
# python-psycopg2 \
RUN apt-get update && \
    apt-get install -y \
    -o APT::Install-Recommend=false -o APT::Install-Suggests=false \
    python3.4-venv

RUN python3 -m venv /appenv && \
    . /appenv/bin/activate && \
    pip install pip --upgrade

# activate environment
ADD scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]

