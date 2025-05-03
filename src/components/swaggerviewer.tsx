import { useState } from "react";

export default function SwaggerViewer({ swaggerdata }: { swaggerdata: any }) {
  return (
    <div className="h-full w-full flex-col space-y-4 overflow-auto scrollbar-hide p-4">
      {Object.entries(swaggerdata).map(([endpoint, methods]) => (
        <div
          key={endpoint}
          className="rounded-xl border border-green-300 bg-white p-4 shadow-md"
        >
          {Object.entries(methods as Record<string, any>).map(
            ([method, details]) => (
              <SwaggerMethodBlock
                key={method}
                endpoint={endpoint}
                method={method}
                details={details}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
}

function SwaggerMethodBlock({
  endpoint,
  method,
  details,
}: {
  endpoint: string;
  method: string;
  details: any;
}) {
  const [showResponse, setShowResponse] = useState(false);

  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-start mb-0">
        <div>
          <h2 className="text-lg font-bold text-green-600">
            [{method.toUpperCase()}] {endpoint}
          </h2>
        </div>
        <p className="text-sm text-gray-600 max-w-md text-right">
          {details.description}
        </p>
      </div>

      {["pathParams", "queryParams", "headerParams", "fields"].map(
        (paramType) =>
          details[paramType] && (
            <div key={paramType}>
              <h4 className="text-md font-semibold text-green-800">
                {paramType.replace("Params", "").toUpperCase()}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                {details[paramType].map((param: any) => (
                  <CheckboxInputPair key={param.name} param={param} />
                ))}
              </div>
            </div>
          )
      )}

      {details.response && (
        <div className="text-right">
          <button
            onClick={() => setShowResponse((prev) => !prev)}
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xs px-2.5 py-2.5"
          >
            {showResponse ? "Hide Response" : "Show Response"}
          </button>
        </div>
      )}

      {showResponse && details.response && (
        <pre className="mt-2 rounded bg-gray-100 p-4 text-xs overflow-auto">
          {JSON.stringify(details.response, null, 2)}
        </pre>
      )}
    </div>
  );
}

// Component for checkbox + input binding
function CheckboxInputPair({ param }: { param: any }) {
  const [checked, setChecked] = useState(param.required ? true : true);

  const isRequired = param.required;

  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        checked={checked}
        disabled={isRequired}
        onChange={(e) => setChecked(e.target.checked)}
        className={`mt-1 accent-green-500 ${
          isRequired ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
      <div className="flex flex-col w-full">
        <label className="text-sm font-medium">
          {param.name}{" "}
          <span className="text-gray-500">
            ({param.type || "unknown"}
            {isRequired ? ", required" : ""})
          </span>
        </label>
        {renderInput(param, !checked)}
      </div>
    </div>
  );
}

// Render input dynamically and set default values
function renderInput(param: any, disabled: boolean) {
  const baseStyle =
    "mt-1 rounded border px-2 py-1 text-sm transition-all duration-200";
  const disabledStyle = disabled
    ? "opacity-50 cursor-not-allowed bg-red-600"
    : "";

  // If enum is present, create a dropdown
  if (param.enum) {
    return (
      <select
        disabled={disabled}
        className={`${baseStyle} ${disabledStyle}`}
        defaultValue={param.value || ""}
      >
        {param.enum.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  // If boolean, create radio buttons and set default value
  if (param.type === "boolean") {
    return (
      <div className={`mt-1 flex gap-4 text-sm ${disabledStyle}`}>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name={param.name}
            value="true"
            disabled={disabled}
            defaultChecked={param.value === "true"}
          />
          True
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name={param.name}
            value="false"
            disabled={disabled}
            defaultChecked={param.value === "false"}
          />
          False
        </label>
      </div>
    );
  }

  // If number or integer, set the value dynamically
  if (param.type === "integer" || param.type === "number") {
    return (
      <input
        type="number"
        disabled={disabled}
        className={`${baseStyle} ${disabledStyle}`}
        min={param.minimum}
        max={param.maximum}
        defaultValue={param.value || ""}
      />
    );
  }

  // For strings, set the default value if present
  return (
    <input
      type="text"
      disabled={disabled}
      className={`${baseStyle} ${disabledStyle}`}
      minLength={param.minLength}
      maxLength={param.maxLength}
      defaultValue={param.value || ""}
    />
  );
}
