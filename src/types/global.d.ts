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
   expenses: Array<Expenses>;
   earnings: any;
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
