package server

import (
	"encoding/json"
	"net/http"
	"io/ioutil"
	"os"
	"fmt"

	"time"
)

// Module struct which contains
// an array of users
type Modules struct {
    Modules []Module `json:"module"`
}

// Module struct which contains a Provider, name and etc
type Module struct {
    Provider   string `json:"provider"`
    Name   string `json:"name"`
	Location    string    `json:"location"`
	Features    string    `json:"features"`
	Latestrelease    string    `json:"latestrelease"`
	Category    string    `json:"category"`
}

type ModulesProvision struct {
	ReferenceName    string    `json:"referencename"`
	Date    string    `json:"date"`
	Account    string    `json:"account"`
	Cluster    string    `json:"cluster"`
	Modules []Module `json:"module"`
}

func (s *Server) CloudModulesEndpointHandler(w http.ResponseWriter, r *http.Request) {

	var fileName = fmt.Sprint(os.Getenv("PROVISIONER_LOC_MODULES"), "cloud-modules.json");

	jsonFile, err := os.Open(fileName)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Successfully Opened cloud-modules.json")
	// defer the closing of our jsonFile so that we can parse it later on
	defer jsonFile.Close()
  
	byteValue, _ := ioutil.ReadAll(jsonFile)
	var modules Modules
	json.Unmarshal(byteValue, &modules)

	for i := 0; i < len(modules.Modules); i++ {
		fmt.Println("modules Name: " + modules.Modules[i].Name)
	}
  
	  w.Header().Add("Content-Type", "application/json")
	  w.WriteHeader(http.StatusOK)
	  e := json.NewEncoder(w)
	  e.Encode(modules)
  }

func (s *Server) ProvisionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "application/json")
	// session, err := getCloudSessions(r)
	// if err != nil {
	// 	handleError(w, http.StatusUnauthorized, "could not get session", err.Error())
	// 	// return
	// }

	var body ModulesProvision
	decoder := json.NewDecoder(r.Body)
	var err = decoder.Decode(&body)
	if err != nil {
		handleError(w, http.StatusBadRequest, "could not decode", err.Error())
		return
	}

	// if err := session.CreateAdminEmails(body.AccountID, body.Email...); err != nil {
	// 	handleError(w, http.StatusInternalServerError, "could not create", err.Error())
	// 	return
	// }
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, statusOkMessage)

	var fileName = fmt.Sprint(os.Getenv("PROVISIONER_LOC_META_DATA"), "meta_data_", time.Now().Unix(), ".json")
	fmt.Println(" fileName : " + fileName)

	file, _ := json.MarshalIndent(body, "", " ")
	_ = ioutil.WriteFile(fileName, file, 0644)
}
