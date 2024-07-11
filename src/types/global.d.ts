interface MonthExtract {
   id: string;
   name: string;
   value: number;
   date: {
      published: string;
      paidOut?: string;
   };
   link?: string;
   notes?: string;
}

interface Earnings {
   title: string;
   extract: Array<MonthExtract>
}

interface Expenses {
   title: string;
   extract: Array<MonthExtract>;
}

interface Months {
   id: string;
   title: string;
   createdAt: string;
   date: string;
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
