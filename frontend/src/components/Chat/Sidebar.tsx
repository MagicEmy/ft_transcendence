import React, { useContext, useEffect, useState } from "react";
import { Button, Col, ListGroup, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { ChatContext } from "../../context/ChatContext";
import "./Sidebar.css";
import { IoWalk, IoPizza, IoVolumeMute, IoSad, IoBeer, IoBicycle, IoDiamond, IoLockClosed, IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import DropdownButton from "react-bootstrap/DropdownButton";
import { Link } from "react-router-dom";
import "./ListGroup.css";
import { UserDto, DoWithUserDto, JoinRoomDto, RoomDto, LeaveRoomDto, toDoUserRoomDto, RoomShowDto, UserShowDto, RoomUserDto, ChatUserDto, UpdateRoomDto, GameDto, ChatContextType, Notification } from "../../types/chat.dto";
import useStorage from "./../../hooks/useStorage";
import 'bootstrap/dist/css/bootstrap.min.css';

function Sidebar() {
  const [userIdStorage] = useStorage<string>('userId', '');
  const [userNameStorage] = useStorage<string>('userName', '');
  const user: UserDto = { userId: userIdStorage, userName: userNameStorage };
  const {
    socket,
    setMembers,
    members,
    setRoomMembers,
    roomMembers,
    setCurrentRoom,
    setRooms,
    directMsg,
    rooms,
    setDirectMsg,
    currentRoom,
    setMyRooms,
    myRooms,
    setMessages,
  } = useContext(ChatContext) as ChatContextType;

  const [addUser, setAddUser] = useState<string>("Select User");
  const [gameInvite, setGameInvite] = useState<GameDto | {}>({} as GameDto);
  const [myroomsToggle, setMyRoomsToggle] = useState<boolean>(false);
  const [roomsToggle, setRoomsToggle] = useState<boolean>(false);
  const [roomUsersToggle, setRoomUsersToggle] = useState<boolean>(false);
  const [usersToggle, setUsersToggle] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const renderTooltip = (message: string) => (
    <Tooltip id={`tooltip-${message}`}>
      {message}
    </Tooltip>
  );

  function handleAddUser(event: React.FormEvent) {
    event.preventDefault();
    if (!currentRoom)
      return;
    const newUser = {
      roomName: currentRoom.roomName,
      user: user,
      toDoUser: addUser,
      timer: 0,
    };
    socket.emit("add_user", newUser);
    socket.off("add_user_response").on("add_user_response", (messages: string) => {
      alert(messages);
    });
  }

  function handleUserSelect(event: string | null): void {
    if (event === null) {
      return;
    }
    setAddUser(event);
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
    socket.off("join_chat_response").on("join_chat_response", (message: string) => {
      if (message === "Success") {
        setNotifications(notifications.filter(notification => notification.roomName === currentRoom?.roomName));
        setMessages([]);
        setCurrentRoom(room);
        setNotifications(notifications.filter(notification => notification.roomName === room.roomName));

        alert("Welcome in " + room.roomName);
      } else {
        return alert(message);
      }
      setDirectMsg(null);
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
    alert(`You have left the room ${roomName}`);
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
          return alert(message);
        }
        const room = {
          roomName: message,
          password: false,
        };
        setDirectMsg(member);
        setMessages([]);
        setNotifications(notifications.filter(notification => notification.roomName === currentRoom?.roomName));
        setCurrentRoom(room);
        setNotifications(notifications.filter(notification => notification.roomName === room.roomName));
        alert("Welcome");
      });
  }

  function muteUser(member: UserShowDto) {
    if (!currentRoom)
      return;
    const seconds = prompt("Enter the number of seconds to mute the user");
    if (isNaN(Number(seconds))) {
      return alert("Please enter a number");
    } else {
      const muteUser: toDoUserRoomDto = {
        roomName: currentRoom.roomName,
        user: user,
        toDoUser: member.userId,
        timer: parseInt(seconds ?? "0", 10),
      };
      socket.emit("mute_user", muteUser);
    }
  }

  function unMuteUser(member: UserShowDto) {
    if (!currentRoom)
      return;
    const unmuteUser: toDoUserRoomDto = {
      roomName: currentRoom.roomName,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("unmute_user", unmuteUser);
  }

  function banUser(member: UserShowDto) {
    if (!currentRoom)
      return;
    const banUser: toDoUserRoomDto = {
      roomName: currentRoom.roomName,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("ban_user", banUser);
  }

  function unBanUser(member: UserShowDto) {
    if (!currentRoom)
      return;
    const unBanUser: toDoUserRoomDto = {
      roomName: currentRoom.roomName,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("unban_user", unBanUser);
  }

  function kickUser(member: UserShowDto) {
    if (!currentRoom)
      return;
    const banUser: toDoUserRoomDto = {
      roomName: currentRoom.roomName,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("kick_user", banUser);
    socket.off("kick_user_response").on("kick_user_response", (message: string) => {
      if (message !== "Success") {
        alert(message);
      }
      else {
        alert("User Kicked:" + member.userName);
      }
    });
  }

  function makeAdmin(member: UserShowDto) {
    if (!currentRoom)
      return;
    const makeAdmin: toDoUserRoomDto = {
      roomName: currentRoom.roomName,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("make_admin", makeAdmin);
  }

  function removeAdmin(member: UserShowDto) {
    if (!currentRoom)
      return;
    const removeAdmin: toDoUserRoomDto = {
      roomName: currentRoom.roomName,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("remove_admin", removeAdmin);
  }

  function blockUser(member: UserShowDto | ChatUserDto) {
    if (!currentRoom)
      return;
    const blockUser: toDoUserRoomDto = {
      roomName: currentRoom.roomName,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("block_user", blockUser);
    socket.off("block_user_response").on("block_user_response", (message: string) => {
      if (message !== "Success") {
        alert(message);
      }
    });
  }

  function unBlockUser(member: UserShowDto | ChatUserDto) {
    if (!currentRoom)
      return;
    const blockUser: toDoUserRoomDto = {
      roomName: currentRoom.roomName,
      user: user,
      toDoUser: member.userId,
      timer: 0,
    };
    socket.emit("unblock_user", blockUser);
  }

  function inviteGame(member: UserShowDto | ChatUserDto) {
    const inviteGame: DoWithUserDto = {
      userCreator: user,
      userReceiver: {
        userId: member.userId,
        userName: member.userName,
      },
    };
    socket.emit("invite_game", inviteGame);
    socket.off("invite_game_response").on("invite_game_response", (message: string) => {
      if (message !== "Success") {
        alert(message);
      } else {
        alert("Game Invite Sent to " + member.userName);
      }
    });
  }
  function chatId(userId: string): string {
    return userId < user.userId ? "#" + userId + user.userId : "#" + user.userId + userId;
  }

  function acceptGameInvite() {
    if ('user' in gameInvite) {

      const acceptGameInvite: DoWithUserDto = {
        userCreator: gameInvite.user,
        userReceiver: user,
      };
      socket.emit("accept_game", acceptGameInvite);
      socket.off("accept_game_response").on("accept_game_response", (message: string) => {
        if (message !== "Success") {
          alert(message);
        } else {
          alert("Game Invite from" + gameInvite.user.userName + " Accepted");
        }
      });
    }
  }

  function declineGameInvite() {
    if ('user' in gameInvite) {
      const declineGameInvite: DoWithUserDto = {
        userCreator: gameInvite.user,
        userReceiver: user,
      };
      socket.emit("decline_game", declineGameInvite);
      socket
        .off("decline_game_response")
        .on("decline_game_response", (message: string) => {
          if (message !== "Success") {
            alert(message);
          } else {
            alert("Game Invite Declined");
          }
        });
    }
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
    socket.off("update_room_response").on("update_room_response", (message: string) => {
      if (message !== "Success") {
        alert(message);
      } else if (isPassword) {
        alert("Room Password Updated");
      } else {
        alert("Room Password Removed");
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
    socket.off("update_room_response").on("update_room_response", (message: string) => {
      if (message !== "Success") {
        alert(message);
      } else if (isExclusive) {
        alert("Room set as Exclusive");
      } else {
        alert("Room set as Public");
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
              member.isAdmin ? removeAdmin(member) : makeAdmin(member)
            }
          >
            {member.isAdmin ? "Remove Admin" : "Make Admin"}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() =>
              member.isMuted ? unMuteUser(member) : muteUser(member)
            }
          >
            {member.isMuted ? "Unmute User" : "Mute User"}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() =>
              member.isBanned ? unBanUser(member) : banUser(member)
            }
          >
            {member.isBanned ? "Unban User" : "Ban User"}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => kickUser(member)}>
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
        <Dropdown.Toggle variant="Secondary" id="dropdown-basic">
        </Dropdown.Toggle>
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
              room.password
                ? setPassword(room, false)
                : setPassword(room, true)
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
          <Dropdown.Item href={"/profile"}>
            View Profile
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => (isBlock ? unBlockUser(member) : blockUser(member))}
          >
            {isBlock ? "unblock User" : "block User"}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => inviteGame(member)}>
            {"invite game"}
          </Dropdown.Item>
        </>
      );
    } else {
      return (

        <Dropdown.Item href={"/profile"}>
          View Profile
        </Dropdown.Item>
      );
    }
  }

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
  socket.off("game").on("game", (payload: GameDto) => {
    if (payload.type === "decline the game") {
      setGameInvite({}); // clear the game invite
    } else {
      setGameInvite(payload);
    }
  });

  socket.off("notifications").on("notifications", (room: string) => {
    console.log("Notification received for room:", room);
    setNotifications((notifications) => {
      console.log("Current notifications:", notifications);
      // Check if notification for the room already exists
      const existingNotificationIndex = notifications.findIndex(n => n.roomName === room);
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
    <>
      <h4 className="mt-5">Public Rooms
        {roomsToggle ? (
          <Button onClick={() => setRoomsToggle(!roomsToggle)}>
            <IoEyeOutline />
          </Button>
        ) : (
          <Button onClick={() => setRoomsToggle(!roomsToggle)}>
            <IoEyeOffOutline />
          </Button>
        )}
      </h4>{" "}
      {roomsToggle && (
        <ListGroup className="list-group">
          {rooms.map((room, idx) => (
            <ListGroup.Item
              key={idx}
              onClick={() => joinRoom(room)}
              active={room.roomName === currentRoom?.roomName}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {room.roomName} {currentRoom?.roomName !== room.roomName}
              <span>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("Exclusive Room")}
                >
                  <span>{room.exclusive && <IoDiamond />}</span>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("Password Protected")}
                >
                  <span>{room.password && <IoLockClosed />}</span>
                </OverlayTrigger>
              </span>
              {currentRoom?.roomName !== room.roomName && (<span className="badge rounded-pill bg-primary">{notifications.find(notification => notification.roomName === room.roomName)?.count}</span>)}

            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <h4 className="mt-5">My Rooms
        {myroomsToggle ? (
          <Button onClick={() => setMyRoomsToggle(!myroomsToggle)}>
            <IoEyeOutline />
          </Button>
        ) : (
          <Button onClick={() => setMyRoomsToggle(!myroomsToggle)}>
            <IoEyeOffOutline />
          </Button>
        )}
      </h4>{" "}
      {myroomsToggle && (
        <ListGroup className="list-group">
          {myRooms.map((room, idx) => (
            <ListGroup.Item
              key={idx}
              active={room.roomName === currentRoom?.roomName}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <p onClick={() => joinRoom(room)}>{room.roomName} </p>
              <span>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("Exclusive Room")}
                >
                  <span>{room.exclusive && <IoDiamond />}</span>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("Password Protected")}
                >
                  <span>{room.password && <IoLockClosed />}</span>
                </OverlayTrigger>
              </span>
              {currentRoom?.roomName !== room.roomName && (<span className="badge rounded-pill bg-primary">{notifications.find(notification => notification.roomName === room.roomName)?.count}</span>)}
              {ownerDropDown(room)}
              {room.roomName !== "general" && (
                <Button variant="warning" onClick={leaveRoom(room.roomName)}>
                  Leave Room
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <h4 className="mt-5">
        Room Users{" "}
        {roomUsersToggle ? (
          <Button onClick={() => setRoomUsersToggle(!roomUsersToggle)}>
            <IoEyeOutline />
          </Button>
        ) : (
          <Button onClick={() => setRoomUsersToggle(!roomUsersToggle)}>
            <IoEyeOffOutline />
          </Button>
        )}
        {Object.keys(roomMembers).length !== 0 &&
          roomMembers.users.map((member) => {
            if (member.userId === user.userId && member.isAdmin) {
              return (
                <>
                  <DropdownButton
                    id="dropdown-basic-button"
                    title={addUser}
                    onSelect={handleUserSelect}
                    variant=""
                    className="d-inline-block"
                  >
                    {members.map((member) => {
                      if (member.userId !== user.userId) {
                        return (
                          <Dropdown.Item
                            key={member.userId}
                            eventKey={member.userId}
                          >
                            {member.userName}
                          </Dropdown.Item>
                        );
                      }
                      else return null;
                    })

                    }
                  </DropdownButton>
                  <Button variant="outline-dark" onClick={handleAddUser}>
                    + Add
                  </Button>
                </>
              );
            }
            else return null;
          }
          )}

      </h4>
      {roomUsersToggle &&
        Object.keys(roomMembers).length !== 0 &&
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
              <Row>
                <Col xs={6}>
                  {member.userName}
                  <img
                    alt='user-avatar'
                    src={`http://${host}:3001/avatar/${member.userId}`}
                    className="member-status-img"
                  />
                  {member.userId === user.userId && " (You)"}
                </Col>
                <Col>
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

                <Col xs={3}>
                  <span className="badge rounded-pill bg-primary">
                    <Dropdown>
                      <Dropdown.Toggle variant="Secondary" id="dropdown-basic">
                        ...
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="min-width-0">
                        {userDropDown(member)}
                        {adminDropDown(currentUser, member)}
                      </Dropdown.Menu>
                    </Dropdown>
                  </span>
                </Col>
              </Row>
            </ListGroup.Item>
          );
        })}
      <h4 className="mt-5">Users
        {usersToggle ? (
          <Button onClick={() => setUsersToggle(!usersToggle)}>
            <IoEyeOutline />
          </Button>
        ) : (
          <Button onClick={() => setUsersToggle(!usersToggle)}>
            <IoEyeOffOutline />
          </Button>
        )}
      </h4>{" "}
      {usersToggle &&
        members.map((member) => (
          <ListGroup.Item
            key={member.userId}
            style={{ cursor: "pointer" }}
            active={directMsg?.userId === member?.userId}
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
                {member.online === false && " (Offline)"}
                <span className="badge rounded-pill bg-primary">{notifications.find(notification => notification.roomName === chatId(member.userId))?.count}</span>
              </Col>
              <Col xs={4}>
                <Dropdown>
                  <Dropdown.Toggle variant="Secondary" id="dropdown-basic">
                    ...
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="min-width-0">
                    {userDropDown(member)}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
          </ListGroup.Item>
        ))}
      <h2 className="mt-5">Game Invite </h2>
      {Object.keys(gameInvite).length !== 0 && "type" in gameInvite && (
        <ListGroup.Item
          key={gameInvite.user.userId}
          style={{ cursor: "pointer" }}
        >
          <Row>
            <Col xs={6}>{gameInvite.user.userName}</Col>
          </Row>
        </ListGroup.Item>
      )}
      {Object.keys(gameInvite).length !== 0 && "type" in gameInvite &&
        gameInvite.type === "invitation" && (
          <Button variant="success" onClick={acceptGameInvite}>
            Accept
          </Button>
        )}
      {Object.keys(gameInvite).length !== 0 && "type" in gameInvite && gameInvite.type === "host" && (
        <Button variant="danger" onClick={declineGameInvite}>
          Decline
        </Button>
      )}
      {Object.keys(gameInvite).length !== 0 && "type" in gameInvite &&
        gameInvite.type === "start the game" && (
          <Link to="/game" className="btn btn-info">
            Go to Game
          </Link>
        )}
    </>
  );
}
export default Sidebar;
