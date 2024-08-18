import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  ListGroup,
  Row,
  OverlayTrigger,
  Tooltip,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { ChatContext } from "../../context/ChatContext";
import "./Sidebar.css";
import {
  IoWalk,
  IoPizza,
  IoVolumeMute,
  IoSad,
  IoBeer,
  IoBicycle,
  IoDiamond,
  IoLockClosed,
  IoEyeOffOutline,
  IoEyeOutline,
} from "react-icons/io5";
import DropdownButton from "react-bootstrap/DropdownButton";
import { Link } from "react-router-dom";
import "./ListGroup.css";
import {
  UserDto,
  DoWithUserDto,
  JoinRoomDto,
  RoomDto,
  LeaveRoomDto,
  RoomShowDto,
  UserShowDto,
  RoomUserDto,
  ChatUserDto,
  UpdateRoomDto,
  ChatContextType,
  Notification,
  ToDoUserRoomDto,
  ModerationType,
  RoomMessageDto,
} from "../../types/chat.dto";
import useStorage from "./../../hooks/useStorage";
import "bootstrap/dist/css/bootstrap.min.css";
import { host } from "../../utils/ApiRoutes";
import { useNavigate } from "react-router-dom";
import GameInvitation from "./GameInvitation";
import  CreateChatRoom  from "./CreateChatRoom";

