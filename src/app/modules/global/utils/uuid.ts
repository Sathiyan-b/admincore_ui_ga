import * as uuid from "uuid";
export class UUID {
  getUniqueID(): string {
    return uuid.v4();
  }
}
