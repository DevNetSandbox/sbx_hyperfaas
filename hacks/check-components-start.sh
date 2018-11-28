#!/usr/bin/env bash

command1=$(kubectl logs -n hyperfaas -l svc==sttrigger | grep "Failed to read storage trigger list" | wc -l | tr -d " ")
if [[ $command1 == "1" ]]; then
	kubectl delete pod -n hyperfaas -l svc==sttrigger
fi
