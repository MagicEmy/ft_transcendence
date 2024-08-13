import { ChangeName } from "../../components/ChangeName";
import { ChangeAvatar } from "../../components/ChangeAvatar";
import { TwoFaEnable } from "../../components/Tfa/TwoFaEnable";
import { useUpdateStatus } from '../../hooks';
import "./Settings.css";

const Settings = () => {
	useUpdateStatus();

	return (
		<div className="main">
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



