import { VSCodeButton, } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect, useRef } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";

function WhiteboardPage({chatRoom}: {chatRoom: IChatRoom}) {
    const [isDrawing, setIsDrawing] = useState(false);
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

    return (
        <main>
            <canvas
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                ref={canvasRef}
                style={{ border: '2px solid black' }}
            ></canvas>
        </main>
    );
}

export default WhiteboardPage;
