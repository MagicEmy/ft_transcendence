import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useChat } from "../../context/ChatContext";
import "./MessageForm.css";
import { MessageRoomDto, UserDto } from "../../types/chat.dto";
import useStorage from "./../../hooks/useStorage";
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoBowlingBallOutline } from "react-icons/io5";
import { host } from '../../utils/ApiRoutes';

function MessageForm(): JSX.Element {
  const [userIdStorage] = useStorage<string>('userId', '');
  const [userNameStorage] = useStorage<string>('userName', '');
  const { socket, currentRoom, setMessages, messages, directMsg } = useChat();
  const [locMessage, setLocMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const user: UserDto = { userId: userIdStorage, userName: userNameStorage };

  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);
  
  function scrollToBottom(): void {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  function getFormattedDate(rawdata: Date): string {
    const date: Date = new Date(rawdata);
    const year: string = date.getFullYear().toString();
    let month: string = (1 + date.getMonth()).toString();

    month = month.length > 1 ? month : "0" + month;
    let day: string = date.getDate().toString();

    day = day.length > 1 ? day : "0" + day;

    return month + "/" + day + "/" + year;
  }
  function getFormattedTime(rawdata: Date): string {
    const date: Date = new Date(rawdata);
    let hours: string = date.getHours().toString();
    let minutes: string = date.getMinutes().toString();

    hours = hours.length > 1 ? hours : "0" + hours;
    minutes = minutes.length > 1 ? minutes : "0" + minutes;

    return hours + ":" + minutes;
  }

  useEffect(() => {
    if (socket) {
      socket.on("chat", (roomMessages: MessageRoomDto[]) => {
        roomMessages.forEach((messag) => {
          setMessages((oldMessages: MessageRoomDto[]) => [...oldMessages, messag]);
        });
      });
      return () => {
        socket.off("chat");
      }
    }
  }, [socket]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!socket) return;
    event.preventDefault();
    if (!locMessage || !currentRoom) return;
    const send_message = {
      roomName: currentRoom.roomName,
      user: user,
      message: locMessage,
    };
    socket.emit("chat", send_message);
    setLocMessage("");
  }
  return (
    <>
    <div className="messages-output">
      <div style={{ width: "100%", float: "left" }}>
        {user && !directMsg && currentRoom && (
          <div className="alert alert-info">
            You are in the {currentRoom.roomName} room
          </div>
        )}
        {user && directMsg && (
          <div className="alert alert-info conversation-info">
            <div>
              Your conversation with {directMsg.userName}{" "}
              <img
                alt="profile-pic"
                src={`http://${host}:3001/avatar/${directMsg.userId}`}
                className="conversation-profile-pic"
              />
            </div>
          </div>
        )}
        {!user && <div className="alert alert-danger">Please login</div>}
      </div>
      {user &&
        messages.map((mes: MessageRoomDto, index: number) => {
          const sender = mes.user;
          const currentDate: string = getFormattedDate(mes.timesent);
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const showDate: boolean = !previousMessage || currentDate !== getFormattedDate(previousMessage.timesent);
          const time: string = getFormattedTime(mes.timesent);
          const message: string = mes.message;
          const isBlocked = sender.blockedUsers.includes(user.userId) || sender.blockedBy.includes(user.userId);
          if (isBlocked) {
            return null;
          }

          return (
            <div key={index}>
              {showDate && (
                <p className="alert alert-info text-center message-date-indicator">
                  {currentDate}
                </p>
              )}
              <div
                className={
                  sender?.userId === user?.userId
                    ? "message"
                    : "incoming-message"
                }
              >
                <div className="message-inner">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      alt="profile-pic"
                      src={sender.userId ? `http://${host}:3001/avatar/${sender.userId}` : ""}
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
                  <p className="message-timestamp-left">{time}</p>
                </div>
              </div>
            </div>
          );
        })}
      <div ref={messageEndRef} />
    </div>
    <Form onSubmit={handleSubmit}>
      <Row style={{ alignItems: 'center' }}>
        <Col md={11}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Your message"
              disabled={!user}
              value={locMessage}
              onChange={(e) => setLocMessage(e.target.value)}
            ></Form.Control>
          </Form.Group>
        </Col>
        <Col md={1}>
          <Button
            variant="primary"
            type="submit"
            style={{
              background: "linear-gradient(in oklab, #f57112 10%, #f39d60 90%)",
              border: "none",
              borderRadius: "30px",
              padding: "15px 20px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              }}
            disabled={!user}
          >
            <IoBowlingBallOutline size={15} />
          </Button>
        </Col>
      </Row>
    </Form>
  </>
);
}

export default MessageForm;
