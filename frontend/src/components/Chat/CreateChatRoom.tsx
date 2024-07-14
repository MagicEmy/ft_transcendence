import React, { useContext, useState } from "react";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import { ChatContext } from "../../context/ChatContext";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { ChatContextType, UserDto } from "../../types/chat.dto";
import useStorage from "./../../hooks/useStorage";

function CreateChatRoom() {
  const [userIdStorage] = useStorage<string>('userId', '');
  const [userNameStorage] = useStorage<string>('userName', '');
  const user: UserDto = { userId: userIdStorage, userName: userNameStorage };
  const context = useContext(ChatContext);
  const [roomName, setRoomName] = useState("");
  const [chatType, setChatType] = useState("Public");
  const [password, setPassword] = useState("");
  const { socket } = context as ChatContextType;

  const handleChatType = (eventKey: string | null, event: Object) => {
    if (eventKey) {
      setChatType(eventKey);
    }
  };

  async function handleRoomCreation(event: React.FormEvent<HTMLFormElement>) {
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
    <div style={{ marginLeft: "-20px" }}>
      <Container>
        <h3 className="mt-5">Create a Chat Room</h3>
        <Row>
          <Col md={7} className="d-flex align-items-center justify-content-left flex-direction-column">
            <Form onSubmit={handleRoomCreation}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Chat Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter chat room name"
                  onChange={(e) => setRoomName(e.target.value)}
                  value={roomName}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Room Type</Form.Label>
                <DropdownButton
                  id="dropdown-basic-button"
                  title={chatType}
                  onSelect={handleChatType}
                  variant=""
                >
                  <Dropdown.Item href="#/action-1" eventKey="Public">
                    Public
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-2" eventKey="Exclusive">
                    Exclusive
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-3" eventKey="Password">
                    Password
                  </Dropdown.Item>
                </DropdownButton>
              </Form.Group>
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
              <Button variant="primary" type="submit">
                {"Create"}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CreateChatRoom;
