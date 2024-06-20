import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../../components/Chat/Sidebar";
import MessageForm from "../../components/Chat/MessageForm";
import CreateChatRoom from "../../components/Chat/CreateChatRoom";

function Chat() {
  return (
    <Container>
      <Row>
        <Col md={4}>
          <Sidebar />
          <CreateChatRoom></CreateChatRoom>
        </Col>
        <Col md={8}>
          <MessageForm />
        </Col>
      </Row>
    </Container>
  );
}

export default Chat;
