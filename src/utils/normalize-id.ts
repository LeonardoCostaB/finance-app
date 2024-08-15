export function normalizeId(id: string): string {
   return id
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
}
