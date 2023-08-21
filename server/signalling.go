package server

import "github.com/gin-gonic/gin"

var AllRooms RoomMap

func GetHomePage(c *gin.Context) {
	c.HTML(200, "index.html", nil)
}

func CreateRoomRequestHandler(c *gin.Context) {
	roomID := AllRooms.CreateRoom()

	c.HTML(200, "newchat.html", gin.H{
		"roomID": roomID,
	})
}




