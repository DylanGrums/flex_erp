export type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | { [key: string]: boolean | null | undefined }
  | ClassValue[];

function appendClass(output: string[], input: ClassValue): void {
  if (!input) return;
  if (typeof input === 'string' || typeof input === 'number') {
    output.push(String(input));
    return;
  }
  if (Array.isArray(input)) {
    input.forEach((value) => appendClass(output, value));
    return;
  }
  if (typeof input === 'object') {
    Object.entries(input).forEach(([key, value]) => {
      if (value) output.push(key);
    });
  }
}

export function cn(...inputs: ClassValue[]): string {
  const output: string[] = [];
  inputs.forEach((input) => appendClass(output, input));
  return output.join(' ');
}
