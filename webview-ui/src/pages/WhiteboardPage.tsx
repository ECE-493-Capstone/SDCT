import { VSCodeButton, } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect, useRef } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";

enum BrushType {
    Pen,
    Eraser
}

function WhiteboardPage({chatRoom}: {chatRoom: IChatRoom}) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushType, setBrushType] = useState<BrushType>(BrushType.Pen);
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
          contextRef.current.beginPath();
          contextRef.current.moveTo(offsetX, offsetY);
          // allow dot creation
          contextRef.current.lineTo(offsetX, offsetY);
          contextRef.current.stroke();
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
                <VSCodeButton appearance="secondary" onClick={getBrush}>🖊️</VSCodeButton>
                <VSCodeButton appearance="secondary">🔤</VSCodeButton>
                <VSCodeButton appearance="secondary">🔺</VSCodeButton>
                <VSCodeButton appearance="secondary" onClick={getEraser}>🧽</VSCodeButton>
                <VSCodeButton appearance="secondary">🗑️</VSCodeButton>
            </div>
        </main>
    );
}

export default WhiteboardPage;
