const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Order = require('../models/order'); // Ensure correct model path
const Package = require('../models/detailPackage');  // Adjust path if needed
const mongoose = require('mongoose');
exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order by orderId
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Debugging - Log package structure to verify its fields
    console.log("Package Data:", JSON.stringify(order.orderDetails.package, null, 2));

    // Determine package price (Check both possible price locations)
    let packagePrice = 0;
    if (order.orderDetails.package) {
      packagePrice = order.orderDetails.package.price || (order.orderDetails.package.detailPackage ? order.orderDetails.package.detailPackage.price : 0);
    }

    // Ensure packagePrice is a number (Avoid undefined errors)
    packagePrice = Number(packagePrice) || 0;

    // Calculate add-on total price
    const addOnsTotal = order.orderDetails.addOns?.reduce((sum, addOns) => sum + (Number(addOns.price) || 0), 0) || 0;

    // Calculate total price
    const totalPrice = (packagePrice + addOnsTotal).toFixed(2);

    // Create a new PDF document
    const doc = new PDFDocument();
    const invoiceDir = path.join(__dirname, '../invoices');
    
    // Ensure the invoices folder exists
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const invoicePath = path.join(invoiceDir, `invoice-${orderId}.pdf`);
    const writeStream = fs.createWriteStream(invoicePath);
    doc.pipe(writeStream);

    // Add invoice details (Header)
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Order ID: ${order.orderId}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Customer Info
    doc.fontSize(14).text('Customer Details:', { underline: true });
    doc.moveDown();

    // Create a grid for Customer Information
    doc.fontSize(12).text(`Name: ${order.orderDetails.customer.firstname} ${order.orderDetails.customer.lastname}`, { width: 250 });
    doc.text(`Email: ${order.orderDetails.customer.email}`, { width: 250 });
    doc.text(`Phone: ${order.orderDetails.customer.phone}`, { width: 250 });
    doc.text(`Address: ${order.orderDetails.customer.address}`, { width: 250 });

    doc.moveDown();

    // Package Info (Grid with labels)
    doc.fontSize(14).text('Package Details:', { underline: true });
    doc.moveDown();

    // Use grid for package info
    doc.fontSize(12).text(`Package:`, { continued: true }).text(`${order.orderDetails.package.name}`, { align: 'right' });
    doc.fontSize(12).text(`Price:`, { continued: true }).text(`$${packagePrice.toFixed(2)}`, { align: 'right' });

    doc.moveDown();

    // Add-On Info
    if (order.orderDetails.addOns?.length > 0) {
      doc.fontSize(14).text('Add-ons:', { underline: true });
      doc.moveDown();

      // Create grid for add-ons
      order.orderDetails.addOns.forEach((addOns, index) => {
        doc.fontSize(12).text(`${index + 1}. ${addOns.name}:`, { continued: true })
          .text(`$${(Number(addOns.price) || 0).toFixed(2)}`, { align: 'right' });
      });

      doc.moveDown();
    }

    // Total Price Section (Large Text & Bold)
    doc.fontSize(16).text(`Total Price:`, { continued: true });
    doc.fontSize(16).text(`$${totalPrice}`, { align: 'right', bold: true });

    // Add border to the bottom for a nice finish
    doc.rect(50, doc.y + 10, 500, 1).stroke();

    // Finalize the PDF
    doc.end();

    writeStream.on('finish', async () => {
      // Save the invoice path to the order
      order.invoicePath = invoicePath;
      await order.save();

      res.status(200).json({ message: 'Invoice generated successfully', invoicePath });
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.getInvoice = async (req, res) => {
    try {
      const { orderId } = req.params;
  
      // Find the order by orderId
      const order = await Order.findOne({ orderId });
  
      if (!order || !order.invoicePath) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
  
      // Check if the invoice file exists
      if (!fs.existsSync(order.invoicePath)) {
        return res.status(404).json({ message: 'Invoice file not found' });
      }
  
      res.download(order.invoicePath, `invoice-${orderId}.pdf`);
    } catch (error) {
      console.error('Error retrieving invoice:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  
  exports.createInvoice = async (req, res) => {
    try {
      const { orderId } = req.params;

      // Find the order by orderId
      const order = await Order.findOne({ orderId });
;

      let doc = new PDFDocument({ size: "A4", margin: 50 });

      let packagePrice = 0;
      let packageName = '';
    if (order.orderDetails.package) {
      packageId = order.orderDetails.package.detailPackage.description;
      const packageDetail = await Package.findOne({ _id: new mongoose.Types.ObjectId(packageId) });
      packagePrice = (packageDetail ? packageDetail.totalPrice : 0);
      packageName = (packageDetail ? packageDetail.name : '');
    }

    // Ensure packagePrice is a number (Avoid undefined errors)
    packagePrice = Number(packagePrice) || 0;

    // Calculate add-on total price
    const addOnsTotal = order.orderDetails.addOns?.reduce((sum, addOns) => sum + (Number(addOns.price) || 0), 0) || 0;

    // Calculate total price
    const totalPrice = (packagePrice + addOnsTotal).toFixed(2);

      generateHeader(doc);
      generateCustomerInformation(doc, order,totalPrice);
      generateInvoiceTable(doc, order,totalPrice,packagePrice, packageName);
      generateFooter(doc);

      // Create a new PDF document
    
      const invoiceDir = path.join(__dirname, '../invoices');
      
      // Ensure the invoices folder exists
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

    const invoicePath = path.join(invoiceDir, `invoice-${orderId}.pdf`);
    const writeStream = fs.createWriteStream(invoicePath);
    doc.pipe(writeStream);
    
      doc.end();
  
      writeStream.on('finish', async () => {
        // Save the invoice path to the order
        const updatedOrder = await Order.findOneAndUpdate(
          { orderId },
          { invoicePath }, // Only update invoicePath field
          { new: true } // Return the updated document
        );

        if (updatedOrder) {
          //console.log("Invoice path updated successfully:", updatedOrder);
        } else {
          console.log("Order not found");
        }
  
        // res.status(200).json({ message: 'Invoice generated successfully', invoicePath });

         // Check if the invoice file exists
      fs.access(invoicePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not accessible yet:', err);
      return res.status(404).json({ message: 'Invoice file not accessible yet' });
    }

    res.download(invoicePath, `invoice-${orderId}.pdf`, (err) => {
      if (err) {
        console.error('Download failed:', err);
        res.status(500).json({ message: 'Download failed' });
      }
    });
  });
});
  
    } catch (error) {
      console.error('Error generating invoice:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  function generateHeader(doc) {
    doc
      .image("logo.png", 50, 45, { width: 150 })
      .fillColor("#444444")
      .fontSize(20)
      //.text("3Clean Sidney", 110, 57)
      .fontSize(10)
      .text("ACME Inc.", 200, 50, { align: "right" })
      .text("123 Main Street", 200, 65, { align: "right" })
      .text("New York, NY, 10025", 200, 80, { align: "right" })
      .moveDown();
  }

  function generateCustomerInformation(doc, order, totalPrice) {
    // Determine package price (Check both possible price locations)
    
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Invoice", 50, 160);
  
    generateHr(doc, 185);
  
    const customerInformationTop = 200;
  
    doc
      .fontSize(10)
      .text("Invoice Number:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(order.orderId, 150, customerInformationTop)
      .font("Helvetica")
      .text("Invoice Date:", 50, customerInformationTop + 15)
      .text(formatDate(new Date()), 150, customerInformationTop + 15)
      .text("Balance Due:", 50, customerInformationTop + 30)
      .text(
        formatCurrency(totalPrice),
        150,
        customerInformationTop + 30
      )
  
      .font("Helvetica-Bold")
      .text(order.orderDetails.customer.firstname+' '+order.orderDetails.customer.lastname, 400, customerInformationTop)
      .font("Helvetica")
      .text(order.orderDetails.customer.email, 400, customerInformationTop + 15)
      .text(order.orderDetails.customer.phone, 400, customerInformationTop + 30)
      .text(order.orderDetails.customer.address, 400, customerInformationTop + 45)
      .moveDown();
  
    generateHr(doc, 300);
  }


function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

function formatCurrency(cents) {
  return "$" + (cents);
}

function generateInvoiceTable(doc, order, totalPrice, packagePrice,packageName) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Services",
    "Description",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

    const position = invoiceTableTop + (0 + 1) * 30;
    generateTableRow(
      doc,
      position,
      order.orderDetails.package.name,
      packageName,
      formatCurrency(packagePrice)
    );

    generateHr(doc, position + 20);

    for (i = 0; i < order.orderDetails.addOns.length; i++) {
      const posi = position + (i + 1) * 30;
      const item = order.orderDetails.addOns[i];
      generateTableRow(
        doc,
        posi,
        "Add-Ons",
        item.name,
        formatCurrency(item.price)
      );
  
      generateHr(doc, posi + 20);
    }


  const subtotalPosition = position + (i + 1) * 30;
  const taxPrice = (10/100)*totalPrice;
  generateTableRow(
    doc,
    subtotalPosition,
    "Tax(10%)",
    "",
    formatCurrency(taxPrice)
  );
  const finalPrice = Number(taxPrice)+Number(totalPrice);
  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "Total Price",
    "",
    formatCurrency(finalPrice)
  );

  // const duePosition = paidToDatePosition + 25;
  // doc.font("Helvetica-Bold");
  // generateTableRow(
  //   doc,
  //   duePosition,
  //   "",
  //   "",
  //   "Balance Due",
  //   "",
  //   formatCurrency(invoice.subtotal - invoice.paid)
  // );
  doc.font("Helvetica");
}

function generateTableRow(
  doc,
  y,
  service,
  package,
  price,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(service, 50, y)
    .text(package, 250, y)
    .text(price, 430, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 24 hours. Thank you for your business.",
      50,
      780,
      { align: "center", width: 500 }
    );
}