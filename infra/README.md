
# DevCompass Infrastructure

This directory contains all the infrastructure code for the DevCompass application, including:

- Docker Compose configuration
- Kubernetes manifests
- Terraform code for AWS deployment
- Jenkins pipeline configuration
- Prometheus and Grafana setup

## Deployment Options

### 1. Docker Compose (Local Development)

To run the application locally with monitoring:

```bash
docker-compose up -d
```

Access services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

### 2. Kubernetes Deployment

Prerequisites:
- kubectl configured to your cluster
- Storage classes available for PersistentVolumeClaims

Deployment:

```bash
# Create secrets
kubectl create secret generic db-credentials --from-literal=username=devuser --from-literal=password=devpassword
kubectl create secret generic jwt-secret --from-literal=JWT_SECRET=your-jwt-secret
kubectl create secret generic grafana-credentials --from-literal=username=admin --from-literal=password=admin
kubectl create secret generic frontend-secrets --from-literal=VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Create ConfigMaps
kubectl create configmap frontend-config --from-literal=VITE_SUPABASE_URL=your-supabase-url --from-literal=VITE_APP_VERSION=1.0.0
kubectl create configmap prometheus-config --from-file=infra/prometheus/prometheus.yml
kubectl create configmap grafana-provisioning --from-file=infra/grafana/provisioning/
kubectl create configmap grafana-dashboards --from-file=infra/grafana/dashboards/
kubectl create configmap postgres-init-script --from-file=backend/src/db/init.sql

# Apply Kubernetes manifests
kubectl apply -f infra/kubernetes/
```

### 3. AWS Deployment with Terraform

Prerequisites:
- Terraform installed
- AWS CLI configured with appropriate permissions

Deployment:

```bash
cd infra/terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

This will deploy:
- VPC with public and private subnets
- Jenkins server for CI/CD
- Monitoring server with Prometheus and Grafana
- Security groups, IAM roles, and other necessary resources
