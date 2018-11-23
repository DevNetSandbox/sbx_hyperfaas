package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	pb "./protocol"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
)

const (
	recognitionServer = "vehicle-license-plate-recognition.hyperfaas.svc.cluster.local:5000"
)

type request struct {
	Image []byte `json:"image"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		handleError(w, err)
		return
	}

	success(w, req.Image)
	return



	file, _, err := r.FormFile("image")
	if err != nil {
		handleError(w, err)
		return
	}
	defer file.Close()

	conn, err := grpc.Dial(recognitionServer, grpc.WithInsecure())

	if err != nil {
		handleError(w, err)
		return
	}
	defer conn.Close()

	c := pb.NewRecognizerClient(conn)

	imageBytes, err := ioutil.ReadAll(file)

	if err != nil {
		handleError(w, err)
		return
	}
	defer r.Body.Close()

	result, err := c.RecognizeImage(context.Background(), &pb.RecognitionRequest{
		RequestID: "some-request-id",
		Image:     imageBytes})

	if err != nil {
		handleError(w, err)
		return
	}

	resultJSON, err := json.Marshal(result)

	if err != nil {
		handleError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(resultJSON)
}

func handleError(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte(err.Error()))
}

func success(w http.ResponseWriter, bts []byte) {
	w.WriteHeader(http.StatusOK)
	w.Write(bts)
}