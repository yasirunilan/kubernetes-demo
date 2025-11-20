# AWS Secrets Manager Setup Guide

This guide explains how to integrate AWS Secrets Manager with your Kubernetes cluster using the External Secrets Operator.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Helm installed
- Kubernetes cluster running (EKS, Minikube, etc.)

## Step 1: Create Secret in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
    --name online-store/postgres \
    --region us-east-1 \
    --secret-string '{
        "POSTGRES_USER":"myuser",
        "POSTGRES_PASSWORD":"mypassword",
        "POSTGRES_DB":"online-store",
        "DATABASE_URL":"postgresql://myuser:mypassword@postgres-service:5432/online-store?schema=public"
    }'
```

## Step 2: Install External Secrets Operator

```bash
# Add the helm repo
helm repo add external-secrets https://charts.external-secrets.io
helm repo update

# Install the operator
helm install external-secrets \
   external-secrets/external-secrets \
    -n external-secrets-system \
    --create-namespace
```

## Step 3: Create AWS IAM User/Role

Create an IAM user or role with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:online-store/*"
    }
  ]
}
```

## Step 4: Create Kubernetes Secret for AWS Credentials

```bash
kubectl create secret generic aws-credentials \
  --from-literal=access-key-id=YOUR_ACCESS_KEY_ID \
  --from-literal=secret-access-key=YOUR_SECRET_ACCESS_KEY \
  -n default
```

## Step 5: Update Region in secret-store.yaml

Edit `k8s/secret-store.yaml` and change the region to match your AWS region:

```yaml
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1  # Change this to your region
```

## Step 6: Deploy the Manifests

```bash
# Deploy the SecretStore
kubectl apply -f k8s/secret-store.yaml

# Deploy the ExternalSecret
kubectl apply -f k8s/external-secret.yaml
```

## Step 7: Verify

```bash
# Check if the ExternalSecret is synced
kubectl get externalsecret

# Verify the Kubernetes secret was created
kubectl get secret postgres-secret

# View the secret data (base64 encoded)
kubectl get secret postgres-secret -o yaml
```

## Local Development (Without AWS)

For local development without AWS Secrets Manager:

1. Copy the example file:
   ```bash
   cp k8s/secrets.yaml.example k8s/secrets.yaml
   ```

2. Replace the placeholder values with base64-encoded secrets:
   ```bash
   echo -n "myuser" | base64
   echo -n "mypassword" | base64
   ```

3. Apply the local secret:
   ```bash
   kubectl apply -f k8s/secrets.yaml
   ```

**Note**: `k8s/secrets.yaml` is gitignored to prevent committing sensitive data.

## Troubleshooting

### Check ExternalSecret Status
```bash
kubectl describe externalsecret postgres-external-secret
```

### Check SecretStore Status
```bash
kubectl describe secretstore aws-secretsmanager
```

### View External Secrets Operator Logs
```bash
kubectl logs -n external-secrets-system -l app.kubernetes.io/name=external-secrets
```
