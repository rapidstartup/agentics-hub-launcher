import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  X,
  FileText,
  Image,
  Video,
  Music,
  FileCode,
  Palette,
  Star,
  BookOpen,
  Target,
  HelpCircle,
  Gift,
  Loader2,
  ExternalLink,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type KBItem } from "./KnowledgeBaseCard";
import ReactMarkdown from "react-markdown";
import { type Database } from "@/integrations/supabase/types";

type KBCategory = Database["public"]["Enums"]["kb_category"];

interface KnowledgeBaseEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KBItem | null;
  onSuccess?: () => void;
}

const categoryOptions = [
  { value: "document", label: "Document", icon: FileText },
  { value: "image", label: "Image", icon: Image },
  { value: "video", label: "Video", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
  { value: "template", label: "Template", icon: FileCode },
  { value: "script", label: "Script", icon: FileCode },
  { value: "brand_asset", label: "Brand Asset", icon: Palette },
  { value: "winning_ad", label: "Winning Ad", icon: Star },
  { value: "research", label: "Research", icon: BookOpen },
  { value: "playbook", label: "Playbook", icon: Target },
  { value: "faq", label: "FAQ", icon: HelpCircle },
  { value: "offer", label: "Offer", icon: Gift },
];

const departmentOptions = [
  { value: "strategy", label: "Strategy" },
  { value: "advertising", label: "Advertising" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "operations", label: "Operations" },
  { value: "financials", label: "Financials" },
  { value: "admin", label: "Admin" },
];

export function KnowledgeBaseEditModal({
  open,
  onOpenChange,
  item,
  onSuccess,
}: KnowledgeBaseEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<KBCategory>("document");
  const [department, setDepartment] = useState("marketing");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setCategory(item.category as KBCategory);
      setDepartment(item.source_department);
      setTags(item.tags || []);
      setIsPinned(item.is_pinned);
      setActiveTab("details");
    }
  }, [item]);

  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!item || !title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("knowledge_base_items")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          category,
          source_department: department,
          tags,
          is_pinned: isPinned,
        })
        .eq("id", item.id);

      if (error) throw error;

      toast.success("Item updated");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const scrapedContent = item?.metadata && typeof item.metadata === "object" && "scraped_markdown" in item.metadata
    ? String(item.metadata.scraped_markdown)
    : null;

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {item.external_url ? "View & Edit" : "Edit"} Knowledge Base Item
          </DialogTitle>
          <DialogDescription>
            {item.external_url && "View scraped content and edit metadata"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            {scrapedContent && <TabsTrigger value="content">Scraped Content</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-auto space-y-4 mt-4">
            {/* Title */}
            <div>
              <label className="text-sm text-muted-foreground">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            {/* Category & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Category</label>
                <Select value={category} onValueChange={(val) => setCategory(val as KBCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Source Department</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* External URL */}
            {item.external_url && (
              <div>
                <label className="text-sm text-muted-foreground">External URL</label>
                <div className="flex items-center gap-2">
                  <Input value={item.external_url} readOnly className="bg-muted" />
                  <Button variant="outline" size="icon" asChild>
                    <a href={item.external_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* File Info */}
            {item.file_path && (
              <div>
                <label className="text-sm text-muted-foreground">File</label>
                <div className="text-sm text-muted-foreground">
                  {item.file_name || item.file_path}
                  {item.file_size && ` (${(item.file_size / 1024).toFixed(1)} KB)`}
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="text-sm text-muted-foreground">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pin-item"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="pin-item" className="text-sm text-muted-foreground cursor-pointer">
                Pin this item to the top
              </label>
            </div>
          </TabsContent>

          {scrapedContent && (
            <TabsContent value="content" className="flex-1 overflow-auto mt-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 text-sm font-medium text-foreground">Scraped Content (Markdown)</div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{scrapedContent}</ReactMarkdown>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default KnowledgeBaseEditModal;

