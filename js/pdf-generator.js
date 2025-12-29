
// Initialize Namespace
window.PDFGenerator = window.PDFGenerator || {};

// Helper to get jsPDF
const getJsPDF = () => {
    if (window.jspdf && window.jspdf.jsPDF) {
        return new window.jspdf.jsPDF();
    }
    if (window.jsPDF) {
        return new window.jsPDF();
    }
    throw new Error("jsPDF library not loaded");
};

// Helper to load image as Data URL with optional opacity
const loadImage = (url, opacity = 1.0) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
    });
};

// Helper to format date DD/MM/YYYY
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

window.PDFGenerator.generateApplicationPDF = async (user, event, application) => {
    try {
        const doc = getJsPDF();
        const profile = user.profile || {};

        // Load Watermark (Faded)
        try {
            const watermarkData = await loadImage('../../Images/watermark.png', 0.1);
            // Add watermark to center of page (A4 is 210x297)
            doc.addImage(watermarkData, 'PNG', 55, 100, 100, 100, undefined, 'FAST');
        } catch (e) {
            console.warn("Could not load watermark", e);
        }

        // Header
        doc.setFillColor(240, 249, 255);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185);
        doc.text("TGPCET IT Department", 105, 20, null, null, "center");

        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text("Event Application Form", 105, 30, null, null, "center");

        // Status Handling
        if (application.status === 'pending') {
            doc.setTextColor(200);
            doc.setFontSize(40);
            doc.text("UNDER SCRUTINY", 105, 150, 45, null, "center");
        } else if (application.status === 'rejected') {
            try {
                const rejectStampData = await loadImage('../../Images/rejectstamp.png');
                doc.addImage(rejectStampData, 'PNG', 140, 200, 40, 40);

                doc.setFontSize(8);
                doc.setTextColor(220, 38, 38); // Red

                const rejecterName = application.approverName || 'Admin';
                const rejecterRole = application.approverRole || 'Admin';
                doc.text(`Rejected By : ${rejecterName} (${rejecterRole})`, 160, 245, null, null, "center");

                const rejectedDate = formatDate(application.processedAt || new Date().toISOString());
                doc.text(`date : ${rejectedDate}`, 160, 250, null, null, "center");

            } catch (e) {
                console.warn("Could not load reject stamp", e);
                doc.setTextColor(220, 38, 38);
                doc.setFontSize(40);
                doc.text("REJECTED", 105, 150, 45, null, "center");
            }
        }

        // Application Info
        doc.setFontSize(10);
        doc.setTextColor(100);
        const appNumText = `Application No: ${application.applicationNumber}`;
        const appNumWidth = doc.getTextWidth(appNumText);
        doc.text(appNumText, 190 - appNumWidth, 50);

        doc.text(`Applied On: ${new Date(application.appliedAt).toLocaleDateString()}`, 190 - doc.getTextWidth(`Applied On: ${new Date(application.appliedAt).toLocaleDateString()}`), 55);

        // Event Details Section
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Event Details", 20, 65);
        doc.setLineWidth(0.5);
        doc.line(20, 68, 190, 68);

        doc.setFontSize(10);
        doc.text(`Event Name:`, 20, 78);
        doc.text(event.title, 60, 78);

        doc.text(`Date:`, 20, 88);
        doc.text(event.date, 60, 88);

        doc.text(`Venue:`, 20, 98);
        doc.text(event.venue, 60, 98);

        // Applicant Details Section
        doc.setFontSize(12);
        doc.text("Applicant Details", 20, 115);
        doc.line(20, 118, 190, 118);

        doc.setFontSize(10);

        doc.text(`Full Name:`, 20, 128);
        doc.text(profile.fullName || user.email, 60, 128);

        doc.text(`Email:`, 20, 138);
        doc.text(user.email, 60, 138);

        doc.text(`Mobile:`, 20, 148);
        doc.text(profile.mobile || 'N/A', 60, 148);

        doc.text(`PRN:`, 20, 158);
        doc.text(profile.prn || 'N/A', 60, 158);

        doc.text(`Class:`, 20, 168);
        doc.text(`${profile.year || 'N/A'} Year - Section ${profile.section || 'N/A'}`, 60, 168);

        doc.text(`Address:`, 20, 178);
        const addressLines = doc.splitTextToSize(profile.address || 'N/A', 130);
        doc.text(addressLines, 60, 178);

        // Payment Details
        let yPos = 178 + (addressLines.length * 5) + 10;

        doc.setFontSize(12);
        doc.text("Payment Information", 20, yPos);
        doc.line(20, yPos + 3, 190, yPos + 3);

        doc.setFontSize(10);
        yPos += 13;
        doc.text(`Fee Amount:`, 20, yPos);
        doc.text(`Rs. ${application.fee || 0}`, 60, yPos);

        yPos += 10;
        doc.text(`Transaction ID:`, 20, yPos);
        doc.text(application.transactionId || 'N/A', 60, yPos);

        // Team Members
        if (application.teamMembers && application.teamMembers.length > 0) {
            yPos += 20;

            if (yPos > 250) {
                doc.addPage();
                try {
                    const watermarkData = await loadImage('../../Images/watermark.png', 0.1);
                    doc.addImage(watermarkData, 'PNG', 55, 100, 100, 100, undefined, 'FAST');
                } catch (e) { }
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.text("Team Members", 20, yPos);
            doc.line(20, yPos + 3, 190, yPos + 3);

            doc.setFontSize(10);
            yPos += 13;

            doc.setFont(undefined, 'bold');
            doc.text("Name", 20, yPos);
            doc.text("Email", 70, yPos);
            doc.text("Mobile", 130, yPos);
            doc.text("PRN", 170, yPos);
            doc.setFont(undefined, 'normal');

            yPos += 8;

            for (const [index, member] of application.teamMembers.entries()) {
                if (yPos > 280) {
                    doc.addPage();
                    try {
                        const watermarkData = await loadImage('../../Images/watermark.png', 0.1);
                        doc.addImage(watermarkData, 'PNG', 55, 100, 100, 100, undefined, 'FAST');
                    } catch (e) { }
                    yPos = 20;
                    doc.setFont(undefined, 'bold');
                    doc.text("Name", 20, yPos);
                    doc.text("Email", 70, yPos);
                    doc.text("Mobile", 130, yPos);
                    doc.text("PRN", 170, yPos);
                    doc.setFont(undefined, 'normal');
                    yPos += 8;
                }

                doc.text(`${index + 1}. ${member.name}`, 20, yPos);

                let email = member.email;
                if (doc.getTextWidth(email) > 55) {
                    email = email.substring(0, 20) + '...';
                }
                doc.text(email, 70, yPos);

                doc.text(member.mobile || '-', 130, yPos);
                doc.text(member.prn || '-', 170, yPos);

                yPos += 8;
            }
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 285);
        doc.text("This is a computer generated document.", 105, 290, null, null, "center");

        doc.save(`Application_${application.applicationNumber || 'Draft'}.pdf`);
    } catch (err) {
        console.error("PDF Generation Error:", err);
        alert("Failed to generate PDF. Please ensure the page is fully loaded.");
    }
};