function Sidebar() {
  const [userIdStorage] = useStorage<string>("userId", "");
  const [userNameStorage] = useStorage<string>("userName", "");
  const user: UserDto = { userId: userIdStorage, userName: userNameStorage };
  const {
    socket,
    setMembers,
    members,
    setRoomMembers,
    roomMembers,
    setCurrentRoom,
    currentRoom,
    setRooms,
    rooms,
    setDirectMsg,
    directMsg,
    setMyRooms,
    myRooms,
    setMessages,
    gameInvite,
    setGameInvite,
  } = useContext(ChatContext) as ChatContextType;


  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [openSection, setOpenSection] = useState<string>("rooms")
  const navigate = useNavigate();
  const [userToInvite, setUserToInvite] = useState(null);

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };

  const renderTooltip = (message: string) => (
    <Tooltip id={`tooltip-${message}`}>{message}</Tooltip>
  );

  function handleUserSelect(userId: string): void {
    setSelectedUserId(userId);
  }

  const combinedRooms = [...myRooms, ...rooms.filter(room => !myRooms.some(myRoom => myRoom.roomName === room.roomName))]
  .sort((a, b) => {
    // General room always first
    if (a.roomName === "general") return -1;
    if (b.roomName === "general") return 1;
    
    // Then sort my rooms
    const aIsMyRoom = myRooms.some(room => room.roomName === a.roomName);
    const bIsMyRoom = myRooms.some(room => room.roomName === b.roomName);
    
    if (aIsMyRoom && !bIsMyRoom) return -1;
    if (!aIsMyRoom && bIsMyRoom) return 1;
    
    // If both are my rooms or both are public, sort alphabetically
    return a.roomName.localeCompare(b.roomName);
  });

  const getRoomBackgroundColor = (room: RoomShowDto, isActive: boolean) => {
    if (isActive) {
      return '#2386a2'; // Active room color
    }
    if (myRooms.some(myRoom => myRoom.roomName === room.roomName)) {
      return '#1a5f7a'; // My room color
    }
    return '#09467f'; // Public room color
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  }

  function joinRoom(room: RoomDto) {
    let password: string | null = "";
    if (room.password) {
      password = prompt("Please Enter a password");
      if (!password) {
        return;
      }
    }
    let roomToJoin: JoinRoomDto = {
      roomName: room.roomName,
      user: user,
      password: room.password ? password : "",
    };
    socket.emit("join_room", roomToJoin);
    socket
      .off("join_chat_response")
      .on("join_chat_response", (message: string) => {
        if (message === "Success") {
          setNotifications(
            notifications.filter(
              (notification) => notification.roomName === currentRoom?.roomName
            )
          );
          setMessages([]);
          setCurrentRoom(room);
          setNotifications(
            notifications.filter(
              (notification) => notification.roomName === room.roomName
            )
          );
          setDirectMsg(null);
          showToast("Welcome in " + room.roomName);
        } else {
          return showToast(message);
        }
      });
  }

  const leaveRoom = (roomName: string) => () => {
    const leaveRoom: LeaveRoomDto = {
      roomName: roomName,
      user: user,
    };
    socket.emit("leave_room", leaveRoom);

    if (currentRoom && currentRoom.roomName === roomName) {
      joinRoom({ roomName: "general", password: false });
    }
    showToast(`You have left the room ${roomName}`);
  };

  function joinDirectRoom(member: UserDto) {
    const members: DoWithUserDto = {
      userCreator: user,
      userReceiver: {
        userId: member.userId,
        userName: member.userName,
      },
    };
    socket.emit("join_direct_room", members);
    socket
      .off("join_direct_room_response")
      .on("join_direct_room_response", (message: string) => {
        if (message.indexOf("#") === -1) {
          return showToast(message);
        }
        const room: RoomDto = {
          roomName: message,
          password: false,
        };
        setDirectMsg(member);
        setMessages([]);
        setNotifications(
          notifications.filter(
            (notification) => notification.roomName === currentRoom?.roomName
          )
        );
        setCurrentRoom(room);
        setNotifications(
          notifications.filter(
            (notification) => notification.roomName === room.roomName
          )
        );
        showToast("Welcome private chat with " + member.userName);
      });
  }


  function handleModRoomAction(userId: string, type: ModerationType) {
    if (!currentRoom) return;
    let toDoUser: ToDoUserRoomDto = {
      roomName: currentRoom.roomName,
      type: type,
      user: user,
      toDoUser: userId,
      timer: 0,
    };
    if (type === ModerationType.MUTE) {
      const seconds = prompt("Enter the number of seconds to mute the user");
      if (isNaN(Number(seconds))) {
        return showToast("Please enter a number");
      }
      toDoUser.timer = parseInt(seconds ?? "0", 10);
    }
    console.log("Sending moderate_room event with data:", toDoUser);
    socket.emit("moderate_room", toDoUser);
    socket
      .off("moderate_room_response")
      .on("moderate_room_response", (message: string) => {
        showToast(message);
      });
  }

  socket.off("moderate_room_action").on("moderate_room_action", (message: RoomMessageDto) => {
    if (message.roomName === currentRoom?.roomName) {
      if (message.message === "Kicked") {
        showToast("You have been kicked from the room");
        joinRoom({ roomName: "general", password: false });
      }
      else if (message.message === "Banned") {
        showToast("You have been banned from the room");
        joinRoom({ roomName: "general", password: false });
      }
      else {
        showToast(message.message);
      }
    }
  });

  function handleAddUser(event: React.FormEvent) {
    event.preventDefault();
    if (!currentRoom || !selectedUserId) return;
    handleModRoomAction(selectedUserId, ModerationType.ADD);
  }

  function blockUser(member: UserShowDto | ChatUserDto) {
    if (!currentRoom) return;
    const blockUser:ToDoUserRoomDto = {
      roomName: currentRoom.roomName,
      type: ModerationType.BAN,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("block_user", blockUser);
    socket
      .off("block_user_response")
      .on("block_user_response", (message: string) => {
        if (message !== "Success") {
          showToast(message);
        }
      });
  }

  function unBlockUser(member: UserShowDto | ChatUserDto) {
    if (!currentRoom) return;
    const blockUser: ToDoUserRoomDto = {
      roomName: currentRoom.roomName,
      type: ModerationType.UNBAN,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("unblock_user", blockUser);
  }
 
  function chatId(userId: string): string {
    return userId < user.userId
      ? "#" + userId + user.userId
      : "#" + user.userId + userId;
  }

  function setPassword(room: RoomShowDto, isPassword: boolean) {
    let password: string | null = "";
    if (isPassword) {
      password = prompt(`Enter the new password for the room ${room.roomName}`);
      if (!password) {
        return;
      }
    }
    const updateRoom: UpdateRoomDto = {
      user: user,
      roomName: room.roomName,
      updatePassword: true,
      newPassword: password,
      updateExclusive: room.exclusive,
    };
    socket.emit("update_room", updateRoom);
    socket
      .off("update_room_response")
      .on("update_room_response", (message: string) => {
        if (message !== "Success") {
          showToast(message);
        } else if (isPassword) {
          showToast("Room Password Updated");
        } else {
          showToast("Room Password Removed");
        }
      });
  }

  function setExclusive(room: RoomShowDto, isExclusive: boolean) {
    const updateRoom: UpdateRoomDto = {
      user: user,
      roomName: room.roomName,
      updatePassword: false,
      newPassword: "",
      updateExclusive: isExclusive,
    };
    socket.emit("update_room", updateRoom);
    socket
      .off("update_room_response")
      .on("update_room_response", (message: string) => {
        if (message !== "Success") {
          showToast(message);
        } else if (isExclusive) {
          showToast("Room set as Exclusive");
        } else {
          showToast("Room set as Public");
        }
      });
  }

  function adminDropDown(currentUser: UserShowDto, member: UserShowDto) {
    if (
      member.userId !== currentUser.userId &&
      currentUser.isAdmin &&
      !member.isOwner
    ) {
      return (
        <>
          <Dropdown.Item
            onClick={() =>
              member.isAdmin ? handleModRoomAction(member.userId, ModerationType.REMOVEADMIN) : handleModRoomAction(member.userId, ModerationType.MAKEADMIN)
            }
          >
            {member.isAdmin ? "Remove Admin" : "Make Admin"}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() =>
              member.isMuted ? handleModRoomAction(member.userId, ModerationType.UNMUTE) : handleModRoomAction(member.userId, ModerationType.MUTE)
            }
          >
            {member.isMuted ? "Unmute User" : "Mute User"}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() =>
              member.isBanned ? handleModRoomAction(member.userId, ModerationType.UNBAN) : handleModRoomAction(member.userId, ModerationType.BAN)
            }
          >
            {member.isBanned ? "Unban User" : "Ban User"}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleModRoomAction(member.userId, ModerationType.KICK)}>
            {"kick User"}
          </Dropdown.Item>
        </>
      );
    }
  }

  function ownerDropDown(room: RoomShowDto) {
    if (room.owner !== user.userId) {
      return true;
    }
    let change_password: JSX.Element | string = "";
    if (room.password) {
      change_password = (
        <Dropdown.Item onClick={() => setPassword(room, true)}>
          {"Change Password"}
        </Dropdown.Item>
      );
    }

    return (
      <Dropdown>
        <Dropdown.Toggle
          variant="Secondary"
          id="dropdown-basic"
        ></Dropdown.Toggle>
        <Dropdown.Menu className="min-width-0">
          <Dropdown.Item
            onClick={() =>
              room.exclusive
                ? setExclusive(room, false)
                : setExclusive(room, true)
            }
          >
            {room.exclusive ? "Make Public" : "Make Exclusive"}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() =>
              room.password ? setPassword(room, false) : setPassword(room, true)
            }
          >
            {room.password ? "Remove Password" : "Add Password"}
          </Dropdown.Item>
          {change_password}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  function userDropDown(member: UserShowDto | ChatUserDto) {
    if (member.userId !== user.userId) {
      let isBlock: boolean = false;
      member.userBeenBlocked.forEach((element) => {
        if (element === user.userId) {
          isBlock = true;
        }
      });
      return (
        <>
          <Dropdown.Item as={Link} to={`/profile/${member.userId}`}>
            View Profile
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => (isBlock ? unBlockUser(member) : blockUser(member))}
          >
            {isBlock ? "unblock User" : "block User"}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setUserToInvite(member)}>
            {"invite game"}
          </Dropdown.Item>
        </>
      );
    } else {
      return (
        <Dropdown.Item as={Link} to={`/profile/${user.userId}`}>
          View Profile
        </Dropdown.Item>
      );
    }
  }

  const handleInvitationSent = () => {
    setUserToInvite(null);
  };

  useEffect(() => {
    setCurrentRoom({ roomName: "general", password: false });
    socket.emit("chat_users", user);
    socket.emit("join_room", {
      roomName: "general",
      user: user,
      password: "",
    });
    socket.emit("chat_rooms", user);
    socket.emit("my_rooms", user);
    socket.emit("game", user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  socket.off("chat_users").on("chat_users", (payload: ChatUserDto[]) => {
    setMembers(payload);
  });
  socket.off("chat_rooms").on("chat_rooms", (payload: RoomShowDto[]) => {
    setRooms(payload);
  });
  socket.off("my_rooms").on("my_rooms", (payload: RoomShowDto[]) => {
    setMyRooms(payload);
  });
  socket.off("room_users").on("room_users", (payload: RoomUserDto) => {
    setRoomMembers(payload);
  });
  socket.off("notifications").on("notifications", (room: string) => {
    console.log("Notification received for room:", room);
    setNotifications((notifications) => {
      console.log("Current notifications:", notifications);
      // Check if notification for the room already exists
      const existingNotificationIndex = notifications.findIndex(
        (n) => n.roomName === room
      );
      if (existingNotificationIndex !== -1) {
        // If exists, create a new array with updated count for that notification
        return notifications.map((notification, index) => {
          if (index === existingNotificationIndex) {
            return { ...notification, count: notification.count + 1 };
          }
          return notification;
        });
      } else {
        // If not, add a new notification
        const newNotification = { roomName: room, count: 1 };
        console.log("Adding new notification:", newNotification);
        return [...notifications, newNotification];
      }
    });
  });

  if (!user) {
    return <></>;
  }

  return (
    <div className="sidebar-container">
      <div className="sidebar-section">
        <h4 className="sidebar-heading">
          Rooms
          <Button
            className="sidebar-toggle-button"
            onClick={() => toggleSection("rooms")}
          >
            {openSection === "rooms" ? <IoEyeOutline /> : <IoEyeOffOutline />}
          </Button>
        </h4>
      {openSection === "rooms" && (
        <ListGroup className="list-group">
          {combinedRooms.map((room, idx) => {
            const isMyRoom = myRooms.some(myRoom => myRoom.roomName === room.roomName);
            const isActive = room.roomName === currentRoom?.roomName;
            return (
              <ListGroup.Item
                key={idx}
                active={isActive}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: getRoomBackgroundColor(room, isActive),
                  color: '#ffffff',
                  border: 'none',
                  margin: '5px 0',
                  borderRadius: '5px',
                  padding: '10px 15px',
                  transition: 'background-color 0.3s ease',
                }}
              >
                {' '}
                <span onClick={() => joinRoom(room)} style={{ flex: 1 }}>
                  {room.roomName}
                  {isMyRoom && ' (My Room)'}
                </span>
                <span>
                  <OverlayTrigger
                    placement="top"
                    overlay={renderTooltip('Exclusive Room')}
                  >
                    <span>{room.exclusive && <IoDiamond />}</span>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={renderTooltip('Password Protected')}
                  >
                    <span>{room.password && <IoLockClosed />}</span>
                  </OverlayTrigger>
                </span>
                {!isActive && (
                  <span className="badge rounded-pill bg-primary">
                    {
                      notifications.find(
                        (notification) =>
                          notification.roomName === room.roomName,
                      )?.count
                    }
                  </span>
                )}
                {isMyRoom && (
                  <>
                    {ownerDropDown(room)}
                    {room.roomName !== 'general' && (
                      <Button
                        variant="warning"
                        onClick={leaveRoom(room.roomName)}
                        style={{
                          background: '#ffa500',
                          border: 'none',
                          borderRadius: '30px',
                          padding: '5px 15px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: '10px',
                          color: '#09467f',
                        }}
                      >
                        Leave
                      </Button>
                    )}
                  </>
                )}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
        )}
      </div>
    
      <div className="sidebar-section">
        <h4 className="sidebar-heading">
          Room Users
          <Button
            onClick={() => toggleSection("roomUsers")}
            className="sidebar-toggle-button"
          >
            {openSection === "roomUsers" ? <IoEyeOutline /> : <IoEyeOffOutline />}
          </Button>
        </h4>
        {openSection === "roomUsers" && (
          <ListGroup className="scrollable-list">
            {Object.keys(roomMembers).length !== 0 &&
              roomMembers.roomName === currentRoom?.roomName &&
              roomMembers.users.map((member) => {
              if (member.userId === user.userId && member.isAdmin) {
              return (
                <React.Fragment key={member.userId}>
                  <DropdownButton
                    id="dropdown-basic-button"
                    title={selectedUserId ? members.find(m => m.userId === selectedUserId)?.userName || "Select User" : "Select User"}
                    variant=""
                    className="d-inline-block"
                  >
                    {members.map((member) => {
                      if (member.userId !== user.userId) {
                        return (
                          <Dropdown.Item
                            key={member.userId}
                            onClick={() => handleUserSelect(member.userId)}
                          >
                            {member.userName}
                          </Dropdown.Item>
                        );
                      } else return null;
                    })}
                  </DropdownButton>
                  <Button variant="outline-dark" onClick={handleAddUser}
                    style={{
                      background: "linear-gradient(in oklab, #09467f 10%, #2386a2 90%)",
                      border: "none",
                      borderRadius: "30px",
                      padding: "5px 15px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    + Add
                  </Button>
                </React.Fragment>
              );
            } else return null;
          })}
          {Object.keys(roomMembers).length !== 0 &&
              roomMembers.roomName === currentRoom?.roomName &&
              roomMembers.users.map((member) => {
                let currentUser: UserShowDto = {} as UserShowDto;
                roomMembers.users.forEach((element) => {
                  if (element.userId === user.userId) {
                    currentUser = element;
                  }
                });
                if (!currentUser) {
                  return null;
                }
                return (
                  <ListGroup.Item key={member.userId} style={{ cursor: "pointer" }}>
                    <Row className="align-items-center">
                      <Col xs={2} className="member-status">
                        <img
                          alt="user-avatar"
                          src={`http://${host}:3001/avatar/${member.userId}`}
                          className="member-status-img"
                        />
                      </Col>
                      <Col xs={6}>
                        {member.userName}
                        {member.userId === user.userId && " (You)"}
                      </Col>
                      <Col xs={2}>
                        <OverlayTrigger
                          placement="top"
                          overlay={renderTooltip("Room Owner")}
                        >
                          <span>{member.isOwner && <IoPizza />}</span>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={renderTooltip("Admin")}
                        >
                          <span>{member.isAdmin && <IoWalk />}</span>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={renderTooltip("Muted")}
                        >
                          <span>{member.isMuted && <IoVolumeMute />}</span>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={renderTooltip("Banned")}
                        >
                          <span>{member.isBanned && <IoSad />}</span>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={renderTooltip("Online")}
                        >
                          <span>{member.online && <IoBeer />}</span>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={renderTooltip("Offline")}
                        >
                          <span>{!member.online && <IoBicycle />}</span>
                        </OverlayTrigger>
                      </Col>

                      <Col xs={2}>
                          <Dropdown className="dropdown-wrapper">
                            <Dropdown.Toggle variant="Secondary" id={`dropdown-${member.userId}`}  className="p-0">
                              ...
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-right">
                              {userDropDown(member)}
                              {adminDropDown(currentUser, member)}
                            </Dropdown.Menu>
                          </Dropdown>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )
              })
            }
          </ListGroup>
        )}
      </div>

    <div className="sidebar-section">
      <h4 className="sidebar-heading">
        Users
          <Button
            onClick={() => toggleSection("users")}
            className="sidebar-toggle-button"
          >
             {openSection === "users" ? <IoEyeOutline /> : <IoEyeOffOutline />}
          </Button>
        </h4>
        {openSection === "users" && (
          <ListGroup>
            {members.map((member) => (
              <ListGroup.Item
                key={member.userId}
                active={directMsg?.userId === member.userId}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Row>
                  <Col xs={2} className="member-status">
                    <img
                      alt="user-avatar"
                      src={`http://${host}:3001/avatar/${member.userId}`}
                      className="member-status-img"
                    />
                    {member.online === true ? (
                      <i className="fas fa-circle sidebar-online-status"></i>
                    ) : (
                      <i className="fas fa-circle sidebar-offline-status"></i>
                    )}
                  </Col>
                  <Col xs={5} onClick={() => joinDirectRoom(member)}>
                    {member.userName}
                    {member.userId === user?.userId && " (You)"}
                    {currentRoom?.roomName !== chatId(member.userId) && (
                      <span className="badge rounded-pill bg-primary">
                        {
                          notifications.find(
                            (notification) =>
                              notification.roomName === chatId(member.userId)
                          )?.count
                        }
                      </span>
                    )}
                  </Col>
                  <Col xs={4}>
                    <Dropdown className="dropdown-wrapper">
                      <Dropdown.Toggle variant="Secondary" id={`dropdown-${member.userId}`}>
                        ...
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="dropdown-menu-right">
                        {userDropDown(member)}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        <GameInvitation
          userToInvite={userToInvite} 
          onInvitationSent={handleInvitationSent} />
      </div>

      <div className="sidebar-section">
        <CreateChatRoom />
      </div>

      <ToastContainer className="p-3 sidebar-toast-container">
        <Toast
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
          style={{minWidth: "250px",}}
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
      </ToastContainer>
    </div>
  );
}
export default Sidebar;
