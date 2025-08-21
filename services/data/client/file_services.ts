'use client'

import mammoth from "mammoth";
import * as XLSX from "xlsx";

// Read PDF as Blob
const readPdfBlob = async (blob: Blob): Promise<string> => {
  const arrayBuffer = await blob.arrayBuffer();
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
  const pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker");

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return text.trim();
};

// Read Blob content
const readBlobContent = async (blob: Blob): Promise<string> => {
  const type = blob.type;

  if (type.startsWith("text/") || type === "application/json") {
    return await blob.text();
  }

  if (type === "application/pdf") {
    return await readPdfBlob(blob);
  }

  if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const arrayBuffer = await blob.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    const arrayBuffer = await blob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    return (data as any[][]).map(row => row.join("\t")).join("\n");
  }

  throw new Error(`Unsupported blob type: ${type}`);
};

// Save file to disk (download)
const downloadBlobFile = (blob: Blob, fileName: string) => {
  if (!(blob instanceof Blob)) {
    console.error("Provided value is not a Blob:", blob);
    throw new Error("Provided value is not a Blob:", blob)
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// Create file via API
const createFile = async (file_data: string | FormData) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create_file`, {
      method: "POST",
      body: file_data
    });

    if (!response.ok) throw new Error(response.statusText);

    const blob = await response.blob();

    const disposition = response.headers.get("Content-Disposition");
    let fileName = "downloaded_file";
    if (disposition) {
      const match = disposition.match(/filename="?(.+?)"?$/);
      if (match) fileName = match[1];
    }

    return { status: "success", fileName, blob };
  } catch (err) {
    console.error("File creation failed:", err);
    return { status: "failed", message: String(err) };
  }
};

export { createFile, downloadBlobFile, readBlobContent };
