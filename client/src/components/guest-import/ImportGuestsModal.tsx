import { useMemo, useState } from 'react';
import api from '../../utils/api';
import StepUpload from './StepUpload';
import StepMapColumns from './StepMapColumns';
import StepPreview from './StepPreview';
import DuplicateDialog from './DuplicateDialog';
import Modal from '../ui/Modal';
import {
  DuplicateGroup,
  GuestField,
  GuestRow,
  applyDuplicateChoice,
  fullParse,
  autoMapAll,
} from './parseCsv';

interface Props {
  invitationId: string;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
}

type Step = 1 | 2 | 3;

export default function ImportGuestsModal({ invitationId, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [csvText, setCsvText] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Partial<Record<GuestField, string>>>({});
  const [rows, setRows] = useState<GuestRow[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [skippedRowIndices, setSkippedRowIndices] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDupDialog, setShowDupDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validRowCount = useMemo(
    () => rows.filter((r) => r.errors.length === 0 && !skippedRowIndices.has(r.rowIndex)).length,
    [rows, skippedRowIndices]
  );

  const handleParsed = (text: string, hdrs: string[], _rowCount: number) => {
    setErrorMessage('');
    setCsvText(text);
    setHeaders(hdrs);
    const auto = autoMapAll(hdrs);
    setMapping(auto);
    if (!auto.name) {
      setErrorMessage(
        `Không tìm thấy cột "Tên khách" trong file. Headers: ${hdrs.join(', ')}`
      );
      return;
    }
    setStep(2);
  };

  const handleMapError = (msg: string) => {
    setErrorMessage(msg);
  };

  const handleMapNext = () => {
    if (!mapping.name) {
      setErrorMessage('Vui lòng ghép cột cho "Tên khách" trước khi tiếp tục');
      return;
    }
    setErrorMessage('');
    try {
      const result = fullParse(csvText, mapping);
      setRows(result.rows);
      setDuplicates(result.duplicates);
      setSkippedRowIndices(new Set());
      if (result.duplicates.length > 0) {
        setShowDupDialog(true);
      }
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không parse được file');
    }
  };

  const handleDuplicateChoice = (choice: 'skip' | 'keep') => {
    setShowDupDialog(false);
    const newRows = applyDuplicateChoice(rows, duplicates, choice);
    const skipped = new Set<number>();
    for (const r of rows) {
      if (!newRows.find((nr) => nr.rowIndex === r.rowIndex)) {
        skipped.add(r.rowIndex);
      }
    }
    setRows(newRows);
    setSkippedRowIndices(skipped);
  };

  const handleImport = async () => {
    if (validRowCount === 0) {
      setErrorMessage('Không có dòng hợp lệ để import');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');
    try {
      const validRows = rows.filter(
        (r) => r.errors.length === 0 && !skippedRowIndices.has(r.rowIndex)
      );
      const payload = validRows.map((r) => ({
        name: r.name,
        email: r.email || undefined,
        phone: r.phone || undefined,
        customMessage: r.customMessage || undefined,
      }));
      const res = await api.post('/guests/bulk', {
        invitationId,
        guests: payload,
      });
      onSuccess(res.data.imported || validRows.length);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error || err.message || 'Import thất bại, vui lòng thử lại'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (step === 3) setStep(2);
    else if (step === 2) {
      setCsvText('');
      setHeaders([]);
      setMapping({});
      setRows([]);
      setStep(1);
    }
  };

  return (
    <Modal open onClose={onClose} maxWidth="3xl">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Import khách mời từ CSV</h3>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 w-12 rounded ${
                  s <= step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
          ×
        </button>
      </div>

        <div className="p-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {step === 1 && <StepUpload onParsed={handleParsed} onError={handleMapError} />}
          {step === 2 && (
            <StepMapColumns headers={headers} mapping={mapping} onChange={setMapping} />
          )}
          {step === 3 && (
            <StepPreview
              rows={rows}
              skippedRowIndices={skippedRowIndices}
              duplicates={duplicates}
              onToggleRow={() => {}}
            />
          )}
        </div>

        <div className="p-5 border-t flex items-center justify-between">
          <button
            type="button"
            onClick={step === 1 ? onClose : handleBack}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {step === 1 ? 'Hủy' : '← Quay lại'}
          </button>
          <div className="flex gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={handleMapNext}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:opacity-90"
              >
                Tiếp tục →
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={handleImport}
                disabled={submitting || validRowCount === 0}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {submitting
                  ? 'Đang import...'
                  : `Import ${validRowCount} khách`}
              </button>
            )}
          </div>
        </div>

      {showDupDialog && (
        <DuplicateDialog
          duplicates={duplicates}
          onChoice={handleDuplicateChoice}
          onCancel={() => setShowDupDialog(false)}
        />
      )}
    </Modal>
  );
}
