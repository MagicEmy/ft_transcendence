class GameMenu
{
	public name:	string;
	public flag:	string;
	public up:	GameMenu | null;
	public down:	GameMenu | null;
	public left:	GameMenu | null;
	public right:	GameMenu | null;

	public constructor(name: string, flag: string)
	{
		this.name = name;
		this.flag = flag;
		this.up = null;
		this.down = null;
		this.left = null;
		this.right = null;
	}
}

export default GameMenu
