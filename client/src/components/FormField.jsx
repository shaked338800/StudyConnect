// A label + input (or textarea / select) + error message.
// Used by every form so they all look and behave the same.
// - multiline: renders a <textarea>
// - options:   renders a <select> with these values, e.g. ['online', 'hybrid']
function FormField({ label, name, value, onChange, error, type = 'text', multiline = false, options, maxLength, min, max, placeholder }) {
  const className = error ? 'input-error' : '';

  let input;
  if (options) {
    input = (
      <select id={name} name={name} value={value} onChange={onChange} className={className}>
        <option value="">-- choose --</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    );
  } else if (multiline) {
    input = (
      <textarea id={name} name={name} value={value} onChange={onChange} maxLength={maxLength}
        placeholder={placeholder} className={className} rows={3} />
    );
  } else {
    input = (
      <input id={name} name={name} type={type} value={value} onChange={onChange} maxLength={maxLength}
        min={min} max={max} placeholder={placeholder} className={className} />
    );
  }

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      {input}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default FormField;