window.PDFGenerator.generateStampedPDF = async (user, event, application) => {
    try {
        const doc = getJsPDF();
        const profile = user.profile || {};

        // Load Watermark
        try {
            const watermarkData = await loadImage('../../Images/watermark.png', 0.1);
            doc.addImage(watermarkData, 'PNG', 55, 100, 100, 100, undefined, 'FAST');
        } catch (e) {
            console.warn("Could not load watermark", e);
        }

        // Header with Green Theme
        doc.setFillColor(240, 253, 244);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFontSize(22);
        doc.setTextColor(22, 163, 74);
        doc.text("TGPCET IT Department", 105, 20, null, null, "center");

        doc.setFontSize(16);
        doc.setTextColor(21, 128, 61);
        doc.text("OFFICIAL ADMIT CARD", 105, 30, null, null, "center");

        // Event Details Box
        doc.setDrawColor(22, 163, 74);
        doc.setLineWidth(0.5);
        doc.rect(20, 50, 170, 40);

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(event.title, 105, 60, null, null, "center");

        doc.setFontSize(10);
        doc.text(`Date: ${event.date} | Venue: ${event.venue}`, 105, 70, null, null, "center");
        doc.text(`Application No: ${application.applicationNumber}`, 105, 80, null, null, "center");

        // Applicant Details
        doc.setFontSize(12);
        doc.text("Candidate Details", 20, 105);
        doc.line(20, 108, 190, 108);

        doc.setFontSize(10);

        // Left Column
        doc.text(`Name:`, 20, 118);
        doc.text(profile.fullName || user.email, 40, 118);

        doc.text(`Email:`, 20, 128);
        doc.text(user.email, 40, 128);

        doc.text(`Mobile:`, 20, 138);
        doc.text(profile.mobile || 'N/A', 40, 138);

        // Right Column
        doc.text(`PRN:`, 110, 118);
        doc.text(profile.prn || 'N/A', 130, 118);

        doc.text(`Class:`, 110, 128);
        doc.text(`${profile.year || 'N/A'} - ${profile.section || 'N/A'}`, 130, 128);

        // Team Members
        let yPos = 158;
        if (application.teamMembers && application.teamMembers.length > 0) {
            doc.setFontSize(12);
            doc.text("Team Members", 20, 148);
            doc.line(20, 151, 190, 151);

            doc.setFontSize(10);

            doc.setFont(undefined, 'bold');
            doc.text("Name", 20, yPos);
            doc.text("Email", 70, yPos);
            doc.text("Mobile", 130, yPos);
            doc.text("PRN", 170, yPos);
            doc.setFont(undefined, 'normal');

            yPos += 8;

            for (const [index, member] of application.teamMembers.entries()) {
                if (yPos > 250) {
                    doc.addPage();
                    try {
                        const watermarkData = await loadImage('../../Images/watermark.png', 0.1);
                        doc.addImage(watermarkData, 'PNG', 55, 100, 100, 100, undefined, 'FAST');
                    } catch (e) { }
                    yPos = 20;
                    doc.setFont(undefined, 'bold');
                    doc.text("Name", 20, yPos);
                    doc.text("Email", 70, yPos);
                    doc.text("Mobile", 130, yPos);
                    doc.text("PRN", 170, yPos);
                    doc.setFont(undefined, 'normal');
                    yPos += 8;
                }

                doc.text(`${index + 1}. ${member.name}`, 20, yPos);

                let email = member.email;
                if (doc.getTextWidth(email) > 55) {
                    email = email.substring(0, 20) + '...';
                }
                doc.text(email, 70, yPos);

                doc.text(member.mobile || '-', 130, yPos);
                doc.text(member.prn || '-', 170, yPos);

                yPos += 8;
            }
        }

        // Approval Stamp Image
        try {
            const imgData = await loadImage('../../Images/approvedstamp.png');
            doc.addImage(imgData, 'PNG', 140, 200, 40, 40);

            doc.setFontSize(8);
            doc.setTextColor(22, 163, 74);

            const approverName = application.approverName || 'Admin';
            const approverRole = application.approverRole || 'Admin';
            doc.text(`Approved By : ${approverName} (${approverRole})`, 160, 245, null, null, "center");

            const approvedDate = formatDate(application.processedAt || application.approvedAt || new Date().toISOString());
            doc.text(`date : ${approvedDate}`, 160, 250, null, null, "center");

        } catch (e) {
            console.warn("Could not load stamp image", e);
            doc.setDrawColor(22, 163, 74);
            doc.setLineWidth(2);
            doc.circle(160, 220, 25);
            doc.setFontSize(12);
            doc.setTextColor(22, 163, 74);
            doc.text("APPROVED", 160, 220, null, null, "center");
        }

        // Instructions
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text("Instructions:", 20, 250);
        doc.setFontSize(8);
        doc.text("1. Please carry this admit card to the event venue.", 20, 258);
        doc.text("2. Report 15 minutes before the scheduled time.", 20, 263);
        doc.text("3. Valid College ID card is mandatory.", 20, 268);

        doc.save(`AdmitCard_${application.applicationNumber}.pdf`);
    } catch (err) {
        console.error("PDF Generation Error:", err);
        alert("Failed to generate PDF. Please ensure the page is fully loaded.");
    }
};
