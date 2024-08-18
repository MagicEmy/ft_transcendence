import { ChangeName } from '../../components/ChangeName';
import { ChangeAvatar } from '../../components/ChangeAvatar';
import { TwoFaEnable } from '../../components/Tfa/TwoFaEnable';
import { useUpdateStatus } from '../../hooks';
import pongaris from '../../assets/DataSunBig.png';

import './Settings.css';

const Settings = () => {
  useUpdateStatus();

  return (
    <div className="main">
      <img
        src={pongaris}
        alt="Landscapes of Pongaris"
        style={{
          opacity: 0.2,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      />
      <h1 className="title">Settings</h1>
      <div className="settings">
        <div className="flex">
          <ChangeAvatar />
          <ChangeName />
          <TwoFaEnable />
        </div>
      </div>
    </div>
  );
};

export default Settings;
