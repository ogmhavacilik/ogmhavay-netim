export const exportTableToMHTML = (tableId: string, fileName: string) => {
  const table = document.getElementById(tableId);
  if (!table) return;

  // Clone the table to modify it without affecting the UI
  const clone = table.cloneNode(true) as HTMLTableElement;

  // Remove red highlighting as requested: "uyarı verenler (kırmızı olanlar) MHTML de uyarı vermesin normal veri gibi gitsin"
  // In ActivityGrid, red is #FF0000.
  const cells = clone.querySelectorAll('td, th');
  cells.forEach((cell: any) => {
    const bgColor = cell.style.backgroundColor;
    // If it's red (#FF0000 or rgb(255, 0, 0)), make it white or transparent
    if (bgColor === 'rgb(255, 0, 0)' || bgColor === '#FF0000' || bgColor.toLowerCase() === '#ff0000') {
      cell.style.backgroundColor = '#FFFFFF';
      cell.style.color = '#000000';
    }
    
    // Also remove tailwind classes that might interfere if the viewer supports them
    cell.className = cell.className.replace(/bg-\[#FF0000\]/g, 'bg-white').replace(/text-white/g, 'text-black');
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${fileName}</title>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 10px; }
        th, td { border: 1px solid black; padding: 4px; text-align: center; }
        .bg-yellow { background-color: #FFFF00; }
        .bg-purple { background-color: #7030A0; color: white; }
        /* Red is removed per user request */
      </style>
    </head>
    <body>
      ${clone.outerHTML}
    </body>
    </html>
  `;

  // MHTML Header
  const boundary = "----=_NextPart_000_0000_01D00000.00000000";
  const mhtml = [
    "From: <Saved by AI Studio>",
    `Subject: ${fileName}`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/related; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=\"utf-8\"",
    "Content-Transfer-Encoding: quoted-printable",
    "",
    htmlContent.replace(/=/g, "=3D"), // Simple quoted-printable encoding for '='
    "",
    `--${boundary}--`
  ].join("\r\n");

  const blob = new Blob([mhtml], { type: 'message/rfc822' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.mhtml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
