import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Splits pasted text into entries: one per line, comma, semicolon or space.
export const splitValues = (text: string) =>
  text
    .split(/[\s,;]+/)
    .map((v) => v.trim())
    .filter(Boolean);

// Free-text entry for values that have no fixed list (bundles, domains, IDs).
// Pasting a list adds every entry at once.
const ValuesInput: React.FC<{
  id: string;
  placeholder: string;
  onAdd: (values: string[]) => void;
  normalize?: (v: string) => string;
  buttonLabel?: string;
}> = ({ id, placeholder, onAdd, normalize = (v) => v, buttonLabel = "Add" }) => {
  const [text, setText] = useState("");
  const add = () => {
    const vals = [...new Set(splitValues(text).map(normalize).filter(Boolean))];
    if (vals.length) onAdd(vals);
    setText("");
  };
  return (
    <div className="flex gap-2">
      <Input id={id} value={text} placeholder={placeholder} autoComplete="off"
        onChange={(e) => setText(e.target.value)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData("text");
          if (splitValues(pasted).length > 1) {
            e.preventDefault();
            const vals = [...new Set(splitValues(pasted).map(normalize).filter(Boolean))];
            if (vals.length) onAdd(vals);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }} />
      <Button type="button" variant="outline" onClick={add}>{buttonLabel}</Button>
    </div>
  );
};

export default ValuesInput;
