package project

import (
	"encoding/json"
	"net/http"
	"strings"
)

type Handler struct {
	store *Store
}

func NewHandler(store *Store) *Handler {
	return &Handler{store: store}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /v1/projects", h.list)
	mux.HandleFunc("POST /v1/projects", h.create)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	projects, err := h.store.List(r.Context())
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"projects": projects})
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	var in CreateInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	p, err := h.store.Create(r.Context(), in)
	if err != nil {
		msg := err.Error()
		status := http.StatusInternalServerError
		if strings.Contains(msg, "required") ||
			strings.Contains(msg, "must be") ||
			strings.Contains(msg, "already exists") {
			status = http.StatusBadRequest
		}
		writeErr(w, status, msg)
		return
	}
	writeJSON(w, http.StatusCreated, p)
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeErr(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
