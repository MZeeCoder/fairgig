PORT=8000

PYTHON=python3
ifneq (,$(wildcard .venv/bin/python))
PYTHON=.venv/bin/python
endif

install:
	$(PYTHON) -m pip install -r requirements.txt


install-playwright-browser:
	$(PYTHON) -m playwright install chromium


run:
	uvicorn app.main:app --host 0.0.0.0 --port $(PORT) --reload