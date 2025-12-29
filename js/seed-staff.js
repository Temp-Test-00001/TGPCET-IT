import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const staffData = [
    { name: "Dr. Mukul Pande", designation: "Asst. Prof.", qualification: "M.Tech (WCC) Ph.D", joiningDate: "04-Apr-15", role: "Teaching" },
    { name: "Dr. Anup Gade", designation: "Asso. Prof.", qualification: "M.E. (CS) Ph.D (CSE)", joiningDate: "08-Jul-07", role: "Teaching" },
    { name: "Prof. Abhay Rewatkar", designation: "Asst. Prof.", qualification: "M.Tech (CS)", joiningDate: "13-Jul-13", role: "Teaching" },
    { name: "Prof. Jayesh Fating", designation: "Teaching Assistant", qualification: "B.E. (IT)", joiningDate: "15-Jan-24", role: "Teaching" },
    { name: "Prof. Swati Thengane", designation: "Teaching Assistant", qualification: "B.E. (CSE)", joiningDate: "06-Feb-24", role: "Teaching" },
    { name: "Prof. Nilesh Nagrale", designation: "Asst. Prof.", qualification: "M.Tech (EEE), Ph.D *", joiningDate: "05-Jun-24", role: "Teaching" },
    { name: "Prof. Sushil Bhise", designation: "Asst. Prof.", qualification: "B.E.M.Tech (AIML)", joiningDate: "06-Jul-20", role: "Teaching" },
    { name: "Prof. Anita Yadav", designation: "Asst. Prof.", qualification: "M.Tech (CSE) 2015", joiningDate: "26-Jun-24", role: "Teaching" },
    { name: "Prof. Sayara Bano Sheikh", designation: "Asst. Prof.", qualification: "M.E (WCC )", joiningDate: "18-Dec-23", role: "Teaching" },
    { name: "Prof.Ruchita Tajne", designation: "Asst.Prof.", qualification: "B.E(IT),,M.Tech(Computer Science)", joiningDate: "02-Jun-25", role: "Teaching" },
    { name: "Prof. T. P. Raju", designation: "Asst. Prof.", qualification: "M.Tech CSE, MCA Ph.D*", joiningDate: "01-Aug-13", role: "Teaching" },
    { name: "Prof. Ashwini Mahajan", designation: "Asst. Prof.", qualification: "M.Tech (CS)", joiningDate: "25-Jul-23", role: "Teaching" },
    { name: "Prof. Shweta Hedaoo", designation: "Asst. Prof.", qualification: "B.E. (CSE), M.Tech (CSE)", joiningDate: "03-Jul-25", role: "Teaching" }
];

export async function seedStaff(confirmAction = true) {
    if (confirmAction && !confirm("This will clear existing staff and add the default list. Continue?")) return;

    try {
        // Clear existing
        const snapshot = await getDocs(collection(db, "staff"));
        const deletePromises = [];
        snapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);

        // Add new
        const addPromises = staffData.map(staff => addDoc(collection(db, "staff"), staff));
        await Promise.all(addPromises);

        if (confirmAction) alert("Staff seeded successfully!");
        window.location.reload();
    } catch (err) {
        console.error(err);
        if (confirmAction) alert("Error seeding staff: " + err.message);
    }
}

// Expose to window for manual run
window.seedStaff = seedStaff;
