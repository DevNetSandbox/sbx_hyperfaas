#!/usr/bin/env bash

./hacks/check-components-start.sh

set -x

export HYPERFAAS_PROJECT_ID="admin"
export HYPERFAAS_API=http://$(kubectl get nodes -l '!node-role.kubernetes.io/master' -o go-template='{{range .items}}{{range .status.addresses}}{{if eq .type "ExternalIP"}}{{.address}}{{"\n"}}{{end}}{{end}}{{end}}' | head -1):$(kubectl get svc kong-proxy -n hyperfaas -o go-template='{{range.spec.ports}}{{if eq .name "'kong-proxy-http'"}}{{.nodePort}}{{"\n"}}{{end}}{{end}}')
export HYPERFAAS_AUTH_SERVER=http://$(kubectl get nodes -l '!node-role.kubernetes.io/master' -o go-template='{{range .items}}{{range .status.addresses}}{{if eq .type "ExternalIP"}}{{.address}}{{"\n"}}{{end}}{{end}}{{end}}' | head -1):$(kubectl get svc hyperfaas-vault -n hyperfaas -o go-template='{{range.spec.ports}}{{if eq .name "'vault-plain'"}}{{.nodePort}}{{"\n"}}{{end}}{{end}}')
export HYPERFAAS_ROOT_TOKEN=$(kubectl get secret hyperfaas-vault-unseal-keys -n hyperfaas -o jsonpath='{..vault-root}' | base64 -D)
export HYPERFAAS_CLIENT_TOKEN=$HYPERFAAS_ROOT_TOKEN
export MINIO_URL=http://$(kubectl get nodes -l '!node-role.kubernetes.io/master' -o go-template='{{range .items}}{{range .status.addresses}}{{if eq .type "ExternalIP"}}{{.address}}{{"\n"}}{{end}}{{end}}{{end}}' | head -1):$(kubectl get svc minio-service -n hyperfaas -o go-template='{{range.spec.ports}}{{if eq .name "'minio'"}}{{.nodePort}}{{"\n"}}{{end}}{{end}}')
export MONGODB_URL=http://$(kubectl get nodes -l '!node-role.kubernetes.io/master' -o go-template='{{range .items}}{{range .status.addresses}}{{if eq .type "ExternalIP"}}{{.address}}{{"\n"}}{{end}}{{end}}{{end}}' | head -1):$(kubectl get svc mongo-db -n hyperfaas -o go-template='{{range.spec.ports}}{{if eq .name "'mongodb'"}}{{.nodePort}}{{"\n"}}{{end}}{{end}}')
export MQTT_BROKER=$(kubectl get nodes -l '!node-role.kubernetes.io/master' -o go-template='{{range .items}}{{range .status.addresses}}{{if eq .type "ExternalIP"}}{{.address}}{{"\n"}}{{end}}{{end}}{{end}}' | head -1):$(kubectl get svc mqtt-broker -n hyperfaas -o go-template='{{range.spec.ports}}{{if eq .name "'mqtt'"}}{{.nodePort}}{{"\n"}}{{end}}{{end}}')
export KAFKA_URL="10.10.20.104:9092"

set +x
