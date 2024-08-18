export namespace GameStyle
{
	export const Base =
	{
		FONT:	"Orbitron",
		COLOR:	"rgba(123, 123, 123, 1)",
		C_FOCUS:	"rgba(255, 127, 0, 1)",
		BACKGROUND:	"rgba(23, 23, 23, 1)",
	}

	export namespace Menu
	{
		export const Header =
		{
			FONT:	Base.FONT,
			C_FONT:	Base.C_FOCUS,
			C_BODY:	"rgba(42, 42, 42, 1)",
			C_BORDER:	"rgba(192, 192, 192, 1)",
		}

		export const Body =
		{
			BACKGROUND:	"rgba(23, 23, 23, 1)",
		}

		export const Font =
		{
			BASE:	Base.FONT,
			C_BASE:	"rgba(123, 123, 123, 1)",
			C_FOCUS:	Base.C_FOCUS,
		}
	}

	export namespace Pong
	{
		export const Retro = 
		{
			BACKGROUND:	"rgba(23, 23, 23, 0.99)",
			LINES:	"rgba(123, 123, 123, 1)",
			PADDLE:	"orange",
			BALL:	"white",
		};

		export const Modern =
		{
			BACKGROUND:	"rgba(23, 23, 23, 0.99)",
			TABLE:	"rgba(23, 123, 23, 0.99)",
			LINES:	"white",
			PADDLE:	"red",
			BALL:	"yellow",
			NET:	"rgba(192, 192, 192, 0.69)",
			SHADOW:	"rgba(0, 0, 0, 0.69)",
		};

		export const HUD =
		{
			FONT:	Base.FONT,
			COLOR:	"rgba(123, 123, 123, 1)",
			BACKGROUND:	"rgba(23, 23, 23, 1)",
		};

		export const EndScreen =
		{
			BACKGROUND:	Base.BACKGROUND,
			FONT:	Base.FONT,
			COLOR:	"grey",
			C_WIN:	"green",
			C_LOSE:	"red",
			C_DEFAULT:	"orange",
		}
	}

}
