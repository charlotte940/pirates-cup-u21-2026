import { useRef, useState, useEffect } from 'react';
import { Eraser, Check, Undo } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  label: string;
  savedSignature?: string;
}

export default function SignaturePad({ onSave, label, savedSignature }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [showSaved, setShowSaved] = useState(!!savedSignature);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  useEffect(() => {
    setShowSaved(!!savedSignature);
  }, [savedSignature]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    setShowSaved(false);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
    setShowSaved(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const signatureData = canvas.toDataURL('image/png');
      onSave(signatureData);
      setShowSaved(true);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-pirates-gray-600">{label}</label>
      
      {/* Saved Signature Display */}
      {showSaved && savedSignature && (
        <div className="border-2 border-green-300 rounded-lg p-2 bg-green-50">
          <p className="text-xs text-green-600 mb-1 flex items-center gap-1">
            <Check className="w-3 h-3" /> Signature Saved
          </p>
          <img src={savedSignature} alt="Saved signature" className="max-h-20 object-contain" />
          <button
            onClick={() => { setShowSaved(false); clearSignature(); }}
            className="mt-2 text-xs text-pirates-red hover:underline flex items-center gap-1"
          >
            <Undo className="w-3 h-3" /> Redraw
          </button>
        </div>
      )}

      {/* Signature Canvas */}
      {(!showSaved || !savedSignature) && (
        <div className="border-2 border-dashed border-pirates-gray-300 rounded-lg bg-white">
          <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="w-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="flex gap-2 p-2 border-t border-pirates-gray-200">
            <button
              onClick={clearSignature}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-pirates-gray-600 hover:bg-pirates-gray-100 rounded-lg"
            >
              <Eraser className="w-4 h-4" /> Clear
            </button>
            <button
              onClick={saveSignature}
              disabled={!hasSignature}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-pirates-red text-white rounded-lg hover:bg-pirates-red/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" /> Save Signature
            </button>
          </div>
        </div>
      )}
      
      <p className="text-xs text-pirates-gray-400">Draw signature above using mouse or finger</p>
    </div>
  );
}
