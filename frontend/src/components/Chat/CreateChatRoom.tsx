import React, { useState } from "react";
import { Form, Button, Dropdown } from "react-bootstrap";
import { useChat } from "../../context/ChatContext";
import {  UserDto } from "../../types/chat.dto";
import useStorage from "./../../hooks/useStorage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CreateChatRoom.css"; // We'll create this CSS file for custom styles

function CreateChatRoom() {
  const [userIdStorage] = useStorage<string>("userId", "");
  const [userNameStorage] = useStorage<string>("userName", "");
  const user: UserDto = { userId: userIdStorage, userName: userNameStorage };
  const [roomName, setRoomName] = useState("");
  const [chatType, setChatType] = useState("Public");
  const [password, setPassword] = useState("");
  const { socket } = useChat();

  const handleChatType = (eventKey: string | null) => {
    if (eventKey) {
      setChatType(eventKey);
    }
  };

  async function handleRoomCreation(event: React.FormEvent<HTMLFormElement>) {
    if(!socket) return;
    event.preventDefault();
    socket.emit("create_room", {
      roomName: roomName,
      user: user,
      exclusive: chatType === "Exclusive",
      password: password,
    });
    // Clear state
    setChatType("Public");
    setRoomName("");
    setPassword("");
  }

  return (
    <div className="create-chat-room">
      <h5 className="mb-3">Create a Chat Room</h5>
      <Form onSubmit={handleRoomCreation}>
        <div className="d-flex align-items-center mb-3">
          <Form.Label className="me-2 mb-0">Chat Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter chat room name"
            onChange={(e) => setRoomName(e.target.value)}
            value={roomName}
            required
            className="flex-grow-1"
          />
        </div>
        <div className="d-flex align-items-center mb-3">
          <Form.Label className="me-2 mb-0">Room Type</Form.Label>
          <Dropdown onSelect={handleChatType} className="flex-grow-1">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
              {chatType}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="Public">Public</Dropdown.Item>
              <Dropdown.Item eventKey="Exclusive">Exclusive</Dropdown.Item>
              <Dropdown.Item eventKey="Password">Password</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            variant="primary"
            type="submit"
            className="ms-2 create-button"
          >
            Create
          </Button>
        </div>
        {chatType === "Password" && (
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </Form.Group>
        )}
      </Form>
    </div>
  );
}

export default CreateChatRoom;

