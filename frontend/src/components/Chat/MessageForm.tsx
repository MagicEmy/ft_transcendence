import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { ChatContext } from "../../context/ChatContext";
import "./MessageForm.css";
import { MessageRoomDto, UserDto } from "../../types/chat.dto";
import useStorage from "./../../hooks/useStorage";


function MessageForm() {
  const [userIdStorage] = useStorage<string>('userId', '');
  const [userNameStorage] = useStorage<string>('userName', '');
  const context = useContext(ChatContext);
  const [message, setMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (context && context.messages) {
      scrollToBottom();
    }
  }, [context, context?.messages]);

  if (!context) return null;
  const {
    socket,
    currentRoom,
    setMessages,
    messages,
    directMsg,
  } = context;
  const user: UserDto = { userId: userIdStorage, userName: userNameStorage };

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  function getFormattedDate(rawdata: Date) {
    const date = new Date(rawdata);
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();

    month = month.length > 1 ? month : "0" + month;
    let day = date.getDate().toString();

    day = day.length > 1 ? day : "0" + day;

    return month + "/" + day + "/" + year;
  }

  socket.off("chat").on("chat", (roomMessages: MessageRoomDto[]) => {
    roomMessages.forEach((messag) => {
      setMessages((oldMessages: MessageRoomDto[]) => [...oldMessages, messag]);
    });
    setMessage("");
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message || !currentRoom) return;
    const send_message = {
      roomName: currentRoom.roomName,
      user: user,
      message: message,
    };
    socket.emit("chat", send_message);
    socket.off("chat_response").on("chat_response", (messages: string) => {
      if (messages !== "Success") {
        alert(messages);
      }
    });
  }
  return (
    <>
      <div className="messages-output">
        <div style={{ width: "900px", float: "left" }}>
          {user && !directMsg && currentRoom && (
            <div className="alert alert-info">
              You are in the {currentRoom.roomName} room
            </div>
          )}
        </div>
        {user && directMsg?.userId && (
          <div className="alert alert-info conversation-info">
            <div>
              Your conversation with {directMsg.userName}{" "}
              <img
                alt="profile-pic"
                src={`/user/${directMsg.userId}/avatar`}
                className="conversation-profile-pic"
              />
            </div>
          </div>
        )}
        {!user && <div className="alert alert-danger">Please login</div>}
        {user &&
          messages.map((mes: MessageRoomDto, idx: number) => {
            let sender = mes.user;
            let message = mes.message;
            let date = getFormattedDate(mes.timesent);
            let show = true;
            mes.user.blockedUsers.forEach((userId: string) => {
              if (userId === user.userId) {
                show = false;
              }
            });
            mes.user.blockedBy.forEach((userId: string) => {
              if (userId === user.userId) {
                show = false;
              }
            });
            if (!show) {
              return null;
            }

            return (
              <div key={idx}>
                <p className="alert alert-info text-center message-date-indicator">
                  {date}
                </p>
                <div
                  className={
                    sender?.userId === user?.userId
                      ? "message"
                      : "incoming-message"
                  }
                  key={idx}
                >
                  <div className="message-inner">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        alt="profile-pic"
                        src={sender.userId ? `/user/${sender.userId}/avatar` : ""}
                        style={{
                          width: 35,
                          height: 35,
                          objectFit: "cover",
                          borderRadius: "50%",
                          marginRight: 10,
                        }}
                      />
                      <p className="message-sender">
                        {sender.userId === user.userId
                          ? "You"
                          : sender.userName}
                      </p>
                    </div>
                    <p className="message-content">{message}</p>
                    <p className="message-timestamp-left">{date}</p>
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={messageEndRef} />
      </div>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={11}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Your message"
                disabled={!user}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></Form.Control>
            </Form.Group>
          </Col>
          <Col md={1}>
            <Button
              variant="primary"
              type="submit"
              style={{ width: "100%", backgroundColor: "orange" }}
              disabled={!user}
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default MessageForm;
