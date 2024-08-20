import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../../components/Chat/Sidebar";
import MessageForm from "../../components/Chat/MessageForm";
import { ChatProvider } from "../../context/ChatContext";

const Chat: React.FC = () => {
  return (
    <ChatProvider>
      <Container fluid>
        <Row>
          <Col md={4}>
            <Sidebar />
          </Col>
          <Col md={8}>
            <MessageForm />
          </Col>
        </Row>
      </Container>
    </ChatProvider>
  );
}

export default Chat;
