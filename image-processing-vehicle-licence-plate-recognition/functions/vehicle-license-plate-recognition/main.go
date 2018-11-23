package main

import (
	"encoding/json"
	"net/http"

	pb "./protocol"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
)

const (
	recognitionServer = "vehicle-license-plate-recognition.hyperfaas.svc.cluster.local:5000"
)

type request struct {
	Name string	`json:"name"`
	Image []byte `json:"image"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		handleError(w, err)
		return
	}

	conn, err := grpc.Dial(recognitionServer, grpc.WithInsecure())

	if err != nil {
		handleError(w, err)
		return
	}
	defer conn.Close()

	c := pb.NewRecognizerClient(conn)

	if err != nil {
		handleError(w, err)
		return
	}
	defer r.Body.Close()

	result, err := c.RecognizeImage(context.Background(), &pb.RecognitionRequest{
		RequestID: "some-request-id",
		Image:     req.Image})

	if err != nil {
		handleError(w, err)
		return
	}

	resultJSON, err := json.Marshal(result)

	if err != nil {
		handleError(w, err)
		return
	}
	
	out := map[string]interface{}{}
	json.Unmarshal([]byte(resultJSON), &out)

	out["name"] = req.Name

	outputJSON, _ := json.Marshal(out)

	w.Header().Set("Content-Type", "application/json")
	w.Write(outputJSON)
}

func handleError(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte(err.Error()))
}
