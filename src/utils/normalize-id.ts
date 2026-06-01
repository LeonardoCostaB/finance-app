export function normalizeId(id: string): string {
   if (!id) {
      return '';
   }

   return id
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
}
