# Server configuration
USER=bitnami
SERVER=18.227.24.54
REMOTE_DIR=/home/bitnami/frontend_manufacturing

# Build the project
.PHONY: build
build:
	@echo "Building Vite project..."
	npm run build

# Deploy to server using SCP
.PHONY: deploy
deploy: build
	@echo "adding the key"
	ssh-add /home/leonardo/transfer/awsFer/LightsailDefaultKey-us-east-2.pem
	@echo "Uploading dist folder to $(USER)@$(SERVER):$(REMOTE_DIR)..."

	scp -r dist $(USER)@$(SERVER):$(REMOTE_DIR)
	@echo "Deployment complete!"
