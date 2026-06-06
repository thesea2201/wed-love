import { FIELD_LABELS, GUEST_FIELDS, GuestField, autoMapAll } from './parseCsv';

interface Props {
  headers: string[];
  mapping: Partial<Record<GuestField, string>>;
  onChange: (mapping: Partial<Record<GuestField, string>>) => void;
}

export default function StepMapColumns({ headers, mapping, onChange }: Props) {
  const handleFieldChange = (field: GuestField, value: string) => {
    const next = { ...mapping };
    if (value === '') {
      delete next[field];
    } else {
      next[field] = value;
    }
    onChange(next);
  };

  const autoFilled = autoMapAll(headers);

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        Ghép từng cột trong file với trường thông tin khách mời. Cột <span className="text-red-500">*</span> là bắt buộc.
      </p>
      {GUEST_FIELDS.map((field) => (
        <div key={field} className="flex items-center gap-3">
          <label className="w-32 text-sm text-gray-700">
            {FIELD_LABELS[field]}
            {field === 'name' && <span className="text-red-500 ml-1">*</span>}
            {autoFilled[field] && (
              <span className="ml-2 text-xs text-green-600">(đã tự động)</span>
            )}
          </label>
          <select
            value={mapping[field] || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">— Bỏ qua —</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
