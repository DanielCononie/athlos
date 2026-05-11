package sleep

type Sleep struct {
	ID          int    `json:"id"`
	Length      int    `json:"length"`
	StartTime   string `json:"start_time"`
	Interrupted bool   `json:"interrupted"`
	CustomerId  int    `json:"customer_id"`
	CreatedAt   string `json:"created_at"`
}
