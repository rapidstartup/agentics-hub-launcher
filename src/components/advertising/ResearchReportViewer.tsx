import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ResearchReportViewerProps {
  content: string;
  companyName: string;
}

export const ResearchReportViewer = ({ content, companyName }: ResearchReportViewerProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The report has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy report to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `market-research-${companyName.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your report is being downloaded",
    });
  };

  // Simple markdown to HTML converter for basic formatting
  const formatContent = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        // Headers
        if (line.startsWith("# ")) {
          return `<h1 key=${i} class="text-3xl font-bold mt-8 mb-4">${line.substring(2)}</h1>`;
        }
        if (line.startsWith("## ")) {
          return `<h2 key=${i} class="text-2xl font-semibold mt-6 mb-3">${line.substring(3)}</h2>`;
        }
        if (line.startsWith("### ")) {
          return `<h3 key=${i} class="text-xl font-semibold mt-4 mb-2">${line.substring(4)}</h3>`;
        }
        // Bold
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Lists
        if (line.startsWith("- ")) {
          return `<li key=${i} class="ml-4">${line.substring(2)}</li>`;
        }
        // Horizontal rule
        if (line.trim() === "---") {
          return `<hr key=${i} class="my-8 border-border" />`;
        }
        // Paragraph
        if (line.trim()) {
          return `<p key=${i} class="mb-2">${line}</p>`;
        }
        return `<br key=${i} />`;
      })
      .join("");
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Market Research Report</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[600px] rounded-md border p-6">
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
        </ScrollArea>
      </div>
    </Card>
  );
};