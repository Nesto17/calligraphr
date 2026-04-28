export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  width: number;
}

export type CharacterData = Map<string, Stroke[]>;
