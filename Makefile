.PHONY: dev-local dev-host frontend frontend-host backend backend-host

frontend:
	cd front-end && npm run dev

frontend-host:
	cd front-end && npm run dev -- --host

backend:
	cd backend && ./venv/bin/uvicorn main:app --reload
backend-host:
	cd backend && ./venv/bin/uvicorn main:app --reload --host 0.0.0.0
dev-local:
	$(MAKE) -j2 frontend backend
dev-host:
	$(MAKE) -j2 frontend-host backend