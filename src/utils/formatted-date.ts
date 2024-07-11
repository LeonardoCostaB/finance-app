
export function formattedDate(date: Date) {
   let day = String(date.getDate()).padStart(2, '0');
   let month = String(date.getMonth() + 1).padStart(2, '0');
   let year = date.getFullYear();

   return `${year}-${month}-${day}`;
}
