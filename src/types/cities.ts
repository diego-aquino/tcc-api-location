export interface Country {
  name?: string;
  code?: string;
}

export interface State {
  name?: string;
  code?: string;
}

export interface City {
  id: string;
  name?: string;
  state: State;
  country: Country;
}
