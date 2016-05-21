FROM base
MAINTAINER Scott Newcomer

COPY target /wheelhouse

# pip install from wheelhouose and name (bsrs) should match name in setup.py
RUN . /appenv/bin/activate && \
  pip install --no-index -f /wheelhouse bsrs && \
  rm -rf /wheelhouse
