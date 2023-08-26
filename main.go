package main

import (
	"video-chat-app/server"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	server.AllRooms.Init()

	router.LoadHTMLGlob("client/*.html")

	router.Static("/static", "client/static/")

	router.GET("/", server.GetHomePage)
	router.GET("/create", server.CreateRoomRequestHandler)
	router.GET("/join", server.JoinRoomRequestHandler)
	router.POST("/joinroom", server.JoinRoomHandler)
	router.GET("/close", server.CloseRoomRequestHandler)

	router.Run(":3443")
}
