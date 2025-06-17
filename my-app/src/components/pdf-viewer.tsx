interface PDFViewerProps {
    url: string
  }
  
  export function PDFViewer({ url }: PDFViewerProps) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden border border-white/20 backdrop-blur-lg bg-white/5">
        <iframe src={url} className="w-full h-full" style={{ border: "none" }} title="PDF Viewer" />
      </div>
    )
  }
  
  