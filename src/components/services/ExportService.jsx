/**
 * Export Service
 * Unified export system for all generated content
 */

import { jsPDF } from 'jspdf';

class ExportService {
  constructor() {
    this.exportHistory = [];
  }

  /**
   * Export as text file
   */
  exportText(content, filename = 'export.txt') {
    const blob = new Blob([content], { type: 'text/plain' });
    this.downloadBlob(blob, filename);
    this.trackExport('text', filename);
  }

  /**
   * Export as markdown
   */
  exportMarkdown(content, filename = 'export.md') {
    const blob = new Blob([content], { type: 'text/markdown' });
    this.downloadBlob(blob, filename);
    this.trackExport('markdown', filename);
  }

  /**
   * Export as JSON
   */
  exportJSON(data, filename = 'export.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    this.downloadBlob(blob, filename);
    this.trackExport('json', filename);
  }

  /**
   * Export as PDF
   */
  exportPDF(content, options = {}) {
    const {
      filename = 'export.pdf',
      title = 'Export',
      fontSize = 12,
      margin = 20,
    } = options;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(title, margin, margin);
    
    // Metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 10);
    
    // Content
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(content, 170);
    let y = margin + 25;
    
    lines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    doc.save(filename);
    this.trackExport('pdf', filename);
  }

  /**
   * Export code as zip (multiple files)
   */
  async exportCodePackage(files, projectName = 'project') {
    // Create a text representation since we don't have JSZip
    let packageContent = `# ${projectName}\n\n`;
    
    files.forEach(file => {
      packageContent += `## File: ${file.path}\n`;
      packageContent += `\`\`\`${this.getLanguageFromPath(file.path)}\n`;
      packageContent += file.content;
      packageContent += `\n\`\`\`\n\n`;
    });

    this.exportText(packageContent, `${projectName}-export.txt`);
    this.trackExport('code-package', `${projectName}-export.txt`);
  }

  /**
   * Export image (download from URL)
   */
  async exportImage(imageUrl, filename = 'image.png') {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      this.downloadBlob(blob, filename);
      this.trackExport('image', filename);
    } catch (error) {
      console.error('Failed to export image:', error);
      throw error;
    }
  }

  /**
   * Export as HTML
   */
  exportHTML(content, filename = 'export.html') {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Export</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #FF7B00; }
    pre { 
      background: #f5f5f5; 
      padding: 15px; 
      border-radius: 8px;
      overflow-x: auto;
    }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="content">
    ${content}
  </div>
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
    Exported from FlashFusion on ${new Date().toLocaleString()}
  </footer>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    this.downloadBlob(blob, filename);
    this.trackExport('html', filename);
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(content) {
    try {
      await navigator.clipboard.writeText(content);
      this.trackExport('clipboard', 'clipboard');
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Share via Web Share API
   */
  async share(data) {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    try {
      await navigator.share(data);
      this.trackExport('share', 'web-share');
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to share:', error);
      }
      return false;
    }
  }

  /**
   * Helper: Download blob
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Helper: Get language from file path
   */
  getLanguageFromPath(path) {
    const ext = path.split('.').pop();
    const langMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      css: 'css',
      html: 'html',
      json: 'json',
      md: 'markdown',
    };
    return langMap[ext] || '';
  }

  /**
   * Track export
   */
  trackExport(type, filename) {
    this.exportHistory.push({
      type,
      filename,
      timestamp: Date.now(),
    });

    // Keep only last 50 exports
    if (this.exportHistory.length > 50) {
      this.exportHistory.shift();
    }
  }

  /**
   * Get export history
   */
  getHistory() {
    return [...this.exportHistory];
  }

  /**
   * Get stats
   */
  getStats() {
    const typeCounts = {};
    this.exportHistory.forEach(exp => {
      typeCounts[exp.type] = (typeCounts[exp.type] || 0) + 1;
    });

    return {
      total: this.exportHistory.length,
      byType: typeCounts,
      lastExport: this.exportHistory[this.exportHistory.length - 1],
    };
  }
}

export const exportService = new ExportService();
export default exportService;