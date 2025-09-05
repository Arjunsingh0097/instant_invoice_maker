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
  X,
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
  const [showPreview, setShowPreview] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      name: "Sample Item",
      price: 100,
      quantity: 1,
      amount: 100,
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
  const total = subtotal - discount + taxAmount + shipping;

  const handleDownloadInvoice = async () => {
    try {
      // Create a temporary div for the invoice content
      const invoiceDiv = document.createElement("div");
      invoiceDiv.style.position = "absolute";
      invoiceDiv.style.left = "-9999px";
      invoiceDiv.style.top = "0";
      // Force consistent PDF settings for all devices - desktop layout
      invoiceDiv.style.width = "800px";
      invoiceDiv.style.maxWidth = "800px";
      invoiceDiv.style.minWidth = "800px";
      invoiceDiv.style.backgroundColor = "white";
      invoiceDiv.style.padding = "20px";
      invoiceDiv.style.fontFamily = "Arial, sans-serif";
      invoiceDiv.style.color = "#333";
      invoiceDiv.style.fontSize = "16px";
      invoiceDiv.style.lineHeight = "1.4";
      // Force desktop layout
      invoiceDiv.style.display = "block";
      invoiceDiv.style.boxSizing = "border-box";

      invoiceDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; width: 100%; max-width: 100%; margin: 0; padding: 10px; background: white; color: #333; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; box-sizing: border-box;">
          <!-- Header Section - DRAFT INVOICE Layout -->
          <div style="position: relative; margin-bottom: 30px;">
            <!-- Top Row - Logo only -->
            <div style="display: flex; justify-content: flex-end; align-items: flex-start; margin-bottom: 20px;">
              <!-- Logo -->
              <div>
                  ${
                    logo
                     ? `<img src="${logo}" style="width: 100px; height: 100px; object-fit: contain; border-radius: 50%; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" />`
                      : ""
                  }
              </div>
          </div>

            <!-- Bottom Row - Company Details and Invoice Details -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <!-- Left Side - Company Details -->
            <div style="flex: 1;">
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px; color: #000; letter-spacing: 1px; text-rendering: optimizeLegibility;">
                  ${invoiceType.toUpperCase()} 
              </div>
                <div style="font-size: 18px; font-weight: 500; color: #000; margin-bottom: 8px; text-rendering: optimizeLegibility;">
                  ${fromDetails.split("\n")[0] || "Your Company Name"}
              </div>
                <div style="font-size: 12px; color: #333; line-height: 1.3; text-rendering: optimizeLegibility; white-space: pre-line;">
                  ${fromDetails || "Your Company Name\nYour Company Address\nCity, State ZIP\nCountry"}
            </div>
              </div>
              
              <!-- Right Side - Invoice Details -->
              <div style="text-align: right; flex: 1;">
                <div style="text-align: left; margin-top: 10px;">
                  <div style="font-size: 12px; margin-bottom: 4px; color: #666; text-rendering: optimizeLegibility;">Invoice Date</div>
                  <div style="font-size: 14px; font-weight: 600; color: #000; margin-bottom: 20px; text-rendering: optimizeLegibility;">${new Date(invoiceDate).toLocaleDateString()}</div>
                  <div style="font-size: 12px; margin-bottom: 4px; color: #666; text-rendering: optimizeLegibility;">Invoice Number</div>
                  <div style="font-size: 14px; font-weight: 600; color: #000; text-rendering: optimizeLegibility;">${invoiceNumber}</div>
              </div>
            </div>
            </div>
            
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #d1d5db; table-layout: fixed;">
            <thead>
              <tr style="background: #f8f9fa; color: #000;">
                <th style="padding: 8px; text-align: left; font-weight: bold; font-size: 16px; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; width: 50%;">Description</th>
                <th style="padding: 8px; text-align: right; font-weight: bold; font-size: 16px; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; width: 20%;">Unit Price</th>
                <th style="padding: 8px; text-align: center; font-weight: bold; font-size: 16px; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; width: 15%;">Quantity</th>
                <th style="padding: 8px; text-align: right; font-weight: bold; font-size: 16px; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; width: 15%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map((item) => {
                  return `
                  <tr style="border-bottom: 1px solid #e5e7eb; background: white;">
                    <td style="padding: 8px; font-size: 16px; color: #111827; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; vertical-align: top;">${
                      item.name || ""
                    }</td>
                    <td style="padding: 8px; text-align: right; font-size: 16px; color: #111827; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; vertical-align: top;">$${item.price.toFixed(
                      2
                    )}</td>
                    <td style="padding: 8px; text-align: center; font-size: 16px; color: #111827; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; vertical-align: top;">${
                      item.quantity
                    }</td>
                    <td style="padding: 8px; text-align: right; font-size: 16px; font-weight: bold; color: #111827; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; vertical-align: top;">$${item.amount.toFixed(
                      2
                    )}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>

          <!-- Summary Section -->
          <div style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 30px;">
            <div style="text-align: right; min-width: 200px;">
              <div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; text-rendering: optimizeLegibility;">
                <span style="color: #111827; font-weight: 600;">Subtotal</span>
                <span style="color: #111827; font-weight: bold;">$${subtotal.toFixed(2)}</span>
              </div>
              ${
                discount > 0
                  ? `<div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; text-rendering: optimizeLegibility;">
                      <span style="color: #111827; font-weight: 600;">Discount</span>
                      <span style="color: #111827; font-weight: bold;">-$${discount.toFixed(2)}</span>
                    </div>`
                  : ""
              }
              ${
                shipping > 0
                  ? `<div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; text-rendering: optimizeLegibility;">
                      <span style="color: #111827; font-weight: 600;">Shipping</span>
                      <span style="color: #111827; font-weight: bold;">$${shipping.toFixed(2)}</span>
                    </div>`
                  : ""
              }
              ${
                taxRate > 0
                  ? `<div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; text-rendering: optimizeLegibility;">
                      <span style="color: #111827; font-weight: 600;">Tax (${taxRate}%)</span>
                      <span style="color: #111827; font-weight: bold;">$${taxAmount.toFixed(2)}</span>
                    </div>`
                  : ""
              }
              <div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; border-top: 1px solid #d1d5db; padding-top: 8px; text-rendering: optimizeLegibility;">
                <span style="color: #111827; font-weight: bold;">TOTAL</span>
                <span style="color: #111827; font-weight: bold;">$${total.toFixed(2)}</span>
                </div>
              </div>
          </div>

          <!-- Payment Advice Section -->
          <div style="border-top: 2px dashed #ccc; padding-top: 20px; margin-top: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="font-size: 16px; font-weight: bold; color: #000; margin-right: 10px; text-rendering: optimizeLegibility;">PAYMENT ADVICE</div>
              <div style="font-size: 20px; color: #ccc;">✂️</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
              <div style="flex: 1;">
                <div style="font-size: 12px; margin-bottom: 4px; color: #666; text-rendering: optimizeLegibility;">To:</div>
                <div style="font-size: 12px; color: #333; line-height: 1.3; text-rendering: optimizeLegibility; white-space: pre-line;">
                  ${toDetails || "Client Name\nClient Address\nCity, State ZIP\nCountry"}
                </div>
              </div>
              <div style="flex: 1; text-align: right;">
                <div style="font-size: 12px; color: #333; text-rendering: optimizeLegibility; white-space: pre-line;">
                  ${extraNotes || "Note: The sender will write additional details here"}
                  ${discount > 0 ? `\nDiscount: $${discount.toFixed(2)}` : ""}
                  ${shipping > 0 ? `\nShipping: $${shipping.toFixed(2)}` : ""}
                  ${taxRate > 0 ? `\nTax Rate: ${taxRate}%` : ""}
                </div>
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; margin-bottom: 4px; color: #666; text-rendering: optimizeLegibility;">
                Amount Enclosed: <span style="font-weight: bold; color: #000;">$${total.toFixed(2)}</span>
              </div>
              <div style="border-bottom: 1px solid #333; height: 20px; margin-bottom: 4px;"></div>
              <div style="font-size: 10px; color: #666; text-rendering: optimizeLegibility;">Enter the amount you are paying above</div>
            </div>
            
            <div style="font-size: 10px; color: #666; text-align: center; text-rendering: optimizeLegibility;">
              Registered Office: ${fromDetails || "123 Progress Lane, Seattle, Washington, 98101, United States"}
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
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
        imageTimeout: 10000, // Longer timeout for mobile
        foreignObjectRendering: false, // Disable for compatibility
        width: invoiceDiv.scrollWidth, // Use actual content width
        height: invoiceDiv.scrollHeight, // Use actual content height
        ignoreElements: (element) => {
          // Skip non-essential elements
          return element.tagName === "SCRIPT" || element.tagName === "STYLE";
        },
        onclone: (clonedDoc) => {
          // Force desktop viewport and layout with minimal spacing
          const viewport = clonedDoc.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          } else {
            const meta = clonedDoc.createElement('meta');
            meta.setAttribute('name', 'viewport');
            meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            clonedDoc.head.appendChild(meta);
          }
          
          // Minimize body margins and padding
          const body = clonedDoc.body;
          if (body) {
            body.style.margin = "0";
            body.style.padding = "0";
            body.style.overflow = "visible";
          }
          
          // Force desktop layout on all elements
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.transform = "none";
              el.style.animation = "none";
              el.style.transition = "none";
              el.style.filter = "none";
              el.style.maxWidth = "none";
              el.style.minWidth = "none";
              el.style.width = el.style.width || "auto";
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

      // Always try single page first - scale down if needed
      const maxSinglePageHeight = pdfHeight - 40; // Leave more margin
      
      if (imgHeight <= maxSinglePageHeight) {
        // Fits on single page - add image at top
        pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);
      } else {
        // Scale down to fit on single page
        const scaleFactor = maxSinglePageHeight / imgHeight;
        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = imgHeight * scaleFactor;
        const xPosition = (pdfWidth - scaledWidth) / 2;
        
        pdf.addImage(imgData, "JPEG", xPosition, 10, scaledWidth, scaledHeight);
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

    if (!fromDetails.trim()) {
      alert("Please enter your company details");
      return;
    }

    if (!toDetails.trim()) {
      alert("Please enter the client's details");
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
      // Force consistent PDF settings for all devices - desktop layout
      invoiceDiv.style.width = "800px";
      invoiceDiv.style.maxWidth = "800px";
      invoiceDiv.style.minWidth = "800px";
      invoiceDiv.style.backgroundColor = "white";
      invoiceDiv.style.padding = "20px";
      invoiceDiv.style.fontFamily = "Arial, sans-serif";
      invoiceDiv.style.color = "#333";
      invoiceDiv.style.fontSize = "16px";
      invoiceDiv.style.lineHeight = "1.4";
      // Force desktop layout
      invoiceDiv.style.display = "block";
      invoiceDiv.style.boxSizing = "border-box";

      invoiceDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; width: 100%; max-width: 100%; margin: 0; padding: 10px; background: white; color: #333; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; box-sizing: border-box;">
          <!-- Header Section - DRAFT INVOICE Layout -->
          <div style="position: relative; margin-bottom: 30px;">
            <!-- Top Row - Logo only -->
            <div style="display: flex; justify-content: flex-end; align-items: flex-start; margin-bottom: 20px;">
              <!-- Logo -->
              <div>
                ${
                  logo
                    ? `<img src="${logo}" style="width: 100px; height: 100px; object-fit: contain; border-radius: 50%; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" />`
                    : ""
                }
              </div>
            </div>
            
            <!-- Bottom Row - Company Details and Invoice Details -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <!-- Left Side - Company Details -->
              <div style="flex: 1;">
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px; color: #000; letter-spacing: 1px; text-rendering: optimizeLegibility;">
                  ${invoiceType.toUpperCase()} 
                </div>
                <div style="font-size: 18px; font-weight: 500; color: #000; margin-bottom: 8px; text-rendering: optimizeLegibility;">
                  ${fromDetails.split("\n")[0] || "Your Company Name"}
              </div>
                <div style="font-size: 12px; color: #333; line-height: 1.3; text-rendering: optimizeLegibility; white-space: pre-line;">
                  ${fromDetails || "Your Company Name\nYour Company Address\nCity, State ZIP\nCountry"}
                </div>
              </div>
              
              <!-- Right Side - Invoice Details -->
              <div style="text-align: right; flex: 1;">
                <div style="text-align: left; margin-top: 10px;">
                  <div style="font-size: 12px; margin-bottom: 4px; color: #666; text-rendering: optimizeLegibility;">Invoice Date</div>
                  <div style="font-size: 14px; font-weight: 600; color: #000; margin-bottom: 20px; text-rendering: optimizeLegibility;">${new Date(invoiceDate).toLocaleDateString()}</div>
                  <div style="font-size: 12px; margin-bottom: 4px; color: #666; text-rendering: optimizeLegibility;">Invoice Number</div>
                  <div style="font-size: 14px; font-weight: 600; color: #000; text-rendering: optimizeLegibility;">${invoiceNumber}</div>
                </div>
              </div>
            </div>
            
          </div>
            
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #d1d5db; table-layout: fixed;">
              <thead>
              <tr style="background: #f8f9fa; color: #000;">
                <th style="padding: 10px 8px; text-align: left; font-weight: bold; font-size: 14px; border: 1px solid #d1d5db; width: 50%;">Description</th>
                <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 14px; border: 1px solid #d1d5db; width: 20%;">Price</th>
                <th style="padding: 10px 8px; text-align: center; font-weight: bold; font-size: 14px; border: 1px solid #d1d5db; width: 15%;">Quantity</th>
                <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 14px; border: 1px solid #d1d5db; width: 15%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map((item) => {
                    return `
                    <tr style="background: white;">
                      <td style="padding: 8px; font-size: 14px; color: #111827; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; vertical-align: top;">${
                        item.name || "No name"
                      }</td>
                      <td style="padding: 8px; text-align: right; font-size: 14px; color: #111827; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; vertical-align: top;">$${item.price.toFixed(
                        2
                      )}</td>
                      <td style="padding: 8px; text-align: center; font-size: 14px; color: #111827; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; vertical-align: top;">${
                        item.quantity
                      }</td>
                      <td style="padding: 8px; text-align: right; font-size: 14px; font-weight: bold; color: #111827; text-rendering: optimizeLegibility; border: 1px solid #d1d5db; vertical-align: top;">$${item.amount.toFixed(
                        2
                      )}</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
            
          <!-- Summary Section -->
          <div style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 30px;">
            <div style="text-align: right; min-width: 200px;">
              <div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; text-rendering: optimizeLegibility;">
                <span style="color: #111827; font-weight: 600;">Subtotal</span>
                <span style="color: #111827; font-weight: bold;">$${subtotal.toFixed(2)}</span>
                </div>
                ${
                  discount > 0
                  ? `<div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; text-rendering: optimizeLegibility;">
                      <span style="color: #111827; font-weight: 600;">Discount</span>
                      <span style="color: #111827; font-weight: bold;">-$${discount.toFixed(2)}</span>
                    </div>`
                    : ""
                }
                ${
                shipping > 0
                  ? `<div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; text-rendering: optimizeLegibility;">
                      <span style="color: #111827; font-weight: 600;">Shipping</span>
                      <span style="color: #111827; font-weight: bold;">$${shipping.toFixed(2)}</span>
                    </div>`
                    : ""
                }
                ${
                taxRate > 0
                  ? `<div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; text-rendering: optimizeLegibility;">
                      <span style="color: #111827; font-weight: 600;">Tax (${taxRate}%)</span>
                      <span style="color: #111827; font-weight: bold;">$${taxAmount.toFixed(2)}</span>
                    </div>`
                  : ""
              }
              <div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; border-top: 1px solid #d1d5db; padding-top: 8px; text-rendering: optimizeLegibility;">
                <span style="color: #111827; font-weight: bold;">TOTAL</span>
                <span style="color: #111827; font-weight: bold;">$${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
          <!-- Payment Advice Section -->
          <div style="border-top: 2px dashed #ccc; padding-top: 20px; margin-top: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="font-size: 16px; font-weight: bold; color: #000; margin-right: 10px; text-rendering: optimizeLegibility;">PAYMENT ADVICE</div>
              <div style="font-size: 20px; color: #ccc;">✂️</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
              <div style="flex: 1;">
                <div style="font-size: 12px; margin-bottom: 4px; color: #666; text-rendering: optimizeLegibility;">To:</div>
                <div style="font-size: 12px; color: #333; line-height: 1.3; text-rendering: optimizeLegibility; white-space: pre-line;">
                  ${toDetails || "Client Name\nClient Address\nCity, State ZIP\nCountry"}
          </div>
              </div>
              <div style="flex: 1; text-align: right;">
                <div style="font-size: 12px; color: #333; text-rendering: optimizeLegibility; white-space: pre-line;">
                  ${extraNotes || "Note: The sender will write additional details here"}
                  ${discount > 0 ? `\nDiscount: $${discount.toFixed(2)}` : ""}
                  ${shipping > 0 ? `\nShipping: $${shipping.toFixed(2)}` : ""}
                  ${taxRate > 0 ? `\nTax Rate: ${taxRate}%` : ""}
                </div>
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; margin-bottom: 4px; color: #666; text-rendering: optimizeLegibility;">
                Amount Enclosed: <span style="font-weight: bold; color: #000;">$${total.toFixed(2)}</span>
              </div>
              <div style="border-bottom: 1px solid #333; height: 20px; margin-bottom: 4px;"></div>
              <div style="font-size: 10px; color: #666; text-rendering: optimizeLegibility;">Enter the amount you are paying above</div>
            </div>
            
            <div style="font-size: 10px; color: #666; text-align: center; text-rendering: optimizeLegibility;">
              Registered Office: ${fromDetails || "123 Progress Lane, Seattle, Washington, 98101, United States"}
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
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
        imageTimeout: 10000, // Longer timeout for mobile
        foreignObjectRendering: false, // Disable for compatibility
        width: invoiceDiv.scrollWidth, // Use actual content width
        height: invoiceDiv.scrollHeight, // Use actual content height
        ignoreElements: (element) => {
          // Skip non-essential elements
          return element.tagName === "SCRIPT" || element.tagName === "STYLE";
        },
        onclone: (clonedDoc) => {
          // Force desktop viewport and layout
          const viewport = clonedDoc.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=800, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    } else {
            const meta = clonedDoc.createElement('meta');
            meta.setAttribute('name', 'viewport');
            meta.setAttribute('content', 'width=800, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            clonedDoc.head.appendChild(meta);
          }
          
          // Minimize body margins and padding
          const body = clonedDoc.body;
          if (body) {
            body.style.margin = "0";
            body.style.padding = "0";
            body.style.overflow = "visible";
          }
          
          // Force desktop layout on all elements
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.transform = "none";
              el.style.animation = "none";
              el.style.transition = "none";
              el.style.filter = "none";
              el.style.maxWidth = "none";
              el.style.minWidth = "none";
              el.style.width = el.style.width || "auto";
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

      // Always try single page first - scale down if needed
      const maxSinglePageHeight = pdfHeight - 40; // Leave more margin
      
      if (imgHeight <= maxSinglePageHeight) {
        // Fits on single page - add image at top
        pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);
      } else {
        // Scale down to fit on single page
        const scaleFactor = maxSinglePageHeight / imgHeight;
        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = imgHeight * scaleFactor;
        const xPosition = (pdfWidth - scaledWidth) / 2;
        
        pdf.addImage(imgData, "JPEG", xPosition, 10, scaledWidth, scaledHeight);
      }

      // Convert PDF to base64
      console.log("⚡ Converting PDF to base64...");
      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      console.log("📧 Sending email with lightning speed...");
      console.log("Email data:", {
        to: clientEmail,
        invoiceNumber,
        invoiceType,
        fromDetails: fromDetails.trim(),
        toDetails: toDetails.trim(),
        total,
        invoiceDate,
        items: items.length,
        taxRate,
        discount,
        shipping,
        extraNotes,
        logo: !!logo
      });
      
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
          fromDetails: fromDetails.trim(),
          toDetails: toDetails.trim(),
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
    console.log("Preview clicked - Items:", items);
    console.log("Items length:", items.length);
    console.log("Items details:", items.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, amount: item.amount })));
    console.log("Subtotal:", subtotal);
    console.log("Total:", total);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl max-h-[90vh] sm:max-h-[85vh] lg:max-h-[80vh] bg-white rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Invoice Preview</h2>
              <button
                onClick={closePreview}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              </div>
            
            {/* Preview Content - Exact PDF Structure */}
            <div className="overflow-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-80px)] lg:max-h-[calc(80vh-80px)] p-4 sm:p-6 lg:p-8">
              <div className="w-full" style={{minWidth: "800px"}}>
                {/* Invoice Preview Content - Exact PDF HTML */}
                <div 
                  style={{
                    fontFamily: "Arial, sans-serif",
                    width: "100%",
                    maxWidth: "100%",
                    margin: "0 auto",
                    padding: "20px",
                    background: "white",
                    color: "#333",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    boxSizing: "border-box",
                    minHeight: "fit-content",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  {/* Header Section - DRAFT INVOICE Layout */}
                  <div style={{position: "relative", marginBottom: "30px"}}>
                    {/* Top Row - Logo only */}
                    <div style={{display: "flex", justifyContent: "flex-end", alignItems: "flex-start", marginBottom: "20px"}}>
                      {/* Logo */}
                      <div>
                                                 {logo && (
                           <img 
                             src={logo} 
                             alt="Company Logo" 
                             style={{
                               width: "100px", 
                               height: "100px", 
                               objectFit: "contain",
                               borderRadius: "50%"
                             }} 
                           />
                         )}
                      </div>
                    </div>
                    
                    {/* Bottom Row - Company Details and Invoice Details */}
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                      {/* Left Side - Company Details */}
                      <div style={{flex: 1}}>
                        <div style={{fontSize: "32px", fontWeight: "bold", marginBottom: "8px", color: "#000", letterSpacing: "1px"}}>
                          {invoiceType.toUpperCase()}
                        </div>
                        <div style={{fontSize: "18px", fontWeight: "500", color: "#000", marginBottom: "8px"}}>
                          {fromDetails.split("\n")[0] || "Your Company Name"}
                        </div>
                        <div style={{fontSize: "12px", color: "#333", lineHeight: "1.3", whiteSpace: "pre-line"}}>
                          {fromDetails || "Your Company Name\nYour Company Address\nCity, State ZIP\nCountry"}
                        </div>
                      </div>
                      
                                             {/* Right Side - Invoice Details */}
                       <div style={{textAlign: "right", flex: 1}}>
                         <div style={{textAlign: "left", marginTop: "10px"}}>
                           <div style={{fontSize: "12px", marginBottom: "4px", color: "#666"}}>Invoice Date</div>
                           <div style={{fontSize: "14px", fontWeight: "600", color: "#000", marginBottom: "20px"}}>{new Date(invoiceDate).toLocaleDateString()}</div>
                           <div style={{fontSize: "12px", marginBottom: "4px", color: "#666"}}>Invoice Number</div>
                           <div style={{fontSize: "14px", fontWeight: "600", color: "#000"}}>{invoiceNumber}</div>
                         </div>
                       </div>
                    </div>
                    
                  </div>
            
                  {/* Items Table */}
                  <table style={{width: "100%", borderCollapse: "collapse", marginBottom: "20px", border: "1px solid #d1d5db", tableLayout: "fixed"}}>
              <thead>
                      <tr style={{background: "#f8f9fa", color: "#000"}}>
                        <th style={{padding: "10px 8px", textAlign: "left", fontWeight: "bold", fontSize: "14px", border: "1px solid #d1d5db", width: "50%"}}>Description</th>
                        <th style={{padding: "10px 8px", textAlign: "right", fontWeight: "bold", fontSize: "14px", border: "1px solid #d1d5db", width: "20%"}}>Unit Price</th>
                        <th style={{padding: "10px 8px", textAlign: "center", fontWeight: "bold", fontSize: "14px", border: "1px solid #d1d5db", width: "15%"}}>Quantity</th>
                        <th style={{padding: "10px 8px", textAlign: "right", fontWeight: "bold", fontSize: "14px", border: "1px solid #d1d5db", width: "15%"}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                      {items && items.length > 0 ? (
                        items.map((item, index) => {
                          return (
                            <tr key={item.id} style={{borderBottom: "1px solid #e5e7eb", background: "white"}}>
                              <td style={{padding: "10px 8px", fontSize: "14px", color: "#111827", border: "1px solid #d1d5db", verticalAlign: "top"}}>
                                {item.name || ""}
                              </td>
                              <td style={{padding: "10px 8px", textAlign: "right", fontSize: "14px", color: "#111827", border: "1px solid #d1d5db", verticalAlign: "top"}}>
                                ${item.price.toFixed(2)}
                              </td>
                              <td style={{padding: "10px 8px", textAlign: "center", fontSize: "14px", color: "#111827", border: "1px solid #d1d5db", verticalAlign: "top"}}>
                                {item.quantity}
                              </td>
                              <td style={{padding: "10px 8px", textAlign: "right", fontSize: "14px", fontWeight: "bold", color: "#111827", border: "1px solid #d1d5db", verticalAlign: "top"}}>
                                ${item.amount.toFixed(2)}
                              </td>
                    </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} style={{padding: "32px", textAlign: "center", color: "#6b7280", border: "1px solid #d1d5db"}}>
                            No items added yet. Please add items in the form above.
                          </td>
                        </tr>
                      )}
              </tbody>
            </table>
            
                  {/* Summary Section */}
                  <div style={{display: "flex", justifyContent: "flex-end", alignItems: "flex-end", marginBottom: "30px"}}>
                    <div style={{textAlign: "right", minWidth: "200px"}}>
                      <div style={{fontSize: "14px", marginBottom: "8px", display: "flex", justifyContent: "space-between"}}>
                        <span style={{color: "#111827", fontWeight: "600"}}>Subtotal</span>
                        <span style={{color: "#111827", fontWeight: "bold"}}>${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div style={{fontSize: "14px", marginBottom: "8px", display: "flex", justifyContent: "space-between"}}>
                          <span style={{color: "#111827", fontWeight: "600"}}>Discount</span>
                          <span style={{color: "#111827", fontWeight: "bold"}}>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      {shipping > 0 && (
                        <div style={{fontSize: "14px", marginBottom: "8px", display: "flex", justifyContent: "space-between"}}>
                          <span style={{color: "#111827", fontWeight: "600"}}>Shipping</span>
                          <span style={{color: "#111827", fontWeight: "bold"}}>${shipping.toFixed(2)}</span>
                        </div>
                      )}
                      {taxRate > 0 && (
                        <div style={{fontSize: "14px", marginBottom: "8px", display: "flex", justifyContent: "space-between"}}>
                          <span style={{color: "#111827", fontWeight: "600"}}>Tax ({taxRate}%)</span>
                          <span style={{color: "#111827", fontWeight: "bold"}}>${taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{fontSize: "14px", marginBottom: "8px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #d1d5db", paddingTop: "8px"}}>
                        <span style={{color: "#111827", fontWeight: "bold"}}>TOTAL</span>
                        <span style={{color: "#111827", fontWeight: "bold"}}>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Advice Section */}
                  <div style={{borderTop: "2px dashed #ccc", paddingTop: "20px", marginTop: "20px"}}>
                    <div style={{display: "flex", alignItems: "center", marginBottom: "15px"}}>
                      <div style={{fontSize: "16px", fontWeight: "bold", color: "#000", marginRight: "10px"}}>PAYMENT ADVICE</div>
                      <div style={{fontSize: "20px", color: "#ccc"}}>✂️</div>
                </div>
                    
                    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
                      <div style={{flex: 1}}>
                        <div style={{fontSize: "12px", marginBottom: "4px", color: "#666"}}>To:</div>
                        <div style={{fontSize: "12px", color: "#333", lineHeight: "1.3", whiteSpace: "pre-line"}}>
                          {toDetails || "Client Name\nClient Address\nCity, State ZIP\nCountry"}
                        </div>
                      </div>
                      <div style={{flex: 1, textAlign: "right"}}>
                        <div style={{fontSize: "12px", color: "#333", whiteSpace: "pre-line"}}>
                          {extraNotes || "Note: The sender will write additional details here"}
                </div>
              </div>
            </div>
            
                    <div style={{marginBottom: "20px"}}>
                      <div style={{fontSize: "12px", marginBottom: "4px", color: "#666"}}>
                        Amount Enclosed: <span style={{fontWeight: "bold", color: "#000"}}>${total.toFixed(2)}</span>
                      </div>
                      <div style={{borderBottom: "1px solid #333", height: "20px", marginBottom: "4px"}}></div>
                      <div style={{fontSize: "10px", color: "#666"}}>Enter the amount you are paying above</div>
                    </div>
         
                    <div style={{fontSize: "10px", color: "#666", textAlign: "center"}}>
                      Registered Office: {fromDetails || "123 Progress Lane, Seattle, Washington, 98101, United States"}
          </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <h1 className="text-5xl font-bold gradient-text">Invoicemate</h1>
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

