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
  const [showPreview, setShowPreview] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);

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
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
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
        <div style="margin: 0; background: #f6f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; padding: 28px;">
          <div style="max-width: 860px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <!-- Blue line at top -->
            <div style="height: 4px; background: #2563eb; width: 100%;"></div>
            <!-- Top header -->
            <div style="padding: 22px 28px; display: flex; align-items: center; justify-content: space-between;">
              <div style="font-size: 28px; font-weight: 700; color: #374151;">Tax ${invoiceType}</div>
              <div style="display: flex; align-items: center; gap: 12px;">
                ${
                  logo
                    ? `<img src="${logo}" style="width: 120px; height: 120px; object-fit: contain;" />`
                    : `<div style="width: 120px; height: 120px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 8px;"><span style="font-size: 14px; color: #9ca3af;">Logo</span></div>`
                }
              </div>
            </div>
            
            <!-- Parties -->
            <div style="padding: 0 28px 10px 28px; display: flex; gap: 24px;">
              <div style="flex: 1;">
                <div style="font-size: 11px; color: #9aa3b2; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px;">From</div>
                <div style="font-weight: 700;">${fromDetails.split("\n")[0] || "Your Company Name"}</div>
                <div style="font-size: 14px; color: #6b7280; line-height: 1.4; white-space: pre-line;">${fromDetails || "Your Company Name\nYour Company Address\nCity, State ZIP\nCountry"}</div>
              </div>
              
              <div style="flex: 1;">
                <div style="font-size: 11px; color: #9aa3b2; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px;">For</div>
                <div style="font-weight: 700;">${toDetails.split("\n")[0] || "Client Name"}</div>
                <div style="font-size: 14px; color: #6b7280; line-height: 1.4; white-space: pre-line;">${toDetails ? toDetails.split("\n").slice(1).join("\n") : "Client Address\nCity, State ZIP\nCountry"}</div>
              </div>
            </div>
            
            <!-- Horizontal line under parties -->
            <div style="height: 1px; background: #000; margin: 0 28px 18px 28px;"></div>
            
            <!-- Invoice meta -->
            <div style="padding: 6px 28px 18px 28px; display: grid; grid-template-columns: 180px 1fr; row-gap: 6px; max-width: 520px;">
              <div style="color: #6b7280;">Number</div><div style="font-weight: 600;">${invoiceNumber}</div>
              <div style="color: #6b7280;">Date</div><div>${new Date(invoiceDate).toLocaleDateString()}</div>
              <div style="color: #6b7280;">Terms</div><div>${terms}</div>
              <div style="color: #6b7280;">Due</div><div>${(() => {
                const invoiceDateObj = new Date(invoiceDate);
                const daysToAdd = terms === "Due On Receipt" ? 0 : terms === "Net 15" ? 15 : terms === "Net 30" ? 30 : 60;
                const dueDate = new Date(invoiceDateObj.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
                return dueDate.toLocaleDateString();
              })()}</div>
            </div>
            
            <!-- Table header -->
            <div style="margin: 8px 28px 0 28px; background: #2563eb; color: #fff; padding: 12px 28px; font-weight: 700; display: flex;">
              <div style="flex: 1;">Description</div>
              <div style="width: 140px; text-align: right;">Price</div>
              <div style="width: 100px; text-align: right;">Qty</div>
              <div style="width: 140px; text-align: right;">Amount</div>
            </div>
            
            <!-- Table rows -->
            <div style="padding: 0 36px;">
              ${items
                .map((item) => {
                  return `
                  <div style="display: flex; padding: 14px 0;">
                    <div style="flex: 1;">
                      <div style="font-weight: 700;">${item.name || ""}</div>
                    </div>
                    <div style="width: 140px; text-align: right;">$${item.price.toFixed(2)}</div>
                    <div style="width: 100px; text-align: right;">${item.quantity}</div>
                    <div style="width: 140px; text-align: right; font-weight: 600;">$${item.amount.toFixed(2)}</div>
                  </div>
                `;
                })
                .join("")}
            </div>
            
            <!-- Totals -->
            <div style="padding: 8px 36px 6px 36px;">
              <div style="height: 1px; background: #2563eb; margin-bottom: 8px;"></div>
              <div style="display: flex; justify-content: flex-end;">
                <div style="width: 420px;">
                  <div style="display: flex; padding: 4px 0; justify-content: flex-end;">
                    <div style="width: 280px; display: flex; justify-content: space-between;">
                      <div style="color: #6b7280;">Subtotal</div>
                      <div style="font-weight: 600;">$${subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                  ${
                    discount > 0
                      ? `<div style="display: flex; padding: 4px 0; justify-content: flex-end;">
                          <div style="width: 280px; display: flex; justify-content: space-between;">
                            <div style="color: #6b7280;">Discount</div>
                            <div style="font-weight: 600;">-$${discount.toFixed(2)}</div>
                          </div>
                        </div>`
                      : ""
                  }
                  ${
                    taxRate > 0
                      ? `<div style="display: flex; padding: 4px 0; justify-content: flex-end;">
                          <div style="width: 280px; display: flex; justify-content: space-between;">
                            <div style="color: #6b7280;">Tax (${taxRate}%)</div>
                            <div style="font-weight: 600;">$${taxAmount.toFixed(2)}</div>
                          </div>
                        </div>`
                      : ""
                  }
                </div>
              </div>
              <div style="height: 1px; background: #2563eb; margin: 8px 0;"></div>
              <div style="display: flex; justify-content: flex-end;">
                <div style="width: 420px;">
                  <div style="display: flex; padding: 4px 0; font-weight: 800; justify-content: flex-end;">
                    <div style="width: 280px; display: flex; justify-content: space-between;">
                      <div>Total</div>
                      <div>$${total.toFixed(2)}</div>
                    </div>
                  </div>
                  <div style="display: flex; padding: 4px 0; font-weight: 900; justify-content: flex-end;">
                    <div style="width: 280px; display: flex; justify-content: space-between;">
                      <div>Balance Due</div>
                      <div style="font-size: 18px;">$${total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Notes -->
            <div style="padding: 18px 28px 28px 28px;">
              <div style="height: 1px; background: #000; margin-bottom: 12px;"></div>
              <div style="font-weight: 700; margin-bottom: 6px;">Notes</div>
              <div style="color: #4b5563; font-size: 14px; line-height: 1.7;">
                ${extraNotes || "Thank you for your business!"}
              </div>
            </div>
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
                <div style={{margin: "0", background: "#f6f7fb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: "#1f2937", padding: "28px"}}>
                  <div style={{maxWidth: "860px", margin: "0 auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden"}}>
                    {/* Blue line at top */}
                    <div style={{height: "4px", background: "#2563eb", width: "100%"}}></div>
                    {/* Top header */}
                    <div style={{padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                      <div style={{fontSize: "28px", fontWeight: "700", color: "#374151"}}>Tax {invoiceType}</div>
                      <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                        {logo ? (
                          <img src={logo} alt="Company Logo" style={{width: "120px", height: "120px", objectFit: "contain"}} />
                        ) : (
                          <div style={{width: "120px", height: "120px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px"}}>
                            <span style={{fontSize: "14px", color: "#9ca3af"}}>Logo</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Parties */}
                    <div style={{padding: "0 28px 10px 28px", display: "flex", gap: "24px"}}>
                      <div style={{flex: 1}}>
                        <div style={{fontSize: "11px", color: "#9aa3b2", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "8px"}}>From</div>
                        <div style={{fontWeight: "700"}}>{fromDetails.split("\n")[0] || "Your Company Name"}</div>
                        <div style={{fontSize: "14px", color: "#6b7280", lineHeight: "1.4", whiteSpace: "pre-line"}}>
                          {fromDetails || "Your Company Name\nYour Company Address\nCity, State ZIP\nCountry"}
                        </div>
                      </div>
                      
                      <div style={{flex: 1}}>
                        <div style={{fontSize: "11px", color: "#9aa3b2", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "8px"}}>For</div>
                        <div style={{fontWeight: "700"}}>{toDetails.split("\n")[0] || "Client Name"}</div>
                        <div style={{fontSize: "14px", color: "#6b7280", lineHeight: "1.4", whiteSpace: "pre-line"}}>
                          {toDetails ? toDetails.split("\n").slice(1).join("\n") : "Client Address\nCity, State ZIP\nCountry"}
                        </div>
                      </div>
                    </div>
                    
                    {/* Horizontal line under parties */}
                    <div style={{height: "1px", background: "#000", margin: "0 28px 18px 28px"}}></div>
                    
                    {/* Invoice meta */}
                    <div style={{padding: "6px 28px 18px 28px", display: "grid", gridTemplateColumns: "180px 1fr", rowGap: "6px", maxWidth: "520px"}}>
                      <div style={{color: "#6b7280"}}>Number</div><div style={{fontWeight: "600"}}>{invoiceNumber}</div>
                      <div style={{color: "#6b7280"}}>Date</div><div>{new Date(invoiceDate).toLocaleDateString()}</div>
                      <div style={{color: "#6b7280"}}>Terms</div><div>{terms}</div>
                      <div style={{color: "#6b7280"}}>Due</div><div>{(() => {
                        const invoiceDateObj = new Date(invoiceDate);
                        const daysToAdd = terms === "Due On Receipt" ? 0 : terms === "Net 15" ? 15 : terms === "Net 30" ? 30 : 60;
                        const dueDate = new Date(invoiceDateObj.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
                        return dueDate.toLocaleDateString();
                      })()}</div>
                    </div>
                    
                    {/* Table header */}
                    <div style={{margin: "8px 28px 0 28px", background: "#2563eb", color: "#fff", padding: "12px 28px", fontWeight: "700", display: "flex"}}>
                      <div style={{flex: 1}}>Description</div>
                      <div style={{width: "140px", textAlign: "right"}}>Price</div>
                      <div style={{width: "100px", textAlign: "right"}}>Qty</div>
                      <div style={{width: "140px", textAlign: "right"}}>Amount</div>
                    </div>
                    
                    {/* Table rows */}
                    <div style={{padding: "0 36px"}}>
                      {items && items.length > 0 ? (
                        items.map((item) => (
                          <div key={item.id} style={{display: "flex", padding: "14px 0"}}>
                            <div style={{flex: 1}}>
                              <div style={{fontWeight: "700"}}>{item.name || ""}</div>
                            </div>
                            <div style={{width: "140px", textAlign: "right"}}>${item.price.toFixed(2)}</div>
                            <div style={{width: "100px", textAlign: "right"}}>{item.quantity}</div>
                            <div style={{width: "140px", textAlign: "right", fontWeight: "600"}}>${item.amount.toFixed(2)}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{padding: "32px", textAlign: "center", color: "#6b7280"}}>
                          No items added yet. Please add items in the form above.
                        </div>
                      )}
                    </div>
                    
                    {/* Totals */}
                    <div style={{padding: "8px 36px 6px 36px"}}>
                      <div style={{height: "1px", background: "#2563eb", marginBottom: "8px"}}></div>
                      <div style={{display: "flex", justifyContent: "flex-end"}}>
                        <div style={{width: "420px"}}>
                          <div style={{display: "flex", padding: "4px 0", justifyContent: "flex-end"}}>
                            <div style={{width: "280px", display: "flex", justifyContent: "space-between"}}>
                              <div style={{color: "#6b7280"}}>Subtotal</div>
                              <div style={{fontWeight: "600"}}>${subtotal.toFixed(2)}</div>
                            </div>
                          </div>
                          {discount > 0 && (
                            <div style={{display: "flex", padding: "4px 0", justifyContent: "flex-end"}}>
                              <div style={{width: "280px", display: "flex", justifyContent: "space-between"}}>
                                <div style={{color: "#6b7280"}}>Discount</div>
                                <div style={{fontWeight: "600"}}>-${discount.toFixed(2)}</div>
                              </div>
                            </div>
                          )}
                          {taxRate > 0 && (
                            <div style={{display: "flex", padding: "4px 0", justifyContent: "flex-end"}}>
                              <div style={{width: "280px", display: "flex", justifyContent: "space-between"}}>
                                <div style={{color: "#6b7280"}}>Tax ({taxRate}%)</div>
                                <div style={{fontWeight: "600"}}>${taxAmount.toFixed(2)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{height: "1px", background: "#2563eb", margin: "8px 0"}}></div>
                      <div style={{display: "flex", justifyContent: "flex-end"}}>
                        <div style={{width: "420px"}}>
                          <div style={{display: "flex", padding: "4px 0", fontWeight: "800", justifyContent: "flex-end"}}>
                            <div style={{width: "280px", display: "flex", justifyContent: "space-between"}}>
                              <div>Total</div>
                              <div>${total.toFixed(2)}</div>
                            </div>
                          </div>
                          <div style={{display: "flex", padding: "4px 0", fontWeight: "900", justifyContent: "flex-end"}}>
                            <div style={{width: "280px", display: "flex", justifyContent: "space-between"}}>
                              <div>Balance Due</div>
                              <div style={{fontSize: "18px"}}>${total.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    <div style={{padding: "18px 28px 28px 28px"}}>
                      <div style={{height: "1px", background: "#000", marginBottom: "12px"}}></div>
                      <div style={{fontWeight: "700", marginBottom: "6px"}}>Notes</div>
                      <div style={{color: "#4b5563", fontSize: "14px", lineHeight: "1.7"}}>
                        {extraNotes || "Thank you for your business!"}
                      </div>
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
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-full md:w-auto text-red-400 hover:text-red-300 p-3 md:p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center gap-2 md:gap-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="md:hidden">Remove Item</span>
                        </button>
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
              onTaxRateChange={setTaxRate}
              onDiscountChange={setDiscount}
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

