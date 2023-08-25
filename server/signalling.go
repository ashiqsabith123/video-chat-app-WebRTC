package server

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var AllRooms RoomMap

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func GetHomePage(c *gin.Context) {
	c.HTML(200, "index.html", nil)
}

func JoinRoomHandler(c *gin.Context) {
	roomID := c.PostForm("roomID")

	c.HTML(200, "joinchat.html", gin.H{
		"roomID": roomID,
	})

}

func CreateRoomRequestHandler(c *gin.Context) {
	roomID := AllRooms.CreateRoom()

	c.HTML(200, "newchat.html", gin.H{
		"roomID": roomID,
	})
}

type broadcastMsg struct {
	Message map[string]interface{}
	RoomID  string
	Client  *websocket.Conn
}

var broadcast = make(chan broadcastMsg)

func broadcaster() {
	for {
		msg := <-broadcast

		for _, client := range AllRooms.Map[msg.RoomID] {
			if client.Conn != msg.Client {
				err := client.Conn.WriteJSON(msg.Message)

				if err != nil {
					fmt.Println(err)
					client.Conn.Close()
				}
			}
		}
	}
}

func JoinRoomRequestHandler(c *gin.Context) {

	roomID := c.Query("roomID")

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Fatal("Web Socket Upgrade Error", err)

	}

	fmt.Println("roomId", roomID)

	AllRooms.InsertIntoRoom(roomID, false, ws)

	go broadcaster()

	for {
		var msg broadcastMsg

		err = ws.ReadJSON(&msg.Message)

		if err != nil {
			fmt.Println("error while reading msg", err)
			return
		}

		msg.Client = ws
		msg.RoomID = roomID

		broadcast <- msg
	}

}
