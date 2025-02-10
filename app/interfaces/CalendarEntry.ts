export interface CalendarEntry {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}

export interface Person {
  id: number;
}

export interface Room {
  raum?: string;
  id?: number;
  dummy: number;
  details: boolean;
}

export interface CalendarEntry {
  semester: string;
  title: string;
  gruppe: string;
  type: string;
  datum: string;
  von: string;
  bis: string;
  raum: Room;
  kbid?: number;
  bid?: number;
  personen: Person[];
  uuid: string;
  onlysemesterplan: boolean;
  highlight?: string;
  actions?: Array<{
    style: string;
    data: {
      link: string;
      revokeable: boolean;
    };
    component: string;
    text: string;
    disabled: boolean;
    hints: any[];
  }>;
}

export interface CalendarResponse {
  ical: string;
  pdf: string;
  termine: {
    [date: string]: CalendarEntry[];
  };
  todos: Record<string, unknown>;
}