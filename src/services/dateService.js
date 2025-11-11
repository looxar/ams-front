export default {
  formatDateToThai(date) {
    if (!date) return "";
    const thaiDate = new Date(date);
    const thaiYear = thaiDate.getFullYear() + 543;

    // Format the date in Thai
    return thaiDate
      .toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace(thaiDate.getFullYear(), thaiYear); // Replace the Western year with B.E. year
  },
};
