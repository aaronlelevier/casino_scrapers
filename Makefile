# setting prefix attached to images
PROJECT_NAME ?= bsrs
ORG_NAME ?= snewcomer
REPO_NAME ?= bsrs

# file location (:= evaluates other var references on right and removing all other refs to variables of the same name)
DEV_COMPOSE_FILE := docker/dev/docker-compose.yml
REL_COMPOSE_FILE := docker/release/docker-compose.yml

# docker compose project names
REL_PROJECT := $(PROJECT_NAME)$(BUILD_ID)
DEV_PROJECT := $(REL_PROJECT)dev

# Application service name - must match docker compose release specification application service name
APP_SERVICE_NAME := app

# Build tags
BUILD_TAG_EXPRESSION ?= date -u +%Y%m%d%H%M%S

BUILD_EXPRESSION := $(shell $(BUILD_TAG_EXPRESSION))

# Build tag - defaults to BUILD_EXPRESSION if not defined
BUILD_TAG ?= $(BUILD_TAG_EXPRESSION)


# check and inspect logic: 1 - project name, 2 - docker compose file, 3 - name of service and get id
INSPECT := $$(docker-compose -p $$1 -f $$2 ps -q $$3 | xargs -I ARGS docker inspect -f "{{ .State.ExitCode }}" ARGS)
CHECK := @bash -c '\
	if [[ $(INSPECT) -ne 0 ]]; \
	then exit $(INSPECT); fi' VALUE

DOCKER_REGISTRY ?= docker.io
DOCKER_REGISTRY_AUTH ?= 

.PHONY: test build release clean tag login logout publish

# @ symbol
test:
	${INFO} "Create cache volume (never destroyed)..."
	@ docker volume create --name cache
	${INFO} "Pulling images"
	@ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) pull
	${INFO} "Building images"
	# @ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) build django
	# should be a pull once get on docker hub
	# @ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) build --pull django
	${INFO} "Ensuring database is ready"
	# @ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) run --rm agent
	${INFO} "Running tests..."
	@ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) up django
	@ docker cp $$(docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) ps -q django):/reports/. reports
	${CHECK} $(DEV_PROJECT) $(DEV_COMPOSE_FILE) django
	${INFO} "Tests complete"

build:
	${INFO} "Creating builder image..."
	@ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) build builder
	${INFO} "Building application artifacts"
	@ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) up builder
	${CHECK} $(DEV_PROJECT) $(DEV_COMPOSE_FILE) builder
	${INFO} "Copying artifacts to target folder"
	@ docker cp $$(docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) ps -q builder):/wheelhouse/. target
	${INFO} "Build complete"


# build images that are stored in cache.  Pull command so to ensure latest image is on host; otherwise would use cache image
release:
	${INFO} "Pulling images..."
	# @ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) pull test
	${INFO} "Building Release images..."
	@ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) build app
	@ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) build --pull nginx
	${INFO} "Ensuring database is ready"
	# @ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) run --rm agent
	${INFO} "Collecting static files"
	@ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) run --rm app manage.py collectstatic --noinput
	${INFO} "Migrating project"
	@ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) run --rm app manage.py migrate --noinput
	# still need a release test
	# ${CHECK} $(REL_PROJECT) $(REL_COMPOSE_FILE) test
	${INFO} "Selenium Tests complete"

clean:
	${INFO} "Destroying development environ... (services, volumes networks destroyed)"
	@ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) down -v
	${INFO} "Destroying release environ..."
	@ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) down -v
	# xargs built in command line utility that executes command lines from stnd input
	${INFO} "Removing dangling images"
	docker images -q -f dangling=true -f label=application=$(REPO_NAME) | xargs -I ARGS docker rmi -f ARGS
	${INFO} "Clean complete"

tag:
	${INFO} "Tagging release image with tags $(TAG_ARGS)..."
	@ $(foreach tag,$(TAG_ARGS), docker tag $(IMAGE_ID) $(DOCKER_REGISTRY)/$(ORG_NAME)/$(REPO_NAME):$(tag);)
	${INFO} "Tagging complete"

buildtag:
	${INFO} "Tagging release image with suffix $(BUILD_TAG) and build tags $(BUILDTAG_ARGS)..."
	@ $(foreach tag,$(TAG_ARGS), docker tag $(IMAGE_ID) $(DOCKER_REGISTRY)/$(ORG_NAME)/$(REPO_NAME):$(tag).$(BUILD_TAG);)
	${INFO} "Tagging complete"

login:
	${INFO} "Loggin in to Docker registry $$DOCKER_REGISTRY..."
	@ docker login -u $$DOCKER_USER -p $$DOCKER_PASSWORD -e $$DOCKER_EMAIL $(DOCKER_REGISTRY_AUTH)
	${INFO} "Logged in to Docker registry $$DOCKER_REGISTRY"

logout:
	${INFO} "Logging out to Docker registry $$DOCKER_REGISTRY..."
	@ docker logout
	${INFO} "Logged out to Docker registry $$DOCKER_REGISTRY"

publish:
	${INFO} "Publishing release image $(IMAGE_ID) to $(DOCKER_REGISTRY)/$(ORG_NAME)/$(REPO_NAME)..."
	@ $(foreach tag, $(shell echo $(REPO_EXPR)), docker push $(tag);)
	${IFNO} "Publish complete"

# Cosmetics
YELLOW := "\e[1;33m"
NC := "\e[0m"

# Shell functions.  VALUE is placeholder value for string args above. @ avoids printing literal command to stdout and only prints result
INFO := @bash -c '\
	printf $(YELLOW); \
	echo "=> $$1"; \
	printf $(NC)' VALUE


# RELEASE ENVIRONMENT

# Get container id of application service container
APP_CONTAINER_ID := $$(docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) ps -q $(APP_SERVICE_NAME))

# Get image id of application service
IMAGE_ID := $$(docker inspect -f '{{ .Image }}' $(APP_CONTAINER_ID))

REPO_EXPR := $$(docker inspect -f '{{range .RepoTags}}{{.}} {{end}}' $(IMAGE_ID) | grep -oh "$(REPO_FILTER)" | xargs)

# Extract buildtag args
ifeq (buildtag,$(firstword $(MAKECMDGOALS)))
	BUILDTAG_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
	ifeq ($(BUILDTAG_ARGS),)
		$(error You must specify a build tag)
	endif
	$(eval $(BUILDTAG_ARGS):;@:)
endif

# make tag 0.1 latest....then $(MAKECMDGOALS) = tag 0.1 latest; $(firstword $(MAKECMDGOALS)) == tag
ifeq (tag,$(firstword $(MAKECMDGOALS)))
	TAG_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
	ifeq ($(TAG_ARGS),)
		$(error You must specify a tag)
	endif
	$(eval $(TAG_ARGS):;@:)
endif

