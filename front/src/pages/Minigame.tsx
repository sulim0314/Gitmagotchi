import tw from "tailwind-styled-components";
import { FaArrowDown, FaArrowUp, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

export default function Minigame() {
  class Block {
    col: number;
    row: number;
    constructor(col: number, row: number) {
      this.col = col;
      this.row = row;
    }

    drawSquare(color: string) {
      const x = this.col * blockSize.current;
      const y = this.row * blockSize.current;
      ctx.current!.fillStyle = color;
      ctx.current!.fillRect(x, y, blockSize.current, blockSize.current);
    }

    drawCircle(color: string) {
      const centerX = this.col * blockSize.current + blockSize.current / 2;
      const centerY = this.row * blockSize.current + blockSize.current / 2;
      ctx.current!.fillStyle = color;

      ctx.current!.beginPath();
      ctx.current!.arc(centerX, centerY, blockSize.current / 2, 0, Math.PI * 2, false);
      ctx.current!.fill();
    }

    equal(otherBlock: Block) {
      return this.col === otherBlock.col && this.row === otherBlock.row;
    }
  }

  class Snake {
    segments: Block[];
    direction: string;
    nextDirection: string;
    constructor() {
      this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];
      this.direction = "RIGHT";
      this.nextDirection = "RIGHT";
    }

    draw() {
      for (const block of this.segments) {
        block.drawSquare("Blue");
      }
    }

    move() {
      const head = this.segments[0];
      let newHead;
      this.direction = this.nextDirection;

      if (this.direction === "RIGHT") {
        newHead = new Block(head.col + 1, head.row);
      } else if (this.direction === "DOWN") {
        newHead = new Block(head.col, head.row + 1);
      } else if (this.direction === "LEFT") {
        newHead = new Block(head.col - 1, head.row);
      } else if (this.direction === "UP") {
        newHead = new Block(head.col, head.row - 1);
      }

      if (!newHead) return;
      console.log(newHead);
      if (this.checkCollision(newHead)) {
        gameOver();
        return;
      }
      this.segments.unshift(newHead);

      if (newHead.equal(apple.current.position)) {
        setScore((prev) => prev + 1);
        apple.current.move();
      } else {
        this.segments.pop();
      }
    }

    checkCollision(head: Block) {
      const leftCollision = head.col === 0;
      const topCollision = head.row === 0;
      const rightCollision = head.col === widthInBlocks.current - 1;
      const bottomCollision = head.row === heightInBlocks.current - 1;

      const wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;
      let selfCollision = false;

      for (let i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
          selfCollision = true;
        }
      }
      return wallCollision || selfCollision;
    }

    setDirection(newDirection: string) {
      if (this.direction === "UP" && newDirection === "DOWN") {
        return;
      } else if (this.direction === "RIGHT" && newDirection === "LEFT") {
        return;
      } else if (this.direction === "DOWN" && newDirection === "UP") {
        return;
      } else if (this.direction === "LEFT" && newDirection === "RIGHT") {
        return;
      }
      this.nextDirection = newDirection;
    }
  }

  class Apple {
    position: Block;

    constructor() {
      this.position = new Block(10, 10);
    }

    draw() {
      this.position.drawCircle("LimeGreen");
    }

    move() {
      const randomCol = Math.floor(Math.random() * (widthInBlocks.current - 2)) + 1;
      const randomRow = Math.floor(Math.random() * (heightInBlocks.current - 2)) + 1;
      this.position = new Block(randomCol, randomRow);
    }
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const snake = useRef<Snake>(new Snake());
  const apple = useRef<Apple>(new Apple());
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const width = useRef<number>(0);
  const height = useRef<number>(0);
  const widthInBlocks = useRef<number>(0);
  const heightInBlocks = useRef<number>(0);
  const blockSize = useRef<number>(0);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      ctx.current = canvas.getContext("2d");
      width.current = canvas.width;
      height.current = canvas.height;

      blockSize.current = 10;
      widthInBlocks.current = width.current / blockSize.current;
      heightInBlocks.current = height.current / blockSize.current;
      setScore(0);

      console.log(width.current, height.current);
      console.log(widthInBlocks.current, heightInBlocks.current);

      intervalId.current = setInterval(game, 50);
    }
    addEventListener("keydown", handleKeydown);

    return () => {
      clearInterval(intervalId.current!);
      removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const game = () => {
    if (ctx.current) {
      ctx.current.clearRect(0, 0, width.current, height.current);
      snake.current.move();
      snake.current.draw();
      apple.current.draw();
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "a") {
      snake.current.setDirection("LEFT");
    } else if (e.key === "ArrowRight" || e.key === "d") {
      snake.current.setDirection("RIGHT");
    } else if (e.key === "ArrowUp" || e.key === "w") {
      snake.current.setDirection("UP");
    } else if (e.key === "ArrowDown" || e.key === "s") {
      snake.current.setDirection("DOWN");
    }
  };

  const gameOver = () => {
    // alert("game over");
    clearInterval(intervalId.current!);
  };

  return (
    <Wrapper>
      <GameContainer>
        <GameArea ref={canvasRef} width={400} height={400} />
      </GameContainer>
      <DetailContainer>
        <ScoreContainer>
          <ScoreText>{`현재 점수: ${score}`}</ScoreText>
        </ScoreContainer>
        <GameKeyContainer>
          <ArrowButton
            onClick={() => {
              snake.current.setDirection("UP");
            }}
          >
            <UpArrowIcon />
          </ArrowButton>
          <MiddleKeyContainer>
            <ArrowButton
              onClick={() => {
                snake.current.setDirection("LEFT");
              }}
            >
              <LeftArrowIcon />
            </ArrowButton>
            <ArrowButton
              onClick={() => {
                snake.current.setDirection("RIGHT");
              }}
            >
              <RightArrowIcon />
            </ArrowButton>
          </MiddleKeyContainer>
          <ArrowButton
            onClick={() => {
              snake.current.setDirection("DOWN");
            }}
          >
            <DownArrowIcon />
          </ArrowButton>
        </GameKeyContainer>
      </DetailContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
bg-[#f2f2f2]
flex
flex-col
lg:flex-row
justify-center
items-center
`;

const GameContainer = tw.div`
aspect-square
w-80
h-80
lg:w-[30rem]
lg:h-[30rem]
border-2
border-slate-800
`;

const GameArea = tw.canvas`
w-80
h-80
lg:w-[30rem]
lg:h-[30rem]
bg-slate-600
relative
`;

const DetailContainer = tw.div`
aspect-square
w-80
h-80
lg:w-[30rem]
lg:h-[30rem]
border-2
border-slate-800
flex
flex-col
space-y-6
justify-center
items-center
`;

const GameKeyContainer = tw.div`
flex
flex-col
justify-center
items-center
py-2
`;

const MiddleKeyContainer = tw.div`
flex
justify-center
items-center
space-x-14
`;

const ArrowButton = tw.button`
w-14
h-14
rounded-full
bg-gray-500
border-2
border-slate-800
shadow-lg
flex
justify-center
items-center
`;

const LeftArrowIcon = tw(FaArrowLeft)`
w-6
h-6
text-slate-100
`;

const RightArrowIcon = tw(FaArrowRight)`
w-6
h-6
text-slate-100
`;

const UpArrowIcon = tw(FaArrowUp)`
w-6
h-6
text-slate-100
`;

const DownArrowIcon = tw(FaArrowDown)`
w-6
h-6
text-slate-100
`;

const ScoreContainer = tw.div``;

const ScoreText = tw.h1``;
