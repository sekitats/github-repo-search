"use client"

import { ERROR_MESSAGE } from "@/lib/github/types";

export default function Error() {
  return (
    <div>
      <h2>{ERROR_MESSAGE.SERVER_ERROR}</h2>
    </div>
  );
}