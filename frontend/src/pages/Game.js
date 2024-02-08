import Canvas from "./Canvas/Canvas";
import { styled } from 'styled-components';

const GameStyle = styled.div`
	// width: 100px;
	// height: 400px;
	width: 100%;
	max-width: 70rem;
	padding: 2rem;
	margin: 0 auto;
	border-radius: 0.5rem;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
	background: linear-gradient(180deg, #474232 0%, #28271c 100%);
`

function Game() {
//   const draw = (context,count) => {
//     context.clearRect(0, 0, context.canvas.width, context.canvas.height)
//     context.fillStyle = 'grey'
//     const d = count % 800
//     context.fillRect(10 +d , 10  , 100 , 100)
//   }
  const draw = (context, count) => {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height)
	context.fillStyle = 'green'
	const d = count % 800
	context.beginPath();
	context.arc(10 + d, 10, 50, 0, Math.PI * 2, false);
	context.fill();
}


  return (
  <>
  <GameStyle >
    <Canvas draw={draw} width="700" height="400" />
  </GameStyle>
  </>
  );
}

export default Game;