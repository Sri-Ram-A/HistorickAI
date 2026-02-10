import html2canvas from "html2canvas";
import type { RefObject } from "react";

export const downloadPNG = async (
    diagramRef: RefObject<HTMLDivElement> | null
) => {
    if (!diagramRef) return;
    if (!diagramRef.current) return;
    const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
    });
    const link = document.createElement("a");
    link.download = "diagram.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};

export const downloadSVG = (ref: RefObject<HTMLDivElement>| null) => {
    if (!ref) return;
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob(
        [new XMLSerializer().serializeToString(svg)],
        { type: "image/svg+xml;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "diagram.svg";
    link.click();
    URL.revokeObjectURL(url);
};
