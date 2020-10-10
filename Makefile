.DEFAULT_GOAL := help

YARN = yarn
QUASAR = quasar

##
## Update
.PHONY: update

yarn.lock: package.json ## Upgrade packages
	$(YARN) upgrade

node_modules: yarn.lock ## Install yarn packages

update: ## Upgrade packages
	$(YARN) upgrade

##
## Quasar server
.PHONY: serve

dev: ## Start Quasar server
	@$(QUASAR) dev

updev: update dev ## Upgrade node_modules and start Quasar server

##
## Help
help: ## List of all commands
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
