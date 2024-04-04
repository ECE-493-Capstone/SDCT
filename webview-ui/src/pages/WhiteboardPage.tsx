import { VSCodeButton, VSCodeTextField} from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect, useRef } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";

enum BrushType {
    Pen,
    Eraser,
    Text,
    Square,
    Triangle,
    Diamond,
    Arrow
}

function WhiteboardPage({chatRoom}: {chatRoom: IChatRoom}) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushType, setBrushType] = useState<BrushType>(BrushType.Pen);
    const [textInput, setTextInput] = useState("");
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        prepareCanvas();
    }, []);

    const prepareCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
    
          const context = canvas.getContext('2d');
          if (context) {
            context.lineCap = 'round';
            context.strokeStyle = 'white';
            context.fillStyle = 'black';
            context.lineWidth = 5;
            context.fillRect(0, 0, canvas.width, canvas.height);
            contextRef.current = context;
          }
        }
    };

    const startDrawing = ({ nativeEvent }: { nativeEvent: any }) => {
        const { offsetX, offsetY } = nativeEvent;
        if (contextRef.current) {
            if (brushType === BrushType.Text) {
                contextRef.current.font = "30px Arial";
                contextRef.current.fillStyle = "white";
                contextRef.current.fillText(textInput, offsetX, offsetY);
                return;
            } else if (brushType === BrushType.Square) {
                contextRef.current.fillStyle = "white";
                contextRef.current.strokeRect(offsetX, offsetY, 50, 50);
                return;
            } else {
                contextRef.current.beginPath();
                contextRef.current.moveTo(offsetX, offsetY);
                // allow dot creation
                contextRef.current.lineTo(offsetX, offsetY);
                contextRef.current.stroke();
            }
        }
        setIsDrawing(true);
      };
    
    const finishDrawing = () => {
        if (contextRef.current) {
            contextRef.current.closePath();
        }
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }: { nativeEvent: any }) => {
        if (!isDrawing) {return;};
        const { offsetX, offsetY } = nativeEvent;
        if (contextRef.current) {
            contextRef.current.lineTo(offsetX, offsetY);
            contextRef.current.stroke();
        }
    };

    const getBrush = () => {
        setBrushType(BrushType.Pen);
        if (contextRef.current) {
            contextRef.current.strokeStyle = "white";
            contextRef.current.lineWidth = 5;
        }
    };

    const getEraser = () => {
        setBrushType(BrushType.Eraser);
        if (contextRef.current) {
            contextRef.current.strokeStyle = 'black';
            contextRef.current.lineWidth = 20;
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
            context.fillStyle = 'black';
            context.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const writeText = () => {
        setBrushType(BrushType.Text);
    };

    const drawSquare = () => {
        setBrushType(BrushType.Square);
    };

    return (
        <main>
            <canvas
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                ref={canvasRef}
                style={{ border: '2px solid white' }}
            ></canvas>
            <div className="whiteboardToolbar">
                <VSCodeButton appearance={brushType === BrushType.Pen ? "primary" : "secondary"} onClick={getBrush}>🖊️</VSCodeButton>
                <VSCodeButton appearance={brushType === BrushType.Text ? "primary" : "secondary"} onClick={writeText}>🔤</VSCodeButton>
                <VSCodeButton appearance={brushType === BrushType.Square ? "primary" : "secondary"} onClick={drawSquare}>🟦</VSCodeButton>
                <VSCodeButton appearance={brushType === BrushType.Eraser ? "primary" : "secondary"} onClick={getEraser}>🧽</VSCodeButton>
                <VSCodeButton appearance="secondary" onClick={clearCanvas}>🗑️</VSCodeButton>
            </div>
            {brushType === BrushType.Text && (
                <VSCodeTextField className="whiteboardTextInput" value={textInput} onInput={e => {
                const target = e.target as HTMLInputElement;
                setTextInput(target.value);
                }}/>
            )}
        </main>
    );
}

export default WhiteboardPage;
