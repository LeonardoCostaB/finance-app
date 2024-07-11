interface Earnings {
   title: string;
   extract: Array<{
      id: string;
      name: string;
      value: number;
      date: {
         published: string;
      };
      link?: string;
      notes?: string;
   }>
}

interface Expenses {
   title: string;
   extract: Array<{
      id: string;
      name: string;
      value: number;
      date: {
         published: string;
         paidOut?: string;
      };
      link?: string;
      notes?: string;
   }>;
}

interface Months {
   id: string;
   title: string;
   createdAt: string;
   user?: {
      id
   }
   expenses: Array<Expenses>;
   earnings: Array<Earnings>;
}

interface User {
   id: string;
   email: string;
   name: string;
   economy: number;
   avatar: {
      id: string;
      url: string;
   };
   months: Array<Months>
}
