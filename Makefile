# Tells to make these commands do not need any file
.PHONY: help init build start test lint upgrade snapshot snapshots publish

help: ## Display this message
	@echo "Usage: make <target>"
	@egrep '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

init: ## Initializes the project
	@yarn install && yarn run install-all
	@echo
	@echo You\'re good to go! You can start the project with \`make start\`

build: ## Build the project and output it in dist/
	@yarn run build

start: ## Run the playground with live-reloading
	@yarn run start

test: ## Run the tests
	@yarn run test

lint: ## Run eslint in the entire project
	@yarn run eslint

clean: ## Clean the project and re-install its dependencies
	@rm -rf dist node_modules playground/node_modules
	@make init

snapshot: ## Update your snapshots to match the latest code changes
	@yarn test -u

snapshots: snapshot

publish: ## Publish a new version on npm registry
	@bash -c 'npm whoami &>/dev/null || npm login'
	@yarn run release
