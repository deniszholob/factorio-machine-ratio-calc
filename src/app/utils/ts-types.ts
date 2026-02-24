import { FormControl } from '@angular/forms';

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/** Makes one or more keys required in a type */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type EnumId = string | number;

export interface ObjectInfo<T extends EnumId = string> {
  id: T;
  display: string;
}

export interface Link<T extends EnumId = string> extends ObjectInfo<T> {
  url: string;
}

export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type SemanticVersion = `${string}.${string}.${string}`;

export type FormGroupShape<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

export interface Section<ContentType, SectionType extends EnumId = string>
  extends ObjectInfo<SectionType> {
  content: ContentType;
}
