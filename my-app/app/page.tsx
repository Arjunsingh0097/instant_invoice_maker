"use client";

import { useState } from "react";
import {
  Plus,
  Calendar,
  Trash2,
  Download,
  Eye,
  FileText,
  User,
  Building,
  Sparkles,
  Zap,
  Mail,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import LogoUpload from "./components/LogoUpload";
import TaxDiscountSection from "./components/TaxDiscountSection";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  amount: number;
}

export default function InvoiceMaker() {
  const [invoiceType, setInvoiceType] = useState("Invoice");
  const [fromDetails, setFromDetails] = useState("");
  const [toDetails, setToDetails] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("001");
  const [terms, setTerms] = useState("Due On Receipt");
  const [invoiceDate, setInvoiceDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [extraNotes, setExtraNotes] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [clientEmail, setClientEmail] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      name: "",
      price: 0,
      quantity: 1,
      amount: 0,
    },
  ]);

  const calculateItemAmount = (price: number, quantity: number) => {
    return price * quantity;
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "price" || field === "quantity") {
            updatedItem.amount = calculateItemAmount(
              field === "price" ? Number(value) : item.price,
              field === "quantity" ? Number(value) : item.quantity
            );
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addNewItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: "",
      price: 0,
      quantity: 1,
      amount: 0,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;

  const handleDownloadInvoice = async () => {
    try {
      // Create a temporary div for the invoice content
      const invoiceDiv = document.createElement("div");
      invoiceDiv.style.position = "absolute";
      invoiceDiv.style.left = "-9999px";
      invoiceDiv.style.top = "0";
      invoiceDiv.style.width = "600px"; // Reduced width for faster processing
      invoiceDiv.style.backgroundColor = "white";
      invoiceDiv.style.padding = "15px"; // Reduced padding for faster processing
      invoiceDiv.style.fontFamily = "Arial, sans-serif";
      invoiceDiv.style.color = "#333";

      invoiceDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white; color: #333; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
          <!-- Header Section -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div style="flex: 1;">
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #000; text-rendering: optimizeLegibility;">${
                fromDetails.split("\n")[0] || "ABC Logistics Pty Ltd"
              }</div>
              <div style="font-size: 14px; color: #333; line-height: 1.4; white-space: pre-line; text-rendering: optimizeLegibility;">${
                fromDetails ||
                "ABC Logistics Pty Ltd\n123 Example Street\nBrisbane QLD 4000\nPhone: (07) 3123 4567"
              }</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; margin-right: 20px;">
                <div style="font-size: 36px; font-weight: bold; color: #000; text-rendering: optimizeLegibility;">${invoiceType}</div>
                ${
                  logo
                    ? `<img src="${logo}" style="max-width: 150px; max-height: 150px; margin-top: 20px; border-radius: 50%; object-fit: cover; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" />`
                    : ""
                }
              </div>
            </div>
          </div>

          <!-- Invoice Details and Total -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="flex: 1;">
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 18px; margin: 0 0 10px 0; color: #000; font-weight: bold; text-rendering: optimizeLegibility;">Bill To:</h3>
                <div style="font-size: 14px; color: #333; line-height: 1.4; white-space: pre-line; text-rendering: optimizeLegibility;">${
                  toDetails || "John Smith\n45 Sample Avenue\nSydney NSW 2000\nPhone: (02) 9123 4567"
                }</div>
              </div>
              <div style="font-size: 14px; color: #333; text-rendering: optimizeLegibility;">
                <div style="margin-bottom: 5px;"><strong>Invoice #:</strong> ${invoiceNumber}</div>
                <div style="margin-bottom: 5px;"><strong>Terms:</strong> ${terms}</div>
                <div style="margin-bottom: 5px;"><strong>Issued:</strong> ${new Date(
                  invoiceDate
                ).toLocaleDateString()}</div>
                <div style="margin-bottom: 5px;"><strong>Due:</strong> ${new Date(
                  invoiceDate
                ).toLocaleDateString()}</div>
              </div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="margin-top: 60px;">
                <div style="font-size: 18px; margin-bottom: 5px; color: #000; text-rendering: optimizeLegibility;">Invoice Total:</div>
                <div style="font-size: 32px; font-weight: bold; color: #000; text-rendering: optimizeLegibility;">$${total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #333; color: white;">
                <th style="padding: 10px; text-align: left; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Item Description</th>
                <th style="padding: 10px; text-align: right; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Price</th>
                <th style="padding: 10px; text-align: center; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Quantity</th>
                <th style="padding: 10px; text-align: right; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Tax</th>
                <th style="padding: 10px; text-align: right; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map((item) => {
                  const itemTax = item.amount * (taxRate / 100);
                  return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-size: 14px; color: #000; text-rendering: optimizeLegibility;">${
                      item.name || "No name"
                    }</td>
                    <td style="padding: 10px; text-align: right; font-size: 14px; color: #000; text-rendering: optimizeLegibility;">$${item.price.toFixed(
                      2
                    )}</td>
                    <td style="padding: 10px; text-align: center; font-size: 14px; color: #000; text-rendering: optimizeLegibility;">${
                      item.quantity
                    }</td>
                    <td style="padding: 10px; text-align: right; font-size: 14px; color: #000; text-rendering: optimizeLegibility;">$${itemTax.toFixed(
                      2
                    )}</td>
                    <td style="padding: 10px; text-align: right; font-size: 14px; font-weight: bold; color: #000; text-rendering: optimizeLegibility;">$${item.amount.toFixed(
                      2
                    )}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>

          <!-- Notes and Summary -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="flex: 1; margin-right: 40px;">
              ${
                extraNotes
                  ? `
                <div>
                  <h3 style="font-size: 18px; margin: 0 0 10px 0; color: #000; font-weight: bold; text-rendering: optimizeLegibility;">Notes:</h3>
                  <div style="font-size: 14px; color: #333; line-height: 1.4; white-space: pre-line; text-rendering: optimizeLegibility;">${extraNotes}</div>
                </div>
              `
                  : ""
              }
            </div>
            <div style="flex: 1; text-align: right;">
              <div style="font-size: 14px; margin-bottom: 10px; text-rendering: optimizeLegibility;">
                <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Subtotal:</span>
                <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${subtotal.toFixed(2)}</span>
              </div>
              ${
                discount > 0
                  ? `
                <div style="font-size: 14px; margin-bottom: 10px; text-rendering: optimizeLegibility;">
                  <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Discount:</span>
                  <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${discount.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              ${
                taxRate > 0
                  ? `
                <div style="font-size: 14px; margin-bottom: 10px; text-rendering: optimizeLegibility;">
                  <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Tax:</span>
                  <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${taxAmount.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              ${
                shipping > 0
                  ? `
                <div style="font-size: 14px; margin-bottom: 10px; text-rendering: optimizeLegibility;">
                  <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Shipping:</span>
                  <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${shipping.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <div style="border-top: 2px solid #000; padding-top: 10px; margin-top: 10px;">
                <div style="font-size: 18px; font-weight: bold; text-rendering: optimizeLegibility;">
                  <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Balance Due:</span>
                  <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            
           
          </div>
        </div>
      `;

      document.body.appendChild(invoiceDiv);

      // Convert to canvas and then to PDF with balanced quality settings
      const canvas = await html2canvas(invoiceDiv, {
        scale: 1.5, // Balanced resolution for quality and compatibility
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
        imageTimeout: 5000, // Balanced timeout
        foreignObjectRendering: false, // Disable for compatibility
        ignoreElements: (element) => {
          // Skip non-essential elements
          return element.tagName === "SCRIPT" || element.tagName === "STYLE";
        },
        onclone: (clonedDoc) => {
          // Basic DOM optimization
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.transform = "none";
              el.style.animation = "none";
              el.style.transition = "none";
              el.style.filter = "none";
            }
          });
        },
      });

      document.body.removeChild(invoiceDiv);

      // Debug canvas
      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
      console.log("Canvas has content:", canvas.width > 0 && canvas.height > 0);

      const imgData = canvas.toDataURL("image/jpeg", 0.9); // Use JPEG with high quality for reliability
      console.log("Image data length:", imgData.length);
      const pdf = new jsPDF("p", "mm", "a4"); // Keep A4 but optimize processing
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      // Download the PDF
      pdf.save(`invoice-${invoiceNumber}.pdf`);

      alert("Invoice downloaded successfully as PDF!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleSendEmail = async () => {
    if (!clientEmail) {
      alert("Please enter the client's email address");
      return;
    }

    if (!clientEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setIsEmailSending(true);

    try {
      // Show progress to user
      console.log("🚀 Starting ultra-fast email generation...");

      // Generate PDF first with optimized settings
      const invoiceDiv = document.createElement("div");
      invoiceDiv.style.position = "absolute";
      invoiceDiv.style.left = "-9999px";
      invoiceDiv.style.top = "0";
      invoiceDiv.style.width = "600px"; // Reduced width for faster processing
      invoiceDiv.style.backgroundColor = "white";
      invoiceDiv.style.padding = "15px"; // Reduced padding for faster processing
      invoiceDiv.style.fontFamily = "Arial, sans-serif";
      invoiceDiv.style.color = "#333";

      invoiceDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white; color: #333;">
          <!-- Header Section -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div style="flex: 1;">
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #333;">${
                fromDetails.split("\n")[0] || "Company Name"
              }</div>
              <div style="font-size: 14px; color: #666; line-height: 1.4; white-space: pre-line;">${
                fromDetails ||
                "Company Address\nCity, State ZIP\nPhone: (555) 123-4567"
              }</div>
            </div>
                          <div style="text-align: center; flex: 1;">
                <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; margin-right: 20px;">
                  <div style="font-size: 36px; font-weight: bold; color: #333;">${invoiceType}</div>
                  ${
                    logo
                      ? `<img src="${logo}" style="max-width: 150px; max-height: 150px; margin-top: 20px; border-radius: 50%; object-fit: cover;" />`
                      : ""
                  }
                </div>
              </div>
          </div>

          <!-- Invoice Details and Total -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="flex: 1;">
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 18px; margin: 0 0 10px 0; color: #333;">Bill To:</h3>
                <div style="font-size: 14px; color: #666; line-height: 1.4; white-space: pre-line;">${
                  toDetails || "Client Name\nClient Address\nCity, State ZIP"
                }</div>
              </div>
              <div style="font-size: 14px; color: #666;">
                <div style="margin-bottom: 5px;"><strong>Invoice #:</strong> ${invoiceNumber}</div>
                <div style="margin-bottom: 5px;"><strong>Terms:</strong> Due On Receipt</div>
                <div style="margin-bottom: 5px;"><strong>Issued:</strong> ${new Date(
                  invoiceDate
                ).toLocaleDateString()}</div>
                <div style="margin-bottom: 5px;"><strong>Due:</strong> ${new Date(
                  invoiceDate
                ).toLocaleDateString()}</div>
              </div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="margin-top: 60px;">
                <div style="font-size: 18px; margin-bottom: 5px; color: #333;">Invoice Total:</div>
                <div style="font-size: 32px; font-weight: bold; color: #333;">$${total.toFixed(
                  2
                )}</div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #333; color: white;">
                <th style="padding: 10px; text-align: left; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Item Description</th>
                <th style="padding: 10px; text-align: right; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Price</th>
                <th style="padding: 10px; text-align: center; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Quantity</th>
                <th style="padding: 10px; text-align: right; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Tax</th>
                <th style="padding: 10px; text-align: right; font-weight: bold; font-size: 14px; text-rendering: optimizeLegibility;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map((item) => {
                  const itemTax = item.amount * (taxRate / 100);
                  return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-size: 14px; color: #000; text-rendering: optimizeLegibility;">${
                      item.name || "No name"
                    }</td>
                    <td style="padding: 10px; text-align: right; font-size: 14px; color: #000; text-rendering: optimizeLegibility;">$${item.price.toFixed(
                      2
                    )}</td>
                    <td style="padding: 10px; text-align: center; font-size: 14px; color: #000; text-rendering: optimizeLegibility;">${
                      item.quantity
                    }</td>
                    <td style="padding: 10px; text-align: right; font-size: 14px; color: #000; text-rendering: optimizeLegibility;">$${itemTax.toFixed(
                      2
                    )}</td>
                    <td style="padding: 10px; text-align: right; font-size: 14px; font-weight: bold; color: #000; text-rendering: optimizeLegibility;">$${item.amount.toFixed(
                      2
                    )}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>

          <!-- Notes and Summary -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="flex: 1; margin-right: 40px;">
              ${
                extraNotes
                  ? `
                <div>
                  <h3 style="font-size: 18px; margin: 0 0 10px 0; color: #000; font-weight: bold; text-rendering: optimizeLegibility;">Notes:</h3>
                  <div style="font-size: 14px; color: #333; line-height: 1.4; white-space: pre-line; text-rendering: optimizeLegibility;">${extraNotes}</div>
                </div>
              `
                  : ""
              }
            </div>
            <div style="flex: 1; text-align: right;">
              <div style="font-size: 14px; margin-bottom: 10px; text-rendering: optimizeLegibility;">
                <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Subtotal:</span>
                <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${subtotal.toFixed(2)}</span>
              </div>
              ${
                discount > 0
                  ? `
                <div style="font-size: 14px; margin-bottom: 10px; text-rendering: optimizeLegibility;">
                  <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Discount:</span>
                  <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${discount.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              ${
                taxRate > 0
                  ? `
                <div style="font-size: 14px; margin-bottom: 10px; text-rendering: optimizeLegibility;">
                  <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Tax:</span>
                  <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${taxAmount.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              ${
                shipping > 0
                  ? `
                <div style="font-size: 14px; margin-bottom: 10px; text-rendering: optimizeLegibility;">
                  <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Shipping:</span>
                  <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${shipping.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <div style="border-top: 2px solid #000; padding-top: 10px; margin-top: 10px;">
                <div style="font-size: 18px; font-weight: bold; text-rendering: optimizeLegibility;">
                  <span style="display: inline-block; width: 100px; text-align: left; color: #000;">Balance Due:</span>
                  <span style="display: inline-block; width: 80px; text-align: right; color: #000;">$${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
           
          </div>
        </div>
      `;

      document.body.appendChild(invoiceDiv);

      // Convert to canvas and then to PDF with balanced quality settings
      const canvas = await html2canvas(invoiceDiv, {
        scale: 1.5, // Balanced resolution for quality and compatibility
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
        imageTimeout: 5000, // Balanced timeout
        foreignObjectRendering: false, // Disable for compatibility
        ignoreElements: (element) => {
          // Skip non-essential elements
          return element.tagName === "SCRIPT" || element.tagName === "STYLE";
        },
        onclone: (clonedDoc) => {
          // Basic DOM optimization
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.transform = "none";
              el.style.animation = "none";
              el.style.transition = "none";
              el.style.filter = "none";
            }
          });
        },
      });

      document.body.removeChild(invoiceDiv);

      // Debug canvas
      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
      console.log("Canvas has content:", canvas.width > 0 && canvas.height > 0);

      const imgData = canvas.toDataURL("image/jpeg", 0.9); // Use JPEG with high quality for reliability
      console.log("Image data length:", imgData.length);
      const pdf = new jsPDF("p", "mm", "a4"); // Keep A4 but optimize processing
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      // Convert PDF to base64
      console.log("⚡ Converting PDF to base64...");
      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      console.log("📧 Sending email with lightning speed...");
      // Send email with PDF attachment
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: clientEmail,
          invoiceNumber,
          invoiceType,
          fromDetails,
          toDetails,
          total,
          invoiceDate,
          items,
          taxRate,
          discount,
          shipping,
          extraNotes,
          logo,
          pdfAttachment: pdfBase64,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Invoice sent successfully via email with PDF attachment!");
      } else {
        alert(`Error sending email: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email. Please try again.");
    } finally {
      setIsEmailSending(false);
    }
  };

  const handlePreviewInvoice = () => {
    // Open preview in new window
    const previewWindow = window.open("", "_blank", "width=800,height=600");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice Preview - ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .invoice-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
            .company-info { flex: 1; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #333; }
            .company-details { font-size: 14px; color: #666; line-height: 1.4; }
            .invoice-header { text-align: center; flex: 1; }
            .invoice-title { font-size: 36px; font-weight: bold; color: #333; margin-bottom: 8px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .bill-to { flex: 1; }
            .bill-to h3 { font-size: 18px; margin: 0 0 10px 0; color: #333; }
            .bill-to-content { font-size: 14px; color: #666; line-height: 1.4; }
            .invoice-meta { font-size: 14px; color: #666; }
            .invoice-total { text-align: right; flex: 1; }
            .total-label { font-size: 18px; margin-bottom: 10px; color: #333; }
            .total-amount { font-size: 32px; font-weight: bold; color: #333; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th { background: #333; color: white; padding: 15px; text-align: left; font-weight: bold; font-size: 14px; }
            .items-table th.price, .items-table th.quantity, .items-table th.tax, .items-table th.total { text-align: right; }
            .items-table th.quantity { text-align: center; }
            .items-table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
            .items-table td.price, .items-table td.quantity, .items-table td.tax, .items-table td.total { text-align: right; }
            .items-table td.quantity { text-align: center; }
            .items-table td.total { font-weight: bold; }
            .summary-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .notes { flex: 1; margin-right: 40px; }
            .notes h3 { font-size: 18px; margin: 0 0 10px 0; color: #333; }
            .notes-content { font-size: 14px; color: #666; line-height: 1.4; }
            .summary { flex: 1; text-align: right; }
            .summary-row { font-size: 14px; margin-bottom: 10px; }
            .summary-row span:first-child { display: inline-block; width: 100px; text-align: left; }
            .summary-row span:last-child { display: inline-block; width: 80px; text-align: right; }
            .balance-due { border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; font-size: 18px; font-weight: bold; }
            .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
            .footer-brand { display: flex; align-items: center; }
            .brand-icon { width: 16px; height: 16px; background: #007bff; border-radius: 2px; margin: 0 5px; display: flex; align-items: center; justify-content: center; }
            .brand-icon span { color: white; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-info">
                <div class="company-name">${
                  fromDetails.split("\n")[0] || "Company Name"
                }</div>
                <div class="company-details">${
                  fromDetails ||
                  "Company Address\nCity, State ZIP\nPhone: (555) 123-4567"
                }</div>
              </div>
              <div class="invoice-header">
                <div class="invoice-title" style="margin-bottom: 20px;">${invoiceType}</div>
                ${
                  logo
                    ? `<img src="${logo}" style="max-width: 150px; max-height: 150px; border-radius: 50%; object-fit: cover;" />`
                    : ""
                }
              </div>
            </div>
            
            <div class="invoice-details">
              <div class="bill-to">
                <h3>Bill To:</h3>
                <div class="bill-to-content">${
                  toDetails || "Client Name\nClient Address\nCity, State ZIP"
                }</div>
                <div class="invoice-meta" style="margin-top: 20px;">
                  <div style="margin-bottom: 5px;"><strong>Invoice #:</strong> ${invoiceNumber}</div>
                  <div style="margin-bottom: 5px;"><strong>Terms:</strong> ${terms}</div>
                  <div style="margin-bottom: 5px;"><strong>Issued:</strong> ${new Date(
                    invoiceDate
                  ).toLocaleDateString()}</div>
                  <div style="margin-bottom: 5px;"><strong>Due:</strong> ${new Date(
                    invoiceDate
                  ).toLocaleDateString()}</div>
                </div>
              </div>
              <div class="invoice-total">
                <div style="margin-top: 60px; text-align: center;">
                  <div style="font-size: 18px; margin-bottom: 5px; color: #333;">Invoice Total:</div>
                  <div style="font-size: 32px; font-weight: bold; color: #333;">$${total.toFixed(
                    2
                  )}</div>
                </div>
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th class="price">Price</th>
                  <th class="quantity">Quantity</th>
                  <th class="tax">Tax</th>
                  <th class="total">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map((item) => {
                    const itemTax = item.amount * (taxRate / 100);
                    return `
                    <tr>
                      <td>${item.name || "No name"}</td>
                      <td class="price">$${item.price.toFixed(2)}</td>
                      <td class="quantity">${item.quantity}</td>
                      <td class="tax">$${itemTax.toFixed(2)}</td>
                      <td class="total">$${item.amount.toFixed(2)}</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
            
            <div class="summary-section">
              <div class="notes">
                ${
                  extraNotes
                    ? `
                  <div>
                    <h3>Notes:</h3>
                    <div class="notes-content">${extraNotes}</div>
                  </div>
                `
                    : ""
                }
              </div>
              <div class="summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>$${subtotal.toFixed(2)}</span>
                </div>
                ${
                  discount > 0
                    ? `
                  <div class="summary-row">
                    <span>Discount:</span>
                    <span>$${discount.toFixed(2)}</span>
                  </div>
                `
                    : ""
                }
                ${
                  taxRate > 0
                    ? `
                  <div class="summary-row">
                    <span>Tax:</span>
                    <span>$${taxAmount.toFixed(2)}</span>
                  </div>
                `
                    : ""
                }
                ${
                  shipping > 0
                    ? `
                  <div class="summary-row">
                    <span>Shipping:</span>
                    <span>$${shipping.toFixed(2)}</span>
                  </div>
                `
                    : ""
                }
                <div class="summary-row balance-due">
                  <span>Balance Due:</span>
                  <span>$${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
         
          </div>
        </body>
        </html>
      `);
      previewWindow.document.close();
    } else {
      alert("Please allow pop-ups to view the invoice preview.");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl float-animation" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pulse-animation" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center glow-animation">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">InvoiceCraft</h1>
          </div>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Create professional invoices with our modern, intuitive interface.
            Beautiful design meets powerful functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Invoice Details */}
          <div className="xl:col-span-2 space-y-8">
            {/* Invoice Header Card */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white/80" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Invoice Details
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Document Type
                    </label>
                    <select
                      value={invoiceType}
                      onChange={(e) => setInvoiceType(e.target.value)}
                      className="w-full px-4 py-3 glass-input rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 [&>option]:bg-gray-800 [&>option]:text-white"
                    >
                      <option value="Invoice">Invoice</option>
                      <option value="Quote">Quote</option>
                      <option value="Estimate">Estimate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      From (Sender)
                    </label>
                    <textarea
                      value={fromDetails}
                      onChange={(e) => setFromDetails(e.target.value)}
                      placeholder={`ABC Logistics Pty Ltd
123 Example Street
Brisbane QLD 4000
Phone: (07) 3123 4567`}
                      className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 h-32 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      To (Recipient)
                    </label>
                    <textarea
                      value={toDetails}
                      onChange={(e) => setToDetails(e.target.value)}
                      placeholder={`John Smith
45 Sample Avenue
Sydney NSW 2000
Phone: (02) 9123 4567`}
                      className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 h-32 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client Email
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <LogoUpload onLogoChange={setLogo} />

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                      placeholder="INV-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Payment Terms
                    </label>
                    <select
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="w-full px-4 py-3 glass-input rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 [&>option]:bg-gray-800 [&>option]:text-white"
                    >
                      <option value="Due On Receipt">Due On Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Invoice Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 pr-12"
                      />
                      <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white/80" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Items & Services
                  </h2>
                </div>
                <button
                  onClick={addNewItem}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 glass rounded-xl text-white hover:neon-border transition-all duration-300 whitespace-nowrap text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Item</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="glass rounded-xl p-6 group hover:scale-[1.02] transition-all duration-300"
                  >
                    {/* Mobile Layout - Stack vertically on small screens */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Item Name - Full width on mobile, 5 cols on desktop */}
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-white/60 mb-2 md:hidden">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(item.id, "name", e.target.value)
                          }
                          placeholder="Item name..."
                          className="w-full px-4 py-3 glass-input rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        />
                      </div>

                      {/* Price - Full width on mobile, 2 cols on desktop */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/60 mb-2 md:hidden">
                          Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                            $
                          </span>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                            className="w-full pl-8 pr-3 py-3 glass-input rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Quantity - Full width on mobile, 2 cols on desktop */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/60 mb-2 md:hidden">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          min="1"
                          className="w-full px-3 py-3 glass-input rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                        />
                      </div>

                      {/* Amount - Full width on mobile, 2 cols on desktop */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/60 mb-2 md:hidden">
                          Amount
                        </label>
                        <div className="px-3 py-3 text-white font-semibold text-lg bg-white/5 rounded-lg border border-white/10">
                          ${item.amount.toFixed(2)}
                        </div>
                      </div>

                      {/* Remove Button - Full width on mobile, 1 col on desktop */}
                      <div className="md:col-span-1">
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-full md:w-auto text-red-400 hover:text-red-300 p-3 md:p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center gap-2 md:gap-0"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="md:hidden">Remove Item</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white/80" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Additional Notes
                </h2>
              </div>
              <textarea
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                placeholder="Enter any additional notes, terms, or special instructions..."
                className="w-full px-4 py-4 glass-input rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 h-32 resize-none"
              />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-8">
            <TaxDiscountSection
              subtotal={subtotal}
              taxRate={taxRate}
              discount={discount}
              shipping={shipping}
              onTaxRateChange={setTaxRate}
              onDiscountChange={setDiscount}
              onShippingChange={setShipping}
            />

            {/* Action Buttons */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <button
                onClick={handleDownloadInvoice}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <Download className="h-5 w-5" />
                Generate Invoice
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isEmailSending}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl ${
                  isEmailSending
                    ? "bg-gray-500 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                }`}
              >
                {isEmailSending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />⚡ Ultra-Fast
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send Invoice
                  </>
                )}
              </button>
              <button
                onClick={handlePreviewInvoice}
                className="w-full flex items-center justify-center gap-3 glass text-white px-6 py-4 rounded-xl hover:neon-border transition-all duration-300 font-semibold"
              >
                <Eye className="h-5 w-5" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
