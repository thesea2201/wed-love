import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MAX_FILE_SIZE, CsvParseError, parseCsvText } from './parseCsv';
import { downloadTemplate } from '../../utils/downloadTemplate';

interface Props {
  onParsed: (text: string, headers: string[], rawRowCount: number) => void;
  onError: (message: string) => void;
}

export default function StepUpload({ onParsed, onError }: Props) {
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        if (!file.name.toLowerCase().endsWith('.csv')) {
          throw new CsvParseError('Chỉ hỗ trợ file .csv. Vui lòng "Save As" từ Excel sang CSV.');
        }
        if (file.size > MAX_FILE_SIZE) {
          throw new CsvParseError(
            `File quá lớn (${(file.size / 1024).toFixed(0)}KB). Tối đa ${MAX_FILE_SIZE / 1024}KB (~1000 dòng).`
          );
        }

        const text = await file.text();
        const { headers, rawRows } = parseCsvText(text);
        setFileName(file.name);
        onParsed(text, headers, rawRows.length);
      } catch (err: any) {
        onError(err.message || 'Không đọc được file');
      } finally {
        setIsProcessing(false);
      }
    },
    [onParsed, onError]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    multiple: false,
    disabled: isProcessing,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
        } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
      >
        <div className="text-5xl mb-3">📄</div>
        {isProcessing ? (
          <p className="text-gray-600">Đang đọc file...</p>
        ) : fileName ? (
          <p className="text-gray-700">
            Đã chọn: <span className="font-medium">{fileName}</span>
          </p>
        ) : (
          <>
            <p className="text-gray-700 font-medium mb-1">Kéo thả file CSV vào đây</p>
            <p className="text-sm text-gray-400">hoặc click để chọn file</p>
          </>
        )}
        <input
          ref={inputRef}
          {...getInputProps()}
          type="file"
          accept=".csv,text/csv"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">Hỗ trợ: .csv (UTF-8), tối đa 1000 dòng</span>
        <button
          type="button"
          onClick={downloadTemplate}
          className="text-primary hover:underline"
        >
          ⬇ Tải file mẫu
        </button>
      </div>
    </div>
  );
}
