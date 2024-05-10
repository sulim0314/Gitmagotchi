import tw from "tailwind-styled-components";
import { FaArrowDown, FaArrowUp, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { characterDataAtom } from "@/store/character";
import { useNavigate } from "react-router-dom";
import { messageDataAtom } from "@/store/message";
import { useMutation } from "@tanstack/react-query";
import { gainGold } from "@/api/user";
import { userDataAtom } from "@/store/user";

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

    drawImage() {
      const x = this.col * blockSize.current;
      const y = this.row * blockSize.current;
      ctx.current!.drawImage(
        faceRef.current,
        x - blockSize.current,
        y - blockSize.current,
        blockSize.current * 3,
        blockSize.current * 3
      );
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

      this.segments[0].drawImage();
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
      if (this.checkCollision(newHead)) {
        gameOver();
        return;
      }
      this.segments.unshift(newHead);

      if (newHead.equal(apple.current.position)) {
        score.current += 1;
        apple.current.move();
      } else {
        this.segments.pop();
      }
    }

    checkCollision(head: Block) {
      const leftCollision = head.col < 0;
      const topCollision = head.row < 0;
      const rightCollision = head.col >= widthInBlocks.current;
      const bottomCollision = head.row >= heightInBlocks.current;

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

  const navigate = useNavigate();
  const [userData, setUserData] = useRecoilState(userDataAtom);
  const setMessageData = useSetRecoilState(messageDataAtom);
  const characterData = useRecoilValue(characterDataAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceRef = useRef<HTMLImageElement>(new Image());
  const score = useRef<number>(0);
  const [gameStatus, setGameStatus] = useState<"READY" | "GAME" | "END">("READY");
  const snake = useRef<Snake>(new Snake());
  const apple = useRef<Apple>(new Apple());
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const mutation = useMutation({
    mutationFn: gainGold,
    onSuccess: (data) => {
      console.log(data);
      setUserData((prev) => {
        if (prev === null) return null;
        return {
          ...prev,
          gold: prev.gold,
        };
      });
    },
    onError: (err) => console.log(err),
  });

  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const width = useRef<number>(0);
  const height = useRef<number>(0);
  const widthInBlocks = useRef<number>(0);
  const heightInBlocks = useRef<number>(0);
  const blockSize = useRef<number>(0);

  const endCount = useRef<number>(5);
  const [endCountText, setEndCountText] = useState<number>(endCount.current);

  useEffect(() => {
    if (characterData?.faceUrl) {
      faceRef.current.src = characterData.faceUrl;
      faceRef.current.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          ctx.current = canvas.getContext("2d");
          width.current = canvas.width;
          height.current = canvas.height;

          blockSize.current = 10;
          widthInBlocks.current = width.current / blockSize.current;
          heightInBlocks.current = height.current / blockSize.current;

          if (!ctx.current) return;
          ctx.current.clearRect(0, 0, width.current, height.current);
          ctx.current.drawImage(faceRef.current, 100, 100, 200, 200);
          drawText("스네이크 게임", 50, 200, 30);
          drawText("획득한 점수만큼 골드를 획득할 수 있어요", 20, 200, 330);
        }
      };
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      removeEventListener("keydown", handleKeydown);
    };
  }, [characterData?.faceUrl]);

  const drawScore = function () {
    if (!ctx.current) return;
    ctx.current.font = "20px NanumBarunpen";
    ctx.current.fillStyle = "White";
    ctx.current.textAlign = "left";
    ctx.current.textBaseline = "top";
    ctx.current.fillText("Score : " + score.current, blockSize.current, blockSize.current);
  };

  const drawText = (text: string, fontSize: number, x: number, y: number) => {
    if (!ctx.current) return;
    ctx.current.font = `${fontSize}px NanumBarunpen`;
    ctx.current.fillStyle = "White";
    ctx.current.textAlign = "center";
    ctx.current.textBaseline = "top";
    ctx.current.fillText(text, x, y);
  };

  const gameStart = () => {
    setGameStatus("GAME");
    addEventListener("keydown", handleKeydown);
    intervalId.current = setInterval(game, 50);
  };

  const game = () => {
    if (ctx.current) {
      ctx.current.clearRect(0, 0, width.current, height.current);
      snake.current.move();
      apple.current.draw();
      snake.current.draw();
      drawScore();
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
    if (intervalId.current) {
      setGameStatus("END");
      clearInterval(intervalId.current);
      if (!ctx.current) return;
      ctx.current.clearRect(0, 0, width.current, height.current);
      drawText("GAME OVER", 50, 200, 100);
      drawText(`점수: ${score.current}점 / 획득 골드: ${score.current}`, 20, 200, 300);
      removeEventListener("keydown", handleKeydown);
      if (score.current > 0) {
        mutation.mutate({ body: JSON.stringify({ userId: userData!.id, value: score.current }) });
        setMessageData((prev) => [
          ...prev,
          {
            timestamp: new Date().toString(),
            text: `미니게임에서 ${score.current}점을 달성해 ${score.current}골드를 획득했습니다.`,
          },
        ]);
      }
      intervalId.current = setInterval(() => {
        endCount.current -= 1;
        setEndCountText(endCount.current);
        if (endCount.current < 0) {
          clearInterval(intervalId.current!);
          navigate("/");
        }
      }, 1000);
    }
  };

  return (
    <Wrapper>
      <GameContainer>
        <GameAreaContainer>
          <GameArea ref={canvasRef} width={400} height={400} />
        </GameAreaContainer>

        {gameStatus === "GAME" ? (
          <DetailContainer>
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
            </GameKeyContainer>{" "}
          </DetailContainer>
        ) : (
          <StartContainer>
            {gameStatus === "END" ? (
              <EndingText>{`${endCountText}초 후 메인페이지로 이동합니다.`}</EndingText>
            ) : (
              <StartButton onClick={gameStart}>게임 시작</StartButton>
            )}
          </StartContainer>
        )}
      </GameContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
justify-center
items-center
`;

const GameContainer = tw.div`
-mt-4
flex
flex-col
lg:flex-row
border-8
border-slate-500
shadow-2xl
`;

const GameAreaContainer = tw.div`
aspect-square
w-80
h-80
lg:w-[30rem]
lg:h-[30rem]
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

const StartContainer = tw.div`
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

const EndingText = tw.h2`
text-xl
font-bold
`;

const StartButton = tw.button`
text-2xl
border-2
border-slate-800
py-4
px-8
rounded-3xl
shadow-lg
bg-slate-200
font-bold
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
