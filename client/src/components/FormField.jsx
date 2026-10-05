// A label + input (or textarea / select) + error message.
// Used by every form so they all look and behave the same.
// - multiline: renders a <textarea>
// - options:   renders a <select>. Each option is either a string ('online')
//              or an object { value, label }. emptyLabel is the text of the "" option.
function FormField({ label, name, value, onChange, error, type = 'text', multiline = false, options, emptyLabel = '-- choose --', maxLength, min, max, placeholder }) {
  const className = error ? 'input-error' : '';

  let input;
  if (options) {
    input = (
      <select id={name} name={name} value={value} onChange={onChange} className={className}>
        <option value="">{emptyLabel}</option>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
        })}
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
