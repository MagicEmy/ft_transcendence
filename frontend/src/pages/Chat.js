import React, {useState } from "react";
import styled from "styled-components"
import MOCKED_MESSAGES from '../__mocks__/chatMessages';

const ChatStyle = styled.div`
	background-color: red;
	width: 100px;
	height: 400px;
	width: 100%;
	max-width: 28rem;
	padding: 2rem;
	margin: 0 auto;
	border-radius: 0.5rem;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
	background: linear-gradient(180deg, #eaba7b 0%, #ea7f28 100%);
`

const InputBox = styled.input`
	background-color: white;
	height: 100px;
	width: 100%;
`
const SendMessageButton = styled.button`
	background-color: white;
	color: violet;
	bottom: 200px; /* Adjust as needed */
	right: 900px; /* Adjust as needed */
`
;

const Chat = () => {
	const [ message, setMessage] = useState ("");
	

	const userNames = MOCKED_MESSAGES.data.map(message => message.from);
	MOCKED_MESSAGES.data.forEach(message => console.log(message.from));
	console.log(userNames)
	const sendMessage = () => {
		// socket.emit('newMessage', message)
		console.log(message);
	}
	const onInputBoxChange = (props) => {
		// console.log(props.target.value)
		setMessage(props.target.value);
	
	};
	  return (
	<>
	  <ChatStyle>
 		<InputBox type="text" onChange={onInputBoxChange} /> 
		<SendMessageButton onClick={sendMessage}>INVIA</SendMessageButton>
	  </ChatStyle>
	</>
  );
}

export default Chat;