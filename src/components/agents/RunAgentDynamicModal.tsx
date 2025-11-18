import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RuntimeField } from "@/integrations/n8n/agents";

export function RunAgentDynamicModal({
  open,
  onOpenChange,
  title = "Run Agent",
  fields = [],
  onRun,
  running = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  fields?: RuntimeField[];
  onRun: (values: Record<string, any>) => Promise<void>;
  running?: boolean;
}) {
  const [values, setValues] = useState<Record<string, any>>({});
  const requiredKeys = useMemo(() => (fields || []).filter((f) => f.required).map((f) => f.key), [fields]);

  const invalid = requiredKeys.some((k) => values[k] === undefined || values[k] === "");

  const renderField = (f: RuntimeField) => {
    const common = {
      id: f.key,
      value: values[f.key] ?? (f.defaultValue as any) ?? "",
      onChange: (e: any) => setValues((prev) => ({ ...prev, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })),
    };
    return (
      <div key={f.key} className="space-y-2">
        <Label htmlFor={f.key}>
          {f.label} {f.required ? <span className="text-destructive">*</span> : null}
        </Label>
        {f.type === "boolean" ? (
          <select
            id={f.key}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={String(values[f.key] ?? f.defaultValue ?? "false")}
            onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value === "true" }))}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        ) : (
          <Input type={f.type === "number" ? "number" : "text"} {...common} />
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {(fields || []).length === 0 ? (
            <div className="text-sm text-muted-foreground">This agent does not require any runtime inputs. Click Run to start.</div>
          ) : (
            <div className="grid gap-3">{fields.map(renderField)}</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" className="border-border" onClick={() => onOpenChange(false)} disabled={running}>
            Cancel
          </Button>
          <Button onClick={() => onRun(values)} disabled={running || invalid}>
            {running ? "Running..." : "Run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


